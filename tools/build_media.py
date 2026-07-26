"""
Build web-ready media for the portfolio from the original project files on X:.

Sources stay untouched; everything is written into public/media/.
Run:  python tools/build_media.py           (skips work already done)
      python tools/build_media.py --force   (rebuild everything)

Needs: Pillow, and an ffmpeg binary (found via imageio_ffmpeg, no system install).
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"

try:
    import imageio_ffmpeg

    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:  # pragma: no cover - fall back to a system ffmpeg
    FFMPEG = shutil.which("ffmpeg")

if not FFMPEG:
    sys.exit("No ffmpeg available (pip install imageio-ffmpeg)")

FORCE = False


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def _skip(dst: Path) -> bool:
    if dst.exists() and not FORCE:
        print(f"  = {dst.relative_to(OUT)}")
        return True
    dst.parent.mkdir(parents=True, exist_ok=True)
    return False


def _done(dst: Path) -> None:
    size = dst.stat().st_size / 1024
    unit = f"{size:.0f} KB" if size < 1024 else f"{size / 1024:.1f} MB"
    print(f"  + {dst.relative_to(OUT)}  ({unit})")


def run(args: list[str]) -> None:
    res = subprocess.run(args, capture_output=True, text=True)
    if res.returncode != 0:
        tail = "\n".join(res.stderr.strip().splitlines()[-12:])
        raise RuntimeError(f"ffmpeg failed:\n{tail}")


def jpg(src: Path, dst: Path, width: int, quality: int = 82) -> None:
    """Resize a still down to `width` and save as progressive JPEG."""
    if _skip(dst):
        return
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (0, 0, 0))
        im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
    _done(dst)


def poster(src: Path, dst: Path, at: float, width: int = 1920, quality: int = 82) -> None:
    """Grab one frame from a video and save it as a JPEG."""
    if _skip(dst):
        return
    run([FFMPEG, "-y", "-loglevel", "error", "-ss", str(at), "-i", str(src),
         "-frames:v", "1", "-vf", f"scale={width}:-2:flags=lanczos",
         "-q:v", "3", str(dst)])
    _done(dst)


def loop(src: Path, dst: Path, width: int = 960, start: float = 0.0,
         duration: float | None = None, crf: int = 30, fps: int | None = None) -> None:
    """Silent, web-friendly h264 loop used for hover previews and breakdowns."""
    if _skip(dst):
        return
    vf = f"scale={width}:-2:flags=lanczos"
    if fps:
        vf = f"fps={fps}," + vf
    args = [FFMPEG, "-y", "-loglevel", "error", "-ss", str(start), "-i", str(src)]
    if duration:
        args += ["-t", str(duration)]
    args += ["-an", "-vf", vf, "-c:v", "libx264", "-profile:v", "high",
             "-pix_fmt", "yuv420p", "-crf", str(crf), "-preset", "slow",
             "-movflags", "+faststart", str(dst)]
    run(args)
    _done(dst)


def loop_from_frames(pattern: str, dst: Path, start_number: int, fps: int = 24,
                     width: int = 960, crf: int = 30) -> None:
    """Same as `loop`, but the source is a rendered image sequence."""
    if _skip(dst):
        return
    run([FFMPEG, "-y", "-loglevel", "error", "-framerate", str(fps),
         "-start_number", str(start_number), "-i", pattern,
         "-an", "-vf", f"scale={width}:-2:flags=lanczos", "-c:v", "libx264",
         "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", str(crf),
         "-preset", "slow", "-movflags", "+faststart", str(dst)])
    _done(dst)


def video(src: Path, dst: Path, width: int, crf: int, audio: bool) -> None:
    """The full-quality reel that plays in the lightbox."""
    if _skip(dst):
        return
    args = [FFMPEG, "-y", "-loglevel", "error", "-i", str(src),
            "-vf", f"scale={width}:-2:flags=lanczos", "-c:v", "libx264",
            "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", str(crf),
            "-preset", "slow", "-movflags", "+faststart"]
    args += ["-c:a", "aac", "-b:a", "160k"] if audio else ["-an"]
    run(args + [str(dst)])
    _done(dst)


def probe(src: Path) -> dict:
    res = subprocess.run([FFMPEG, "-hide_banner", "-i", str(src)],
                         capture_output=True, text=True)
    blob = res.stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", blob)
    res_m = re.search(r"Video: .*?, (\d{2,5})x(\d{2,5})", blob)
    return {
        "seconds": (int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3)))
        if dur else None,
        "width": int(res_m.group(1)) if res_m else None,
        "height": int(res_m.group(2)) if res_m else None,
    }


# --------------------------------------------------------------------------
# sources
# --------------------------------------------------------------------------
SPHERE = Path(r"X:\DOTA-2_SHORTFLIM_BEHANCE")
SPHERE_PRJ = Path(r"X:\DOTA-2-SHORTFILM_2025")
SHANGHAI = Path(r"X:\SHANGHAI_Project\Saved\Screenshots")
INK = Path(r"X:\_CLOUDE\HoudiniInkBrush")
STATUE = Path(r"X:\STATUE_DESTR_COMP")
D2_2026 = Path(r"X:\DOTA-2_SHORTFILM_2026\_RENDERS")

REEL_SRC = SPHERE_PRJ / "FULL_OUTPUTS" / "Test_version_003.mp4"

# Shanghai frames that are actually presentable (the rest are grey-box blockout).
SHANGHAI_STILLS = [
    "rcp_bund.png", "rcp_waterfront.png", "rcp_cbd_grid.png", "rcp_city_oblique.png",
    "emis_fixed_cluster.png", "rcp_ave_street.png", "detail_oblique.png",
    "detail_topdown.png", "cap_twilight.png", "cap_palette2.png",
    "cap_night_city.png", "cap_bench_lamp.png",
]

# The build order of the environment — this is the breakdown story.
SHANGHAI_STEPS = [
    ("cap_blockout_v3.png", "Massing blockout"),
    ("cap_roads_network.png", "Road network"),
    ("cap_populated.png", "Kit population"),
    ("cap_trees_dense.png", "Vegetation pass"),
    ("cap_citylights.png", "Emissive lighting"),
    ("rcp_bund.png", "Final grade"),
]


def build_reel() -> None:
    print("\n[reel]")
    d = OUT / "reel"
    poster(REEL_SRC, d / "poster.jpg", at=41.0, width=1920)
    # Muted background loop for the hero, plus the real thing with sound.
    loop(REEL_SRC, d / "reel_loop.mp4", width=1280, crf=30)
    video(REEL_SRC, d / "reel_full.mp4", width=1920, crf=23, audio=True)


def build_sphere_master() -> None:
    print("\n[work/sphere-master]")
    d = OUT / "work" / "sphere-master"
    stills = sorted((SPHERE / "STILLS").glob("*.png"))
    hero = SPHERE / "STILLS" / "13_01039.png"

    jpg(hero, d / "poster.jpg", 1920)
    jpg(hero, d / "thumb.jpg", 1280)
    loop(REEL_SRC, d / "loop.mp4", width=960, start=38.0, duration=6.0)

    for i, s in enumerate(stills, 1):
        jpg(s, d / "stills" / f"{i:02d}.jpg", 1600)

    for gif in sorted((SPHERE / "BREAKDOWN_GIFS").glob("*.gif")):
        loop(gif, d / "bd" / f"{gif.stem}.mp4", width=1100, crf=28)


def build_shanghai() -> None:
    print("\n[work/shanghai]")
    d = OUT / "work" / "shanghai"
    jpg(SHANGHAI / "rcp_bund.png", d / "poster.jpg", 1920)
    jpg(SHANGHAI / "rcp_bund.png", d / "thumb.jpg", 1280)
    for i, name in enumerate(SHANGHAI_STILLS, 1):
        src = SHANGHAI / name
        if src.exists():
            jpg(src, d / "stills" / f"{i:02d}.jpg", 1600)
    for i, (name, _label) in enumerate(SHANGHAI_STEPS, 1):
        src = SHANGHAI / name
        if src.exists():
            jpg(src, d / "bd" / f"{i:02d}.jpg", 1400)


def build_ink() -> None:
    print("\n[work/ink-sumi]")
    d = OUT / "work" / "ink-sumi"
    src = INK / "ink_01.mp4"
    poster(src, d / "poster.jpg", at=3.2, width=1600)
    poster(src, d / "thumb.jpg", at=3.2, width=1100)
    loop(src, d / "loop.mp4", width=900, crf=28)
    loop_from_frames(str(INK / "Ink_2" / "ink_02_%04d.png"), d / "bd" / "sequence.mp4",
                     start_number=1, fps=24, width=900, crf=28)


def build_statue() -> None:
    print("\n[work/statue-collapse]")
    d = OUT / "work" / "statue-collapse"
    src = STATUE / "STATUE_COLLAPSE_COMP_OUT.mov"
    poster(src, d / "poster.jpg", at=5.2, width=1920)
    poster(src, d / "thumb.jpg", at=5.2, width=1280)
    loop(src, d / "loop.mp4", width=1100, crf=29)
    for name, label in [("OUT_No_Grain_v02.mov", "no-grain")]:
        alt = STATUE / name
        if alt.exists():
            loop(alt, d / "bd" / f"{label}.mp4", width=1100, crf=29)


def build_d2_2026() -> None:
    print("\n[work/short-film-2026]")
    d = OUT / "work" / "short-film-2026"
    shots = sorted(D2_2026.glob("SH_*.mov"))
    if not shots:
        print("  ! no shots found")
        return
    poster(shots[0], d / "poster.jpg", at=2.6, width=1920)
    poster(shots[0], d / "thumb.jpg", at=2.6, width=1280)
    loop(shots[0], d / "loop.mp4", width=1100, crf=29)
    for shot in shots:
        loop(shot, d / "bd" / f"{shot.stem.lower()}.mp4", width=1280, crf=28)


BUILDERS = {
    "reel": build_reel,
    "sphere-master": build_sphere_master,
    "shanghai": build_shanghai,
    "ink-sumi": build_ink,
    "statue-collapse": build_statue,
    "short-film-2026": build_d2_2026,
}


def main() -> None:
    global FORCE
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="rebuild files that already exist")
    ap.add_argument("--only", nargs="*", choices=list(BUILDERS), help="build a subset")
    args = ap.parse_args()
    FORCE = args.force

    print(f"ffmpeg : {FFMPEG}")
    print(f"output : {OUT}")
    OUT.mkdir(parents=True, exist_ok=True)

    for name in (args.only or BUILDERS):
        BUILDERS[name]()

    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"\ntotal media: {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
