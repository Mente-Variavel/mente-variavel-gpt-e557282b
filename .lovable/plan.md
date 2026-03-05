

## Plan: Update Mente Variável GPT

### 1. Remove Pix Checkout (temporary)

**Files to edit:**
- `src/components/Navbar.tsx` — Remove `{ to: "/servicos/pix-checkout", label: "Pix Checkout" }` from `servicosItems`
- `src/components/Footer.tsx` — Remove Pix Checkout link
- `src/pages/Tools.tsx` — Remove Pix Checkout entry from `tools` array
- `src/App.tsx` — Remove PixCheckout route (keep the file for future re-integration)

### 2. New Tool: Criador de Letra de Música

**New file: `src/pages/CriadorMusica.tsx`**
- Form with fields: Título, Gênero (select with Sertanejo/Gospel/Pop/Rock/Trap/Funk/MPB), Tema, Estilo (optional)
- On submit: call existing `supabase/functions/chat` edge function with a structured prompt requesting complete song lyrics (Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Final Chorus)
- Display result in a styled card
- Buttons: "Copiar letra" (clipboard), "Gerar prompt para Suno" (generates a Suno-ready text prompt from lyrics+genre, shows in copyable block)
- Button: "Criar música no Suno" → opens `https://suno.com` in new tab

**Files to edit:**
- `src/App.tsx` — Add route `/servicos/criador-musica`
- `src/components/Navbar.tsx` — Add to `servicosItems`: `{ to: "/servicos/criador-musica", label: "Criador de Música" }`
- `src/components/Footer.tsx` — Add link under Serviços

### 3. Add "Gás de cozinha" category

**File: `src/pages/ControleGastos.tsx`**
- Add `"Gás de cozinha"` to `expenseCategories` array

### 4. Update Footer with required links

**File: `src/components/Footer.tsx`**
- Ensure footer links include: Política de Privacidade (`/privacidade`), Termos de Uso (`/termos`), Sobre o Projeto (`/sobre`), Contato (`/contato`)
- Replace Pix Checkout with Criador de Música in Serviços column

### 5. Privacy, Terms, About, Contact pages

These pages already exist (`Privacy.tsx`, `Terms.tsx`, `About.tsx`, `Contact.tsx`) and routes are already configured in `App.tsx`. No changes needed — they match the requirements.

### Summary of files changed

| File | Action |
|------|--------|
| `src/components/Navbar.tsx` | Remove Pix Checkout, add Criador de Música |
| `src/components/Footer.tsx` | Remove Pix Checkout, add Criador de Música, ensure policy/terms/about/contact links |
| `src/App.tsx` | Remove Pix route, add CriadorMusica route |
| `src/pages/Tools.tsx` | Remove Pix Checkout from tools array |
| `src/pages/ControleGastos.tsx` | Add "Gás de cozinha" category |
| `src/pages/CriadorMusica.tsx` | **New** — Full music lyrics generator page |

