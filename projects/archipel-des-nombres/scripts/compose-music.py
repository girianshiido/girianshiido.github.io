"""Render the original Archipel backing track with a General MIDI SoundFont."""

from pathlib import Path
from struct import pack
from subprocess import run
from tempfile import TemporaryDirectory
import argparse

TICKS = 480
RATE = 48000
TEMPO = 666667  # 90 BPM
LOOP_SAMPLES = 2_048_000  # 16 bars at 90 BPM

# A/D major colours, with inversions to make a gentle descending bass line.
CHORDS = [
    (50, (57, 62, 64, 66)), (49, (57, 59, 61, 64)),
    (47, (57, 59, 62, 66)), (43, (55, 59, 62, 66)),
    (52, (55, 59, 62, 66)), (45, (55, 57, 61, 64)),
    (42, (57, 59, 62, 66)), (45, (55, 57, 62, 64)),
    (47, (57, 59, 62, 66)), (42, (54, 57, 61, 64)),
    (43, (55, 59, 62, 66)), (45, (57, 62, 64, 66)),
    (52, (55, 59, 62, 66)), (45, (55, 57, 62, 67)),
    (50, (57, 62, 64, 66)), (45, (55, 57, 61, 64)),
]
# Notes are (beat in bar, MIDI note, duration in beats).
MELODY = [
    ((.5, 69, .8), (1.5, 74, .8), (2.5, 76, 1.1)),
    ((0, 73, .7), (1, 71, .7), (2, 69, 1.3)),
    ((0, 66, .85), (1, 69, .8), (2.5, 71, 1.35)),
    ((0, 74, .7), (1, 71, .8), (2, 67, 1.45)),
    ((.5, 67, .8), (1.5, 71, .8), (2.5, 74, 1.1)),
    ((0, 73, .7), (1, 76, .8), (2.5, 79, 1.15)),
    ((0, 78, 1.35), (1.5, 76, .6), (2.5, 74, 1.15)),
    ((0, 71, .75), (1, 69, 1.8)),
    ((.5, 66, .8), (1.5, 71, .8), (2.5, 74, 1.1)),
    ((0, 73, .8), (1, 69, .8), (2.5, 66, 1.1)),
    ((0, 67, .8), (1, 71, .8), (2, 74, 1.5)),
    ((.5, 76, .8), (1.5, 74, .8), (2.5, 69, 1.25)),
    ((0, 71, .8), (1, 74, .8), (2, 78, 1.5)),
    ((0, 76, 1.2), (1.5, 74, .6), (2.5, 71, .9)),
    ((0, 74, 1.5), (1.75, 69, .75), (2.75, 66, .9)),
    ((0, 67, .85), (1, 64, .8), (2.25, 61, 1.25)),
]


def variable_length(value):
    pieces = [value & 127]
    value >>= 7
    while value:
        pieces.append((value & 127) | 128)
        value >>= 7
    return bytes(reversed(pieces))


def write_midi(path):
    events = [(0, b"\xff\x51\x03" + TEMPO.to_bytes(3, "big"))]
    for channel, program, pan in [(0, 8, 73), (1, 24, 51), (2, 45, 64), (3, 46, 79)]:
        events.extend([(0, bytes((192 + channel, program))), (0, bytes((176 + channel, 10, pan)))])

    def note(channel, pitch, beat, duration, velocity):
        events.append((round(beat * TICKS), bytes((144 + channel, pitch, velocity))))
        events.append((round((beat + duration) * TICKS), bytes((128 + channel, pitch, 0))))

    # Render three repetitions and take the middle one so the reverb crosses the loop boundary.
    for repetition in range(3):
        for bar, (bass, pitches) in enumerate(CHORDS):
            start = (repetition * len(CHORDS) + bar) * 4
            note(2, bass, start, 1.6, 52)
            note(2, bass + (12 if bar % 4 == 3 else 7), start + 2, 1.3, 38)
            for i, pitch_index in enumerate((0, 1, 2, 1, 3, 2, 1, 2)):
                note(1, pitches[pitch_index], start + i / 2, .44, (55, 38, 44, 39, 50, 40, 44, 35)[i])
            for beat, pitch, duration in MELODY[bar]:
                note(0, pitch, start + beat, duration, 64 if beat % 1 else 59)
            if bar % 4 == 3:
                note(3, pitches[1] + 12, start + 2.5, 1.15, 39)
                note(3, pitches[2] + 12, start + 3.25, .6, 31)

    track = bytearray()
    last = 0
    for at, message in sorted(events, key=lambda event: event[0]):
        track.extend(variable_length(at - last) + message)
        last = at
    track.extend(b"\x00\xff\x2f\x00")
    path.write_bytes(b"MThd" + pack(">IHHH", 6, 0, 1, TICKS) +
                     b"MTrk" + pack(">I", len(track)) + track)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("soundfont", type=Path)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public/audio")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix="archipel-music-") as directory:
        midi = Path(directory) / "maree.mid"
        wav = Path(directory) / "maree.wav"
        write_midi(midi)
        run(["fluidsynth", "-ni", "-g", ".5", "-r", str(RATE), "-F", str(wav),
             str(args.soundfont), str(midi)], check=True)
        loop = f"atrim=start_sample={LOOP_SAMPLES}:end_sample={LOOP_SAMPLES * 2},asetpts=PTS-STARTPTS"
        filters = loop + ",volume=16dB"
        for codec, ext in [(["-c:a", "libvorbis", "-q:a", "2.2"], "ogg"),
                           (["-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart"], "m4a")]:
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                 "-af", filters, "-ar", str(RATE), *codec, "-metadata", "title=Brise du lagon",
                 str(args.output / f"brise-du-lagon.{ext}")], check=True)


if __name__ == "__main__":
    main()
