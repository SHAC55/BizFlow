# BizFlow App — UI/UX Improvement Tracker

All 14 improvements scoped and tracked here. Constraint: logo, images, and font colors unchanged.

---

## Status Legend
- ✅ Done
- ⬜ Not started

---

## Items 1–10: Implemented

| # | Item | Effort | Impact | Status |
|---|------|--------|--------|--------|
| 1 | Toast notifications for all mutations | Low | High | ✅ |
| 2 | Confirmation dialogs for delete/archive | Low | High | ✅ |
| 3 | Haptic feedback | Low | High | ✅ |
| 4 | Search debouncing (350ms) | Low | Medium | ✅ |
| 5 | Android ripple effects on all Pressables | Low | Medium | ✅ |
| 6 | FlatList for all main lists (Inventory, Sales, Customers) | Medium | High | ✅ |
| 7 | Skeleton shimmer loading screens | Medium | High | ✅ |
| 8 | Native date picker for reminder date in Add Sale | Medium | High | ✅ |
| 9 | Per-field real-time form validation (Add Customer, Add Inventory) | Medium | Medium | ✅ |
| 10 | Page transition animations (FadeInDown via Reanimated) | Medium | High | ✅ |

### Files changed by items 1–10
- `App.tsx` — Toast mount + ScreenTransition wrapping
- `babel.config.js` — Reanimated plugin
- `src/components/AppLayout.tsx` — ripple on nav items
- `src/components/Skeleton.tsx` — NEW: SkeletonBox, SkeletonProductRow, SkeletonSaleRow, SkeletonCustomerRow
- `src/components/ScreenTransition.tsx` — NEW: FadeInDown wrapper
- `src/hooks/useDebounce.ts` — NEW: 350ms debounce hook
- `src/pages/DashboardPage.tsx` — ripple, haptics, toasts
- `src/pages/InventoryPage.tsx` — FlatList, skeleton, ripple
- `src/pages/SalesPage.tsx` — FlatList, skeleton, ripple
- `src/pages/CustomersPage.tsx` — FlatList, skeleton, ripple, debounce
- `src/pages/AddSalePage.tsx` — native date picker, ripple, haptics, toasts
- `src/pages/AddCustomerPage.tsx` — per-field validation, haptics, toasts
- `src/pages/AddInventoryPage.tsx` — per-field validation, haptics, toasts
- `src/pages/ProductDetailPage.tsx` — confirmation dialog, ripple, haptics, toasts
- `src/pages/CustomerDetailPage.tsx` — confirmation dialog, ripple, haptics, toasts
- `src/pages/SaleDetailPage.tsx` — ripple, haptics, toasts

---

## Items 11–14: Not yet started

| # | Item | Effort | Impact | Status | Notes |
|---|------|--------|--------|--------|-------|
| 11 | React Navigation adoption | High | High | ⬜ | Replace custom `useState` state machine in App.tsx with React Navigation stack. Enables deep linking, back-gesture on iOS, Android hardware back button. |
| 12 | React Query for data fetching | High | High | ⬜ | Replace custom `useEffect`-based hooks (`useSalesData`, `useProductsData`, `useCustomersData`) with `@tanstack/react-query`. Gains background refetch, cache invalidation, stale-while-revalidate, optimistic updates. |
| 13 | Swipe gestures on list items | High | Medium | ⬜ | Swipe-left to delete/archive on customer and product rows. Requires `react-native-gesture-handler` + `react-native-reanimated` (already installed). |
| 14 | Bottom sheet for add forms | High | Medium | ⬜ | Replace full-screen Add Customer / Add Inventory pages with `@gorhom/bottom-sheet` modals. Keeps context visible behind the form. |

---

## Known Issues (pre-existing, not from this work)
- `ProductDetailPage.tsx:130` — passes `headerRight` prop to `AppLayout` which doesn't accept it. Dead prop, causes TS error.
