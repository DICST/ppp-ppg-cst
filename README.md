# PPP · PPG-CST

**Construção Participativa do Projeto Político-Pedagógico do Programa de Pós-Graduação em Ciência do Sistema Terrestre (PPG-CST) — INPE.**

[![Deploy GitHub Pages](https://github.com/DICST/ppp-ppt-cst/actions/workflows/pages.yml/badge.svg)](https://github.com/DICST/ppp-ppt-cst/actions/workflows/pages.yml)
![Site estático](https://img.shields.io/badge/site-est%C3%A1tico-2196d8)
![Zero dependências](https://img.shields.io/badge/runtime-zero%20depend%C3%AAncias-1eb280)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-d99a25)](LICENSE)

🌐 **Site:** <https://dicst.github.io/ppp-ppt-cst/>

---

## Sobre

Landing page institucional que apresenta à comunidade do PPG-CST o processo de construção coletiva do seu Projeto Político-Pedagógico: por que agora, metodologia (marcos conceitual, situacional e operacional), etapas, o grupo condutor (GEAR), produtos esperados, formas de participação, próximo evento e contato.

## Tecnologias

| Camada | Escolha |
| --- | --- |
| Marcação | HTML5 semântico (`index.html`, arquivo único) |
| Estilo | CSS puro, responsivo (mobile-first) — `assets/css/style.css` |
| Comportamento | JavaScript puro, sem frameworks — `assets/js/main.js` |
| Fontes | Google Fonts (Fraunces e Jost) |
| Hospedagem | GitHub Pages, publicado via GitHub Actions |
| Testes | `node:test` (nativo do Node.js, sem dependências) |

Não há *build*, *bundler* nem dependências de execução.

## Estrutura

```
ppp-ppg-cst/
├── index.html              # Página única (ponto de entrada)
├── assets/
│   ├── css/style.css       # Estilos
│   ├── js/main.js          # Animações de revelação e destaque do menu
│   └── docs/               # PDFs para download
├── tests/site.test.js      # Testes automatizados de integridade e segurança
├── deploy/apache.htaccess  # Opcional: hardening para hospedagem em Apache
├── .github/workflows/      # CI + deploy no GitHub Pages
├── package.json
└── LICENSE
```

## Executar localmente

Requer apenas um servidor de arquivos estáticos. Com Node.js ≥ 18:

```bash
npm run serve
```

Acesse <http://localhost:8080>. Alternativas: `python -m http.server 8080` ou Laragon/XAMPP apontando para a pasta.

## Testes

```bash
npm test
```

A suíte verifica, entre outros pontos:

- HTML válido: `lang`, `<title>`, *description*, um único `<h1>`, `id`s únicos;
- links locais e âncoras internas sem quebra;
- ausência de JavaScript inline, handlers `on*` e URLs `javascript:`;
- CSP presente e sem `unsafe-inline`/`unsafe-eval` em `script-src`;
- links externos com `rel="noopener noreferrer"` e restritos a origens conhecidas;
- PDF válido e sem JavaScript/ações automáticas embutidos;
- ausência de segredos, backups e arquivos sensíveis no repositório.

Os testes rodam a cada *push* e *pull request*; o deploy só ocorre se todos passarem.

## Publicação (GitHub Pages)

O deploy é automático a cada *push* na branch `main` (`.github/workflows/pages.yml`). Somente `index.html` e `assets/` são publicados.

Configuração única no repositório: **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.

> Se o repositório ou a organização tiver outro nome, atualize as URLs em `index.html` (`canonical`, `og:url`) e neste README.

## Segurança

O GitHub Pages não permite cabeçalhos HTTP personalizados nem `.htaccess`. As proteções abaixo valem dentro dessa limitação:

- **Site 100% estático**: sem PHP, formulários ou back-end, o que elimina injeção de código no servidor e uploads.
- **Content-Security-Policy** via `<meta>`: `default-src 'none'`, scripts só de `'self'`, `base-uri`, `form-action` e `connect-src` bloqueados. O JavaScript fica em arquivo externo para dispensar `unsafe-inline`.
- **Referrer-Policy** `strict-origin-when-cross-origin` e links externos com `noopener noreferrer`.
- **HTTPS** forçado pelo próprio GitHub Pages (ative *Enforce HTTPS* em Settings → Pages).
- **CI com permissões mínimas** (`contents: read`; `pages`/`id-token: write` apenas no deploy).
- Sem cookies, *trackers* ou *analytics*.

**Limitações conhecidas**: `frame-ancestors`, `X-Frame-Options` e HSTS não podem ser definidos via `<meta>` no GitHub Pages. Em hospedagem Apache própria, use `deploy/apache.htaccess`, que aplica esses cabeçalhos e bloqueia arquivos sensíveis. As fontes são carregadas do Google Fonts, o que expõe o IP do visitante ao Google; para eliminar isso, hospede as fontes localmente.

Para reportar uma vulnerabilidade, escreva para o contato abaixo em vez de abrir uma *issue* pública.

## Manutenção do conteúdo

Edite diretamente o `index.html`. Pontos que mudam ao longo do processo:

- seção **Etapas** (`.t-dot done|pending` e o selo "Próxima");
- seção **Próximo evento** (data, horário, local e links de calendário);
- membros do **GEAR**;
- PDFs em `assets/docs/`, com nomes sem espaços ou caracteres especiais.

Depois de editar, rode `npm test` antes de enviar.

## Contribuindo

1. Crie uma branch a partir de `main`.
2. Faça a alteração e rode `npm test`.
3. Abra um *pull request*; o CI valida automaticamente.

## Contato

GEAR — Grupo de Escuta, Análise e Registro: **ppp.ppgcst@gmail.com**

## Licença

Distribuído sob a licença [MIT](LICENSE). O conteúdo textual e institucional pertence ao PPG-CST/INPE.
