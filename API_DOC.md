# ReactAdmin 前端接口文档

## 目录

- [项目概述](#项目概述)
- [数据库表结构](#数据库表结构)
- [通用说明](#通用说明)
- [接口列表](#接口列表)
  - [认证模块](#1-认证模块-auth)
  - [用户管理](#2-用户管理-sysuser)
  - [角色管理](#3-角色管理-sysrole)
  - [菜单管理](#4-菜单管理-sysmenu)
  - [数据字典](#5-数据字典-sysdict)
  - [字典项管理](#6-字典项管理-sysdictitem)
  - [文件管理](#7-文件管理-images)

---

## 项目概述

本项目是基于 RBAC（基于角色的访问控制）的经典后台管理系统，采用前后端分离架构。

**技术栈：**
- 后端：Spring Boot 3.2 + MyBatis-Plus + Sa-Token
- 前端：React 19 + Vite 7 + Ant Design 5

**核心功能模块：**
- 用户管理、角色管理、菜单管理
- 数据字典管理
- 文件存储管理（支持本地/MinIO/阿里云OSS等）
- 系统审计日志

---

## 数据库表结构

### 核心表关系

```
sys_user (用户表)
    └── sys_user_role (用户角色关联) ──→ sys_role (角色表)
                                            └── sys_role_menu (角色菜单关联) ──→ sys_menu (菜单表)

sys_dict (字典表) ──→ sys_dict_item (字典项表)

file_info (文件信息表)
sys_audit_log (审计日志表)
```

### 表结构详情

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| sys_user | 系统用户 | user_id, username, password, real_name, email, mobile, status |
| sys_role | 角色 | role_id, role_name, role_desc, status |
| sys_menu | 菜单 | menu_id, parent_id, name, url, react_component, perms, type, icon |
| sys_user_role | 用户角色关联 | user_id, role_id |
| sys_role_menu | 角色菜单关联 | role_id, menu_id |
| sys_dict | 数据字典 | dict_id, dict_name, dict_type, status, remark |
| sys_dict_item | 字典项 | item_id, dict_id, item_label, item_value, status, order_num |
| file_info | 文件信息 | file_id, original_name, file_size, file_type, bucket_name, object_name |
| sys_audit_log | 审计日志 | log_id, user_id, username, operation, method, params, ip, time |

---

## 通用说明

### 基础URL

```
开发环境: http://localhost:8888
```

### 请求头

| Header | 说明 | 示例 |
|--------|------|------|
| Content-Type | 请求内容类型 | application/json |
| satoken | 认证Token（登录后获取） | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 统一响应格式

```json
{
  "code": 0,        // 状态码：0=成功，500=失败
  "msg": "success", // 提示信息
  "data": {}        // 返回数据
}
```

### 分页响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [],    // 数据列表
    "total": 100,     // 总记录数
    "size": 10,       // 每页大小
    "current": 1,     // 当前页码
    "pages": 10       // 总页数
  }
}
```

### 权限标识说明

| 模块 | 权限标识 | 说明 |
|------|----------|------|
| 用户 | sys:user:list | 查看用户列表 |
| 用户 | sys:user:save | 新增用户 |
| 用户 | sys:user:update | 修改用户 |
| 用户 | sys:user:delete | 删除用户 |
| 角色 | sys:role:list | 查看角色列表 |
| 角色 | sys:role:save | 新增角色 |
| 角色 | sys:role:update | 修改角色 |
| 角色 | sys:role:delete | 删除角色 |
| 菜单 | sys:menu:list | 查看菜单列表 |
| 菜单 | sys:menu:save | 新增菜单 |
| 菜单 | sys:menu:update | 修改菜单 |
| 菜单 | sys:menu:delete | 删除菜单 |
| 字典 | sys:dict:list | 查看字典 |
| 字典 | sys:dict:save | 新增字典 |
| 字典 | sys:dict:update | 修改字典 |
| 字典 | sys:dict:delete | 删除字典 |
| 字典项 | sys:dict:item:list | 查看字典项 |
| 字典项 | sys:dict:item:save | 新增字典项 |
| 字典项 | sys:dict:item:update | 修改字典项 |
| 字典项 | sys:dict:item:delete | 删除字典项 |
| 文件 | oss:file:list | 查看文件列表 |
| 文件 | oss:file:upload | 上传文件 |
| 文件 | oss:file:download | 下载文件 |
| 文件 | oss:file:url | 获取文件链接 |
| 文件 | oss:file:delete | 删除文件 |

---

## 接口列表

### 1. 认证模块 (/auth)

#### 1.1 用户登录

- **URL**: `POST /auth/login`
- **权限**: 无需认证
- **描述**: 用户登录，获取Token

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "userInfo": {
      "userId": 1,
      "userName": "admin",
      "realName": "系统管理员"
    }
  }
}
```

---

#### 1.2 用户退出

- **URL**: `POST /auth/logout`
- **权限**: 需要登录
- **描述**: 用户退出登录，清除Token

**请求参数**: 无

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

### 2. 用户管理 (/sys/user)

#### 2.1 分页查询用户列表

- **URL**: `GET /sys/user/page`
- **权限**: `sys:user:list`
- **描述**: 分页查询用户列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current | number | 否 | 当前页码，默认1 |
| size | number | 否 | 每页大小，默认10 |
| username | string | 否 | 用户名（模糊查询） |
| realName | string | 否 | 真实姓名（模糊查询） |
| status | number | 否 | 状态：0-禁用，1-正常 |

**请求示例:**
```
GET /sys/user/page?current=1&size=10&username=admin
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "userId": 1,
        "username": "admin",
        "realName": "系统管理员",
        "email": "admin@example.com",
        "mobile": "13800138000",
        "status": 1,
        "roleId": 1,
        "roleName": "超级管理员"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

---

#### 2.2 获取当前用户信息

- **URL**: `GET /sys/user/info`
- **权限**: 需要登录
- **描述**: 获取当前登录用户的详细信息

**请求参数**: 无

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "userId": 1,
    "userName": "admin",
    "realName": "系统管理员",
    "email": "admin@example.com",
    "mobile": "13800138000",
    "status": 1,
    "roleId": 1,
    "createTime": "2025-12-02 11:50:46",
    "role": {
      "roleId": 1,
      "roleName": "超级管理员",
      "roleDesc": "拥有系统所有权限"
    }
  }
}
```

---

#### 2.3 新增用户

- **URL**: `POST /sys/user/save`
- **权限**: `sys:user:save`
- **描述**: 新增系统用户

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（唯一） |
| password | string | 是 | 密码 |
| realName | string | 否 | 真实姓名 |
| email | string | 否 | 邮箱 |
| mobile | string | 否 | 手机号 |
| roleId | number | 是 | 角色ID |
| status | number | 否 | 状态：0-禁用，1-正常，默认1 |

**请求示例:**
```json
{
  "username": "zhangsan",
  "password": "123456",
  "realName": "张三",
  "email": "zhangsan@example.com",
  "mobile": "13800138001",
  "roleId": 3,
  "status": 1
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "保存成功"
}
```

---

#### 2.4 修改用户

- **URL**: `POST /sys/user/update`
- **权限**: `sys:user:update`
- **描述**: 修改用户信息

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | 是 | 用户ID |
| username | string | 否 | 用户名 |
| realName | string | 否 | 真实姓名 |
| email | string | 否 | 邮箱 |
| mobile | string | 否 | 手机号 |
| roleId | number | 否 | 角色ID |
| status | number | 否 | 状态 |

**请求示例:**
```json
{
  "userId": 3,
  "realName": "李四改",
  "email": "lisi_new@example.com",
  "status": 1
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "修改成功"
}
```

---

#### 2.5 批量删除用户

- **URL**: `POST /sys/user/delete`
- **权限**: `sys:user:delete`
- **描述**: 批量删除用户

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| - | number[] | 是 | 用户ID数组 |

**请求示例:**
```json
[3, 4, 5]
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "删除成功"
}
```

---

### 3. 角色管理 (/sys/role)

#### 3.1 分页查询角色列表

- **URL**: `GET /sys/role/page`
- **权限**: `sys:role:list`
- **描述**: 分页查询角色列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current | number | 否 | 当前页码，默认1 |
| size | number | 否 | 每页大小，默认10 |
| roleName | string | 否 | 角色名称（模糊查询） |
| status | number | 否 | 状态：0-禁用，1-正常 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "roleId": 1,
        "roleName": "超级管理员",
        "roleDesc": "拥有系统所有权限，最高权限角色",
        "status": 1,
        "createTime": "2025-12-02 11:50:30",
        "menuIds": [1, 2, 3, 4, 5]
      }
    ],
    "total": 3,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

---

#### 3.2 获取所有角色列表

- **URL**: `GET /sys/role/roles`
- **权限**: 需要登录
- **描述**: 获取所有角色列表（用于下拉选择）

**请求参数**: 无

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "roleId": 1,
      "roleName": "超级管理员",
      "roleDesc": "拥有系统所有权限",
      "status": 1
    },
    {
      "roleId": 2,
      "roleName": "系统管理员",
      "roleDesc": "管理系统基础配置和用户",
      "status": 1
    }
  ]
}
```

---

#### 3.3 新增角色

- **URL**: `POST /sys/role/add`
- **权限**: `sys:role:save`
- **描述**: 新增角色并分配菜单权限

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleName | string | 是 | 角色名称 |
| roleDesc | string | 否 | 角色描述 |
| status | number | 否 | 状态：0-禁用，1-正常 |
| menuIds | number[] | 否 | 菜单ID数组 |

**请求示例:**
```json
{
  "roleName": "运营人员",
  "roleDesc": "负责日常运营工作",
  "status": 1,
  "menuIds": [1, 2, 22, 41]
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "新增角色成功"
}
```

---

#### 3.4 修改角色

- **URL**: `POST /sys/role/update`
- **权限**: `sys:role:update`
- **描述**: 修改角色信息及权限

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleId | number | 是 | 角色ID |
| roleName | string | 否 | 角色名称 |
| roleDesc | string | 否 | 角色描述 |
| status | number | 否 | 状态 |
| menuIds | number[] | 否 | 菜单ID数组 |

**请求示例:**
```json
{
  "roleId": 3,
  "roleName": "普通用户改",
  "menuIds": [1, 2, 22]
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "修改角色成功"
}
```

---

#### 3.5 删除角色

- **URL**: `POST /sys/role/delete`
- **权限**: `sys:role:delete`
- **描述**: 删除角色

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 角色ID |

**请求示例:**
```
POST /sys/role/delete?id=9
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "删除角色成功"
}
```

---

### 4. 菜单管理 (/sys/menu)

#### 4.1 获取前端路由

- **URL**: `GET /sys/menu/routes`
- **权限**: 需要登录
- **描述**: 获取当前用户的前端路由配置（用于动态路由）

**请求参数**: 无

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "path": "/sys",
      "element": null,
      "exact": false,
      "protectedRoute": true,
      "children": [
        {
          "path": "/sys/user",
          "element": "UserList",
          "exact": true,
          "protectedRoute": true,
          "children": null
        },
        {
          "path": "/sys/role",
          "element": "RoleList",
          "exact": true,
          "protectedRoute": true,
          "children": null
        }
      ]
    }
  ]
}
```

---

#### 4.2 获取个人菜单列表

- **URL**: `GET /sys/menu/list`
- **权限**: 需要登录
- **描述**: 获取当前用户有权限的菜单列表（树形结构）

**请求参数**: 无

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "menuId": 1,
      "parentId": 0,
      "name": "系统管理",
      "url": "sys",
      "reactComponent": null,
      "perms": null,
      "type": 0,
      "icon": "setting",
      "orderNum": 0,
      "children": [
        {
          "menuId": 2,
          "parentId": 1,
          "name": "用户管理",
          "url": "sys/user",
          "reactComponent": "UserList",
          "perms": "sys:user:list",
          "type": 1,
          "icon": "user",
          "orderNum": 0
        }
      ]
    }
  ]
}
```

---

#### 4.3 获取所有菜单列表

- **URL**: `GET /sys/menu/listAll`
- **权限**: `sys:menu:list`
- **描述**: 获取系统所有菜单列表（菜单管理页面使用）

**请求参数**: 无

**响应格式**: 同上

---

#### 4.4 新增菜单

- **URL**: `POST /sys/menu/add`
- **权限**: `sys:menu:save`
- **描述**: 新增菜单/按钮

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parentId | number | 是 | 父菜单ID，一级菜单为0 |
| name | string | 是 | 菜单名称 |
| url | string | 否 | 菜单URL |
| reactComponent | string | 否 | React组件名 |
| perms | string | 否 | 权限标识 |
| type | number | 是 | 类型：0-目录，1-菜单，2-按钮 |
| icon | string | 否 | 菜单图标 |
| orderNum | number | 否 | 排序 |

**请求示例:**
```json
{
  "parentId": 1,
  "name": "日志管理",
  "url": "sys/log",
  "reactComponent": "LogList",
  "perms": "sys:log:list",
  "type": 1,
  "icon": "file-text",
  "orderNum": 10
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "添加菜单成功"
}
```

---

#### 4.5 修改菜单

- **URL**: `POST /sys/menu/update`
- **权限**: `sys:menu:update`
- **描述**: 修改菜单信息

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| menuId | number | 是 | 菜单ID |
| parentId | number | 否 | 父菜单ID |
| name | string | 否 | 菜单名称 |
| url | string | 否 | 菜单URL |
| reactComponent | string | 否 | React组件名 |
| perms | string | 否 | 权限标识 |
| type | number | 否 | 类型 |
| icon | string | 否 | 图标 |
| orderNum | number | 否 | 排序 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "更新菜单成功"
}
```

---

#### 4.6 删除菜单

- **URL**: `POST /sys/menu/delete/{menuId}`
- **权限**: `sys:menu:delete`
- **描述**: 删除菜单（有子菜单时不允许删除）

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| menuId | number | 是 | 菜单ID |

**请求示例:**
```
POST /sys/menu/delete/20
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "删除菜单成功"
}
```

---

### 5. 数据字典 (/sys/dict)

#### 5.1 分页查询字典列表

- **URL**: `GET /sys/dict/page`
- **权限**: `sys:dict:list`
- **描述**: 分页查询数据字典列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current | number | 否 | 当前页码，默认1 |
| size | number | 否 | 每页大小，默认10 |
| dictName | string | 否 | 字典名称（模糊查询） |
| dictType | string | 否 | 字典类型（模糊查询） |
| status | number | 否 | 状态：0-禁用，1-正常 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "dictId": 1,
        "dictName": "用户状态",
        "dictType": "sys_user_status",
        "status": 1,
        "remark": "用户状态字典"
      }
    ],
    "total": 5,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

---

#### 5.2 查询字典列表（不分页）

- **URL**: `GET /sys/dict/list`
- **权限**: `sys:dict:list`
- **描述**: 查询数据字典列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictName | string | 否 | 字典名称 |
| dictType | string | 否 | 字典类型 |
| status | number | 否 | 状态 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "dictId": 1,
      "dictName": "用户状态",
      "dictType": "sys_user_status",
      "status": 1,
      "remark": "用户状态字典"
    }
  ]
}
```

---

#### 5.3 根据ID获取字典详情

- **URL**: `GET /sys/dict/{dictId}`
- **权限**: `sys:dict:list`
- **描述**: 根据字典ID获取详情

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictId | number | 是 | 字典ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "dictId": 1,
    "dictName": "用户状态",
    "dictType": "sys_user_status",
    "status": 1,
    "remark": "用户状态字典"
  }
}
```

---

#### 5.4 新增字典

- **URL**: `POST /sys/dict`
- **权限**: `sys:dict:save`
- **描述**: 新增数据字典

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictName | string | 是 | 字典名称 |
| dictType | string | 是 | 字典类型（唯一） |
| status | number | 否 | 状态：0-禁用，1-正常 |
| remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "dictName": "性别",
  "dictType": "sys_gender",
  "status": 1,
  "remark": "性别字典"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

#### 5.5 修改字典

- **URL**: `PUT /sys/dict`
- **权限**: `sys:dict:update`
- **描述**: 修改数据字典

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictId | number | 是 | 字典ID |
| dictName | string | 否 | 字典名称 |
| dictType | string | 否 | 字典类型 |
| status | number | 否 | 状态 |
| remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "dictId": 1,
  "dictName": "用户状态改",
  "remark": "更新备注"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

#### 5.6 删除字典

- **URL**: `DELETE /sys/dict/{dictId}`
- **权限**: `sys:dict:delete`
- **描述**: 删除数据字典（同时删除关联的字典项）

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictId | number | 是 | 字典ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

### 6. 字典项管理 (/sys/dict/item)

#### 6.1 分页查询字典项列表

- **URL**: `GET /sys/dict/item/page`
- **权限**: `sys:dict:item:list`
- **描述**: 分页查询字典项列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current | number | 否 | 当前页码，默认1 |
| size | number | 否 | 每页大小，默认10 |
| dictId | number | 否 | 字典ID |
| itemLabel | string | 否 | 字典项标签 |
| status | number | 否 | 状态 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "itemId": 1,
        "dictId": 1,
        "itemLabel": "正常",
        "itemValue": "1",
        "status": 1,
        "orderNum": 0,
        "remark": null
      },
      {
        "itemId": 2,
        "dictId": 1,
        "itemLabel": "禁用",
        "itemValue": "0",
        "status": 1,
        "orderNum": 1,
        "remark": null
      }
    ],
    "total": 2,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

---

#### 6.2 查询字典项列表（不分页）

- **URL**: `GET /sys/dict/item/list`
- **权限**: `sys:dict:item:list`
- **描述**: 查询字典项列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictId | number | 否 | 字典ID |
| itemLabel | string | 否 | 字典项标签 |
| status | number | 否 | 状态 |

---

#### 6.3 根据ID获取字典项详情

- **URL**: `GET /sys/dict/item/{itemId}`
- **权限**: `sys:dict:item:list`
- **描述**: 根据字典项ID获取详情

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | number | 是 | 字典项ID |

---

#### 6.4 根据字典类型获取字典项列表

- **URL**: `GET /sys/dict/item/type/{dictType}`
- **权限**: `sys:dict:item:list`
- **描述**: 根据字典类型获取启用的字典项列表（前端下拉框常用）

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictType | string | 是 | 字典类型 |

**请求示例:**
```
GET /sys/dict/item/type/sys_user_status
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "itemId": 1,
      "dictId": 1,
      "itemLabel": "正常",
      "itemValue": "1",
      "status": 1,
      "orderNum": 0
    },
    {
      "itemId": 2,
      "dictId": 1,
      "itemLabel": "禁用",
      "itemValue": "0",
      "status": 1,
      "orderNum": 1
    }
  ]
}
```

---

#### 6.5 新增字典项

- **URL**: `POST /sys/dict/item`
- **权限**: `sys:dict:item:save`
- **描述**: 新增字典项

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dictId | number | 是 | 字典ID |
| itemLabel | string | 是 | 字典项标签 |
| itemValue | string | 是 | 字典项值 |
| status | number | 否 | 状态：0-禁用，1-正常 |
| orderNum | number | 否 | 显示顺序 |
| remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "dictId": 1,
  "itemLabel": "男",
  "itemValue": "M",
  "status": 1,
  "orderNum": 0
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

#### 6.6 修改字典项

- **URL**: `PUT /sys/dict/item`
- **权限**: `sys:dict:item:update`
- **描述**: 修改字典项

**请求参数 (Body - JSON):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | number | 是 | 字典项ID |
| dictId | number | 否 | 字典ID |
| itemLabel | string | 否 | 字典项标签 |
| itemValue | string | 否 | 字典项值 |
| status | number | 否 | 状态 |
| orderNum | number | 否 | 显示顺序 |
| remark | string | 否 | 备注 |

---

#### 6.7 删除字典项

- **URL**: `DELETE /sys/dict/item/{itemId}`
- **权限**: `sys:dict:item:delete`
- **描述**: 删除字典项

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | number | 是 | 字典项ID |

---

### 7. 文件管理 (/images)

#### 7.1 上传文件

- **URL**: `POST /images/upload`
- **权限**: `oss:file:upload`
- **描述**: 上传文件

**请求参数 (FormData):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 文件对象 |
| serviceModule | string | 否 | 服务模块 |
| businessType | string | 否 | 业务类型 |
| businessId | string | 否 | 业务ID |

**请求示例 (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('serviceModule', 'user');
formData.append('businessType', 'avatar');
formData.append('businessId', '123');

fetch('/images/upload', {
  method: 'POST',
  headers: {
    'satoken': 'your-token'
  },
  body: formData
});
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "fileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "bucketName": "lain-bucket",
    "objectName": "2026/01/12/xxx.png",
    "filePath": "/files/2026/01/12/xxx.png",
    "originalName": "avatar.png",
    "fileSize": 102400,
    "fileType": "image/png"
  }
}
```

---

#### 7.2 下载文件

- **URL**: `GET /images/download/{fileId}`
- **权限**: `oss:file:download`
- **描述**: 根据文件ID下载文件

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileId | string | 是 | 文件ID |

**请求示例:**
```
GET /images/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**响应**: 文件流（直接下载）

---

#### 7.3 获取文件访问链接

- **URL**: `GET /images/url/{fileId}`
- **权限**: `oss:file:url`
- **描述**: 获取文件的访问URL

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileId | string | 是 | 文件ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": "http://localhost:9000/lain-bucket/2026/01/12/xxx.png"
}
```

---

#### 7.4 删除文件

- **URL**: `DELETE /images/{fileId}`
- **权限**: `oss:file:delete`
- **描述**: 删除文件

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileId | string | 是 | 文件ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

---

#### 7.5 查询文件列表

- **URL**: `GET /images/list`
- **权限**: `oss:file:list`
- **描述**: 根据业务信息查询文件列表

**请求参数 (Query):**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| serviceModule | string | 否 | 服务模块 |
| businessType | string | 否 | 业务类型 |
| businessId | string | 否 | 业务ID |

**请求示例:**
```
GET /images/list?serviceModule=user&businessType=avatar&businessId=123
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "fileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "originalName": "avatar.png",
      "fileSize": 102400,
      "fileType": "image/png",
      "bucketName": "lain-bucket",
      "objectName": "2026/01/12/xxx.png",
      "filePath": "/files/2026/01/12/xxx.png",
      "serviceModule": "user",
      "businessType": "avatar",
      "businessId": "123",
      "status": 1,
      "createTime": "2026-01-12 10:30:00"
    }
  ]
}
```

---

## 前端开发建议

### 1. Token 管理

```javascript
// 登录成功后保存 token
localStorage.setItem('satoken', response.data.token);

// 请求拦截器添加 token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('satoken');
  if (token) {
    config.headers['satoken'] = token;
  }
  return config;
});
```

### 2. 权限控制

```javascript
// 根据用户权限控制按钮显示
const hasPermission = (perms) => {
  const userPerms = JSON.parse(localStorage.getItem('permissions') || '[]');
  return userPerms.includes(perms);
};

// 使用示例
{hasPermission('sys:user:save') && <Button>新增用户</Button>}
```

### 3. 动态路由

```javascript
// 登录后获取路由配置
const routes = await fetch('/sys/menu/routes').then(res => res.json());
// 根据 routes.data 动态生成 React Router 配置
```

### 4. 字典数据缓存

```javascript
// 建议将常用字典数据缓存到全局状态
const dictCache = new Map();

const getDictItems = async (dictType) => {
  if (dictCache.has(dictType)) {
    return dictCache.get(dictType);
  }
  const res = await fetch(`/sys/dict/item/type/${dictType}`);
  const items = res.data;
  dictCache.set(dictType, items);
  return items;
};
```

---

## 错误码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 401 | 未登录或Token过期 |
| 403 | 无权限访问 |
| 500 | 服务器内部错误 |

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-07-27 | 初始版本，包含所有核心接口 |
