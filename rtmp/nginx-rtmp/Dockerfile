FROM tiangolo/nginx-rtmp:latest-2025-01-06

# Am I really installing netcat just for a healthcheck? Yes.
RUN apt update && apt install -y netcat

EXPOSE 1935

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=30s \
  --start-interval=1s \
  CMD nc -z localhost 1935

COPY ./nginx.conf /etc/nginx/nginx.conf
