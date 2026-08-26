
# React Admin 项目 Docker 部署方案

## 1. 部署步骤

### 1.1 创建目录结构
```bash
# 创建项目根目录及数据目录
mkdir -p /usr/project/reactadmin/redis/data
mkdir -p /usr/project/reactadmin/mysql/data
mkdir -p /usr/project/reactadmin/mysql/mysql_init_data
```

### 1.2 放置配置文件
```bash
# 将环境变量配置文件放入项目根目录
cp /path/to/your/prod.env /usr/project/reactadmin/

# 将 MySQL 初始化脚本放入 mysql_init_data 目录
cp /path/to/your/mysql_init.sql /usr/project/reactadmin/mysql/mysql_init_data/
```

### 1.3 放置 docker-compose.yml
```bash
# 将 docker-compose.yml 放入项目根目录
cp /path/to/your/docker-compose.yml /usr/project/reactadmin/
```

### 1.4 拉取镜像并启动服务
```bash
cd /usr/project/reactadmin
docker-compose pull
docker-compose up -d
```

### 1.5 验证服务
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 2. 常用运维命令

```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 重启服务
docker-compose restart

# 更新镜像并重启
docker-compose pull && docker-compose up -d
```

---

## 3. 访问地址

| 服务 | 地址 |
|------|------|
| 前端页面 | `http://<宿主机IP>` |
| 后端 API | `http://<宿主机IP>:8888` |

---

完成以上步骤即部署完毕。