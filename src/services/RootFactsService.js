import { pipeline } from '@huggingface/transformers';
import { TONE_CONFIG } from '../utils/config.js';

export class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = null;
    this.currentBackend = null;
    this.currentTone = TONE_CONFIG.defaultTone;
  }

  async loadModel(onProgress) {
    try {
      const canUseWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
      const modelId = 'Xenova/flan-t5-small';
      const loadOptions = canUseWebGPU
        ? [
          { dtype: 'q4', device: 'webgpu' },
          { dtype: 'q4' },
        ]
        : [{ dtype: 'q4' }];

      onProgress?.(70);

      let lastError = null;
      for (const options of loadOptions) {
        try {
          this.generator = await pipeline('text2text-generation', modelId, options);
          this.currentBackend = options.device || 'wasm';
          break;
        } catch (err) {
          lastError = err;
          console.warn('Gagal memuat generator dengan opsi ini, mencoba fallback:', options, err);
        }
      }

      if (!this.generator) {
        throw lastError || new Error('Model generatif gagal dimuat.');
      }

      this.isModelLoaded = true;
      onProgress?.(100);

      console.log(`RootFactsService siap — model: ${modelId}, device: ${this.currentBackend}`);
    } catch (err) {
      console.error('Gagal memuat model generatif:', err);
      throw err;
    }
  }

  setTone(tone) {
    const valid = TONE_CONFIG.availableTones.some((t) => t.value === tone);
    this.currentTone = valid ? tone : TONE_CONFIG.defaultTone;
  }

  async generateFacts(vegetableName) {
    if (!this.generator || this.isGenerating) {
      return null;
    }

    this.isGenerating = true;

    try {
      const prompt = this._buildPrompt(vegetableName);

      const output = await this.generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
      });

      const text = Array.isArray(output)
        ? output[0]?.generated_text || ''
        : output?.generated_text || '';

      return text.trim();
    } catch (err) {
      console.error('Gagal menghasilkan fun fact:', err);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  _buildPrompt(vegetableName) {
    const toneGuide = {
      normal: `Write one natural Indonesian fun fact about ${vegetableName}. Make it warm, simple, and not robotic.`,
      funny: `Write one funny natural Indonesian fun fact about ${vegetableName}. Keep it light, playful, and not robotic.`,
      professional: `Write one natural Indonesian professional fact about ${vegetableName}. Mention nutrition or botany in a clear human style.`,
      casual: `Write one casual Indonesian fun fact about ${vegetableName}, like chatting with a friend. Make it short and natural.`,
    };

    return toneGuide[this.currentTone] || toneGuide.normal;
  }

  isReady() {
    return this.isModelLoaded && this.generator !== null;
  }
}
