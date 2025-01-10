#!/bin/bash

set -eo pipefail

DIR="$(dirname "$0")"
SCRIPT_NAME=${0##*/}

TERRAFORM_DIR="$(realpath $DIR/../iac/tf)"
function print_help {
  cat <<EOF
Usage: ${SCRIPT_NAME}
Dematerialize.
EOF
}

terraform -chdir="$TERRAFORM_DIR" destroy
