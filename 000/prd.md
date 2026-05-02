# PRD — RootFacts (React) Target Bintang 5

Tanggal: 2 Mei 2026  
Project: RootFacts — Web AI Assistant (Computer Vision + Generative AI + PWA)

## 1) Ringkasan

RootFacts adalah aplikasi web berbasis React yang:

1. mengenali jenis sayuran lewat kamera (Computer Vision, TensorFlow.js), dan
2. menghasilkan fun fact unik berdasarkan hasil deteksi (Generative AI lokal, Transformers.js),
3. tetap bisa dibuka dan digunakan saat offline (PWA + Workbox), termasuk model deteksi (file `.json` dan `.bin`) harus tersedia dari cache.

Dokumen ini adalah rencana pengembangan agar memenuhi seluruh kriteria Advanced (4 pts) untuk masing-masing kriteria, sehingga target akhir aman untuk Bintang 5.

> NOTE (sesuai instruksi task): referensi gambar untuk pengecekan DevTools/Workbox ada di folder `000/` dan harus dicocokkan berdasarkan nama file gambarnya.

## 2) Tujuan & Target Penilaian

### Tujuan fungsional

- Pengguna bisa memberi izin kamera dan melihat stream.
- Aplikasi menampilkan label sayuran yang terdeteksi secara otomatis.
- Setelah label didapat, aplikasi menampilkan fun fact yang relevan dan berbeda tiap label.
- Aplikasi bisa diinstal (manifest + service worker valid).
- Aplikasi tetap bisa dibuka ketika offline, termasuk model deteksi tetap berfungsi karena file model sudah tercache.

### Target penilaian

- Kriteria 1 (Computer Vision): **Advanced (4 pts)**
- Kriteria 2 (Generative AI): **Advanced (4 pts)**
- Kriteria 3 (Offline Capability & Deployment): **Advanced (4 pts)**

## 3) Ruang Lingkup (Scope)

### In-scope

- Implementasi layanan kamera (MediaStream API) yang terhubung ke UI yang sudah ada.
- Implementasi model deteksi TensorFlow.js dari `public/model/`.
- Implementasi Generative AI memakai `@huggingface/transformers` (Transformers.js) di sisi klien.
- Persona/tone dinamis via dropdown yang sudah ada.
- Copy-to-clipboard untuk fun fact.
- PWA (manifest + service worker berbasis Workbox melalui `vite-plugin-pwa`) dan precaching aset inti + model deteksi.
- Deploy ke Netlify dan mengisi `STUDENT.txt`.

### Out-of-scope (agar tidak melebar)

- Tidak menambah halaman baru, modal baru, atau flow UX di luar UI starter.
- Tidak membuat sistem login, database, atau backend.
- Tidak mengirim frame kamera ke server (privacy: tetap on-device).

## 4) Persona & User Journey

### Persona utama

- Pengguna umum yang ingin memindai sayuran dan membaca fakta menarik.

### User journey

1. Pengguna membuka aplikasi.
2. Aplikasi menampilkan status model (loading → siap).
3. Pengguna menekan tombol “Mulai Scan”.
4. Browser meminta izin kamera → stream aktif.
5. Aplikasi menganalisis frame dan menampilkan hasil label + confidence.
6. Aplikasi menghasilkan fun fact (berdasarkan label + tone).
7. Pengguna menyalin fun fact via tombol copy.
8. Pengguna dapat menginstal aplikasi sebagai PWA.
9. Saat offline, aplikasi tetap bisa dibuka; model deteksi tetap bisa berjalan karena file model sudah tersimpan di Cache Storage.

## 5) Requirements per Kriteria (Bintang 5)

## 5.1) Kriteria 1 — Computer Vision (TensorFlow.js)

### Basic requirements

- [ ] Meminta & mengakses izin kamera (MediaStream API) tanpa error fatal.
- [ ] Model TFJS berhasil dimuat tanpa error console.
- [ ] UI menampilkan label prediksi secara otomatis saat objek terdeteksi.

### Skilled requirements

- [ ] FPS Limit dapat dikonfigurasi (dari slider FPS yang sudah ada di UI).
- [ ] Menampilkan status loading model disertai persentase (mis. “Memuat model… 0–100%”).

### Advanced requirements

- [ ] Backend adaptif: cek `navigator.gpu` → gunakan WebGPU, fallback otomatis ke WebGL.
- [ ] Manajemen memori disiplin: gunakan `tf.tidy()` atau `.dispose()` di setiap siklus prediksi agar tidak memory leak.
- [ ] Implementasi menggunakan React (sudah), integrasi mengikuti arsitektur starter (service + App orchestrator).

#### Acceptance criteria (Kriteria 1)

- Kamera menyala dan frame diproses tanpa freeze.
- Deteksi berjalan stabil dengan pencahayaan terang.
- `tf.memory()` tidak naik terus saat scanning (indikasi `tf.tidy()` benar).

## 5.2) Kriteria 2 — Generative AI (Transformers.js)

### Basic requirements

- [ ] Fun fact bukan statis: prompt dibangun dari label deteksi secara dinamis.
- [ ] Menggunakan Transformers.js (`@huggingface/transformers`) untuk generasi teks lokal.
- [ ] Output fun fact muncul di UI setelah deteksi.

### Skilled requirements

- [ ] Copy-to-clipboard untuk hasil AI.
- [ ] Parameter generasi diatur: `temperature`, `max_new_tokens` (≤150), `top_p`, `do_sample` untuk performa dan variasi.

### Advanced requirements

- [ ] Persona dinamis: tone (Normal/Lucu/Profesional/Santai) mengubah gaya tulisan.
- [ ] Backend adaptif: cek `navigator.gpu` untuk memakai jalur WebGPU bila ada; fallback otomatis bila tidak.
  - Catatan teknis: Transformers.js umumnya fallback ke WASM/CPU ketika WebGPU tidak tersedia. Implementasi tetap melakukan pengecekan `navigator.gpu`, lalu memilih device/backends yang sesuai.

#### Acceptance criteria (Kriteria 2)

- Fun fact berubah sesuai label (mis. “Garlic” vs “Carrot”).
- Mengubah tone menghasilkan gaya bahasa yang berbeda tanpa mengubah UX dasar.
- Tombol Copy bekerja (hasil bisa dipaste).

## 5.3) Kriteria 3 — Offline Capability & Deployment

### Basic requirements

- [ ] Aplikasi di-deploy ke Netlify dan dapat diakses publik.
- [ ] Web App Manifest valid & terdeteksi browser.
- [ ] Service Worker berbasis Workbox aktif.
- [ ] Precaching aset inti (HTML/CSS/JS) agar aplikasi tidak blank saat offline.
- [ ] `STUDENT.txt` berisi APP_URL.

### Skilled requirements

- [ ] Linter sudah ada (ESLint tersedia di starter) dan dijalankan minimal 1x sebelum rilis.
- [ ] Aplikasi dapat diinstal (install prompt muncul / “Add to Home Screen”).

### Advanced requirements

- [ ] Offline AI Model (deteksi): service worker precache file model deteksi:
  - `/model/metadata.json`
  - `/model/model.json`
  - `/model/weights.bin`
- [ ] Saat offline (mode pesawat), setelah aplikasi pernah dibuka online minimal 1x untuk menginstal SW, proses deteksi tetap berfungsi karena model di-cache.

#### Acceptance criteria (Kriteria 3)

- Network set ke Offline → reload tidak blank.
- Cache Storage berisi aset precache termasuk file model deteksi (`.json` & `.bin`).

## 6) Desain Teknis (Arsitektur)

Mengikuti struktur starter:

- UI (React components):
  - `Header` menampilkan `modelStatus`.
  - `CameraSection` mengelola elemen `video` dan `canvas` (refs) + kontrol kamera/FPS/tone.
  - `InfoPanel` menampilkan state idle/analyzing/result + tombol copy.
- State management: `useAppState` (useReducer) untuk `modelStatus`, `services`, `detectionResult`, `funFactData`, `isRunning`, `error`.
- Service layer:
  - `CameraService`: MediaStream + menyimpan setting FPS.
  - `DetectionService`: load model + predict (tf.tidy) + backend adaptif.
  - `RootFactsService`: load pipeline Transformers + generateFacts (params + tone).
- PWA:
  - `vite-plugin-pwa` (Workbox) untuk service worker & precaching.

## 7) To-do List (Implementasi) — Urutan yang Disarankan

> Catatan: ini adalah “work plan”, bukan perubahan kode sekarang. Implementasi dilakukan setelah PRD disetujui.

### Phase A — Setup dasar & wiring UI

- [ ] Pastikan tombol scan tidak terkunci hanya karena generator belum siap (status readiness dipisahkan).
- [ ] Pastikan `CameraSection` mengirim pilihan kamera (“Belakang/Depan”) ke App saat toggle.

### Phase B — CameraService (MediaStream)

- [ ] Enumerate device: `loadCameras()`.
- [ ] `startCamera()` (constraints facingMode/user/environment + fallback deviceId).
- [ ] `stopCamera()` stop tracks & cleanup.
- [ ] `setFPS(fps)` menyimpan konfigurasi untuk loop.
- [ ] `isActive()` & `isReady()`.

### Phase C — DetectionService (TFJS)

- [ ] Import backend webgpu TFJS dan implement backend adaptif.
- [ ] Load metadata + model dari `public/model/`.
- [ ] Tampilkan progress loading (persentase) pada `modelStatus`.
- [ ] Implement `predict()` dengan `tf.tidy()` dan output shape yang dipakai UI.
- [ ] Warm-up prediction 1x.

### Phase D — App Orchestrator (Loop deteksi + cleanup)

- [ ] Init services saat mount (handle StrictMode).
- [ ] Toggle start/stop scan.
- [ ] Loop deteksi throttled oleh FPS.
- [ ] Saat valid detection: stop scan, set result, trigger fun fact.
- [ ] Cleanup unmount.

### Phase E — RootFactsService (Transformers.js)

- [ ] Load pipeline text2text-generation.
- [ ] Gunakan model ringan + `dtype: "q4"`.
- [ ] Implement parameter generasi: `temperature`, `max_new_tokens` (≤150), `top_p`, `do_sample`.
- [ ] Prompt bahasa Inggris dengan instruksi output Bahasa Indonesia.
- [ ] Implement tone templates (Normal/Lucu/Profesional/Santai).
- [ ] Backend adaptif berbasis `navigator.gpu` (WebGPU bila ada, fallback bila tidak).

### Phase F — Copy to Clipboard

- [ ] Implement `navigator.clipboard.writeText()` dan pass handler ke `InfoPanel`.

### Phase G — PWA + Offline model

- [ ] Konfigurasi `vite-plugin-pwa` + Workbox.
- [ ] Pastikan manifest valid (nama, ikon, theme_color).
- [ ] Registrasi service worker di entry React.
- [ ] Precache aset inti + precache file model deteksi `/model/*`.
- [ ] Uji offline reload + uji deteksi offline.

### Phase H — Deploy Netlify & Submission

- [ ] Deploy ke Netlify.
- [ ] Isi `STUDENT.txt` dengan `APP_URL`.

## 8) Test Plan (Checklist Verifikasi)

### CV

- [ ] Kamera meminta izin & stream tampil.
- [ ] Label deteksi tampil otomatis.
- [ ] FPS slider berpengaruh (sebelum scan dimulai).
- [ ] Backend: WebGPU digunakan bila tersedia; fallback WebGL bila tidak.
- [ ] `tf.memory()` stabil selama scanning.

### GenAI

- [ ] Fun fact muncul setelah deteksi.
- [ ] Tone mengubah gaya tulisan.
- [ ] Copy berhasil.
- [ ] `max_new_tokens` ≤ 150 (tidak freeze).

### PWA/Offline

- [ ] DevTools → Application → Manifest terdeteksi.
- [ ] DevTools → Application → Service Worker aktif.
- [ ] Cache Storage berisi core assets + `/model/weights.bin`.
- [ ] Mode Offline → reload tidak blank.
- [ ] Mode Offline → deteksi masih bisa memuat model dari cache.

> Gunakan referensi gambar di folder `000/` (sesuai NOTE pada instruksi) untuk memastikan hasil pengecekan DevTools/Cache sesuai ekspektasi.

## 9) Risiko & Mitigasi

- WebGPU tidak tersedia/bug pada device tertentu → fallback WebGL (TFJS) dan fallback non-WebGPU untuk Transformers.
- Model generatif terlalu berat → gunakan model ringan + quantization q4, dan/atau lazy-load setelah deteksi pertama.
- Memory leak di loop deteksi → wajib `tf.tidy()` dan hindari menyimpan tensor.
- Offline caching quota → precache fokus pada model deteksi; perhatikan ukuran file `weights.bin`.

## 10) Catatan Etika & Orisinalitas Konten

- Fun fact dihasilkan secara lokal dan dinamis berdasarkan label + parameter sampling, bukan teks statis.
- Tidak menyalin teks dari sumber tertentu. Output generasi tetap perlu ditinjau singkat untuk memastikan relevan dan aman.
- Tidak ada jaminan “tidak terdeteksi AI”; fokus pada integrasi yang benar, output dinamis, dan review manual seperlunya.
