# Configuração para Produção

Este documento explica como configurar o front-end e back-end para produção.

## URLs de Produção

- **Front-end**: https://euamoadream2025.netlify.app
- **API Backend (site-backend)**: https://dreamnewsystem6.discloud.app
- **API DreamCloud**: https://betadreamcloud2.discloud.app

## Configuração do Front-end

### Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do projeto com o seguinte conteúdo:

```env
VITE_API_BASE_URL=https://dreamnewsystem6.discloud.app
VITE_DREAMCLOUD_API_URL=https://betadreamcloud2.discloud.app
VITE_FRONTEND_URL=https://euamoadream2025.netlify.app
```

### Build para Produção

```bash
npm run build
```

O build será gerado na pasta `dist/` e pode ser deployado no Netlify.

## Configuração do Back-end (site-backend)

O arquivo `site-backend/config.json` já foi atualizado com a URL do front-end de produção:

```json
{
  "frontendUrl": "https://euamoadream2025.netlify.app",
  "frontendBaseUrl": "https://euamoadream2025.netlify.app"
}
```

Certifique-se de que o back-end está configurado para aceitar requisições do front-end de produção no CORS.

## Como Usar o Utilitário de API

O projeto agora inclui um utilitário em `src/utils/api.ts` que gerencia automaticamente as URLs baseadas no ambiente.

### Exemplo de Uso

```typescript
import { getApiPath, apiFetch, getDreamCloudPath, dreamCloudFetch } from "@/utils/api";

// Para chamadas normais da API
const response = await apiFetch("/api/produtos", {
  method: "GET",
  credentials: "include"
});

// Para chamadas do DreamCloud
const response = await dreamCloudFetch("/dreamcloud/config", {
  method: "GET",
  credentials: "include"
});

// Para construir URLs manualmente
const url = getApiPath("/auth/me");
const dreamCloudUrl = getDreamCloudPath("/dreamcloud/links");
```

### Migração de Código Existente

Para migrar código existente que usa `fetch` diretamente:

**Antes:**
```typescript
const response = await fetch("/api/produtos", {
  credentials: "include"
});
```

**Depois:**
```typescript
import { apiFetch } from "@/utils/api";

const response = await apiFetch("/api/produtos");
```

## Notas Importantes

1. **Desenvolvimento**: Em desenvolvimento, o Vite usa proxy para redirecionar requisições para `localhost`. As URLs relativas funcionam normalmente.

2. **Produção**: Em produção, as URLs são automaticamente convertidas para URLs absolutas usando as variáveis de ambiente.

3. **CORS**: Certifique-se de que o back-end está configurado para aceitar requisições do domínio de produção.

4. **Netlify**: Para deploy no Netlify, configure as variáveis de ambiente no painel do Netlify ou use o arquivo `.env.production`.

## Arquivos Já Atualizados

Os seguintes arquivos já foram atualizados para usar o novo sistema:
- `src/hooks/useDiscordAuth.tsx`
- `src/hooks/useUser.ts`
- `src/components/Header.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/Plans.tsx`

Outros arquivos podem ser atualizados gradualmente usando o helper `apiFetch` ou `getApiPath` conforme necessário.

## Estrutura de URLs

### Em Desenvolvimento
- Front-end: `http://localhost:8080`
- API Backend: `http://localhost:3001` (via proxy do Vite)
- API DreamCloud: `http://localhost:3000` (via proxy do Vite para `/dreamcloud`)

### Em Produção
- Front-end: `https://euamoadream2025.netlify.app`
- API Backend: `https://dreamnewsystem6.discloud.app`
- API DreamCloud: `https://betadreamcloud2.discloud.app`

**Nota**: O site-backend faz proxy para `/api/dreamcloud/*` para a API do DreamCloud, então em produção essas chamadas vão para `https://dreamnewsystem6.discloud.app/api/dreamcloud/*`.

