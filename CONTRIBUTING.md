# 貢獻指南

[English](CONTRIBUTING.en.md)

## 環境設定

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

## 開發流程

本專案採用 **Spectra**，已完成規格放在 `openspec/specs/`，變更提案放在 `openspec/changes/`。

### 流程概要

```
discuss? → propose → apply ⇄ ingest → archive
```

`discuss` 為選用步驟，需求明確時可直接跳到 `propose`。

### 各步驟說明

| 指令               | 時機                     |
| ------------------ | ------------------------ |
| `/spectra:discuss` | 討論需要結構化才能繼續   |
| `/spectra:propose` | 規劃、提案或設計一個變更 |
| `/spectra:apply`   | 任務準備好可以實作       |
| `/spectra:ingest`  | 有進行中的變更需要繼續   |
| `/spectra:ask`     | 詢問規格或系統運作方式   |
| `/spectra:archive` | 實作完成，封存變更       |

## Commit 規範

### 格式

```
<type>(<scope>): <description>
```

### 常用類型

| 類型       | 說明               |
| ---------- | ------------------ |
| `feat`     | 新功能             |
| `fix`      | 修復錯誤           |
| `refactor` | 重構（不影響功能） |
| `docs`     | 文件更新           |
| `test`     | 新增或修改測試     |
| `chore`    | 建置流程或工具異動 |

### pre-commit hook

commit 時會自動觸發 `lint-staged`，對暫存的檔案執行 lint 與格式化。若 hook 失敗，請修正問題後重新 commit（**不要**用 `--no-verify` 跳過）。

## 程式碼風格

### TypeScript

- 啟用 strict 模式
- 使用 `type` 而非 `interface`（除非需要 declaration merging）

### React

- 本專案已啟用 **React Compiler**，**不需要**手動使用 `useCallback` 或 `useMemo`

### 格式化

Prettier 設定已在專案中定義，執行 `pnpm format` 可自動格式化。

## 測試

本專案使用 **Vitest** 搭配 **Testing Library**。

### 測試位置

- 測試檔案放在各目錄的 `__tests__/` 子目錄，命名為 `*.test.ts` 或 `*.test.tsx`
- 例如：`src/hooks/useLongPress.ts` → `src/hooks/__tests__/useLongPress.test.ts`
- 根目錄的 `test/` 放共用測試輔助工具（builders、mock store 等），不是測試本身

### 執行測試

```bash
# 執行所有測試
pnpm test
```

```bash
# 監聽模式（開發時使用）
pnpm test:watch
```

```bash
# 產生測試報告與覆蓋率
pnpm test:report
```

### 手動視覺測試（排列整齊）

在 dev 環境下，`window.__store__` 會暴露 Zustand store，可在 DevTools Console 快速塞入測試資料。

先建立板塊後，在 DevTools Console 執行以下腳本為每個板塊塞入 500 個隨機位置的點點：

```js
const store = window.__store__.getState()
const categories = [...store.categories.values()]
for (const cat of categories) {
  for (let i = 0; i < 500; i++) {
    store.addDot(cat.id, `測試${i}`, Math.random(), Math.random())
  }
}
```

執行後解鎖管理模式，再按「排列整齊」觀察視覺效果。

## 專案結構

```
src/
├── components/   # React 元件（含 ui/ 子目錄）
├── db/           # 資料庫層（client、schema、CRUD）
├── hooks/        # 自訂 React Hooks
├── store/        # Zustand 狀態管理（含 slices/ 子目錄）
├── types/        # TypeScript 型別定義
├── utils/        # 工具函式
├── lib/          # 其他函式庫工具
└── test/         # 測試共用工具（setup.ts）

test/             # 根目錄測試輔助工具
├── builders.ts   # 測試資料工廠（buildCategory、buildDot 等）
└── store.ts      # Mock store 工廠

openspec/
├── specs/        # 系統規格文件
└── changes/      # 進行中的變更提案
```
