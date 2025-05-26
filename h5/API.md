# 🎮 游戏/应用分发平台后台服务 API 文档

版本：v1.2  
更新时间：2025-05-08

## 基础信息

- **基础 URL**: `/api`
- **认证方式**: 除明确说明外，所有接口都需要在请求头中携带 `Authorization: Bearer {token}`。

## 通用响应格式

所有接口统一返回以下格式：

```json
{
  "code": 0,         // 状态码，0表示成功，其他表示失败
  "msg": "success",  // 提示信息
  "data": { ... }      // 业务数据，成功时可能为 null 或具体数据对象/列表
}
```

**通用错误码：**

- `400`: 参数校验失败 (msg 会包含具体错误信息)
- `401`: 未授权 (Token 无效或过期)
- `403`: 无权限
- `404`: 资源未找到
- `500`: 服务器内部错误

---

## 🧩 模块目录

1. [认证接口](#%EF%B8%8F-1-%E8%AE%A4%E8%AF%81%E6%8E%A5%E5%8F%A3)
2. [应用上架接口 (所有者)](#%EF%B8%8F-2-%E5%BA%94%E7%94%A8%E4%B8%8A%E6%9E%B6%E6%8E%A5%E5%8F%A3-%E6%89%80%E6%9C%89%E8%80%85)
3. [SKY 代币接口 (所有者)](#-3-sky-%E4%BB%A3%E5%B8%81%E6%8E%A5%E5%8F%A3-%E6%89%80%E6%9C%89%E8%80%85)
4. [数据追踪接口](#-4-%E6%95%B0%E6%8D%AE%E8%BF%BD%E8%B8%AA%E6%8E%A5%E5%8F%A3)
5. [用户信息接口 (第三方)](#-5-%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%8E%A5%E5%8F%A3-%E7%AC%AC%E4%B8%89%E6%96%B9)
6. [后台管理接口 (管理员)](#-6-%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E6%8E%A5%E5%8F%A3-%E7%AE%A1%E7%90%86%E5%91%98)
   - [用户管理](#%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86)
   - [角色管理](#%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86)
   - [权限管理](#%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86)
   - [应用管理](#%E5%BA%94%E7%94%A8%E7%AE%A1%E7%90%86)
   - [所有者管理](#%E6%89%80%E6%9C%89%E8%80%85%E7%AE%A1%E7%90%86)
7. [审核接口 (管理员)](#-7-%E5%AE%A1%E6%A0%B8%E6%8E%A5%E5%8F%A3-%E7%AE%A1%E7%90%86%E5%91%98)
8. [推广管理接口 (管理员)](#-8-%E6%8E%A8%E5%B9%BF%E7%AE%A1%E7%90%86%E6%8E%A5%E5%8F%A3-%E7%AE%A1%E7%90%86%E5%91%98)
9. [财务管理接口 (管理员)](#-9-%E8%B4%A2%E5%8A%A1%E7%AE%A1%E7%90%86%E6%8E%A5%E5%8F%A3-%E7%AE%A1%E7%90%86%E5%91%98)
10. [H5 接口]
11. [抽奖活动接口](#-11-%E6%8A%BD%E5%A5%96%E6%B4%BB%E5%8A%A8%E6%8E%A5%E5%8F%A3)
    - [管理端接口](#%E7%AE%A1%E7%90%86%E7%AB%AF%E6%8E%A5%E5%8F%A3)
    - [用户端接口](#%E7%94%A8%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%8F%A3)

---

## 👤 1. 认证接口

### 所有者登录

- **接口地址**: `POST /v1/auth/login`
- **说明**: 游戏/应用所有者登录接口。
- **请求体** (`application/json`):
  ```json
  {
    "email": "owner@example.com", // 邮箱 (必填, 格式需正确)
    "password": "password123" // 密码 (必填)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "token": "jwt.token.string",
      "owner": {
        "id": 1,
        "name": "示例所有者",
        "email": "owner@example.com",
        "balance": 100.0,
        "createdAt": "2025-05-07 10:00:00",
        "isDeleted": 0
      }
    }
  }
  ```
- **失败响应** (示例: 邮箱或密码错误):
  ```json
  {
    "code": 400,
    "msg": "邮箱或密码错误",
    "data": null
  }
  ```

### 所有者注册

- **接口地址**: `POST /v1/auth/register`
- **说明**: 游戏/应用所有者注册接口。
- **请求体** (`application/json`):
  ```json
  {
    "name": "新所有者", // 名称 (必填, 2-50字符)
    "email": "newowner@example.com", // 邮箱 (必填, 格式需正确, 且未被注册)
    "password": "newpassword123" // 密码 (必填, 6-20字符)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "注册成功",
    "data": "注册成功"
  }
  ```
- **失败响应** (示例: 邮箱已被注册):
  ```json
  {
    "code": 400,
    "msg": "该邮箱已被注册",
    "data": null
  }
  ```

### 管理员登录

- **接口地址**: `POST /v1/auth/admin/login`
- **说明**: 后台管理员登录接口。
- **请求体** (`application/json`):
  ```json
  {
    "username": "admin", // 用户名 (必填)
    "password": "admin123" // 密码 (必填)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "token": "jwt.admin.token.string",
      "admin": {
        "id": 1,
        "username": "admin",
        "realName": "系统管理员",
        "roleId": 1,
        "lastLoginTime": "2025-05-07 10:05:00",
        "status": 1,
        "createdAt": "2025-05-07 09:00:00",
        "updatedAt": "2025-05-07 10:05:00",
        "isDeleted": 0
      }
    }
  }
  ```
- **失败响应** (示例: 用户名或密码错误):
  ```json
  {
    "code": 400,
    "msg": "用户名或密码错误",
    "data": null
  }
  ```

---

## 📦 2. 应用上架接口 (所有者)

**(需要所有者 Token 认证)**

### 提交上架申请

- **接口地址**: `POST /v1/apply/submit`
- **说明**: 开发者提交游戏/应用的上架信息。
- **请求体** (`application/json`):
  ```json
  {
    "name": "开心消消乐 H5", // 应用名称 (必填, 最多100字符)
    "type": "Game", // 类型 (必填, Game/应用)
    "url": "https://game.example.com/xxl", // 链接 (必填, 最多255字符)
    "icon": "https://icon.example.com/xxl.png", // 图标 URL (可选)
    "description": "一款经典的消除类休闲游戏", // 描述 (可选, 最多1000字符)
    "tags": "休闲,消除,益智" // 标签 (可选, 逗号分隔, 最多255字符)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "申请成功",
    "data": "申请成功"
  }
  ```

### 获取开发者的游戏/应用列表

- **接口地址**: `GET /v1/apply/my`
- **说明**: 开发者获取自己提交的游戏/应用列表。
- **请求参数**: 无
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 123,
        "ownerId": 1,
        "name": "开心消消乐 H5",
        "type": "Game",
        "url": "https://game.example.com/xxl",
        "icon": "https://icon.example.com/xxl.png",
        "description": "一款经典的消除类休闲游戏",
        "tags": "休闲,消除,益智",
        "status": "Pending", // Pending, Approved, Rejected
        "visible": 0, // 0 不可见, 1 可见
        "createdAt": "2025-05-07 10:10:00",
        "reviewedAt": null,
        "reviewRemark": null,
        "isDeleted": 0
      }
      // ...更多应用
    ]
  }
  ```

### 获取游戏/应用详情

- **接口地址**: `GET /v1/apply/{id}`
- **说明**: 获取指定 ID 的游戏/应用详情，包含所有者名称。
- **路径参数**:
  - `id`: (Integer) 应用 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 123,
      "ownerId": 1,
      "ownerName": "示例所有者",
      "name": "开心消消乐 H5",
      "type": "Game",
      "url": "https://game.example.com/xxl",
      "icon": "https://icon.example.com/xxl.png",
      "description": "一款经典的消除类休闲游戏",
      "tags": "休闲,消除,益智",
      "status": "Approved",
      "visible": 1,
      "isRecommend": 1,
      "clickCount": 1234,
      "createdAt": "2025-05-07 10:10:00",
      "reviewedAt": "2025-05-07 11:30:00",
      "reviewRemark": "内容合规",
      "isDeleted": 0
    }
  }
  ```
- **失败响应** (示例: 应用不存在):
  ```json
  {
    "code": 404,
    "msg": "应用不存在",
    "data": null
  }
  ```

---

## 💰 3. SKY 代币接口 (所有者)

**(需要所有者 Token 认证)**

### 获取 SKY 代币余额

- **接口地址**: `GET /v1/sky/balance`
- **说明**: 获取当前登录所有者的 SKY 代币余额。
- **请求参数**: 无
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "balance": 100.0
    }
  }
  ```

### 获取充值记录

- **接口地址**: `GET /v1/sky/recharges`
- **说明**: 获取当前登录所有者的 SKY 代币充值记录 (只返回成功的记录)。
- **请求参数**: 无
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "ownerId": 1,
        "amount": 50.0,
        "transactionId": "tx123456",
        "status": 1,
        "timestamp": "2025-05-07 11:00:00",
        "isDeleted": 0
      }
      // ...更多记录
    ]
  }
  ```

### 获取消耗记录

- **接口地址**: `GET /v1/sky/consumptions`
- **说明**: 获取当前登录所有者的 SKY 代币消耗记录。
- **查询参数**:
  - `startDate`: (String) 开始日期 (可选, 格式: yyyy-MM-dd)
  - `endDate`: (String) 结束日期 (可选, 格式: yyyy-MM-dd)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "ownerId": 1,
        "gameappId": 123,
        "costType": "CPA",
        "amount": 0.01,
        "count": 1,
        "date": "2025-05-07",
        "isDeleted": 0
      }
      // ...更多记录
    ]
  }
  ```

### 充值 SKY 代币 (模拟)

- **接口地址**: `POST /v1/sky/recharge`
- **说明**: 模拟为当前登录所有者充值 SKY 代币。
- **查询参数**:
  - `amount`: (BigDecimal) 充值金额 (必填, 需大于 0)
  - `transactionId`: (String) 第三方交易单号 (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "充值成功",
    "data": "充值成功"
  }
  ```

---

## 📊 4. 数据追踪接口

**(此章节已移动，相关接口现在位于 H5 接口部分)**

---

## 🔌 5. 用户信息接口 (第三方)

**(无 Token 认证, 用于第三方平台验证和获取用户信息)**

### 获取用户信息

- **接口地址**: `GET /open/redpacket/my/info`
- **说明**: 第三方平台根据提供的所有者 Token 获取用户基础信息。
- **查询参数**:
  - `uuid`: (String) 用户 (必填)
  - `token`: (String) 所有者登录后获取的 JWT Token (必填)
  - `uid`: (String) 用户 UID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "attachment": {
      "openid": null,
      "uid": "149819",
      "uuid": "56acd6473ba04257958c1d8817204137",
      "openName": "zjh",
      "avatar": null,
      "ref": "9D2A4I9R",
      "channel": null
    },
    "message": null,
    "status": 200
  }
  ```
- **失败响应** (示例: Token 无效或过期):
  ```json
  {
    "attachment": null,
    "status": 9999,
    "message": "token验证失败"
  }
  ```

### 用户登录

- **接口地址**: `POST /user/signin`
- **说明**: 此接口可以让用户通过邮箱和密码来登陆。
- **查询参数**:
  - `uuid`: (String) 用户 (选填)
  - `token`: (String) 所有者登录后获取的 JWT Token (选填)
  - `uid`: (String) 用户 UID (选填)
  - `phone`: (String) 邮箱 (必填)
  - `password`: (String) 密码 (必填)
  - `source`: (String) 来源 1web 2app (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "attachment": {
      "uid": 149911,
      "uuid": "533997066ee2405f838c1a6a0b6d1f1e",
      "token": "VI3cNhrpdpVVnloT9voEDwrFxPC4Jbdz",
      "uname": null,
      "phone": null,
      "email": "4****@qq.com",
      "point": null,
      "isShow": null
    },
    "message": null,
    "status": 200
  }
  ```
- **失败响应** (示例: 用户名或密码错误):
  ```json
  {
    "attachment": null,
    "message": "用戶名或密碼錯誤",
    "status": 405
  }
  ```

---

## 🛠️ 6. 后台管理接口 (管理员)

**(需要管理员 Token 认证)**

### 用户管理

#### 获取管理员用户列表

- **接口地址**: `GET /v1/admin/users`
- **说明**: 分页查询后台管理员用户。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "username": "admin",
          "realName": "系统管理员",
          "roleId": 1,
          "lastLoginTime": "2025-05-07 10:05:00",
          "status": 1,
          "createdAt": "2025-05-07 09:00:00",
          "updatedAt": "2025-05-07 10:05:00",
          "isDeleted": 0
        }
        // ...其他管理员用户
      ],
      "total": 5,
      "size": 10,
      "current": 1,
      "pages": 1
    }
  }
  ```

#### 添加管理员用户

- **接口地址**: `POST /v1/admin/users`
- **说明**: 创建一个新的后台管理员用户。
- **请求体** (`application/json`):
  ```json
  {
    "username": "operator01", // 用户名 (必填, 3-20字符, 且唯一)
    "password": "operator123", // 密码 (必填, 6-20字符)
    "realName": "运维专员", // 姓名 (可选, 最多50字符)
    "roleId": 3, // 角色ID (必填)
    "status": 1 // 状态 (可选, 0禁用, 1启用, 默认1)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "添加成功",
    "data": "添加成功"
  }
  ```
- **失败响应** (示例: 用户名已存在):
  ```json
  {
    "code": 400,
    "msg": "用户名已存在或创建失败",
    "data": null
  }
  ```

#### 更新管理员用户

- **接口地址**: `PUT /v1/admin/users/{id}`
- **说明**: 更新指定 ID 的后台管理员用户信息。
- **路径参数**:
  - `id`: (Integer) 管理员用户 ID (必填)
- **请求体** (`application/json`):
  ```json
  {
    "id": 2, // 用户ID (必填, 需与路径ID一致)
    "password": "newPassword456", // 新密码 (可选, 不为空时更新, 6-20字符)
    "realName": "高级运维专员", // 姓名 (可选, 最多50字符)
    "roleId": 3, // 角色ID (必填)
    "status": 1 // 状态 (可选, 0禁用, 1启用)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "更新成功",
    "data": "更新成功"
  }
  ```
- **失败响应** (示例: 用户不存在):
  ```json
  {
    "code": 404,
    "msg": "用户不存在",
    "data": null
  }
  ```

#### 删除管理员用户

- **接口地址**: `DELETE /v1/admin/users/{id}`
- **说明**: 逻辑删除指定 ID 的后台管理员用户。
- **路径参数**:
  - `id`: (Integer) 管理员用户 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "删除成功",
    "data": "删除成功"
  }
  ```
- **失败响应** (示例: 用户不存在):
  ```json
  {
    "code": 404,
    "msg": "用户不存在或删除失败",
    "data": null
  }
  ```

#### 获取指定用户的权限列表

- **接口地址**: `GET /v1/admin/users/{id}/permissions`
- **说明**: 获取指定管理员用户的权限编码列表。
- **路径参数**:
  - `id`: (Integer) 管理员用户 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      "app_review",
      "data_stats"
      // ...更多权限编码
    ]
  }
  ```

#### 修改当前管理员信息

- **接口地址**: `PUT /v1/admin/me/profile`
- **说明**: 当前登录的管理员修改自己的密码或姓名。
- **请求体** (`application/json`):
  ```json
  {
    "password": "newStrongPassword123", // 新密码 (可选, 6-20字符)
    "realName": "管理员新名称" // 姓名 (可选, 最多50字符)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "个人信息更新成功",
    "data": "个人信息更新成功"
  }
  ```
- **失败响应** (示例: 更新失败):
  ```json
  {
    "code": 500,
    "msg": "个人信息更新失败",
    "data": null
  }
  ```

### 角色管理

#### 获取所有角色列表

- **接口地址**: `GET /v1/admin/roles`
- **说明**: 查询系统中的所有角色。
- **请求参数**: 无
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "super_admin",
        "description": "拥有全部权限",
        "isDeleted": 0
      },
      {
        "id": 2,
        "name": "审核管理员",
        "code": "reviewer",
        "description": "负责管理上架流程，审核游戏/应用上架申请",
        "isDeleted": 0
      }
      // ...其他角色
    ]
  }
  ```

#### 更新角色权限

- **接口地址**: `PUT /v1/admin/roles/{roleId}/permissions`
- **说明**: 更新指定角色的权限关联。
- **路径参数**:
  - `roleId`: (Integer) 角色 ID (必填)
- **请求体** (`application/json`, 权限 ID 列表):
  ```json
  [
    1, // 权限ID: 应用审核
    4 // 权限ID: 数据统计
  ]
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "更新角色权限成功",
    "data": "更新角色权限成功"
  }
  ```

### 权限管理

#### 获取所有权限列表

- **接口地址**: `GET /v1/admin/permissions`
- **说明**: 查询系统中的所有权限。
- **请求参数**: 无
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "name": "应用审核",
        "code": "app_review",
        "description": "审核游戏/应用上架申请",
        "isDeleted": 0
      },
      {
        "id": 2,
        "name": "推广位管理",
        "code": "placement_manage",
        "description": "管理推广位位置和规则",
        "isDeleted": 0
      }
      // ...其他权限
    ]
  }
  ```

### 应用管理

#### 获取所有游戏/应用列表 (Admin)

- **接口地址**: `GET /v1/admin/apps`
- **说明**: 分页查询所有游戏/应用，可按所有者、名称或状态过滤，并支持排序。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `ownerId`: (Integer) 所有者 ID (可选)
  - `name`: (String) 应用名称 (可选, 用于模糊搜索)
  - `status`: (String) 状态 (可选: Pending, Approved, Rejected)
  - `sortField`: (String) 排序字段 (可选: id, name, createdAt, status, 默认 createdAt)
  - `sortOrder`: (String) 排序方向 (可选: asc, desc, 默认 desc)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 123,
          "ownerId": 1,
          "ownerName": "测试所有者1",
          "name": "开心消消乐 H5",
          "type": "Game",
          "url": "https://game.example.com/xxl",
          "icon": "https://icon.example.com/xxl.png",
          "description": "一款经典的消除类休闲游戏",
          "tags": "休闲,消除,益智",
          "status": "Approved",
          "visible": 1,
          "isRecommend": 1,
          "clickCount": 1234,
          "createdAt": "2025-05-07 10:10:00",
          "reviewedAt": "2025-05-07 11:30:00",
          "reviewRemark": "内容合规",
          "isDeleted": 0
        }
        // ...其他应用
      ],
      "total": 50,
      "size": 10,
      "current": 1,
      "pages": 5
    }
  }
  ```

#### 创建游戏/应用 (Admin)

- **接口地址**: `POST /v1/admin/apps`
- **说明**: 管理员为指定的所有者创建新的游戏/应用。
- **请求体** (`application/json`):
  ```json
  {
    "ownerId": 1, // 应用归属的所有者ID (必填)
    "name": "管理员创建的游戏", // 应用名称 (必填, 最多100字符)
    "type": "Game", // 类型 (必填, Game/应用)
    "url": "https://admin-added.example.com/game", // 链接 (必填, 最多255字符)
    "icon": "https://icon.example.com/admin-game.png", // 图标 URL (可选)
    "description": "这是管理员直接添加的游戏", // 描述 (可选, 最多1000字符)
    "tags": "示例,管理员添加", // 标签 (可选, 逗号分隔, 最多255字符)
    "status": "Approved", // 状态 (可选, 默认 Approved)
    "visible": 1, // 可见性 (可选, 默认 1)
    "isRecommend": 0, // 是否推荐 (可选, 默认 0)
    "reviewRemark": "由管理员直接添加并审核通过" // 审核备注 (可选)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "应用创建成功",
    "data": {
      "id": 124, // 新创建应用的ID
      "ownerId": 1,
      "name": "管理员创建的游戏",
      "type": "Game",
      "url": "https://admin-added.example.com/game",
      "icon": "https://icon.example.com/admin-game.png",
      "description": "这是管理员直接添加的游戏",
      "tags": "示例,管理员添加",
      "status": "Approved",
      "visible": 1,
      "isRecommend": 0,
      "clickCount": 0,
      "createdAt": "2025-05-08 12:00:00",
      "reviewedAt": "2025-05-08 12:00:00",
      "reviewRemark": "由管理员直接添加并审核通过",
      "isDeleted": 0
    }
  }
  ```
- **失败响应** (示例: 应用名已存在或参数无效):
  ```json
  {
    "code": 400,
    "msg": "应用创建失败，可能应用名已存在或参数无效",
    "data": null
  }
  ```

#### 更新游戏/应用信息 (Admin)

- **接口地址**: `PUT /v1/admin/apps/{id}`
- **说明**: 管理员更新指定 ID 的游戏/应用信息。
- **路径参数**:
  - `id`: (Integer) 应用 ID (必填)
- **请求体** (`application/json`):
  ```json
  {
    "id": 123, // 应用ID (必填, 需与路径ID一致)
    "name": "开心消消乐HD", // 应用名称 (可选)
    "type": "Game", // 类型 (可选, Game/应用)
    "url": "https://game.example.com/xxl-hd", // 链接 (可选)
    "icon": "https://icon.example.com/xxl-hd.png", // 图标 (可选)
    "description": "经典消除游戏高清版", // 描述 (可选)
    "tags": "休闲,消除,高清", // 标签 (可选)
    "status": "Approved", // 状态 (可选: Pending, Approved, Rejected)
    "visible": 1, // 可见性 (可选: 0或1)
    "isRecommend": 1, // 是否推荐 (可选)
    "reviewRemark": "管理员更新了信息" // 审核备注 (可选)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "应用信息更新成功",
    "data": "应用信息更新成功"
  }
  ```
- **失败响应** (示例: 应用不存在):
  ```json
  {
    "code": 404,
    "msg": "应用不存在或更新失败",
    "data": null
  }
  ```

### 所有者管理

#### 获取所有者列表 (Admin)

- **接口地址**: `GET /v1/admin/owners`
- **说明**: 分页查询所有游戏/应用所有者。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "name": "示例所有者",
          "email": "owner@example.com",
          "balance": 100.0,
          "createdAt": "2025-05-07 10:00:00",
          "isDeleted": 0
        }
        // ...其他所有者
      ],
      "total": 20,
      "size": 10,
      "current": 1,
      "pages": 2
    }
  }
  ```

---

## 🕵️ 7. 审核接口 (管理员)

**(需要管理员 Token 认证)**

### 获取待审核列表

- **接口地址**: `GET /v1/admin/review/pending`
- **说明**: 分页查询待审核的游戏/应用列表，包含所有者名称。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 123,
          "ownerId": 1,
          "ownerName": "测试所有者1",
          "name": "开心消消乐 H5",
          "type": "Game",
          "url": "https://game.example.com/xxl",
          "icon": "https://icon.example.com/xxl.png",
          "description": "一款经典的消除类休闲游戏",
          "tags": "休闲,消除,益智",
          "status": "Pending",
          "visible": 0,
          "isRecommend": 0,
          "clickCount": 10,
          "createdAt": "2025-05-07 10:10:00",
          "reviewedAt": null,
          "reviewRemark": null,
          "isDeleted": 0
        }
        // ...其他待审核应用
      ],
      "total": 15,
      "size": 10,
      "current": 1,
      "pages": 2
    }
  }
  ```

### 审核游戏/应用

- **接口地址**: `POST /v1/admin/review/review`
- **说明**: 管理员审核游戏/应用上架申请。
- **请求体** (`application/json`):
  ```json
  {
    "id": 123, // 应用 ID (必填)
    "status": "Approved", // 审核状态 (必填, Approved 或 Rejected)
    "remark": "内容合规，已通过审核" // 审核备注 (可选, 最多255字符)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "审核成功",
    "data": "审核成功"
  }
  ```
- **失败响应** (示例: 状态不合法):
  ```json
  {
    "code": 400,
    "msg": "审核状态不合法",
    "data": null
  }
  ```

### 切换游戏/应用可见状态

- **接口地址**: `POST /v1/admin/review/toggle`
- **说明**: 管理员强制上下架已通过审核的游戏/应用。
- **查询参数**:
  - `id`: (Integer) 应用 ID (必填)
  - `visible`: (Boolean) 是否可见 (必填, true 或 false)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "上架成功", // 或 "下架成功"
    "data": "上架成功" // 或 "下架成功"
  }
  ```
- **失败响应** (示例: 应用未审核通过):
  ```json
  {
    "code": 500,
    "msg": "操作失败，应用可能不存在或未通过审核",
    "data": null
  }
  ```

---

## 📢 8. 推广管理接口 (管理员)

**(需要管理员 Token 认证)**

### 创建推广预算

- **接口地址**: `POST /v1/admin/promo/budgets`
- **说明**: 为指定的游戏/应用创建推广预算。
- **请求体** (`application/json`):
  ```json
  {
    "gameappId": 123, // 游戏/应用ID (必填)
    "dailyBudget": 50.0, // 每日预算 (必填, >=0)
    "totalBudget": 500.0, // 总预算 (必填, >=0)
    "placements": "首页推荐,分类页广告", // 投放位置标识 (必填)
    "startDate": "2025-06-01", // 开始日期 (必填, >=当前日期)
    "endDate": "2025-06-30" // 结束日期 (必填, >=开始日期)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "创建推广预算成功",
    "data": "创建推广预算成功"
  }
  ```
- **失败响应** (示例: 参数无效):
  ```json
  {
    "code": 400,
    "msg": "创建失败，请检查参数是否有效",
    "data": null
  }
  ```

### 获取推广预算列表

- **接口地址**: `GET /v1/admin/promo/budgets`
- **说明**: 分页查询推广预算列表，可按所有者 ID 过滤。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `ownerId`: (Integer) 所有者 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "ownerId": 1,
          "gameappId": 123,
          "dailyBudget": 50.0,
          "totalBudget": 500.0,
          "placements": "首页推荐,分类页广告",
          "startDate": "2025-06-01",
          "endDate": "2025-06-30",
          "status": 1,
          "isDeleted": 0
        }
      ],
      "total": 10,
      "size": 10,
      "current": 1,
      "pages": 1
    }
  }
  ```

### 获取推广预算详情

- **接口地址**: `GET /v1/admin/promo/budgets/{id}`
- **说明**: 获取指定 ID 的推广预算详情。
- **路径参数**:
  - `id`: (Integer) 预算 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1
    }
  }
  ```
- **失败响应** (示例: 预算不存在):
  ```json
  {
    "code": 404,
    "msg": "推广预算不存在",
    "data": null
  }
  ```

### 更新推广预算

- **接口地址**: `PUT /v1/admin/promo/budgets/{id}`
- **说明**: 更新指定 ID 的推广预算信息。
- **路径参数**:
  - `id`: (Integer) 预算 ID (必填)
- **请求体** (`application/json`):
  ```json
  {
    "id": 1, // 预算ID (必填, 需与路径ID一致)
    "dailyBudget": 60.0, // 每日预算 (可选, >=0)
    "totalBudget": 600.0, // 总预算 (可选, >=0)
    "placements": "首页推荐", // 投放位置 (可选)
    "startDate": "2025-06-02", // 开始日期 (可选, >=当前日期)
    "endDate": "2025-07-01", // 结束日期 (可选, >=开始日期)
    "status": 0 // 状态 (可选, 0暂停, 1运行中)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "更新推广预算成功",
    "data": "更新推广预算成功"
  }
  ```
- **失败响应** (示例: 预算不存在):
  ```json
  {
    "code": 404, // 或 500
    "msg": "更新失败，请检查预算ID是否存在或参数是否有效",
    "data": null
  }
  ```

### 删除推广预算

- **接口地址**: `DELETE /v1/admin/promo/budgets/{id}`
- **说明**: 逻辑删除指定 ID 的推广预算。
- **路径参数**:
  - `id`: (Integer) 预算 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "删除成功",
    "data": "删除成功"
  }
  ```
- **失败响应** (示例: 预算不存在):
  ```json
  {
    "code": 404,
    "msg": "推广预算不存在或删除失败",
    "data": null
  }
  ```

---

## 🧾 9. 财务管理接口 (管理员)

**(需要管理员 Token 认证)**

### 获取充值记录列表 (Admin)

- **接口地址**: `GET /v1/admin/finance/recharges`
- **说明**: 分页查询所有充值记录，可按所有者 ID 过滤。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `ownerId`: (Integer) 所有者 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "ownerId": 1,
          "amount": 50.0,
          "transactionId": "tx123456",
          "status": 1,
          "timestamp": "2025-05-07 11:00:00",
          "isDeleted": 0
        }
      ],
      "total": 30,
      "size": 10,
      "current": 1,
      "pages": 3
    }
  }
  ```

### 获取消耗记录列表 (Admin)

- **接口地址**: `GET /v1/admin/finance/consumptions`
- **说明**: 分页查询所有消耗记录，可按多种条件过滤。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `ownerId`: (Integer) 所有者 ID (可选)
  - `gameappId`: (Integer) 游戏/应用 ID (可选)
  - `costType`: (String) 消费类型 (可选: CPA, CPM)
  - `startDate`: (String) 开始日期 (可选, 格式: yyyy-MM-dd)
  - `endDate`: (String) 结束日期 (可选, 格式: yyyy-MM-dd)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "ownerId": 1,
          "gameappId": 123,
          "costType": "CPA",
          "amount": 0.01,
          "count": 1,
          "date": "2025-05-07",
          "isDeleted": 0
        }
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

## 10. H5 接口

### 获取轮播图列表

- **接口**: `GET /h5/games/banners`
- **描述**: 获取首页轮播图列表
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "示例游戏",
      "type": "Game",
      "description": "这是一个示例游戏",
      "coverImage": "https://example.com/cover.jpg",
      "icon": "https://example.com/icon.png",
      "views": "1.2w",
      "embedUrl": "https://example.com/game",
      "externalUrl": null,
      "ownerName": "开发者名称",
      "tags": "休闲,益智",
      "isRecommend": true,
      "createdAt": "2024-03-20 10:00:00"
    }
  ]
  ```

### 获取热门游戏/应用

- **接口**: `GET /h5/games/hot`
- **描述**: 获取热门游戏/应用列表
- **参数**:
  - `current`: 页码（默认 1）
  - `size`: 每页大小（默认 10）
- **响应**:
  ```json
  {
    "records": [
      {
        "id": 1,
        "name": "示例游戏",
        "type": "Game",
        "description": "这是一个示例游戏",
        "coverImage": "https://example.com/cover.jpg",
        "icon": "https://example.com/icon.png",
        "views": "1.2w",
        "embedUrl": "https://example.com/game",
        "externalUrl": null,
        "ownerName": "开发者名称",
        "tags": "休闲,益智",
        "isRecommend": true,
        "createdAt": "2024-03-20 10:00:00"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
  ```

### 获取首发游戏/应用

- **接口**: `GET /h5/games/new`
- **描述**: 获取最新发布的游戏/应用列表
- **参数**:
  - `current`: 页码（默认 1）
  - `size`: 每页大小（默认 10）
- **响应**: 同热门游戏/应用接口

### 获取推荐游戏/应用

- **接口**: `GET /h5/games/recommend`
- **描述**: 获取推荐游戏/应用列表
- **参数**:
  - `current`: 页码（默认 1）
  - `size`: 每页大小（默认 10）
- **响应**: 同热门游戏/应用接口

### 搜索游戏/应用

- **接口**: `GET /h5/games/search`
- **描述**: 根据关键词搜索游戏/应用
- **参数**:
  - `keyword`: 搜索关键词
  - `current`: 页码（默认 1）
  - `size`: 每页大小（默认 10）
- **响应**: 同热门游戏/应用接口

### 获取游戏/应用详情

- **接口**: `GET /h5/games/{id}`
- **描述**: 根据 ID 获取游戏/应用详细信息
- **参数**:
  - `id`: 游戏/应用 ID
- **响应**:
  ```json
  {
    "id": 1,
    "name": "示例游戏",
    "type": "Game",
    "description": "这是一个示例游戏",
    "coverImage": "https://example.com/cover.jpg",
    "icon": "https://example.com/icon.png",
    "views": "1.2w",
    "embedUrl": "https://example.com/game",
    "externalUrl": null,
    "ownerName": "开发者名称",
    "tags": "休闲,益智",
    "isRecommend": true,
    "createdAt": "2024-03-20 10:00:00"
  }
  ```

### 获取分类游戏/应用

- **接口**: `GET /h5/games/category/{category}`
- **描述**: 根据分类获取游戏/应用列表
- **参数**:
  - `category`: 分类名称
  - `current`: 页码（默认 1）
  - `size`: 每页大小（默认 10）
- **响应**: 同热门游戏/应用接口

### 记录用户点击

- **接口地址**: `POST /h5/track/click`
- **说明**: 记录用户点击游戏/应用的行为。
- **请求体** (`application/json`):
  ```json
  {
    "uid": "user123", // 用户ID (必填)
    "gameappId": 123, // 游戏/应用ID (必填)
    "ip": "192.168.1.100", // 用户IP地址 (可选, 服务端会自动获取)
    "userAgent": "Mozilla/5.0...", // 用户代理信息 (可选, 服务端会自动获取)
    "referer": "https://example.com" // 来源页面 (可选, 服务端会自动获取)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "记录成功",
    "data": "记录成功"
  }
  ```

### 记录用户浏览

- **接口地址**: `POST /h5/track/view`
- **说明**: 记录用户浏览游戏/应用详情的行为。
- **请求体** (`application/json`):
  ```json
  {
    "uid": "user123", // 用户ID (必填)
    "gameappId": 123, // 游戏/应用ID (必填)
    "ip": "192.168.1.100", // 用户IP地址 (可选, 服务端会自动获取)
    "userAgent": "Mozilla/5.0...", // 用户代理信息 (可选, 服务端会自动获取)
    "referer": "https://example.com" // 来源页面 (可选, 服务端会自动获取)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "记录成功",
    "data": "记录成功"
  }
  ```

### 查询用户点击记录

- **接口地址**: `GET /h5/track/clicks`
- **说明**: 分页查询用户点击记录，可按用户 ID 或游戏/应用 ID 过滤。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `uid`: (String) 用户 ID (可选)
  - `gameappId`: (Integer) 游戏/应用 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "uid": "user123",
          "gameappId": 123,
          "clickTime": "2025-05-07 10:30:00",
          "ip": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "referer": "https://example.com",
          "isDeleted": 0,
          "gameappName": "炫酷方块消除",
          "gameappType": "游戏",
          "gameappIcon": "https://example.com/icon.png",
          "ownerName": "开发者名称",
          "gameappDescription": "一款令人上瘾的益智消除游戏，挑战你的最高分！",
          "gameappCoverImage": "https://example.com/cover.jpg",
          "gameappEmbedUrl": "https://example.com/game/123",
          "gameappExternalUrl": "https://example.com/external/123",
          "views": "1.2k"
        }
        // ...更多记录
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

### 查询用户浏览记录

- **接口地址**: `GET /h5/track/views`
- **说明**: 分页查询用户浏览记录，可按用户 ID 或游戏/应用 ID 过滤。
- **查询参数**:
  - `current`: (Integer) 当前页码 (可选, 默认 1)
  - `size`: (Integer) 每页数量 (可选, 默认 10)
  - `uid`: (String) 用户 ID (可选)
  - `gameappId`: (Integer) 游戏/应用 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "uid": "user123",
          "gameappId": 123,
          "viewTime": "2025-05-07 10:30:00",
          "ip": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "referer": "https://example.com",
          "isDeleted": 0,
          "gameappName": "炫酷方块消除",
          "gameappType": "游戏",
          "gameappIcon": "https://example.com/icon.png",
          "ownerName": "开发者名称",
          "gameappDescription": "一款令人上瘾的益智消除游戏，挑战你的最高分！",
          "gameappCoverImage": "https://example.com/cover.jpg",
          "gameappEmbedUrl": "https://example.com/game/123",
          "gameappExternalUrl": "https://example.com/external/123",
          "views": "1.2k"
        }
        // ...更多记录
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

## 🎯 11. 抽奖活动接口

### 管理端接口

**(需要管理员 Token 认证)**

#### 创建抽奖活动

- **接口地址**: `POST /v1/admin/lottery/create`
- **说明**: 创建一个新的抽奖活动。
- **请求体** (`application/json`):
  ```json
  {
    "name": "新年大抽奖", // 活动名称 (必填)
    "sponsor": "某赞助商", // 赞助方 (可选)
    "icon": "https://example.com/lottery-icon.png", // 活动图标路径 (可选)
    "background": "https://example.com/lottery-bg.png", // 活动背景图路径 (可选)
    "description": "参与新年抽奖，赢取精美礼品", // 活动描述 (可选)
    "lotteryType": "wheel", // 抽奖形式 (必填, wheel:大转盘, box:盲盒)
    "startTime": "2025-01-01T00:00:00", // 活动开始时间 (必填)
    "endTime": "2025-01-15T23:59:59", // 活动结束时间 (可选)
    "startNow": false // 是否立即开始 (可选，默认false)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "lotteryId": 1
    }
  }
  ```

#### 获取抽奖活动详情

- **接口地址**: `GET /v1/admin/lottery/{id}`
- **说明**: 获取指定抽奖活动的详细信息。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1,
      "name": "新年大抽奖",
      "sponsor": "某赞助商",
      "icon": "https://example.com/lottery-icon.png",
      "background": "https://example.com/lottery-bg.png",
      "description": "参与新年抽奖，赢取精美礼品",
      "lotteryType": "wheel",
      "startTime": "2025-01-01T00:00:00",
      "endTime": "2025-01-15T23:59:59",
      "status": "draft",
      "createdAt": "2025-05-07T10:00:00",
      "prizes": [
        {
          "id": 1,
          "lotteryId": 1,
          "level": "特等奖",
          "name": "iPhone 15",
          "image": "https://example.com/iphone.png",
          "probability": 0.1,
          "totalQuantity": 1,
          "remainQuantity": 1
        }
        // ... 更多奖项
      ],
      "rule": {
        "id": 1,
        "lotteryId": 1,
        "drawLimit": 3,
        "dailyLimit": 1,
        "additionalInfo": "每人总共3次机会，每天限1次"
      }
    }
  }
  ```

#### 分页查询抽奖活动列表

- **接口地址**: `GET /v1/admin/lottery/list`
- **说明**: 按条件分页查询抽奖活动列表。
- **查询参数**:
  - `current`: (Integer) 当前页码，默认 1
  - `size`: (Integer) 每页数量，默认 10
  - `name`: (String) 活动名称，模糊查询 (可选)
  - `status`: (String) 状态过滤 (可选，draft/published/ended)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "name": "新年大抽奖",
          "sponsor": "某赞助商",
          "icon": "https://example.com/lottery-icon.png",
          "lotteryType": "wheel",
          "startTime": "2025-01-01T00:00:00",
          "endTime": "2025-01-15T23:59:59",
          "status": "draft",
          "createdAt": "2025-05-07T10:00:00"
          // 省略部分字段
        }
        // ... 更多活动
      ],
      "total": 50,
      "size": 10,
      "current": 1,
      "pages": 5
    }
  }
  ```

#### 更新抽奖活动状态

- **接口地址**: `PUT /v1/admin/lottery/{id}/status`
- **说明**: 更新指定抽奖活动的状态。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
- **查询参数**:
  - `status`: (String) 新状态 (必填，draft/published/ended)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "更新成功"
  }
  ```

#### 删除抽奖活动

- **接口地址**: `DELETE /v1/admin/lottery/{id}`
- **说明**: 删除指定抽奖活动。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "删除成功"
  }
  ```

#### 添加奖项

- **接口地址**: `POST /v1/admin/lottery/prize/add`
- **说明**: 为指定抽奖活动添加奖项。
- **请求体** (`application/json`):
  ```json
  {
    "lotteryId": 1, // 抽奖活动ID (必填)
    "level": "特等奖", // 奖项等级 (必填)
    "name": "iPhone 15", // 奖品名称 (必填)
    "image": "https://example.com/iphone.png", // 奖品图片路径 (可选)
    "probability": 0.1, // 中奖概率，百分比 (必填，0.01-100)
    "totalQuantity": 1 // 奖品总数量 (可选，为空表示不限)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "prizeId": 1,
      "probabilityValid": true // 概率之和是否有效
    }
  }
  ```

#### 获取奖项列表

- **接口地址**: `GET /v1/admin/lottery/{id}/prizes`
- **说明**: 获取指定抽奖活动的奖项列表。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "lotteryId": 1,
        "level": "特等奖",
        "name": "iPhone 15",
        "image": "https://example.com/iphone.png",
        "probability": 0.1,
        "totalQuantity": 1,
        "remainQuantity": 1
      }
      // ... 更多奖项
    ]
  }
  ```

#### 删除奖项

- **接口地址**: `DELETE /v1/admin/lottery/prize/{id}`
- **说明**: 删除指定奖项。
- **路径参数**:
  - `id`: (Integer) 奖项 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "删除成功"
  }
  ```

#### 更新奖项信息

- **接口地址**: `PUT /v1/admin/lottery/prize/update`
- **说明**: 更新指定奖项的信息。如果奖项已有人中奖，则仅允许更新奖项名称、等级和图片，不允许更新概率和数量。
- **请求体** (`application/json`):
  ```json
  {
    "id": 1, // 奖项ID (必填)
    "level": "特等奖", // 奖项等级 (可选)
    "name": "iPhone 15 Pro", // 奖品名称 (可选)
    "image": "https://example.com/iphone15pro.png", // 奖品图片路径 (可选)
    "probability": 0.05, // 中奖概率，百分比 (可选，0.01-100)
    "totalQuantity": 2 // 奖品总数量 (可选)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "success": true,
      "probabilityValid": true // 更新后的概率总和是否有效
    }
  }
  ```

#### 更新抽奖规则

- **接口地址**: `PUT /v1/admin/lottery/rule/update`
- **说明**: 更新指定抽奖活动的规则。
- **请求体** (`application/json`):
  ```json
  {
    "lotteryId": 1, // 抽奖活动ID (必填)
    "drawLimit": 3, // 每人抽奖次数限制 (必填，至少1次)
    "dailyLimit": 1, // 每人每日限制次数 (可选，为空表示无限制)
    "additionalInfo": "每人总共3次机会，每天限1次" // 附加说明或参与条件 (可选)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "更新成功"
  }
  ```

#### 获取抽奖规则

- **接口地址**: `GET /v1/admin/lottery/{id}/rule`
- **说明**: 获取指定抽奖活动的规则。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1,
      "lotteryId": 1,
      "drawLimit": 3,
      "dailyLimit": 1,
      "additionalInfo": "每人总共3次机会，每天限1次"
    }
  }
  ```

#### 分页查询中奖记录

- **接口地址**: `GET /v1/admin/lottery/winners`
- **说明**: 按条件分页查询中奖记录。
- **查询参数**:
  - `current`: (Integer) 当前页码，默认 1
  - `size`: (Integer) 每页数量，默认 10
  - `lotteryId`: (Integer) 抽奖活动 ID (可选)
  - `uid`: (String) 用户 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "lotteryId": 1,
          "lotteryName": "新年大抽奖",
          "prizeId": 1,
          "prizeName": "iPhone 15",
          "prizeLevel": "特等奖",
          "uid": "user123",
          "winTime": "2025-01-01T12:30:45",
          "status": "unclaimed",
          "claimTime": null
        }
        // ... 更多记录
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

#### 更新中奖记录状态

- **接口地址**: `PUT /v1/admin/lottery/winner/{id}/status`
- **说明**: 更新指定中奖记录的状态。
- **路径参数**:
  - `id`: (Integer) 中奖记录 ID (必填)
- **查询参数**:
  - `status`: (String) 新状态 (必填，unclaimed/claimed/sent)
  - `contactInfo`: (String) 联系信息 (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "更新成功"
  }
  ```

### H5 临时认证

#### 获取临时 token

- **接口地址**: `POST /h5/auth/temp-token`
- **说明**: 获取用于 H5 的临时访问 token，有效期较短，仅用于基础操作，无需登录。
- **查询参数**:
  - `deviceId`: (String) 设备 ID，可以是随机生成的唯一标识符 (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "临时token字符串"
  }
  ```
- **使用说明**:
  - 临时 token 有效期默认为 1 小时
  - 临时 token 可以用于查看活动、参与抽奖等基础操作
  - 敏感操作（如领奖）仍需完整认证
  - 在请求头中携带 `Authorization: Bearer {临时token}`

### 用户端接口

#### 获取活动列表

- **接口地址**: `GET /v1/lottery/active`
- **说明**: 获取所有正在进行中的抽奖活动。
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "name": "新年大抽奖",
        "sponsor": "某赞助商",
        "icon": "https://example.com/lottery-icon.png",
        "background": "https://example.com/lottery-bg.png",
        "description": "参与新年抽奖，赢取精美礼品",
        "lotteryType": "wheel",
        "startTime": "2025-01-01T00:00:00",
        "endTime": "2025-01-15T23:59:59",
        "status": "published",
        "createdAt": "2025-05-07T10:00:00"
      }
      // ... 更多活动
    ]
  }
  ```

#### 获取活动详情

- **接口地址**: `GET /v1/lottery/{id}`
- **说明**: 获取指定抽奖活动的详细信息。
- **路径参数**:
  - `id`: (Integer) 抽奖活动 ID (必填)
  - `uid`: "user123" // 用户 ID (选填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1,
      "name": "新年大抽奖",
      "sponsor": "某赞助商",
      "icon": "https://example.com/lottery-icon.png",
      "background": "https://example.com/lottery-bg.png",
      "description": "参与新年抽奖，赢取精美礼品",
      "lotteryType": "wheel",
      "startTime": "2025-01-01T00:00:00",
      "endTime": "2025-01-15T23:59:59",
      "status": "published",
      "prizes": [
        {
          "id": 1,
          "lotteryId": 1,
          "level": "特等奖",
          "name": "iPhone 15",
          "image": "https://example.com/iphone.png",
          "probability": 0.1
        }
        // ... 更多奖项
      ],
      "rule": {
        "drawLimit": 3,
        "dailyLimit": 1,
        "additionalInfo": "每人总共3次机会，每天限1次"
      },
      "remainingDraws": 0, //此用户的总剩余次数，传入uid后返回此字段
      "remainingDrawsToday": 0 //此用户的当他剩余次数，传入uid后返回此字段
    }
  }
  ```

#### 参与抽奖

- **接口地址**: `POST /v1/lottery/participate`
- **说明**: 用户参与指定抽奖活动。
- **请求体** (`application/json`):
  ```json
  {
    "lotteryId": 1, // 抽奖活动ID (必填)
    "uid": "user123" // 用户ID (必填)
  }
  ```
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "win": true, // 是否中奖
      "prize": {
        // 中奖奖项信息，未中奖为null
        "id": 1,
        "lotteryId": 1,
        "level": "特等奖",
        "name": "iPhone 15",
        "image": "https://example.com/iphone.png",
        "probability": 0.1
      },
      "winnerId": 1, // 中奖记录ID，未中奖为null
      "remainingDraws": 2, // 剩余抽奖次数
      "remainingDrawsToday": 0 // 今日剩余抽奖次数
    }
  }
  ```

#### 获取用户中奖记录

- **接口地址**: `GET /v1/lottery/user/{uid}/wins`
- **说明**: 获取指定用户的所有中奖记录。
- **路径参数**:
  - `uid`: (String) 用户 ID (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": [
      {
        "id": 1,
        "lotteryId": 1,
        "lotteryName": "新年大抽奖",
        "prizeId": 1,
        "prizeName": "iPhone 15",
        "prizeLevel": "特等奖",
        "uid": "user123",
        "winTime": "2025-01-01T12:30:45",
        "status": "unclaimed",
        "claimTime": null
      }
      // ... 更多记录
    ]
  }
  ```

#### 获取用户参与抽奖记录

- **接口地址**: `GET /v1/lottery/user/{uid}/participations`
- **说明**: 获取指定用户的抽奖参与记录。
- **路径参数**:
  - `uid`: (String) 用户 ID (必填)
- **查询参数**:
  - `current`: (Integer) 当前页码，默认 1
  - `size`: (Integer) 每页数量，默认 10
  - `lotteryId`: (Integer) 抽奖活动 ID (可选)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "records": [
        {
          "id": 1,
          "lotteryId": 1,
          "lotteryName": "新年大抽奖",
          "lotteryType": "wheel",
          "uid": "user123",
          "participateTime": "2025-01-01T12:30:00",
          "isWin": true,
          "prizeId": 1,
          "prizeName": "iPhone 15",
          "prizeLevel": "特等奖",
          "ip": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        }
        // ... 更多记录
      ],
      "total": 20,
      "size": 10,
      "current": 1,
      "pages": 2
    }
  }
  ```

#### 更新中奖联系信息

- **接口地址**: `PUT /v1/lottery/winner/{id}/claim`
- **说明**: 用户提交领奖联系信息。
- **路径参数**:
  - `id`: (Integer) 中奖记录 ID (必填)
- **查询参数**:
  - `contactInfo`: (String) 联系信息 (必填)
- **成功响应** (`200 OK`):
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": "提交成功"
  }
  ```
