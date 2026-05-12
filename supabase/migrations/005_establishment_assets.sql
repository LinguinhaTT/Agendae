-- ============================================
-- Bucket para logo, capa e portfólio do estabelecimento
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'establishment-assets',
  'establishment-assets',
  true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Qualquer pessoa pode ver as imagens (público)
create policy "establishment_assets_select" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'establishment-assets');

-- Apenas autenticados podem fazer upload
create policy "establishment_assets_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'establishment-assets');

-- Apenas autenticados podem atualizar
create policy "establishment_assets_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'establishment-assets');

-- Apenas autenticados podem deletar
create policy "establishment_assets_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'establishment-assets');
