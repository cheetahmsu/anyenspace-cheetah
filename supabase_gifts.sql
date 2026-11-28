-- LÀNG YÊN · Quà Giáng sinh 2026: điều ước trên cây thông, kho quà chung (admin và nhà tài trợ), trao quà, trả quà, email nhận quà.
-- Cần chạy supabase_sponsors.sql trước. Dán toàn bộ vào Supabase → SQL Editor → Run. Chạy lại nhiều lần vẫn an toàn.
-- Quy tắc: mỗi email giữ tối đa 1 món quà (đang chờ mở hoặc đã mở). Quà chưa mở trả lại được, rồi nhận quà khác. Quà đã mở (đã gửi email) là chốt.
-- Điều ước riêng tư: chỉ người viết và admin đọc được. Mọi bảng bật RLS, không có policy; truy cập qua hàm security definer.
-- Mùa: treo điều ước đến hết 25/12/2026, trao và nhận quà đến hết 06/01/2027 (giờ Việt Nam).

alter table public.anyen_sponsors add column if not exists booth text;
alter table public.anyen_sponsors drop constraint if exists anyen_sponsors_booth;
alter table public.anyen_sponsors add constraint anyen_sponsors_booth check (booth is null or booth in ('candle','rice'));

create table if not exists public.anyen_gift_stock (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  sponsor_id uuid references public.anyen_sponsors(user_id) on delete set null,
  giver text not null,
  name text not null,
  emoji text not null default '🎁',
  description text,
  redeem text,
  quantity int not null default 0,
  remaining int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anyen_gift_stock_name check (char_length(name) between 1 and 80),
  constraint anyen_gift_stock_emoji check (char_length(emoji) between 1 and 8),
  constraint anyen_gift_stock_desc check (description is null or char_length(description) <= 300),
  constraint anyen_gift_stock_redeem check (redeem is null or char_length(redeem) <= 600),
  constraint anyen_gift_stock_qty check (quantity >= 0 and remaining >= 0 and remaining <= quantity and quantity <= 10000)
);
create table if not exists public.anyen_gift_codes (
  id uuid primary key default gen_random_uuid(),
  stock_id uuid not null references public.anyen_gift_stock(id) on delete cascade,
  code text not null,
  award_id uuid,
  constraint anyen_gift_codes_len check (char_length(code) between 1 and 120)
);
create index if not exists anyen_gift_codes_free on public.anyen_gift_codes (stock_id) where award_id is null;

create table if not exists public.anyen_wishes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  wish text not null,
  topic text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anyen_wishes_len check (char_length(wish) between 1 and 300),
  constraint anyen_wishes_topic check (topic is null or char_length(topic) <= 40),
  constraint anyen_wishes_status check (status in ('pending','approved','declined'))
);

create table if not exists public.anyen_gift_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  stock_id uuid references public.anyen_gift_stock(id) on delete set null,
  source text not null,
  giver text not null,
  gift_name text not null,
  gift_emoji text not null,
  gift_desc text,
  redeem text,
  code text,
  message text,
  status text not null default 'pending',
  created_by uuid,
  created_at timestamptz not null default now(),
  shown_at timestamptz,
  opened_at timestamptz,
  returned_at timestamptz,
  emailed_at timestamptz,
  email_error text,
  constraint anyen_gift_awards_source check (source in ('wish','sponsor')),
  constraint anyen_gift_awards_status check (status in ('pending','opened','returned')),
  constraint anyen_gift_awards_msg check (message is null or char_length(message) <= 300)
);
create unique index if not exists anyen_gift_one_per_email on public.anyen_gift_awards (lower(email)) where status in ('pending','opened');
create index if not exists anyen_gift_awards_user on public.anyen_gift_awards (user_id, created_at desc);

create table if not exists public.anyen_booth_visits (
  booth text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  primary key (booth, user_id),
  constraint anyen_booth_visits_booth check (booth in ('candle','rice'))
);

alter table public.anyen_gift_stock enable row level security;
alter table public.anyen_gift_codes enable row level security;
alter table public.anyen_wishes enable row level security;
alter table public.anyen_gift_awards enable row level security;
alter table public.anyen_booth_visits enable row level security;
revoke all on public.anyen_gift_stock, public.anyen_gift_codes, public.anyen_wishes, public.anyen_gift_awards, public.anyen_booth_visits from anon, authenticated;

-- ---------- tiện ích ----------
create or replace function public.anyen_xmas_wish_open() returns boolean language sql stable set search_path to '' as $$ select now() < timestamptz '2026-12-26 00:00:00+07' $$;
create or replace function public.anyen_xmas_gift_open() returns boolean language sql stable set search_path to '' as $$ select now() < timestamptz '2027-01-07 00:00:00+07' $$;
create or replace function public.anyen_my_email() returns text language sql stable set search_path to ''
as $$ select case when coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then null else nullif(lower(auth.jwt()->>'email'),'') end $$;
create or replace function public.anyen_my_sponsor_id() returns uuid language sql stable security definer set search_path to ''
as $$ select user_id from public.anyen_sponsors where user_id = auth.uid() and status = 'approved' $$;

-- ---------- điều ước (người chơi) ----------
create or replace function public.anyen_my_wish() returns jsonb language sql stable security definer set search_path to ''
as $$ select jsonb_build_object('wish',w.wish,'topic',w.topic,'status',w.status,'updated_at',w.updated_at) from public.anyen_wishes w where w.user_id = auth.uid() $$;

create or replace function public.anyen_save_wish(p_wish text, p_topic text default null) returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_uid uuid := auth.uid(); v_email text := public.anyen_my_email(); v_wish text := left(btrim(coalesce(p_wish,'')),300); v_st text;
begin
 if v_uid is null or v_email is null then raise exception 'Cần đăng nhập bằng email để ông già Noel gửi quà'; end if;
 if not public.anyen_xmas_wish_open() then raise exception 'Mùa treo điều ước đã khép lại'; end if;
 if v_wish = '' then raise exception 'Hãy viết điều ước'; end if;
 select status into v_st from public.anyen_wishes where user_id = v_uid for update;
 if v_st is not null and v_st <> 'pending' then raise exception 'Điều ước đã được ông già Noel đọc rồi'; end if;
 insert into public.anyen_wishes(user_id,email,wish,topic) values (v_uid, v_email, v_wish, left(nullif(btrim(coalesce(p_topic,'')),''),40))
 on conflict (user_id) do update set wish = excluded.wish, topic = excluded.topic, email = excluded.email, updated_at = now();
 return public.anyen_my_wish();
end $$;

-- ---------- kho quà (admin và nhà tài trợ đã duyệt) ----------
create or replace function public.anyen_gift_stock_save(p_id uuid, p_name text, p_emoji text, p_desc text, p_redeem text, p_quantity int, p_codes text default null)
 returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_admin boolean := public.anyen_is_admin(); v_sp uuid := public.anyen_my_sponsor_id(); v_giver text; v_row public.anyen_gift_stock; v_used int; v_q int := greatest(coalesce(p_quantity,0),0); c text; v_n int := 0;
begin
 if not v_admin and v_sp is null then raise exception 'Chỉ admin hoặc nhà tài trợ đã duyệt mới nhập được quà'; end if;
 if p_id is null then
  if v_sp is not null and not v_admin then select org_name into v_giver from public.anyen_sponsors where user_id = v_sp; else v_giver := 'Ông già Noel'; end if;
  insert into public.anyen_gift_stock(created_by,sponsor_id,giver,name,emoji,description,redeem,quantity,remaining)
   values (auth.uid(), case when v_admin then null else v_sp end, v_giver, left(btrim(coalesce(p_name,'')),80), left(coalesce(nullif(btrim(p_emoji),''),'🎁'),8),
     left(nullif(btrim(coalesce(p_desc,'')),''),300), left(nullif(btrim(coalesce(p_redeem,'')),''),600), v_q, v_q) returning * into v_row;
 else
  select * into v_row from public.anyen_gift_stock where id = p_id for update;
  if v_row.id is null then raise exception 'Không tìm thấy món quà'; end if;
  if not v_admin and v_row.created_by <> auth.uid() then raise exception 'Không có quyền sửa món quà này'; end if;
  v_used := v_row.quantity - v_row.remaining;
  if v_q < v_used then raise exception 'Đã trao % món, số lượng không thể nhỏ hơn', v_used; end if;
  update public.anyen_gift_stock set name = left(btrim(coalesce(p_name,'')),80), emoji = left(coalesce(nullif(btrim(p_emoji),''),'🎁'),8),
   description = left(nullif(btrim(coalesce(p_desc,'')),''),300), redeem = left(nullif(btrim(coalesce(p_redeem,'')),''),600),
   quantity = v_q, remaining = v_q - v_used, active = true, updated_at = now() where id = p_id returning * into v_row;
 end if;
 if p_codes is not null then
  for c in select btrim(x) from unnest(string_to_array(p_codes, E'\n')) x loop
   if c <> '' and v_n < 2000 then insert into public.anyen_gift_codes(stock_id, code) values (v_row.id, left(c,120)); v_n := v_n + 1; end if;
  end loop;
 end if;
 return to_jsonb(v_row);
end $$;

create or replace function public.anyen_gift_stock_hide(p_id uuid) returns void language plpgsql security definer set search_path to ''
as $$
begin
 update public.anyen_gift_stock set active = false, updated_at = now() where id = p_id and (public.anyen_is_admin() or created_by = auth.uid());
 if not found then raise exception 'Không có quyền hoặc không tìm thấy món quà'; end if;
end $$;

create or replace function public.anyen_gift_stock_list() returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v_admin boolean := public.anyen_is_admin(); v_sp uuid := public.anyen_my_sponsor_id();
begin
 if not v_admin and v_sp is null then raise exception 'Không có quyền'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'giver',s.giver,'name',s.name,'emoji',s.emoji,'description',s.description,'redeem',s.redeem,
   'quantity',s.quantity,'remaining',s.remaining,'mine',s.created_by = auth.uid(),
   'codes_free',(select count(*) from public.anyen_gift_codes c where c.stock_id = s.id and c.award_id is null)) order by s.created_at)
  from public.anyen_gift_stock s where s.active and (v_admin or s.created_by = auth.uid())),'[]'::jsonb);
end $$;

-- ---------- admin: đọc điều ước ----------
create or replace function public.anyen_admin_list_wishes(p_filter text default 'pending') returns jsonb language plpgsql stable security definer set search_path to ''
as $$
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 return coalesce((select jsonb_agg(x order by x.updated_at) from (
  select w.user_id, w.email, p.display_name, w.wish, w.topic, w.status, w.updated_at,
   (select jsonb_build_object('gift',a.gift_emoji||' '||a.gift_name,'status',a.status,'giver',a.giver) from public.anyen_gift_awards a
     where lower(a.email) = lower(w.email) and a.status in ('pending','opened') limit 1) as holding
  from public.anyen_wishes w left join public.anyen_profiles p on p.id = w.user_id
  where p_filter = 'all' or w.status = p_filter limit 500) x),'[]'::jsonb);
end $$;

create or replace function public.anyen_admin_decline_wish(p_user uuid) returns void language plpgsql security definer set search_path to ''
as $$
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 update public.anyen_wishes set status = 'declined', updated_at = now() where user_id = p_user;
end $$;

-- ---------- nhà tài trợ: người đã tham gia hoạt động ở gian ----------
create or replace function public.anyen_booth_visit(p_booth text) returns boolean language plpgsql security definer set search_path to ''
as $$
begin
 if auth.uid() is null or public.anyen_my_email() is null then return false; end if;
 if p_booth not in ('candle','rice') then return false; end if;
 insert into public.anyen_booth_visits(booth,user_id) values (p_booth, auth.uid()) on conflict do nothing;
 return true;
end $$;

create or replace function public.anyen_sponsor_list_visitors() returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v_booth text; v_admin boolean := public.anyen_is_admin();
begin
 select booth into v_booth from public.anyen_sponsors where user_id = auth.uid() and status = 'approved';
 if v_booth is null and not v_admin then raise exception 'Gian hàng chưa được gắn với tài khoản nhà tài trợ này'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',v.user_id,'booth',v.booth,'name',coalesce(p.display_name,'Người Yên'),'at',v.at,
   'has_gift',exists(select 1 from public.anyen_gift_awards a where a.user_id = v.user_id and a.status in ('pending','opened'))) order by v.at)
  from public.anyen_booth_visits v left join public.anyen_profiles p on p.id = v.user_id
  where (v_booth is not null and v.booth = v_booth) or (v_booth is null and v_admin)),'[]'::jsonb);
end $$;

-- ---------- trao quà ----------
create or replace function public.anyen_award_gift(p_user uuid, p_stock uuid, p_message text default null) returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_admin boolean := public.anyen_is_admin(); v_sp uuid := public.anyen_my_sponsor_id(); s public.anyen_gift_stock; v_email text; v_src text; v_booth text; v_code text; v_cid uuid; v_aid uuid;
begin
 if not public.anyen_xmas_gift_open() then raise exception 'Mùa quà Giáng sinh đã khép lại'; end if;
 select * into s from public.anyen_gift_stock where id = p_stock and active for update;
 if s.id is null then raise exception 'Không tìm thấy món quà'; end if;
 if not v_admin and s.created_by <> auth.uid() then raise exception 'Chỉ trao được quà trong kho của bạn'; end if;
 if s.remaining <= 0 then raise exception 'Món quà này đã hết'; end if;
 select lower(email) into v_email from public.anyen_profiles where id = p_user;
 if v_email is null then select lower(email) into v_email from public.anyen_wishes where user_id = p_user; end if;
 if v_email is null then raise exception 'Người này chưa có email nên chưa nhận quà được'; end if;
 if exists(select 1 from public.anyen_gift_awards where lower(email) = v_email and status in ('pending','opened')) then raise exception 'Email này đang giữ một món quà rồi'; end if;
 if v_admin and exists(select 1 from public.anyen_wishes where user_id = p_user) then v_src := 'wish';
 else
  select booth into v_booth from public.anyen_sponsors where user_id = auth.uid() and status = 'approved';
  if not v_admin and (v_booth is null or not exists(select 1 from public.anyen_booth_visits where user_id = p_user and booth = v_booth)) then raise exception 'Người này chưa tham gia hoạt động ở gian của bạn'; end if;
  v_src := 'sponsor';
 end if;
 select id, code into v_cid, v_code from public.anyen_gift_codes where stock_id = s.id and award_id is null order by id limit 1 for update skip locked;
 insert into public.anyen_gift_awards(user_id,email,stock_id,source,giver,gift_name,gift_emoji,gift_desc,redeem,code,message,created_by)
  values (p_user, v_email, s.id, v_src, s.giver, s.name, s.emoji, s.description, s.redeem, v_code, left(nullif(btrim(coalesce(p_message,'')),''),300), auth.uid()) returning id into v_aid;
 if v_cid is not null then update public.anyen_gift_codes set award_id = v_aid where id = v_cid; end if;
 update public.anyen_gift_stock set remaining = remaining - 1, updated_at = now() where id = s.id;
 if v_src = 'wish' then update public.anyen_wishes set status = 'approved', updated_at = now() where user_id = p_user; end if;
 return jsonb_build_object('award_id',v_aid,'email',v_email);
end $$;

-- ---------- người chơi: quà của mình ----------
create or replace function public.anyen_my_gifts() returns jsonb language sql stable security definer set search_path to ''
as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'giver',a.giver,'name',a.gift_name,'emoji',a.gift_emoji,'description',a.gift_desc,'message',a.message,
   'status',a.status,'source',a.source,'created_at',a.created_at,'shown',a.shown_at is not null,'opened_at',a.opened_at,'emailed',a.emailed_at is not null,
   'redeem',case when a.status = 'opened' then a.redeem end,'code',case when a.status = 'opened' then a.code end) order by a.created_at desc),'[]'::jsonb)
 from public.anyen_gift_awards a where a.user_id = auth.uid() and a.status in ('pending','opened');
$$;

create or replace function public.anyen_gift_mark_shown(p_id uuid) returns void language sql security definer set search_path to ''
as $$ update public.anyen_gift_awards set shown_at = coalesce(shown_at, now()) where id = p_id and user_id = auth.uid() $$;

create or replace function public.anyen_open_gift(p_id uuid) returns jsonb language plpgsql security definer set search_path to ''
as $$
begin
 update public.anyen_gift_awards set status = 'opened', opened_at = now(), shown_at = coalesce(shown_at, now())
  where id = p_id and user_id = auth.uid() and status = 'pending';
 return (select x from jsonb_array_elements(public.anyen_my_gifts()) x where x->>'id' = p_id::text);
end $$;

create or replace function public.anyen_return_gift(p_id uuid) returns boolean language plpgsql security definer set search_path to ''
as $$
declare v_stock uuid;
begin
 update public.anyen_gift_awards set status = 'returned', returned_at = now() where id = p_id and user_id = auth.uid() and status = 'pending' returning stock_id into v_stock;
 if not found then return false; end if;
 update public.anyen_gift_codes set award_id = null where award_id = p_id;
 if v_stock is not null then update public.anyen_gift_stock set remaining = least(quantity, remaining + 1), updated_at = now() where id = v_stock; end if;
 update public.anyen_wishes set status = 'pending', updated_at = now() where user_id = auth.uid() and status = 'approved';
 return true;
end $$;

-- quyền gọi hàm
revoke execute on function public.anyen_xmas_wish_open(), public.anyen_xmas_gift_open(), public.anyen_my_email(), public.anyen_my_sponsor_id(),
 public.anyen_my_wish(), public.anyen_save_wish(text,text), public.anyen_gift_stock_save(uuid,text,text,text,text,int,text), public.anyen_gift_stock_hide(uuid),
 public.anyen_gift_stock_list(), public.anyen_admin_list_wishes(text), public.anyen_admin_decline_wish(uuid), public.anyen_booth_visit(text),
 public.anyen_sponsor_list_visitors(), public.anyen_award_gift(uuid,uuid,text), public.anyen_my_gifts(), public.anyen_gift_mark_shown(uuid),
 public.anyen_open_gift(uuid), public.anyen_return_gift(uuid) from public, anon;
grant execute on function public.anyen_my_wish(), public.anyen_save_wish(text,text), public.anyen_gift_stock_save(uuid,text,text,text,text,int,text), public.anyen_gift_stock_hide(uuid),
 public.anyen_gift_stock_list(), public.anyen_admin_list_wishes(text), public.anyen_admin_decline_wish(uuid), public.anyen_booth_visit(text),
 public.anyen_sponsor_list_visitors(), public.anyen_award_gift(uuid,uuid,text), public.anyen_my_gifts(), public.anyen_gift_mark_shown(uuid),
 public.anyen_open_gift(uuid), public.anyen_return_gift(uuid), public.anyen_xmas_wish_open(), public.anyen_xmas_gift_open(), public.anyen_my_email(), public.anyen_my_sponsor_id() to authenticated;

-- admin gắn gian hàng cho nhà tài trợ (candle: Ann Candle, rice: MsSlim)
create or replace function public.anyen_admin_set_sponsor_booth(p_user uuid, p_booth text) returns void language plpgsql security definer set search_path to ''
as $$
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 update public.anyen_sponsors set booth = nullif(p_booth,''), updated_at = now() where user_id = p_user;
end $$;
revoke execute on function public.anyen_admin_set_sponsor_booth(uuid,text) from public, anon;
grant execute on function public.anyen_admin_set_sponsor_booth(uuid,text) to authenticated;
