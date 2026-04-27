# BizFlow App — UI/UX Improvement Tracker

All improvements scoped and tracked here. Constraint: logo, images, and font colors unchanged.

---

## Status Legend
- ✅ Done
- ⬜ Not started
- 🔄 In progress

---

## Items 1–14: Implemented (Phase 1)

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
| 11 | React Navigation adoption | High | High | ✅ |
| 12 | React Query for data fetching | High | High | ✅ |
| 13 | Swipe gestures on list items | High | Medium | ✅ |
| 14 | Bottom sheet for add forms | High | Medium | ✅ |

---

## Items 15–20: Phase 2 Improvements

| # | Item | Effort | Impact | Status | Notes |
|---|------|--------|--------|--------|-------|
| 15 | Toast at better position (bottom, above tab bar) | Low | Medium | ✅ | Moved to bottom with correct offset |
| 16 | Freeze/lock screen during form submission | Medium | High | ✅ | Full-screen overlay + disabled inputs/buttons + back-nav blocked |
| 17 | Smooth native screen transitions (iOS + Android) | Medium | High | ✅ | Re-enabled native stack slide animations; ScreenTransition unchanged |
| 18 | User detail / profile page | Medium | Medium | ✅ | Dedicated UserDetailPage with business info + edit link; accessible from profile avatar |
| 19 | Automated payment reminder (WhatsApp + in-app) | High | High | ✅ | SaleDetailPage "Send Reminder" opens WhatsApp deep-link; backend getSaleReminder endpoint surfaces the URL |
| 20 | Stock update optimistic refresh + smooth screen switch | Medium | High | ✅ | Immediate cache update after sale creation; React Navigation native animations enabled |

### Files changed by item 15
- `app/App.tsx` — added `position`, `bottomOffset`, `topOffset` props to `<Toast />`

### Files changed by item 16
- `app/src/components/SubmitOverlay.tsx` — NEW: full-screen semi-transparent overlay with spinner shown while any form is submitting
- `app/src/pages/AddSalePage.tsx` — overlay + BackHandler block during submit
- `app/src/pages/AddCustomerPage.tsx` — overlay + BackHandler block during submit
- `app/src/pages/AddInventoryPage.tsx` — overlay + BackHandler block during submit

### Files changed by item 17
- `app/App.tsx` — `screenOptions.animation` changed from `"none"` to `"slide_from_right"`; sheet screens keep `"none"`

### Files changed by item 18
- `app/src/pages/UserDetailPage.tsx` — NEW: full profile page (name, email, phone, business name, GST, address, member since)
- `app/src/components/ProfileMenu.tsx` — "View Profile" action navigates to UserDetailPage
- `app/App.tsx` — added `UserDetail` screen to stack; extended `RootStackParamList`
- `app/src/types/navigation.ts` — added `UserDetail: undefined` to `RootStackParamList`

### Files changed by item 19
- `app/src/pages/SaleDetailPage.tsx` — "Send Reminder" button fetches `/sales/:id/reminder` and opens `whatsappUrl` with `Linking.openURL`
- `app/src/lib/api.ts` — added `fetchSaleReminder` helper

### Files changed by item 20
- `app/src/pages/AddSalePage.tsx` — after successful sale, optimistically invalidate product/inventory queries before navigating
- `app/App.tsx` — `animation: "slide_from_right"` (same as item 17)

---

## Known Issues (pre-existing, not from this work)
- None currently tracked from items 1–20.
