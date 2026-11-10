// Testes estáticos do site (sem dependências): node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');

const attrs = (re) => [...html.matchAll(re)].map((m) => m[1]);
const ids = new Set(attrs(/\sid="([^"]+)"/g));

test('documento HTML5 válido com idioma e metadados essenciais', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<meta charset="UTF-8">/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{50,}"/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'deve haver exatamente um <h1>');
});

test('não restou código PHP nem referências a includes', () => {
  assert.ok(!/<\?(php|=)/.test(html));
  assert.ok(!/includes\//.test(html));
  assert.ok(!fs.existsSync(path.join(root, 'index.php')));
});

test('todos os links locais (href/src) apontam para arquivos existentes', () => {
  const refs = [...attrs(/\s(?:href|src)="([^"#][^"]*)"/g)].filter(
    (u) => !/^(https?:|mailto:|data:)/.test(u)
  );
  assert.ok(refs.length >= 3);
  for (const ref of refs) {
    const file = path.join(root, decodeURIComponent(ref.split('?')[0]));
    assert.ok(fs.existsSync(file), `arquivo ausente: ${ref}`);
  }
});

test('todas as âncoras internas (#id) têm destino', () => {
  const anchors = attrs(/href="#([^"]+)"/g);
  assert.ok(anchors.length > 0);
  for (const a of anchors) assert.ok(ids.has(a), `âncora sem destino: #${a}`);
});

test('ids são únicos', () => {
  const all = attrs(/\sid="([^"]+)"/g);
  assert.equal(all.length, new Set(all).size);
});

test('links externos com target=_blank usam rel="noopener noreferrer"', () => {
  for (const tag of html.match(/<a\s[^>]*target="_blank"[^>]*>/g) || []) {
    assert.match(tag, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/, tag);
  }
});

test('sem JavaScript inline, handlers on* ou javascript: URLs', () => {
  assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html), 'script inline encontrado');
  assert.ok(!/\son[a-z]+\s*=/i.test(html), 'handler on* encontrado');
  assert.ok(!/javascript:/i.test(html));
});

test('CSP restritiva presente e sem unsafe-inline/unsafe-eval em script-src', () => {
  const m = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert.ok(m, 'meta CSP ausente');
  const csp = m[1];
  assert.match(csp, /default-src 'none'/);
  const script = csp.match(/script-src ([^;]+)/)[1];
  assert.ok(!/unsafe-/.test(script), script);
  assert.match(csp, /base-uri 'none'/);
});

test('recursos externos limitados às origens permitidas na CSP', () => {
  const allowed = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|calendar\.google\.com|outlook\.live\.com|dicst\.github\.io)\b/;
  const urls = [...html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const u of urls) assert.match(u, allowed, `origem inesperada: ${u}`);
  assert.ok(!/http:\/\//.test(html.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"|xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, '')), 'link http (não seguro)');
});

test('CSS sem @import nem url() para origens externas', () => {
  assert.ok(!/@import/.test(css));
  assert.ok(!/url\(\s*['"]?https?:/.test(css));
});

test('PDF existe, é um PDF válido e não contém JavaScript embutido', () => {
  const pdf = path.join(root, 'assets/docs/ppp-ppgcst-reuniao-abertura-21052026.pdf');
  const buf = fs.readFileSync(pdf);
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
  const txt = buf.toString('latin1');
  for (const k of ['/JavaScript', '/JS ', '/Launch', '/OpenAction', '/EmbeddedFile']) {
    assert.ok(!txt.includes(k), `PDF contém ${k}`);
  }
});

test('imagens/ícones têm alternativa de texto ou são decorativos (aria-hidden)', () => {
  for (const tag of html.match(/<img\s[^>]*>/g) || []) assert.match(tag, /\salt=/);
});

test('o repositório não contém arquivos sensíveis ou de backup', () => {
  const bad = /(\.bak|\.env|\.sql|\.log|\.pem|\.key|\.php)$/i;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (['.git', 'node_modules', '.agent'].includes(e.name)) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const offenders = walk(root).filter((f) => bad.test(f) && !f.includes(`${path.sep}deploy${path.sep}`));
  assert.deepEqual(offenders, []);
});

test('nenhum segredo óbvio (chaves/tokens) nos arquivos de texto', () => {
  const files = ['index.html', 'assets/css/style.css', 'assets/js/main.js', 'README.md'];
  const re = /(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|api[_-]?key\s*[:=]\s*['"][^'"]{8,})/i;
  for (const f of files) assert.ok(!re.test(fs.readFileSync(path.join(root, f), 'utf8')), f);
});
