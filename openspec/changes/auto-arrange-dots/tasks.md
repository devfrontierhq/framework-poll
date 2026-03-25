## 1. DB 層

- [x] 1.1 在 `src/db/dots.ts` 新增 `DotPositionUpdate` type 與 `batchUpdateDots` 函式，實作批次更新：單一 IndexedDB transaction（批次更新：單一 IndexedDB transaction）、空陣列 no-op、先驗證座標後開 transaction、略過已刪除點點（batch update dot positions）
- [x] 1.2 為 `batchUpdateDots` 補充單元測試：空陣列、成功更新、略過 soft-deleted、無效座標拋錯（batch update rejects invalid coordinates、empty batch is a no-op、batch update skips deleted dots）

## 2. Store 層

- [x] 2.1 在 `src/store/types.ts` 的 `DotActions` 新增 `arrangeDots` action 型別
- [x] 2.2 在 `src/store/slices/dotSlice.ts` 實作 `arrangeDots`：guard `isAdminUnlocked`、呼叫 `batchUpdateDots`、單次 `set` 更新 Zustand state

## 3. 排列演算法

- [ ] 3.1 建立 `src/utils/arrangeDotsLayout.ts`，實作純函式 `computeGridLayout(dots, width, height)`：排列演算法：動態網格，按 `createdAt` 升序排序、grid layout with dynamic spacing
- [ ] 3.2 為 `computeGridLayout` 新增單元測試：0 顆點回傳空陣列、1 顆點落在左上角（single dot arrangement）、N 顆點所有 ratio 在 [0, 1]（dots fill available space）、間距不足時自動增加 cols（dynamic spacing when dots are too dense）、排序正確

## 4. Ref 串接

- [ ] 4.1 將 `CategoryCard` 改為 `forwardRef<HTMLDivElement, CategoryCardProps>`，ref 掛在點點區域 div（`relative flex-1 cursor-pointer p-4`）（讀取板塊容器尺寸：`useImperativeHandle`）
- [ ] 4.2 將 `CategoryGrid` 改為 `forwardRef`，用 callback refs 收集各 `CategoryCard` 的點點區域 ref，並用 `useImperativeHandle` expose `getCardRects(): Map<string, DOMRect>`（讀取板塊容器尺寸：`useImperativeHandle`）

## 5. UI 按鈕與整合

- [ ] 5.1 在 `App.tsx` 新增 `categoryGridRef`、`isArranging` state 與 `handleArrangeDots` handler：讀取所有板塊 DOMRect、呼叫 `computeGridLayout`、呼叫 `arrangeDots` store action（auto-arrange requires admin mode、persist arrangement to database）
- [ ] 5.2 在管理員工具列新增「排列整齊」按鈕（`Grid2X2` icon），`disabled={isArranging}`，點擊觸發 `handleArrangeDots`（admin mode UI state、admin mode shows controls、auto-arrange all dots）
- [ ] 5.3 手動驗證：點擊「整齊排列」後點點整齊排列、reload 後位置保留（positions visible after reload）、各板塊點點數不同時各自正確排列、非管理員看不到按鈕（auto-arrange requires admin mode）
