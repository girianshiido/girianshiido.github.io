export type Sound = "pop" | "buy" | "reward" | "comet" | "launch";
/** Short decoded OGG buffers; Web Audio allows overlapping pops without allocating media elements. */
export class AudioManager {
  private context: AudioContext | null = null;
  private buffers = new Map<Sound, AudioBuffer>();
  private pending = new Set<Sound>();
  private last = 0;
  enabled = true;
  volume = 0.45;
  async unlock(): Promise<void> {
    try {
      this.context ??= new AudioContext();
      if (this.context.state === "suspended") await this.context.resume();
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
    if (!this.enabled || !this.context || this.context.state !== "running")
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
