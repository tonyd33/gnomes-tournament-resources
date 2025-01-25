#!/bin/bash

set -euo pipefail

while [ $# -gt 0 ]; do
  case "$1" in
    --mtx-path) MTX_PATH="$2"; shift 2;;
    --mtx-query) MTX_QUERY="$2"; shift 2;;
    --rtsp-port) RTSP_PORT="$2"; shift 2;;
    *)
      echo "Invalid argument"
      exit 1
      ;;
  esac
done

INPUT="rtsp://localhost:$RTSP_PORT/$MTX_PATH"
RECORDING_URL="rtsp://recording:8554/$MTX_PATH"
PLAYBACK_URL="rtsp://playback:8554/$MTX_PATH"
PLAYBACK_HLS_URL="rtsp://playback-hls:8554/$MTX_PATH"

# We're currently planning to use this only as a way for contestants to test
# their streams, not to be used for actual viewing, so we want to save as much
# resources as possible while transcoding to an HLS-compatible format.
HLS_TRANSCODING_SETTINGS=(
-c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k
-c:a aac -b:a 160k
)

# Tee the streams.
ffmpeg -i "$INPUT" \
  -c copy -f rtsp "$RECORDING_URL" \
  -c copy -f rtsp "$PLAYBACK_URL" \
  "${HLS_TRANSCODING_SETTINGS[@]}" -f rtsp "$PLAYBACK_HLS_URL"
