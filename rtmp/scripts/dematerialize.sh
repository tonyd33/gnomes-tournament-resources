#!/bin/bash

set -eo pipefail

DIR="$(dirname "$0")"
SCRIPT_NAME=${0##*/}

TERRAFORM_DIR="$(realpath $DIR/../iac/tf)"
print_help() {
  cat <<EOF
Usage: ${SCRIPT_NAME} [options...]
Dematerialize.

Options: 
  --dangerously-auto-approve             Dangerously auto approve terraform
                                         prompts.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dangerously-auto-approve)
      DANGEROUSLY_AUTO_APPROVE=true
      shift
      ;;
    *)
      print_help
      exit 1
  esac
done

TERRAFORM_CMD=(terraform -chdir="$TERRAFORM_DIR" destroy)
if [ "$DANGEROUSLY_AUTO_APPROVE" = true ]; then
  TERRAFORM_CMD+=(-auto-approve)
fi

"${TERRAFORM_CMD[@]}"
