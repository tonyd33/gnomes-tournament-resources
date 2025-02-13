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
RELAY="rtsp://relay:8554"
AUTH_SERVER="http://auth-server:6570/v1"

# RTMP only accepts certain codecs. The audio/video codec we're given is
# unknown and may be incompatible, which means we have to transcode.
# Transcoding can be fairly expensive though, so we first check if the
# codec is compatible before doing any transcoding.
# TODO: Check _all_ video/audio streams
VIDEO_CODEC=$(
  ffprobe \
    -timeout 1000 \
    -v error \
    -select_streams v:0 \
    -show_entries stream=codec_name \
    -of csv=p=0 \
    "$INPUT" ||\
    echo unknown
)
AUDIO_CODEC=$(
  ffprobe \
    -timeout 1000 \
    -v error \
    -select_streams a:0 \
    -show_entries stream=codec_name \
    -of csv=p=0 \
    "$INPUT" ||\
    echo unknown
)

SUPPORTED_VIDEO_CODECS=$(cat <<EOF
h264
EOF
)
SUPPORTED_AUDIO_CODECS=$(cat<<EOF
aac
adpcm_g722
pcm_mulaw
pcm_alaw
EOF
)

VIDEO_OPTIONS="-c:v copy"
AUDIO_OPTIONS="-c:a copy"

echo "Stream has video encoding $VIDEO_CODEC and audio encoding $AUDIO_CODEC." >&2

if ! echo "$SUPPORTED_VIDEO_CODECS" | grep "$VIDEO_CODEC" > /dev/null; then
  echo "Incompatible video codec, will transcode to h264." >&2
  # Pad width/height because it may otherwise causes an error with libx264 for
  # some reason
  # https://stackoverflow.com/a/20848224
  VIDEO_OPTIONS='-c:v libx264 -preset veryfast -b:v 2500k -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"'
fi

if ! echo "$SUPPORTED_AUDIO_CODECS" | grep "$AUDIO_CODEC" > /dev/null; then
  echo "Incompatible audio codec, will transcode to aac." >&2
  AUDIO_OPTIONS="-c:a aac -b:a 128k"
fi

echo "Finding canonical name of $MTX_PATH" >&2
# Now, find the canonical identity of this publisher.
CNAME=$(curl -sf "$AUTH_SERVER/users/by-token/$MTX_PATH" | jq -r '.username')
echo "Found canonical name at $CNAME" >&2

# Some weird shit happens if I run the command regularly without `eval` around
# the ffmpeg pad filter, likely because of quoting issues. Seems to go away when
# I do an `eval` though.
# TODO: Just use bash arrays now that bash is installed here.
CMD=$(cat <<EOF
ffmpeg -i "$INPUT" \
  $VIDEO_OPTIONS \
  $AUDIO_OPTIONS \
  -f rtsp "$RELAY/$CNAME"
EOF
)
echo "Running $CMD" >&2
eval "$CMD"


