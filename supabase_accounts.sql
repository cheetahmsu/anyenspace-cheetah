-- LÀNG YÊN · Tài khoản: khách (đăng nhập ẩn danh), thành viên, nhà trị liệu.
-- Đã áp dụng trên dự án Supabase qua migration "anyen_accounts_profiles". File này để lưu lại.
-- Vai trò lấy từ metadata đăng ký (account_type), chỉ nhận 'member' hoặc 'therapist'; người dùng ẩn danh (khách) không có hồ sơ.
create table if not exists public.anyen_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('member','therapist')),
 display_name text not null check (char_length(display_name) between 1 and 40),
 bio text check (bio is null or char_length(bio) <= 1200),
 specialty text check (specialty is null or char_length(specialty) <= 200),
 prefs jsonb not null default '{}'::jsonb check (pg_column_size(prefs) <= 8192),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.anyen_profiles enable row level security;
revoke all on table public.anyen_profiles from anon, authenticated;

create or replace function public.anyen_handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_role text; v_name text;
begin
 if coalesce(new.is_anonymous,false) then return new; end if;
 v_role := case when new.raw_user_meta_data->>'account_type' = 'therapist' then 'therapist' else 'member' end;
 v_name := left(btrim(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'),''), nullif(split_part(coalesce(new.email,''),'@',1),''), 'Người Yên')),40);
 insert into public.anyen_profiles(id,role,display_name) values (new.id,v_role,v_name) on conflict (id) do nothing;
 return new;
end $$;
revoke all on function public.anyen_handle_new_user() from public, anon, authenticated;
drop trigger if exists anyen_on_auth_user_created on auth.users;
create trigger anyen_on_auth_user_created after insert on auth.users
 for each row execute function public.anyen_handle_new_user();

create or replace function public.anyen_get_my_profile()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v public.anyen_profiles; v_anon boolean := coalesce((auth.jwt()->>'is_anonymous')::boolean,false);
begin
 if v_uid is null then return null; end if;
 if v_anon then return jsonb_build_object('id',v_uid,'role','guest'); end if;
 select * into v from public.anyen_profiles where id=v_uid;
 if v.id is null then return jsonb_build_object('id',v_uid,'role','member','display_name',null,'email',auth.jwt()->>'email'); end if;
 return jsonb_build_object('id',v.id,'role',v.role,'display_name',v.display_name,'bio',v.bio,'specialty',v.specialty,'prefs',v.prefs,'email',auth.jwt()->>'email');
end $$;

create or replace function public.anyen_update_my_profile(p_display_name text, p_bio text default null, p_specialty text default null, p_prefs jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v public.anyen_profiles; v_name text := left(btrim(coalesce(p_display_name,'')),40);
begin
 if v_uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Cần đăng nhập bằng email'; end if;
 if v_name = '' then raise exception 'Tên hiển thị không được trống'; end if;
 select * into v from public.anyen_profiles where id=v_uid for update;
 if v.id is null then raise exception 'Chưa có hồ sơ'; end if;
 update public.anyen_profiles set
  display_name = v_name,
  bio = case when v.role='therapist' then left(nullif(btrim(coalesce(p_bio,'')),''),1200) else bio end,
  specialty = case when v.role='therapist' then left(nullif(btrim(coalesce(p_specialty,'')),''),200) else specialty end,
  prefs = case when p_prefs is not null and jsonb_typeof(p_prefs)='object' then p_prefs else prefs end,
  updated_at = now()
 where id=v_uid;
 return public.anyen_get_my_profile();
end $$;
revoke all on function public.anyen_get_my_profile() from public, anon;
revoke all on function public.anyen_update_my_profile(text,text,text,jsonb) from public, anon;
grant execute on function public.anyen_get_my_profile() to authenticated;
grant execute on function public.anyen_update_my_profile(text,text,text,jsonb) to authenticated;
