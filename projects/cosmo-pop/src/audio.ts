export type Sound = "pop" | "buy" | "reward" | "comet" | "launch";
/** Short decoded OGG buffers; Web Audio allows overlapping pops without allocating media elements. */
export class AudioManager {
  private context: AudioContext | null = null;
  private buffers = new Map<Sound, AudioBuffer>();
  private pending = new Set<Sound>();
  private last = 0;
  private active = true;
  private unlocked = false;
  private musicEnabled = true;
  private musicVolume = 0.35;
  private musicBuffer: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicLoading: Promise<void> | null = null;
  private musicRetryAt = 0;
  private musicOffset = 0;
  private musicStarted = 0;

  /** The context clock freezes in the background, retaining the exact loop position. */
  setActive(active: boolean): void {
    this.active = active;
    if (!this.context) return;
    if (!active) void this.context.suspend().catch(() => {});
    else if (this.unlocked) void this.resume();
  }
  setMusic(enabled: boolean, volume: number): void {
    this.musicEnabled = enabled;
    this.musicVolume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.35;
    if (this.musicGain && this.context) {
      const gain = this.musicGain.gain;
      gain.cancelScheduledValues(this.context.currentTime);
      gain.setTargetAtTime(this.musicVolume, this.context.currentTime, 0.03);
    }
    this.syncMusic();
  }
  private async resume(): Promise<void> {
    try {
      if (this.active && this.context?.state !== "running") await this.context?.resume();
      // A visibility event can arrive while resume() is pending.
      if (!this.active) await this.context?.suspend();
      else this.syncMusic();
    } catch { /* Retry on the next user gesture if the browser requires it. */ }
  }
  private syncMusic(): void {
    const context = this.context;
    const wanted = this.musicEnabled && this.musicVolume > 0;
    if (!wanted) {
      if (this.musicSource && context && this.musicBuffer) {
        this.musicOffset = (this.musicOffset + context.currentTime - this.musicStarted) % this.musicBuffer.duration;
        this.musicSource.stop();
        this.musicSource.disconnect();
        this.musicSource = null;
      }
      return;
    }
    if (!this.active || !this.unlocked || !context || context.state !== "running") return;
    if (!this.musicBuffer) {
      if (!this.musicLoading && Date.now() >= this.musicRetryAt) {
        this.musicLoading = this.loadMusic().finally(() => { this.musicLoading = null; });
      }
      return;
    }
    if (this.musicSource) return;
    this.musicGain ??= context.createGain();
    this.musicGain.gain.value = this.musicVolume;
    // One shared decoded OGG and one source: no timer or allocation at the loop seam.
    const source = context.createBufferSource();
    source.buffer = this.musicBuffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = this.musicBuffer.duration;
    source.connect(this.musicGain);
    this.musicGain.disconnect();
    this.musicGain.connect(context.destination);
    this.musicStarted = context.currentTime;
    this.musicSource = source;
    source.start(0, this.musicOffset);
  }
  private async loadMusic(): Promise<void> {
    try {
      const response = await fetch(new URL("../audio/constellations-v1.ogg", import.meta.url));
      if (!response.ok) throw Error("Music unavailable");
      this.musicBuffer = await this.context!.decodeAudioData(await response.arrayBuffer());
      this.syncMusic();
    } catch {
      // A missing/unsupported codec must neither block play nor cause a request on every click.
      this.musicRetryAt = Date.now() + 30000;
    }
  }
  enabled = true;
  volume = 0.45;
  async unlock(): Promise<void> {
    try {
      this.context ??= new AudioContext();
      this.unlocked = true;
      if (!this.active) return;
      await this.resume();
      for (const name of ["pop", "buy", "reward", "comet", "launch"] as Sound[])
        void this.load(name);
    } catch {
      /* Audio never blocks the game. */
    }
  }
  private async load(name: Sound): Promise<void> {
    if (this.buffers.has(name) || this.pending.has(name) || !this.context)
      return;
    this.pending.add(name);
    try {
      const r = await fetch(new URL(`../audio/${name}.ogg`, import.meta.url));
      if (!r.ok) throw Error();
      this.buffers.set(
        name,
        await this.context.decodeAudioData(await r.arrayBuffer()),
      );
    } catch {
      /* Silent fallback on unsupported codecs. */
    } finally {
      this.pending.delete(name);
    }
  }
  play(name: Sound): void {
    if (!this.active || !this.enabled || !this.context || this.context.state !== "running")
      return;
    const now = performance.now();
    if (name === "pop" && now - this.last < 55) return;
    this.last = now;
    const buffer = this.buffers.get(name);
    if (!buffer) {
      void this.load(name);
      return;
    }
    const source = this.context.createBufferSource(),
      gain = this.context.createGain();
    source.buffer = buffer;
    source.playbackRate.value =
      name === "pop" ? 0.93 + Math.random() * 0.16 : 1;
    gain.gain.value = this.volume * (name === "pop" ? 0.55 : 0.75);
    source.connect(gain);
    gain.connect(this.context.destination);
    source.start();
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  }
}
