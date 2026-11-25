import base64
import json
import subprocess
import tempfile
import wave
import sys
from imageio_ffmpeg import get_ffmpeg_exe
from pathlib import Path

from piper import PiperVoice

clips = json.loads(Path(__file__).with_name("voice-prompts.json").read_text())
voice = PiperVoice.load("fr_FR-siwis-medium.onnx")
with tempfile.TemporaryDirectory() as temp:
    wav = Path(temp) / "clip.wav"
    for index, (name, text) in enumerate(clips.items()):
        if index % 3 != int(sys.argv[1]):
            continue
        with wave.open(str(wav), "wb") as output:
            voice.synthesize_wav(text, output)
        clip = subprocess.check_output([
            get_ffmpeg_exe(), "-v", "error", "-i", str(wav),
            "-af", "loudnorm=I=-19:TP=-2:LRA=5",
            "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1", "-f", "mp3", "-"
        ])
        for offset in range(0, len(clip), 1600):
            print("ARCHIPEL_AUDIO " + name + " " + base64.b64encode(clip[offset:offset+1600]).decode(), flush=True)
