# Supabase: duyệt nhà trị liệu, admin, tạm khoá

Đã áp dụng trên project `tgaigagmkrkwnzcyfoir` bằng migration `anyen_admin_approval_restrictions_v2` (xem Supabase → Database → Migrations để lấy SQL đầy đủ).

**Bảng**: `anyen_profiles` (thêm `email, therapist_status, member_status, status_reason, reviewed_by, reviewed_at`), `anyen_admins` (email, is_root), `anyen_admin_log`. Bật RLS, không có policy; mọi truy cập qua hàm `security definer`.

**Quy tắc**
- Admin gốc: `cheetahmsu@gmail.com`, `dangvo.sg@gmail.com` (trigger chặn xoá/đổi). Cũng là nhà trị liệu đã duyệt.
- Quyền admin chỉ có hiệu lực khi email đã xác thực.
- Đăng ký nhà trị liệu → `pending`; admin duyệt qua email rồi bấm Duyệt/Từ chối (từ chối được nộp lại).
- `member_status='restricted'` (tạm khoá): vẫn đăng nhập, chỉ đi dạo, không tham gia hoạt động (chặn phía 3D/RPC sẽ làm ở bước sau).

**Hàm**: `anyen_get_my_profile, anyen_update_my_profile, anyen_apply_therapist, anyen_is_admin, anyen_is_root_admin, anyen_admin_list_profiles, anyen_admin_set_therapist_status, anyen_admin_set_member_status, anyen_admin_list_admins, anyen_admin_add_admin, anyen_admin_remove_admin, anyen_admin_list_log`.
