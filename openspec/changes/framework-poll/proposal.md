## Why

需要一個互動式計分系統，讓路過的使用者能夠快速登記他們使用的前端框架。現有的調查工具通常需要複雜的表單填寫，而本專案提供視覺化、直覺的投票方式，降低參與門檻，同時提供管理員功能進行資料管理與匯出。

## What Changes

- 建立全新的互動式計分板應用程式
- 支援任何使用者新增圓點進行投票
- 提供管理員模式進行版塊管理（新增、編輯、刪除）
- **提供一鍵初始化功能**，讓訪客可快速建立三大框架板塊（React、Vue、Angular）以便測試投點功能
- 使用 IndexedDB 進行本機端資料持久化
- 支援 CSV 格式資料匯出
- 實作軟刪除機制保留歷史資料
- 採用相對座標系統實作圓點自由佈局

## Capabilities

### New Capabilities

- `category-management`: 版塊的新增、編輯、刪除功能，包含標題與顏色設定
- `dot-voting`: 使用者點擊版塊任意位置新增圓點，以相對座標儲存位置
- `admin-mode`: 管理員密鑰驗證與權限控制，區分一般使用者與管理員操作
- `data-persistence`: 使用 IndexedDB 儲存版塊與圓點資料，支援軟刪除機制
- `data-export`: 匯出 CSV 格式資料，包含版塊名稱、項目名稱、建立與刪除時間

### Modified Capabilities

- `admin-mode`: 限制初始化預設框架板塊的按鈕，只在開發模式（`import.meta.env.DEV`）下顯示
- `category-management`: 調整平板與桌機版面——固定 3 欄格子，≤3 筆時格子長方形撐滿高度，≥4 筆時格子改為正方形（依容器寬自動計算）並開啟垂直捲軸

## Impact

- 新增專案：全新的 React + TypeScript 應用程式
- 技術堆疊：
  - React、TypeScript、Vite
  - Tailwind CSS、shadcn/ui
  - Zustand (狀態管理)
  - IndexedDB (資料儲存)
  - date-fns (日期處理)
  - React Compiler (自動效能最佳化)
  - ESLint、Prettier、Husky (程式碼品質與格式化)
- 測試框架：Vitest、React Testing Library
- 環境變數：需要設定 VITE_ADMIN_SECRET
