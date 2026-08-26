# 挑战全网最简单功能最全最好学的RBAC管理系统!

### 项目概述

**ReactAdmin** 是一套基于 RBAC 模型的后台管理脚手架。

做这个项目的初衷很简单：市面上大多数后台管理系统要么太重，依赖一堆复杂组件，上手门槛高；要么太轻，只搭了个壳子，离实际开发还有一段距离。我希望能做一个介于两者之间的东西——功能完整，但结构足够清晰，代码也足够干净。

整个系统只有 7 张表，但用户管理、角色权限、菜单配置、操作日志、文件管理、数据字典这些后台必备的能力全都包含在内。你可以把它当成一个“刚刚好”的起点，无论是拿来直接做项目，还是作为学习 RBAC 和 Spring Boot + React 全家桶的示例，都挺合适。

登录账号：admin / admin123

![登录页轮播](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E7%99%BB%E5%BD%95%E9%A1%B5.png)
![系统页面](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E7%B3%BB%E7%BB%9F%E9%A1%B5%E9%9D%A2.png)
![菜单权限以及接口权限](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E8%8F%9C%E5%8D%95%E6%9D%83%E9%99%90%E4%BB%A5%E5%8F%8A%E6%8E%A5%E5%8F%A3%E6%9D%83%E9%99%90.png)
![文件管理](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E6%96%87%E4%BB%B6%E7%AE%A1%E7%90%86.png)
![角色配置](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E8%A7%92%E8%89%B2%E9%85%8D%E7%BD%AE.png)
![登录页轮播配置](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E7%99%BB%E5%BD%95%E9%A1%B5%E8%BD%AE%E8%AF%A2%E9%85%8D%E7%BD%AE.png)

监控
![SpringBootAdmin监控](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/SpringBootAdmin%E7%9B%91%E6%8E%A7.png)
![接口文档API](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3API.png)
![数据库监控](https://lain-test-oss.oss-cn-shenzhen.aliyuncs.com/%E6%95%B0%E6%8D%AE%E5%BA%93%E7%9B%91%E6%8E%A7.png)

### docker 部署

参考[DEPLOY_dockercompose.md](DEPLOY_dockercompose.md)

### 技术栈

#### 后端技术栈
- **编程语言**: Java 21
- **框架**: Spring Boot 3.2.0
- **持久层**: MyBatis-Plus 3.5.15
- **安全认证**: Sa-Token 1.40.0
- **数据库连接池**: Druid 1.2.20
- **文档工具**: Knife4j 4.4.0
- **后端仓库**: [ReactAdmin](https://github.com/AxisLamb/ReactAdmin)

#### 前端技术栈
- **运行环境**: Node.js 22.17.0
- **React版本**: 19.x
- **构建工具**: Vite 7.x
- **UI框架**: Ant Design React 5.x
- **前端仓库**: [ReactAdminFront](https://github.com/AxisLamb/ReactAdminFront)

## 后端启动方法
如果没有数据库需要预先安装数据库。执行命令：
```bash
mvn clean install
```
参考下面的`数据库配置示例`，`文件存储配置示例`，`缓存配置示例` 修改配置文件 `application-dev.yml`，并启动项目。

## 前端启动方法
To start the frontend application, simply run these two commands:
```bash
npm install
npm run dev
```

## 核心特性

### 1. 多数据库支持

项目支持多种主流数据库，可根据实际需求灵活切换：

#### 已集成数据库驱动
- **MySQL**
- **SQL Server**
- **PostgreSQL**
- **Oracle**

#### 数据库配置示例
```yaml

os:
  # 数据库类型：mysql / postgresql / sqlserver / oracle，切换后自动加载 application-dev/db-<type>.yml
  db:
    type: sqlserver

spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      # SQL Server 配置示例，可以按需改成MySQL，Oracle，PostgreSQL数据库等
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
      url: jdbc:sqlserver://localhost:1433;DatabaseName=test;encrypt=false
      username: sa
      password: admin123
```


### 2. 多文件存储系统

项目支持多种文件存储方案，满足不同部署环境的需求：

#### 支持的存储方式
- **本地存储**: 直接保存到服务器本地文件系统
- **MinIO**: 分布式对象存储解决方案
- **阿里云OSS**: 阿里云对象存储服务
- **华为云OBS**: 华为云对象存储服务（已集成但未启用）
- **七牛云**: 七牛云对象存储服务（已集成但未启用）

#### 文件存储配置示例
```yaml
os:
  file:
    # 可选LOCAL, MINIO, ALIYUN
    type: LOCAL 
    local:
      # 实际存储路径（项目根路径下）
      base-path: ./uploads/

    minio:
      endpoint: http://xxx:9000
      access-key: admin
      secret-key: password

    aliyun:
      endpoint: xxx
      access-key-id: xxx
      access-key-secret: xxx
```


### 3. 多缓存策略

项目支持多种缓存实现，提升系统性能：

#### 缓存选项
- **Redis**: 分布式缓存，支持集群部署
- **本地缓存**: 基于 Caffeine 的高性能本地缓存

#### 缓存配置示例
```yaml
os:
  cache:
    type: REDIS  # 支持 CAFFEINE, REDIS
    redis:
      # ip: 10.10.10.181
      ip: localhost
      port: 6379
      password: '123456'
      database: 0
```

如果改为用CAFFEINE，则pom中需要打开sa-token-caffeine的注释，同时注释sa token Redis的配置，如下：
```
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-caffeine</artifactId>
    <version>1.41.0</version>
</dependency>
<!--        <dependency>-->
<!--            <groupId>cn.dev33</groupId>-->
<!--            <artifactId>sa-token-redis-jackson</artifactId>-->
<!--            <version>${sa-token.version}</version>-->
<!--        </dependency>-->        
```


## 项目架构

### 核心功能模块
- **用户管理**: 用户账号、个人信息管理
- **角色管理**: 权限分配与角色管理
- **菜单管理**: 动态菜单配置
- **系统日志**: 操作审计日志
- **数据字典**: 系统参数配置
- **文件管理**: 多存储后端文件管理

### 安全机制
- **权限控制**: 基于 RBAC 模型的细粒度权限控制
- **身份认证**: Sa-Token 实现的会话管理和认证
- **审计日志**: 完整的操作记录和审计追踪

## 部署配置

### 环境配置
项目支持多环境配置（开发、测试、生产），通过 Maven Profile 管理：

- **dev**: 开发环境
- **test**: 测试环境
- **prod**: 生产环境

### 数据源配置
支持多数据源动态切换，可在配置文件中灵活调整数据库连接参数。

## 适用场景

### 企业级应用
- 中大型企业管理系统的后台支撑
- 需要复杂权限控制的业务系统
- 对数据安全和审计有要求的应用

### 技术优势
- **高扩展性**: 插件化的存储和缓存系统
- **多环境适配**: 一套代码适应不同部署环境
- **开箱即用**: 完整的权限管理和基础功能模块
- **技术前沿**: 采用最新的 Java 21 和 Spring Boot 3.2.0

### 总结

如果要用一句话概括 ReactAdmin，那就是：**该有的都有，不该有的绝不乱加。**

它不像一些重型框架那样让你花大量时间理解它的约定和插件机制，也不像简单的 demo 那样只能看看不能实战。我们在设计时最看重两件事：一是**核心功能要完整**，权限、日志、存储、缓存这些企业级必备的能力都要覆盖；二是**扩展要简单**，数据库可以从 MySQL 切到 PostgreSQL，文件存储可以从本地换成 MinIO 或阿里云，缓存可以从本地切到 Redis，改几行配置就能搞定。

这套简单的RBAC系统目前还在开发中，不敢说完美，但胜在实在。欢迎提 Issue 或一起贡献代码，让这个项目对更多人有用。
