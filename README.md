# WishList

Lista de desejos de médio e longo prazo: cada produto aparece em 3D, com o preço comparado entre lojas, as opções de pagamento e quanto ele pesa na sua sobra do mês.

## O que já existe (fase 1)

- **Tela inicial:** linha do tempo em montanhas (cada pico é um produto 3D, na data em que dá para comprar), sobra do mês editável com rosca de reservas, próxima conquista, filtros, cards e alertas de queda de preço.
- **Página do item:** caminho até o produto (depósitos reais + meses simulados, com o 3D no pico), simulador, preço por loja, formas de pagamento com % da sobra, histórico de preço e depósitos.
- **Novo desejo:** formulário manual que já abre a simulação; o modelo 3D entra numa fila e aparece quando fica pronto.
- Dados de exemplo salvos no navegador (`src/data/sample.ts`).

## Botão "Salvar na WishList" (fase 3)

As lojas bloqueiam leitura de páginas vinda de servidores (Amazon 503, Magalu 403, Mercado Livre pede verificação), então a captura roda no navegador da pessoa: um favorito (`src/lib/bookmarklet.ts`) lê nome, foto e preço da página do produto e abre `/salvar` no app. Dali o produto vira um desejo novo ou entra na comparação de um desejo que já existe. Instruções em `/botao`.

`supabase/functions/read-product` fica para a leitura pelas APIs oficiais (Mercado Livre e Shopee), que precisam de credenciais.

## Stack

React 19 + TypeScript + Vite, React Three Fiber (Three.js), React Router. Supabase (Auth, Postgres com RLS, Edge Functions).

## Rodando

```bash
npm install
npm run dev
```

## Próximas fases

1. ~~Base visual com dados de exemplo~~
2. ~~Conta e dados~~: login com e-mail e Google, banco no Supabase, depósitos e simulação salvos
3. Preços: busca automática em Amazon, Mercado Livre, Shopee, Magazine Luiza e TikTok Shop; modelos 3D gerados por produto
4. PWA e vitrine: instalável, notificações, modo demonstração
