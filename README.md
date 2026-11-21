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

## Rừng Yên 3.8 · Bản đồ mở rộng (beta)

- Bản đồ rộng khoảng 120 m, dài khoảng 140 m: **Cổng Yên** (phía nam) → **Sân đón** → lối đá giữa hai cánh **hồ sen** → **cầu vòm** bắc qua lạch → **Sân chân đồi** → **bậc đá zíc zắc** lên **đồi tượng Phật** (đỉnh cao 8 m, z = -62).
- **Hồ sen hai cánh** (hồ Niệm mở rộng): hai cánh 30 × 26 m nối bằng lạch nước dưới cầu. **Ba thuyền ngắm cảnh** neo ở **Bến sen** (cầu gỗ bờ nam, phía tây cầu vòm). Chạm thuyền để lên; thuyền tự đi một vòng số 8 nhỏ (khoảng 130 m, 60 giây) giữa hai cánh hồ sen, chui gầm cầu hai lần, rồi về chỗ neo. Có ⏸ Dừng ngắm / ▶ Đi tiếp và ⏹ Về bến; vuốt để nhìn quanh. Mỗi thuyền một người, thuyền đang có người thì khách khác chọn chiếc còn lại. Thuyền của khách khác hiện trên hồ theo thời gian thực; hai thuyền sắp đụng nhau thì thuyền phía sau (hoặc thuyền số lớn hơn khi gặp nhau dưới cầu) dừng chờ. Bờ hồ có viền cỏ thấp điểm hoa nhỏ và hai cây liễu rũ.
- **Vòng Ngũ quan** quanh chân đồi: năm hồ giác quan đường kính 11 m, mỗi hồ có một kiến trúc 11 × 11 m (bằng đường kính hồ) cách mép hồ 9 m, cửa quay ra hồ: Sắc · **Nhà hoa lan** (mở cảnh Viverse), Thanh · **Nhà chuông gió** (chạm để nghe chuông), Hương · **Nhà xông hương** (vườn thảo mộc, khói xông), Vị · **Quán trà** (sàn gỗ, bàn trà cho hai người), Chạm · **Nhà gốm** (đôn gỗ, kệ gốm, bãi nung lộ thiên bên hông nhà). Không gian bên trong của bốn nhà sau sẽ mở sau.
- **Bên trong bốn nhà** (chạm nhà để vào, ← Trở về Rừng Yên để ra; rừng tạm dừng vẽ khi đang ở trong): Nhà chuông gió (chạm chuông xoay, chiêng, chuông gió; thiền âm thanh 3 phút), Nhà xông hương (chọn sả, bạc hà, oải hương, ngải cứu; thở 4·4·6 sáu nhịp), Quán trà (pha trà 6 bước, mời trà nhận lời nhắn), Nhà gốm (xem mục dưới).
- **Vườn hoa và dâng hoa** (bắt đầu từ **Nghi thức → 💐 Dâng hoa tượng Phật** hoặc Menu): bảng hướng dẫn 3 bước, mỗi vườn có Đi bộ / Đến ngay. năm vườn ở năm ngã rẽ đường Ngũ quan (hồng · cẩm tú cầu · huệ trắng · cúc vàng · oải hương) và hái sen ở Bến sen. Chạm biển hoa trên vườn để đến và hái (tối đa 9 bông, hái được ở nhiều vườn). Bấm **Xong** để xem trước bó hoa, chọn kiểu bó (Tròn · Tháp · Quạt), chạm hai bông để đổi chỗ, ✕ để bỏ bớt; **Chọn lại** để làm lại từ đầu. **Ưng ý** thì nhân vật cầm bó hoa; bấm **💐 Đi dâng hoa** để lên đồi đặt trước tượng Phật. Bệ có 9 chỗ, bó mới nhất thay bó cũ nhất; hoa lưu trong bảng Supabase `anyen_flower_offerings` (chạy `supabase_flowers.sql`) nên mọi khách đều thấy và hoa không tự mất.
- **Nhà gốm** theo gốm Chăm Bàu Trúc ("bốn không": không bàn xoay, không khuôn, không men, nung lộ thiên): nhào đất 5 lần → rắc cát trắng lên đôn → chọn dáng (Lu nước · Hũ · Bình cổ cao · Đèn gốm) → **đi lùi quanh đôn 6 vòng** theo hơi thở, mỗi vòng thân gốm cao thêm → chuốt vải ướt, làm bóng bằng cật tre → khắc hoa văn (que tre · răng lược · vỏ sò) → phơi nắng 10 giây (thực tế 4–6 giờ) → đội gốm ra **bãi nung** bên trái nhà (phía rộng hơn) → nung lộ thiên 1 phút (thực tế 4–6 giờ) → **💧 Phun nước tạo màu** rồi đội gốm lên kệ: hỏa biến ngẫu nhiên (đỏ hồng, vàng đỏ, vệt đen xám), mỗi chiếc một độc bản. Trong phút nung mọi khách thấy lửa khói; xong gốm lên kệ cạnh bãi nung và kệ trong nhà, kệ 6 × 6 = 36 chỗ, giữ 36 chiếc gần nhất (bảng `anyen_pottery`, chạy `supabase_pottery.sql`).
- **Nghi thức Dâng y** (Nghi thức → 🟧 Dâng y, mở quanh năm), trong **Tịnh thất may y** (góc đông bắc, có nhánh đường đá): nhuộm vải (vàng nghệ · củ nghệ, vàng cam · lõi mít, nâu đất · củ nâu, nâu đỏ · đất son; mảnh vải nhúng chậu nhuộm), chọn 5/7/9 điều (có giải thích An-đà-hội, Uất-đa-la-tăng, Tăng-già-lê), khâu từng mảnh (đường chỉ hiện dần quanh mép, tiếng kéo chỉ, mỗi dải xong có một câu chánh niệm), mỗi mảnh một màu tùy ý; lời hồi hướng không bắt buộc → đội y nhiễu Phật 3 vòng (Niệm Phật · Niệm Pháp · Niệm Tăng, nhắc hơi thở, chuông khi sang vòng, cánh hoa rơi nhẹ quanh sân thiền) → hạ khay từ đầu xuống ngực, đặt dưới chân tượng, lạy 3 lạy (mỗi lạy một tiếng chuông) → ngồi niệm *Namo tassa…* 5 phút → hồi hướng → **người dẫn đầu đội y về kho** trong Tịnh thất. Khách khác thấy đoàn rước y thì bấm **"Cùng nhiễu Phật"** để đi theo sau, mỗi người một chỗ cách nhau 1,7 m, không đè lên nhau; hết 3 vòng người dẫn đầu làm lễ, những người đi cùng lần lượt ngồi tọa thiền. Bảng `anyen_kathina_robes` (cột `pieces`, `wish`; `supabase_kathina.sql`).
- **Sổ lưu niệm**: bệ hoa (9 bó), kho y (9 tấm) và kệ gốm (36 chiếc) chỉ bày tượng trưng những món gần nhất; chạm vào bệ hoa, y dưới chân tượng, kệ gốm, kệ kho y (hoặc nút 📜) để mở danh sách đầy đủ (tên, ngày, chi tiết). Mỗi sổ trên Supabase giữ 66 món gần nhất, đầy thì xoá dần món cũ nhất.
- Lối đi lát đá phiến lún vào nền đất, không có đèn. **Đường Ngũ quan**: vòng đá quanh chân đồi, nhánh tới từng nhà. Nhân vật ưu tiên đi trên đường đá (cỏ tính chi phí gấp 3), chỉ bước lên cỏ đoạn cuối.
- Máy quay: chụm hai ngón, cuộn chuột hoặc nút ＋/－ để thu phóng; tới nơi nào thì máy quay tự quay nhìn vào mặt tiền nơi đó. Giữa Sân đón và Sân chân đồi có **đài phun nước nhỏ ba tầng** (bồn đá tròn, nước tràn qua mép từng tầng).
- **Rừng thông kiểu Đà Lạt**: khoảng 600 cây cao thấp ngẫu nhiên (thân cao, tán xếp tầng ở ngọn; thông non hình nón), sinh từ hạt giống cố định nên mọi khách thấy cùng một khu rừng. Dưới gốc là thảm lá thông, trảng trống là thảm cỏ xanh lốm đốm vàng, điểm vài cụm hoa dại nhỏ nhiều màu (cúc, chuông, chùm sao), khóm dã quỳ và đá rêu.
- Mỗi loại cây/hoa/đá là một InstancedMesh (một lần vẽ). Không dùng bóng đổ. Cây, cổng, Nhà hoa lan và cây bồ đề che tầm nhìn thì **mờ đi** (không xoá).
- **🗺 Bản đồ** (nút bên phải hoặc Menu → Bản đồ & điểm đến): chạm bản đồ để đi bộ tới, chạm vào một nhà để đi tới trước cửa; chỗ đến luôn tránh khách khác (đến ngay mà chỗ đã có người thì đứng sang ô trống bên cạnh, cách 1,3 m); khi đi bộ, nhân vật vòng qua khách đang đứng trên đường, lối hẹp như cầu thì lách qua sát bên; 14 điểm đến nhanh, mỗi điểm có 🚶 Đi bộ và ✨ Đến ngay.
- Cao độ địa hình nằm trong `terrainHeight()`; dữ liệu bố cục ghi trong `data/world-pine_forest.json` (`nature` kind `pine_forest`, `buildings`, `props`).

## Lưu ý
- Đây là bản beta; chưa được kiểm thử trực tiếp trên iPhone và nhiều thiết bị thật.
- Thiền đường cộng hưởng vẫn sử dụng SQL của phiên bản 3.4. Không chạy lại SQL nếu đã cấu hình.
- Không đưa `service_role` hoặc secret key vào GitHub.
