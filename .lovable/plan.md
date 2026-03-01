

## Reorganizar pagina de Ferramentas e adicionar Ferramentas Patrocinadas

### Resumo

Remover os anuncios inline (quadradinhos) da grade de ferramentas, mantendo apenas os banners horizontais (topo e rodape). Adicionar suporte a "ferramentas patrocinadas" -- empresas que pagam para ter seu servico/ferramenta listado junto com as ferramentas gratuitas, com um selo de "Parceiro" ou "Patrocinado".

### Mudancas

#### 1. Limpar a pagina de Ferramentas (`src/pages/Tools.tsx`)

- Remover os `AdPlaceholder` inline (`ferramentas_inline_1` e `ferramentas_inline_2`) que ficam entre as ferramentas na grade
- Manter apenas o banner topo (`ferramentas_topo`) e rodape (`ferramentas_rodape`)
- Adicionar suporte para renderizar ferramentas patrocinadas vindas do banco de dados junto com as ferramentas fixas, com um selo visual "Parceiro" e estilo levemente diferenciado (borda com cor primaria sutil)

#### 2. Criar tabela no banco de dados para ferramentas patrocinadas

Nova tabela `sponsored_tools` com colunas:
- `id` (uuid, PK)
- `name` (text) -- nome da ferramenta
- `description` (text) -- descricao curta
- `url` (text) -- link externo
- `icon_url` (text, nullable) -- icone/logo da empresa
- `client_name` (text) -- nome do cliente
- `is_active` (boolean, default false)
- `plan_type` (text) -- "vitalicio" ou "mensal"
- `plan_start` (date)
- `plan_end` (date, nullable) -- null para vitalicio
- `plan_value` (numeric)
- `display_order` (integer, default 0) -- ordem de exibicao
- `created_at`, `updated_at`

RLS: leitura publica para ferramentas ativas, gerenciamento para usuarios autenticados.

#### 3. Exibir ferramentas patrocinadas na pagina (`src/pages/Tools.tsx`)

- Buscar ferramentas patrocinadas ativas do banco via React Query
- Renderizar na mesma grade das ferramentas gratuitas, apos as ferramentas fixas
- Cada ferramenta patrocinada tera:
  - Mesmo layout visual dos cards de ferramenta
  - Um badge discreto "Parceiro" no canto superior
  - Icone da empresa (ou icone generico se nao tiver)
  - Link externo para o site da empresa

#### 4. Atualizar pagina de anuncios (`src/pages/Anuncie.tsx`)

- Atualizar a tabela de precos da pagina Ferramentas: remover os slots inline 1 e inline 2, manter apenas Banner Topo e Rodape
- Adicionar uma nova secao/card na tabela de precos para "Ferramenta Patrocinada" com:
  - Descricao: "Sua ferramenta/servico listado junto com as ferramentas gratuitas do site"
  - Opcao mensal e opcao vitalicia (valor equivalente a ~36 meses)
  - Requisito: servico deve ser relacionado a tecnologia (mesmo criterio do plano vitalicio da barra de ferramentas)

#### 5. Adicionar gestao de ferramentas patrocinadas no painel admin

- Criar pagina ou secao em `/admin/anuncios` para gerenciar ferramentas patrocinadas
- Formulario para adicionar/editar: nome, descricao, URL, icone, dados do plano
- Ativar/desativar ferramentas
- A Edge Function `deactivate-expired-ads` sera atualizada para tambem desativar ferramentas patrocinadas com `plan_end` expirado

### Secao tecnica

**Arquivos modificados:**
- `src/pages/Tools.tsx` -- remover inline ads, adicionar query e renderizacao de ferramentas patrocinadas
- `src/pages/Anuncie.tsx` -- atualizar slots da pagina Ferramentas, adicionar secao de ferramenta patrocinada
- `src/pages/AdminAds.tsx` -- adicionar secao de gestao de ferramentas patrocinadas
- `supabase/functions/deactivate-expired-ads/index.ts` -- incluir desativacao de ferramentas patrocinadas expiradas

**Nova migracoes SQL:**
- Criar tabela `sponsored_tools` com RLS
- Politica SELECT publica para `is_active = true`
- Politica ALL para usuarios autenticados

**Icones:** Usar `lucide-react` (ex: `Sparkles` para o badge de parceiro, `ExternalLink` para o link)
