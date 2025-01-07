FROM nginx:1.27.3-alpine

EXPOSE 1936

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=30s \
  --start-interval=1s \
  CMD netstat -an | grep 1936 > /dev/null; if [ 0 != $? ]; then exit 1; fi;

COPY ./nginx.conf /etc/nginx/nginx.conf
