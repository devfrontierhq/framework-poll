## Why

管理員在使用過程中，板塊上的點點會分散各處，難以一眼看出分布狀況。需要一個快速整理的方式，讓點點自動排列整齊，方便統計與展示。

## What Changes

- 新增全域「排列整齊」按鈕，僅管理員可見，位於管理員工具列
- 按下後將所有板塊的點點按建立時間升序排列，從左上角開始自動換行
- 使用動態間距，確保所有點點都能排入容器內（不超出邊界）
- 排列結果寫入 IndexedDB，所有使用者重新整理後看到相同結果
- 底層新增批次更新 API，在單一 IndexedDB transaction 中完成所有位置更新

## Capabilities

### New Capabilities

- `dot-arrangement`: 管理員快速將所有板塊的點點自動排列為整齊格狀

### Modified Capabilities

- `dot-voting`: 點點新增批次位置更新功能（`batchUpdateDots`）
- `admin-mode`: 管理員工具列新增「排列整齊」按鈕

## Impact

- 新增程式碼：`src/utils/arrangeDotsLayout.ts`
- 修改程式碼：
  - `src/db/dots.ts` — 新增 `batchUpdateDots`
  - `src/store/types.ts` — 新增 `arrangeDots` action type
  - `src/store/slices/dotSlice.ts` — 實作 `arrangeDots`
  - `src/components/CategoryCard.tsx` — 改為 `forwardRef`
  - `src/components/CategoryGrid.tsx` — `forwardRef` + `useImperativeHandle`
  - `src/App.tsx` — 新增按鈕與排列邏輯
