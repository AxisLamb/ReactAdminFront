# ReactAdmin - Multi-database Supported Classic Backend Management System

## Project Overview

**ReactAdmin** is a classic backend management system based on the RBAC (Role-Based Access Control) model. The project adopts a front-end and back-end separation architecture with high scalability and flexibility.

### Technology Stack

#### Backend Technology Stack
- **Programming Language**: Java 21
- **Framework**: Spring Boot 3.2.0
- **Persistence Layer**: MyBatis-Plus 3.5.15
- **Security Authentication**: Sa-Token 1.40.0
- **Database Connection Pool**: Druid 1.2.20
- **Documentation Tool**: Knife4j 4.4.0

#### Frontend Technology Stack
- **Runtime Environment**: Node.js v22.17.0
- **UI Framework**: Ant Design React 5.x

## Core Features

### 1. Multi-database Support

The project supports multiple mainstream databases that can be flexibly switched according to actual needs:

#### Integrated Database Drivers
- **MySQL**: Supported via `mysql-connector-j` driver
- **SQL Server**: Supported via `mssql-jdbc` driver
- **PostgreSQL**: Can be enabled through configuration
- **Oracle**: Can be supported by adding driver support

#### Database Configuration Example
```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      # SQL Server Configuration Example
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
      url: jdbc:sqlserver://192.168.1.130:1433;DatabaseName=test;encrypt=false
      username: sa
      password: admin123
```

### 2. Multi-file Storage System

The project supports multiple file storage solutions to meet the needs of different deployment environments:

#### Supported Storage Methods
- **Local Storage**: Directly saved to server's local file system
- **MinIO**: Distributed object storage solution
- **Alibaba Cloud OSS**: Alibaba Cloud Object Storage Service
- **Huawei Cloud OBS**: Huawei Cloud Object Storage Service (integrated but not enabled)
- **Qiniu Cloud**: Qiniu Cloud Object Storage Service (integrated but not enabled)

#### File Storage Configuration Example
```yaml
os:
  file:
    client:
      type: MINIO  # Supports LOCAL, MINIO, ALIYUN, etc.
  local:
    base-path: ./uploads  # Local storage path
  minio:
    endpoint: http://10.37.131.224:9000
    access-key: admin
    secret-key: password
```

### 3. Multi-cache Strategy

The project supports multiple cache implementations to improve system performance:

#### Cache Options
- **Redis**: Distributed cache supporting cluster deployment
- **Local Cache**: High-performance local cache based on Caffeine

#### Cache Configuration Example
```yaml
os:
  cache:
    type: REDIS  # Supports REDIS or LOCAL
  redis:
    ip: localhost
    port: 16379
    password: 'SbtyMveYNfLzTks7H0apCmyStPzWJqjy'
    database: 0
```

## Project Architecture

### Core Function Modules
- **User Management**: User accounts, personal information management
- **Role Management**: Permission allocation and role management
- **Menu Management**: Dynamic menu configuration
- **Department Management**: Organizational structure management
- **System Log**: Operation audit logs
- **Data Dictionary**: System parameter configuration
- **File Management**: Multi-storage backend file management
- **Content Management**: Articles, categories, tag management

### Security Mechanism
- **Permission Control**: Fine-grained permission control based on RBAC model
- **Identity Authentication**: Session management and authentication implemented by Sa-Token
- **Audit Log**: Complete operation records and audit tracking

## Deployment Configuration

### Environment Configuration
The project supports multi-environment configuration (development, testing, production), managed through Maven Profiles:

- **dev**: Development environment
- **test**: Testing environment
- **prod**: Production environment

### Data Source Configuration
Supports dynamic switching of multiple data sources, with flexible adjustment of database connection parameters in the configuration files.

## Frontend Startup Method
To start the frontend application, simply run these two commands:
```bash
npm install
npm run dev
```

## Applicable Scenarios

### Enterprise Applications
- Backend support for medium and large enterprise management systems
- Business systems requiring complex permission controls
- Applications with requirements for data security and audit

### Technical Advantages
- **High Scalability**: Plugin-based storage and caching systems
- **Multi-environment Adaptation**: Single codebase adapts to different deployment environments
- **Ready-to-use**: Complete permission management and basic function modules
- **Cutting-edge Technology**: Adopting the latest Java 21 and Spring Boot 3.2.0

## Summary

ReactAdmin is a complete, advanced, and highly extensible enterprise-level backend management system template. Its biggest feature is the **highly decoupled design**, whether it's databases, file storage, or caching systems, all can be flexibly configured according to actual needs, making it very suitable for enterprise projects that need to adapt to multiple technology stacks and deployment environments.