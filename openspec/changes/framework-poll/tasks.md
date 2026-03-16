## 1. 專案初始化與基礎設定

- [x] 1.1 使用 Vite 建立 React TypeScript 專案
- [x] 1.2 安裝 Tailwind CSS 並設定配置檔
- [x] 1.3 安裝 shadcn/ui 元件庫
- [x] 1.4 安裝 Zustand 狀態管理函式庫
- [x] 1.5 安裝 date-fns 日期處理函式庫
- [x] 1.6 建立 .env 檔案並設定 VITE_ADMIN_SECRET 環境變數
- [x] 1.7 安裝並設定 ESLint、Prettier 與 Husky（TypeScript + React 規則 + pre-commit hooks）
- [x] 1.8 安裝 Vitest 與 React Testing Library
- [x] 1.9 安裝 React Compiler 與 vite-plugin-babel 實作自動效能最佳化

## 2. 型別定義與工具函式

- [x] 2.1 建立 types/dotBoard.ts 定義 Category data model 與 Dot data model、CsvRow 型別
- [x] 2.2 建立 utils/id.ts 實作 createId 函式產生唯一 ID
- [x] 2.3 建立 utils/env.ts 實作 password storage：讀取 VITE_ADMIN_SECRET 的函式
- [x] 2.4 建立 utils/csv.ts 實作 date formatting：CSV 日期格式化函式（使用 date-fns date formatting library）
- [x] 2.5 在 utils/csv.ts 實作 buildCsvRows 函式建立 CSV 資料，確保 dot name in export 與 category name resolution
- [x] 2.6 在 utils/csv.ts 實作 downloadCsv 函式下載 UTF-8 with BOM 編碼的 CSV file format，確保 no data loss
- [x] 2.7 建立 test/builders.ts 實作測試資料工廠函式

## 3. IndexedDB 資料持久化

- [x] 3.1 建立 db/indexedDb.ts store data in IndexedDB：初始化資料庫 "framework-poll-db" 實作 database structure
- [x] 3.2 建立 categories store 並加入 deletedAt 索引
- [x] 3.3 建立 dots store 並加入 categoryId、deletedAt 索引
- [x] 3.4 建立 dots store 的 [categoryId, isDeleted] 複合索引用於 query optimization
- [x] 3.5 實作 Category CRUD 函式（create category, read, update, soft delete implementation）實作 timestamp format with ISO strings
- [x] 3.6 實作 Dot CRUD 函式（create, read, update, soft delete implementation）store dot position with xRatio/yRatio
- [x] 3.7 實作 cascade delete：刪除 category 時連動軟刪除所有 dots
- [x] 3.8 實作查詢函式：使用 IndexedDB 複合索引查詢特定 category 的未刪除 dots 實作 immediate persistence

## 4. Zustand 狀態管理

- [x] 4.1 建立 store/dotBoardStore.ts 使用 Zustand 作為狀態管理定義 categories 與 dots 狀態，實作資料模型正規化
- [x] 4.2 實作 isAdminUnlocked 狀態實作 admin mode UI state
- [x] 4.3 實作 loadData action 從 IndexedDB 載入資料
- [x] 4.4 實作 unlockAdmin action 實作 admin password verification
- [x] 4.5 實作 lockAdmin action 鎖定管理員模式
- [x] 4.6 實作 addCategory action create category（儲存至 IndexedDB）
- [x] 4.7 實作 updateCategory action edit category 更新版塊標題與顏色實作 store category color
- [x] 4.8 實作 softDeleteCategory action delete category 軟刪除版塊與連動刪除 dots
- [x] 4.9 實作 addDot action add dot by clicking（計算 xRatio/yRatio 並儲存）
- [x] 4.10 實作 softDeleteDot action delete dot 軟刪除圓點
- [x] 4.11 實作 exportCsv action export to CSV 匯出 CSV 檔案實作 export all dots 與 include all records

## 5. 核心邏輯測試

- [x] 5.1 測試 CSV date formatting：日期格式化函式（formatCsvDateTime）
- [x] 5.2 測試 buildCsvRows 函式產生正確的 CSV 資料
- [x] 5.3 測試軟刪除機制 soft delete implementation 規則：deletedAt 為 null 時顯示，否則過濾
- [x] 5.4 測試 category cascade delete：刪除連動軟刪除所有 dots
- [x] 5.5 測試計數規則 update category count：只計算 deletedAt === null 的 dots
- [x] 5.6 測試管理員密鑰策略 admin password verification 邏輯
- [x] 5.7 測試相對座標系統 store dot position 計算：xRatio = x / width, yRatio = y / height

## 6. UI 骨架元件

- [x] 6.1 建立 App.tsx 主元件並初始化 Zustand store 使用 IndexedDB
- [x] 6.2 建立 EmptyState.tsx 顯示無版塊時的空狀態
- [x] 6.3 建立 CategoryGrid.tsx 實作 display categories 響應式 Grid 佈局（桌機和平板 3 欄固定寬度並支援水平捲動、手機 1 欄）
- [x] 6.4 建立 CategoryCard.tsx 顯示版塊標題、顏色、apply category color、dot 計數
- [x] 6.5 在 CategoryCard 實作顯示未刪除 dots 的功能實作 no duplicate name validation
- [x] 6.6 實作 handle dot overlap：dots 的半透明（opacity: 0.8）與邊框樣式處理圓點重疊時辨識度降低
- [x] 6.7 實作 display dot information：hover dot 時顯示名稱的功能

## 7. 初始化功能（解決測試冷啟動問題）

- [x] 7.1 在 dotBoardStore 新增 initializeDefaultCategories action，作為 empty state bootstrap 例外建立預設板塊
- [x] 7.2 實作 initializeDefaultCategories action 建立三大框架板塊（React #61dafb、Vue #42b883、Angular #dd0031）
- [x] 7.3 在 EmptyState.tsx 加入「建立預設框架板塊」按鈕（只在 categories.size === 0 時顯示）
- [x] 7.4 測試初始化功能：點擊按鈕後建立三個預設板塊，且不解鎖 admin mode、也不開放一般 category CRUD

## 8. 投點流程

- [x] 8.1 在 CategoryCard 實作點擊事件取得相對座標
- [x] 8.2 建立 AddDotDialog.tsx 元件顯示輸入名稱對話框
- [x] 8.3 實作 AddDotDialog 呼叫 addDot action 儲存 xRatio/yRatio
- [x] 8.4 實作非管理員使用者也能新增 dot 的功能
- [x] 8.5 實作 dot 使用 category 顏色的渲染邏輯
- [x] 8.6 實作 category dot count 自動更新功能

## 9. 管理員模式

- [x] 9.1 建立 AdminUnlockDialog.tsx 實作管理員密鑰策略 admin password verification：密鑰輸入與驗證
- [x] 9.2 實作解鎖後顯示管理功能按鈕實作 admin mode UI state（新增 category、編輯、刪除）
- [x] 9.3 建立 AddCategoryDialog.tsx 實作 create category 新增版塊功能
- [x] 9.4 實作 AddCategoryDialog 使用原生 input[type="color"] 選擇顏色實作 store category color
- [x] 9.5 建立 EditCategoryDialog.tsx 實作 edit category 編輯版塊標題與顏色
- [x] 9.6 實作 edit operations without password：編輯操作無需再次輸入密鑰的邏輯
- [ ] 9.7 建立 DeleteCategoryDialog.tsx 實作 delete category 與 delete operations require password：刪除版塊需要密鑰確認
- [ ] 9.8 建立 DeleteDotDialog.tsx 實作 delete dot 與 delete operations require password：刪除圓點需要密鑰確認
- [ ] 9.9 實作 non-admin user permissions：非管理員模式隱藏管理功能按鈕

## 10. 資料匯出

- [ ] 10.1 建立 ExportCsvButton.tsx 元件
- [ ] 10.2 實作點擊按鈕呼叫 exportCsv action
- [ ] 10.3 實作 CSV 包含所有記錄（active 與 deleted）
- [ ] 10.4 實作 CSV 欄位：版塊名稱、項目名稱、建立日期、刪除日期
- [ ] 10.5 實作日期格式化為 yyyy-MM-dd HH:mm（使用 date-fns）
- [ ] 10.6 實作未刪除資料的刪除日期欄位輸出空字串
- [ ] 10.7 實作 CSV 使用 UTF-8 with BOM 編碼防止中文亂碼

## 11. 測試與收尾

- [ ] 11.1 測試 store actions 的單元測試
- [ ] 11.2 測試管理員模式開關的 UI 互動
- [ ] 11.3 測試權限控制：非管理員無法看到管理功能
- [ ] 11.4 測試響應式佈局在不同螢幕尺寸的表現
- [ ] 11.5 測試空狀態顯示與引導文字
- [ ] 11.6 測試錯誤提示（例如密鑰錯誤）
- [ ] 11.7 驗證所有 spec 需求都已實作完成
