# Root Facts React — Rencana Pengembangan Lengkap

> Dokumen ini merupakan panduan kerja untuk menyelesaikan submission Root Facts App menggunakan starter project React. Target penilaian: **Bintang 5 (Advanced — 4 pts di setiap kriteria)**.

---

## Ringkasan Proyek

Root Facts App adalah aplikasi web berbasis React yang menggabungkan dua kemampuan AI di sisi klien (client-side):

1. **Si Mata — Computer Vision** dengan TensorFlow.js untuk mendeteksi jenis sayuran lewat kamera.  
2. **Si Otak — Generative AI** dengan Transformers.js untuk menghasilkan fun fact unik tentang sayuran yang terdeteksi.

Aplikasi wajib berjalan secara offline (PWA), di-deploy ke Netlify, dan memenuhi standar linter ESLint.

---

## Struktur Starter Project

```
root-facts-react-starter/
├── index.html                 # Entry HTML, sudah siap PWA meta tags
├── package.json               # Dependencies sudah tersedia (TF.js, Transformers.js, Vite PWA)
├── vite.config.js             # Vite + React plugin, port 3001
├── eslint.config.mjs          # ESLint Dicoding Academy style
├── STUDENT.txt                # Tempat URL deploy
├── public/
│   ├── favicon.ico
│   ├── icons/                 # Ikon PWA (192x192, 512x512, apple-touch)
│   ├── model/                 # Pre-trained model (model.json, weights.bin, metadata.json)
│   └── screenshots/           # Kosong — perlu diisi untuk manifest PWA
├── src/
│   ├── main.jsx               # Entry React
│   ├── App.jsx                # Komponen utama (berisi TODO)
│   ├── index.css              # Stylesheet lengkap
│   ├── components/
│   │   ├── Header.jsx         # Header dengan status model
│   │   ├── CameraSection.jsx  # Kamera, kontrol FPS, pemilihan tone
│   │   └── InfoPanel.jsx      # Panel hasil deteksi & fun fact
│   ├── hooks/
│   │   └── useAppState.js     # State management dengan useReducer
│   ├── services/
│   │   ├── CameraService.js   # Akses kamera (TODO)
│   │   ├── DetectionService.js# Prediksi model TF.js (TODO)
│   │   └── RootFactsService.js# Generasi teks Transformers.js (TODO)
│   └── utils/
│       ├── common.js          # Helper: isWebGPUSupported, logError, dll
│       ├── config.js          # APP_CONFIG, TONE_CONFIG
│       └── ui.js              # Style helpers
```

Label sayuran yang dikenali model:  
`Beetroot, Paprika, Cabbage, Carrot, Cauliflower, Chilli, Corn, Cucumber, Eggplant, Garlic, Ginger, Lettuce, Onion, Peas, Potato, Turnip, Soybean, Spinach`

---

## Peta Penilaian — Target 4 pts per Kriteria

### Kriteria 1: Deteksi Sayuran (Computer Vision)

| Level | Syarat | Status |
|-------|--------|--------|
| Basic (2) | Streaming kamera aktif, model TF.js dimuat, label sayuran muncul otomatis | Perlu dikerjakan |
| Skilled (3) | FPS Limit via UI, indikator loading + persentase saat model dimuat | Perlu dikerjakan |
| Advanced (4) | Backend Adaptif (WebGPU → WebGL fallback), manajemen memori tf.tidy()/dispose(), arsitektur React | Perlu dikerjakan |

### Kriteria 2: Generative AI (Fun Fact)

| Level | Syarat | Status |
|-------|--------|--------|
| Basic (2) | Label hasil deteksi dikirim ke prompt AI, fun fact unik per sayuran | Perlu dikerjakan |
| Skilled (3) | Copy to Clipboard, pengaturan temperature/max_new_tokens/top_p/do_sample | Perlu dikerjakan |
| Advanced (4) | Persona Dinamis (dropdown gaya bahasa → ubah gaya penulisan AI), Backend Adaptif Transformers.js | Perlu dikerjakan |

### Kriteria 3: Offline & Deployment

| Level | Syarat | Status |
|-------|--------|--------|
| Basic (2) | Deploy ke Netlify, Web App Manifest + Service Worker (Workbox), Precaching aset inti, URL di STUDENT.txt | Perlu dikerjakan |
| Skilled (3) | ESLint aktif, aplikasi bisa diinstal (installable PWA) | ESLint sudah dikonfigurasi |
| Advanced (4) | Precaching model AI (.json + .bin) di SW agar deteksi offline tetap jalan | Perlu dikerjakan |

---

## Rencana Kerja — To-Do List

### Fase 1: Layanan Kamera (`CameraService.js`)

- [ ] **1.1** Implementasi `loadCameras()` — enumerate perangkat input video via `navigator.mediaDevices.enumerateDevices()`, simpan daftar kamera.
- [ ] **1.2** Implementasi `startCamera(selectedCameraId)` — buat constraints dengan resolusi optimal, panggil `getUserMedia()`, hubungkan stream ke elemen `<video>`.
- [ ] **1.3** Implementasi `stopCamera()` — hentikan semua track pada stream, reset elemen video, bersihkan referensi stream.
- [ ] **1.4** Implementasi `setFPS(fps)` — simpan konfigurasi FPS untuk digunakan di loop deteksi (kontrol interval antar prediksi).
- [ ] **1.5** Implementasi `isActive()` — return boolean apakah stream masih hidup.
- [ ] **1.6** Implementasi `isReady()` — cek apakah elemen video memiliki data (`readyState >= 2`).

### Fase 2: Layanan Deteksi (`DetectionService.js`)

- [ ] **2.1** Implementasi `loadModel()`:
  - Cek `navigator.gpu` → jika tersedia, set backend `webgpu` via `tf.setBackend('webgpu')`. Jika tidak, fallback ke `webgl`.
  - Panggil `tf.ready()` setelah set backend.
  - Muat model via `tf.loadLayersModel('/model/model.json')`.
  - Muat metadata via `fetch('/model/metadata.json')` untuk daftar label.
  - Kirim progress (persentase) ke UI selama proses loading.
- [ ] **2.2** Implementasi `predict(imageElement)`:
  - Bungkus seluruh prediksi dalam `tf.tidy()` untuk manajemen memori otomatis.
  - Konversi elemen gambar/video ke tensor, resize ke 224×224, normalisasi.
  - Jalankan `model.predict(tensor)` dan ambil hasil prediksi tertinggi.
  - Return objek `{ className, score, isValid }`.
- [ ] **2.3** Implementasi `isLoaded()` — cek apakah model dan label sudah tersedia.

### Fase 3: Layanan Generative AI (`RootFactsService.js`)

- [ ] **3.1** Implementasi `loadModel()`:
  - Import `pipeline` dari `@huggingface/transformers`.
  - Cek `navigator.gpu` → pilih device `webgpu` atau `wasm` sebagai fallback.
  - Buat pipeline `text2text-generation` dengan model ringan (misal `Xenova/LaMini-Flan-T5-248M`) dan `{ dtype: "q4" }`.
  - Set `isModelLoaded = true` setelah berhasil.
- [ ] **3.2** Implementasi `setTone(tone)` — simpan tone yang dipilih ke `this.currentTone`.
- [ ] **3.3** Implementasi `generateFacts(vegetableName)`:
  - Bangun prompt bahasa Inggris yang menyertakan nama sayuran dan instruksi tone (normal/funny/professional/casual).
  - Konfigurasikan parameter generasi: `max_new_tokens: 150`, `temperature: 0.7`, `top_p: 0.9`, `do_sample: true`.
  - Jalankan `this.generator(prompt, options)` dan return hasilnya.
  - Tangani error dengan graceful fallback.
- [ ] **3.4** Implementasi `isReady()` — cek `isModelLoaded` dan `generator !== null`.

### Fase 4: Integrasi di Komponen Utama (`App.jsx`)

- [ ] **4.1** Inisialisasi layanan di `useEffect` saat mount:
  - Buat instance `DetectionService`, `CameraService`, `RootFactsService`.
  - Panggil `loadModel()` untuk kedua layanan AI secara paralel (`Promise.all` atau sequential).
  - Update `modelStatus` dengan progress persentase (misal: "Memuat Model... 30%").
  - Set status "Model AI Siap" ketika semua layanan berhasil dimuat.
  - Simpan instance layanan ke state via `actions.setServices()`.
- [ ] **4.2** Cleanup resources di `useEffect` return:
  - Panggil `stopCamera()` dan dispose model saat komponen unmount.
- [ ] **4.3** Implementasi fungsi `startDetectionLoop`:
  - Jika kamera ready, ambil frame dari video.
  - Panggil `predict()` pada `DetectionService`.
  - Jika hasil prediksi valid (confidence ≥ threshold), update state dengan hasil.
  - Hentikan kamera, set state ke `analyzing`, lalu panggil `generateFacts()`.
  - Tampilkan fun fact di UI, set state ke `result`.
  - Gunakan `requestAnimationFrame` atau `setTimeout` dengan interval berdasarkan FPS setting.
- [ ] **4.4** Implementasi `handleToggleCamera`:
  - Jika belum jalan → `startCamera()`, set `isRunning = true`, mulai detection loop.
  - Jika sedang jalan → `stopCamera()`, cleanup, reset state.
- [ ] **4.5** Implementasi `handleToneChange(tone)`:
  - Update state `currentTone`.
  - Panggil `services.generator.setTone(tone)`.
- [ ] **4.6** Implementasi `handleCopyFact`:
  - Gunakan `navigator.clipboard.writeText(funFactData)`.
  - Tampilkan feedback visual (misal ubah ikon jadi centang sesaat).
- [ ] **4.7** Hubungkan semua handler ke props di `CameraSection` dan `InfoPanel`:
  - `onToggleCamera` → `handleToggleCamera`
  - `onToneChange` → `handleToneChange`
  - `onCopyFact` → `handleCopyFact`

### Fase 5: Indikator Loading dengan Persentase (`Header.jsx` & `App.jsx`)

- [ ] **5.1** Tambahkan mekanisme tracking progress pada model loading:
  - Hitung progress: mulai dari 0%, increment saat TF.js backend siap (20%), model loaded (50%), metadata loaded (60%), Transformers.js pipeline siap (100%).
  - Tampilkan di `modelStatus` format: "Memuat Model... 50%".
- [ ] **5.2** Tampilkan status terkini di pill status pada Header.

### Fase 6: Konfigurasi PWA (`vite.config.js`)

- [ ] **6.1** Konfigurasi `vite-plugin-pwa` di `vite.config.js`:
  - `registerType: 'autoUpdate'` agar SW otomatis update.
  - Definisikan `manifest` lengkap:
    - `name`, `short_name`, `description`, `theme_color`, `background_color`
    - `icons`: array dengan ikon 192x192 dan 512x512 (maskable + any)
    - `start_url: '/'`, `display: 'standalone'`
    - `screenshots` (opsional untuk installability)
  - Konfigurasi `workbox`:
    - `globPatterns`: include semua aset inti (`**/*.{js,css,html,ico,png,svg,woff2}`).
    - Tambahkan `additionalManifestEntries` untuk file model:
      - `/model/model.json`
      - `/model/weights.bin`
      - `/model/metadata.json`
    - Set `maximumFileSizeToCacheInBytes` cukup besar untuk `weights.bin` (~2.2MB).
    - Tambahkan `runtimeCaching` untuk Google Fonts dan aset CDN.

### Fase 7: Registrasi Service Worker (`main.jsx`)

- [ ] **7.1** Import dan panggil `registerSW` dari `virtual:pwa-register`:
  ```js
  import { registerSW } from 'virtual:pwa-register';
  registerSW({ immediate: true });
  ```
- [ ] **7.2** Pastikan SW terdaftar dan aktif di DevTools → Application → Service Workers.

### Fase 8: Validasi ESLint

- [ ] **8.1** Jalankan `npm run lint` dan pastikan tidak ada error.
- [ ] **8.2** Perbaiki warning atau error jika ada (aturan Dicoding Academy).

### Fase 9: Screenshot PWA

- [ ] **9.1** Ambil screenshot aplikasi (minimal 1 narrow + 1 wide) untuk folder `public/screenshots/`.
- [ ] **9.2** Tambahkan referensi screenshot di manifest jika diperlukan untuk installability.

### Fase 10: Build & Deploy

- [ ] **10.1** Jalankan `npm run build` dan pastikan build berhasil tanpa error.
- [ ] **10.2** Test production build via `npm run preview` — verifikasi:
  - Kamera berfungsi.
  - Model TF.js dan Transformers.js dimuat.
  - Fun fact dihasilkan sesuai tone.
  - Copy to clipboard berfungsi.
  - Aplikasi bisa diinstal (tombol install muncul).
  - Service Worker aktif dan cache terisi.
  - Mode offline: buka tanpa internet, halaman tetap tampil, deteksi masih jalan (model dari cache).
- [ ] **10.3** Deploy ke Netlify:
  - Buat site baru atau hubungkan repo.
  - Set build command: `npm run build`.
  - Set publish directory: `dist`.
- [ ] **10.4** Isi URL deploy di `STUDENT.txt`:
  ```
  APP_URL=https://<nama-app>.netlify.app
  ```

### Fase 11: Verifikasi Akhir

- [ ] **11.1** Buka URL production di browser.
- [ ] **11.2** Periksa DevTools → Application:
  - Service Worker: status active.
  - Manifest: terdeteksi dengan benar, ikon tampil.
  - Cache Storage: berisi aset inti + file model.
- [ ] **11.3** Matikan internet, refresh → pastikan halaman tetap tampil dan model tetap bisa dipakai.
- [ ] **11.4** Test install app → pastikan prompt install muncul.
- [ ] **11.5** Pastikan ESLint clean: `npm run lint` tanpa error.
- [ ] **11.6** Cross-check semua kriteria Advanced terpenuhi.

---

## Detail Teknis Penting

### Backend Adaptif (TensorFlow.js)

```javascript
// Di DetectionService.loadModel()
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

async loadModel(onProgress) {
  try {
    if (navigator.gpu) {
      await tf.setBackend('webgpu');
    } else {
      await tf.setBackend('webgl');
    }
    await tf.ready();
    onProgress?.(20);
    
    this.model = await tf.loadLayersModel('/model/model.json');
    onProgress?.(50);
    
    const metaResponse = await fetch('/model/metadata.json');
    const metadata = await metaResponse.json();
    this.labels = metadata.labels;
    onProgress?.(60);
  } catch (error) {
    // fallback ke webgl jika webgpu gagal
    await tf.setBackend('webgl');
    await tf.ready();
    // lanjutkan load model...
  }
}
```

### Manajemen Memori (tf.tidy)

```javascript
// Di DetectionService.predict()
async predict(imageElement) {
  return tf.tidy(() => {
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims(0);
    
    const prediction = this.model.predict(tensor);
    const scores = prediction.dataSync();
    const maxIndex = scores.indexOf(Math.max(...scores));
    
    return {
      className: this.labels[maxIndex],
      score: scores[maxIndex],
      isValid: true,
    };
  });
}
```

### Prompt Engineering per Tone

```javascript
// Di RootFactsService.generateFacts()
const toneInstructions = {
  normal: 'Write a fun fact about',
  funny: 'Write a hilarious and humorous fun fact about',
  professional: 'Write a scientific and professional fact about',
  casual: 'Write a casual and friendly fun fact about',
};

const prompt = `${toneInstructions[this.currentTone]} ${vegetableName}. Keep it concise and interesting.`;
```

### Konfigurasi PWA (vite-plugin-pwa)

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'RootFacts - Fakta Sayuran AI',
        short_name: 'RootFacts',
        description: 'Kenali sayuran lewat kamera dan temukan fakta menarik dengan AI',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
});
```

---

## Catatan Pendekatan Pengerjaan

- **Prompt AI dalam bahasa Inggris** — sesuai tips agar hasil generasi lebih baik.
- **max_new_tokens: 150** — menjaga responsivitas browser, mencegah freeze.
- **dtype: "q4"** — mengurangi ukuran download model Transformers.js.
- **Model yang direkomendasikan**: `Xenova/LaMini-Flan-T5-248M` atau model text2text-generation ringan lainnya yang kompatibel dengan Transformers.js.
- **Pengujian di tempat terang** — model dilatih sederhana, deteksi lebih stabil di lingkungan terang tanpa objek lain di latar.
- **Fokus pada alur kode** — bukan ketepatan deteksi, karena model sifatnya sederhana.

---

## Checklist Ringkas untuk Bintang 5

| No | Item | Kriteria |
|----|------|----------|
| 1 | Kamera streaming aktif + label sayuran otomatis | K1 Basic |
| 2 | FPS Limit bisa diatur via slider | K1 Skilled |
| 3 | Indikator loading + persentase saat model dimuat | K1 Skilled |
| 4 | Backend Adaptif: WebGPU → WebGL fallback (TF.js) | K1 Advanced |
| 5 | Manajemen memori: tf.tidy() di setiap siklus prediksi | K1 Advanced |
| 6 | Arsitektur React (sudah pakai React starter) | K1 Advanced |
| 7 | Label sayuran dikirim ke prompt AI secara dinamis | K2 Basic |
| 8 | Fun fact unik per sayuran tampil di UI | K2 Basic |
| 9 | Copy to Clipboard berfungsi | K2 Skilled |
| 10 | Parameter generasi: temperature, max_new_tokens, top_p, do_sample | K2 Skilled |
| 11 | Persona Dinamis: dropdown tone → ubah gaya AI | K2 Advanced |
| 12 | Backend Adaptif: WebGPU → WebGL fallback (Transformers.js) | K2 Advanced |
| 13 | Deploy ke Netlify | K3 Basic |
| 14 | Web App Manifest + Service Worker (Workbox) | K3 Basic |
| 15 | Precaching aset inti (HTML, CSS, JS) | K3 Basic |
| 16 | URL deploy di STUDENT.txt | K3 Basic |
| 17 | ESLint dikonfigurasi dan berjalan | K3 Skilled |
| 18 | Aplikasi installable (tombol Install muncul) | K3 Skilled |
| 19 | Precaching model AI (.json + .bin) → offline detection | K3 Advanced |
