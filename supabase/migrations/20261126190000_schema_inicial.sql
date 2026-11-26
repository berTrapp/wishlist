-- WishList: esquema inicial (fase 2)
-- Cada tabela tem dono (user_id) e o RLS só entrega a cada pessoa as próprias linhas.

-- ---------- Perfis ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  monthly_surplus numeric(12, 2) not null default 1800 check (monthly_surplus >= 0),
  created_at timestamptz not null default now()
);

-- ---------- Desejos ----------
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  short text not null,
  category text not null default 'Outros',
  priority text not null default 'media' check (priority in ('alta', 'media', 'baixa')),
  notes text not null default '',
  shape text not null default 'generic' check (shape in ('headphones', 'camera', 'keyboard', 'chair', 'generic')),
  model_status text not null default 'queued' check (model_status in ('queued', 'generating', 'ready', 'failed')),
  model_url text,
  reserve_pct integer not null default 20 check (reserve_pct between 0 and 100),
  status text not null default 'active' check (status in ('active', 'bought')),
  created_at timestamptz not null default now()
);
create index wishes_user_id_idx on public.wishes (user_id);

-- ---------- Ofertas (o produto em cada loja) ----------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wish_id uuid not null references public.wishes (id) on delete cascade,
  store text not null check (store in ('Amazon', 'Mercado Livre', 'Shopee', 'Magazine Luiza', 'TikTok Shop')),
  url text not null default '',
  card numeric(12, 2) not null check (card >= 0),
  pix numeric(12, 2) not null check (pix >= 0),
  shipping numeric(12, 2) not null default 0 check (shipping >= 0),
  interest_free_installments integer not null default 1 check (interest_free_installments between 1 and 24),
  updated_at timestamptz not null default now(),
  unique (wish_id, store)
);
create index offers_user_id_idx on public.offers (user_id);
create index offers_wish_id_idx on public.offers (wish_id);

-- ---------- Histórico de preço ----------
create table public.price_history (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  offer_id uuid not null references public.offers (id) on delete cascade,
  price numeric(12, 2) not null check (price >= 0),
  recorded_at date not null default current_date
);
create index price_history_user_id_idx on public.price_history (user_id);
create index price_history_offer_idx on public.price_history (offer_id, recorded_at);

-- ---------- Depósitos ----------
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wish_id uuid not null references public.wishes (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  deposited_at date not null default current_date,
  note text
);
create index deposits_user_id_idx on public.deposits (user_id);
create index deposits_wish_id_idx on public.deposits (wish_id);

-- ---------- Alertas ----------
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wish_id uuid not null references public.wishes (id) on delete cascade,
  store text not null,
  old_price numeric(12, 2) not null,
  new_price numeric(12, 2) not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index alerts_user_id_idx on public.alerts (user_id);
create index alerts_wish_id_idx on public.alerts (wish_id);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.offers enable row level security;
alter table public.price_history enable row level security;
alter table public.deposits enable row level security;
alter table public.alerts enable row level security;

create policy "perfil próprio: ler" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "perfil próprio: alterar" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "desejos próprios" on public.wishes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "ofertas próprias" on public.offers for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.wishes w where w.id = wish_id and w.user_id = (select auth.uid())));

create policy "histórico próprio" on public.price_history for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.offers o where o.id = offer_id and o.user_id = (select auth.uid())));

create policy "depósitos próprios" on public.deposits for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.wishes w where w.id = wish_id and w.user_id = (select auth.uid())));

create policy "alertas próprios" on public.alerts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- Perfil criado no cadastro ----------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
