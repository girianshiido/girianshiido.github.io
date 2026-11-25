import base64
import io
import json
import math
import os
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
from imageio_ffmpeg import get_ffmpeg_exe
from piper import PiperVoice, SynthesisConfig

MODEL = "fr_FR-mls-medium.onnx"
voice = PiperVoice.load(MODEL)
prompts = json.loads(Path(__file__).with_name("voice-prompts.json").read_text(encoding="utf-8"))


def synthesize(text, speaker):
    target = io.BytesIO()
    config = SynthesisConfig(speaker_id=speaker, length_scale=1.03, noise_scale=0.50, noise_w_scale=0.6)
    with wave.open(target, "wb") as out:
        voice.synthesize_wav(text, out, syn_config=config)
    return target.getvalue()


def samples_of(payload):
    with wave.open(io.BytesIO(payload)) as audio:
        raw = audio.readframes(audio.getnframes())
        return np.frombuffer(raw, dtype="<i2").astype(float) / 32768, audio.getframerate()


def pitches_for(samples, rate):
    # Estimate a median from voiced windows, rejecting quiet or weakly periodic frames.
    size = round(rate * 0.042)
    low_lag, high_lag = round(rate / 330), round(rate / 70)
    out = []
    for start in range(0, len(samples) - size, size // 2):
        frame = samples[start:start+size]
        if np.mean(frame ** 2) < 0.001:
            continue
        frame = (frame - frame.mean()) * np.hanning(size)
        corr = np.correlate(frame, frame, "full")[size - 1:]
        peak_positions = [i for i in range(low_lag, high_lag)
                          if corr[i-1] < corr[i] >= corr[i+1]]
        if not peak_positions:
            continue
        strongest = max(corr[i] for i in peak_positions)
        if strongest < 0.48 * corr[0]:
            continue
        first_peak = next(i for i in peak_positions if corr[i] >= 0.87 * strongest)
        out.append(rate / first_peak)
    return out


def choose():
    candidates = []
    count = voice.config.num_speakers
    for speaker in np.linspace(0, count-1, 28, dtype=int).tolist():
        pitches, durations = [], []
        for prompt in ("example", "basket-2"):
            data, rate = samples_of(synthesize(prompts[prompt], speaker))
            pitches.extend(pitches_for(data, rate))
            durations.append(len(data) / rate)
        if len(pitches) < 10 or not (1.6 <= durations[0] <= 4.9 and 1.25 <= durations[1] <= 3.3):
            continue
        pitch = float(np.median(pitches))
        candidates.append((pitch, speaker))
        print(f"Speaker {speaker}: {pitch:.0f} Hz, {durations[0]:.2f}s / {durations[1]:.2f}s")
    assert len(candidates) >= 2, candidates
    low = min(candidates, key=lambda row: abs(row[0]-126))
    high = min((row for row in candidates if row[1]!=low[1]), key=lambda row: abs(row[0]-215))
    assert high[0] > 1.2 * low[0], (low, high)
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as out:
        print(f"lagon={high[1]}\nphare={low[1]}", file=out)
    print(f"ARCHIPEL_VOICES {high[1]} {low[1]} {high[0]:.1f} {low[0]:.1f}")


def gain(payload):
    data, _ = samples_of(payload)
    active = np.flatnonzero(np.abs(data)>0.01)
    assert active.size, "Silent speech"
    rms = math.sqrt(np.mean(data[active[0]:active[-1]+1] ** 2))
    return -19.0 - 20 * math.log10(rms)


def pack(name, speaker, part):
    executable = get_ffmpeg_exe()
    with tempfile.TemporaryDirectory() as folder:
        wav = Path(folder) / "source.wav"
        for i, (clip, text) in enumerate(prompts.items()):
            if i % 3 != part:
                continue
            payload = synthesize(text, speaker)
            wav.write_bytes(payload)
            filters = f"volume={gain(payload):.4f}dB,alimiter=limit=0.7943:attack=5:release=40:level=0:latency=1"
            output = subprocess.check_output([
                executable, "-v", "error", "-i", str(wav), "-af", filters,
                "-c:a", "libmp3lame", "-b:a", "56k", "-ar", "24000", "-ac", "1", "-f", "mp3", "-"
            ])
            assert len(output) > 1200
            for start in range(0, len(output), 1500):
                print("ARCHIPEL_PACK", name + "/" + clip, base64.b64encode(output[start:start+1500]).decode(), flush=True)


if sys.argv[1] == "choose":
    choose()
else:
    pack(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
