# Transport & Mobility (CSFS-002) — R&D Gap Analysis & Build Report

**Bluebook:** CSFS-002 Transportation & Mobility v1.0 · **Scope:** the bluebook describes **5 sub-modules**; today only ~1.3 are real.

---

## 1. The bluebook in one picture

CSFS-002 is **not** "bus tracking" — it's a **multi-modal mobility layer** with five sub-modules behind one Transport tile (≤2 taps from home):

| # | Sub-module | What it is |
|---|---|---|
| 1 | **Schedule & Live Tracking** | Real-time bus map (GPS WebSocket), routes, stops, ETA, 5-min proximity push, crowd-sourced sharing + voting |
| 2 | **Fare Guide** | Route × vehicle-type fare matrix (rickshaw, CNG, auto, e-cart) |
| 3 | **Vehicle Rent** | Cycle/bike/e-cart listings, time-based pricing, wallet booking, return confirmation |
| 4 | **Ride Sharing** | Post offer / search by destination+time / in-app chat / confirm |
| 5 | **Intercity Ticket** | Route search → seat map → SSLCommerz → e-ticket PDF + SMS |

Plus cross-cutting: admin fleet dashboard, fare editor, driver app, reward/penalty ledger, offline fallback, tenant isolation.

---

## 2. Current state (what actually exists)

### Backend (`campus-sheba-backend`)
- ✅ **Bus tracking** — full real-time stack: WebSocket `/bus-tracking`, Redis hot-state, anti-fraud flag scoring, **crowd-sourced voting + reputation**, geofence auto-stop, tiered blocks. REST: `GET /buses`, `/buses/live`, `/bus-tracking/me/status`, admin bus CRUD + block management.
- ✅ **Parcel** — rider-delivered campus parcels (separate from this bluebook, but mobility-adjacent).
- ❌ **No** Route/Stop/Schedule entities, **no ETA engine**, **no proximity push**, **no fare matrix**, **no vehicle rent**, **no ride sharing**, **no intercity ticket/seat/e-ticket**, **no driver app**, **no reward/penalty ledger**, **no admin fleet dashboard**.

### Frontend (`campus-sheba-web`) — before this work
- ✅ **Live Bus Tracking** UI wired to the real WS + REST (`/live-bus`): map, live list, share, vote, block status.
- ⚠️ Bus tracking has **no route/stop/ETA layer** (the bluebook's "select route → polyline + stop list + ETA every 2s + 5-min push"). The backend `Bus` entity has only `code/name/route(string)/capacity` — no structured stops, polyline, schedule, or ETA. So the live map shows a moving pin, **not** a route line + stop ETAs.
- ❌ No Fare Guide, Vehicle Rent, Ride Sharing, or Intercity Ticket UI.
- ❌ No unified **Transport hub** (the "5-tile" entry point the bluebook mandates).

---

## 3. Gap matrix (bluebook → reality → action)

| Capability | Bluebook | Backend | Web (before) | This build |
|---|---|---|---|---|
| Transport hub (5 tiles, ≤2 taps) | Required | — | ❌ | ✅ **Built** (`/transport`) |
| Live GPS bus map | Phase 2 | ✅ | ✅ | ↔ Linked from hub (real API) |
| Route polyline + stop list + per-stop ETA | Required | ❌ (no entity) | ❌ | 🟡 **Mock** (UI ready; needs Route/ETA backend) |
| 5-min proximity push | Required | ❌ | ❌ | 🟡 Mock toggle (needs ETA engine + FCM) |
| Crowd-source voting + reward/penalty ledger | Required | ✅ voting / ❌ ledger | ✅ voting | ↔ voting real; ledger pending backend |
| **Fare Guide** matrix | Required | ❌ | ❌ | ✅ **Built (mock)** |
| **Vehicle Rent** listing+booking+wallet+return | Phase 2 | ❌ | ❌ | ✅ **Built (mock)** |
| **Ride Sharing** offer/search/chat/confirm | Phase 2 | ❌ | ❌ | ✅ **Built (mock)** |
| **Intercity Ticket** seat map + e-ticket | Phase 3 | ❌ | ❌ | ✅ **Built (mock)** |
| Bus status (Active/Inactive/Breakdown/Cancelled) | Required | partial (`isActive`) | partial | 🟡 Mock states in UI |
| Admin fleet dashboard / fare editor / driver app | Required | ❌ | ❌ | ⛔ Out of scope (admin/driver apps) |

Legend: ✅ done · 🟡 mock (UI complete, backend pending) · ↔ uses existing real API · ⛔ not in this portal.

---

## 4. R&D findings — what's genuinely hard (and what the mocks assume)

1. **Routes are first-class objects the backend doesn't have yet.** The bluebook's live tracking is *route-centric* (polyline, ordered stops, per-stop ETA), but today a `Bus` only knows a free-text `route` string and broadcasts a single pin. **Recommendation:** add `Route { polyline, stops[], schedule, fareMatrix, vehicleType, color }` and bind buses to routes. The mock models this shape so the backend can mirror it.
2. **ETA needs an engine, not a field.** "ETA every 2s + 5-min proximity push" requires the ETA Engine (live GPS + schedule + history) + FCM topic per stop. The mock shows schedule-based ETA + a proximity-alert toggle so the UX is validated before the engine exists.
3. **Money flows reuse existing rails.** Vehicle Rent + paid rides should reuse the **Wallet** (escrow/debit) already in the platform; Intercity Ticket should reuse **SSLCommerz** (already used by parcel/orders). The mocks simulate these so the flows are real-feeling and ready to wire.
4. **Crowd-source ledger is the missing half.** Voting exists; the **reward (+points) / penalty (3-strike)** ledger does not. The bus `myStatus` already returns `reporterScore`/`blockCount` — the ledger just needs to *credit wallet points* on validated shares.
5. **Tenant isolation** is already enforced everywhere (university-scoped). All mock data is presented per selected campus.

---

## 5. What this build delivers (frontend, this portal)

A **modern, unified Transport hub** at `/transport` with five sub-modules. Live Bus + (the platform) Parcel use **real APIs**; Fare Guide, Vehicle Rent, Ride Sharing, and Intercity Ticket are **fully-interactive frontend mockups** (clearly badged "Preview") with tenant-flavored Jahangirnagar University data from the bluebook's examples (Bishmail Express, Dairy Gate, Savar Local, JU→Sylhet, etc.).

Design goals applied: map-first/photo-first layouts, route color-coding, availability/status badges, seat-map UI, sticky checkout, smooth live pulses, empty states, and a consistent sub-module header — so the experience reads as a single, professional product, not disconnected pages.

> **Honesty note:** the four mocked sub-modules do not call a backend; they exist to validate UX and unblock design sign-off ahead of the Route/ETA/Rent/Ride/Ticket services. Each carries a visible "Preview" badge.
