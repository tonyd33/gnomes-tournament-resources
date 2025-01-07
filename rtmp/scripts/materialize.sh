#!/bin/bash

set -eo pipefail

DIR="$(dirname "$0")"
SCRIPT_NAME=${0##*/}

TERRAFORM_DIR="$(realpath $DIR/../iac/tf)"
ANSIBLE_DIR="$(realpath $DIR/../iac/ansible)"
ANSIBLE_INVENTORY="$(realpath $ANSIBLE_DIR/inventory.ini)"

DEFAULT_WORKERS=2
DEFAULT_STORAGE_SIZE=100
DEFAULT_MASTER_INSTANCE_TYPE="t2.micro"
DEFAULT_WORKER_INSTANCE_TYPE="t2.micro"
DEFAULT_PORKBUN_API_KEY="$HOME/.secrets/porkbun-api-key"
DEFAULT_PORKBUN_SECRET_KEY="$HOME/.secrets/porkbun-secret-key"

WORKERS="$DEFAULT_WORKERS"
STORAGE_SIZE="$DEFAULT_STORAGE_SIZE"
MASTER_INSTANCE_TYPE="$DEFAULT_MASTER_INSTANCE_TYPE"
WORKER_INSTANCE_TYPE="$DEFAULT_WORKER_INSTANCE_TYPE"
PORKBUN_API_KEY="$DEFAULT_PORKBUN_API_KEY"
PORKBUN_SECRET_KEY="$DEFAULT_PORKBUN_SECRET_KEY"

function print_help {
  cat <<EOF
Usage: ${SCRIPT_NAME} [options...]
Materialize.

Required options:
  --workers,-w [number]                  Number of workers.
                                         Default: $DEFAULT_WORKERS
  --storage-size [number]                Size in gigabytes for the storage.
                                         Default: $DEFAULT_STORAGE_SIZE
  --master-instance-type [instance-type] Instance type for master
                                         Default: $DEFAULT_MASTER_INSTANCE_TYPE
  --worker-instance-type [instance-type] Instance type for workers
                                         Default: $DEFAULT_WORKER_INSTANCE_TYPE
  --porkbun-api-key [api-key]            Porkbun api key. For DNS.
                                         Default: $DEFAULT_PORKBUN_API_KEY
  --porkbun-secret-key [secret-key]      Porkbun secret key. For DNS.
                                         Default: $DEFAULT_PORKBUN_SECRET_KEY
EOF
}

while [ $# -gt 0 ]; do
  case $1 in
    --workers|-w)
      WORKERS="$2"
      shift 2
      ;;
    --storage-size)
      STORAGE_SIZE="$2"
      shift 2
      ;;
    --master-instance-type)
      MASTER_INSTANCE_TYPE="$2"
      shift 2
      ;;
    --worker-instance-type)
      WORKER_INSTANCE_TYPE="$2"
      shift 2
      ;;
    --porkbun-api-key)
      PORKBUN_API_KEY="$2"
      shift 2
      ;;
    --porkbun-secret-key)
      PORKBUN_SECRET_KEY="$2"
      shift 2
      ;;
    *)
      print_help
      exit 1
  esac
done

TF_OUTPUTS=$(mktemp)

cat <<EOF
Confirm configuration?

WORKERS              = $WORKERS
STORAGE_SIZE         = $STORAGE_SIZE
MASTER_INSTANCE_TYPE = $MASTER_INSTANCE_TYPE
WORKER_INSTANCE_TYPE = $WORKER_INSTANCE_TYPE
PORKBUN_API_KEY      = $PORKBUN_API_KEY
PORKBUN_SECRET_KEY   = $PORKBUN_SECRET_KEY

yes/no
EOF
read CONFIRM

if [ "$CONFIRM" != 'y' ] && [ "$CONFIRM" != 'yes' ]; then
  echo "Denied. Confirm with yes."
  exit 1
fi

echo "Applying infrastructure..."
terraform -chdir="$TERRAFORM_DIR" apply \
  -var="master_instance_type=$MASTER_INSTANCE_TYPE" \
  -var="worker_instance_type=$WORKER_INSTANCE_TYPE" \
  -var="worker_count=$WORKERS" \
  -var="storage_size=$STORAGE_SIZE"
terraform -chdir="$TERRAFORM_DIR" show -json > "$TF_OUTPUTS"

# screw stupidly complex jq commands. I'm just gonna write an inline node script
# lol
echo "Generating inventory..."
cat <<EOF | node > "$ANSIBLE_INVENTORY"
const fs = require('fs')
const outputs = JSON.parse(fs.readFileSync("$TF_OUTPUTS", 'utf8')).values.outputs
const master = outputs.master_public_ip.value
const workers = outputs.worker_public_ips.value

const inventory = [
  "[master]",
  master,
  "",
  "[worker]",
  ...workers
].join('\n')

process.stdout.write(inventory)
EOF
rm "$TF_OUTPUTS"
echo

MASTER_IP="$(grep -A 1 '\[master\]' "$ANSIBLE_INVENTORY" | tail -n1)"

echo "Setting DNS records..."
PORKBUN_DATA=$(
cat <<EOF
{
  "secretapikey": "$(cat $PORKBUN_SECRET_KEY)",
  "apikey": "$(cat $PORKBUN_API_KEY)",
  "content": "$MASTER_IP",
  "ttl": "600"
}
EOF
)
curl -X POST \
  -L 'https://api.porkbun.com/api/json/v3/dns/editByNameType/gnomes.moe/A/rtmp' \
  -H 'Content-Type: text/plain' \
  -d "$PORKBUN_DATA" || exit 1
echo

# get ips for keyscan from the inventory lmfao, screw writing another node
# script or query
echo "Scanning IPs..."
KEYSCAN_IPS="$(grep '\.' "$ANSIBLE_INVENTORY")"
set +e
echo "$KEYSCAN_IPS" | while read line; do
  echo "Scanning $line"
  ssh-keygen -R $line >/dev/null 2>&1
  ssh-keyscan -H $line >> ~/.ssh/known_hosts
done
ssh-keygen -R "rtmp.gnomes.moe" >/dev/null 2>&1
ssh-keyscan -H "rtmp.gnomes.moe" >> ~/.ssh/known_hosts
set -e
echo


echo "Deploying..."
cd "$ANSIBLE_DIR"
source ansible/bin/activate
pip install -r requirements.txt
ansible-galaxy install -r roles/requirements.yml -p roles/
ansible-playbook \
  -i "$ANSIBLE_INVENTORY" main.yml \
  -e '{generate_stream_keys: true, override_stream_keys: false}'
deactivate
cd -
echo

STREAM_KEYS_FILE=$(mktemp)
scp ubuntu@rtmp.gnomes.moe:/mnt/rtmp/shared-resources/stream-keys "$STREAM_KEYS_FILE"
cat <<EOF
All done.

Stream keys are available at $STREAM_KEYS_FILE

SSH into the master node with:
ssh ubuntu@rtmp.gnomes.moe
EOF
echo
