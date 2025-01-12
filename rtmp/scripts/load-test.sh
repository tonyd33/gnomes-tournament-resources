#!/bin/sh

SCRIPT_NAME=${0##*/}

FILE=stream-keys
NUM_KEYS=100
OVERWRITE=0
LOOP_ARG=""

print_help() {
  cat <<EOF
Usage: ${SCRIPT_NAME} [options...]
Generates load by streaming to an rtmp server.

Required options:
  --video,-v       [file]   Input video
  --server,-s      [server] RTMP server url
  --start-index    [number]
  --end-index      [number]
  --loop,-l                 Loop each video
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
    --start-index)
      START_INDEX="$2"
      shift 2
      ;;
    --end-index)
      END_INDEX="$2"
      shift 2
      ;;
    --loop|-l)
      LOOP_ARG="-stream_loop -1"
      shift
      ;;
    *)
      print_help
      exit 1
  esac
done

if [ -z "$VIDEO" ] ||\
  [ -z "$SERVER" ] ; then
  print_help
  exit 1
fi

FFMPEG_CMD=(
  ffmpeg $LOOP_ARG -hwaccel cuda -re -i "$VIDEO" -c:v h264_nvenc -c:a aac -ar 44100 -ac 1 -f flv
)

PIDS=()

handle_ctrlc() {
  echo "killing children"
  for pid in ${PIDS[@]}; do
    echo "killing $pid"
    kill $pid
  done
}

trap handle_ctrlc SIGINT

for i in $(seq "$START_INDEX" "$END_INDEX"); do
  "${FFMPEG_CMD[@]}" "$SERVER/$i" >/dev/null &
  PIDS[${i}]=$!
  sleep 2s
done


echo "waiting for children..."
for pid in ${PIDS[@]}; do
  echo "waiting for $pid"
  wait $pid
done
