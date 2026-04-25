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

## Items 11–14: In progress / pending

| # | Item | Effort | Impact | Status | Notes |
|---|------|--------|--------|--------|-------|
| 11 | React Navigation adoption | High | High | ✅ | Replaced custom `useState` router in `App.tsx` with a native stack. Added deep-link paths plus native iOS back gesture and Android hardware back support. |
| 12 | React Query for data fetching | High | High | ✅ | Replaced manual list/dashboard hooks with `@tanstack/react-query`, added shared query keys, QueryClient provider, and cache invalidation after product/customer/sale mutations. |
| 13 | Swipe gestures on list items | High | Medium | ✅ | Added swipe-left actions on customer and product rows. Customers can be archived from the list and products can be deleted from the list with confirmation + invalidation. |
| 14 | Bottom sheet for add forms | High | Medium | ✅ | Replaced full-screen Add Customer / Add Inventory flows with `@gorhom/bottom-sheet` modal sheets layered over the current screen. Add Sale remains full-screen. |

### Files changed by item 11
- `App.tsx` — NavigationContainer + native stack screens, deep-link config, route reset helpers
- `package.json` / `package-lock.json` — added React Navigation stack dependencies
- `src/types/navigation.ts` — replaced local screen-state union with `RootStackParamList`

### Files changed by item 12
- `App.tsx` — `QueryClientProvider` wiring
- `package.json` / `package-lock.json` — added `@tanstack/react-query`
- `src/lib/query.ts` — NEW: QueryClient + query key definitions
- `src/hooks/useDashboardData.ts` — migrated to `useQuery`
- `src/hooks/useSalesData.ts` — migrated to `useQuery`
- `src/hooks/useProductsData.ts` — migrated to `useQuery` and `useMutation`
- `src/hooks/useCustomersData.ts` — migrated to `useQuery`
- `src/providers/AuthProvider.tsx` — clears React Query cache on session changes
- `src/pages/AddInventoryPage.tsx` — invalidates product/dashboard caches after create/update
- `src/pages/AddCustomerPage.tsx` — invalidates customer/dashboard/sales caches after create/update
- `src/pages/AddSalePage.tsx` — invalidates sales/customer/product/dashboard caches after create
- `src/pages/ProductDetailPage.tsx` — invalidates product/dashboard caches after stock update/delete
- `src/pages/CustomerDetailPage.tsx` — invalidates customer/dashboard/sales caches after archive
- `src/pages/SaleDetailPage.tsx` — invalidates sales/customer/dashboard caches after payment

### Files changed by item 13
- `App.tsx` — wraps the app in `GestureHandlerRootView`
- `src/pages/CustomersPage.tsx` — swipe-left archive action for customer rows
- `src/pages/InventoryPage.tsx` — swipe-left delete action for product rows

### Files changed by item 14
- `App.tsx` — `BottomSheetModalProvider` + transparent modal presentation for add/edit customer and inventory routes
- `package.json` / `package-lock.json` — added `@gorhom/bottom-sheet`
- `src/components/FormBottomSheet.tsx` — NEW: reusable sheet wrapper with backdrop, close button and pan-down dismiss
- `src/pages/AddCustomerPage.tsx` — supports sheet presentation for create/edit customer
- `src/pages/AddInventoryPage.tsx` — supports sheet presentation for create/edit inventory

---

## Known Issues (pre-existing, not from this work)
- None currently tracked from items 1–14.
