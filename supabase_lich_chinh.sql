-- LÀNG YÊN · Lịch hẹn cho Supabase CHÍNH (anyen-space) — gộp sẵn 4 file theo đúng thứ tự: phase1, phase1b, phase1c, phase1d.
-- Dán toàn bộ vào SQL Editor của Supabase chính rồi bấm Run. Chạy lại nhiều lần vẫn an toàn.
-- Sửa lịch thì sửa 4 file gốc rồi gộp lại: tools/gop_sql_lich.sh


-- ================================ supabase_phase1.sql ================================
-- LÀNG YÊN · Giai đoạn 1 (Quy hoạch v2.3) — CHƯA CHẠY trên Supabase chính.
-- Chạy file này trên Supabase thử trước; khi đồng bộ lên anyen.space thì chạy trên Supabase chính.
-- Chạy lại nhiều lần vẫn an toàn (if not exists / create or replace / on conflict).
-- Dựa trên các bảng đã có: anyen_profiles (role, therapist_status, member_status, email), anyen_admins (email, is_root).
--
-- 5 vai trò: Khách (đăng nhập ẩn danh) · Thành viên · Nhà trị liệu (therapist_status='approved') · Admin (anyen_admins) · 02 Admin Gốc (anyen_admins.is_root)
-- Nội dung:
--   1. Khóa 1 hoạt động theo tài khoản + đồng bộ trạng thái:   anyen_active_session, anyen_user_state
--   2. Không gian và sức chứa (Solo · 1+5 · 36):                 anyen_venues
--   3. Khung 30 phút/tuần của Nhà trị liệu, Admin duyệt, Admin Gốc điều phối: anyen_slots, anyen_schedule_log
--   4. Đặt lịch 2 chiều (lời mời / yêu cầu), tối đa 5 khách:     anyen_bookings
--   (Khung chat chung ẩn/hiện đi qua kênh realtime của từng không gian, không lưu bảng.)

-- ===== Hàm phụ: vai trò của người đang gọi =====
create or replace function public.anyen_p1_admin_level()
returns int language sql stable security definer set search_path = '' as $$
  -- 0: không phải admin · 1: Admin · 2: Admin Gốc. Chỉ tính khi email đã xác thực.
  select coalesce((select case when a.is_root then 2 else 1 end
    from public.anyen_admins a join auth.users u on lower(u.email)=lower(a.email)
    where u.id=auth.uid() and u.email_confirmed_at is not null limit 1),0)
$$;
create or replace function public.anyen_p1_is_therapist(p_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.anyen_profiles p where p.id=p_uid and p.role='therapist' and coalesce(p.therapist_status,'approved')='approved')
$$;
create or replace function public.anyen_p1_is_member(p_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users u where u.id=p_uid and not coalesce(u.is_anonymous,false))
     and not exists(select 1 from public.anyen_profiles p where p.id=p_uid and coalesce(p.member_status,'active')='restricted')
$$;
revoke all on function public.anyen_p1_admin_level() from public, anon;
revoke all on function public.anyen_p1_is_therapist(uuid) from public, anon;
revoke all on function public.anyen_p1_is_member(uuid) from public, anon;
grant execute on function public.anyen_p1_admin_level() to authenticated;
grant execute on function public.anyen_p1_is_therapist(uuid) to authenticated;
grant execute on function public.anyen_p1_is_member(uuid) to authenticated;

-- Vai trò tổng hợp cho giao diện: guest | member | therapist | admin | root_admin
create or replace function public.anyen_my_role()
returns text language plpgsql stable security definer set search_path = '' as $$
declare lv int := public.anyen_p1_admin_level();
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then return 'guest'; end if;
  if lv=2 then return 'root_admin'; end if;
  if lv=1 then return 'admin'; end if;
  if public.anyen_p1_is_therapist() then return 'therapist'; end if;
  return 'member';
end $$;
revoke all on function public.anyen_my_role() from public, anon;
grant execute on function public.anyen_my_role() to authenticated;

-- ===== 1. Khóa 1 hoạt động + đồng bộ trạng thái (mỗi tài khoản 1 dòng) =====
create table if not exists public.anyen_active_session (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tab_id text not null check (char_length(tab_id) between 1 and 64),
  device text check (device is null or char_length(device) <= 80),
  claimed_at timestamptz not null default now()
);
create table if not exists public.anyen_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (pg_column_size(state) <= 65536),
  updated_at timestamptz not null default now()
);
alter table public.anyen_active_session enable row level security;
alter table public.anyen_user_state enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='anyen_active_session' and policyname='own_session') then
    create policy own_session on public.anyen_active_session for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='anyen_user_state' and policyname='own_state') then
    create policy own_state on public.anyen_user_state for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
  end if;
end $$;
grant select, insert, update on public.anyen_active_session, public.anyen_user_state to authenticated;

-- ===== 2. Không gian & sức chứa =====
-- tier: solo (1) · group (1 Nhà trị liệu/chủ + 5 khách = 6) · community (36)
create table if not exists public.anyen_venues (
  id text primary key,
  realm text not null check (realm in ('rung_yen','vinh_yen')),
  kind text not null check (kind in ('house','island','home','island_home','cabin','yacht','culture','sea')),
  name text not null,
  tier text not null check (tier in ('solo','group','community')),
  capacity int not null check (capacity between 1 and 36),
  schedulable boolean not null default false,
  sort int not null default 0
);
alter table public.anyen_venues enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='anyen_venues' and policyname='read_venues') then
    create policy read_venues on public.anyen_venues for select to anon, authenticated using (true);
  end if;
end $$;
grant select on public.anyen_venues to anon, authenticated;
insert into public.anyen_venues(id,realm,kind,name,tier,capacity,schedulable,sort) values
  ('xong_huong','rung_yen','house','Nhà Hương · Haromy','group',6,true,1),
  ('nha_hoa_lan','rung_yen','house','Nhà Sắc','group',6,true,2),
  ('xuong_gom','rung_yen','house','Nhà Chạm','group',6,true,3),
  ('quan_tra','rung_yen','house','Nhà Vị','group',6,true,4),
  ('chuong_gio','rung_yen','house','Nhà Thanh','group',6,true,5),
  ('nha_van_hoa','rung_yen','culture','Nhà Văn Hóa','community',36,false,6),
  ('tu_gia','rung_yen','home','Tư Gia','group',6,false,7),
  ('mat_vinh','vinh_yen','sea','Mặt vịnh (đi tàu riêng)','solo',1,false,10),
  ('dao_ngoc_lan','vinh_yen','island','Đảo Ngọc Lan','group',6,false,11),
  ('dao_hang_vong','vinh_yen','island','Đảo Hang Vọng','group',6,false,12),
  ('dao_gio_thom','vinh_yen','island','Đảo Gió Thơm','group',6,false,13),
  ('dao_tinh_tra','vinh_yen','island','Đảo Tĩnh Trà','group',6,false,14),
  ('dao_da_lang','vinh_yen','island','Đảo Đá Lặng','group',6,false,15),
  ('du_thuyen_yen','vinh_yen','yacht','Du thuyền Yên','community',36,false,20),
  ('cabin','vinh_yen','cabin','Cabin phòng riêng','solo',1,false,21),
  ('tu_dao','vinh_yen','island_home','Tư Đảo','group',6,false,22)
on conflict (id) do update set realm=excluded.realm,kind=excluded.kind,name=excluded.name,tier=excluded.tier,capacity=excluded.capacity,schedulable=excluded.schedulable,sort=excluded.sort;

-- ===== 3. Khung 30 phút/tuần =====
-- weekday: 1 = Thứ 2 … 7 = Chủ nhật · start_min: phút trong ngày, bội số của 30 (0 … 1410)
create table if not exists public.anyen_slots (
  id bigint generated always as identity primary key,
  venue_id text not null references public.anyen_venues(id),
  therapist_id uuid not null references auth.users(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_min smallint not null check (start_min between 0 and 1410 and start_min % 30 = 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  note text check (note is null or char_length(note) <= 300),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
-- mỗi khung tại một Nhà/Đảo chỉ có 1 Nhà trị liệu đã duyệt
create unique index if not exists anyen_slots_one_approved on public.anyen_slots(venue_id,weekday,start_min) where status='approved';
-- một Nhà trị liệu không thể ở 2 nơi cùng lúc
create unique index if not exists anyen_slots_therapist_once on public.anyen_slots(therapist_id,weekday,start_min) where status in ('pending','approved');
alter table public.anyen_slots enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='anyen_slots' and policyname='read_approved_or_own') then
    create policy read_approved_or_own on public.anyen_slots for select to authenticated
      using (status='approved' or therapist_id=auth.uid() or public.anyen_p1_admin_level()>0);
  end if;
end $$;
grant select on public.anyen_slots to authenticated;

create table if not exists public.anyen_schedule_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id),
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.anyen_schedule_log enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='anyen_schedule_log' and policyname='admins_read_log') then
    create policy admins_read_log on public.anyen_schedule_log for select to authenticated using (public.anyen_p1_admin_level()>0);
  end if;
end $$;
grant select on public.anyen_schedule_log to authenticated;

-- Nhà trị liệu xin nhiều khung một lúc (ghép 2–3 khung cho ca 60–90 phút)
create or replace function public.anyen_slot_request(p_venue text, p_weekday int, p_starts int[], p_note text default null)
returns setof public.anyen_slots language plpgsql security definer set search_path = '' as $$
declare s int; v public.anyen_slots;
begin
  if not public.anyen_p1_is_therapist() then raise exception 'Chỉ Nhà trị liệu đã được duyệt mới đăng ký khung giờ'; end if;
  if not exists(select 1 from public.anyen_venues where id=p_venue and schedulable) then raise exception 'Nơi này không nhận đăng ký khung giờ'; end if;
  if coalesce(array_length(p_starts,1),0) between 1 and 6 is not true then raise exception 'Chọn từ 1 đến 6 khung 30 phút'; end if;
  foreach s in array p_starts loop
    if exists(select 1 from public.anyen_slots x where x.venue_id=p_venue and x.weekday=p_weekday and x.start_min=s and x.status='approved') then
      raise exception 'Khung %:% đã có Nhà trị liệu khác. Admin Gốc có thể điều phối nếu cần.', s/60, lpad((s%60)::text,2,'0'); end if;
    insert into public.anyen_slots(venue_id,therapist_id,weekday,start_min,note) values (p_venue,auth.uid(),p_weekday,s,left(p_note,300)) returning * into v;
    return next v;
  end loop;
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),'request',jsonb_build_object('venue',p_venue,'weekday',p_weekday,'starts',p_starts));
end $$;

-- Nhà trị liệu hủy khung của mình
create or replace function public.anyen_slot_cancel(p_slot bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.anyen_slots set status='cancelled' where id=p_slot and therapist_id=auth.uid() and status in ('pending','approved');
  if not found then raise exception 'Không hủy được khung này'; end if;
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),'cancel',jsonb_build_object('slot',p_slot));
end $$;

-- Admin duyệt / từ chối. Trùng khung đã duyệt: chỉ Admin Gốc mới được ghi đè (p_force), khung cũ chuyển 'cancelled'.
create or replace function public.anyen_admin_review_slot(p_slot bigint, p_approve boolean, p_force boolean default false)
returns public.anyen_slots language plpgsql security definer set search_path = '' as $$
declare lv int := public.anyen_p1_admin_level(); v public.anyen_slots; other bigint;
begin
  if lv=0 then raise exception 'Chỉ Admin mới duyệt khung giờ'; end if;
  select * into v from public.anyen_slots where id=p_slot for update;
  if v.id is null or v.status<>'pending' then raise exception 'Khung không ở trạng thái chờ duyệt'; end if;
  if p_approve then
    select id into other from public.anyen_slots where venue_id=v.venue_id and weekday=v.weekday and start_min=v.start_min and status='approved' and id<>v.id;
    if other is not null then
      if not (lv=2 and p_force) then raise exception 'Trùng khung đã duyệt (#%). Cần 02 Admin Gốc điều phối.', other; end if;
      update public.anyen_slots set status='cancelled',reviewed_by=auth.uid(),reviewed_at=now() where id=other;
    end if;
    update public.anyen_slots set status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=v.id returning * into v;
  else
    update public.anyen_slots set status='rejected',reviewed_by=auth.uid(),reviewed_at=now() where id=v.id returning * into v;
  end if;
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),case when p_approve then 'approve' else 'reject' end,jsonb_build_object('slot',p_slot,'force',p_force,'replaced',other));
  return v;
end $$;

-- Admin Gốc: dời / hoán đổi khung (sang giờ khác, ngày khác, Nhà/Đảo khác, hoặc giao cho Nhà trị liệu khác)
create or replace function public.anyen_root_move_slot(p_slot bigint, p_venue text default null, p_weekday int default null, p_start int default null, p_therapist uuid default null)
returns public.anyen_slots language plpgsql security definer set search_path = '' as $$
declare v public.anyen_slots; old jsonb;
begin
  if public.anyen_p1_admin_level()<2 then raise exception 'Chỉ 02 Admin Gốc mới dời / hoán đổi khung giờ'; end if;
  select * into v from public.anyen_slots where id=p_slot for update;if v.id is null then raise exception 'Không có khung này'; end if;
  old:=to_jsonb(v);
  if p_therapist is not null and not public.anyen_p1_is_therapist(p_therapist) then raise exception 'Người nhận không phải Nhà trị liệu đã duyệt'; end if;
  update public.anyen_slots set venue_id=coalesce(p_venue,venue_id),weekday=coalesce(p_weekday,weekday),start_min=coalesce(p_start,start_min),
    therapist_id=coalesce(p_therapist,therapist_id),reviewed_by=auth.uid(),reviewed_at=now() where id=p_slot returning * into v;
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),'root_move',jsonb_build_object('before',old,'after',to_jsonb(v)));
  return v;
end $$;

-- ===== 4. Đặt lịch 2 chiều =====
-- direction 'invite': Nhà trị liệu mời khách, khách bấm Đồng ý · 'request': khách xin, Nhà trị liệu bấm Chấp nhận
create table if not exists public.anyen_bookings (
  id bigint generated always as identity primary key,
  slot_id bigint not null references public.anyen_slots(id) on delete cascade,
  session_date date not null,
  guest_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('invite','request')),
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  message text check (message is null or char_length(message) <= 300),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (slot_id, session_date, guest_id)
);
alter table public.anyen_bookings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='anyen_bookings' and policyname='booking_parties') then
    create policy booking_parties on public.anyen_bookings for select to authenticated using (
      guest_id=auth.uid() or exists(select 1 from public.anyen_slots s where s.id=slot_id and s.therapist_id=auth.uid()) or public.anyen_p1_admin_level()>0);
  end if;
end $$;
grant select on public.anyen_bookings to authenticated;

create or replace function public.anyen_p1_check_date(p_slot public.anyen_slots, p_date date)
returns void language plpgsql stable set search_path = '' as $$
begin
  if p_slot.status<>'approved' then raise exception 'Khung giờ chưa được duyệt'; end if;
  if extract(isodow from p_date)<>p_slot.weekday then raise exception 'Ngày đã chọn không đúng thứ của khung giờ'; end if;
  if p_date < (now() at time zone 'Asia/Ho_Chi_Minh')::date then raise exception 'Ngày đã qua'; end if;
end $$;

create or replace function public.anyen_booking_invite(p_slot bigint, p_date date, p_guest uuid, p_message text default null)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare s public.anyen_slots; b public.anyen_bookings;
begin
  select * into s from public.anyen_slots where id=p_slot;
  if s.id is null or s.therapist_id<>auth.uid() then raise exception 'Chỉ Nhà trị liệu của khung này mới gửi lời mời'; end if;
  perform public.anyen_p1_check_date(s,p_date);
  if not public.anyen_p1_is_member(p_guest) then raise exception 'Người được mời cần là thành viên'; end if;
  insert into public.anyen_bookings(slot_id,session_date,guest_id,direction,message,created_by) values (p_slot,p_date,p_guest,'invite',left(p_message,300),auth.uid())
    on conflict (slot_id,session_date,guest_id) do update set status='pending',direction='invite',message=excluded.message,created_at=now(),responded_at=null
    returning * into b;
  return b;
end $$;

create or replace function public.anyen_booking_request(p_slot bigint, p_date date, p_message text default null)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare s public.anyen_slots; b public.anyen_bookings;
begin
  if not public.anyen_p1_is_member() then raise exception 'Cần đăng nhập thành viên để đặt lịch'; end if;
  select * into s from public.anyen_slots where id=p_slot;if s.id is null then raise exception 'Không có khung giờ này'; end if;
  perform public.anyen_p1_check_date(s,p_date);
  insert into public.anyen_bookings(slot_id,session_date,guest_id,direction,message,created_by) values (p_slot,p_date,auth.uid(),'request',left(p_message,300),auth.uid())
    on conflict (slot_id,session_date,guest_id) do update set status='pending',direction='request',message=excluded.message,created_at=now(),responded_at=null
    returning * into b;
  return b;
end $$;

-- Trả lời: lời mời do khách trả lời, yêu cầu do Nhà trị liệu trả lời. Khóa cứng tối đa 5 khách / phiên.
create or replace function public.anyen_booking_respond(p_booking bigint, p_accept boolean)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare b public.anyen_bookings; s public.anyen_slots; n int;
begin
  select * into b from public.anyen_bookings where id=p_booking for update;if b.id is null or b.status<>'pending' then raise exception 'Lịch không còn chờ trả lời'; end if;
  select * into s from public.anyen_slots where id=b.slot_id;
  if (b.direction='invite' and b.guest_id<>auth.uid()) or (b.direction='request' and s.therapist_id<>auth.uid()) then raise exception 'Bạn không có quyền trả lời lịch này'; end if;
  if p_accept then
    perform 1 from public.anyen_slots where id=s.id for update;   -- khóa để đếm chính xác khi nhiều người cùng bấm
    select count(*) into n from public.anyen_bookings where slot_id=b.slot_id and session_date=b.session_date and status='accepted';
    if n>=5 then raise exception 'Phiên đã đủ 5 khách'; end if;
  end if;
  update public.anyen_bookings set status=case when p_accept then 'accepted' else 'declined' end,responded_at=now() where id=b.id returning * into b;
  return b;
end $$;

create or replace function public.anyen_booking_cancel(p_booking bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.anyen_bookings b set status='cancelled',responded_at=now()
   where b.id=p_booking and b.status in ('pending','accepted')
     and (b.guest_id=auth.uid() or exists(select 1 from public.anyen_slots s where s.id=b.slot_id and s.therapist_id=auth.uid()));
  if not found then raise exception 'Không hủy được lịch này'; end if;
end $$;

do $$ declare f text; begin
  foreach f in array array['anyen_slot_request(text,int,int[],text)','anyen_slot_cancel(bigint)','anyen_admin_review_slot(bigint,boolean,boolean)',
    'anyen_root_move_slot(bigint,text,int,int,uuid)','anyen_booking_invite(bigint,date,uuid,text)','anyen_booking_request(bigint,date,text)',
    'anyen_booking_respond(bigint,boolean)','anyen_booking_cancel(bigint)'] loop
    execute 'revoke all on function public.'||f||' from public, anon';
    execute 'grant execute on function public.'||f||' to authenticated';
  end loop;
end $$;
revoke all on function public.anyen_p1_check_date(public.anyen_slots,date) from public, anon, authenticated;

-- ================================ supabase_phase1b.sql ================================
-- LÀNG YÊN · Giai đoạn 1b — chạy SAU supabase_phase1.sql. CHƯA CHẠY trên Supabase chính.
-- Chạy lại nhiều lần vẫn an toàn.
--   1. Chỗ ngồi theo không gian + kênh trò chuyện trực tiếp cho Nhà / Đảo (1+5 = 6) và không gian cộng đồng (36)
--      Kênh: anyen:sp:<id không gian>. Muốn vào kênh phải giữ chỗ qua anyen_space_enter (kiểm tra vai trò, phiên trị liệu, sức chứa).
--      Khung chat đi qua kênh này (broadcast), không lưu tin nhắn.
--   2. Chỉ 02 Admin Gốc được thêm / gỡ Admin và đổi trạng thái Nhà trị liệu.
--   3. Tối ưu: chỉ mục cho khóa ngoại, policy gọi auth.uid() một lần.

-- ===== 1. Chỗ ngồi theo không gian =====
alter table public.anyen_active_session add column if not exists space text;
alter table public.anyen_active_session add column if not exists seen_at timestamptz;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='anyen_active_session_space_chk') then
    alter table public.anyen_active_session add constraint anyen_active_session_space_chk check (space is null or space ~ '^[a-z0-9_]{1,40}$');
  end if;
end $$;
create index if not exists anyen_active_session_space on public.anyen_active_session(space, seen_at) where space is not null;
-- người dùng chỉ được ghi tab/thiết bị; chỗ ngồi chỉ đổi qua hàm (không tự ghi để lách sức chứa)
revoke insert, update on public.anyen_active_session from authenticated;
grant insert (user_id, tab_id, device, claimed_at), update (user_id, tab_id, device, claimed_at) on public.anyen_active_session to authenticated;
-- đổi sang tab / thiết bị khác thì tự trả chỗ
create or replace function public.anyen_p1_tab_changed() returns trigger language plpgsql set search_path = '' as $$
begin if new.tab_id is distinct from old.tab_id then new.space:=null; new.seen_at:=null; end if; return new; end $$;
drop trigger if exists anyen_active_session_tab on public.anyen_active_session;
create trigger anyen_active_session_tab before update of tab_id on public.anyen_active_session for each row execute function public.anyen_p1_tab_changed();

-- khung 30 phút đã duyệt đang diễn ra tại một nơi (giờ Việt Nam)
create or replace function public.anyen_p1_slot_now(p_venue text) returns public.anyen_slots
language sql stable security definer set search_path = '' as $$
  select s.* from public.anyen_slots s,
    lateral (select (now() at time zone 'Asia/Ho_Chi_Minh') t) n
  where s.venue_id=p_venue and s.status='approved'
    and s.weekday=extract(isodow from n.t)::int
    and s.start_min=((extract(hour from n.t)*60+extract(minute from n.t))::int/30)*30
  limit 1
$$;

-- 'ok' hoặc lý do không vào được kênh chung (vẫn trải nghiệm riêng)
create or replace function public.anyen_p1_space_reason(p_venue text, p_uid uuid default auth.uid()) returns text
language plpgsql stable security definer set search_path = '' as $$
declare v public.anyen_venues; s public.anyen_slots;
begin
  select * into v from public.anyen_venues where id=p_venue;
  if v.id is null then return 'unknown'; end if;
  if v.tier='solo' then return 'solo'; end if;
  if not public.anyen_p1_is_member(p_uid) then return 'guest'; end if;
  if v.tier='group' then
    s:=public.anyen_p1_slot_now(p_venue);
    if s.id is not null and s.therapist_id<>p_uid and public.anyen_p1_admin_level()<2
       and not exists(select 1 from public.anyen_bookings b where b.slot_id=s.id and b.guest_id=p_uid and b.status='accepted'
                        and b.session_date=(now() at time zone 'Asia/Ho_Chi_Minh')::date) then
      return 'session';
    end if;
  end if;
  return 'ok';
end $$;

-- Giữ chỗ trong không gian. Trả {ok, reason, count, capacity, topic, session}
create or replace function public.anyen_space_enter(p_venue text, p_tab text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare v public.anyen_venues; r text; n int; s public.anyen_slots; me uuid:=auth.uid();
begin
  if me is null then return jsonb_build_object('ok',false,'reason','auth'); end if;
  select * into v from public.anyen_venues where id=p_venue;
  r:=public.anyen_p1_space_reason(p_venue, me);
  if r<>'ok' then return jsonb_build_object('ok',false,'reason',r,'capacity',v.capacity); end if;
  perform pg_advisory_xact_lock(hashtextextended('anyen:sp:'||p_venue,0));
  select count(*) into n from public.anyen_active_session a where a.space=p_venue and a.user_id<>me and a.seen_at>now()-interval '45 seconds';
  if n>=v.capacity and public.anyen_p1_admin_level()<2 then return jsonb_build_object('ok',false,'reason','full','count',n,'capacity',v.capacity); end if;
  insert into public.anyen_active_session(user_id,tab_id,space,seen_at) values (me,coalesce(left(p_tab,64),'space'),p_venue,now())
    on conflict (user_id) do update set space=excluded.space, seen_at=now();
  s:=public.anyen_p1_slot_now(p_venue);
  return jsonb_build_object('ok',true,'count',n+1,'capacity',v.capacity,'topic','anyen:sp:'||p_venue,'session',s.id,'therapist',s.therapist_id);
end $$;

-- Báo vẫn còn ở đây (gọi ~20 giây/lần); false = đã mất chỗ (bị tab khác chiếm hoặc hết hạn)
create or replace function public.anyen_space_beat(p_venue text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  update public.anyen_active_session set seen_at=now() where user_id=auth.uid() and space=p_venue and seen_at>now()-interval '45 seconds';
  return found;
end $$;

create or replace function public.anyen_space_leave() returns void
language sql volatile security definer set search_path = '' as $$
  update public.anyen_active_session set space=null, seen_at=null where user_id=auth.uid();
$$;

-- Số người đang ở (để hiện trên cửa Nhà / Đảo)
create or replace function public.anyen_space_counts() returns table(space text, n int)
language sql stable security definer set search_path = '' as $$
  select a.space, count(*)::int from public.anyen_active_session a where a.space is not null and a.seen_at>now()-interval '45 seconds' group by a.space
$$;

-- Kênh trực tiếp: chỉ ai đang giữ chỗ trong không gian đó
create or replace function public.anyen_p1_space_seat(p_topic text) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_topic ~ '^anyen:sp:[a-z0-9_]{1,40}$' and exists(
    select 1 from public.anyen_active_session a where a.user_id=auth.uid() and a.space=substring(p_topic from 10) and a.seen_at>now()-interval '2 minutes')
$$;

drop policy if exists anyen_sp_read on realtime.messages;
drop policy if exists anyen_sp_write on realtime.messages;
create policy anyen_sp_read on realtime.messages for select to authenticated
  using (extension in ('presence','broadcast') and public.anyen_p1_space_seat((select realtime.topic())));
create policy anyen_sp_write on realtime.messages for insert to authenticated
  with check (extension in ('presence','broadcast') and public.anyen_p1_space_seat((select realtime.topic())));

revoke all on function public.anyen_p1_tab_changed() from public, anon, authenticated;
revoke all on function public.anyen_p1_slot_now(text) from public, anon, authenticated;
revoke all on function public.anyen_p1_space_reason(text,uuid) from public, anon, authenticated;
revoke all on function public.anyen_space_enter(text,text) from public, anon;
revoke all on function public.anyen_space_beat(text) from public, anon;
revoke all on function public.anyen_space_leave() from public, anon;
revoke all on function public.anyen_space_counts() from public, anon;
revoke all on function public.anyen_p1_space_seat(text) from public, anon;
grant execute on function public.anyen_space_enter(text,text), public.anyen_space_beat(text), public.anyen_space_leave(), public.anyen_space_counts(), public.anyen_p1_space_seat(text) to authenticated;

-- ===== 2. Chỉ 02 Admin Gốc quản lý phân quyền Admin & Nhà trị liệu =====
create or replace function public.anyen_admin_add_admin(p_email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare e text := lower(btrim(coalesce(p_email,'')));
begin
 if not public.anyen_is_root_admin() then raise exception 'Chỉ 02 Admin Gốc mới thêm Admin'; end if;
 if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Email không hợp lệ'; end if;
 insert into public.anyen_admins(email,is_root,added_by) values (e,false,auth.uid()) on conflict (email) do nothing;
 perform public.anyen_admin_log_add('admin_add', e, '{}'::jsonb);
 return public.anyen_admin_list_admins();
end $$;
create or replace function public.anyen_admin_remove_admin(p_email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare e text := lower(btrim(coalesce(p_email,'')));
begin
 if not public.anyen_is_root_admin() then raise exception 'Chỉ 02 Admin Gốc mới gỡ Admin'; end if;
 if exists(select 1 from public.anyen_admins where email=e and is_root) then raise exception 'Không thể gỡ admin gốc'; end if;
 delete from public.anyen_admins where email=e;
 perform public.anyen_admin_log_add('admin_remove', e, '{}'::jsonb);
 return public.anyen_admin_list_admins();
end $$;
create or replace function public.anyen_admin_set_therapist_status(p_user uuid, p_status text, p_reason text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.anyen_profiles;
begin
 if not public.anyen_is_root_admin() then raise exception 'Chỉ 02 Admin Gốc mới duyệt / đổi trạng thái Nhà trị liệu'; end if;
 if p_status not in ('pending','approved','rejected','suspended') then raise exception 'Trạng thái không hợp lệ'; end if;
 select * into v from public.anyen_profiles where id=p_user for update;
 if v.id is null then raise exception 'Không tìm thấy tài khoản'; end if;
 if exists(select 1 from public.anyen_admins a where a.email=v.email and a.is_root) then raise exception 'Không thể đổi trạng thái của admin gốc'; end if;
 update public.anyen_profiles set role='therapist', therapist_status=p_status, status_reason=left(nullif(btrim(coalesce(p_reason,'')),''),500), reviewed_by=auth.uid(), reviewed_at=now(), updated_at=now() where id=p_user;
 perform public.anyen_admin_log_add('therapist_'||p_status, v.email, jsonb_build_object('reason',p_reason,'user',p_user));
 return jsonb_build_object('id',p_user,'therapist_status',p_status);
end $$;

-- ===== 3. Tối ưu =====
create index if not exists anyen_lobby_offerings_owner on public.anyen_lobby_offerings(owner_id);
create index if not exists anyen_meditation_sessions_host on public.anyen_meditation_sessions(host_id);
create index if not exists anyen_private_members_user on public.anyen_private_members(user_id);
create index if not exists anyen_private_rooms_owner on public.anyen_private_rooms(owner_id);
create index if not exists anyen_bookings_guest on public.anyen_bookings(guest_id);
create index if not exists anyen_slots_reviewed_by on public.anyen_slots(reviewed_by);
create index if not exists anyen_bookings_created_by on public.anyen_bookings(created_by);
create index if not exists anyen_schedule_log_actor on public.anyen_schedule_log(actor);

alter policy "anyen bag add own" on public.anyen_bag_items with check (owner = (select auth.uid()));
alter policy "anyen bag read own" on public.anyen_bag_items using (owner = (select auth.uid()));
alter policy "anyen bag remove own" on public.anyen_bag_items using (owner = (select auth.uid()));
alter policy own_session on public.anyen_active_session using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
alter policy own_state on public.anyen_user_state using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
alter policy read_approved_or_own on public.anyen_slots using (status='approved' or therapist_id=(select auth.uid()) or (select public.anyen_p1_admin_level())>0);
alter policy admins_read_log on public.anyen_schedule_log using ((select public.anyen_p1_admin_level())>0);
alter policy booking_parties on public.anyen_bookings using (
  guest_id=(select auth.uid()) or exists(select 1 from public.anyen_slots s where s.id=slot_id and s.therapist_id=(select auth.uid())) or (select public.anyen_p1_admin_level())>0);

notify pgrst, 'reload schema';

-- ================================ supabase_phase1c.sql ================================
-- LÀNG YÊN · Giai đoạn 1c — Healer tự mở lịch (Quy hoạch v3.3, Phần V). Chạy SAU supabase_phase1.sql và supabase_phase1b.sql.
-- CHƯA CHẠY trên Supabase chính. Chạy lại nhiều lần vẫn an toàn.
--   1. Healer tự mở khung 30 phút, có hiệu lực ngay, không cần Admin duyệt. Sửa / hủy được.
--   2. Nhiều phiên chạy song song và tách biệt: mỗi phiên (chuỗi khung 30 phút liền nhau của một Healer tại một Nhà)
--      có session_instance_id riêng và kênh trò chuyện riêng, tối đa 6 người (1 Healer + 5 khách).
--   3. Đặt lịch hai chiều theo phiên: khách xin chỗ, Healer mời theo email. Khóa cứng 5 khách / phiên (giữ từ phase1).
--   4. Vào đúng ca: hàm cho biết phiên sắp tới / đang diễn ra của tài khoản để vào thẳng Nhà đã đăng ký.
-- Giờ tính theo Asia/Ho_Chi_Minh. weekday: 1 = Thứ 2 … 7 = Chủ nhật.

-- ===== 0. Nhà Niệm cũng là một Healing House =====
insert into public.anyen_venues(id,realm,kind,name,tier,capacity,schedulable,sort) values
  ('nha_niem','rung_yen','house','Nhà Niệm','group',6,true,6)
on conflict (id) do update set realm=excluded.realm,kind=excluded.kind,name=excluded.name,tier=excluded.tier,capacity=excluded.capacity,schedulable=excluded.schedulable,sort=excluded.sort;
update public.anyen_venues set sort=7 where id='nha_van_hoa';
update public.anyen_venues set sort=8 where id='tu_gia';

-- ===== 1. Không còn giới hạn "một Healer mỗi khung mỗi Nhà": nhiều phiên song song =====
drop index if exists public.anyen_slots_one_approved;

-- Giờ hiện tại theo Việt Nam: thứ (1–7) và phút trong ngày
create or replace function public.anyen_p1_now_vn(out wd int, out mins int, out d date)
language sql stable set search_path = '' as $$
  select extract(isodow from t)::int, (extract(hour from t)*60+extract(minute from t))::int, t::date
  from (select now() at time zone 'Asia/Ho_Chi_Minh' t) n
$$;

-- Khung đầu của chuỗi khung liền nhau (cùng Healer, cùng Nhà, cùng thứ)
create or replace function public.anyen_p1_run_start(p_slot bigint) returns bigint
language plpgsql stable security definer set search_path = '' as $$
declare s public.anyen_slots; prev bigint;
begin
  select * into s from public.anyen_slots where id=p_slot;
  if s.id is null then return null; end if;
  loop
    select x.id into prev from public.anyen_slots x where x.therapist_id=s.therapist_id and x.venue_id=s.venue_id and x.weekday=s.weekday
      and x.start_min=s.start_min-30 and x.status='approved' limit 1;
    exit when prev is null;
    select * into s from public.anyen_slots where id=prev;prev:=null;
  end loop;
  return s.id;
end $$;

-- Phút kết thúc của chuỗi khung bắt đầu từ p_slot
create or replace function public.anyen_p1_run_end(p_slot bigint) returns int
language plpgsql stable security definer set search_path = '' as $$
declare s public.anyen_slots; e int;
begin
  select * into s from public.anyen_slots where id=p_slot;
  if s.id is null then return null; end if;
  e:=s.start_min+30;
  while exists(select 1 from public.anyen_slots x where x.therapist_id=s.therapist_id and x.venue_id=s.venue_id and x.weekday=s.weekday and x.start_min=e and x.status='approved') loop
    e:=e+30;
  end loop;
  return e;
end $$;

-- Healer mở khung: có hiệu lực ngay (approved). Ghép nhiều khung liền nhau thành một phiên 60–180 phút.
create or replace function public.anyen_slot_request(p_venue text, p_weekday int, p_starts int[], p_note text default null)
returns setof public.anyen_slots language plpgsql security definer set search_path = '' as $$
declare s int; v public.anyen_slots;
begin
  if not public.anyen_p1_is_therapist() then raise exception 'Chỉ Healer đã được xác minh mới mở được khung giờ'; end if;
  if not exists(select 1 from public.anyen_venues where id=p_venue and schedulable) then raise exception 'Nơi này không nhận lịch trị liệu'; end if;
  if p_weekday is null or p_weekday not between 1 and 7 then raise exception 'Chọn thứ trong tuần'; end if;
  if coalesce(array_length(p_starts,1),0) not between 1 and 6 then raise exception 'Chọn từ 1 đến 6 khung 30 phút'; end if;
  foreach s in array p_starts loop
    if s is null or s not between 0 and 1410 or s%30<>0 then raise exception 'Khung giờ không hợp lệ'; end if;
    if exists(select 1 from public.anyen_slots x where x.therapist_id=auth.uid() and x.weekday=p_weekday and x.start_min=s and x.status in ('pending','approved')) then
      raise exception 'Bạn đã có lịch lúc %:% thứ %', s/60, lpad((s%60)::text,2,'0'), case when p_weekday=7 then 'CN' else (p_weekday+1)::text end; end if;
    insert into public.anyen_slots(venue_id,therapist_id,weekday,start_min,status,note,reviewed_at)
      values (p_venue,auth.uid(),p_weekday,s,'approved',left(p_note,300),now()) returning * into v;
    return next v;
  end loop;
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),'open',jsonb_build_object('venue',p_venue,'weekday',p_weekday,'starts',p_starts));
end $$;

-- Healer hủy khung: lịch đã đặt của các ngày sắp tới trên phiên này cũng hủy theo
create or replace function public.anyen_slot_cancel(p_slot bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare r bigint := public.anyen_p1_run_start(p_slot); today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  update public.anyen_slots set status='cancelled' where id=p_slot and therapist_id=auth.uid() and status in ('pending','approved');
  if not found then raise exception 'Không hủy được khung này'; end if;
  update public.anyen_bookings set status='cancelled',responded_at=now() where slot_id in (p_slot,r) and session_date>=today and status in ('pending','accepted');
  insert into public.anyen_schedule_log(actor,action,detail) values (auth.uid(),'cancel',jsonb_build_object('slot',p_slot));
end $$;

-- ===== 2. Phiên song song khi vào không gian =====
-- Phiên đang diễn ra tại p_venue mà p_uid được vào (là Healer, khách đã được nhận, hoặc 02 Admin Gốc chọn phiên đầu tiên)
create or replace function public.anyen_p1_my_run_now(p_venue text, p_uid uuid default auth.uid()) returns bigint
language plpgsql stable security definer set search_path = '' as $$
declare n record; s public.anyen_slots; r bigint;
begin
  select * into n from public.anyen_p1_now_vn();
  for s in select * from public.anyen_slots x where x.venue_id=p_venue and x.status='approved' and x.weekday=n.wd and x.start_min=(n.mins/30)*30 order by x.id loop
    r:=public.anyen_p1_run_start(s.id);
    if s.therapist_id=p_uid then return r; end if;
    if exists(select 1 from public.anyen_bookings b where b.slot_id=r and b.guest_id=p_uid and b.session_date=n.d and b.status='accepted') then return r; end if;
  end loop;
  return null;
end $$;

create or replace function public.anyen_p1_any_run_now(p_venue text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.anyen_slots x, public.anyen_p1_now_vn() n where x.venue_id=p_venue and x.status='approved' and x.weekday=n.wd and x.start_min=(n.mins/30)*30)
$$;

-- Giữ chỗ trong không gian. Trả {ok, reason, count, capacity, topic, session, instance, therapist, ends}
create or replace function public.anyen_space_enter(p_venue text, p_tab text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare v public.anyen_venues; r text; n int; me uuid:=auth.uid(); run bigint; key text; s public.anyen_slots; d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  if me is null then return jsonb_build_object('ok',false,'reason','auth'); end if;
  select * into v from public.anyen_venues where id=p_venue;
  if v.id is null then return jsonb_build_object('ok',false,'reason','unknown'); end if;
  if v.tier='solo' then return jsonb_build_object('ok',false,'reason','solo','capacity',v.capacity); end if;
  if not public.anyen_p1_is_member(me) then return jsonb_build_object('ok',false,'reason','guest','capacity',v.capacity); end if;
  key:=p_venue;
  if v.tier='group' then
    run:=public.anyen_p1_my_run_now(p_venue, me);
    if run is not null then key:=p_venue||'__s'||run;
    elsif public.anyen_p1_any_run_now(p_venue) and public.anyen_p1_admin_level()<2 then
      return jsonb_build_object('ok',false,'reason','session','capacity',v.capacity);
    end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('anyen:sp:'||key,0));
  select count(*) into n from public.anyen_active_session a where a.space=key and a.user_id<>me and a.seen_at>now()-interval '45 seconds';
  if n>=v.capacity and public.anyen_p1_admin_level()<2 then return jsonb_build_object('ok',false,'reason','full','count',n,'capacity',v.capacity); end if;
  insert into public.anyen_active_session(user_id,tab_id,space,seen_at) values (me,coalesce(left(p_tab,64),'space'),key,now())
    on conflict (user_id) do update set space=excluded.space, seen_at=now();
  if run is not null then select * into s from public.anyen_slots where id=run; end if;
  return jsonb_build_object('ok',true,'count',n+1,'capacity',v.capacity,'topic','anyen:sp:'||key,'session',run,
    'instance',case when run is null then null else run||'-'||to_char(d,'YYYYMMDD') end,
    'therapist',s.therapist_id,'ends',case when run is null then null else public.anyen_p1_run_end(run) end);
end $$;

-- Vẫn còn ở đây? false = đã mất chỗ hoặc phiên đã hết giờ (máy khách tự vào lại)
create or replace function public.anyen_space_beat(p_venue text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare sp text; run bigint;
begin
  select a.space into sp from public.anyen_active_session a where a.user_id=auth.uid() and a.seen_at>now()-interval '45 seconds';
  if sp is null or not (sp=p_venue or left(sp,length(p_venue)+3)=p_venue||'__s') then return false; end if;
  if sp<>p_venue then
    run:=public.anyen_p1_my_run_now(p_venue);
    if run is null or sp<>p_venue||'__s'||run then return false; end if;
  elsif public.anyen_p1_any_run_now(p_venue) and public.anyen_p1_my_run_now(p_venue) is not null then
    return false;  -- phiên của mình vừa bắt đầu: vào lại để sang kênh phiên
  end if;
  update public.anyen_active_session set seen_at=now() where user_id=auth.uid();
  return true;
end $$;

-- Số người theo Nhà / Đảo (gộp các phiên)
create or replace function public.anyen_space_counts() returns table(space text, n int)
language sql stable security definer set search_path = '' as $$
  select split_part(a.space,'__s',1), count(*)::int from public.anyen_active_session a where a.space is not null and a.seen_at>now()-interval '45 seconds' group by 1
$$;

-- Kênh trực tiếp: chỉ ai đang giữ chỗ trong không gian / phiên đó
create or replace function public.anyen_p1_space_seat(p_topic text) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_topic ~ '^anyen:sp:[a-z0-9_]{1,48}$' and exists(
    select 1 from public.anyen_active_session a where a.user_id=auth.uid() and a.space=substring(p_topic from 10) and a.seen_at>now()-interval '2 minutes')
$$;
do $$ begin
  if exists (select 1 from pg_constraint where conname='anyen_active_session_space_chk') then
    alter table public.anyen_active_session drop constraint anyen_active_session_space_chk;
  end if;
  alter table public.anyen_active_session add constraint anyen_active_session_space_chk check (space is null or space ~ '^[a-z0-9_]{1,48}$');
end $$;

-- ===== 3. Lịch cho giao diện =====
-- Các phiên đã mở trong p_days ngày tới (mỗi phiên = chuỗi khung liền nhau), kèm số khách đã nhận và trạng thái của mình
create or replace function public.anyen_sched_open(p_days int default 14, p_venue text default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare n record; out jsonb := '[]'::jsonb; s record; dd date; i int; e int; me uuid := auth.uid();
begin
  select * into n from public.anyen_p1_now_vn();
  for s in select x.*, v.name venue_name, p.display_name, p.specialty, p.bio from public.anyen_slots x
      join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=x.therapist_id
      where x.status='approved' and (p_venue is null or x.venue_id=p_venue)
        and not exists(select 1 from public.anyen_slots y where y.therapist_id=x.therapist_id and y.venue_id=x.venue_id and y.weekday=x.weekday and y.start_min=x.start_min-30 and y.status='approved')
  loop
    e:=public.anyen_p1_run_end(s.id);
    for i in 0..least(greatest(coalesce(p_days,14),1),28)-1 loop
      dd:=n.d+i;
      continue when extract(isodow from dd)::int<>s.weekday;
      continue when dd=n.d and e<=n.mins;
      out:=out||jsonb_build_object('slot',s.id,'venue',s.venue_id,'venue_name',s.venue_name,'therapist',s.therapist_id,'therapist_name',coalesce(s.display_name,'Healer'),
        'specialty',s.specialty,'bio',s.bio,'note',s.note,'date',dd,'weekday',s.weekday,'start',s.start_min,'end',e,
        'accepted',(select count(*) from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.status='accepted'),
        'mine',s.therapist_id=me,
        'my_status',(select b.status from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me),
        'my_booking',(select b.id from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me),
        'my_direction',(select b.direction from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me));
    end loop;
  end loop;
  return coalesce((select jsonb_agg(x order by x->>'date', (x->>'start')::int) from jsonb_array_elements(out) x),'[]'::jsonb);
end $$;

-- Lịch của tôi: khung đã mở (nếu là Healer), người đặt theo từng phiên, và lịch tôi đã đặt / được mời
create or replace function public.anyen_my_schedule() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := auth.uid(); today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  if me is null then return jsonb_build_object('role','guest'); end if;
  return jsonb_build_object(
    'role', public.anyen_my_role(),
    'therapist', public.anyen_p1_is_therapist(me),
    'slots', coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'venue',x.venue_id,'venue_name',v.name,'weekday',x.weekday,'start',x.start_min,'note',x.note,'run',public.anyen_p1_run_start(x.id)) order by x.weekday,x.start_min)
      from public.anyen_slots x join public.anyen_venues v on v.id=x.venue_id where x.therapist_id=me and x.status='approved'),'[]'::jsonb),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'slot',b.slot_id,'date',b.session_date,'status',b.status,'direction',b.direction,'message',b.message,
        'guest_name',coalesce(p.display_name,'Thành viên'),'venue_name',v.name,'start',x.start_min,'end',public.anyen_p1_run_end(x.id)) order by b.session_date,x.start_min)
      from public.anyen_bookings b join public.anyen_slots x on x.id=b.slot_id join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=b.guest_id
      where x.therapist_id=me and b.session_date>=today and b.status in ('pending','accepted')),'[]'::jsonb),
    'bookings', coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'slot',b.slot_id,'date',b.session_date,'status',b.status,'direction',b.direction,'message',b.message,
        'venue',x.venue_id,'venue_name',v.name,'therapist_name',coalesce(p.display_name,'Healer'),'start',x.start_min,'end',public.anyen_p1_run_end(x.id)) order by b.session_date,x.start_min)
      from public.anyen_bookings b join public.anyen_slots x on x.id=b.slot_id join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=x.therapist_id
      where b.guest_id=me and b.session_date>=today and b.status in ('pending','accepted')),'[]'::jsonb));
end $$;

-- Healer mời một thành viên bằng email vào một phiên
create or replace function public.anyen_booking_invite_email(p_slot bigint, p_date date, p_email text, p_message text default null)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare g uuid;
begin
  select u.id into g from auth.users u where lower(u.email)=lower(btrim(p_email)) and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) limit 1;
  if g is null then raise exception 'Chưa có thành viên nào dùng email này'; end if;
  if g=auth.uid() then raise exception 'Không tự mời chính mình được'; end if;
  return public.anyen_booking_invite(p_slot,p_date,g,p_message);
end $$;

-- Vào đúng ca: phiên của tôi đang diễn ra hoặc bắt đầu trong 15 phút tới (là Healer hoặc khách đã được nhận)
create or replace function public.anyen_my_next_session() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare n record; me uuid := auth.uid(); r record;
begin
  if me is null then return null; end if;
  select * into n from public.anyen_p1_now_vn();
  for r in
    select x.id, x.venue_id, v.name venue_name, x.start_min, public.anyen_p1_run_end(x.id) end_min, x.therapist_id=me as host
      from public.anyen_slots x join public.anyen_venues v on v.id=x.venue_id
     where x.status='approved' and x.weekday=n.wd
       and public.anyen_p1_run_start(x.id)=x.id
       and (x.therapist_id=me or exists(select 1 from public.anyen_bookings b where b.slot_id=x.id and b.guest_id=me and b.session_date=n.d and b.status='accepted'))
     order by x.start_min
  loop
    if r.start_min-15<=n.mins and n.mins<r.end_min then
      return jsonb_build_object('slot',r.id,'venue',r.venue_id,'venue_name',r.venue_name,'start',r.start_min,'end',r.end_min,'host',r.host,'now',n.mins,
        'guests',(select count(*) from public.anyen_bookings b where b.slot_id=r.id and b.session_date=n.d and b.status='accepted'));
    end if;
  end loop;
  return null;
end $$;

-- ===== Quyền =====
revoke all on function public.anyen_p1_now_vn() from public, anon, authenticated;
revoke all on function public.anyen_p1_run_start(bigint) from public, anon, authenticated;
revoke all on function public.anyen_p1_run_end(bigint) from public, anon, authenticated;
revoke all on function public.anyen_p1_my_run_now(text,uuid) from public, anon, authenticated;
revoke all on function public.anyen_p1_any_run_now(text) from public, anon, authenticated;
do $$ declare f text; begin
  foreach f in array array['anyen_slot_request(text,int,int[],text)','anyen_slot_cancel(bigint)','anyen_space_enter(text,text)','anyen_space_beat(text)',
    'anyen_space_counts()','anyen_p1_space_seat(text)','anyen_sched_open(int,text)','anyen_my_schedule()','anyen_booking_invite_email(bigint,date,text,text)','anyen_my_next_session()'] loop
    execute 'revoke all on function public.'||f||' from public, anon';
    execute 'grant execute on function public.'||f||' to authenticated';
  end loop;
end $$;

-- ================================ supabase_phase1d.sql ================================
-- LÀNG YÊN · Giai đoạn 1d — Lịch hẹn theo Nguyên tắc v3.9 (đợt 1). Chạy SAU supabase_phase1.sql, 1b, 1c.
-- Chạy lại nhiều lần vẫn an toàn.
--   1. Hết hạn: lời mời / đăng ký chưa khớp tự chuyển 'expired' khi phiên bắt đầu.
--   2. Khóa trùng giờ đã khớp: đã khớp một phiên thì không khớp thêm phiên khác chồng giờ (kể cả giờ mình đang dẫn phiên).
--      Muốn đổi, hủy lịch cũ trước. Lời mời vẫn nhận thoải mái, chỉ chặn ở bước Đồng ý.
--   3. Mỗi khung giờ chỉ tự đăng ký (xin tham gia) tối đa 1 phiên.
--   4. Đã khớp rồi thì mời lại / xin lại không làm lịch quay về "chờ".
--   5. Hủy được bất cứ lúc nào trước khi phiên bắt đầu; phiên đã bắt đầu thì chỉ cần rời đi.
--   6. Đảo trị liệu (Healing Island) tạm chưa nhận lịch.
--   7. Lịch của tôi hiện cả lịch đã hủy / bị từ chối / hết hạn từ hôm nay trở đi.
-- Giờ tính theo Asia/Ho_Chi_Minh.

-- ===== 0. Trạng thái 'expired' =====
alter table public.anyen_bookings drop constraint if exists anyen_bookings_status_check;
alter table public.anyen_bookings add constraint anyen_bookings_status_check check (status in ('pending','accepted','declined','cancelled','expired'));
create index if not exists anyen_bookings_guest_date on public.anyen_bookings(guest_id, session_date) where status in ('pending','accepted');

-- ===== 6. Đảo trị liệu tạm chưa có lịch =====
update public.anyen_venues set schedulable=false where kind='island' and schedulable;

-- ===== Hàm phụ =====
-- Phiên (khung p_slot, ngày p_date) đã bắt đầu chưa
create or replace function public.anyen_p1_started(p_slot bigint, p_date date) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select (p_date + make_interval(mins => s.start_min)) <= (now() at time zone 'Asia/Ho_Chi_Minh')
    from public.anyen_slots s where s.id=p_slot), true)
$$;

-- Lời mời / đăng ký chưa khớp mà phiên đã bắt đầu: hết hạn
create or replace function public.anyen_p1_expire() returns void
language sql volatile security definer set search_path = '' as $$
  update public.anyen_bookings b set status='expired', responded_at=now()
   where b.status='pending' and b.session_date <= (now() at time zone 'Asia/Ho_Chi_Minh')::date
     and public.anyen_p1_started(b.slot_id, b.session_date)
$$;

-- Người p_uid đã có lịch đã khớp chồng giờ [p_start, p_end) ngày p_date chưa? Trả mô tả lịch đó, hoặc null.
-- Tính cả: khách đã khớp (accepted) và Healer đang mở khung đúng giờ đó.
create or replace function public.anyen_p1_clash(p_uid uuid, p_date date, p_start int, p_end int, p_except bigint default null) returns text
language plpgsql stable security definer set search_path = '' as $$
declare r record;
begin
  for r in select x.start_min, public.anyen_p1_run_end(x.id) e, v.name
      from public.anyen_bookings b join public.anyen_slots x on x.id=b.slot_id join public.anyen_venues v on v.id=x.venue_id
     where b.guest_id=p_uid and b.session_date=p_date and b.status='accepted' and b.id is distinct from p_except loop
    if r.start_min < p_end and p_start < r.e then
      return r.name||' lúc '||lpad((r.start_min/60)::text,2,'0')||':'||lpad((r.start_min%60)::text,2,'0');
    end if;
  end loop;
  select v.name||' lúc '||lpad((x.start_min/60)::text,2,'0')||':'||lpad((x.start_min%60)::text,2,'0')||' (phiên bạn dẫn)' as name into r
    from public.anyen_slots x join public.anyen_venues v on v.id=x.venue_id
   where x.therapist_id=p_uid and x.status='approved' and x.weekday=extract(isodow from p_date)::int
     and x.start_min < p_end and x.start_min+30 > p_start
   order by x.start_min limit 1;
  if found then return r.name; end if;
  return null;
end $$;

-- ===== Đặt lịch =====
create or replace function public.anyen_booking_invite(p_slot bigint, p_date date, p_guest uuid, p_message text default null)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare s public.anyen_slots; b public.anyen_bookings;
begin
  select * into s from public.anyen_slots where id=p_slot;
  if s.id is null or s.therapist_id<>auth.uid() then raise exception 'Chỉ Healer của khung này mới gửi lời mời'; end if;
  perform public.anyen_p1_check_date(s,p_date);
  if public.anyen_p1_started(p_slot,p_date) then raise exception 'Phiên này đã bắt đầu, không mời thêm được'; end if;
  if p_guest=auth.uid() then raise exception 'Không tự mời chính mình được'; end if;
  if not public.anyen_p1_is_member(p_guest) then raise exception 'Người được mời cần là thành viên'; end if;
  insert into public.anyen_bookings(slot_id,session_date,guest_id,direction,message,created_by) values (p_slot,p_date,p_guest,'invite',left(p_message,300),auth.uid())
    on conflict (slot_id,session_date,guest_id) do update set status='pending',direction='invite',message=excluded.message,created_by=excluded.created_by,created_at=now(),responded_at=null
    where public.anyen_bookings.status<>'accepted'
    returning * into b;
  if b.id is null then raise exception 'Bạn này đã khớp lịch phiên này rồi'; end if;
  return b;
end $$;

create or replace function public.anyen_booking_request(p_slot bigint, p_date date, p_message text default null)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare s public.anyen_slots; b public.anyen_bookings; e int; c text; me uuid := auth.uid();
begin
  if not public.anyen_p1_is_member() then raise exception 'Cần đăng nhập thành viên để đặt lịch'; end if;
  select * into s from public.anyen_slots where id=p_slot;if s.id is null then raise exception 'Không có khung giờ này'; end if;
  perform public.anyen_p1_check_date(s,p_date);
  if public.anyen_p1_started(p_slot,p_date) then raise exception 'Phiên này đã bắt đầu, hẹn bạn phiên sau nhé'; end if;
  if s.therapist_id=me then raise exception 'Đây là phiên bạn dẫn'; end if;
  e:=public.anyen_p1_run_end(s.id);
  c:=public.anyen_p1_clash(me,p_date,s.start_min,e);
  if c is not null then raise exception 'Bạn đã có lịch % cùng giờ. Muốn đổi, hãy hủy lịch đó trước.', c; end if;
  if exists(select 1 from public.anyen_bookings o join public.anyen_slots x on x.id=o.slot_id
      where o.guest_id=me and o.session_date=p_date and o.status='pending' and o.direction='request' and o.slot_id<>p_slot
        and x.start_min < e and s.start_min < public.anyen_p1_run_end(x.id)) then
    raise exception 'Bạn đã xin tham gia một phiên khác cùng giờ. Mỗi khung giờ chỉ xin một phiên, hủy lời xin kia trước nhé.';
  end if;
  insert into public.anyen_bookings(slot_id,session_date,guest_id,direction,message,created_by) values (p_slot,p_date,me,'request',left(p_message,300),me)
    on conflict (slot_id,session_date,guest_id) do update set status='pending',direction='request',message=excluded.message,created_by=excluded.created_by,created_at=now(),responded_at=null
    where public.anyen_bookings.status<>'accepted'
    returning * into b;
  if b.id is null then raise exception 'Bạn đã khớp lịch phiên này rồi'; end if;
  return b;
end $$;

-- Trả lời: lời mời do khách trả lời, yêu cầu do Healer trả lời. Rà soát trước khi khớp: không trùng giờ, tối đa 5 khách.
create or replace function public.anyen_booking_respond(p_booking bigint, p_accept boolean)
returns public.anyen_bookings language plpgsql security definer set search_path = '' as $$
declare b public.anyen_bookings; s public.anyen_slots; n int; c text;
begin
  select * into b from public.anyen_bookings where id=p_booking for update;
  if b.id is null or b.status<>'pending' then raise exception 'Lịch không còn chờ trả lời'; end if;
  select * into s from public.anyen_slots where id=b.slot_id;
  if (b.direction='invite' and b.guest_id<>auth.uid()) or (b.direction='request' and s.therapist_id<>auth.uid()) then raise exception 'Bạn không có quyền trả lời lịch này'; end if;
  if s.status<>'approved' then raise exception 'Healer đã đóng khung giờ này'; end if;
  if public.anyen_p1_started(b.slot_id,b.session_date) then raise exception 'Phiên đã bắt đầu, lời mời này đã hết hạn'; end if;
  if p_accept then
    perform 1 from public.anyen_slots where id=s.id for update;   -- khóa để đếm chính xác khi nhiều người cùng bấm
    perform pg_advisory_xact_lock(hashtextextended('anyen:guest:'||b.guest_id||b.session_date,0));
    c:=public.anyen_p1_clash(b.guest_id,b.session_date,s.start_min,public.anyen_p1_run_end(s.id),b.id);
    if c is not null then
      if b.direction='invite' then raise exception 'Bạn đã có lịch % cùng giờ. Muốn nhận lời này, hãy hủy lịch đó trước.', c;
      else raise exception 'Bạn này đã khớp một phiên khác cùng giờ'; end if;
    end if;
    select count(*) into n from public.anyen_bookings where slot_id=b.slot_id and session_date=b.session_date and status='accepted';
    if n>=5 then raise exception 'Phiên đã đủ 5 khách'; end if;
  end if;
  update public.anyen_bookings set status=case when p_accept then 'accepted' else 'declined' end,responded_at=now() where id=b.id returning * into b;
  return b;
end $$;

-- Hủy: khách hoặc Healer, bất cứ lúc nào trước khi phiên bắt đầu
create or replace function public.anyen_booking_cancel(p_booking bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare b public.anyen_bookings;
begin
  select * into b from public.anyen_bookings x where x.id=p_booking and x.status in ('pending','accepted')
     and (x.guest_id=auth.uid() or exists(select 1 from public.anyen_slots s where s.id=x.slot_id and s.therapist_id=auth.uid())) for update;
  if b.id is null then raise exception 'Không hủy được lịch này'; end if;
  if public.anyen_p1_started(b.slot_id,b.session_date) then raise exception 'Phiên đã bắt đầu. Bạn cứ rời phiên lúc nào cũng được.'; end if;
  update public.anyen_bookings set status='cancelled',responded_at=now() where id=b.id;
end $$;

-- ===== Lịch cho giao diện (thêm: dọn hết hạn, ẩn phiên đã bắt đầu với người ngoài) =====
create or replace function public.anyen_sched_open(p_days int default 14, p_venue text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare n record; out jsonb := '[]'::jsonb; s record; dd date; i int; e int; me uuid := auth.uid();
begin
  perform public.anyen_p1_expire();
  select * into n from public.anyen_p1_now_vn();
  for s in select x.*, v.name venue_name, p.display_name, p.specialty, p.bio from public.anyen_slots x
      join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=x.therapist_id
      where x.status='approved' and (p_venue is null or x.venue_id=p_venue)
        and not exists(select 1 from public.anyen_slots y where y.therapist_id=x.therapist_id and y.venue_id=x.venue_id and y.weekday=x.weekday and y.start_min=x.start_min-30 and y.status='approved')
  loop
    e:=public.anyen_p1_run_end(s.id);
    for i in 0..least(greatest(coalesce(p_days,14),1),28)-1 loop
      dd:=n.d+i;
      continue when extract(isodow from dd)::int<>s.weekday;
      continue when dd=n.d and e<=n.mins;
      continue when dd=n.d and s.start_min<=n.mins and s.therapist_id is distinct from me
        and not exists(select 1 from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me and b.status='accepted');
      out:=out||jsonb_build_object('slot',s.id,'venue',s.venue_id,'venue_name',s.venue_name,'therapist',s.therapist_id,'therapist_name',coalesce(s.display_name,'Healer'),
        'specialty',s.specialty,'bio',s.bio,'note',s.note,'date',dd,'weekday',s.weekday,'start',s.start_min,'end',e,
        'accepted',(select count(*) from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.status='accepted'),
        'mine',s.therapist_id=me,
        'my_status',(select b.status from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me),
        'my_booking',(select b.id from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me),
        'my_direction',(select b.direction from public.anyen_bookings b where b.slot_id=s.id and b.session_date=dd and b.guest_id=me));
    end loop;
  end loop;
  return coalesce((select jsonb_agg(x order by x->>'date', (x->>'start')::int) from jsonb_array_elements(out) x),'[]'::jsonb);
end $$;

create or replace function public.anyen_my_schedule() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare me uuid := auth.uid(); today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  if me is null then return jsonb_build_object('role','guest'); end if;
  perform public.anyen_p1_expire();
  return jsonb_build_object(
    'role', public.anyen_my_role(),
    'therapist', public.anyen_p1_is_therapist(me),
    'slots', coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'venue',x.venue_id,'venue_name',v.name,'weekday',x.weekday,'start',x.start_min,'note',x.note,'run',public.anyen_p1_run_start(x.id)) order by x.weekday,x.start_min)
      from public.anyen_slots x join public.anyen_venues v on v.id=x.venue_id where x.therapist_id=me and x.status='approved'),'[]'::jsonb),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'slot',b.slot_id,'date',b.session_date,'status',b.status,'direction',b.direction,'message',b.message,
        'guest_name',coalesce(p.display_name,'Thành viên'),'venue_name',v.name,'start',x.start_min,'end',public.anyen_p1_run_end(x.id)) order by b.session_date,x.start_min)
      from public.anyen_bookings b join public.anyen_slots x on x.id=b.slot_id join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=b.guest_id
      where x.therapist_id=me and b.session_date>=today and b.status in ('pending','accepted')),'[]'::jsonb),
    'bookings', coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'slot',b.slot_id,'date',b.session_date,'status',b.status,'direction',b.direction,'message',b.message,
        'venue',x.venue_id,'venue_name',v.name,'therapist_name',coalesce(p.display_name,'Healer'),'start',x.start_min,'end',public.anyen_p1_run_end(x.id)) order by b.session_date,x.start_min)
      from public.anyen_bookings b join public.anyen_slots x on x.id=b.slot_id join public.anyen_venues v on v.id=x.venue_id left join public.anyen_profiles p on p.id=x.therapist_id
      where b.guest_id=me and b.session_date>=today),'[]'::jsonb));
end $$;

-- ===== Quyền =====
revoke all on function public.anyen_p1_started(bigint,date) from public, anon, authenticated;
revoke all on function public.anyen_p1_expire() from public, anon, authenticated;
revoke all on function public.anyen_p1_clash(uuid,date,int,int,bigint) from public, anon, authenticated;
do $$ declare f text; begin
  foreach f in array array['anyen_booking_invite(bigint,date,uuid,text)','anyen_booking_request(bigint,date,text)','anyen_booking_respond(bigint,boolean)',
    'anyen_booking_cancel(bigint)','anyen_sched_open(int,text)','anyen_my_schedule()'] loop
    execute 'revoke all on function public.'||f||' from public, anon';
    execute 'grant execute on function public.'||f||' to authenticated';
  end loop;
end $$;

notify pgrst, 'reload schema';
