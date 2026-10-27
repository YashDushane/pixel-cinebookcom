create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  genre text not null,
  duration_minutes int not null,
  language text not null,
  rating numeric(3,1) not null default 0,
  description text not null default '',
  poster_url text,
  ticket_price int not null default 200,
  status text not null default 'now_showing' check (status in ('now_showing','upcoming')),
  created_at timestamptz not null default now()
);
grant select on public.movies to anon, authenticated;
grant insert, update, delete on public.movies to authenticated;
grant all on public.movies to service_role;
alter table public.movies enable row level security;
create policy "movies public read" on public.movies for select using (true);
create policy "movies admin write" on public.movies for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.theatres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.theatres to anon, authenticated;
grant insert, update, delete on public.theatres to authenticated;
grant all on public.theatres to service_role;
alter table public.theatres enable row level security;
create policy "theatres public read" on public.theatres for select using (true);
create policy "theatres admin write" on public.theatres for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.shows (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  theatre_id uuid not null references public.theatres(id) on delete cascade,
  show_date date not null,
  show_time time not null,
  price int not null default 200,
  created_at timestamptz not null default now()
);
grant select on public.shows to anon, authenticated;
grant insert, update, delete on public.shows to authenticated;
grant all on public.shows to service_role;
alter table public.shows enable row level security;
create policy "shows public read" on public.shows for select using (true);
create policy "shows admin write" on public.shows for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  user_id uuid not null,
  show_id uuid not null references public.shows(id) on delete cascade,
  seats text[] not null,
  total_amount int not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);
grant select on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own bookings read" on public.bookings for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create table public.booked_seats (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  seat_label text not null,
  booking_id uuid references public.bookings(id) on delete cascade,
  unique (show_id, seat_label)
);
grant select on public.booked_seats to anon, authenticated;
grant all on public.booked_seats to service_role;
alter table public.booked_seats enable row level security;
create policy "seats public read" on public.booked_seats for select using (true);

-- Safe booking: runs as one transaction; unique constraint blocks double booking
create or replace function public.book_seats(_show_id uuid, _seats text[])
returns public.bookings language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _price int;
  _ref text;
  _b public.bookings;
  _s text;
begin
  if _uid is null then raise exception 'You must be logged in to book'; end if;
  if _seats is null or array_length(_seats,1) is null then raise exception 'Select at least one seat'; end if;
  if array_length(_seats,1) > 10 then raise exception 'You can book up to 10 seats'; end if;
  foreach _s in array _seats loop
    if _s !~ '^[A-H]([1-9]|1[0-2])$' then raise exception 'Invalid seat %', _s; end if;
  end loop;
  select price into _price from public.shows where id = _show_id;
  if _price is null then raise exception 'Show not found'; end if;
  if exists (select 1 from public.booked_seats where show_id = _show_id and seat_label = any(_seats)) then
    raise exception 'Sorry, one or more seats were just booked. Please choose again.';
  end if;
  _ref := 'CB' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.bookings (reference, user_id, show_id, seats, total_amount)
  values (_ref, _uid, _show_id, _seats, _price * array_length(_seats,1)) returning * into _b;
  insert into public.booked_seats (show_id, seat_label, booking_id)
  select _show_id, unnest(_seats), _b.id;
  return _b;
exception when unique_violation then
  raise exception 'Sorry, one or more seats were just booked. Please choose again.';
end; $$;
revoke execute on function public.book_seats(uuid, text[]) from anon, public;
grant execute on function public.book_seats(uuid, text[]) to authenticated;

insert into public.movies (slug,title,genre,duration_minutes,language,rating,description,ticket_price,status) values
('avatar-way-of-water','Avatar: The Way of Water','Sci-Fi / Adventure',192,'English',7.6,'Jake Sully and his family explore the oceans of Pandora while facing an old threat.',200,'now_showing'),
('avengers-endgame','Avengers: Endgame','Action / Superhero',181,'English',8.4,'The remaining Avengers assemble one last time to undo the damage caused by Thanos.',200,'now_showing'),
('spider-man-no-way-home','Spider-Man: No Way Home','Action / Superhero',148,'English',8.2,'With his identity revealed, Peter Parker asks for help and the multiverse breaks open.',200,'now_showing'),
('interstellar','Interstellar','Sci-Fi / Drama',169,'English',8.7,'A team of explorers travels through a wormhole in space to save humanity.',200,'now_showing'),
('inception','Inception','Sci-Fi / Thriller',148,'English',8.8,'A thief who steals secrets through dreams is given one impossible task: plant an idea.',200,'upcoming'),
('the-batman','The Batman','Action / Crime',176,'English',7.8,'Batman uncovers corruption in Gotham while hunting the mysterious Riddler.',200,'upcoming');

insert into public.theatres (name, location) values
('PVR Phoenix Mall','Pune'),('INOX City Centre','Mumbai'),('Cinepolis Grand','Bengaluru');

insert into public.shows (movie_id, theatre_id, show_date, show_time, price)
select m.id, t.id, current_date + d, tm::time, m.ticket_price
from public.movies m cross join public.theatres t
cross join generate_series(0,6) d
cross join unnest(array['10:00','14:30','19:00','22:15']) tm;

-- some demo "already booked" seats
insert into public.booked_seats (show_id, seat_label)
select s.id, x from public.shows s cross join unnest(array['C5','C6','D7','E3','E4','F9']) x;