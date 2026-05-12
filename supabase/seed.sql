-- Seed data for development
-- Run after migrations

-- NOTE: In Supabase local, auth users must be created via the dashboard or API.
-- This seed creates establishments and services assuming users already exist.
-- Replace UUIDs below with actual user IDs from your local Supabase auth.

-- Example seed (commented out — fill real IDs before running):
/*
insert into public.profiles (id, full_name, email, phone) values
  ('00000000-0000-0000-0000-000000000001', 'João Dono', 'joao@inkstudio.com', '+5511999990001'),
  ('00000000-0000-0000-0000-000000000002', 'Ana Tatuadora', 'ana@inkstudio.com', '+5511999990002'),
  ('00000000-0000-0000-0000-000000000003', 'Carlos Barbeiro', 'carlos@example.com', '+5511999990003');

insert into public.establishments (id, slug, name, category, owner_id, address_city, address_state, plan) values
  (
    'aaa00000-0000-0000-0000-000000000001',
    'ink-studio-sp',
    'Ink Studio SP',
    'tattoo',
    '00000000-0000-0000-0000-000000000001',
    'São Paulo',
    'SP',
    'pro'
  );

insert into public.establishment_members (establishment_id, user_id, role, display_name, specialties) values
  ('aaa00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'João', array['gestão']),
  ('aaa00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'professional', 'Ana', array['blackwork','fineline','realismo']);

insert into public.services (establishment_id, name, duration_minutes, price_cents, category) values
  ('aaa00000-0000-0000-0000-000000000001', 'Tatuagem Pequena (até 5cm)', 60, 15000, 'tattoo_small'),
  ('aaa00000-0000-0000-0000-000000000001', 'Tatuagem Média (5-15cm)', 180, 35000, 'tattoo_medium'),
  ('aaa00000-0000-0000-0000-000000000001', 'Sessão de Tatuagem (3h)', 180, 50000, 'tattoo_session'),
  ('aaa00000-0000-0000-0000-000000000001', 'Tatuagem Grande (acima 15cm)', 300, 80000, 'tattoo_large'),
  ('aaa00000-0000-0000-0000-000000000001', 'Consultoria de Arte', 30, 0, 'consultation');
*/
