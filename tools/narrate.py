"""Generate a lesson's narration audio with the open-source Kokoro voice model.

Usage: python3 tools/narrate.py lessons/budgeting
Reads <lesson>/narration.json and writes <lesson>/audio/line-NN.mp3.
Needs: pip install kokoro-onnx soundfile, ffmpeg, and the model files
(kokoro-v1.0.onnx, voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases)
in $KOKORO_DIR (default /tmp/kokoro).
"""
import json, os, subprocess, sys, tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

lesson = sys.argv[1]
model_dir = os.environ.get("KOKORO_DIR", "/tmp/kokoro")
spec = json.load(open(os.path.join(lesson, "narration.json")))
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
out_dir = os.path.join(lesson, "audio")
os.makedirs(out_dir, exist_ok=True)

for i, line in enumerate(spec["lines"], 1):
    samples, rate = kokoro.create(line, voice=spec["voice"], speed=spec.get("speed", 1.0), lang=spec.get("lang", "en-us"))
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        sf.write(wav.name, samples, rate)
        mp3 = os.path.join(out_dir, f"line-{i:02d}.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav.name, "-ac", "1", "-b:a", "64k", mp3], check=True)
    print(mp3, round(len(samples) / rate, 1), "s")
