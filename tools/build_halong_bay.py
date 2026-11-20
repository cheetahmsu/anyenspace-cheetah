#!/usr/bin/env python3
"""Sinh tệp dữ liệu dùng chung data/world-halong_bay.json cho cảnh Vịnh Hạ Long.

Toạ độ thật (vĩ độ, kinh độ) được chiếu phẳng quanh cảng Tuần Châu:
  x = Đông (+), z = Nam (+)  ·  1 đơn vị cảnh = METERS_PER_UNIT mét.
Các đảo đá phụ được rải ngẫu nhiên có hạt giống cố định trong vùng đảo đá vôi thật,
chừa trống các luồng tàu du lịch, nên mọi máy đều thấy cùng một vịnh.

Chạy lại sau khi sửa:  python3 tools/build_halong_bay.py
"""
import json, math, random, os

LAT0, LON0 = 20.9250, 106.9950          # gần cảng tàu khách quốc tế Tuần Châu
METERS_PER_UNIT = 4.0
KX = 111320 * math.cos(math.radians(LAT0)) / METERS_PER_UNIT
KZ = 110574 / METERS_PER_UNIT

def xz(lat, lon):
    return round((lon - LON0) * KX, 1), round(-(lat - LAT0) * KZ, 1)

def poly(pts):
    return [list(xz(a, b)) for a, b in pts]

# ---- Danh thắng (precision: "source" = có nguồn toạ độ công bố, "approx" = ước lượng theo mô tả vị trí) ----
LANDMARKS = [
    # id, tên, lat, lon, hình dạng, bán kính, chiều cao, độ chính xác, ghi chú, mô tả
    ("cang_tuan_chau", "Cảng tàu khách quốc tế Tuần Châu", 20.9255, 106.9965, "pier", 0, 0, "approx",
     "Bến xuất phát của du thuyền, bờ đông nam đảo Tuần Châu", "Nơi các du thuyền rời bến vào vịnh"),
    ("dong_thien_cung", "Động Thiên Cung · Hang Đầu Gỗ", 20.9127, 107.0172, "big_island", 110, 62, "source",
     "showcaves.com: 20.9126814, 107.0172114 (bờ bắc đảo Đầu Gỗ)", "Hai hang đá nổi tiếng trên đảo Đầu Gỗ"),
    ("hon_cho_da", "Hòn Chó Đá", 20.9072, 107.0302, "dog", 16, 22, "approx",
     "Trên tuyến tham quan số 1, giữa Đầu Gỗ và Đỉnh Hương", "Hòn đá có dáng chú chó ngồi canh"),
    ("hon_dinh_huong", "Hòn Đỉnh Hương", 20.9088, 107.0418, "incense", 14, 26, "approx",
     "Gần Hòn Trống Mái, phía bắc", "Như một lư hương dâng lên trời"),
    ("hon_trong_mai", "Hòn Trống Mái", 20.9030, 107.0440, "pair", 6, 15, "approx",
     "Cách cảng Tuần Châu khoảng 5 km, phía nam Hòn Đỉnh Hương (Ban quản lý vịnh)", "Biểu tượng du lịch Hạ Long: đôi gà đá tựa vào nhau"),
    ("lang_chai_ba_hang", "Làng chài Ba Hang", 20.8895, 107.0605, "village", 0, 0, "approx",
     "Khu Ba Hang, phía nam Trống Mái", "Những nhà bè nổi bình yên giữa vòng đá"),
    ("dao_ti_top", "Đảo Ti Tốp", 20.8589, 107.0809, "titop", 58, 28, "source",
     "Waymarking: N 20°51.528 E 107°04.858; khớp Wikipedia tiếng Pháp 20°51′32″N 107°04′49″E", "Bãi cát hình trăng lưỡi liềm, đỉnh ngắm toàn cảnh"),
    ("hang_sung_sot", "Hang Sửng Sốt · đảo Bồ Hòn", 20.8556, 107.0905, "big_island", 85, 70, "approx",
     "Trên đảo Bồ Hòn, đối diện Ti Tốp", "Hang lớn và đẹp bậc nhất vịnh Hạ Long"),
    ("hang_luon", "Hang Luồn", 20.8478, 107.0985, "arch", 40, 34, "approx",
     "Phía đông nam đảo Bồ Hòn", "Vòm đá dẫn vào hồ nước lặng giữa núi"),
    ("lang_chai_cua_van", "Làng chài Cửa Vạn", 20.8000, 107.1280, "village", 0, 0, "approx",
     "Khoảng 20 km từ đảo Tuần Châu, vùng Vạn Giã · Cửa Vạn", "Làng chài nổi lớn nhất vịnh Hạ Long"),
    ("cau_bai_chay", "Cầu Bãi Cháy", 20.9560, 107.0712, "bridge", 0, 0, "approx",
     "Bắc qua eo Cửa Lục giữa Bãi Cháy và Hòn Gai", "Cây cầu dây văng nối hai bờ thành phố Hạ Long"),
]

# ---- Bờ đất liền (Bãi Cháy · Hòn Gai) và đảo Tuần Châu (ước lượng) ----
MAINLAND_WEST = [(21.000, 106.930), (20.958, 106.935), (20.950, 106.958), (20.946, 106.976), (20.947, 106.992),
                 (20.951, 107.006), (20.948, 107.024), (20.951, 107.044), (20.955, 107.061), (20.958, 107.068),
                 (20.975, 107.068), (21.000, 107.060)]
MAINLAND_EAST = [(21.000, 107.080), (20.962, 107.076), (20.952, 107.082), (20.947, 107.098), (20.946, 107.118),
                 (20.949, 107.140), (20.958, 107.170), (21.000, 107.180)]
TUAN_CHAU = [(20.9372, 106.9725), (20.9385, 106.9845), (20.9370, 106.9955), (20.9318, 107.0010), (20.9262, 106.9998),
             (20.9238, 106.9905), (20.9262, 106.9790), (20.9300, 106.9730)]
CAUSEWAY = [(20.9372, 106.9790), (20.9466, 106.9800), (20.9466, 106.9830), (20.9372, 106.9822)]

# ---- Vùng đảo đá vôi dày đặc (ước lượng theo bản đồ du lịch) ----
KARST_ZONES = [
    {"name": "Lõi di sản Hạ Long", "count": 640, "pts": [(20.921, 107.003), (20.918, 107.060), (20.905, 107.110), (20.880, 107.165),
                                                        (20.830, 107.175), (20.790, 107.150), (20.785, 107.100), (20.825, 107.045),
                                                        (20.862, 107.012), (20.895, 107.000)]},
    {"name": "Phía tây nam Tuần Châu", "count": 130, "pts": [(20.912, 106.955), (20.913, 106.990), (20.880, 107.000), (20.845, 106.990), (20.850, 106.950)]},
]

# ---- Luồng tàu du lịch (giữ trống để du thuyền đi được) ----
CORRIDORS = [
    ["cang_tuan_chau", (20.918, 107.003), "dong_thien_cung", "hon_cho_da", "hon_dinh_huong", "hon_trong_mai",
     "lang_chai_ba_hang", (20.874, 107.070), "dao_ti_top", "hang_sung_sot", "hang_luon", (20.830, 107.108),
     (20.812, 107.120), "lang_chai_cua_van"],
    ["hon_trong_mai", (20.915, 107.055), (20.935, 107.062), "cau_bai_chay"],
    ["cang_tuan_chau", (20.935, 107.012), (20.942, 107.035), (20.945, 107.055)],
]
CORRIDOR_HALF_WIDTH = 105


# ---- Lịch trình tham quan (dựa theo các tuyến tham quan vịnh; dwell = số giây tàu dừng ngắm) ----
TOURS = [
    {"id": "tuyen_1", "name": "Tuyến 1 · Hang động và Hòn Trống Mái", "summary": "Chuyến ngắn quanh vùng vịnh gần bờ: hang Thiên Cung, Đầu Gỗ và các hòn đá biểu tượng.",
     "stops": [("dong_thien_cung", 18, "Hai hang đá nằm trên đảo Đầu Gỗ, gắn với truyền thuyết cọc gỗ trên sông Bạch Đằng."),
               ("hon_cho_da", 12, "Hòn đá như chú chó ngồi canh giữ vịnh."),
               ("hon_dinh_huong", 14, "Khối đá thắt chân, nở đỉnh như một lư hương dâng lên trời."),
               ("hon_trong_mai", 22, "Đôi gà đá tựa vào nhau, biểu tượng của du lịch Hạ Long."),
               ("cang_tuan_chau", 0, "Tàu về lại bến Tuần Châu.")]},
    {"id": "tuyen_2", "name": "Tuyến 2 · Ti Tốp, Sửng Sốt, Hang Luồn", "summary": "Đi sâu vào lõi di sản: bãi tắm Ti Tốp, hang Sửng Sốt và vòm Hang Luồn.",
     "stops": [("hon_trong_mai", 12, "Chào đôi gà đá trước khi vào sâu trong vịnh."),
               ("dao_ti_top", 22, "Bãi cát trăng lưỡi liềm; trên đỉnh đảo nhìn được toàn cảnh vịnh."),
               ("hang_sung_sot", 18, "Hang rộng và đẹp bậc nhất vịnh, trên đảo Bồ Hòn."),
               ("hang_luon", 18, "Vòm đá dẫn vào một hồ nước lặng giữa vòng núi."),
               ("cang_tuan_chau", 0, "Tàu về lại bến Tuần Châu.")]},
    {"id": "tron_vinh", "name": "Hành trình trọn vịnh · tới làng chài Cửa Vạn", "summary": "Đi một mạch từ bến qua các danh thắng tới làng chài nổi lớn nhất vịnh.",
     "stops": [("dong_thien_cung", 12, "Đảo Đầu Gỗ với hai hang đá nổi tiếng."),
               ("hon_trong_mai", 16, "Đôi gà đá giữa sóng nước."),
               ("lang_chai_ba_hang", 14, "Những nhà bè nổi bình yên giữa vòng đá."),
               ("dao_ti_top", 16, "Bãi cát trắng hình trăng lưỡi liềm."),
               ("hang_sung_sot", 12, "Đảo Bồ Hòn, nơi có hang Sửng Sốt."),
               ("hang_luon", 12, "Vòm đá Hang Luồn."),
               ("lang_chai_cua_van", 24, "Làng chài nổi lớn nhất vịnh Hạ Long, nép giữa núi đá Vạn Giã.")]},
]

def lm(i):
    return next(l for l in LANDMARKS if l[0] == i)

def corridor_pts(c):
    out = []
    for p in c:
        if isinstance(p, str):
            l = lm(p); out.append(xz(l[2], l[3]))
        else:
            out.append(xz(*p))
    return out

def seg_dist(px, pz, a, b):
    ax, az = a; bx, bz = b; vx, vz = bx - ax, bz - az
    L = vx * vx + vz * vz or 1
    t = max(0, min(1, ((px - ax) * vx + (pz - az) * vz) / L))
    return math.hypot(ax + vx * t - px, az + vz * t - pz)

def in_poly(x, z, P):
    inside = False
    for i in range(len(P)):
        x1, z1 = P[i]; x2, z2 = P[i - 1]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1:
            inside = not inside
    return inside

def main():
    rnd = random.Random(20261119)
    corridors = [corridor_pts(c) for c in CORRIDORS]
    land = [poly(MAINLAND_WEST), poly(MAINLAND_EAST), poly(TUAN_CHAU), poly(CAUSEWAY)]

    landmark_rows = []
    for (i, name, lat, lon, shape, r, h, prec, src, desc) in LANDMARKS:
        x, z = xz(lat, lon)
        landmark_rows.append({"id": i, "name": name, "lat": lat, "lon": lon, "x": x, "z": z, "shape": shape,
                              "radius": r, "height": h, "precision": prec, "source": src, "description": desc})

    def near_corridor(x, z, pad):
        return any(seg_dist(x, z, c[k], c[k + 1]) < CORRIDOR_HALF_WIDTH + pad for c in corridors for k in range(len(c) - 1))

    karsts = []
    for zone in KARST_ZONES:
        P = poly(zone["pts"])
        xs = [p[0] for p in P]; zs = [p[1] for p in P]
        made, tries = 0, 0
        while made < zone["count"] and tries < zone["count"] * 60:
            tries += 1
            x = rnd.uniform(min(xs), max(xs)); z = rnd.uniform(min(zs), max(zs))
            if not in_poly(x, z, P):
                continue
            # Dáng núi: 0 tháp cao mảnh · 1 chóp nhọn · 2 đồi tròn · 3 dãy dài yên ngựa · 4 hai đỉnh
            #          5 nấm thắt chân · 6 răng nghiêng · 7 hòn nhỏ sát nước
            shape = rnd.choices(range(8), weights=[16, 16, 14, 10, 10, 8, 8, 18])[0]
            r, h = {0: (rnd.uniform(9, 20), 0), 1: (rnd.uniform(18, 38), 0), 2: (rnd.uniform(24, 52), 0), 3: (rnd.uniform(26, 50), 0),
                    4: (rnd.uniform(20, 36), 0), 5: (rnd.uniform(13, 26), 0), 6: (rnd.uniform(9, 17), 0), 7: (rnd.uniform(4, 10), 0)}[shape]
            h = {0: r * rnd.uniform(3.2, 5.0), 1: r * rnd.uniform(2.0, 3.0), 2: r * rnd.uniform(.55, 1.0), 3: r * rnd.uniform(.9, 1.5),
                 4: r * rnd.uniform(1.6, 2.5), 5: r * rnd.uniform(1.7, 2.6), 6: r * rnd.uniform(2.6, 4.0), 7: r * rnd.uniform(1.0, 2.2)}[shape] + rnd.uniform(2, 12)
            er = r * (1.9 if shape == 3 else 1.0)          # bán kính hiệu dụng (dãy dài kéo dài 1,9 lần)
            if near_corridor(x, z, er):
                continue
            if any(in_poly(x, z, L) for L in land):
                continue
            if any(math.hypot(l["x"] - x, l["z"] - z) < (l["radius"] or 40) + er + 70 for l in landmark_rows):
                continue
            if any(math.hypot(k[0] - x, k[1] - z) < (k[2] * (1.9 if k[4] == 3 else 1) + er) * .9 for k in karsts):
                continue
            karsts.append([round(x, 1), round(z, 1), round(r, 1), round(h, 1), shape])
            made += 1

    # Điểm tàu ghé (trong luồng, cách danh thắng một khoảng an toàn)
    for l in landmark_rows:
        best = None
        for c in corridors:
            for k in range(len(c) - 1):
                (ax, az), (bx, bz) = c[k], c[k + 1]
                vx, vz = bx - ax, bz - az; L = vx * vx + vz * vz or 1
                t = max(0, min(1, ((l["x"] - ax) * vx + (l["z"] - az) * vz) / L))
                px, pz = ax + vx * t, az + vz * t
                d = math.hypot(px - l["x"], pz - l["z"])
                if best is None or d < best[0]:
                    best = (d, px, pz)
        d, px, pz = best
        want = (l["radius"] or 0) + 55
        if d < want:  # đẩy điểm ghé ra xa đảo
            if d < 1:
                px, pz = l["x"] + want, l["z"]
            else:
                px, pz = l["x"] + (px - l["x"]) / d * want, l["z"] + (pz - l["z"]) / d * want
        l["approach"] = [round(px, 1), round(pz, 1)]
    port = next(l for l in landmark_rows if l["id"] == "cang_tuan_chau")
    port["approach"] = [port["x"] + 40, port["z"] + 60]
    # Bến hang Sửng Sốt nằm ở phía đảo Bồ Hòn nhìn sang Ti Tốp (tàu ghé ở vùng nước giữa hai đảo)
    ss = next(l for l in landmark_rows if l["id"] == "hang_sung_sot"); tt = next(l for l in landmark_rows if l["id"] == "dao_ti_top")
    ang = math.atan2(tt["approach"][1] - ss["z"], tt["approach"][0] - ss["x"]) + 0.8; dd = ss["radius"] * 1.25 + 26 + 30
    ss["approach"] = [round(ss["x"] + math.cos(ang) * dd, 1), round(ss["z"] + math.sin(ang) * dd, 1)]
    bridge = next(l for l in landmark_rows if l["id"] == "cau_bai_chay")
    bridge["approach"] = [bridge["x"] - 20, bridge["z"] + 190]

    # Thuyền gỗ nhỏ chạy vòng trong vùng nước thoáng; phao vịnh dọc luồng.
    junks, buoys = [], []
    for c in corridors[:1]:
        for k in range(1, len(c) - 1, 2):
            (ax, az), (bx, bz) = c[k], c[k + 1]
            junks.append({"id": f"thuyen_go_{len(junks)+1}", "kind": "junk_boat", "name": "Thuyền gỗ",
                          "x": round((ax + bx) / 2, 1), "z": round((az + bz) / 2, 1),
                          "params": {"loop_radius": round(rnd.uniform(40, 70), 1), "speed": round(rnd.uniform(2.5, 4), 2),
                                     "phase": round(rnd.uniform(0, 6.28), 2), "hull": rnd.choice(["#7d5a3d", "#8a6446", "#6f4f36"])},
                          "activity": None})
        for k in range(len(c) - 1):
            (ax, az), (bx, bz) = c[k], c[k + 1]
            n = int(math.hypot(bx - ax, bz - az) // 240)
            for j in range(1, n + 1):
                t = j / (n + 1); vx, vz = bx - ax, bz - az; L = math.hypot(vx, vz)
                side = 1 if (len(buoys) % 2) else -1
                buoys.append({"id": f"phao_{len(buoys)+1}", "kind": "buoy", "name": "Phao luồng",
                              "x": round(ax + vx * t - vz / L * (CORRIDOR_HALF_WIDTH - 15) * side, 1),
                              "z": round(az + vz * t + vx / L * (CORRIDOR_HALF_WIDTH - 15) * side, 1),
                              "params": {"color": "#d8483a" if side > 0 else "#2f8a57"}, "activity": None})

    xs = [p[0] for L in land[2:] for p in L] + [k[0] for k in karsts] + [l["x"] for l in landmark_rows]
    zs = [k[1] for k in karsts] + [l["z"] for l in landmark_rows]
    bounds = {"x_min": round(min(xs) - 300), "x_max": round(max(xs) + 300), "z_min": round(min(zs) - 400), "z_max": round(max(zs) + 300)}

    data = {
        "version": 1,
        "map": {
            "id": "halong_bay", "kind": "bay", "name": "Vịnh Hạ Long · Du thuyền Yên", "status": "live",
            "sky_color": "#bcd8e8", "fog_color": "#cfe0e6", "fog_density": 0.00105, "ground_color": "#2f9c8a",
            "hemi_sky": "#eaf4ff", "hemi_ground": "#3c7f72", "hemi_intensity": 1.9,
            "sun_color": "#fff2dc", "sun_intensity": 2.1, "sun_position": [60, 90, -40],
            "ambience": "sea_waves",
            "spawn": {"x": port["approach"][0], "z": port["approach"][1], "heading": 1.05},
            "bounds": bounds,
            "geo": {"origin_lat": LAT0, "origin_lon": LON0, "meters_per_unit": METERS_PER_UNIT,
                    "axes": "x = Đông, z = Nam", "note": "Toạ độ chiếu phẳng quanh cảng Tuần Châu; kích thước đảo được phóng đại để dễ nhìn"},
            "time_slots": {
                "morning": {"status": "live", "label": "Buổi sáng", "sky_top": "#7fb6dc", "sky_horizon": "#dfeef2", "haze": "#cfe0e6",
                            "sun_elevation": 0.55, "sun_azimuth": 2.4, "water_deep": "#1f7f74", "water_shallow": "#47b39d",
                            "cloud_cover": 0.42},
                "dawn_dusk": {"status": "draft", "label": "Bình minh / Hoàng hôn"},
                "night": {"status": "draft", "label": "Buổi tối", "lights": ["den_du_thuyen"]}
            },
            "active_time_slot": "morning",
            # Trang phục riêng của vịnh (rừng thông giữ trang phục cũ). group "sea" = đi biển, "zen" = trang phục thiền như ở Rừng Yên.
            "outfits": {
                "styles": [
                    {"id": "robe", "label": "Thiền phục"},
                    {"id": "tee_jeans", "label": "Áo thun · quần jean"},
                    {"id": "suit", "label": "Vest lịch sự"},
                    {"id": "maxi", "label": "Đầm maxi đi chơi"},
                    {"id": "gown", "label": "Đầm dài dạ tiệc"}
                ],
                "accessories": [{"id": "hat", "label": "Nón"}, {"id": "glasses", "label": "Kính"}, {"id": "scarf", "label": "Khăn"}],
                "colors": [["Vàng", "#d9b67d"], ["Xanh", "#90b7a5"], ["Kem", "#f0e5d4"], ["Tím", "#b5a1c7"], ["Rêu", "#687b48"], ["Hồng", "#e8a1b4"]],
                "default": {"style": "tee_jeans", "color": "#90b7a5", "acc": ["hat"]}
            }
        },
        "nature": [
            {"id": "halong_bay.sea", "kind": "sea", "sort_order": 1, "params": {"wave_scale": 1, "swell": 0.35}},
            {"id": "halong_bay.coast", "kind": "land", "sort_order": 2,
             "params": {"polygons": [{"name": "Bãi Cháy", "pts": land[0], "height": 14, "color": "#6f9a62", "hills": 26},
                                     {"name": "Hòn Gai", "pts": land[1], "height": 16, "color": "#6a965f", "hills": 22},
                                     {"name": "Đảo Tuần Châu", "pts": land[2], "height": 8, "color": "#78a46c", "hills": 5},
                                     {"name": "Đường nối Tuần Châu", "pts": land[3], "height": 3, "color": "#c9bfa4"}],
                        "precision": "approx"}},
            {"id": "halong_bay.backdrop", "kind": "backdrop", "sort_order": 0,
             "params": {"style": "painted_panorama", "seed": 1119, "radius": 2200, "top": 420, "haze": "#cfe0e6",
                        "far_rock": "#a9bdbf", "near_rock": "#7f9a8c", "leaf": "#6f8f62", "north_span": 0.75,
                        "note": "Phông tranh 360° vẽ bằng code: các lớp núi đá xa sau đảo 3D; hướng bắc là đồi bờ Hạ Long"}},
            {"id": "halong_bay.karsts", "kind": "karst_field", "sort_order": 3,
             "params": {"seed": 20261119, "zones": [z["name"] for z in KARST_ZONES],
                        "fields": ["x", "z", "radius", "height", "shape"], "shapes": ["tháp", "chóp nhọn", "đồi tròn", "dãy dài", "hai đỉnh", "nấm", "răng nghiêng", "hòn nhỏ"], "items": karsts}},
            {"id": "halong_bay.channels", "kind": "channels", "sort_order": 4,
             "params": {"half_width": CORRIDOR_HALF_WIDTH, "lines": [[list(p) for p in c] for c in corridors]}},
        ],
        "rooms": [
            {"id": "du_thuyen_mui", "name": "Mũi du thuyền", "topic": "anyen:room:halong-bow", "capacity": 30, "kind": "public", "palette_color": "#1d4f52"},
            {"id": "du_thuyen_sanh", "name": "Sảnh lễ tân & Nhà hàng", "topic": "anyen:room:halong-lobby", "capacity": 30, "kind": "public", "palette_color": "#3a3226", "interior": {"status": "draft"}},
            {"id": "du_thuyen_tra", "name": "Khoang Trà đạo & Piano", "topic": "anyen:room:halong-tea", "capacity": 12, "kind": "public", "palette_color": "#2e3a2e", "interior": {"status": "draft"}},
            {"id": "du_thuyen_sundeck", "name": "Boong thượng Sundeck", "topic": "anyen:room:halong-sundeck", "capacity": 20, "kind": "public", "palette_color": "#204a5a", "interior": {"status": "draft"}},
            {"id": "du_thuyen_cabin", "name": "Phòng nghỉ Ban công & Spa", "topic": "anyen:room:halong-cabin", "capacity": 4, "kind": "public", "palette_color": "#3d3540", "interior": {"status": "draft"}},
        ],
        "buildings": [
            {"id": "du_thuyen_yen", "name": "Du thuyền Yên", "kind": "cruise_ship", "x": port["approach"][0], "z": port["approach"][1],
             "exterior": {"length": 46, "beam": 10, "decks": 3, "hull_color": "#2f8c8a", "body_color": "#f4f2ec", "deck_wood": "#b98a5c",
                          "glass": "#3f5f6c", "max_speed": 10, "turn_rate": 0.45, "clearance": 26, "bow_spot": [0, 2.62, 18.8],
                          "deck_spot": [0, 11.06, -1.4],
                          "real_speed_kmh": 15, "real_speed_note": "Tốc độ ước tính của tàu du lịch trên vịnh, dùng để tính thời gian ngoài đời",
                          "views": [{"id": "bow", "label": "Mũi tàu", "note": "Đứng ở mũi tàu, nhìn về phía trước"},
                                    {"id": "sundeck", "label": "Boong thượng", "note": "Lên tầng cao nhất, ngắm toàn cảnh"},
                                    {"id": "far", "label": "Ngắm tàu từ xa", "note": "Nhìn cả du thuyền lướt giữa các đảo"},
                                    {"id": "spin", "label": "Tự xoay 360°", "note": "Góc nhìn chậm rãi xoay quanh"}]},
             "entry": {"label": "Vào du thuyền", "status": "draft", "rooms": ["du_thuyen_sanh", "du_thuyen_tra", "du_thuyen_sundeck", "du_thuyen_cabin"]},
             "room_id": "du_thuyen_mui"},
        ],
        "props": [{"id": l["id"], "kind": "landmark", "name": l["name"], "x": l["x"], "z": l["z"],
                   "params": {k: l[k] for k in ("lat", "lon", "shape", "radius", "height", "precision", "source", "description", "approach")},
                   "activity": {"dao_ti_top": "swim", "hang_luon": "kayak", "lang_chai_cua_van": "kayak"}.get(l["id"])}
                  for l in landmark_rows] + junks + buoys + [
                  {"id": t["id"], "kind": "tour", "name": t["name"], "x": port["approach"][0], "z": port["approach"][1],
                   "params": {"summary": t["summary"], "stops": [{"landmark": i, "dwell": d, "note": n} for i, d, n in t["stops"]]},
                   "activity": "cruise_stand"} for t in TOURS],
        "npcs": [
            {"id": "thuyen_truong", "name": "Thuyền trưởng Hải", "role": "captain", "x": 0, "z": 6, "facing": 0, "greet_radius": 5,
             "greeting": "Chào bạn, hôm nay biển lặng, mình đưa bạn đi ngắm vịnh nhé.", "dialogue": [], "ai_enabled": False, "ai_config": None, "active": False},
            {"id": "le_tan", "name": "Lễ tân Mai", "role": "cruise_receptionist", "x": 0, "z": 0, "facing": 0, "greet_radius": 4,
             "greeting": "Chào mừng bạn lên Du thuyền Yên.", "dialogue": [], "ai_enabled": False, "ai_config": None, "active": False},
            {"id": "tra_chu", "name": "Trà chủ An", "role": "tea_master", "x": 0, "z": -6, "facing": 0, "greet_radius": 4,
             "greeting": "Mời bạn một chén trà, ngắm vịnh cho lòng lắng lại.", "dialogue": [], "ai_enabled": False, "ai_config": None, "active": False},
        ],
    }
    out = os.path.join(os.path.dirname(__file__), "..", "data", "world-halong_bay.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("karsts", len(karsts), "junks", len(junks), "buoys", len(buoys), "bounds", bounds, "bytes", os.path.getsize(out))

if __name__ == "__main__":
    main()
