# Especificação Técnica para Agentes: Integração IA no OpenBand
**Arquivo**: `docs/AI_INTEGRATION_AGENT_SPEC.md`
**Projeto**: [OpenBand (cpxlabs/OpenBand)](https://github.com/cpxlabs/OpenBand)
**Versão**: 1.0 (Jul/2026)
**Status**: Pronto para implementação
**Modelo de Negócio**: Chave de API por usuário → **ZERO custo para CPX Labs**

---

## 📋 Instruções Obrigatórias para o Agente
1. Siga a ordem de implementação definida na Seção 10
2. Não invente funcionalidades, provedores ou modelos fora do escopo
3. Mantenha consistência de tipos, nomes de arquivos e contratos de API
4. Todas as chaves de API são armazenadas **APENAS localmente** no dispositivo do usuário
5. Nunca **armazene ou registre** credenciais em servidores do OpenBand (chaves transitam pelo proxy apenas em memória e nunca são persistidas)
6. Valide sempre a existência de chaves antes de chamar APIs externas
7. Use tratamento de erro em TODAS as chamadas externas

---

## 1. Resumo da Feature
Permitir que usuários do OpenBand gerem **capas de música/projeto, artes de marketing e vídeos** usando IA, com duas fontes de prompt:
- ✅ **Letra da música** (auto-importada do projeto)
- ✅ **Campo de texto personalizado**

### Diferencial Principal
Fluxo otimizado para músicos:
`Letra da Música → IA Refina Prompt → IA Gera Imagem/Vídeo`

### Provedores Suportados (Ordem de Prioridade)
| # | Provedor | Função Principal | Modelos Chave | Gratuito? |
|---|---|---|---|---|
| 1 | 🟦 Google Gemini | Gerar imagem + refinar prompt | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-pro` | ✅ Free tier generoso |
| 2 | 🟩 OpenAI (ChatGPT) | Gerar imagem + vídeo (Sora) | `gpt-image-2`, `dall-e-3`, `sora-2` | ⚠️ Crédito inicial |
| 3 | 🟪 OpenRouter | **TODOS os modelos em 1 chave** | Qualquer modelo do mercado | ✅ $5 grátis no cadastro |
| 4 | 🟧 Anthropic Claude | **APENAS refinar prompt** (NÃO gera imagem/vídeo) | `claude-3-7-sonnet`, `claude-3-5-haiku` | ❌ Pago |
| 5 | 🤗 Hugging Face | Fallback open-source | `FLUX.1-schnell`, `SDXL` | ✅ 100% grátis |

---

## 2. Escopo
### ✅ In Scope
- Tela de configuração de chaves de API por provedor
- Armazenamento local seguro de credenciais
- Rota backend para **testar validade de chaves**
- Rota backend para **refinar prompt** (letra → prompt profissional)
- Rota backend para **gerar imagem** com proporções padrão da indústria
- Rota backend para **gerar vídeo** (OpenAI Sora + OpenRouter)
- Modal de geração de capa com:
  - Escolha entre letra/texto personalizado
  - Botão de refinar prompt
  - Seletor de provedor/modelo/proporção
  - Prévia, aprovar como capa, nova versão, baixar
- Botão de acesso na tela do projeto

### ❌ Out of Scope (Fases Futuras)
- Edição de imagem dentro do app
- Templates de texto sobreposto na arte
- Histórico ilimitado de gerações
- Compartilhamento direto em redes sociais
- Chave mestra da CPX Labs (sempre chave do usuário)

---

## 3. Arquitetura Geral
```
[Usuário] → Configura chaves → Salva em [Electron Store LOCAL]
    ↓
Clica em "Gerar Capa" → Escolhe fonte (Letra/Texto)
    ↓
[Opcional] Clica "Refinar Prompt" → Frontend envia (chave + letra) → Backend chama Claude/Gemini → Retorna prompt profissional
    ↓
Escolhe provedor/modelo/proporção → Frontend envia (chave + prompt) → Backend chama API do provedor
    ↓
Recebe imagem → Exibe prévia → Aprovar = Salva como capa do projeto | Baixar = Download PNG
```

---

## 4. Estrutura Exata de Arquivos
### Criar Novos
```
src/
├── pages/
│   └── SettingsAI.tsx          # Tela de configuração de chaves
├── lib/
│   └── settingsStore.ts        # Store Zustand com persistência local
└── components/
    └── GenerateCoverModal.tsx  # Modal principal de geração

backend/
└── src/
    └── routes/
        └── ai.ts               # Todas as rotas de IA
```

### Modificar Existentes
```
backend/src/index.ts            # Registrar rota /api/ai
src/pages/ProjectView.tsx       # Adicionar botão "Gerar Capa com IA"
README.md                       # Link para documentação
.gitignore                      # Garantir que .env não seja commitado
```

---

## 5. Especificação por Componente

### 5.1 Settings Store (`src/lib/settingsStore.ts`)
#### Tipos
```typescript
export type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'claude' | 'huggingface';

export interface AIConfig {
  aiKeys: Partial<Record<AIProvider, string>>;
  defaultImageProvider: AIProvider;
  defaultPromptRefiner: AIProvider | null;
}
```

#### Ações Obrigatórias
- `setAIKey(provider: AIProvider, key: string)`: Salva/atualiza chave
- `removeAIKey(provider: AIProvider)`: Apaga chave do armazenamento
- `setDefaults(config: Partial<AIConfig>)`: Atualiza padrões

#### Regras
- Usar `zustand + persist` → nome: `openband-ai-settings`
- Valores padrão: `defaultImageProvider = 'gemini'`, `defaultPromptRefiner = 'claude'`

---

### 5.2 Página Settings AI (`src/pages/SettingsAI.tsx`)
#### Layout
1. Título + explicação de privacidade
2. Card por provedor (ordem: Gemini → OpenAI → OpenRouter → Claude → Hugging Face) contendo:
   - Nome + tag de função
   - Descrição curta
   - Link para pegar chave
   - Input `type="password"` para chave
   - Botão **Testar chave**
   - Botão **Apagar chave**
   - Feedback de sucesso/erro do teste

#### Comportamento
- Ao digitar, salva automaticamente no store
- Teste de chave chama `POST /api/ai/test-key`
- Desabilita provedores sem chave em seletores de outros componentes

---

### 5.3 Backend Routes (`backend/src/routes/ai.ts`)
#### Registro
```typescript
import aiRoutes from './routes/ai';
app.use('/api/ai', aiRoutes);
```

#### Rotas Obrigatórias
| Método | Rota | Função |
|---|---|---|
| POST | `/test-key` | Valida se chave de um provedor é válida |
| POST | `/refine-prompt` | Transforma letra/texto em prompt profissional |
| POST | `/generate-cover` | Gera imagem com o provedor escolhido |
| POST | `/generate-video` | Gera vídeo (Sora/OpenRouter) |

##### 5.3.1 POST `/test-key`
**Request Body**
```json
{ "provider": "gemini", "apiKey": "hf_xxx" }
```
**Response**
```json
{ "ok": true, "message": "✅ Chave funcionando!" }
```

##### 5.3.2 POST `/refine-prompt`
**Request Body**
```json
{
  "provider": "claude",
  "apiKey": "sk-ant-xxx",
  "lyrics": "Caminho na chuva...",
  "customPrompt": null,
  "projectTitle": "Noite Sem Fim",
  "genre": "Indie Rock"
}
```
**Response**
```json
{ "refined": "Cena cinematográfica de rua vazia sob chuva..." }
```
**Regras**:
- Prompt do sistema: especialista em capas de álbum, sem texto na imagem, foco em emoção
- Prioriza `customPrompt` se existir, senão usa `lyrics`

##### 5.3.3 POST `/generate-cover`
**Request Body**
```json
{
  "provider": "gemini",
  "apiKey": "AIza...",
  "prompt": "Prompt refinado ou bruto",
  "model": "gemini-3.1-flash-image-preview",
  "aspectRatio": "1:1",
  "quality": "standard"
}
```
**Proporções Suportadas**: `1:1` (Spotify), `16:9` (YouTube), `9:16` (Reels), `4:3` (Post), `3:4` (Pinterest)
**Response**: Binário PNG com header `Content-Type: image/png`

##### 5.3.4 POST `/generate-video`
**Request Body**
```json
{
  "provider": "openai",
  "apiKey": "sk-xxx",
  "prompt": "Prompt",
  "aspectRatio": "16:9",
  "seconds": 4
}
```
**Response**: Job ID para polling ou URL do vídeo

---

### 5.4 Modal Generate Cover (`src/components/GenerateCoverModal.tsx`)
#### Estados Obrigatórios
- Modo: `'lyrics' | 'custom'`
- Texto bruto, prompt refinado
- Refinador selecionado, estado de refinamento
- Provedor de imagem, modelo, proporção
- Estado de carregamento, imagem resultado, erros

#### Fluxo da UI
1. **Se nenhuma chave existir**: Tela de aviso para ir para ajustes
2. **Escolha da fonte**: Aba Letra (mostra prévia da letra) / Aba Texto Personalizado (textarea)
3. **Seção Refinar Prompt**: Seletor de refinador + botão "✨ Deixar profissional" + textarea editável do resultado
4. **Configurações**: Provedor (apenas com chave) → Modelo → Proporção
5. **Botão Gerar**: Desabilitado se sem prompt/sem chave
6. **Resultado**: Imagem + 3 botões:
   - ✅ **Usar como Capa**: Salva no projeto e fecha modal
   - 🔄 **Nova Versão**: Reexecuta geração
   - 💾 **Baixar**: Download PNG com nome do projeto

---

### 5.5 Integração na Tela do Projeto
- Adicionar botão **✨ Gerar Capa com IA** próximo ao campo de upload de capa existente
- Ao clicar, abre o `GenerateCoverModal`

---

## 6. Regras de Negócio Inquebráveis
### 🔐 Segurança
1. Nenhuma chave de API é **armazenada, logada ou commitada** em servidores do OpenBand — as chaves vivem **apenas no dispositivo** do usuário; durante uma geração, a chave transita pelo proxy do OpenBand (HTTPS, em memória, com autenticação) **apenas** para ser encaminhada ao provedor escolhido e é descartada imediatamente
2. Nenhuma chave é logada em console, arquivo ou telemetria
3. Inputs de chave usam `type="password"`
4. Todas as chamadas externas usam HTTPS

### 🎯 Qualidade
1. **Claude NUNCA é usado para gerar imagem**: só para refinar prompt
2. Prompt final sempre inclui regra: *"sem texto sobreposto na imagem"*
3. Provedores sem chave são desabilitados em seletores
4. Tratamento de erro amigável para: chave inválida, sem créditos, rate limit, modelo indisponível

### 📏 Padrões da Indústria
1. Capa padrão: `1:1 1024x1024` (compatível Spotify/Apple/DistroKid)
2. Nome de download: `<nome-do-projeto>.png`
3. Vídeo padrão: 4 segundos, 16:9 ou 9:16

---

## 7. Ordem de Implementação
1. Criar `settingsStore.ts` → testar persistência local
2. Criar página `SettingsAI.tsx` → UI de chaves
3. Implementar rota `POST /api/ai/test-key` para todos os provedores
4. Conectar teste de chave na UI
5. Implementar rota `POST /api/ai/refine-prompt` (Claude → Gemini → OpenAI → OpenRouter)
6. Implementar rota `POST /api/ai/generate-cover` (Gemini → OpenAI → OpenRouter → Hugging Face)
7. Criar `GenerateCoverModal.tsx` → conectar todas as rotas
8. Adicionar botão na tela do projeto
9. Implementar rota `POST /api/ai/generate-video` (opcional, fase 2)
10. Escrever documentação final no `README.md`

---

## 8. Critérios de Aceite (Merge Aprovado)
- [ ] Usuário consegue adicionar, testar e apagar chave de todos os 5 provedores
- [ ] Chaves sobrevivem a fechar e abrir o app
- [ ] Usuário consegue gerar capa usando **apenas a letra da música**
- [ ] Usuário consegue gerar capa usando **texto personalizado**
- [ ] Botão "Refinar Prompt" funciona com pelo menos Claude e Gemini
- [ ] Todas as 5 proporções geram imagem com tamanho correto
- [ ] Imagem gerada pode ser salva como capa do projeto
- [ ] Download funciona em alta resolução
- [ ] Nenhuma chave aparece em **logs, telemetria ou armazenamento** nos servidores do OpenBand (chaves transitam apenas em memória, por requisição)
- [ ] Erros de API exibem mensagem clara para o usuário

---

## 9. Links Úteis para Implementação
- Gemini API: https://ai.google.dev/api
- OpenAI API: https://platform.openai.com/docs
- OpenRouter API: https://openrouter.ai/docs
- Claude API: https://docs.anthropic.com
- Hugging Face Inference: https://huggingface.co/docs/api-inference

---

## 10. Observações
- Modelos e endpoints atualizados em **Julho de 2026**
- Sempre que possível, usar modelos gratuitos primeiro como padrão
- Manter código tipado estritamente com TypeScript
- Usar Tailwind CSS para toda a UI (padrão do projeto)
