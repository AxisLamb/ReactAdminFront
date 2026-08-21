FROM registry.cn-shenzhen.aliyuncs.com/lain_docker_server/nginx::1.17
MAINTAINER Lain <<494576412@qq.com>>

COPY nginx.template /etc/nginx/conf.d/nginx.template
COPY dist/ /etc/nginx/html

# 通过 envsubst 命令替换 nginx.template 模板中的变量，并覆盖/etc/nginx/nginx.conf
CMD envsubst '$NGINX_HOST $DOCKER_REQUEST_DOMAIN_PREFIX' < /etc/nginx/conf.d/nginx.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

