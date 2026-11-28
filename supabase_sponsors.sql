-- LÀNG YÊN · Nhà tài trợ (sponsor), 28/11/2026
-- Vai trò cộng thêm: thành viên, nhà trị liệu hay admin đều có thể đồng thời là nhà tài trợ.
-- Không đổi bảng anyen_profiles hay các hàm cũ. Bật RLS, không có policy; mọi truy cập qua hàm security definer.
-- Dán toàn bộ vào Supabase → SQL Editor → Run. Chạy lại nhiều lần vẫn an toàn.

create table if not exists public.anyen_sponsors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  org_name text not null,
  website text,
  contact text,
  intro text,
  status text not null default 'pending',
  status_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anyen_sponsors_status check (status in ('pending','approved','rejected','suspended')),
  constraint anyen_sponsors_org check (char_length(org_name) between 1 and 80),
  constraint anyen_sponsors_web check (website is null or (char_length(website) <= 300 and website ~* '^https?://')),
  constraint anyen_sponsors_contact check (contact is null or char_length(contact) <= 200),
  constraint anyen_sponsors_intro check (intro is null or char_length(intro) <= 1200)
);
alter table public.anyen_sponsors enable row level security;
revoke all on public.anyen_sponsors from anon, authenticated;

-- Hồ sơ nhà tài trợ của chính mình (null nếu chưa đăng ký)
create or replace function public.anyen_get_my_sponsor()
 returns jsonb language sql stable security definer set search_path to ''
as $$
 select to_jsonb(s) - 'reviewed_by' from public.anyen_sponsors s where s.user_id = auth.uid();
$$;

-- Đăng ký hoặc cập nhật thông tin nhà tài trợ. Lần đầu hoặc sau khi bị từ chối: chờ duyệt. Đang duyệt hoặc đã duyệt: chỉ cập nhật thông tin.
create or replace function public.anyen_apply_sponsor(p_org text, p_website text default null, p_contact text default null, p_intro text default null)
 returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_uid uuid := auth.uid(); v_org text := left(btrim(coalesce(p_org,'')),80);
 v_web text := nullif(btrim(coalesce(p_website,'')),''); v_ms text; v_cur text;
begin
 if v_uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Cần đăng nhập bằng email'; end if;
 if v_org = '' then raise exception 'Hãy nhập tên đơn vị hoặc thương hiệu'; end if;
 if v_web is not null and v_web !~* '^https?://' then v_web := 'https://' || v_web; end if;
 select member_status into v_ms from public.anyen_profiles where id = v_uid;
 if v_ms = 'restricted' then raise exception 'Tài khoản đang bị hạn chế'; end if;
 select status into v_cur from public.anyen_sponsors where user_id = v_uid for update;
 if v_cur = 'suspended' then raise exception 'Quyền nhà tài trợ đang tạm khoá, hãy liên hệ quản trị viên'; end if;
 insert into public.anyen_sponsors as s (user_id,email,org_name,website,contact,intro,status)
  values (v_uid, lower(auth.jwt()->>'email'), v_org, left(v_web,300), left(nullif(btrim(coalesce(p_contact,'')),''),200), left(nullif(btrim(coalesce(p_intro,'')),''),1200), 'pending')
 on conflict (user_id) do update set
  email = excluded.email, org_name = excluded.org_name, website = excluded.website, contact = excluded.contact, intro = excluded.intro,
  status = case when s.status = 'rejected' then 'pending' else s.status end,
  status_reason = case when s.status = 'rejected' then null else s.status_reason end,
  updated_at = now();
 return public.anyen_get_my_sponsor();
end $$;

-- Admin: danh sách nhà tài trợ (kèm vai trò khác của tài khoản đó)
create or replace function public.anyen_admin_list_sponsors(p_filter text default 'all')
 returns jsonb language plpgsql stable security definer set search_path to ''
as $$
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 return coalesce((select jsonb_agg(x order by (x.status='pending') desc, x.updated_at desc) from (
  select s.user_id, coalesce(p.email,s.email) as email, p.display_name, s.org_name, s.website, s.contact, s.intro, s.status, s.status_reason,
   s.created_at, s.updated_at, coalesce(p.therapist_status,'none') as therapist_status,
   exists(select 1 from public.anyen_admins a where a.email = coalesce(p.email,s.email)) as is_admin_email
  from public.anyen_sponsors s left join public.anyen_profiles p on p.id = s.user_id
  where p_filter = 'all' or s.status = p_filter
  limit 300) x),'[]'::jsonb);
end $$;

-- Admin: duyệt, từ chối, tạm khoá hoặc mở lại nhà tài trợ
create or replace function public.anyen_admin_set_sponsor_status(p_user uuid, p_status text, p_reason text default null)
 returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_email text;
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 if p_status not in ('pending','approved','rejected','suspended') then raise exception 'Trạng thái không hợp lệ'; end if;
 update public.anyen_sponsors set status = p_status,
  status_reason = case when p_status in ('rejected','suspended') then left(nullif(btrim(coalesce(p_reason,'')),''),500) else null end,
  reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
 where user_id = p_user returning email into v_email;
 if not found then raise exception 'Không tìm thấy nhà tài trợ'; end if;
 perform public.anyen_admin_log_add('sponsor_'||p_status, v_email, jsonb_build_object('reason',p_reason,'user',p_user));
 return jsonb_build_object('user_id',p_user,'status',p_status);
end $$;

-- Admin: cấp quyền nhà tài trợ trực tiếp cho một tài khoản đã đăng ký (kể cả admin, nhà trị liệu)
create or replace function public.anyen_admin_grant_sponsor(p_email text, p_org text)
 returns jsonb language plpgsql security definer set search_path to ''
as $$
declare e text := lower(btrim(coalesce(p_email,''))); v_org text := left(btrim(coalesce(p_org,'')),80); v_uid uuid;
begin
 if not public.anyen_is_admin() then raise exception 'Không có quyền'; end if;
 if v_org = '' then raise exception 'Hãy nhập tên đơn vị hoặc thương hiệu'; end if;
 select id into v_uid from public.anyen_profiles where email = e;
 if v_uid is null then raise exception 'Email này chưa đăng ký tài khoản Làng Yên'; end if;
 insert into public.anyen_sponsors(user_id,email,org_name,status,reviewed_by,reviewed_at)
  values (v_uid, e, v_org, 'approved', auth.uid(), now())
 on conflict (user_id) do update set org_name = excluded.org_name, status = 'approved', status_reason = null,
  reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now();
 perform public.anyen_admin_log_add('sponsor_grant', e, jsonb_build_object('org',v_org,'user',v_uid));
 return jsonb_build_object('user_id',v_uid,'status','approved');
end $$;

-- Công khai: nhà tài trợ đã duyệt (cho khu "Bạn đồng hành" trên trang chính). Chỉ tên và trang web, không có email.
create or replace function public.anyen_list_sponsors()
 returns jsonb language sql stable security definer set search_path to ''
as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',s.user_id,'name',s.org_name,'website',s.website) order by s.reviewed_at nulls last, s.created_at),'[]'::jsonb)
 from public.anyen_sponsors s where s.status = 'approved';
$$;

revoke execute on function public.anyen_get_my_sponsor(), public.anyen_apply_sponsor(text,text,text,text),
 public.anyen_admin_list_sponsors(text), public.anyen_admin_set_sponsor_status(uuid,text,text),
 public.anyen_admin_grant_sponsor(text,text), public.anyen_list_sponsors() from public, anon;
grant execute on function public.anyen_get_my_sponsor(), public.anyen_apply_sponsor(text,text,text,text),
 public.anyen_admin_list_sponsors(text), public.anyen_admin_set_sponsor_status(uuid,text,text),
 public.anyen_admin_grant_sponsor(text,text) to authenticated;
grant execute on function public.anyen_list_sponsors() to anon, authenticated;
