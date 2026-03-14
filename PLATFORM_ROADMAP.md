# 🎓 Campus Sheba — Enterprise Platform Roadmap
### Production-Grade Design System · User Journey · UX/UI Architecture · Development Roadmap

> **Version:** 1.0 | **Date:** March 2026 | **Status:** Active Planning

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture Overview](#2-platform-architecture-overview)
3. [Design System Foundation](#3-design-system-foundation)
4. [User Personas & Journey Maps](#4-user-personas--journey-maps)
5. [Information Architecture (IA)](#5-information-architecture-ia)
6. [Screen-by-Screen UX Blueprint](#6-screen-by-screen-ux-blueprint)
7. [Module-by-Module Feature Design](#7-module-by-module-feature-design)
8. [Design Principles & Component Library](#8-design-principles--component-library)
9. [API Integration Strategy](#9-api-integration-strategy)
10. [Development Phased Roadmap](#10-development-phased-roadmap)
11. [State Management Architecture](#11-state-management-architecture)
12. [Performance & Production Standards](#12-performance--production-standards)
13. [Admin Panel Blueprint](#13-admin-panel-blueprint)
14. [Mobile-First Strategy](#14-mobile-first-strategy)
15. [Security & Trust Architecture](#15-security--trust-architecture)

---

## 1. EXECUTIVE SUMMARY

### Platform Vision
Campus Sheba is a **360-degree campus lifestyle super-app** — a unified ecosystem that replaces a dozen fragmented solutions with one trusted, verified, campus-scoped platform.

### The 3 Core Value Loops

```
CONSUMER LOOP          PROVIDER LOOP           ADMIN LOOP
─────────────          ─────────────           ──────────
Discover Service  →    List Product/Service →   Verify Users
Place Order       →    Receive Order        →   Monitor Quality
Track Delivery    →    Fulfill & Earn       →   Resolve Disputes
Rate Experience   →    Build Reputation     →   Grow Platform
```

### North Star Metrics (NSMs)
| Metric | Target (Year 1) | Target (Year 2) |
|--------|----------------|----------------|
| Monthly Active Users (MAU) | 5,000 | 25,000 |
| Gross Merchandise Value (GMV) | ৳15L/month | ৳80L/month |
| Service Modules Active | 6 | 12 |
| Campus Onboarded | 3 | 15 |
| Delivery Completion Rate | 85% | 95% |
| NPS Score | 40 | 60 |

---

## 2. PLATFORM ARCHITECTURE OVERVIEW

### 2.1 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                             │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │  Web App          │        │  Mobile App (Flutter)    │  │
│  │  Next.js 16       │        │  iOS + Android           │  │
│  │  React 19         │        │  Same API contract       │  │
│  └──────────────────┘        └──────────────────────────┘  │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼───────────────────────────────────────┐
│                   API GATEWAY LAYER                        │
│   Auth Middleware → Rate Limiting → Request Routing        │
│   /api/auth/** → /api/user/** → /api/admin/**             │
│   /api/creator/** → /api/owner/** → /api/delivery-hero/** │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│              BACKEND SERVICE LAYER (Node.js)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth     │ │  Orders  │ │  Delivery│ │  Notification│  │
│  │  Service  │ │  Service │ │  Service │ │  Service     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Product  │ │  Books   │ │  Blood   │ │  Payment     │  │
│  │  Service  │ │  Service │ │  Bank    │ │  Service     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│            INFRASTRUCTURE LAYER                            │
│  MongoDB Atlas  │  Cloudinary CDN  │  Firebase (Notifs)   │
│  Redis Cache    │  SSLCommerz Pay  │  Real-time Socket    │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Role-Based Access Control Matrix

| Role | Auth Flow | Key Capabilities |
|------|-----------|-----------------|
| `GUEST` | No auth | View splash, banners, public listings |
| `USER` | OTP → Complete Signup | Consumer features: order, cart, watchlist, blood, parcel, lost&found |
| `CREATOR` | User + Creator Role | List products, books, food; manage own inventory |
| `OWNER` | Vendor Registration | Manage shops, view orders, confirm items |
| `DELIVERY_HERO` | Special onboarding | Accept/pick/deliver parcels & orders |
| `MODERATOR` | Admin-assigned | Review content, manage disputes |
| `ADMIN` | Admin login endpoint | Full platform management |
| `SUPER_ADMIN` | Top-level | Role permissions, system config |

---

## 3. DESIGN SYSTEM FOUNDATION

### 3.1 Brand Identity & Color Palette

```
PRIMARY BRAND COLORS
─────────────────────────────────────────────────────────
Campus Green      #00A651   RGB(0, 166, 81)    — Growth, Campus
Deep Navy         #0D1B2A   RGB(13, 27, 42)    — Trust, Authority  
Warm Amber        #F5A623   RGB(245, 166, 35)  — Energy, Food
Coral Red         #E84545   RGB(232, 69, 69)   — Blood, Emergency
Sky Blue          #3B82F6   RGB(59, 130, 246)  — Delivery, Tech

SEMANTIC COLORS (UI States)
─────────────────────────────────────────────────────────
Success           #10B981   — Order confirmed, donor found
Warning           #F59E0B   — Pending verification
Error             #EF4444   — Failed, cancelled
Info              #3B82F6   — Notifications, tracking

NEUTRAL SCALE
─────────────────────────────────────────────────────────
gray-50:  #F9FAFB    gray-100: #F3F4F6    gray-200: #E5E7EB
gray-300: #D1D5DB    gray-400: #9CA3AF    gray-500: #6B7280
gray-600: #4B5563    gray-700: #374151    gray-800: #1F2937
gray-900: #111827    gray-950: #030712

MODULE-SPECIFIC ACCENT COLORS
─────────────────────────────────────────────────────────
Delivery Sheba    #6D28D9 (Purple)   — Speed, logistics
Book Sheba        #2563EB (Blue)     — Knowledge, trust
Buy & Sell        #059669 (Emerald)  — Commerce, exchange
Blood Bank        #DC2626 (Red)      — Urgency, life
Tuition Sheba     #D97706 (Amber)    — Learning, warmth
Donation          #16A34A (Green)    — Community, giving
Jobs              #0284C7 (Sky)      — Opportunity
Garbage           #64748B (Slate)    — Eco, clean
Lost & Found      #CA8A04 (Yellow)   — Discovery, hope
Parcel            #7C3AED (Violet)   — Reliability
```

### 3.2 Typography System

```
FONT STACK
──────────────────────────────────────────────────
Display/Hero:    Sora           — Bold, modern campus feel
Body:            Inter          — Clean, readable, versatile
Mono/Code:       JetBrains Mono — For IDs, tracking codes

TYPE SCALE (rem)
──────────────────────────────────────────────────
display-2xl: 4.5rem / 72px / weight: 800  — Hero headlines
display-xl:  3.75rem / 60px / weight: 700 — Section heroes
display-lg:  3rem    / 48px / weight: 700 — Page titles
h1:          2.25rem / 36px / weight: 700
h2:          1.875rem / 30px / weight: 600
h3:          1.5rem  / 24px / weight: 600
h4:          1.25rem / 20px / weight: 600
body-lg:     1.125rem / 18px — Long-form reading
body:        1rem    / 16px  — Default UI text
body-sm:     0.875rem / 14px — Secondary, labels
caption:     0.75rem / 12px  — Metadata, timestamps
```

### 3.3 Spacing & Grid System

```
BASE UNIT: 4px (0.25rem)

SPACING SCALE
──────────────────────────────────────────────────
spacing-1:  4px    spacing-2:  8px    spacing-3: 12px
spacing-4: 16px    spacing-5: 20px    spacing-6: 24px
spacing-8: 32px    spacing-10: 40px   spacing-12: 48px
spacing-16: 64px   spacing-20: 80px   spacing-24: 96px

PAGE LAYOUT GRID
──────────────────────────────────────────────────
Mobile (<768px):   1 column,  16px horizontal padding
Tablet (768-1024): 2-3 cols,  24px horizontal padding
Desktop (1024+):   4-12 cols, 32px horizontal padding
Max Content Width: 1280px (centered)
Max Full Width:    1600px (dashboard)

BREAKPOINTS
──────────────────────────────────────────────────
xs: 375px  sm: 640px  md: 768px
lg: 1024px xl: 1280px 2xl: 1536px
```

### 3.4 Shadow & Elevation System

```
shadow-xs:   0 1px 2px rgba(0,0,0,0.05)           — Cards resting
shadow-sm:   0 1px 3px rgba(0,0,0,0.10)           — Buttons 
shadow-md:   0 4px 6px rgba(0,0,0,0.07)           — Hover cards
shadow-lg:   0 10px 15px rgba(0,0,0,0.10)         — Modals
shadow-xl:   0 20px 25px rgba(0,0,0,0.15)         — Drawers
shadow-glow: 0 0 0 3px rgba(0,166,81,0.30)        — Focus rings
```

### 3.5 Border Radius System

```
radius-sm:   4px   — Tags, badges
radius-md:   8px   — Buttons, inputs
radius-lg:   12px  — Cards
radius-xl:   16px  — Modals, panels
radius-2xl:  24px  — Feature cards
radius-full: 9999px — Pills, avatars, chips
```

### 3.6 Animation Principles

```
MOTION TOKENS
──────────────────────────────────────────────────
duration-fast:   150ms  — Hover states, micro-interactions
duration-normal: 250ms  — State transitions
duration-slow:   400ms  — Page transitions, modals
duration-enter:  600ms  — First-time reveals

EASING
──────────────────────────────────────────────────
ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)   — Default
ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) — Playful
ease-sharp:   cubic-bezier(0.4, 0, 0.6, 1)   — Decisive

ANIMATION PATTERNS
──────────────────────────────────────────────────
Page Enter:     fade-up (translateY: 20px → 0, opacity 0→1)
Card Hover:     translateY(-4px) + shadow deepening
Button Press:   scale(0.97) on active
List Items:     stagger 50ms delay per item
Loading:        skeleton shimmer (gradient sweep)
Success:        scale(1.1) bounce + color flash
```

---

## 4. USER PERSONAS & JOURNEY MAPS

### 4.1 Persona 1: "Tanha" — The Everyday Student

```
Age: 20 | Department: CSE | Year: 2nd | Jahangirnagar University
Goals: Find affordable food, sell old books, get tuition referrals
Pain Points: No cash, poor internet, distrust of strangers
Device: Mid-range Android, 4G
Usage Pattern: Peaks 12pm-2pm, 8pm-11pm
```

**Tanha's Critical Flow: Ordering Food**
```
1. Opens app → Home Feed (sees food banners)
2. Taps "Food Delivery" module
3. Selects "Inside Campus" tab
4. Browses by canteen → sees menu items
5. Adds items to cart
6. Reviews order summary (includes delivery charge)
7. Selects delivery address (dorm room)
8. Chooses payment: bKash / Wallet / COD
9. Places order → receives OTP confirmation
10. Tracks delivery in real-time
11. Rates experience (1-5 stars + comment)
```

### 4.2 Persona 2: "Rafi" — The Student Entrepreneur

```
Age: 22 | Sells: Handmade crafts + food | Dhaka University
Goals: Grow customer base, manage orders, get paid reliably  
Pain Points: No storefront visibility, order management chaos
Device: iPhone 12, Fiber internet
Usage Pattern: Constant monitoring, especially evenings
```

**Rafi's Critical Flow: Setting Up Shop & Listing Product**
```
1. Downloads app → Registers as Entrepreneur/Creator
2. Submits: shop name, category, photos, description
3. Uploads verification (varsity ID, optional trade license)
4. Waits for admin approval (24-48h)
5. Shop goes live → adds products with price, photos, stock
6. Gets first order → notified instantly (push + in-app)
7. Confirms order → prepares product
8. Marks ready → delivery hero picks up (or buyer collects)
9. Reviews payout in wallet dashboard
10. Requests payout when threshold met
```

### 4.3 Persona 3: "Nasrin" — The Blood Emergency Coordinator

```
Age: 25 | Medical student | Chittagong University
Goals: Find matching blood group in < 30 minutes
Pain Points: Unknown donor locations, slow response
Device: Any device, extreme urgency mode
```

**Nasrin's Critical Flow: Emergency Blood Request**
```
1. Opens app → Blood Bank module
2. Taps "Emergency Request"
3. Fills: blood group, units, hospital, urgency level
4. System sends push notifications to all matching donors
5. Donors respond (I can donate / Not available)
6. Nasrin sees list of available donors with contact info
7. Contacts donor directly via phone/in-app
8. Marks request as Fulfilled
9. System records donation history for donor
```

### 4.4 Persona 4: "Jahid" — The Delivery Hero

```
Age: 23 | Part-time student | Earns ৳500-1500/day
Goals: Maximize deliveries, get paid on time
Pain Points: Inefficient route, low payout visibility  
Device: Budget Android, data-conscious
```

**Jahid's Critical Flow: Delivery Execution**
```
1. Logs in as Delivery Hero → sees assigned parcels/orders
2. Reviews pickup location → maps integration
3. Picks up → marks "Picked Up" in app
4. Navigates to drop location
5. Delivers → gets customer signature/OTP confirmation
6. Marks "Delivered" → earnings credited to dashboard
7. End of day → views earnings summary
8. Requests payout when balance ≥ threshold
```

---

## 5. INFORMATION ARCHITECTURE (IA)

### 5.1 Consumer App Navigation Structure

```
ROOT NAVIGATION (Bottom Tab Bar — Mobile)
├── 🏠 Home
│   ├── Splash/Banner Carousel
│   ├── Quick Access Module Grid (8 modules)
│   ├── Trending Products
│   ├── Featured Shops
│   └── Recent Activity
│
├── 🔍 Explore
│   ├── All Products (with filter/sort)
│   ├── All Food Items
│   ├── Books Marketplace
│   └── Search (global search)
│
├── 🛒 Cart / Orders
│   ├── Cart Items
│   ├── Order History
│   └── Track Active Order
│
├── 🔔 Notifications
│   ├── Orders & Deliveries
│   ├── Borrow Requests
│   ├── Blood Requests
│   └── System Announcements
│
└── 👤 Profile
    ├── My Profile
    ├── My Addresses
    ├── My Wallet
    ├── My Watchlist
    ├── Blood Donor Profile
    ├── Settings
    └── Help & Support

MODULE DEEP LINKS (from Home Grid)
├── /delivery        — Delivery Sheba
├── /marketplace     — Buy & Sell
├── /books          — Book Sheba
├── /tuition        — Tuition Sheba
├── /blood          — Blood Bank
├── /jobs           — Jobs
├── /donation       — Donation
├── /garbage        — Garbage Collector
├── /lost-found     — Lost & Found
└── /parcel         — Parcel Delivery
```

### 5.2 Web App Route Architecture

```
/[locale]/
├── (public)/
│   ├── (landing-page)/     — Marketing home
│   ├── about/              — About Campus Sheba
│   ├── privacy-policy/
│   ├── terms-condition/
│   └── careers/
│
├── (auth)/
│   ├── login/              — OTP-based login
│   ├── signup/
│   │   ├── send-otp/       — Step 1
│   │   ├── verify-otp/     — Step 2
│   │   └── complete/       — Step 3 (profile setup)
│   └── forgot-password/
│
└── (protected)/
    ├── dashboard/           — Consumer home (post-login)
    ├── delivery/            — Delivery Sheba module
    ├── marketplace/         — Buy & Sell
    │   ├── [productId]/
    │   └── sell/
    ├── books/               — Book Sheba
    │   ├── [bookId]/
    │   └── list/
    ├── tuition/             — Tuition Sheba
    ├── blood-bank/          — Blood Bank
    ├── jobs/                — Jobs listing
    ├── donation/            — Donation campaigns
    ├── lost-found/          — Lost & Found
    ├── parcel/              — Parcel tracking
    ├── cart/                — Shopping cart
    ├── orders/              — Order history + tracking
    ├── profile/             — User profile
    ├── wallet/              — Wallet + transactions
    ├── notifications/       — All notifications
    └── shop/[shopId]/       — Shop profile page

ADMIN ROUTES (/admin/)
├── dashboard/              — Analytics overview
├── users/                  — User management
├── products/               — Product moderation
├── orders/                 — Order management
├── shops/                  — Shop approval & management  
├── books/                  — Book moderation
├── food/                   — Food item management
├── blood-donors/           — Blood bank admin
├── lost-found/             — Lost & found moderation
├── parcels/                — Parcel management
├── wallet/                 — Wallet management
├── promo-codes/            — Promo code management
├── banners/                — Banner CMS
├── universities/           — University management
├── emergency-contacts/     — Emergency contacts
├── refunds/                — Refund requests
├── roles/                  — Role & permission matrix
├── charges/                — Delivery charge config
└── app-versions/           — Mobile app version management
```

---

## 6. SCREEN-BY-SCREEN UX BLUEPRINT

### 6.1 ONBOARDING FLOW (3-Step)

**Step 1 — Landing/Splash**
```
┌─────────────────────────────────────┐
│  [Full-screen animated illustration] │
│                                      │
│     Campus Sheba                     │
│   "Your Campus. Your World."         │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │   📱 Continue with Phone Number  │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Already have an account? [Log In]   │
└─────────────────────────────────────┘
```

**Step 2 — Registration Wizard (3 sub-steps)**
```
Progress: ●●●○  "Step 3 of 4"

Sub-step A: Phone → OTP Verification
Sub-step B: Personal Info (Name, Gender, DOB, Blood Group)
Sub-step C: University Info (Select University, Dept, Session, Roll)
Sub-step D: Upload University ID Card (camera capture UI)
```

**Step 3 — Category Preference Selection**
```
"What brings you to Campus Sheba?"
(Multi-select grid of modules with icons)
[Skip for now] or [Continue]
```

### 6.2 HOME SCREEN LAYOUT (Post-Login)

```
┌─────────────────────────────────────────┐
│ 🔔  Good Morning, Tanha!    [Avatar]    │  ← Personalized greeting
├─────────────────────────────────────────┤
│ 🏫 Jahangirnagar University  [Change ▼] │  ← Campus context
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │    BANNER CAROUSEL (auto-slide)     │ │  ← Full width, 200px height
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  MODULE QUICK ACCESS GRID               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │🚴Food│ │📚Book│ │🛍️Sell│ │🩸Blood│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │👨‍🏫Tutn│ │💼Jobs│ │📦Parc│ │🔍Lost│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│  🔥 TRENDING IN YOUR CAMPUS             │
│  [Horizontal scroll cards]              │
├─────────────────────────────────────────┤
│  🏪 FEATURED SHOPS                      │
│  [Horizontal scroll shop cards]          │
├─────────────────────────────────────────┤
│  📣 ACTIVE BLOOD REQUESTS               │  ← Emergency widget
│  [A+ needed at Jahangirnagar Hospital]  │
└─────────────────────────────────────────┘
```

### 6.3 PRODUCT LISTING PAGE

```
┌─────────────────────────────────────────┐
│ ← MARKETPLACE         🔍 🛒(2)          │
├─────────────────────────────────────────┤
│ [🔍 Search products...]                 │
├─────────────────────────────────────────┤
│ [All] [Electronics] [Books] [Fashion]>  │  ← Category chips (scroll)
│ Sort: Latest ▼  |  Filter ☰            │
├─────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐             │
│ │ [IMAGE]  │  │ [IMAGE]  │             │  ← 2-col grid product cards
│ │ iPhone 12│  │ Calculus │             │
│ │ ৳25,000  │  │ ৳350     │             │
│ │ ⭐4.5 (8)│  │ NEW      │             │
│ │ [Add 🛒] │  │ [Add 🛒] │             │
│ └──────────┘  └──────────┘             │
└─────────────────────────────────────────┘
```

### 6.4 PRODUCT DETAIL PAGE

```
┌─────────────────────────────────────────┐
│ ←         iPhone 12 Pro          ❤️     │
├─────────────────────────────────────────┤
│ [PRODUCT IMAGE CAROUSEL — full width]   │
│                         ●●○○  (dots)    │
├─────────────────────────────────────────┤
│ iPhone 12 Pro 128GB Pacific Blue        │
│ ৳25,000   ~~৳30,000~~  (17% off)       │
│ ⭐ 4.5 · 12 reviews · 3 sold            │
├─────────────────────────────────────────┤
│ 🏪 Shop: TechHub JU  [View Shop →]     │
│ ✅ Verified Seller · JU Student         │
├─────────────────────────────────────────┤
│ DESCRIPTION                             │
│ [Full product description...]           │
├─────────────────────────────────────────┤
│ REVIEWS (12)                   [See All]│
│ ⭐⭐⭐⭐⭐ "Great condition!" - Rakib   │
├─────────────────────────────────────────┤
│ ┌──────────────────┐ ┌───────────────┐  │
│ │  Add to Watchlist │ │  Add to Cart  │  │
│ └──────────────────┘ └───────────────┘  │
│ ┌───────────────────────────────────┐   │
│ │          Buy Now (৳25,000)        │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 6.5 ORDER TRACKING SCREEN

```
┌─────────────────────────────────────────┐
│ ← Order #CS20240314001                  │
├─────────────────────────────────────────┤
│              🚴‍♂️                         │
│   Your order is on the way!             │
│   ETA: 12-15 minutes                    │
├─────────────────────────────────────────┤
│  ORDER TIMELINE (vertical stepper)      │
│  ✅ Order Placed (10:32 AM)             │
│  ✅ Payment Confirmed (10:33 AM)        │
│  ✅ Preparing (10:40 AM)               │
│  🔵 Picked Up (10:52 AM) ← current     │
│  ○  Out for Delivery                   │
│  ○  Delivered                          │
├─────────────────────────────────────────┤
│  DELIVERY HERO                          │
│  [Avatar] Jahid Islam                   │
│  ⭐4.8 · 234 deliveries                 │
│  [📞 Call]  [💬 Message]               │
├─────────────────────────────────────────┤
│  ORDER SUMMARY                          │
│  Biriyani (1x)           ৳120           │
│  Cold Drink (2x)         ৳60            │
│  Delivery Charge         ৳30            │
│  ─────────────                          │
│  Total                   ৳210           │
└─────────────────────────────────────────┘
```

---

## 7. MODULE-BY-MODULE FEATURE DESIGN

### 7.1 DELIVERY SHEBA

**Sub-modules:**
1. **Food Delivery (Inside Campus)** — Generic menus from campus canteens
2. **Food Delivery (Outside Campus)** — Restaurant/hotel listings
3. **Daily Bazar** — Fruits, vegetables, groceries, meat & fish
4. **Printing/Photocopy/Binding** — Service request + pickup

**UX Flow:**
```
Home → Delivery Tab → [Inside/Outside/Bazar/Printing]
→ Browse Menu/Products → Add to Cart → Checkout
→ Address Selection → Payment → Track → Rate
```

**Key UI Components:**
- Restaurant card with `open/closed` badge, rating, ETA chip
- Menu with category tabs (sticky header)
- Cart with quantity controls + floating cart button
- Real-time tracking map view (with rider location dot)
- Scheduled delivery time picker

**API Endpoints Used:**
- `GET /api/user/foods` — Food listings
- `GET /api/cart` — User cart
- `POST /api/cart` — Add to cart
- `POST /api/user/orders` — Place order
- `GET /api/user/orders/{id}` — Track order

---

### 7.2 BUY & SELL MARKETPLACE

**Sub-modules:**
1. **Used Product Buy/Sell** — Peer-to-peer
2. **Entrepreneurship Storefront** — Student entrepreneur shops
3. **Categories:** Electronics, Fashion, Food, Handicraft, Beauty, Sports, Stationery, Gadgets

**UX Flow:**
```
Home → Marketplace → [Browse / My Listings / Sell]
Sell Flow: Category Select → Photos (up to 8) → Details → Price → Publish
Buy Flow: Browse → Filter/Sort → Product Detail → Cart → Checkout
```

**Key UI Components:**
- Masonry grid layout (2-col mobile, 4-col desktop)
- "Sell" FAB button (floating action button)
- Quick filter pills: Price range, Condition (New/Used), Category
- Seller trust badge (verified campus user)
- Image gallery with zoom

**API Endpoints Used:**
- `GET /api/user/products` — Browse products
- `POST /api/creator/products` — Create listing
- `POST /api/user/orders` — Purchase

---

### 7.3 BOOK SHEBA

**Modes:** Buy · Sell · Loan · Free · Swap

**UX Flow:**
```
Book Shelf → [Browse Mode Tabs] → Book Detail
→ [Request Borrow / Buy / Contact for Swap]
Borrow Flow: Request → Owner Responds → Accept/Decline
→ Extension Request → Return Confirmation
```

**Key UI Components:**
- Book card: cover image, title, author, course code, condition badge
- Mode badge (Sell/Loan/Free/Swap) — color-coded
- Borrow timeline (days remaining progress bar)
- Return reminder notifications

**API Endpoints Used:**
- `GET /api/user/books` — Browse books
- `POST /api/creator/books/lend` — List for lending
- `POST /api/book-borrowing/request` — Borrow request
- `PATCH /api/book-borrowing/respond/{id}` — Accept/reject

---

### 7.4 BLOOD BANK

**Emergency-First Design Principle:** This module must be accessible in < 3 taps from anywhere in the app.

**UX Flow:**
```
SOS Button in Navbar → Blood Module
→ [Find Donor / Post Request / Register as Donor]
Emergency Request Flow:
  → blood group selector (A+/A-/B+/B-/O+/O-/AB+/AB-)
  → urgency level (Critical / Urgent / Normal)
  → hospital name (auto-suggest from university location list)
  → units needed
  → contact phone pre-filled from profile
  → Submit → Notify all matching donors in same university
```

**Key UI Components:**
- Blood group selector (8 cards, color-coded by urgency)
- Donor card: name (masked), blood group, last donation date, availability status
- Emergency alert banner (pulsing red) for active requests
- Urgency countdown timer display

**API Endpoints Used:**
- `GET /api/blood-donor/find` — Find donors by filter
- `POST /api/blood-donor/request` — Post emergency request
- `POST /api/blood-donor/register` — Register as donor
- `GET /api/blood-donor/requests` — Active requests list

---

### 7.5 BOOK BORROWING SYSTEM

**Statuses & Transitions:**
```
PENDING → APPROVED → ACTIVE → RETURN_REQUESTED → RETURNED
       ↘ REJECTED       ↘ EXTENDED (after extension request)
```

**Key UI Components:**
- Borrow request card with status chip
- Due date indicator (green → yellow → red as deadline approaches)
- Extension request modal with reason field
- Lender dashboard: incoming requests list + accept/reject actions

---

### 7.6 LOST & FOUND

**Types:** Lost Item Post · Found Item Post  
**Resolution Flow:** Match → Claim → Verify → Handover (in-person or via Delivery Hero)

**UX Flow:**
```
Post: Photo → Category → Description → Last seen location → Post
Claim: Browse → "I found this / This is mine" → Send Resolve Request
Owner reviews → Accepts → Arrange handover (in-person or parcel escalation)
```

**API Endpoints Used:**
- `POST /api/user/lost-and-found` — Create post
- `POST /api/user/lost-and-found/{postId}/resolve-request` — Claim item
- `POST /api/user/lost-and-found/{postId}/escalate-to-parcel` — Delivery handover

---

### 7.7 TUITION SHEBA

**Roles:** Student (seeker) · Tutor (provider)

**Profile Fields for Tutor:**
- Subjects taught, education level target, experience years
- Preferred areas (on-campus, online, student's location)
- Session rate (per hour, per month)
- Available time slots

**UX Flow:**
```
Browse Tutors → Filter (subject, price, rating, availability)
→ Tutor Profile → Contact/Book Session → Pay/Agree
→ Review after session completion
```

---

### 7.8 JOBS MODULE

**Job Types:** Part-time · Freelance · Internship · Research Assistant · Campus Jobs

**Post a Job Flow (for employers/students):**
```
Job Title → Category → Description → Requirements
→ Compensation → Deadline → Location (on-campus/remote)
→ Submit for Admin Review → Published
```

---

### 7.9 DONATION MODULE

**Campaign Categories:** Flood Relief · Ramadan Pack · Eid Gift · Winter Drive · Medical Support · Social Development

**Campaign UX:**
```
Campaign Detail: Hero image, goal amount, raised amount, progress bar
→ Donor list (anonymized) → Donate button → Amount picker → Pay
→ Thank you screen with shareable card
```

---

### 7.10 PARCEL DELIVERY

**Flow:**
```
Book Parcel → Sender/Receiver info → Package size/weight
→ Pickup location → Drop location → Charge estimate
→ Pay → Assigned to Delivery Hero → Track → Delivered → Review
```

---

### 7.11 GARBAGE COLLECTOR

**Request Types:** Scheduled Pickup · On-Demand

**Flow:**
```
Select area/hall → Type of garbage (organic/recyclable/general)
→ Quantity estimate → Schedule time → Confirm
→ Collector arrives → Marked complete
```

---

## 8. DESIGN PRINCIPLES & COMPONENT LIBRARY

### 8.1 Core Design Principles

```
1. CAMPUS-FIRST
   Every feature assumes a campus context. University selector is always
   prominent. All data is scoped to the user's registered university.

2. TRUST FIRST
   Verified badges, review ratings, and document verification are
   surfaced prominently. Never hide safety signals.

3. SPEED OVER POLISH
   Skeleton loaders always shown. Never show empty states without action.
   Optimistic UI updates for cart and wishlist actions.

4. EMERGENCY-ACCESSIBLE
   Blood bank, emergency contacts, and SOS routing must be reachable
   within 2 taps regardless of current screen.

5. MOBILE-FIRST
   Design for 360px minimum width. Every interaction must work with
   thumb-only navigation. Bottom sheet > modal for mobile.
```

### 8.2 Core Component Inventory

**Atoms**
- `Button` — Primary, Secondary, Ghost, Danger, Icon
- `Badge` — Status, Count, Module-color variant
- `Avatar` — With fallback initials, size variants (sm/md/lg/xl)
- `Input` — Text, Phone, OTP (6-digit), Password, Textarea
- `Chip` / `Tag` — Filter pills, category tags
- `Spinner` / `Skeleton` — Loading states
- `Icon` — Lucide + custom campus icons
- `Divider` — Horizontal with optional label

**Molecules**
- `ProductCard` — Image, title, price, rating, seller, cart button
- `BookCard` — Cover, title, author, mode badge, condition
- `ShopCard` — Logo, name, category, rating, open/closed
- `OrderStatusBar` — Multi-step tracker with active step
- `BloodGroupBadoe` — Color-coded A+/B-/O+ display
- `PriceDisplay` — Current price, crossed original, discount %
- `StarRating` — Interactive + display mode
- `NotificationItem` — Icon, message, time, read/unread dot
- `UserTrustBar` — Verified, Reviews, Member since

**Organisms**
- `Navbar` — Desktop horizontal + Mobile hamburger/bottom
- `HeroSection` — With CTA + app download + phone mockup
- `ModuleGrid` — 2x4 service quick-access icons
- `BannerCarousel` — Swiper with autoplay + pagination
- `FilterPanel` — Sidebar (desktop) / Bottom sheet (mobile)
- `CartDrawer` — Slide-in cart with items, totals, checkout CTA
- `OrderCard` — Condensed order with status + actions
- `ProfileCard` — Avatar, info, verified badge, action buttons
- `ReviewList` — Rating breakdown bar + individual reviews
- `EmergencyWidget` — Active blood request alert card

**Pages/Templates**
- `ListingTemplate` — Header + Filter + Grid/List toggle + Pagination
- `DetailTemplate` — Image carousel + Info + Seller + Actions + Reviews
- `CheckoutTemplate` — Cart summary + Address + Payment + Confirm
- `DashboardTemplate` — Stats cards + Recent activity + Quick actions
- `AuthTemplate` — Centered card with step indicator

---

## 9. API INTEGRATION STRATEGY

### 9.1 Auth Strategy
```
Auth Flow:
  POST /api/auth/signup/send-otp    → Store phone in session
  POST /api/auth/signup/verify-otp  → Receive temp token
  POST /api/auth/signup/complete    → Full profile → Access+Refresh tokens

Token Strategy:
  - Access Token: stored in memory (React state / Zustand)
  - Refresh Token: httpOnly cookie (server-side Next.js route)
  - Auto-refresh: via /api/auth/refresh before expiry
  - Logout: POST /api/auth/logout + clear cookies
```

### 9.2 Data Fetching Pattern

```typescript
// Pattern: Server Components for initial data, Client for mutations
// Example: Product Listing

// SERVER (Next.js RSC)
async function ProductListPage() {
  const products = await fetch('/api/user/products', { 
    next: { revalidate: 60 } // ISR: 60 second cache
  })
  return <ProductGrid initialData={products} />
}

// CLIENT (mutations, real-time)
function AddToCartButton({ productId }) {
  const [isPending, startTransition] = useTransition()
  const addToCart = async () => {
    startTransition(async () => {
      await POST('/api/cart', { productId, quantity: 1 })
      // Optimistic update → then revalidate
    })
  }
}
```

### 9.3 State Management Architecture (Redux Toolkit)

```
Store Slices:
├── authSlice         — user, tokens, isAuthenticated, currentCampus
├── cartSlice         — items, totalCount, totalPrice (cached locally)
├── notificationSlice — unreadCount, notifications list
├── watchlistSlice    — watchlistItemIds (for instant UI feedback)
├── uiSlice           — modal states, drawer states, loading states
└── locationSlice     — selectedUniversity, delivery location
```

### 9.4 Caching Strategy

| Data Type | Cache Strategy | Revalidation |
|-----------|---------------|-------------|
| Banners | ISR | 5 minutes |
| Products list | ISR | 60 seconds |
| Product detail | ISR | 30 seconds |
| Cart | Client (Redux) | On mutation |
| User profile | SWR (client) | On focus |
| Orders | No cache | Real-time |
| Blood requests | No cache | WebSocket push |
| Notifications | No cache | Push subscribe |

---

## 10. DEVELOPMENT PHASED ROADMAP

### PHASE 0 — Foundation (Weeks 1-3)
**Goal: Production-ready shell with auth**

```
✅ Design System Setup
   - Update tailwind.config.js with full design tokens
   - Create CSS variables for theme (light/dark ready)
   - Implement Google Fonts: Sora + Inter
   - Build core atom components (Button, Input, Badge, Spinner)

✅ Auth Module (Complete)
   - OTP-based signup wizard (3 steps)
   - Login page with phone number
   - Forgot password / Reset flow
   - Auth middleware + protected routes
   - Token management with auto-refresh
   - User profile setup (with university selection)

✅ Shell Infrastructure
   - Navbar (responsive: desktop + mobile)
   - Footer with module links
   - Global notification system (Toaster)
   - Loading states + error boundaries
   - i18n setup (EN + BN language support)
   - SEO meta tags setup

Deliverable: Users can sign up, log in, view empty home
```

### PHASE 1 — Core Commerce (Weeks 4-8)
**Goal: Buy, Sell, and Food Delivery working end-to-end**

```
🏪 Marketplace Module
   - Product listing with infinite scroll + filters
   - Product detail page with image gallery
   - Create product listing (with image upload to Cloudinary)
   - Shop profile page
   - Cart system (add, update, remove, clear)
   - Watchlist (heart button on cards)

🍕 Food Delivery Module
   - Inside campus: canteen menu browse
   - Outside campus: restaurant listing
   - Add to cart → single-shop enforcement
   - Checkout with address selection
   - Payment integration (SSLCommerz / bKash)
   - Order placement + confirmation

📦 Orders Module
   - Order history list
   - Order detail with status timeline
   - Cancel order capability
   - Order item status tracking

Deliverable: Full e-commerce loop working
```

### PHASE 2 — Books & Knowledge (Weeks 9-11)
**Goal: Book Sheba fully operational with borrow system**

```
📚 Book Sheba Module
   - Book listing (Buy/Sell/Loan/Free/Swap tabs)
   - Book detail with seller info
   - List a book (4 modes with different forms)
   - Borrow request flow
   - Borrow management (active borrows, extensions, returns)
   - My listed books dashboard

Deliverable: Complete book marketplace with borrow lifecycle
```

### PHASE 3 — Emergency & Community (Weeks 12-14)
**Goal: Blood Bank, Lost & Found, Parcel live**

```
🩸 Blood Bank Module
   - Donor registration + profile
   - Emergency blood request creation
   - Find donors (filter by blood group, availability)
   - Push notification on matching requests
   - Request status management
   - Donation history

🔍 Lost & Found Module
   - Post lost/found items (with photos, category, location)
   - Browse active posts from campus
   - Claim / resolve request flow
   - Admin approval for delivery escalation

📦 Parcel Delivery Module
   - Book parcel (sender, receiver, pickup/drop details)
   - Charge estimation before booking
   - Track parcel status
   - Delivery hero assignment view

Deliverable: Emergency and community services operational
```

### PHASE 4 — Empowerment Modules (Weeks 15-18)
**Goal: Tuition, Jobs, Donation, Garbage**

```
👨‍🏫 Tuition Sheba
   - Tutor profile creation (subjects, rate, schedule)
   - Student search & filter
   - Session booking / contact workflow

💼 Jobs Module
   - Job listing (campus-scoped)
   - Post a job (with admin approval)
   - Apply / express interest flow

🤝 Donation Module
   - Campaign listing with progress bars
   - Donate flow (amount + payment)
   - Campaign creation (with admin approval)

🗑️ Garbage Collector
   - Service request form
   - Scheduling system
   - Request tracking

Deliverable: All 10 modules available
```

### PHASE 5 — Admin Panel (Weeks 19-23)
**Goal: Super admin can manage all platform entities**

```
🖥️ Admin Dashboard
   - Analytics overview (MAU, GMV, orders, users)
   - User management (CRUD, activate/deactivate)
   - Role & permission matrix (visual grid)
   - Product/book/food moderation queue
   - Order management + manual delivery assignment
   - Shop approval workflow
   - Wallet credit/debit controls
   - Promo code management
   - Banner CMS (create, schedule, publish)
   - University & location management
   - Emergency contacts management
   - Refund request processing
   - App version management

Deliverable: Full admin control panel
```

### PHASE 6 — Delivery Hero App (Weeks 24-26)
**Goal: Delivery hero dashboard operational**

```
🚴 Delivery Hero Portal
   - Assigned orders/parcels list
   - Accept/reject assignment
   - Navigation integration (Google Maps)
   - Status update flow (Picked Up → In Transit → Delivered)
   - Earnings dashboard
   - Payout request system

Deliverable: Delivery operations fully digitized
```

### PHASE 7 — Quality, Performance & Scale (Weeks 27-30)
**Goal: Production-ready, performant, secure**

```
⚡ Performance
   - Core Web Vitals optimization (LCP < 2.5s, FID < 100ms)
   - Image optimization pipeline
   - Bundle size audit + tree shaking
   - Service worker + PWA capability

🔒 Security Audit
   - Penetration testing
   - Rate limiting verification
   - Input sanitization review
   - OWASP Top 10 compliance check

📊 Analytics Integration
   - User funnel tracking
   - Module-specific conversion rates
   - Error monitoring (Sentry)
   - Performance monitoring

🌍 Multi-Campus Expansion
   - University selector UX polish
   - Campus-scoped data isolation verification
   - University admin sub-role system

Deliverable: Production launch ready
```

---

## 11. STATE MANAGEMENT ARCHITECTURE

### 11.1 Zustand Store Structure (recommended alongside/instead of Redux)

```typescript
// Global App State
interface AppStore {
  // Auth
  user: User | null
  campus: University | null
  isAuthenticated: boolean
  
  // Cart (synced with /api/cart)
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  
  // Notifications
  unreadCount: number
  
  // UI State
  isCartOpen: boolean
  isSearchOpen: boolean
  activeModule: string | null
}

// Per-module state is kept in React Query / SWR
// Only truly global state in Zustand
```

### 11.2 Server State (React Query / SWR)

```
useQuery hooks:
├── useProducts(filters)
├── useProduct(id)
├── useBooks(filters)
├── useBook(id)
├── useOrders()
├── useOrder(id)
├── useCart()
├── useBloodDonors(filters)
├── useBloodRequests()
├── useNotifications()
└── useUserProfile()

useMutation hooks:
├── useAddToCart()
├── usePlaceOrder()
├── useBorrowBook()
├── useCreateBloodRequest()
├── useCreateProduct()
└── useCreateLostFoundPost()
```

---

## 12. PERFORMANCE & PRODUCTION STANDARDS

### 12.1 Core Web Vitals Targets
| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.0s | Next.js ISR + Image priority |
| CLS (Cumulative Layout Shift) | < 0.05 | Skeleton loaders + aspect ratios |
| FID (First Input Delay) | < 50ms | Code splitting + lazy loading |
| TTFB (Time to First Byte) | < 400ms | Vercel Edge + CDN |
| Bundle Size (initial JS) | < 200KB | Dynamic imports per module |

### 12.2 Image Optimization Strategy
```
- All product images: Cloudinary auto-format + quality=auto
- Use Next.js <Image> with fill + sizes attribute everywhere
- Blur placeholder (blurDataURL) for all product/banner images
- AVIF/WebP format negotiation via Cloudinary
- Lazy load all below-the-fold images
```

### 12.3 Accessibility (a11y) Checklist
```
✅ All interactive elements have unique, descriptive IDs
✅ ARIA labels on icon-only buttons
✅ Color contrast ratio ≥ 4.5:1 for body text
✅ Focus rings visible (custom CSS: shadow-glow token)
✅ Screen reader support for status updates (aria-live)
✅ Form error messages are associated with inputs (aria-describedby)
✅ Skip to main content link
✅ Keyboard navigable modals with focus trap
```

### 12.4 Error Boundary Strategy
```
Per-module error boundaries:
- Each module route has its own ErrorBoundary + Suspense
- Graceful fallback UI (not white screen of death)
- Error logged to Sentry + displayed to user with retry button
- Network errors show toast with retry action
```

---

## 13. ADMIN PANEL BLUEPRINT

### 13.1 Admin Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  🎓 CampusSheba Admin     [🔔 3]  [Super Admin Avatar]   │
├────────────────┬─────────────────────────────────────────┤
│                │                                          │
│  SIDEBAR       │   MAIN CONTENT AREA                     │
│  ─────────     │                                          │
│  📊 Dashboard  │   KPI CARDS ROW                         │
│  👥 Users      │   [Total Users] [Orders] [GMV] [Active] │
│  🏪 Shops      │                                          │
│  📦 Products   │   CHARTS ROW                            │
│  🍕 Food       │   [Order Trend Chart] [Module Usage]    │
│  📚 Books      │                                          │
│  🚴 Delivery   │   RECENT ACTIVITY TABLE                 │
│  📦 Orders     │   Latest orders, users, requests        │
│  💰 Wallet     │                                          │
│  🎫 Promos     │   PENDING APPROVALS                     │
│  🩸 Blood      │   [Shop approvals] [Product reviews]    │
│  🔔 Banners    │                                          │
│  🏫 Campus     │                                          │
│  ⚙️ Settings   │                                          │
│  🔐 Roles      │                                          │
└────────────────┴─────────────────────────────────────────┘
```

### 13.2 Role Permission Matrix UI

```
Visual Grid (checkbox matrix):
        | View | Create | Edit | Delete | Approve | Export |
────────┼──────┼────────┼──────┼────────┼─────────┼────────|
Products│  ✅  │   ✅   │  ✅  │   ✅   │   ✅    │   ✅   |
Books   │  ✅  │   ❌   │  ✅  │   ✅   │   ✅    │   ❌   |
Orders  │  ✅  │   ❌   │  ❌  │   ❌   │   ❌    │   ✅   |
Users   │  ✅  │   ✅   │  ✅  │   ✅   │   ✅    │   ✅   |
```

---

## 14. MOBILE-FIRST STRATEGY

### 14.1 Cross-Platform Consistency (Web ↔ Flutter)

```
Shared Design Tokens:
  - Color palette exported as JSON → used in both Tailwind + Flutter theme
  - Typography scale matched in Flutter TextTheme
  - Spacing system aligned

Shared API Contract:
  - Same REST endpoints for both web and mobile
  - JWT auth flow identical
  - WebSocket/FCM notification handling

Platform-Specific UX:
  - Web: Hover states, keyboard shortcuts (Ctrl+K search)
  - Mobile: Swipe gestures, haptic feedback, biometric auth
  - Mobile: Bottom sheet > modal, FAB for primary actions
  - Mobile: Pull-to-refresh on all list screens
```

### 14.2 PWA Capability (Web)

```
Service Worker:
  - Cache first: static assets, fonts, icons
  - Network first: API responses
  - Offline fallback page with "You're offline" message

Manifest:
  - App name: "Campus Sheba"
  - Theme color: #00A651 (Campus Green)
  - Display: standalone
  - Icons: 192x192 + 512x512

Install Prompt:
  - Show after 3rd visit or after first order completion
  - Dismiss = don't show for 7 days
```

---

## 15. SECURITY & TRUST ARCHITECTURE

### 15.1 Security Measures

```
Authentication:
  ✅ OTP via SMS (phone-based, no password initially)
  ✅ JWT with short expiry (15min access, 7d refresh)
  ✅ Refresh token rotation
  ✅ All sensitive routes require auth middleware check

Data Validation:
  ✅ Server-side validation on ALL inputs
  ✅ File upload type/size restriction (Cloudinary server-side)
  ✅ Rate limiting on auth endpoints
  ✅ SQL/NoSQL injection prevention via ORM

Trust Signals:
  ✅ University ID verification (admin review)
  ✅ Verified seller badge visible on listings
  ✅ Review/rating system (prevents unverified reviews)
  ✅ Report listing / report user functionality
  ✅ Manual admin moderation queue for new shops

Privacy:
  ✅ Blood donor: name masked, only admin sees full details
  ✅ Lost & found: contact info only shown after match approval
  ✅ No contact info sharing without both party consent
```

### 15.2 Content Moderation Pipeline

```
NEW LISTING FLOW:
  Creator submits → Auto content check (image + text)
  → If flagged: Admin review queue → Approve/Reject with reason
  → If clean: Live immediately (can be reported later)

REPORTED CONTENT:
  User reports → Admin queue → 24h SLA
  → Action: No action / Warning / Remove / Suspend user

ESCALATION:
  3 valid reports → Auto-suspend listing pending admin review
  5 valid reports against user → Account flagged for review
```

---

## 🗺️ IMPLEMENTATION PRIORITY MATRIX

```
QUADRANT MAP (Impact vs Effort)

HIGH IMPACT / LOW EFFORT — DO FIRST
  ✦ Design system tokens in tailwind.config.js
  ✦ Auth flow completion (OTP 3-step)
  ✦ Home screen with module grid
  ✦ Product listing + cart
  ✦ Order placement + tracking

HIGH IMPACT / HIGH EFFORT — PLAN CAREFULLY
  ✦ Real-time delivery tracking
  ✦ Payment gateway integration
  ✦ Admin permission matrix
  ✦ Book borrowing lifecycle
  ✦ Push notification system (FCM)

LOW IMPACT / LOW EFFORT — DO WHEN POSSIBLE
  ✦ Dark mode
  ✦ PWA install prompt
  ✦ Multiple address management
  ✦ CSV export in admin

LOW IMPACT / HIGH EFFORT — DEFER
  ✦ Interactive campus map
  ✦ Video product listings
  ✦ AI-powered search recommendations
  ✦ Gamification / points system
```

---

## 📊 TECH DEBT ITEMS NOTICED IN CURRENT CODEBASE

1. **Metadata incorrect**: `layout.tsx` says "The Downtown" — update to Campus Sheba branding
2. **Color tokens**: `tailwind.config.js` has grey/neutral palette but no branded campus colors — needs full design system tokens
3. **Font**: Roboto Condensed is good for condensed display but Inter should be added for body text readability
4. **Commented code**: Many CTAs, buttons, and sections are commented out — these need to be either implemented or removed
5. **LandingPage routing conflict**: The `(landing-page)` route has a 3-column newspaper layout (LatestSection, BlogSection, RightColumn) which doesn't match the Campus Sheba home page structure — these need to be separated/clarified
6. **No Redux/Zustand yet**: State management pending — should be set up before Phase 1 cart work
7. **`axios` not in package.json**: The proposal mentions Axios but only native fetch is implied — add Axios or stick to fetch
8. **Missing Redux Toolkit**: Package.json has no Redux — add `@reduxjs/toolkit` + `react-redux`
9. **Ant Design version 6.x**: Very new (currently antd v5 is stable) — validate component compatibility

---

*End of Campus Sheba Platform Roadmap v1.0*
*Generated: March 2026 | Next Review: Post-Phase 1 completion*
