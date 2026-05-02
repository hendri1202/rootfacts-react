import { useRef, useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CameraSection from './components/CameraSection';
import InfoPanel from './components/InfoPanel';
import { useAppState } from './hooks/useAppState';
import { DetectionService } from './services/DetectionService';
import { CameraService } from './services/CameraService';
import { RootFactsService } from './services/RootFactsService';
import { APP_CONFIG, isValidDetection } from './utils/config';
import { logError, createDelay } from './utils/common';

function App() {
  const { state, actions } = useAppState();
  const detectionCleanupRef = useRef(null);
  const isRunningRef = useRef(false);
  const stableDetectionRef = useRef({ label: null, count: 0, startedAt: 0 });
  const [currentTone, setCurrentTone] = useState('normal');
  const servicesRef = useRef({ detector: null, camera: null, generator: null });

  // ===== Fase 4.1: Inisialisasi layanan saat komponen dimuat =====
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const detector = new DetectionService();
      const camera = new CameraService();
      const generator = new RootFactsService();

      servicesRef.current = { detector, camera, generator };
      actions.setServices({ detector, camera, generator });

      try {
        actions.setModelStatus('Memuat Model AI... 0%');

        // muat model deteksi dulu — biasanya lebih cepat
        await detector.loadModel((pct) => {
          if (!cancelled) {
            actions.setModelStatus(`Memuat Model AI... ${pct}%`);
          }
        });

        // sekarang muat model generatif
        await generator.loadModel((pct) => {
          if (!cancelled) {
            actions.setModelStatus(`Memuat Model AI... ${pct}%`);
          }
        });

        // muat daftar kamera
        await camera.loadCameras();

        if (!cancelled) {
          actions.setModelStatus('Model AI Siap');
        }
      } catch (err) {
        logError('Inisialisasi', err);
        if (!cancelled) {
          actions.setModelStatus('Gagal Memuat Model');
          actions.setError('Model AI gagal dimuat. Coba refresh halaman.');
        }
      }
    }

    bootstrap();

    // Fase 4.2: Cleanup saat komponen unmount
    return () => {
      cancelled = true;
      const { camera } = servicesRef.current;
      if (camera) camera.stopCamera();
      isRunningRef.current = false;
    };
  }, []);

  // ===== Fase 4.3: Loop deteksi =====
  const startDetectionLoop = useCallback(() => {
    const { detector, camera, generator } = servicesRef.current;
    if (!detector || !camera || !generator) return;

    let loopId = null;

    const loop = async () => {
      if (!isRunningRef.current) return;

      // pastikan video sudah siap
      if (!camera.isReady()) {
        loopId = setTimeout(loop, APP_CONFIG.detectionRetryInterval);
        return;
      }

      try {
        const result = await detector.predict(camera.video);
        const scanDuration = Date.now() - stableDetectionRef.current.startedAt;

        if (result && isValidDetection(result)) {
          if (stableDetectionRef.current.label === result.className) {
            stableDetectionRef.current.count += 1;
          } else {
            stableDetectionRef.current.label = result.className;
            stableDetectionRef.current.count = 1;
          }
        } else {
          stableDetectionRef.current.label = null;
          stableDetectionRef.current.count = 0;
        }

        const isStableDetection = stableDetectionRef.current.count >= APP_CONFIG.stableDetectionFrames;
        const hasScannedLongEnough = scanDuration >= APP_CONFIG.minimumScanDuration;

        if (result && isValidDetection(result) && isStableDetection && hasScannedLongEnough) {
          // Sayuran dianggap valid kalau terdeteksi stabil beberapa frame.
          // Ini membuat kamera tidak langsung mati karena tebakan awal yang belum stabil.
          isRunningRef.current = false;
          camera.stopCamera();
          actions.setRunning(false);

          actions.setAppState('analyzing');
          actions.setDetectionResult(result);
          actions.setFunFactData(null);

          await createDelay(APP_CONFIG.analyzingDelay);

          const fact = await generator.generateFacts(result.className);

          if (fact) {
            actions.setFunFactData(fact);
          } else {
            actions.setFunFactData('error');
          }

          actions.setAppState('result');
          return;
        }
      } catch (err) {
        logError('Detection loop', err);
      }

      // hitung delay berdasarkan FPS yang diset user
      const fpsDelay = Math.floor(1000 / (camera.getFPS() || 30));
      loopId = setTimeout(loop, fpsDelay);
    };

    loop();

    // simpan fungsi cleanup supaya bisa dihentikan
    detectionCleanupRef.current = () => {
      if (loopId) clearTimeout(loopId);
    };
  }, [actions]);

  // ===== Fase 4.4: Toggle kamera =====
  const handleToggleCamera = useCallback(async () => {
    const { camera } = servicesRef.current;
    if (!camera) return;

    if (isRunningRef.current) {
      // stop
      isRunningRef.current = false;
      if (detectionCleanupRef.current) detectionCleanupRef.current();
      camera.stopCamera();
      actions.setRunning(false);
      actions.resetResults();
    } else {
      // start
      try {
        actions.setError(null);
        actions.resetResults();
        await camera.startCamera();
        stableDetectionRef.current = { label: null, count: 0, startedAt: Date.now() };
        isRunningRef.current = true;
        actions.setRunning(true);
        startDetectionLoop();
      } catch (err) {
        logError('Toggle kamera', err);
        actions.setError('Gagal memulai kamera. Pastikan izin kamera diberikan.');
      }
    }
  }, [actions, startDetectionLoop]);

  // ===== Fase 4.5: Ganti tone =====
  const handleToneChange = useCallback((tone) => {
    setCurrentTone(tone);
    const { generator } = servicesRef.current;
    if (generator) generator.setTone(tone);
  }, []);

  // ===== Fase 4.6: Salin fun fact =====
  const handleCopyFact = useCallback(async () => {
    if (!state.funFactData || state.funFactData === 'error') return;

    try {
      await navigator.clipboard.writeText(state.funFactData);
    } catch (err) {
      logError('Copy to clipboard', err);
    }
  }, [state.funFactData]);

  return (
    <div className="app-container">
      <Header modelStatus={state.modelStatus} />

      <main className="main-content">
        <CameraSection
          isRunning={state.isRunning}
          onToggleCamera={handleToggleCamera}
          onToneChange={handleToneChange}
          services={state.services}
          modelStatus={state.modelStatus}
          error={state.error}
          currentTone={currentTone}
        />

        <InfoPanel
          appState={state.appState}
          detectionResult={state.detectionResult}
          funFactData={state.funFactData}
          error={state.error}
          onCopyFact={handleCopyFact}
        />
      </main>

      <footer className="footer">
        <p>Powered by TensorFlow.js &amp; Transformers.js</p>
      </footer>

      {state.error && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '380px',
          padding: '0.875rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b',
          fontSize: '0.8125rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000
        }}>
          <strong>Error:</strong> {state.error}
          <button
            onClick={() => actions.setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#991b1b',
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
