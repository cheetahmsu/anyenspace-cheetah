# LÀNG YÊN 3.5 · Zen Mode

## Cập nhật GitHub → Netlify

1. Sao lưu commit hiện tại của nhánh `main`.
2. Thay **chỉ** `index.html` và `multiplayer.js` trong repository `koikoi369/anyenspace`.
3. **Giữ nguyên** `config.js`, SQL Supabase, hai mã QR và các file khác.
4. Commit và đợi Netlify triển khai, sau đó thử trên iPhone (Safari) và laptop.

## Tính năng
- Thanh công cụ iPhone chỉ có: **Ngồi thiền · Thiền hành · Gõ chuông · Menu**.
- Menu mở các tương tác và đường dẫn chọn phòng. Các bảng khác được ẩn trong chế độ 3D trên mobile.
- **Chạm mặt đất** để đi theo đường thẳng tới điểm được chọn, dừng trước hồ và khu điện chính. Chưa có thuật toán tìm đường vòng chướng ngại.
- **Chạm tọa cụ** để ngồi thiền; **chạm nhân vật khác** để gửi lời chào cho phòng đang kết nối.
- 3 kiểu trang phục có silhouette khác nhau: áo thiền dài, linen có áo khoác ngắn, thường ngày có quần riêng; màu cá nhân vẫn được đồng bộ qua Supabase.
- Giữ ngồi thiền/thiền hành khi gõ chuông.

## Vịnh Hạ Long · Du thuyền Yên (beta)
- Bấm **Khám phá Vịnh Yên**: bạn đứng ở mũi một du thuyền 5 sao, xuất phát từ cảng Tuần Châu.
- **Chạm mặt nước** (hoặc một hòn đảo, danh thắng) để tàu tự tìm đường vòng qua các đảo và đi tới. **🗺 Bản đồ** cho phép chọn điểm đến hoặc danh thắng trên bản đồ vịnh.
- **Vuốt trái/phải** chỉ xoay góc nhìn quanh người đứng mũi tàu, không đổi hướng tàu. Vuốt lên/xuống để ngẩng/cúi.
- Nút: Dừng tàu · Thong thả/Nhanh · Tiếng sóng · Về Rừng Yên.

### Dữ liệu dùng chung của vịnh
- Tệp tĩnh `data/world-halong_bay.json` (không gọi Supabase), cùng cấu trúc 4 lớp với `data/world-pine_forest.json`: `map` (Lớp 1, kèm `time_slots` buổi sáng / bình minh-hoàng hôn / buổi tối; hiện bật buổi sáng), `nature` (biển, bờ đất, 630 đảo đá, luồng tàu), `buildings` + `rooms` (Lớp 2: du thuyền và các phòng chờ dựng nội thất), `props` (Lớp 3: danh thắng, thuyền gỗ, phao), `npcs` (Lớp 4: chưa bật).
- Toạ độ chiếu từ vĩ độ/kinh độ thật quanh cảng Tuần Châu, 1 đơn vị = 4 m; kích thước đảo được phóng đại. Mỗi danh thắng ghi rõ `precision` (`source` có nguồn công bố, `approx` ước lượng) và `source`.
- Sửa dữ liệu trong `tools/build_halong_bay.py` rồi chạy `python3 tools/build_halong_bay.py` để sinh lại tệp JSON.

## Lưu ý
- Đây là bản beta; chưa được kiểm thử trực tiếp trên iPhone và nhiều thiết bị thật.
- Thiền đường cộng hưởng vẫn sử dụng SQL của phiên bản 3.4. Không chạy lại SQL nếu đã cấu hình.
- Không đưa `service_role` hoặc secret key vào GitHub.
