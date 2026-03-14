# CoreInventory — Full-Stack Architecture Blueprint

> **Stack:** React 18 + Redux Toolkit + Tailwind CSS · Node.js + Express · MongoDB + Mongoose
> **Auth:** JWT (Access + Refresh) + Twilio SMS OTP
> **v1 Features:** Role-based Access · PDF/Excel Export · Email Alerts · Barcode/QR Scanning

---
![Alt text](firstimage.png)
![Alt text](image2.png)
![Alt text](image3.png)
![Alt text](image4.png)
![Alt text](image5.png)
![Alt text](image6.png)
![Alt text](image7.png)
![Alt text](image8.png)
![Alt text](image9.png)
![Alt text](image10.png)
![Alt text](image11.png)
![Alt text](image12.png)
![Alt text](image13.png)
![Alt text](image14.png)
![Alt text](image15.png)
![Alt text](image16.png)
![Alt text](image17.png)
![Alt text](image18.png)
![Alt text](image19.png)
![Alt text](image20.png)
![Alt text](image21.png)
![Alt text](image22.png)


## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Folder Structure](#2-project-folder-structure)
3. [MongoDB Schemas](#3-mongodb-schemas)
4. [API Routes — Full Reference](#4-api-routes--full-reference)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Redux State Architecture](#6-redux-state-architecture)
7. [Key Feature Implementation](#7-key-feature-implementation)
8. [Environment Variables](#8-environment-variables)
9. [Build Sprint Plan](#9-build-sprint-plan)

---

## 1. Tech Stack & Dependencies

### Frontend `/client`

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3 | UI component library |
| `react-dom` | ^18.3 | DOM rendering for React |
| `react-router-dom` | ^6.26 | Client-side routing, protected routes |
| `@reduxjs/toolkit` | ^2.3 | State management — slices, thunks, RTK Query |
| `react-redux` | ^9.1 | React bindings for Redux |
| `axios` | ^1.7 | HTTP client with interceptors for JWT refresh |
| `tailwindcss` | ^3.4 | Utility-first CSS framework |
| `@headlessui/react` | ^2.1 | Accessible modals, dropdowns, dialogs |
| `react-hook-form` | ^7.53 | Performant forms with validation |
| `zod` | ^3.23 | Schema validation for all forms |
| `@zxing/library` | ^0.21 | Barcode and QR code scanning (camera-based) |
| `react-barcode-scanner` | ^2.0 | React wrapper for ZXing |
| `recharts` | ^2.13 | Dashboard charts — stock trends, KPIs |
| `jspdf` | ^2.5 | PDF generation in browser |
| `jspdf-autotable` | ^3.8 | Table rendering inside jsPDF |
| `xlsx` | ^0.18 | Excel export (SheetJS) |
| `react-hot-toast` | ^2.4 | Toast notifications |
| `date-fns` | ^3.6 | Date formatting and arithmetic |
| `lucide-react` | ^0.451 | Icon library (consistent SVG icons) |

### Backend `/server`

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.21 | Web framework — routing, middleware |
| `mongoose` | ^8.7 | MongoDB ODM — schemas, models, virtuals |
| `jsonwebtoken` | ^9.0 | JWT signing and verification |
| `bcryptjs` | ^2.4 | Password hashing (salt rounds: 12) |
| `twilio` | ^5.3 | SMS OTP delivery for login/reset |
| `nodemailer` | ^6.9 | Email alerts for low stock notifications |
| `dotenv` | ^16.4 | Environment variable management |
| `cors` | ^2.8 | Cross-Origin Resource Sharing headers |
| `helmet` | ^8.0 | Security HTTP headers |
| `express-rate-limit` | ^7.4 | Rate limiting — OTP, login, API endpoints |
| `express-validator` | ^7.2 | Server-side request validation |
| `multer` | ^1.4 | File uploads for product images/imports |
| `pdfkit` | ^0.15 | Server-side PDF generation |
| `exceljs` | ^4.4 | Server-side Excel report generation |
| `node-cron` | ^3.0 | Scheduled jobs — low stock checks, reports |
| `winston` | ^3.15 | Structured logging (info/error/warn) |
| `morgan` | ^1.10 | HTTP request logging middleware |
| `compression` | ^1.7 | Gzip response compression |

---

## 2. Project Folder Structure

### Root Layout

```
coreinventory/
├── client/                   # React frontend
├── server/                   # Node.js backend
├── .env.example              # Template for environment variables
├── .gitignore
└── README.md
```

### Frontend `/client`

```
client/
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── store.js               # Redux store (RTK configure)
│   │   └── rootReducer.js
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── common/                # Button, Input, Modal, Badge, Table, Spinner
│   │   ├── layout/                # Sidebar, Topbar, PageWrapper
│   │   ├── scanner/               # BarcodeScanner.jsx
│   │   └── charts/                # KpiCard, StockChart
│   ├── features/
│   │   ├── auth/                  # authSlice.js, Login, Register, OtpVerify
│   │   ├── dashboard/             # dashboardSlice, DashboardPage
│   │   ├── products/              # productsSlice, ProductList, ProductForm
│   │   ├── receipts/              # receiptsSlice, ReceiptList, ReceiptForm
│   │   ├── deliveries/            # deliveriesSlice, DeliveryList, DeliveryForm
│   │   ├── transfers/             # transfersSlice, TransferList
│   │   ├── adjustments/           # adjustmentsSlice, AdjustmentForm
│   │   └── history/               # historySlice, LedgerTable
│   ├── hooks/
│   │   ├── useAuth.js             # Auth state + redirect
│   │   ├── usePermission.js       # Role-based permission hook
│   │   └── useScanner.js          # Camera + ZXing hook
│   ├── pages/                     # Route-level page components
│   ├── services/
│   │   └── api.js                 # Axios instance + interceptors
│   ├── utils/
│   │   ├── exportPdf.js           # jsPDF helpers
│   │   ├── exportExcel.js         # SheetJS helpers
│   │   └── validators.js          # Zod schemas
│   ├── App.jsx                    # Router + protected routes
│   └── main.jsx
├── tailwind.config.js
└── package.json
```

### Backend `/server`

```
server/
├── config/
│   ├── db.js                      # Mongoose connection
│   └── twilio.js                  # Twilio client init
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── receiptController.js
│   ├── deliveryController.js
│   ├── transferController.js
│   ├── adjustmentController.js
│   ├── ledgerController.js
│   └── reportController.js
├── middleware/
│   ├── authenticate.js            # JWT verify middleware
│   ├── authorize.js               # Role-based access control
│   ├── rateLimiter.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Warehouse.js
│   ├── Receipt.js
│   ├── Delivery.js
│   ├── Transfer.js
│   ├── Adjustment.js
│   └── StockLedger.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── receiptRoutes.js
│   ├── deliveryRoutes.js
│   ├── transferRoutes.js
│   ├── adjustmentRoutes.js
│   ├── ledgerRoutes.js
│   └── reportRoutes.js
├── jobs/
│   └── lowStockChecker.js         # node-cron job
├── services/
│   ├── smsService.js              # Twilio OTP
│   ├── emailService.js            # Nodemailer alerts
│   └── stockService.js            # Stock update logic
├── utils/
│   ├── generateOtp.js
│   └── apiResponse.js             # Standardised response wrapper
├── app.js                         # Express app setup
├── server.js                      # Entry point — listen
└── package.json
```

---

## 3. MongoDB Schemas

### 3.1 User

```js
// models/User.js
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  phone:      { type: String, required: true, unique: true },  // Twilio OTP target
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },                // bcrypt hashed
  role:       { type: String, enum: ['manager', 'staff'], default: 'staff' },
  otpCode:    { type: String },                                // hashed OTP
  otpExpiry:  { type: Date },                                  // +10 min TTL
  isActive:   { type: Boolean, default: true },
  lastLogin:  { type: Date },
}, { timestamps: true });
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Full display name |
| `phone` | String | Yes | Unique — Twilio OTP target |
| `email` | String | Yes | Unique — email alerts |
| `password` | String | Yes | bcrypt hashed, min 8 chars |
| `role` | String | Yes | `"manager"` \| `"staff"` |
| `otpCode` | String | No | bcrypt-hashed 6-digit OTP |
| `otpExpiry` | Date | No | 10-minute TTL |
| `isActive` | Boolean | Yes | Soft disable |
| `lastLogin` | Date | No | Updated on successful auth |

### 3.2 Product

```js
// models/Product.js
const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  sku:           { type: String, required: true, unique: true },
  barcode:       { type: String },                             // scanned via ZXing
  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  uom:           { type: String, required: true },             // kg, pcs, ltr, pairs...
  description:   { type: String },
  costPrice:     { type: Number },
  minStockLevel: { type: Number, required: true, default: 0 }, // alert threshold
  reorderQty:    { type: Number },
  image:         { type: String },                             // URL
  isActive:      { type: Boolean, default: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', sku: 'text' });           // text search
```

### 3.3 Warehouse

```js
// models/Warehouse.js
const warehouseSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  code:     { type: String, required: true, unique: true },   // e.g. WH-MAIN
  type:     { type: String, enum: ['primary', 'internal', 'secondary'], required: true },
  address:  { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

### 3.4 Receipt (Incoming)

```js
// models/Receipt.js
const lineSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  orderedQty:  { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  unitCost:    { type: Number },
});

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, unique: true },              // RCV-YYYYMMDD-NNN
  supplier:      { type: String, required: true },
  warehouse:     { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status:        { type: String, enum: ['draft','waiting','ready','done','canceled'], default: 'draft' },
  scheduledDate: { type: Date },
  validatedAt:   { type: Date },
  validatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lines:         [lineSchema],
  notes:         { type: String },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### 3.5 Delivery (Outgoing)

```js
// models/Delivery.js
const deliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, unique: true },             // DEL-YYYYMMDD-NNN
  customer:       { type: String, required: true },
  warehouse:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status:         { type: String, enum: ['draft','ready','done','canceled'], default: 'draft' },
  scheduledDate:  { type: Date },
  validatedAt:    { type: Date },
  validatedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lines: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:     { type: Number, required: true },
  }],
  notes:     { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### 3.6 Transfer (Internal)

```js
// models/Transfer.js
const transferSchema = new mongoose.Schema({
  transferNumber: { type: String, unique: true },             // INT-YYYYMMDD-NNN
  fromWarehouse:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toWarehouse:    { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status:         { type: String, enum: ['draft','ready','done','canceled'], default: 'draft' },
  scheduledDate:  { type: Date },
  validatedAt:    { type: Date },
  lines: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:     { type: Number, required: true },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### 3.7 Adjustment

```js
// models/Adjustment.js
const adjustmentSchema = new mongoose.Schema({
  adjustmentNumber: { type: String, unique: true },           // ADJ-YYYYMMDD-NNN
  reason:    { type: String, required: true },                // Damaged/Cycle count/Theft
  lines: [{
    product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    systemQty:  { type: Number, required: true },             // qty before adjustment
    countedQty: { type: Number, required: true },             // actual physical count
    delta:      { type: Number, required: true },             // countedQty - systemQty
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### 3.8 StockLedger (Immutable Audit Trail)

```js
// models/StockLedger.js
// ⚠️  NEVER update or delete ledger entries — immutable audit log
const stockLedgerSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse:     { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  movementType:  {
    type: String,
    enum: ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'],
    required: true
  },
  documentRef:   { type: String, required: true },            // e.g. RCV-001
  documentModel: { type: String, enum: ['Receipt','Delivery','Transfer','Adjustment'], required: true },
  qtyBefore:     { type: Number, required: true },
  qtyChange:     { type: Number, required: true },            // positive = in, negative = out
  qtyAfter:      { type: Number, required: true },
  performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:     { type: Date, default: Date.now, immutable: true },
});

stockLedgerSchema.index({ product: 1, warehouse: 1, createdAt: -1 });
stockLedgerSchema.index({ documentRef: 1 });
```

> **Rule:** Stock levels are always calculated by summing `qtyChange` in the ledger for a given `product + warehouse`. Never store a mutable running total.

---

## 4. API Routes — Full Reference

All routes are prefixed: `/api/v1`

### 4.1 Auth  `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register: name, email, phone, password |
| POST | `/send-otp` | None | Send 6-digit OTP via Twilio SMS |
| POST | `/verify-otp` | None | Verify OTP → issue accessToken + refreshToken |
| POST | `/login` | None | Email + password → triggers OTP send |
| POST | `/logout` | Bearer | Blacklist refresh token |
| POST | `/refresh` | RefreshToken | Issue new access token (15 min TTL) |
| POST | `/forgot-password` | None | Send OTP to registered phone |
| POST | `/reset-password` | None | Verify OTP + set new password |

### 4.2 Products  `/api/v1/products`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List all — filters: category, status, search, warehouse |
| GET | `/:id` | All | Single product with stock per location |
| POST | `/` | Manager | Create product |
| PUT | `/:id` | Manager | Update product details |
| DELETE | `/:id` | Manager | Soft delete (isActive = false) |
| GET | `/:id/stock` | All | Real-time stock per warehouse |
| GET | `/low-stock` | All | Products where stock ≤ minStockLevel |
| GET | `/scan/:barcode` | All | Find product by barcode — used by scanner |

### 4.3 Receipts  `/api/v1/receipts`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List — filter by status, date, supplier |
| POST | `/` | All | Create draft receipt |
| PUT | `/:id` | All | Update draft lines |
| POST | `/:id/validate` | Manager | **VALIDATE → stock +qty, write ledger** |
| POST | `/:id/cancel` | Manager | Cancel (only draft/waiting) |

### 4.4 Deliveries  `/api/v1/deliveries`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List — filter by status, customer |
| POST | `/` | All | Create delivery order |
| PUT | `/:id` | All | Update draft lines |
| POST | `/:id/validate` | Manager | **DISPATCH → stock −qty, write ledger** |
| POST | `/:id/cancel` | Manager | Cancel delivery |

### 4.5 Transfers  `/api/v1/transfers`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List internal transfers |
| POST | `/` | All | Create transfer (from, to, lines) |
| PUT | `/:id` | All | Update draft |
| POST | `/:id/validate` | Manager | **Execute — deduct source, add dest, write 2 ledger entries** |

### 4.6 Adjustments  `/api/v1/adjustments`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List all adjustments |
| POST | `/` | Manager | Create + immediately apply, write ledger |

### 4.7 Ledger  `/api/v1/ledger`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | Query ledger — filter by product, warehouse, type, date range |
| GET | `/summary` | All | Current stock per product per warehouse (aggregation) |

### 4.8 Reports  `/api/v1/reports`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stock-summary` | Total stock per product per warehouse — JSON |
| GET | `/stock-summary/pdf` | Downloadable PDF (pdfkit) |
| GET | `/stock-summary/excel` | Downloadable XLSX (exceljs) |
| GET | `/movement-history` | Ledger filtered by date + product — JSON |
| GET | `/movement-history/pdf` | PDF version |
| GET | `/movement-history/excel` | Excel with multiple sheets |
| GET | `/low-stock-report` | All items below minStockLevel — JSON + PDF + XLSX |

### 4.9 Settings  `/api/v1/settings`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET/POST/PUT | `/warehouses` | Manager | CRUD warehouses |
| GET/POST/PUT | `/categories` | Manager | CRUD product categories |
| GET/POST/PUT | `/users` | Manager | List + manage users |

---

## 5. Authentication & Authorization

### 5.1 Login + OTP Flow

```
User                      Server                         Twilio
 │                            │                              │
 │── POST /auth/login ────────▶│                              │
 │   { email, password }      │ bcrypt.compare()             │
 │                            │ generate 6-digit OTP         │
 │                            │ hash OTP → save to user doc  │
 │                            │── sendSMS(phone, otp) ───────▶│
 │                            │                              │── SMS ──▶ User phone
 │◀── 200 { message: "OTP sent" } ──│
 │                            │
 │── POST /auth/verify-otp ───▶│
 │   { phone, otp }           │ check otpExpiry > now
 │                            │ bcrypt.compare(otp, user.otpCode)
 │◀── 200 { accessToken, user } ──│
 │   (refreshToken → httpOnly cookie)
```

**Token strategy:**

```
accessToken   →  Redux state (memory only)  →  15 min TTL
refreshToken  →  httpOnly cookie            →  7 day TTL
```

**Axios interceptor (auto-refresh):**

```js
// src/services/api.js
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const { data } = await api.post('/auth/refresh');
      store.dispatch(setToken(data.accessToken));
      err.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(err.config);
    }
    return Promise.reject(err);
  }
);
```

### 5.2 Middleware

```js
// middleware/authenticate.js
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// middleware/authorize.js
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden — insufficient role' });
  next();
};

// Usage in routes:
router.post('/:id/validate', authenticate, authorize('manager'), validateReceipt);
```

### 5.3 Role Permissions Matrix

| Action | Manager | Staff |
|---|---|---|
| View dashboard & KPIs | ✅ | ✅ |
| View product list & stock | ✅ | ✅ |
| Create / edit products | ✅ | ❌ |
| Create receipts / deliveries / transfers | ✅ | ✅ |
| VALIDATE (approve) operations | ✅ | ❌ |
| Apply stock adjustments | ✅ | ❌ |
| View stock ledger / history | ✅ | ✅ |
| Export PDF / Excel reports | ✅ | ❌ |
| Manage warehouses & categories | ✅ | ❌ |
| Manage users | ✅ | ❌ |

### 5.4 Rate Limiting

```js
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.otpLimiter   = rateLimit({ windowMs: 60*60*1000, max: 3,   message: 'Too many OTP requests' });
exports.loginLimiter = rateLimit({ windowMs: 60*60*1000, max: 10,  message: 'Too many login attempts' });
exports.apiLimiter   = rateLimit({ windowMs: 15*60*1000, max: 200, message: 'Rate limit exceeded' });
```

---

## 6. Redux State Architecture

### 6.1 Store Shape

```js
// src/app/store.js
{
  auth: {
    user: { id, name, email, phone, role },
    accessToken: String,
    isAuthenticated: Boolean,
    loading: Boolean,
    error: String | null
  },
  products: {
    items: [],
    selectedProduct: Object | null,
    filters: { search: '', category: 'all', status: 'all', warehouse: 'all' },
    pagination: { page: 1, total: 0, limit: 20 },
    loading: Boolean,
    error: String | null
  },
  receipts:    { items: [], selected: null, filters: {}, loading: false, error: null },
  deliveries:  { items: [], selected: null, filters: {}, loading: false, error: null },
  transfers:   { items: [], selected: null, loading: false, error: null },
  adjustments: { items: [], loading: false, error: null },
  ledger:      { entries: [], filters: {}, pagination: {}, loading: false },
  dashboard:   { kpis: {}, recentActivity: [], loading: false },
  ui:          { sidebarOpen: true, activeModal: null, toast: null }
}
```

### 6.2 Auth Slice

```js
// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/verify-otp', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isAuthenticated: false, loading: false, error: null },
  reducers: {
    setToken: (state, { payload }) => { state.accessToken = payload; },
    logout:   (state) => { state.user = null; state.accessToken = null; state.isAuthenticated = false; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.rejected,   (state, { payload }) => { state.loading = false; state.error = payload?.message; })
      .addCase(verifyOtp.fulfilled,  (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
      });
  }
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 6.3 Products Slice (pattern)

```js
// src/features/products/productsSlice.js
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters, { rejectWithValue }) => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  }
);

export const validateReceipt = createAsyncThunk(
  'receipts/validate',
  async (id, { rejectWithValue }) => {
    const { data } = await api.post(`/receipts/${id}/validate`);
    return data;                      // returns updated receipt + affected product stocks
  }
);
```

### 6.4 Protected Route

```jsx
// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

// Usage in App.jsx:
<Route path="/adjustments" element={
  <ProtectedRoute roles={['manager']}>
    <AdjustmentsPage />
  </ProtectedRoute>
} />
```

---

## 7. Key Feature Implementation

### 7.1 Barcode / QR Scanning

```js
// src/hooks/useScanner.js
import { BrowserMultiFormatReader } from '@zxing/library';
import { useEffect, useRef, useState } from 'react';

export function useScanner(onResult) {
  const videoRef = useRef(null);
  const readerRef = useRef(new BrowserMultiFormatReader());
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScan = async () => {
    setError(null);
    setScanning(true);
    try {
      await readerRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          onResult(result.getText());
          stopScan();
        }
      });
    } catch (e) {
      setError('Camera access denied');
      setScanning(false);
    }
  };

  const stopScan = () => {
    readerRef.current.reset();
    setScanning(false);
  };

  useEffect(() => () => readerRef.current.reset(), []);

  return { videoRef, scanning, error, startScan, stopScan };
}
```

```jsx
// src/components/scanner/BarcodeScanner.jsx
import { useScanner } from '../../hooks/useScanner';
import { useDispatch } from 'react-redux';
import api from '../../services/api';

export function BarcodeScanner({ onFound }) {
  const dispatch = useDispatch();
  const { videoRef, scanning, error, startScan, stopScan } = useScanner(async (code) => {
    const { data } = await api.get(`/products/scan/${code}`);
    onFound(data);                    // pass product back to parent form
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {scanning && <video ref={videoRef} className="w-full rounded-lg border" />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={scanning ? stopScan : startScan}
        className="btn btn-outline text-sm"
      >
        {scanning ? 'Stop Scanner' : 'Scan Barcode / QR'}
      </button>
    </div>
  );
}
```

### 7.2 Validate Receipt — Stock Service

```js
// server/services/stockService.js
const StockLedger = require('../models/StockLedger');

// Get current stock for a product in a warehouse
async function getCurrentStock(productId, warehouseId) {
  const result = await StockLedger.aggregate([
    { $match: { product: productId, warehouse: warehouseId } },
    { $group: { _id: null, total: { $sum: '$qtyChange' } } }
  ]);
  return result[0]?.total ?? 0;
}

// Write a ledger entry (called inside transaction)
async function writeEntry(session, { product, warehouse, movementType, documentRef, documentModel, qtyChange, performedBy }) {
  const qtyBefore = await getCurrentStock(product, warehouse);
  const qtyAfter  = qtyBefore + qtyChange;
  await StockLedger.create([{
    product, warehouse, movementType, documentRef, documentModel,
    qtyBefore, qtyChange, qtyAfter, performedBy
  }], { session });
  return qtyAfter;
}

module.exports = { getCurrentStock, writeEntry };
```

```js
// server/controllers/receiptController.js — validateReceipt
exports.validateReceipt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receipt = await Receipt.findById(req.params.id).session(session);
    if (!receipt || receipt.status === 'done')
      return res.status(400).json({ message: 'Already validated or not found' });

    for (const line of receipt.lines) {
      line.receivedQty = line.orderedQty;
      await writeEntry(session, {
        product:       line.product,
        warehouse:     receipt.warehouse,
        movementType:  'receipt',
        documentRef:   receipt.receiptNumber,
        documentModel: 'Receipt',
        qtyChange:     +line.receivedQty,
        performedBy:   req.user.id,
      });
    }

    receipt.status      = 'done';
    receipt.validatedAt = new Date();
    receipt.validatedBy = req.user.id;
    await receipt.save({ session });
    await session.commitTransaction();

    res.json({ message: 'Receipt validated', receipt });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
```

### 7.3 PDF Export (Client-side)

```js
// src/utils/exportPdf.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function exportStockReport(products, warehouses) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(26, 107, 60);
  doc.text('CoreInventory — Stock Report', 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 22);

  const headers = ['Product', 'SKU', 'Category', ...warehouses.map(w => w.name), 'Total', 'Status'];
  const rows = products.map(p => {
    const total = warehouses.reduce((sum, w) => sum + (p.stockMap?.[w._id] ?? 0), 0);
    const status = total === 0 ? 'Out of Stock' : total <= p.minStockLevel ? 'Low Stock' : 'In Stock';
    return [p.name, p.sku, p.category?.name, ...warehouses.map(w => p.stockMap?.[w._id] ?? 0), total, status];
  });

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows,
    styles:          { fontSize: 8, cellPadding: 2 },
    headStyles:      { fillColor: [26, 107, 60], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 244] },
    columnStyles:    { [headers.length - 1]: { fontStyle: 'bold' } },
    didDrawCell: (data) => {
      if (data.column.index === headers.length - 1 && data.section === 'body') {
        const val = data.cell.raw;
        if (val === 'Out of Stock') doc.setTextColor(185, 28, 28);
        else if (val === 'Low Stock') doc.setTextColor(180, 83, 9);
        else doc.setTextColor(26, 107, 60);
      }
    }
  });

  doc.save(`stock-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
```

### 7.4 Excel Export (Client-side)

```js
// src/utils/exportExcel.js
import * as XLSX from 'xlsx';

export function exportStockExcel(products, warehouses) {
  const headers = ['Product', 'SKU', 'Category', 'UOM', ...warehouses.map(w => w.name), 'Total', 'Min Level', 'Status'];

  const rows = products.map(p => {
    const total = warehouses.reduce((sum, w) => sum + (p.stockMap?.[w._id] ?? 0), 0);
    return [
      p.name, p.sku, p.category?.name, p.uom,
      ...warehouses.map(w => p.stockMap?.[w._id] ?? 0),
      total, p.minStockLevel,
      total === 0 ? 'Out of Stock' : total <= p.minStockLevel ? 'Low Stock' : 'In Stock'
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((_, i) => ({ wch: i === 0 ? 30 : 14 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Summary');
  XLSX.writeFile(wb, `stock-report-${new Date().toISOString().slice(0,10)}.xlsx`);
}
```

### 7.5 Low Stock Email Alert (Cron Job)

```js
// server/jobs/lowStockChecker.js
const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const StockLedger = require('../models/StockLedger');
const { sendLowStockAlert } = require('../services/emailService');

async function getTotalStock(productId) {
  const result = await StockLedger.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, total: { $sum: '$qtyChange' } } }
  ]);
  return result[0]?.total ?? 0;
}

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  const products = await Product.find({ isActive: true }).populate('category');
  const flagged  = [];

  for (const p of products) {
    const stock = await getTotalStock(p._id);
    if (stock <= p.minStockLevel) flagged.push({ ...p.toObject(), currentStock: stock });
  }

  if (!flagged.length) return;

  const managers = await User.find({ role: 'manager', isActive: true });
  for (const manager of managers) {
    await sendLowStockAlert(manager.email, manager.name, flagged);
  }

  console.log(`[LowStockJob] Alert sent for ${flagged.length} items to ${managers.length} managers`);
});
```

```js
// server/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

exports.sendLowStockAlert = async (to, name, items) => {
  const rows = items.map(p =>
    `<tr>
      <td>${p.name}</td><td>${p.sku}</td>
      <td style="color:#b45309">${p.currentStock} ${p.uom}</td>
      <td>${p.minStockLevel} ${p.uom}</td>
    </tr>`
  ).join('');

  await transporter.sendMail({
    from:    process.env.ALERT_FROM,
    to,
    subject: `⚠ CoreInventory — ${items.length} item(s) low on stock`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>Hi ${name}, the following items are at or below their minimum stock level:</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        <tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>Min Level</th></tr>
        ${rows}
      </table>
      <p>Please review and reorder as needed.</p>
    `
  });
};
```

### 7.6 Stock Summary Aggregation (Dashboard)

```js
// server/controllers/ledgerController.js
exports.getStockSummary = async (req, res) => {
  const summary = await StockLedger.aggregate([
    {
      $group: {
        _id: { product: '$product', warehouse: '$warehouse' },
        currentStock: { $sum: '$qtyChange' }
      }
    },
    {
      $lookup: { from: 'products',   localField: '_id.product',   foreignField: '_id', as: 'product' }
    },
    {
      $lookup: { from: 'warehouses', localField: '_id.warehouse', foreignField: '_id', as: 'warehouse' }
    },
    { $unwind: '$product' },
    { $unwind: '$warehouse' },
    {
      $project: {
        product:      '$product.name',
        sku:          '$product.sku',
        warehouse:    '$warehouse.name',
        currentStock: 1,
        minLevel:     '$product.minStockLevel',
        uom:          '$product.uom',
      }
    },
    { $sort: { product: 1, warehouse: 1 } }
  ]);

  res.json(summary);
};
```

---

## 8. Environment Variables

```env
# ── Server
NODE_ENV=development
PORT=5000

# ── MongoDB
MONGO_URI=mongodb://localhost:27017/coreinventory

# ── JWT
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# ── Nodemailer (SMTP for email alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
ALERT_FROM=no-reply@coreinventory.com

# ── Client (Vite)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 9. Build Sprint Plan

| Week | Module | Deliverables |
|---|---|---|
| **1** | Foundation | Mono-repo setup, Express + MongoDB boilerplate, all Mongoose models, JWT middleware skeleton, Tailwind + Vite config, Redux store + slice skeletons |
| **2** | Auth | Register, Login, Twilio OTP send/verify, OTP password reset, protected routes, role guards, `authSlice`, Axios interceptor |
| **3** | Products | Product CRUD endpoints, `productsSlice`, ProductList page with search + filters, ProductForm modal, barcode scanner hook + scan-to-find, Category + Warehouse CRUD, stock per location endpoint |
| **4** | Operations | Receipts (create → validate → stock++), Deliveries (create → validate → stock--), Internal Transfers, Stock Adjustment, `StockLedger` write on every operation with Mongoose transactions, Dashboard KPI endpoint |
| **5** | Reports & Alerts | PDF export (jsPDF + autotable), Excel export (SheetJS), low-stock cron + Nodemailer, Move History ledger page with filters, Dashboard charts (Recharts) |
| **6** | Polish & RBAC | Role enforcement on all Manager actions, form validation (react-hook-form + zod), error boundaries, loading skeletons, toast notifications, production build |

> **Tip — Week 4:** Write integration tests for all `/validate` endpoints before shipping. A bug there corrupts stock levels silently.

> **Tip — RBAC:** Wire `authorize()` middleware from Day 1 of Week 2 even if all routes are temporarily open. Retrofitting role checks across 20+ routes in Week 6 is error-prone.

---

## Quick Start

```bash
# 1. Clone and setup
git clone <repo> && cd coreinventory
cp .env.example .env        # fill in your keys

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Init Tailwind
cd client && npx tailwindcss init -p

# 4. Start dev servers (two terminals)
cd server && node server.js          # → http://localhost:5000
cd client && npm run dev             # → http://localhost:5173
```

---

*CoreInventory Architecture Blueprint — v1.0 — March 2026*
