-- ============================================
-- ROW LEVEL SECURITY — POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.establishment_members enable row level security;
alter table public.services enable row level security;
alter table public.professional_services enable row level security;
alter table public.availability_rules enable row level security;
alter table public.time_off enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_queue enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================
-- PROFILES
-- ============================================
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================
-- ESTABLISHMENTS
-- ============================================
create policy "establishments_select_public" on public.establishments
  for select to anon, authenticated
  using (true);

create policy "establishments_insert_authenticated" on public.establishments
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "establishments_update_owner" on public.establishments
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "establishments_delete_owner" on public.establishments
  for delete to authenticated
  using (owner_id = auth.uid());

-- ============================================
-- ESTABLISHMENT MEMBERS
-- ============================================
create policy "members_select_public" on public.establishment_members
  for select to anon, authenticated
  using (is_visible_public = true or
    establishment_id in (select public.user_establishments(auth.uid()))
  );

create policy "members_insert_owner" on public.establishment_members
  for insert to authenticated
  with check (
    establishment_id in (
      select id from public.establishments where owner_id = auth.uid()
    )
  );

create policy "members_update_owner" on public.establishment_members
  for update to authenticated
  using (
    establishment_id in (
      select id from public.establishments where owner_id = auth.uid()
    )
  );

create policy "members_delete_owner" on public.establishment_members
  for delete to authenticated
  using (
    establishment_id in (
      select id from public.establishments where owner_id = auth.uid()
    )
  );

-- ============================================
-- SERVICES
-- ============================================
create policy "services_select_public" on public.services
  for select to anon, authenticated
  using (is_active = true or
    establishment_id in (select public.user_establishments(auth.uid()))
  );

create policy "services_insert_members" on public.services
  for insert to authenticated
  with check (establishment_id in (select public.user_establishments(auth.uid())));

create policy "services_update_members" on public.services
  for update to authenticated
  using (establishment_id in (select public.user_establishments(auth.uid())));

create policy "services_delete_members" on public.services
  for delete to authenticated
  using (establishment_id in (select public.user_establishments(auth.uid())));

-- ============================================
-- PROFESSIONAL SERVICES
-- ============================================
create policy "professional_services_select" on public.professional_services
  for select to anon, authenticated
  using (true);

create policy "professional_services_insert" on public.professional_services
  for insert to authenticated
  with check (true);

create policy "professional_services_update" on public.professional_services
  for update to authenticated
  using (true);

create policy "professional_services_delete" on public.professional_services
  for delete to authenticated
  using (true);

-- ============================================
-- AVAILABILITY RULES
-- ============================================
create policy "availability_rules_select" on public.availability_rules
  for select to anon, authenticated
  using (true);

create policy "availability_rules_insert" on public.availability_rules
  for insert to authenticated
  with check (
    professional_id in (
      select id from public.establishment_members
      where user_id = auth.uid() or
        establishment_id in (select id from public.establishments where owner_id = auth.uid())
    )
  );

create policy "availability_rules_update" on public.availability_rules
  for update to authenticated
  using (
    professional_id in (
      select id from public.establishment_members
      where user_id = auth.uid() or
        establishment_id in (select id from public.establishments where owner_id = auth.uid())
    )
  );

create policy "availability_rules_delete" on public.availability_rules
  for delete to authenticated
  using (
    professional_id in (
      select id from public.establishment_members
      where user_id = auth.uid() or
        establishment_id in (select id from public.establishments where owner_id = auth.uid())
    )
  );

-- ============================================
-- TIME OFF
-- ============================================
create policy "time_off_select" on public.time_off
  for select to anon, authenticated
  using (true);

create policy "time_off_insert" on public.time_off
  for insert to authenticated
  with check (true);

create policy "time_off_update" on public.time_off
  for update to authenticated
  using (true);

create policy "time_off_delete" on public.time_off
  for delete to authenticated
  using (true);

-- ============================================
-- APPOINTMENTS
-- ============================================
create policy "appointments_select_members" on public.appointments
  for select to authenticated
  using (
    establishment_id in (select public.user_establishments(auth.uid()))
    or client_id = auth.uid()
  );

create policy "appointments_insert_anyone" on public.appointments
  for insert to anon, authenticated
  with check (true);

create policy "appointments_update_members" on public.appointments
  for update to authenticated
  using (establishment_id in (select public.user_establishments(auth.uid())))
  with check (establishment_id in (select public.user_establishments(auth.uid())));

-- ============================================
-- REVIEWS
-- ============================================
create policy "reviews_select_public" on public.reviews
  for select to anon, authenticated
  using (is_public = true or
    establishment_id in (select public.user_establishments(auth.uid()))
  );

create policy "reviews_insert_client" on public.reviews
  for insert to authenticated
  with check (client_id = auth.uid());

create policy "reviews_update_owner" on public.reviews
  for update to authenticated
  using (
    establishment_id in (
      select id from public.establishments where owner_id = auth.uid()
    )
  );

-- ============================================
-- PORTFOLIO ITEMS
-- ============================================
create policy "portfolio_select_public" on public.portfolio_items
  for select to anon, authenticated
  using (true);

create policy "portfolio_insert_members" on public.portfolio_items
  for insert to authenticated
  with check (establishment_id in (select public.user_establishments(auth.uid())));

create policy "portfolio_update_members" on public.portfolio_items
  for update to authenticated
  using (establishment_id in (select public.user_establishments(auth.uid())));

create policy "portfolio_delete_members" on public.portfolio_items
  for delete to authenticated
  using (establishment_id in (select public.user_establishments(auth.uid())));

-- ============================================
-- NOTIFICATIONS
-- ============================================
create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = auth.uid());

-- ============================================
-- PUSH SUBSCRIPTIONS
-- ============================================
create policy "push_select_own" on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

create policy "push_insert_own" on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "push_delete_own" on public.push_subscriptions
  for delete to authenticated
  using (user_id = auth.uid());

-- ============================================
-- APPOINTMENT STATUS HISTORY
-- ============================================
create policy "history_select_members" on public.appointment_status_history
  for select to authenticated
  using (
    appointment_id in (
      select id from public.appointments
      where establishment_id in (select public.user_establishments(auth.uid()))
      or client_id = auth.uid()
    )
  );

-- notification_queue and audit_logs: service role only (no public policies)
