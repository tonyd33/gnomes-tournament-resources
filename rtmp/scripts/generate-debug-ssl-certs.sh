#!/bin/sh

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout domain.key \
  -out domain.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=domain.com"
