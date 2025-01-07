#!/bin/bash

set -e

SCRIPT_NAME=${0##*/}

FILE=stream-keys
NUM_KEYS=100
OVERWRITE=0

function print_help {
  cat <<EOF
Usage: ${SCRIPT_NAME} [options...]
Generates stream keys.

Options:
  --file,-f      File to write to.
  --num-keys,-n  Number of keys to generate.
  --overwrite,-x Overwrite the file if it exists.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --file|-f)
      FILE="$2"
      shift 2
      ;;
    --num-keys|-n)
      NUM_KEYS="$2"
      shift 2
      ;;
    --overwrite|-x)
      OVERWRITE=1
      shift
      ;;
    *)
      print_help
      exit 1
  esac
done

[ "$OVERWRITE" -eq 1 ] && [ -e "$FILE" ] && rm "$FILE"

for i in $(seq 1 "$NUM_KEYS"); do
  openssl rand -hex 32 >> "$FILE"
done
