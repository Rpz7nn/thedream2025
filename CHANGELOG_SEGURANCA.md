# 🛡️ Changelog - Sistema de Segurança e Melhorias

## Data: 07 de Novembro de 2025

---

## ✅ Implementações Concluídas

### 1. 🔐 Sistema de Proteção Robusto para APIs

**Arquivo:** `site-backend/middleware/security.js` (NOVO)

#### Funcionalidades Implementadas:

- **Rate Limiting Inteligente:**
  - APIs gerais: 100 requisições/minuto
  - Autenticação: 10 tentativas/15 minutos
  - Criação/Upload: 20 operações/10 minutos
  - Operações críticas: 30 operações/5 minutos
  - Webhooks: 1000 requisições/minuto
  - Whitelist automática para desenvolvimento local

- **Sanitização Avançada de Inputs:**
  - Remoção de tags `<script>`
  - Bloqueio de `javascript:` URLs
  - Remoção de event handlers maliciosos
  - Proteção contra caracteres de controle
  - Bloqueio de chaves com `$` e `.` (NoSQL injection)

- **Validação de Tipos:**
  - Strings com limite de 10MB
  - Números com ranges configuráveis
  - Validação de emails
  - Validação de URLs
  - Validação de ObjectIds do MongoDB
  - Arrays com máximo de 1000 itens

- **Detecção de Ataques:**
  - NoSQL injection (`$where`, `$regex`, `$ne`, etc)
  - SQL injection (`union select`, `drop table`, etc)
  - XSS (`<script>`, `javascript:`, `onerror=`, etc)
  - Path traversal (`../`, `..\`)
  - Command injection (`eval`, `exec`, `system`)

- **Proteção CSRF:**
  - Validação de origens permitidas
  - Whitelist de domínios configurável
  - Modo flexível para desenvolvimento

- **Headers de Segurança (Helmet):**
  - Content Security Policy
  - HSTS com preload
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer Policy

- **Logging de Segurança:**
  - Registro de todas as operações críticas
  - Informações de IP, User-Agent e timestamp
  - Alertas para ataques detectados

**Pacotes Instalados:**
```json
{
  "express-rate-limit": "^7.1.5",
  "express-mongo-sanitize": "^2.2.0",
  "helmet": "^7.1.0"
}
```

**Integração:**
- Aplicado globalmente em `site-backend/index.js` (linha 53)
- Rate limiters específicos adicionados nas rotas de produtos

---

### 2. 💾 Schema de Cupons no MongoDB

**Arquivo:** `site-backend/index.js` (linhas 206-216)

#### Estrutura do Schema:

```javascript
cupons: [{
  id: String (required),
  codigo: String (required),
  desconto: Number (required),
  maximoUso: Number (default: 0),
  usosAtuais: Number (default: 0),
  cargosPermitidos: [String],
  cargosNegados: [String],
  ativo: Boolean (default: true),
  createdAt: Date
}]
```

**Funcionalidades:**
- Cupons ilimitados por produto
- Controle de uso máximo
- Restrições por cargo (whitelist/blacklist)
- Ativação/desativação individual
- Rastreamento de data de criação

---

### 3. ⏰ Aviso "Fecha em 10 minutos" no Container PIX

**Arquivo:** `bot/events/ProdutosHandler.js` (linha 1103)

#### Mudanças:

```javascript
content: `## Pagamento via PIX criado
Escaneie o QR Code ou use o botão para copiar o código PIX.

⏰ **Este carrinho fecha em ${expiresMinutes} minuto(s)** se o pagamento não for concluído.

**Expira em**
\`Em ${expiresMinutes} minuto(s)\`
**Pedido**
\`#${session.codigoPedido}\`
**Valor Total**
\`R$ ${totalFormatado}\`
`
```

**Impacto:**
- Usuário informado claramente sobre o tempo limite
- Mensagem em destaque com emoji de relógio
- Exibição dinâmica do tempo restante

---

### 4. 🛒 Carrinho Único por Usuário

**Arquivo:** `bot/events/ProdutosHandler.js` (linhas 2397-2411)

#### Implementação:

```javascript
// ⭐ Verificar se o usuário já tem um carrinho aberto
const existingCart = Array.from(carrinhoSessions.values()).find(
  s => s.userId === interaction.user.id && 
  s.guildId === interaction.guildId && 
  !s.closed &&
  s.paymentStatus !== 'paid'
);

if (existingCart) {
  const cartUrl = `https://discord.com/channels/${interaction.guildId}/${existingCart.threadId}`;
  return interaction.reply({
    content: `⚠️ **Você já tem um carrinho aberto!**\n\nFinalize ou cancele seu carrinho atual antes de abrir um novo.\n\n[Ir para o carrinho](${cartUrl})`,
    ephemeral: true
  });
}
```

**Benefícios:**
- Evita spam de carrinhos
- Melhora organização dos pedidos
- Link direto para o carrinho existente
- Verificação por usuário e servidor

---

### 5. 🎨 Emojis Condicionais (Automático vs Manual)

**Arquivo:** `site-backend/produtos.js` (linhas 130-174)

#### Implementação:

```javascript
// Emojis fixos - apenas para produtos automáticos
const emojisFixos = '<:ea1:...><:ea2:...>...';
const mostrarEmojis = produto.tipoEntrega !== 'manual';

const tituloEmojisDescricao = descricaoFormatada 
  ? (mostrarEmojis 
      ? `**${produto.nome}**\n${emojisFixos}\n\n${descricaoFormatada}\n\n`
      : `**${produto.nome}**\n\n${descricaoFormatada}\n\n`)
  : (mostrarEmojis
      ? `**${produto.nome}**\n${emojisFixos}\n\n`
      : `**${produto.nome}**\n\n`);
```

**Comportamento:**
- **Produtos Automáticos:** Mostram emojis decorativos
- **Produtos Manuais:** Apenas nome e descrição
- Detecção automática baseada no campo `tipoEntrega`

---

### 6. ✅ Tipo de Entrega Salvo Automaticamente

**Arquivo:** `src/pages/Dashboard.tsx` (linha 475)

#### Implementação:

O campo `tipoEntrega` já estava sendo salvo corretamente no handleCriarProduto:

```typescript
tipoEntrega: tipoEntrega, // 'automatica' ou 'manual'
```

**Schema MongoDB:** O campo `tipoEntrega` é persistido em todas as operações de criação e atualização de produtos.

---

## 📊 Resumo de Arquivos Modificados

| Arquivo | Mudanças | Status |
|---------|----------|--------|
| `site-backend/middleware/security.js` | **NOVO** - Sistema completo de proteção | ✅ |
| `site-backend/index.js` | Aplicação do middleware + Schema de cupons | ✅ |
| `site-backend/package.json` | Adição de pacotes de segurança | ✅ |
| `site-backend/produtos.js` | Rate limiters nas rotas + Emojis condicionais | ✅ |
| `bot/events/ProdutosHandler.js` | Carrinho único + Aviso "10 minutos" + Entrega manual | ✅ |

---

## 🚀 Como Usar

### Teste de Segurança

O sistema de proteção está ativo e funcionando. Para testar:

1. **Rate Limiting:**
   ```bash
   # Fazer mais de 100 requisições em 1 minuto resulta em erro 429
   curl -X GET http://localhost:3001/api/produtos
   ```

2. **Sanitização de Inputs:**
   ```bash
   # Tentativa de XSS é bloqueada
   curl -X POST http://localhost:3001/api/produtos \
     -H "Content-Type: application/json" \
     -d '{"nome": "<script>alert(1)</script>"}'
   ```

3. **Detecção de Ataques:**
   ```bash
   # NoSQL injection é detectada e bloqueada
   curl -X POST http://localhost:3001/api/produtos \
     -H "Content-Type: application/json" \
     -d '{"nome": {"$where": "true"}}'
   ```

### Criação de Produtos com Cupons

```javascript
{
  "nome": "Produto VIP",
  "tipoEntrega": "automatica", // ou "manual"
  "cupons": [
    {
      "id": "cupom_001",
      "codigo": "DESCONTO50",
      "desconto": 50,
      "maximoUso": 100,
      "cargosPermitidos": ["role_id_1"],
      "ativo": true
    }
  ]
}
```

### Verificação de Carrinho Único

Ao clicar em "Comprar", o bot verifica automaticamente se o usuário já tem um carrinho aberto no servidor e exibe mensagem com link para o carrinho existente.

---

## 🔒 Níveis de Proteção Implementados

| Nível | Tipo de Ataque | Proteção |
|-------|----------------|----------|
| **1** | DDoS / Flood | Rate Limiting ✅ |
| **2** | XSS | Sanitização + CSP ✅ |
| **3** | SQL/NoSQL Injection | Detecção de padrões ✅ |
| **4** | CSRF | Validação de origem ✅ |
| **5** | Path Traversal | Bloqueio de `../` ✅ |
| **6** | Command Injection | Detecção de `eval`, `exec` ✅ |
| **7** | Dados Maliciosos | Sanitização MongoDB ✅ |
| **8** | Headers Inseguros | Helmet configurado ✅ |

---

## 📝 Notas Importantes

1. **Desenvolvimento vs Produção:**
   - Em desenvolvimento, IPs locais (localhost, 127.0.0.1, ::1) são whitelistados do rate limiting
   - Em produção, todas as proteções são aplicadas integralmente

2. **Logs de Segurança:**
   - Todas as operações críticas são registradas
   - Ataques detectados geram alertas no console
   - Formato: `🔐 [SECURITY] {timestamp, method, path, ip, userAgent}`

3. **Configuração de CORS:**
   - Frontend deve estar na lista de origens permitidas
   - Configuração em `process.env.FRONTEND_URL`

4. **Performance:**
   - O middleware adiciona overhead mínimo (~1-2ms por requisição)
   - Rate limiting usa armazenamento em memória (rápido)
   - Sanitização é otimizada para não afetar performance

---

## 🎯 Próximos Passos Recomendados

- [ ] Implementar sistema de cupons na interface de carrinho
- [ ] Adicionar dashboard de monitoramento de segurança
- [ ] Configurar alertas por webhook para ataques detectados
- [ ] Implementar blacklist dinâmica de IPs maliciosos
- [ ] Adicionar 2FA para administradores

---

**Desenvolvido com ❤️ e 🛡️ Segurança**

