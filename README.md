# Node-RED 多實例管理系統

一個用於管理多個 Node-RED 實例的網頁應用程式，提供簡單直觀的介面來建立、管理和監控多個 Node-RED 實例。

![](./public/CleanShot%202025-02-07%20at%2001.38.30.png)
![](./public/CleanShot%202025-02-07%20at%2001.38.38.png)

## 功能特色

- 🚀 快速建立和管理多個 Node-RED 實例
- 📊 即時監控實例狀態
- 📝 查看實例日誌
- 🔄 啟動/停止實例操作
- 💻 直接開啟實例介面
- 🐳 基於 Docker 容器化管理

## 系統需求

- Node.js >= 16
- Docker >= 20.10
- npm >= 8.0

## 安裝說明

1. 複製專案

```bash
git clone https://github.com/yourusername/node-red-multi-instance.git
cd node-red-multi-instance
```

2. 安裝後端依賴

```bash
cd backend
npm install
```

3. 安裝前端依賴
```bash
cd ../frontend
npm install
```

## 開發模式運行

1. 啟動後端服務
```bash
cd backend
npm run dev
```

2. 啟動前端開發伺服器
```bash
cd frontend
npm run dev
```

## 使用 Docker Compose 部署

1. 建立並啟動服務
```bash
docker-compose up -d
```

2. 訪問管理介面
```
http://localhost:8080
```

## 專案結構

```
node-red-workspace/
├── backend/                 # 後端程式碼
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 服務層
│   │   ├── routes/         # 路由定義
│   │   └── app.js         # 主程式入口
│   ├── package.json
│   └── Dockerfile
├── frontend/               # 前端程式碼
│   ├── src/
│   │   ├── components/    # Vue 元件
│   │   ├── views/         # 頁面視圖
│   │   ├── stores/        # Pinia 狀態管理
│   │   └── services/      # 服務
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml     # Docker 編排配置
```

## 技術堆疊

### 後端
- Express.js - Web 框架
- Dockerode - Docker API 操作

### 前端
- Vue 3 - 前端框架
- Vuetify 3 - UI 元件庫
- Pinia - 狀態管理
- Vite - 建構工具

## API 文件

### 實例管理
- `GET /api/instances` - 取得所有實例
- `POST /api/instances` - 建立新實例
- `GET /api/instances/:id` - 取得特定實例資訊
- `POST /api/instances/:id/start` - 啟動實例
- `POST /api/instances/:id/stop` - 停止實例
- `DELETE /api/instances/:id` - 刪除實例
- `GET /api/instances/:id/logs` - 取得實例日誌

## 環境變數

### 後端
- `PORT` - 服務埠號（預設：3000）
- `NODE_ENV` - 執行環境

### 前端
- `VITE_API_URL` - API Endpoint

## 打包部署

1. 前端打包
```bash
cd frontend
npm run build
```

2. 建立 Docker 映像檔
```bash
docker-compose build
```

3. 部署服務
```bash
docker-compose up -d
```
