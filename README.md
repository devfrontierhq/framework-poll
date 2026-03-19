# Framework Poll

[English](README.en.md)

以圓點投票方式收集偏好的本機工具，資料儲存於瀏覽器 IndexedDB，無需後端。

## 功能特色

- **圓點投票**：點擊版塊任意位置新增投票圓點，支援長按顯示詳細資訊
- **版塊管理**：新增、編輯、刪除版塊，可自訂顏色
- **管理員模式**：透過密鑰驗證進入管理模式，支援資料清除等管理操作
- **軟刪除**：刪除的圓點與版塊保留於資料模型，不會永久清除
- **本機儲存**：所有資料存於 IndexedDB，離線可用，無隱私疑慮
- **CSV 匯出**：將投票結果匯出為 CSV 檔案

## 技術堆疊

| 分類 | 工具 |
|------|------|
| 框架 | React 19 + TypeScript |
| 建置工具 | Vite 7 |
| 狀態管理 | Zustand 5 |
| 本機資料庫 | IndexedDB（via idb） |
| 樣式 | Tailwind CSS 4 + shadcn/ui |
| 測試 | Vitest + Testing Library |
| 編譯器 | React Compiler（babel-plugin-react-compiler） |

## 快速開始

```bash
pnpm install
```

```bash
cp .env.example .env
```

```env
VITE_ADMIN_SECRET=your-secret-here
```

```bash
pnpm dev
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `VITE_ADMIN_SECRET` | 管理員模式密鑰 |

## 可用指令

| 指令 | 說明 |
|------|------|
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 型別檢查並編譯正式版本 |
| `pnpm preview` | 預覽正式版本 |
| `pnpm test` | 執行測試（單次） |
| `pnpm test:watch` | 執行測試（監聽模式） |
| `pnpm test:report` | 產生測試報告與覆蓋率 |
| `pnpm lint` | 執行 ESLint 檢查 |
| `pnpm lint:fix` | 自動修正 lint 問題 |
| `pnpm format` | 格式化所有程式碼 |

## 專案結構

```text
src/
  components/     # UI 元件
  hooks/          # 自訂 React hooks
  lib/            # 工具函式與資料庫操作
  store/          # Zustand 狀態管理
  types/          # TypeScript 型別定義
```

## 技術說明

### IndexedDB

資料以 IndexedDB 儲存於使用者的瀏覽器，關閉分頁後資料仍保留。清除瀏覽器資料或使用管理員模式的「清除資料」功能可重置所有紀錄。不同裝置之間的資料不會同步。

### 管理員模式

在介面中輸入正確的 `VITE_ADMIN_SECRET` 密鑰後可進入管理員模式。管理員模式提供：刪除任意圓點、清空所有投票資料、查看詳細統計。密鑰以環境變數注入，不會傳送至任何伺服器。

## 貢獻

詳見 [貢獻指南](CONTRIBUTING.md)。