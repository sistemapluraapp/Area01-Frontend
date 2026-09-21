# Area01-Frontend

Frontend da Área 01 (Usuário/Público) da Plura — Next.js (export estático) em Cloudflare Pages.

Referência de UI/UX: repositório de prototipação `marcosoliveiramaster/plura`
(telas de Login, SignUp, busca e perfil), reimplementadas aqui consumindo o
backend desta área (Hono/Workers) em vez de falar direto com o Supabase.

## Deploy
O workflow `.github/workflows/deploy.yml` publica em Cloudflare Pages a cada push.
Precisa dos secrets do repositório: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
