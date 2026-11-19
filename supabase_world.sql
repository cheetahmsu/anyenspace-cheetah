-- LÀNG YÊN · Cơ sở dữ liệu thế giới 3D dùng chung (4 lớp).
-- Lớp 1 thiên nhiên · Lớp 2 kiến trúc · Lớp 3 cảnh vật · Lớp 4 người của làng.
-- Bảng khoá bằng RLS, không có policy: chỉ đọc được qua RPC anyen_get_world_map.
create table if not exists public.anyen_world_maps (
 id text primary key,
 name text not null,
 kind text not null check (kind in ('forest','bay')),
 status text not null default 'draft' check (status in ('live','draft')),
 sky_color text not null,
 fog_color text not null,
 fog_density numeric not null check (fog_density >= 0),
 ground_color text not null,
 hemi_sky text not null,
 hemi_ground text not null,
 hemi_intensity numeric not null,
 sun_color text not null,
 sun_intensity numeric not null,
 sun_position jsonb not null,
 ambience text,
 spawn jsonb not null,
 bounds jsonb not null,
 updated_at timestamptz not null default now()
);
-- Lớp 1: yếu tố thiên nhiên (cây, đá, mặt nước...). params phụ thuộc kind.
create table if not exists public.anyen_world_nature (
 id text primary key,
 map_id text not null references public.anyen_world_maps(id) on delete cascade,
 kind text not null,
 params jsonb not null default '{}'::jsonb,
 sort_order int not null default 0
);
-- Lớp 2: công trình bên ngoài (hình khối đơn giản). room_id nối tới phòng nội thất.
create table if not exists public.anyen_world_rooms (
 id text primary key,
 map_id text not null references public.anyen_world_maps(id) on delete cascade,
 name text not null,
 topic text,
 capacity int,
 kind text not null default 'public' check (kind in ('public','private')),
 palette_color text not null,
 interior jsonb not null default '{}'::jsonb,
 sort_order int not null default 0
);
create table if not exists public.anyen_world_buildings (
 id text primary key,
 map_id text not null references public.anyen_world_maps(id) on delete cascade,
 name text not null,
 kind text not null,
 x numeric not null,
 z numeric not null,
 exterior jsonb not null default '{}'::jsonb,
 entry jsonb,
 room_id text references public.anyen_world_rooms(id) on delete set null
);
-- Lớp 3: cảnh vật và hoạt động gắn với chỗ đứng (hồ nguyện ước, tượng đài...).
create table if not exists public.anyen_world_props (
 id text primary key,
 map_id text not null references public.anyen_world_maps(id) on delete cascade,
 kind text not null,
 name text not null,
 x numeric not null,
 z numeric not null,
 params jsonb not null default '{}'::jsonb,
 activity text,
 sort_order int not null default 0
);
-- Lớp 4: người của làng. Kịch bản chọn lựa; chừa sẵn trường để gắn AI sau này.
create table if not exists public.anyen_world_npcs (
 id text primary key,
 map_id text not null references public.anyen_world_maps(id) on delete cascade,
 name text not null,
 role text not null,
 x numeric not null,
 z numeric not null,
 facing numeric not null default 0,
 greet_radius numeric not null default 4,
 greeting text,
 dialogue jsonb not null default '[]'::jsonb,
 ai_enabled boolean not null default false,
 ai_config jsonb,
 active boolean not null default false
);
create index if not exists anyen_world_nature_map_idx on public.anyen_world_nature(map_id);
create index if not exists anyen_world_buildings_map_idx on public.anyen_world_buildings(map_id);
create index if not exists anyen_world_rooms_map_idx on public.anyen_world_rooms(map_id);
create index if not exists anyen_world_props_map_idx on public.anyen_world_props(map_id);
create index if not exists anyen_world_npcs_map_idx on public.anyen_world_npcs(map_id);

alter table public.anyen_world_maps enable row level security;
alter table public.anyen_world_nature enable row level security;
alter table public.anyen_world_rooms enable row level security;
alter table public.anyen_world_buildings enable row level security;
alter table public.anyen_world_props enable row level security;
alter table public.anyen_world_npcs enable row level security;
revoke all on table public.anyen_world_maps, public.anyen_world_nature, public.anyen_world_rooms,
 public.anyen_world_buildings, public.anyen_world_props, public.anyen_world_npcs from anon, authenticated;

-- Đọc công khai, chỉ bản đồ đang 'live'. Không ghi được từ trình duyệt.
create or replace function public.anyen_get_world_map(p_map_id text default 'pine_forest')
returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object(
  'map', to_jsonb(m),
  'nature', coalesce((select jsonb_agg(to_jsonb(n) order by n.sort_order,n.id) from public.anyen_world_nature n where n.map_id=m.id),'[]'::jsonb),
  'rooms', coalesce((select jsonb_agg(to_jsonb(r) order by r.sort_order,r.id) from public.anyen_world_rooms r where r.map_id=m.id),'[]'::jsonb),
  'buildings', coalesce((select jsonb_agg(to_jsonb(b) order by b.id) from public.anyen_world_buildings b where b.map_id=m.id),'[]'::jsonb),
  'props', coalesce((select jsonb_agg(to_jsonb(p) order by p.sort_order,p.id) from public.anyen_world_props p where p.map_id=m.id),'[]'::jsonb),
  'npcs', coalesce((select jsonb_agg(to_jsonb(c) - 'ai_config' order by c.id) from public.anyen_world_npcs c where c.map_id=m.id and c.active),'[]'::jsonb)
 )
 from public.anyen_world_maps m where m.id=p_map_id and m.status='live';
$$;
revoke all on function public.anyen_get_world_map(text) from public;
grant execute on function public.anyen_get_world_map(text) to anon, authenticated;

-- Dữ liệu Rừng thông · Làng Yên (khớp đúng cảnh gốc hiện tại).
insert into public.anyen_world_maps(id,name,kind,status,sky_color,fog_color,fog_density,ground_color,hemi_sky,hemi_ground,hemi_intensity,sun_color,sun_intensity,sun_position,ambience,spawn,bounds)
values('pine_forest','Rừng thông · Làng Yên','forest','live','#173c35','#264b42',0.022,'#234c3e','#f6dfaf','#1b4234',2.1,'#f5c78c',2.4,'[-8,19,-8]','pine_forest','{"x":0,"z":25}','{"x":34,"z_min":-40,"z_max":35}')
on conflict (id) do nothing;

insert into public.anyen_world_nature(id,map_id,kind,params,sort_order) values
('pine_forest.pines','pine_forest','tree_grid','{"count":32,"cols":8,"dx":4.4,"dz":18,"z0":-29,"z_remap":{"25":32.5},"clear_rects":[[-11,-15,11,7],[-9,-99,9,-25]],"trunk_color":"#654c33","leaf_color":"#47745c"}',1)
on conflict (id) do nothing;

insert into public.anyen_world_rooms(id,map_id,name,topic,capacity,kind,palette_color,sort_order) values
('sanh_chung','pine_forest','Sảnh chung','anyen:room:lobby',null,'public','#092d27',1),
('phong_sen','pine_forest','Phòng Sen · 10 người','anyen:room:sen',10,'public','#263d36',2),
('phong_truc','pine_forest','Phòng Trúc · 20 người','anyen:room:truc',20,'public','#183e30',3),
('phong_rieng','pine_forest','Phòng Riêng',null,null,'private','#342e3e',4)
on conflict (id) do nothing;

insert into public.anyen_world_buildings(id,map_id,name,kind,x,z,exterior) values
('tuong_dai','pine_forest','Thiền viện tượng đài','sanctuary',0,-31,'{"terrace_radius":8.2,"terrace_top":0.3}'),
('cau_ho_niem','pine_forest','Cầu vòm Hồ Niệm','bridge',0,-4,'{"arch_z":[-15.6,7.6],"rise":2.6}')
on conflict (id) do nothing;

insert into public.anyen_world_props(id,map_id,kind,name,x,z,params,activity,sort_order) values
('ho_sac','pine_forest','wish_lake','Sắc',-23,18,'{"color":"#547d81","theme":"thịnh vượng","sense":"SẮC"}','ném xu nhận lời nhắn',1),
('ho_thanh','pine_forest','wish_lake','Thanh',23,18,'{"color":"#57758b","theme":"công việc","sense":"THANH"}','ném xu nhận lời nhắn',2),
('ho_huong','pine_forest','wish_lake','Hương',-25,2,'{"color":"#688b78","theme":"sức khỏe","sense":"HƯƠNG"}','ném xu nhận lời nhắn',3),
('ho_vi','pine_forest','wish_lake','Vị',25,2,'{"color":"#947a67","theme":"tình duyên","sense":"VỊ"}','ném xu nhận lời nhắn',4),
('ho_cham','pine_forest','wish_lake','Chạm',-23,-19,'{"color":"#8c7188","theme":"kết nối","sense":"CHẠM"}','ném xu nhận lời nhắn',5),
('ho_niem','pine_forest','wish_lake','Niệm',0,-4,'{"color":"#5a9b91","theme":"an yên","sense":"NIỆM"}','ném xu nhận lời nhắn',6)
on conflict (id) do nothing;
