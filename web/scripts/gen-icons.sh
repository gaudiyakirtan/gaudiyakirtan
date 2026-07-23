#!/usr/bin/env bash
# Regenerate every app/site icon from the vector source.
#
# Source of truth is `assets/Mridangam-BlueCover-01.svg` — the mṛdaṅga mark, which is the same
# artwork as the shipped iOS app's icon (/Applications/Gaudiya Kirtan.app). That app only carries a
# 180x180 raster, so it is used as the *reference* for framing and colour, not as the source:
# rebuilding from the SVG gives a crisp 512/1024 instead of a 2.8x upscale.
#
# Framing was measured off the app icon: the drum's ink box is 151x180 wide and centred, i.e. 83.9%
# of the canvas. The SVG's ink occupies 0.8545 of its viewBox width, so the render width is
# pre-compensated by that factor to land the ink at exactly 83.9%.
#
# Requires: rsvg-convert, ImageMagick 7 (`magick`).  Run from anywhere:  web/scripts/gen-icons.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SVG="$ROOT/assets/Mridangam-BlueCover-01.svg"
LOCKUP="$ROOT/assets/Logo-01.svg"           # drum + rays + "Śrī Gaudiya Kirtan", for the OG card
PUB="$ROOT/web/public"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PARCHMENT='#F5D094'                          # sampled from the app icon's background
INK_RATIO=0.8545                             # ink width / viewBox width for the drum SVG
DRUM_FRAC=0.839                              # drum ink width / canvas width, as in the app icon

# $1 = canvas size, $2 = output. Square icon: drum centred on parchment with a soft drop shadow.
render_square() {
  local size=$1 out=$2
  local target render
  target=$(python3 -c "print(round($size * $DRUM_FRAC))")
  render=$(python3 -c "print(round($target / $INK_RATIO))")
  rsvg-convert -w "$render" -a --background-color=none "$SVG" -o "$TMP/d.png"
  magick "$TMP/d.png" -trim +repage "$TMP/dt.png"
  # shadow scaled with the canvas so it reads the same at every size
  local blur off
  blur=$(python3 -c "print(max(1, round($size*0.041)))")
  off=$(python3 -c "print(max(1, round($size*0.010)))")
  magick "$TMP/dt.png" \( +clone -background black -shadow "42x${blur}+0+${off}" \) \
    +swap -background none -layers merge +repage "$TMP/ds.png"
  magick -size "${size}x${size}" "xc:$PARCHMENT" "$TMP/ds.png" \
    -gravity center -compose over -composite -strip "$out"
}

echo "→ web icons"
render_square 1024 "$TMP/master.png"
render_square 512  "$PUB/icon-512.png"
render_square 192  "$PUB/icon-192.png"
render_square 180  "$PUB/apple-touch-icon.png"
# Multi-resolution .ico so Windows/older browsers pick the right one; 16/32/48 are what they ask for.
magick "$TMP/master.png" -filter Lanczos -define icon:auto-resize=48,32,16 "$PUB/favicon.ico"

echo "→ og-image (1200x630, full lockup)"
rsvg-convert -h 470 -a --background-color=none "$LOCKUP" -o "$TMP/lock.png"
magick -size 1200x630 "xc:$PARCHMENT" "$TMP/lock.png" -gravity center -compose over -composite \
  -strip "$PUB/og-image.png"

echo "→ iOS AppIcon (single 1024 'any' entry, iOS 14+)"
IOS="$ROOT/ios/gk-ios/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS"
cp "$TMP/master.png" "$IOS/icon-1024.png"
cat > "$IOS/Contents.json" <<'JSON'
{
  "images" : [
    {
      "filename" : "icon-1024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSON

echo "→ Android launcher icons"
AND="$ROOT/andorid/app/src/main/res"
# Legacy square/round launcher bitmaps, per density (mdpi 48 → xxxhdpi 192).
for pair in "mdpi 48" "hdpi 72" "xhdpi 96" "xxhdpi 144" "xxxhdpi 192"; do
  set -- $pair
  mkdir -p "$AND/mipmap-$1"
  render_square "$2" "$TMP/l$2.png"
  magick "$TMP/l$2.png" "$AND/mipmap-$1/ic_launcher.webp"
  # round variant: same art, circular mask
  magick "$TMP/l$2.png" \( +clone -alpha extract -fill black -colorize 100 \
    -fill white -draw "circle $(( $2/2 )),$(( $2/2 )) $(( $2/2 )),0" -alpha off \) \
    -compose CopyOpacity -composite "$AND/mipmap-$1/ic_launcher_round.webp"
done
# Adaptive icon (API 26+): foreground must sit in the inner 66% safe zone, on a parchment background.
mkdir -p "$AND/mipmap-anydpi-v26" "$AND/drawable" "$AND/values"
for pair in "mdpi 108" "hdpi 162" "xhdpi 216" "xxhdpi 324" "xxxhdpi 432"; do
  set -- $pair
  target=$(python3 -c "print(round($2 * 0.62))")
  render=$(python3 -c "print(round($target / $INK_RATIO))")
  rsvg-convert -w "$render" -a --background-color=none "$SVG" -o "$TMP/af.png"
  magick "$TMP/af.png" -trim +repage -background none -gravity center -extent "${2}x${2}" \
    "$AND/mipmap-$1/ic_launcher_foreground.webp"
done
cat > "$AND/drawable/ic_launcher_background.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<!-- Flat parchment, matching the iOS/web icon background (sampled from the shipped app icon). -->
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="$PARCHMENT" />
</shape>
XML
for f in ic_launcher ic_launcher_round; do
cat > "$AND/mipmap-anydpi-v26/$f.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
XML
done

echo
echo "done. web:"
for f in favicon.ico icon-192.png icon-512.png apple-touch-icon.png og-image.png; do
  printf '  %-22s %s\n' "$f" "$(magick identify -format '%wx%h %b' "$PUB/$f")"
done
