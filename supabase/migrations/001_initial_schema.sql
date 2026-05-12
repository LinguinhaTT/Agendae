-- ============================================
-- EXTENSÕES
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

-- ============================================
-- PROFILES (extende auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  birth_date date,
  document text,
  gender text check (gender in ('male','female','other','prefer_not_to_say')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ESTABLISHMENTS
-- ============================================
create table public.establishments (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  logo_url text,
  cover_url text,
  primary_color text default '#0f172a',
  email text,
  phone text,
  whatsapp text,
  instagram text,
  website text,
  address_zip text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_country text default 'BR',
  latitude numeric(10,7),
  longitude numeric(10,7),
  booking_advance_min_hours int default 1,
  booking_advance_max_days int default 60,
  cancellation_hours_before int default 24,
  require_deposit boolean default false,
  deposit_percentage int default 30,
  auto_confirm boolean default true,
  buffer_minutes int default 0,
  owner_id uuid not null references public.profiles(id),
  plan text default 'free',
  plan_status text default 'active',
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.establishments(slug);
create index on public.establishments(owner_id);

-- ============================================
-- ESTABLISHMENT MEMBERS
-- ============================================
create table public.establishment_members (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','professional','staff')),
  display_name text not null,
  bio text,
  specialties text[],
  commission_percentage int default 0,
  is_active boolean default true,
  is_visible_public boolean default true,
  position int default 0,
  created_at timestamptz default now(),
  unique(establishment_id, user_id)
);

create index on public.establishment_members(establishment_id);
create index on public.establishment_members(user_id);

-- ============================================
-- SERVICES
-- ============================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  description text,
  category text,
  duration_minutes int not null,
  price_cents int not null,
  image_url text,
  is_active boolean default true,
  requires_consultation boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

create index on public.services(establishment_id);

-- ============================================
-- PROFESSIONAL SERVICES
-- ============================================
create table public.professional_services (
  professional_id uuid not null references public.establishment_members(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  custom_price_cents int,
  custom_duration_minutes int,
  primary key (professional_id, service_id)
);

-- ============================================
-- AVAILABILITY RULES
-- ============================================
create table public.availability_rules (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.establishment_members(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  check (end_time > start_time)
);

create index on public.availability_rules(professional_id);

-- ============================================
-- TIME OFF
-- ============================================
create table public.time_off (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.establishment_members(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz default now(),
  check (ends_at > starts_at)
);

create index on public.time_off(professional_id, starts_at, ends_at);

-- ============================================
-- APPOINTMENTS
-- ============================================
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  professional_id uuid not null references public.establishment_members(id),
  service_id uuid not null references public.services(id),
  client_id uuid references public.profiles(id),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  client_notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  service_name_snapshot text not null,
  price_cents_snapshot int not null,
  duration_minutes_snapshot int not null,
  status text not null default 'pending' check (status in (
    'pending','confirmed','cancelled','no_show','completed','rescheduled'
  )),
  cancellation_reason text,
  cancelled_by uuid references public.profiles(id),
  payment_status text default 'not_required' check (payment_status in (
    'not_required','pending','paid','refunded','failed'
  )),
  deposit_cents int default 0,
  payment_provider text,
  payment_intent_id text,
  source text default 'web',
  reminded_24h boolean default false,
  reminded_2h boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.appointments(establishment_id, starts_at);
create index on public.appointments(professional_id, starts_at);
create index on public.appointments(client_id);
create index on public.appointments(status);

alter table public.appointments
  add constraint no_double_booking
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending','confirmed'));

-- ============================================
-- APPOINTMENT STATUS HISTORY
-- ============================================
create table public.appointment_status_history (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  reason text,
  changed_at timestamptz default now()
);

-- ============================================
-- REVIEWS
-- ============================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  professional_id uuid not null references public.establishment_members(id),
  client_id uuid references public.profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  is_public boolean default true,
  owner_response text,
  owner_responded_at timestamptz,
  created_at timestamptz default now(),
  unique(appointment_id)
);

create index on public.reviews(establishment_id, rating);
create index on public.reviews(professional_id);

-- ============================================
-- PORTFOLIO ITEMS
-- ============================================
create table public.portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  professional_id uuid references public.establishment_members(id) on delete set null,
  image_url text not null,
  thumbnail_url text,
  title text,
  description text,
  tags text[],
  is_featured boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

create index on public.portfolio_items(establishment_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index on public.notifications(user_id, read_at, created_at desc);

-- ============================================
-- PUSH SUBSCRIPTIONS
-- ============================================
create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

create index on public.push_subscriptions(user_id);

-- ============================================
-- NOTIFICATION QUEUE
-- ============================================
create table public.notification_queue (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  user_id uuid references public.profiles(id),
  channel text not null check (channel in ('email','sms','whatsapp','push')),
  type text not null,
  payload jsonb not null,
  scheduled_for timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  created_at timestamptz default now(),
  unique(appointment_id, channel, type)
);

create index on public.notification_queue(scheduled_for) where processed_at is null;

-- ============================================
-- AUDIT LOGS
-- ============================================
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid references public.establishments(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

create index on public.audit_logs(establishment_id, created_at desc);

-- ============================================
-- HELPER FUNCTION
-- ============================================
create or replace function public.user_establishments(user_uuid uuid)
returns setof uuid
language sql
security definer
stable
as $$
  select establishment_id
  from public.establishment_members
  where user_id = user_uuid and is_active = true;
$$;

-- ============================================
-- TRIGGER: auto-insert profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TRIGGER: updated_at auto-update
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_establishments
  before update on public.establishments
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_appointments
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();
