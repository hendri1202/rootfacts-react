import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

export class DetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.config = null;
    this.backendUsed = null;
  }

  async loadModel(onProgress) {
    try {
      if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
        try {
          await tf.setBackend('webgpu');
          await tf.ready();
          this.backendUsed = 'webgpu';
        } catch (_gpuErr) {
          console.warn('WebGPU tidak bisa dipakai, beralih ke WebGL');
          await tf.setBackend('webgl');
          await tf.ready();
          this.backendUsed = 'webgl';
        }
      } else {
        await tf.setBackend('webgl');
        await tf.ready();
        this.backendUsed = 'webgl';
      }

      onProgress?.(20);

      const [model, metaRes] = await Promise.all([
        tf.loadLayersModel('/model/model.json'),
        fetch('/model/metadata.json'),
      ]);

      this.model = model;
      onProgress?.(50);

      const metadata = await metaRes.json();
      if (metadata && Array.isArray(metadata.labels)) {
        this.labels = metadata.labels;
      }

      onProgress?.(60);

      console.log(`DetectionService siap — backend: ${this.backendUsed}, label: ${this.labels.length}`);
    } catch (err) {
      console.error('Gagal memuat model deteksi:', err);
      throw err;
    }
  }

  async predict(imageElement) {
    if (!this.model) return null;

    const result = tf.tidy(() => {
      const tensor = tf.browser
        .fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(127.5)
        .sub(1)
        .expandDims(0);

      const prediction = this.model.predict(tensor);
      const scores = prediction.dataSync();

      let maxIdx = 0;
      let maxScore = scores[0];
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] > maxScore) {
          maxScore = scores[i];
          maxIdx = i;
        }
      }

      return {
        className: this.labels[maxIdx] || 'Unknown',
        score: maxScore,
        confidence: Math.round(maxScore * 100),
        isValid: maxScore > 0,
      };
    });

    return result;
  }

  isLoaded() {
    return this.model !== null && this.labels.length > 0;
  }
}
