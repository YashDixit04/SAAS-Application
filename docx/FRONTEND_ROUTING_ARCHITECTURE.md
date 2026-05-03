# Frontend Routing Architecture (Phase 1)

Date: 2026-04-18  
Scope: `b2b2` frontend URL routing + navigation flow mapping

## 1) Objective

Move from in-memory tab routing to URL-based routing so every screen is deep-linkable and browser navigation (back/forward/reload/share) works as expected.

This is now implemented with `react-router-dom` + a centralized route resolver.

## 2) What Is Implemented

- Browser routing enabled in app root.
- Canonical URL paths added for tenant and platform screens.
- Backward compatibility kept for legacy `onNavigate('tabName')` calls.
- Tenant context aware navigation added (`/tenant/:tenantId/...`).
- Access checks still enforced using RBAC (`canAccessPage`).

## 3) Big-Tech Style Principles Applied

The architecture follows patterns used in large products:

1. URL is the source of truth (not local component state).
2. Route schema is stable and semantic (`/tenant/:id/sub-users`).
3. Dynamic segments represent entity context (`:tenantId`).
4. Shared shell handles auth + global navigation; feature pages stay focused.
5. Backward compatibility layer allows gradual migration.
6. Access control is route-aware, not button-only.
7. Route contracts are explicit for deep links, bookmarking, and testing.

Reference ideas used:
- React Router docs: client-side routing, dynamic segments, active links, ranking.
- Fowler micro-frontends article: route contracts, container responsibility for auth/navigation.
- MDN History API: browser history behavior alignment.

## 4) Canonical Route Map

### Core pages

- `/dashboard` -> Dashboard
- `/tenantlist` -> Tenant list
- `/tenant/new` -> Add tenant
- `/users` -> Platform users list
- `/users/new` -> Add platform user
- `/offers` -> Offers
- `/profile` -> User profile/settings
- `/help` -> Help page

### Tenant-scoped pages

- `/tenant/:tenantId` -> Tenant details
- `/tenant/:tenantId/sub-users` -> Tenant sub users list
- `/tenant/:tenantId/sub-users/new` -> Add tenant sub user
- `/tenant/:tenantId/vessels` -> Tenant vessels
- `/tenant/:tenantId/orders` -> Requisition/orders
- `/tenant/:tenantId/catalogue` -> Tenant catalogue
- `/tenant/:tenantId/catalogue/add-product` -> Add product
- `/tenant/:tenantId/cart` -> Cart
- `/tenant/:tenantId/documents` -> Documents
- `/tenant/:tenantId/activity-logs` -> Activity logs

## 5) Button/Click Flow Matrix

### Top-level navigation

- Sidebar `Dashboard` click -> `/dashboard`
- Sidebar `Tenants` click -> `/tenantlist`
- Sidebar `Users` click -> `/users`
- Navbar cart icon click -> `/tenant/:tenantId/cart` (resolved from current/session tenant)

### Tenant flows

- Tenant row/card click (tenant list) -> `/tenant/:tenantId`
- Tenant details quick link `Sub Users` -> `/tenant/:tenantId/sub-users`
- Tenant details quick link `Vessels` -> `/tenant/:tenantId/vessels`
- Tenant details quick link `Orders` -> `/tenant/:tenantId/orders`
- Tenant details quick link `Catalogue` -> `/tenant/:tenantId/catalogue`
- Tenant details quick link `Documents` -> `/tenant/:tenantId/documents`
- Tenant details quick link `Activity Logs` -> `/tenant/:tenantId/activity-logs`

### Create/edit flows

- Sub users page `Add Sub User` click -> `/tenant/:tenantId/sub-users/new`
- Add sub user `Cancel` / success redirect -> `/tenant/:tenantId/sub-users`
- Platform users page `Add User` click -> `/users/new`
- Add account `Cancel` / success redirect -> `/users`
- Tenant list `Create a new tenant` click -> `/tenant/new`
- Add tenant `Cancel` / success redirect -> `/tenantlist`
- Catalogue `Add product` click -> `/tenant/:tenantId/catalogue/add-product`

## 6) Legacy Compatibility

Existing code still calling old patterns (example: `tenantDetails_<id>`, `addAccount`, `/tenant/sub-users`) is auto-resolved by the routing adapter in `lib/appRouting.ts`.

This allows incremental migration without breaking pages.

## 7) Backend to Frontend Contract

Routing itself is frontend-owned. Backend should remain API-owned.

### Current contract

- Frontend pages: Browser routes above
- Backend APIs: `/api/...` only

### Production requirement (important)

For direct URL refresh/deep-link support in production, server/proxy must:

- Send `/api/*` to Nest backend
- Rewrite non-API paths (for SPA) to frontend `index.html`

Example rewrite intention:

- `/tenantlist` -> serve frontend app shell
- `/tenant/abc/sub-users` -> serve frontend app shell
- `/api/tenants` -> serve backend JSON response

## 8) Optimization Notes

- Route logic centralized (`lib/appRouting.ts`) to avoid duplicated string logic.
- Tenant context extraction is shared.
- Access mapping for special pages (like add-sub-user) is normalized.
- URL contract is now testable end-to-end.

## 9) Next Phase (Recommended)

1. Replace remaining legacy `onNavigate('tab')` calls with direct canonical paths.
2. Add route-level tests for every path and redirect.
3. Add lazy loading for heavy route chunks to reduce bundle size.
4. Add `NavLink`-style active state mapping for nested tenant routes.
5. Add server rewrite config doc for deployment target (Nginx/CloudFront/Nest static).
