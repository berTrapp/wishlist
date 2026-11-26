-- Fase 3: extensões para chamadas HTTP e tarefas agendadas, e foto do produto (vem do botão "Salvar na WishList")
create extension if not exists pg_net;
create extension if not exists pg_cron;

alter table public.wishes add column if not exists image_url text check (image_url is null or image_url ~ '^https://');
