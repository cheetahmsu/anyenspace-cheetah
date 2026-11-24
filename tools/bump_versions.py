"""Cập nhật số ?v= theo nội dung tệp (md5, 8 ký tự). Chạy sau mỗi lần sửa: python3 tools/bump_versions.py
Thứ tự quan trọng: dữ liệu vịnh -> bay3d.js -> world3d.js -> index.html, vì tệp sau chứa số ?v= của tệp trước.
Vịnh Yên (bay3d.js và data/world-halong_bay.json) được lưu trên máy người dùng và chỉ tải lại khi số ?v= đổi."""
import hashlib, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
def h(p): return hashlib.md5(open(os.path.join(ROOT, p), "rb").read()).hexdigest()[:8]
def sub(f, path):
    fp = os.path.join(ROOT, f); s = open(fp, encoding="utf-8").read()
    n = re.sub(re.escape(path) + r"\?v=[0-9a-f]+", path + "?v=" + h(path), s)
    if n != s: open(fp, "w", encoding="utf-8").write(n); print(f, "->", path, h(path))
sub("js/bay3d.js", "data/world-halong_bay.json")
for p in ["js/bay3d.js", "js/rooms3d.js"]: sub("js/world3d.js", p)
for p in ["js/world3d.js", "js/forest-sound.js", "space-chat.js", "css/langyen.css"]: sub("index.html", p)
