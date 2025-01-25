# Stream Server

This directory contains resources to provision a streaming server.

## Dependencies

- terraform
- python3
- A porkbun API key and secret key

## Provisioning

### Setup

Create a file:
```
# iac/tf/credentials.auto.tfvars
porkbun_api_key = "<api-key>"
porkbun_secret_key = "<secret-key>"
```

Ensure the `iac/tf/defaults.auto.tfvars` variables are adequate, or modify them
as necessary.

### Provision the cluster

```sh
# Provision the cluster
cd iac/tf
terraform apply
cd -
```

### Install and prepare ansible

```sh
cd iac/ansible
# Create a python venv if necessary
! [ -d venv ] && python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
ansible-galaxy collection install -r requirements.yml

# Update SSH hosts
ansible all --list-hosts -i inventory.yml |\
  tail -n+2 |\
  awk '{ print $1 }' |\
  while read -r line; do
    ssh-keygen -R "$line"
    ssh-keyscan -H "$line" >> ~/.ssh/known_hosts
  done
```

### Create ansible secrets

Create `iac/ansible/group_vars/all/secrets.yml` with the following content,
filling it in with appropriate values:

```yaml
secrets:
  portainer_agent_secret:
  portainer_admin_password:

  porkbun_api_key:
  porkbun_secret_key:

  traefik_admin_password:

  grafana_admin_password:

  webhook_url:

  postgres:
    user:
    password:

  auth_server:
    jwt_secret:
    admin_user:
    admin_password:
```

### Deploy

```sh
ansible-playbook -i inventory.yml main.yml
```

## Infrastructure

The infrastructure is built on a fairly simple Docker Swarm cluster, consisting
of just a single master node and a variable amount of worker nodes.
We use only a single master node because we're just using Swarm features to
allow us to clusterize the infrastructure across multiple nodes easily.

We use [MediaMTX](https://github.com/bluenviron/mediamtx/tree/main) containers
as application-level nodes in the cluster. We have multiple ingress containers
that communicate with an small, custom authentication server to authenticate
and remap the stream paths and send them to a relay container.
The relay container tee's the stream into a general playback server, a dedicated
HLS server, and a recording server.
We have a dedicated HLS server because HLS supports only a small amount of
codecs, and we'd rather not be forced to transcode to the general playback
server, which will be used as a primary means of pulling and compositing
streams.

The authentication server also acts as a general API server, allowing us to
create and modify users and tokens on the fly.

We additionally deploy a minimal WHIP client for publishers to stream from their
browsers if they so wish. In the same application, we package a HLS playback
client to allow any publisher (not limited to WHIP) to test if their stream is
being received.

We have some other miscellaneous components like Traefik reverse-proxying
HTTPS applications we want to expose, Portainer for easy admin management, and
a Prometheus + Grafana stack for monitoring.

### Future improvements

We're bottlenecked by a single playback server currently. This is because we
don't have a L7 reverse proxy for all the streaming protocols, meaning we're
forced to relay all the streams to a single playback server for consumption.

While this satisfies our current requirements, there is a serious problem if we
want to scale. We should consider implementing a simple L7 proxy for at least
RTSP and/or RTMP that leverages Docker Swarm's DNS service discovery alongside
MediaMTX's HTTP API to list available streams to dynamically proxy backends.
This allows for multiple playback servers, allowing the entire cluster to scale
indefinitely.
