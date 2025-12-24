# 编译阶段
FROM node:22.20.0-alpine3.22 AS build
WORKDIR /app

# 先复制依赖文件
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm install && \
    npm install terser --save-dev

# 再复制全部文件
COPY . .

RUN npm run build

RUN chmod -R 777 /app/docs

# 最终镜像
FROM lipanski/docker-static-website:2.6.0

# 静态文件路径 /home/static
COPY --from=build /app/docs /home/static/

ENTRYPOINT ["/busybox-httpd", "-f", "-v"]
CMD [ "-p", "5152" ]

# 暴露端口
EXPOSE 5152

LABEL 原项目地址="https://github.com/setube/vue-idle-xiuxian"
LABEL 镜像制作者="https://space.bilibili.com/17547201"
LABEL GitHub主页="https://github.com/Firfr/idle-xiuxian"
LABEL Gitee主页="https://gitee.com/firfe/idle-xiuxian"

# docker buildx build --platform linux/amd64 --tag firfe/idle-xiuxian:1.0.5 --output type=docker .
# docker buildx build --platform linux/arm64 --tag firfe/idle-xiuxian:1.0.5-arm64 --output type=docker .
