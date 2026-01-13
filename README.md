# ReactAdmin - 多数据库支持的经典后台管理系统

## 项目概述

**ReactAdmin** 是一个基于 RBAC（基于角色的访问控制）模式的经典后台管理系统。该项目采用前后端分离架构，系统非常简约，只有7张表，但是五脏俱全，简化了学习成本。欢迎各位提出ISSUE或一起开发！

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
    type: MINIO # 支持 LOCAL, MINIO, ALIYUN 等
    local:
      base-path: ./uploads # 本地存储路径
    
    minio:
      endpoint: http://localhost:9000
      access-key: admin
      secret-key: password
    
    aliyun:
      oss:
        endpoint: your-endpoint
        access-key-id: your-access-key-id
        access-key-secret: your-access-key-secret
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
    type: REDIS  # 支持 LOCAL, REDIS
    redis:
      # ip: 10.10.10.181
      ip: localhost
      port: 6379
      password: '123456'
      database: 0
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

## 总结

ReactAdmin 是一个功能完善、技术先进、扩展性强的企业级后台管理系统模板。其最大的特点是**高度解耦的设计**，无论是数据库、文件存储还是缓存系统，都可以根据实际需求灵活配置，非常适合需要适配多种技术栈和部署环境的企业级项目。