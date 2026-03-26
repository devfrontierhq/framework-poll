## Context

目前板塊上的點點透過點擊放置，位置隨機分散。管理員需要能一鍵整理，讓點點整齊排列以便統計與展示。

現有架構：
- 點點位置以 `xRatio`/`yRatio`（0~1）儲存在 IndexedDB
- `updateDot()` 每次開獨立 transaction 更新單一點點
- 管理員工具列位於 `App.tsx`，板塊元件為 `CategoryGrid` → `CategoryCard`

## Goals / Non-Goals

**Goals:**

- 管理員快速排列所有板塊的點點
- 按建立時間升序排列，靠左靠上，自動換行
- 動態調整間距使所有點點都能排入容器
- 批次更新在單一 transaction 完成，視覺一致

**Non-Goals:**

- 個別板塊的排列按鈕
- 非管理員使用排列功能
- 自訂排列順序或排列方式

## Decisions

### 讀取板塊容器尺寸：`useImperativeHandle`

在 `CategoryGrid` 上透過 `forwardRef` + `useImperativeHandle` expose `getCardRects(): Map<categoryId, DOMRect>`，`CategoryCard` 以 `forwardRef` 將點點區域（`relative flex-1 p-4` div）的 ref 往上傳。

**為什麼不用 `querySelectorAll`**：在 React 中直接查詢 DOM 是反模式，不利於元件封裝。

**為什麼不把尺寸存進 Zustand**：DOM 尺寸是純 UI 狀態，不屬於應用資料層。

**為什麼不把按鈕移進 `CategoryGrid`**：現有全域管理員操作都在 `App.tsx` header，保持一致。

### 排列演算法：動態網格

```
初始 cols = ceil(sqrt(N))
rows = ceil(N / cols)
若間距 < 12px（一個點的直徑）→ cols++ 直到間距足夠
colSpacing = usableW / (cols - 1)  // usableW = width - 12px
rowSpacing = usableH / (rows - 1)  // usableH = height - 12px
點點中心座標從 DOT_RADIUS_PX (6px) 開始，符合 getBoundedPosition 的 clamp 邊界
```

以純函式 `computeGridLayout(dots, width, height)` 實作，放在 `src/utils/arrangeDotsLayout.ts`，便於單元測試。

**為什麼動態間距而非固定間距**：固定間距在點點多時可能超出容器（xRatio/yRatio > 1），觸發 DB 驗證錯誤。

### 批次更新：單一 IndexedDB transaction

新增 `batchUpdateDots(updates)` 函式，在單一 `readwrite` transaction 中更新所有點點，確保原子性（所有成功或全部失敗），並避免多個 transaction 造成的視覺閃爍。

先於開 transaction 前驗證所有座標，確保不會部分寫入後失敗。

## Risks / Trade-offs

- **callback ref 穩定性** → `setDotAreaRef(categoryId)` 每次 render 都建立新函式，React 會呼叫舊 ref 傳 null 再傳新 element。因為只是 Map.set/delete，冪等無害。
- **overflow-y-auto 容器** → 板塊超過 3 個時有捲動，`getBoundingClientRect()` 回傳的是 viewport 相對座標，寬高不受捲動影響，演算法只需要 width/height，故無問題。
- **`useImperativeHandle` 是 escape hatch** → React 官方建議謹慎使用，但此場景（事件觸發時讀 DOM 尺寸）正是其合理使用情境。
