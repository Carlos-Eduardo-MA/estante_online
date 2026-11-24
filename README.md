# Estante

### Organize seus livros e acompanhe sua jornada de leitura.

A Estante é uma biblioteca digital pessoal para quem quer descobrir livros, organizar o que está lendo e guardar suas impressões em um só lugar. Cada livro pode ficar em uma etapa de leitura, receber uma avaliação e ter uma resenha associada.

O projeto reúne uma experiência de produto completa com busca em catálogo externo, contas individuais e uma estante que acompanha a evolução de cada leitor.

## O que você pode fazer

- Buscar livros por título ou autor no catálogo da Open Library.
- Organizar a estante nas etapas **Quero ler**, **Em leitura** e **Concluídos**.
- Filtrar livros por etapa e acompanhar um resumo da estante.
- Registrar uma avaliação de 1 a 5 estrelas e uma resenha para cada livro.
- Criar uma conta e manter uma biblioteca individual.

## Acessar a demonstração

Ao iniciar pela primeira vez, a aplicação cria uma conta de demonstração com quatro livros cadastrados:

| Campo | Acesso |
| --- | --- |
| E-mail | `demo@estante.app` |
| Senha | `demo1234` |

Também é possível criar uma conta pela própria aplicação.

> A conta e as credenciais de demonstração são destinadas à avaliação local. Antes de publicar o sistema, desative ou remova o seed de demonstração e configure um segredo de sessão exclusivo.

## Executar localmente

Requisitos:

- Node.js 20.9 ou superior
- npm
- Acesso à internet para pesquisar livros na Open Library

Com o terminal aberto na pasta do projeto:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O banco SQLite é criado automaticamente em `data/estante.db` na primeira execução. O seed inicial inclui a conta de demonstração e seus livros.

Se o npm bloquear o script de instalação do `better-sqlite3`, aprove o pacote e reconstrua o módulo:

```bash
npm approve-scripts better-sqlite3
npm rebuild better-sqlite3
```

### Configuração

Em desenvolvimento, a aplicação funciona sem configuração adicional. Para definir um segredo próprio, crie `.env.local` a partir do exemplo. No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Gere um segredo para `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Configure o valor gerado em `.env.local`. O caminho do banco também pode ser alterado com `DATABASE_PATH`; se omitido, usa `data/estante.db`.

Para validar a versão de produção:

```bash
npm run build
npm run start
```

## Tecnologias e decisões

| Área | Tecnologia | Uso |
| --- | --- | --- |
| Aplicação web | Next.js 16 e React 19 | App Router, páginas renderizadas no servidor e rotas de API. |
| Interface | Tailwind CSS 4 | Layout responsivo e componentes visuais próprios. |
| Persistência | SQLite e `better-sqlite3` | Banco local, schema relacional e inicialização automática. |
| Catálogo | Open Library Search API | Busca de livros e consulta de capas e metadados. |
| Validação | Zod | Validação das entradas recebidas pelas rotas. |
| Autenticação | `node:crypto` | Hash de senha com scrypt e assinatura de sessão. |

### Segurança e isolamento de dados

- Senhas protegidas com scrypt e salt individual.
- Sessões com token aleatório em cookie `httpOnly`, `SameSite=Lax` e expiração.
- O banco armazena o HMAC do token, não o token da sessão.
- Rotas autenticadas revalidam a sessão e consultas da estante são limitadas ao usuário atual.
- Limites de requisição, validação de origem nas operações de escrita e validação de dados com Zod.
- Busca externa realizada no servidor, com normalização e cache das respostas.
- Headers de segurança e política CSP configurados para as respostas da aplicação.

## Estrutura do projeto

```text
src/
├── app/          páginas, layout e rotas de API
├── components/   interface, formulários e estante de livros
├── lib/          autenticação, banco, validação e integração externa
└── proxy.ts      redirecionamento de visitantes sem sessão
```

## Próximas etapas para produção

A versão atual é adequada para demonstração e execução local. Para uma operação pública, os próximos passos incluem:

- Remover ou tornar opcional o seed da conta de demonstração.
- Adicionar testes automatizados para autenticação, validação e rotas.
- Implementar verificação de e-mail e recuperação de senha.
- Avaliar PostgreSQL, backups e rate limit compartilhado para múltiplas instâncias.
- Configurar domínio, monitoramento e gestão de segredos no ambiente de hospedagem.

Os dados de catálogo e capas são fornecidos pela [Open Library](https://openlibrary.org/developers/api).
