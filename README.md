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

## Vịnh Hạ Long – Lan Hạ – Bái Tử Long · Du thuyền Yên (beta)

- Bản đồ chia vùng: Toàn cảnh · Vịnh Hạ Long · Vịnh Lan Hạ · Vịnh Bái Tử Long; danh sách điểm theo vùng, mỗi điểm có nút 📸 check-in (đưa tàu tới góc chụp đẹp và mở máy ảnh, danh thắng phía sau lưng).
- Điểm bổ sung (theo bản đồ du lịch vịnh Hạ Long của vietnamtourism.com và các hành trình vịnh Bái Tử Long do UBND Quảng Ninh công bố): Động Mê Cung, Đảo Soi Sim, Hang Thiên Cảnh Sơn, Làng chài Vung Viêng, Đảo Cống Đỏ, Hồ Ba Hầm, Làng Việt Hải, Hòn Rùa, Bãi Vạn Bội, Đảo Nam Cát, Hòn Đũa, Đảo Thắng Lợi, Đảo Ngọc Vừng, Bãi Quan Lạn, Bãi Minh Châu, Đảo Bản Sen · Hang Nhà Trò, Hòn Mèo Lười, Vườn quốc gia Bái Tử Long. Toạ độ các điểm mới là gần đúng.
- Dáng mới: `cove` (áng nước kín vách dựng kiểu Lan Hạ), `island_beach` (đảo đồi thấp bãi cát dài kiểu Bái Tử Long); Ti Tốp có ki-ốt, ô dù, bậc lên đỉnh; làng chài là dãy nhà bè san sát. Màu nước đổi theo vùng (Lan Hạ xanh ngọc).

Bản đồ gồm vịnh Hạ Long (Quảng Ninh) và vịnh Lan Hạ (Hải Phòng, phía đông đảo Cát Bà): Hang Sáng Tối, Hòn Ba Trái Đào, Đảo Khỉ · Cát Dứa, Làng chài Cái Bèo; tour "Tuyến Lan Hạ". Toạ độ các điểm Lan Hạ là gần đúng.

Nút **⏸️ Ngắm cảnh** trên hàng trên: thuyền dừng giữa hành trình (giữ nguyên tour/điểm đến), hiện hàng điều khiển xoay trái/phải (giữ nút), tự xoay 360°, nhìn về mũi tàu, chụp ảnh, ▶ đi tiếp hoặc ⏹ neo lại.
- Bấm **Khám phá Vịnh Yên**: bạn đứng ở mũi một du thuyền 5 sao, xuất phát từ cảng Tuần Châu.
- **Trang phục ở vịnh:** lần đầu vào vịnh mở bảng "Lên Du thuyền Yên" có xem trước dáng đứng và ngồi thiền. Năm kiểu: Thiền phục · Áo thun · quần jean · Vest lịch sự · Đầm maxi đi chơi · Áo dài truyền thống; màu như bảng màu cũ; tích chọn thêm Nón, Kính, Khăn. Chỉ dùng ở vịnh, mở lại bằng Menu → Trang phục.
- **Hàng trên (tàu):** chip trạng thái tàu (đang neo · đang đi tới, còn bao xa · tour điểm 2/5 · dừng ngắm, đi tiếp sau … giây · đang ở danh thắng), nút ⏹ khi tàu chạy, rồi bốn tùy chọn:
  - **🧭 Tour trải nghiệm:** chọn tour và đoạn "Từ … Đến …"; mỗi chặng ghi khoảng cách, thời gian trên web và thời gian ngoài đời (ước tính tàu du lịch 15 km/giờ).
  - **⛵ Dạo ngắm vịnh:** chọn điểm đến tiếp theo (gần đến xa) với khoảng cách và hai mốc thời gian, tàu tự chạy tới.
  - **📍 Điểm đến:** bản đồ vịnh, chạm một điểm hoặc tên danh thắng để đến ngay lập tức.
  - **🎥 Góc nhìn:** Mũi tàu · Boong thượng · Ngắm tàu từ xa · Tự xoay 360°.
  - Tốc độ Thong thả/Nhanh và tiếng sóng ở chân bảng tùy chọn.
  - **📷 Chụp ảnh:** nhân vật quay lưng về phía biển, nhìn vào máy; chọn dáng (Nhìn thẳng, Ngắm vịnh, Nghiêng đầu, Dáng nghiêng) và đổi góc; đếm ngược 3-2-1 rồi chụp. Ảnh có dải tên Làng Yên, địa danh và ngày; tải về hoặc chia sẻ.
- **🔊 Âm thanh** (nút cuối hàng trên): Sóng biển · Nhạc thư giãn (tạo ngay trên máy) · Im lặng; nhớ lựa chọn trên máy.
- **Chỉ một cảnh chạy một lúc:** khi ở vịnh, rừng thông được ẩn và ngừng cập nhật. Mỗi cảnh lưu trạng thái trên máy (rừng: vị trí, hướng nhìn; vịnh: vị trí, hướng tàu, điểm đang đến, tour và điểm dừng) để quay lại đúng chỗ, kể cả sau khi tải lại trang.
- **Các thiên nhiên không đi thẳng sang nhau:** từ vịnh bấm **✕ Về Làng Yên** để ra trang chính, rồi mới chọn Khám phá Rừng Yên hoặc Khám phá Vịnh Yên (và ngược lại).
- **🧭 Hành trình** (hoặc chạm chip trạng thái): một bảng ba thẻ — **Lịch trình** (3 tuyến dạo vịnh, tàu tự đi và dừng ngắm), **Chọn đảo** (mỗi nơi có “✨ Đến ngay” để dịch chuyển tức thì và “⛵ Đi tới” để tàu tự chạy), **Bản đồ** (chạm mặt nước để đi tới, bấm tên danh thắng để đến ngay).
- **Chạm mặt nước** trong cảnh để tàu tự tìm đường vòng qua các đảo và đi tới. **Vuốt trái/phải** chỉ xoay góc nhìn, không đổi hướng tàu.
- **Hàng dưới (người):** thanh Toạ thiền · Thỉnh chuông · Nghi thức · Tương tác · Menu (sẽ thiết kế lại cho vịnh).

### Dữ liệu dùng chung của vịnh
- Tệp tĩnh `data/world-halong_bay.json` (không gọi Supabase), cùng cấu trúc 4 lớp với `data/world-pine_forest.json`: `map` (Lớp 1, kèm `time_slots` buổi sáng / bình minh-hoàng hôn / buổi tối; hiện bật buổi sáng), `nature` (biển, bờ đất, 257 đảo đá lớn theo 8 dáng, luồng tàu; khi dựng tự rải thêm mỏm đá phụ ven các đảo lớn ngoài luồng tàu), `buildings` + `rooms` (Lớp 2: du thuyền và các phòng chờ dựng nội thất), `props` (Lớp 3: danh thắng, thuyền gỗ, phao, lịch trình `kind: "tour"` với các điểm dừng `landmark` · `dwell` giây · `note`), `npcs` (Lớp 4: chưa bật).
- Toạ độ chiếu từ vĩ độ/kinh độ thật quanh cảng Tuần Châu, 1 đơn vị = 4 m; kích thước đảo được phóng đại. Mỗi danh thắng ghi rõ `precision` (`source` có nguồn công bố, `approx` ước lượng) và `source`.
- Phông tranh 360° (`nature` kind `backdrop`) và chất liệu đá vôi, tán cây đều được vẽ bằng code khi mở cảnh, không cần tải ảnh.
- Sửa dữ liệu trong `tools/build_halong_bay.py` rồi chạy `python3 tools/build_halong_bay.py` để sinh lại tệp JSON.

## Lưu ý
- Đây là bản beta; chưa được kiểm thử trực tiếp trên iPhone và nhiều thiết bị thật.
- Thiền đường cộng hưởng vẫn sử dụng SQL của phiên bản 3.4. Không chạy lại SQL nếu đã cấu hình.
- Không đưa `service_role` hoặc secret key vào GitHub.
