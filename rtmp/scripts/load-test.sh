#!/bin/sh

SCRIPT_NAME=${0##*/}

FILE=stream-keys
NUM_KEYS=100
OVERWRITE=0

print_help() {
  cat <<EOF
Usage: ${SCRIPT_NAME} [options...]
Generates load by streaming to an rtmp server.

Required options:
  --video,-v       [file]   Input video
  --server,-s      [server] RTMP server url
  --num-streams,-n [number] Number of streams
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --video|-v)
      VIDEO="$2"
      shift 2
      ;;
    --server|-s)
      SERVER="$2"
      shift 2
      ;;
    --num-streams|-n)
      NUM_STREAMS="$2"
      shift 2
      ;;
    *)
      print_help
      exit 1
  esac
done

if [ -z "$VIDEO" ] ||\
  [ -z "$SERVER" ] ||\
  [-z "$NUM_STREAMS" ]; then
  print_help
  exit 1
fi

for i in $(seq 1 "$NUM_STREAMS"); do
  ffmpeg -stream_loop -1 -re -i "$VIDEO" -c:v libx264 -c:a aac -ar 44100 -ac 1 -f flv "$SERVER" &
done
