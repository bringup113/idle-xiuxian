# 闲置修仙 - Idle Xiuxian

一个基于 Vue 的放置类修仙游戏。

## ✨ 新功能

- ✅ 抽奖结果按品质自动排序（从好到差）
  - 装备: 仙品 > 极品 > 上品 > 中品 > 下品 > 凡品
  - 灵宠: 神品 > 仙品 > 玄品 > 灵品 > 凡品

## 🚀 快速部署

### 使用 Docker Compose（推荐）

```bash
# 克隆仓库
git clone https://github.com/bringup113/idle-xiuxian.git
cd idle-xiuxian

# 启动服务
docker-compose up -d

# 访问游戏
# 浏览器打开 http://localhost:5152
```

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs -f
```

## ⚙️ 自定义端口

如果需要修改端口，编辑 `docker-compose.yml`:

```yaml
ports:
  - 8080:8080  # 将 5152 改为你想要的端口
command: ["-p", "8080"]  # 取消注释并设置对应端口
```

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

## 📦 Docker 镜像

该项目使用 GitHub Actions 自动构建并推送 Docker 镜像到 Docker Hub。

- 镜像地址: `bringup113/idle-xiuxian:latest`
- 支持架构: `linux/amd64`, `linux/arm64`

## 📝 原项目地址

- 原项目：https://github.com/setube/vue-idle-xiuxian

## 📄 License

MIT License
