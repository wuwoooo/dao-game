# 游戏/应用分发平台 - 项目总览

本项目为游戏/应用分发平台，采用前后端完全分离架构，支持嵌入式 H5 游戏分发、CPA/CPM 计费和 SKY 数字货币结算机制。

---

## 项目结构

```
project-root/
├── h5/           # 用户端前端 H5 平台（SPA，基于 Vue 3 + Vite）
│   ├── src/
│   │   ├── pages/         # 页面组件（按模块划分）
│   │   ├── components/    # 公共组件
│   │   ├── api/           # 接口封装
│   │   └── main.ts
│   ├── public/
│   └── vite.config.ts
│
├── admin/           # 后台管理系统（SPA，Vue3 + Element Plus）
│   ├── controller/        # 控制器接口
│   ├── service/           # 业务逻辑层
│   ├── entity/            # 实体类（对应数据库）
│   ├── mapper/            # MyBatis 映射接口
│   └── application.yaml
|
├── api/           # 后台服务（Spring Boot，Java）
│   ├── controller/        # 控制器接口
│   ├── service/           # 业务逻辑层
│   ├── entity/            # 实体类（对应数据库）
│   ├── mapper/            # MyBatis 映射接口
│   └── application.yaml
│
├── docs/                  # 产品设计文档、接口文档等
│   ├── PRD.md
│   └── API.md

```

---

## 技术栈

- 用户端前端：Vue 3 + TypeScript + Vite
- 管理后台前端：Vue 3 + Element Plus + Vite
- 后端：Java 17 + Spring Boot 3 + MyBatis-Plus + Swagger
- 数据库：MySQL 8.x
- 接口通信：RESTful API（Token 鉴权）

---

## 开发规范

### 启动用户端 H5

```bash
cd h5
pnpm install
pnpm dev
```

### 启动后台管理系统

```bash
cd admin
pnpm install
pnpm dev
```

### 后端 API 启动

```bash
cd api
./mvnw spring-boot:run
```

---

## 通信规范

- 所有前端请求统一使用 Bearer Token：
  ```
  Authorization: Bearer <token>
  ```
- 接口返回格式：

```json
{
  "code": 0,
  "msg": "success",
  "data": {...}
}
```

---

## 接口联调规范

1. 所有后端接口以 `/api` 开头。
2. 推荐使用 Swagger 文档访问后端接口示例（默认地址：`/swagger-ui.html`）。
3. 若 token 失效，后端返回 401，前端自动跳转登录页或提示。

---

## 文档说明

- `docs/PRD.md`: 完整的产品需求文档
- `docs/.cursor-rules.md`: 开发规范，供 Cursor 自动生成代码时参考

---
