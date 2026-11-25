import base64
import io
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from imageio_ffmpeg import get_ffmpeg_exe
from piper import PiperVoice

voice = PiperVoice.load("fr_FR-siwis-medium.onnx")
phrases = json.loads(Path(__file__).with_name("practice-phrases.json").read_text(encoding="utf-8"))

for index, (name, phrase) in enumerate(phrases.items()):
    if index % 2 != int(sys.argv[1]):
        continue
    handle = io.BytesIO()
    with wave.open(handle, "wb") as track:
        voice.synthesize_wav(phrase, track)
    handle.seek(0)
    with wave.open(handle) as track:
        rate = track.getframerate()
        pcm = np.frombuffer(track.readframes(track.getnframes()), dtype="<i2")
    active = np.flatnonzero(np.abs(pcm.astype(np.int32)) >= 70)
    assert active.size and active[-1] - active[0] > rate * .6
    start = max(0, active[0] - round(.025 * rate))
    end = min(len(pcm), active[-1] + round(.065 * rate) + 1)
    output = subprocess.check_output([
        get_ffmpeg_exe(), "-v", "error", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-",
        "-af", "loudnorm=I=-19:TP=-2:LRA=5", "-c:a", "libmp3lame", "-b:a", "56k",
        "-ar", "24000", "-ac", "1", "-f", "mp3", "-"
    ], input=pcm[start:end].tobytes())
    for offset in range(0, len(output), 1500):
        print("ARCHIPEL_PRACTICE", name, base64.b64encode(output[offset:offset+1500]).decode(), flush=True)
