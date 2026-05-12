-- ============================================
-- FIX: RLS policies para time_off e professional_services
-- ============================================

-- time_off: restringir insert/update/delete ao owner do estabelecimento
drop policy if exists "time_off_insert" on public.time_off;
drop policy if exists "time_off_update" on public.time_off;
drop policy if exists "time_off_delete" on public.time_off;

create policy "time_off_insert" on public.time_off
  for insert to authenticated
  with check (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
      or em.user_id = auth.uid()
    )
  );

create policy "time_off_update" on public.time_off
  for update to authenticated
  using (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
    )
  );

create policy "time_off_delete" on public.time_off
  for delete to authenticated
  using (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
    )
  );

-- professional_services: restringir ao owner do estabelecimento
drop policy if exists "professional_services_select" on public.professional_services;
drop policy if exists "professional_services_insert" on public.professional_services;
drop policy if exists "professional_services_update" on public.professional_services;
drop policy if exists "professional_services_delete" on public.professional_services;

create policy "professional_services_select" on public.professional_services
  for select to anon, authenticated
  using (true);

create policy "professional_services_insert" on public.professional_services
  for insert to authenticated
  with check (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
    )
  );

create policy "professional_services_update" on public.professional_services
  for update to authenticated
  using (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
    )
  );

create policy "professional_services_delete" on public.professional_services
  for delete to authenticated
  using (
    professional_id in (
      select em.id from public.establishment_members em
      join public.establishments e on e.id = em.establishment_id
      where e.owner_id = auth.uid()
    )
  );

-- ============================================
-- Índices de performance faltando
-- ============================================
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_prof_status_idx on public.appointments(professional_id, status);
create index if not exists appointments_est_status_idx on public.appointments(establishment_id, status);
