export class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = null;
    this._cameras = [];
    this._fps = 30;
    this._selectedCameraId = null;
  }

  setVideoElement(videoElement) {
    this.video = videoElement;
  }

  setCanvasElement(canvasElement) {
    this.canvas = canvasElement;
  }

  async loadCameras() {
    try {
      // minta izin dulu supaya label perangkat muncul
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      this._cameras = devices.filter((d) => d.kind === 'videoinput');

      return this._cameras;
    } catch (err) {
      console.error('Gagal memuat daftar kamera:', err);
      throw err;
    }
  }

  _buildConstraints(selectedCameraId) {
    const base = {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: this._fps },
    };

    if (selectedCameraId && selectedCameraId !== 'default') {
      // 'front' → facingMode user, selain itu pakai deviceId
      if (selectedCameraId === 'front') {
        base.facingMode = 'user';
      } else {
        base.deviceId = { exact: selectedCameraId };
      }
    } else {
      // default = kamera belakang (environment)
      base.facingMode = { ideal: 'environment' };
    }

    return { video: base, audio: false };
  }

  async startCamera(selectedCameraId) {
    // hentikan stream sebelumnya kalau masih ada
    this.stopCamera();

    if (selectedCameraId) {
      this._selectedCameraId = selectedCameraId;
    }

    const constraints = this._buildConstraints(this._selectedCameraId);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      return this.stream;
    } catch (err) {
      console.error('Gagal memulai kamera:', err);
      throw err;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  setFPS(fps) {
    this._fps = Number(fps) || 30;
  }

  getFPS() {
    return this._fps;
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }

  isReady() {
    return this.video !== null && this.video.readyState >= 2;
  }
}