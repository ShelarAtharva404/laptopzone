# 🖥️ LaptopZone — Full Stack E-Commerce Platform

> India's #1 Laptop Store | Built with React + Node.js + MongoDB Atlas | DevOps with GitLab CI/CD + AWS + Prometheus + Grafana

---

## 📋 Table of Contents
- [Architecture Overview](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Local Development Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker)
- [GitLab CI/CD Pipeline](#cicd)
- [AWS Deployment](#aws)
- [Monitoring: Prometheus + Grafana](#monitoring)
- [Admin Panel](#admin-panel)
- [API Reference](#api)

---

## 🏗️ Architecture Overview <a name="architecture"></a>

```
                    ┌─────────────────┐
                    │   CloudFront    │  CDN + SSL Termination
                    │   (aws CDN)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  AWS ALB        │  Load Balancer (Mumbai ap-south-1)
                    └────┬───────┬───┘
                         │       │
              ┌──────────▼─┐  ┌──▼──────────┐
              │  ECS Frontend│  │ ECS Backend │  (Fargate + Auto-scaling)
              │  Nginx+React │  │  Node.js    │
              └─────────────┘  └──────┬──────┘
                                      │
                             ┌────────▼────────┐
                             │  MongoDB Atlas  │  Database (Cloud)
                             │  (Mumbai)       │
                             └─────────────────┘

GitLab CI/CD ──► Build & Test ──► Push to ECR ──► Deploy to ECS

Prometheus ──► Scrape metrics ──► Grafana Dashboards + Alerts
```

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI Framework & Build Tool |
| React Router v6 | Client-side routing |
| Zustand | State management (auth, cart, wishlist) |
| Recharts | Admin analytics charts |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| Axios | HTTP client with interceptors |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 20 + Express | REST API server |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM with full schema validation |
| JWT | Authentication & authorization |
| bcryptjs | Password hashing |
| prom-client | Prometheus metrics |
| Nodemailer | Email notifications |
| Stripe | Payment processing |
| Helmet | Security headers |
| Morgan | HTTP request logging |

### DevOps & Cloud
| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Containerization |
| GitLab CI/CD | 7-stage automated pipeline |
| AWS ECS Fargate | Container orchestration |
| AWS ALB | Load balancing |
| AWS CloudFront | CDN & global delivery |
| AWS Route 53 | DNS management |
| AWS S3 | Static assets & logs |
| AWS ACM | SSL/TLS certificates |
| Terraform | Infrastructure as Code |
| Prometheus | Metrics collection |
| Grafana | Monitoring dashboards |

---

## 📁 Project Structure <a name="project-structure"></a>

```
laptop-store/
├── backend/                    # Node.js REST API
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── analyticsController.js
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── models.js           # Category, Review, Coupon, Notification
│   ├── routes/                 # Express routes
│   ├── middleware/
│   │   └── auth.js             # JWT protect & authorize
│   ├── utils/
│   │   ├── email.js            # Nodemailer helper
│   │   └── seeder.js           # Admin & category seed
│   ├── server.js               # Entry point + Prometheus metrics
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/         # Navbar, Footer, MainLayout
│   │   │   ├── user/           # ProductCard
│   │   │   └── admin/          # AdminLayout
│   │   ├── pages/
│   │   │   ├── user/           # Home, Products, ProductDetail, Cart, etc.
│   │   │   └── admin/          # Dashboard, Products, Orders, Users, etc.
│   │   ├── store/
│   │   │   └── authStore.js    # Zustand: auth, cart, wishlist stores
│   │   ├── utils/
│   │   │   └── api.js          # Axios instance + helpers
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Design system CSS
│   ├── Dockerfile
│   └── nginx.conf
│
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml      # Scrape configs
│   │   └── alerts.yml          # Alerting rules
│   └── grafana/
│       ├── provisioning/       # Auto-provision datasources & dashboards
│       └── dashboards/         # Pre-built JSON dashboards
│
├── nginx/
│   └── nginx.conf              # Production reverse proxy
│
├── terraform/
│   └── main.tf                 # Complete AWS infrastructure
│
├── docker-compose.yml          # Full stack local environment
└── .gitlab-ci.yml              # 7-stage CI/CD pipeline
```

---

## 🗄️ Database Schema <a name="database-schema"></a>

### Collections

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| **users** | Customer accounts | name, email, password, role, cart[], wishlist[], addresses[], loyaltyPoints |
| **products** | Laptop catalog | name, brand, specifications{processor,ram,display,graphics,battery,...}, price, stock, ratings |
| **orders** | Purchase records | orderNumber, items[], shippingAddress, pricing, payment, status, timeline[] |
| **categories** | Product categories | name, slug, parent, sortOrder |
| **reviews** | Product reviews | product, user, rating, comment, isVerifiedPurchase |
| **coupons** | Discount codes | code, type, value, validUntil, usageLimit |
| **notifications** | User notifications | user, type, title, message, isRead |

### Product Specification Schema (Comprehensive)
```
specifications: {
  processor: { brand, model, cores, threads, baseSpeed, boostSpeed, cache, generation }
  ram:        { size, type, speed, slots, maxUpgradeable }
  storage:    [{ type, capacity, speed, interface }]
  display:    { size, resolution, type, refreshRate, brightness, colorGamut, touchscreen, hdr }
  graphics:   { type, brand, model, vram }
  battery:    { capacity, life, fastCharging, chargerWatt }
  ports:      { usb_a, usb_c, thunderbolt, hdmi, sdCard, ethernet, headphone }
  wireless:   { wifi, bluetooth, cellular }
  physical:   { weight, thickness, width, depth, material, color }
  keyboard:   { backlit, backlitType, numpad }
  os, webcam, fingerprint, faceRecognition, speakers
}
```

---

## 🚀 Local Development Setup <a name="local-setup"></a>

### Prerequisites
- Node.js 20+
- Docker Desktop
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
git clone https://gitlab.com/your-org/laptop-store.git
cd laptop-store

# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 3. Using Docker Compose (Recommended)

```bash
# Start all services including Prometheus + Grafana
docker-compose up -d

# Services:
# Frontend:   http://localhost:80
# Backend:    http://localhost:5000
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3000 (admin / laptopzone_grafana_2024)
```

---

## 🔐 Environment Variables <a name="environment-variables"></a>

Create `backend/.env` from `.env.example`:

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/laptopstore
JWT_SECRET=your-32-char-minimum-secret-key-here
PORT=5000
NODE_ENV=production
CLIENT_URL=https://laptopzone.com

# Admin seed
ADMIN_EMAIL=admin@laptopzone.com
ADMIN_PASSWORD=Admin@123456

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🐳 Docker <a name="docker"></a>

```bash
# Build images
docker build -t laptopzone-backend ./backend
docker build -t laptopzone-frontend ./frontend

# Run full stack
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale backend instances
docker-compose up -d --scale backend=3

# Stop all
docker-compose down
```

---

## 🔄 GitLab CI/CD Pipeline <a name="cicd"></a>

The `.gitlab-ci.yml` defines a **7-stage pipeline**:

```
validate → test → build → security → deploy-staging → integration-test → deploy-production
```

| Stage | Jobs | Description |
|-------|------|-------------|
| **validate** | lint-backend, lint-frontend | Dependency validation |
| **test** | test-backend, test-frontend | Unit tests + build verification |
| **build** | build-backend-image, build-frontend-image | Docker builds + push to GitLab Registry |
| **security** | security-scan-backend, dependency-audit | Trivy container scan + npm audit |
| **deploy-staging** | deploy-staging | Auto deploy to staging environment |
| **integration-test** | integration-test-staging | API health + smoke tests |
| **deploy-production** | deploy-production *(manual)* | Manual approval required for prod |

### Required GitLab CI Variables
Set in **Settings → CI/CD → Variables**:

| Variable | Description |
|---------|-------------|
| `STAGING_SSH_PRIVATE_KEY` | SSH key for staging server |
| `STAGING_HOST` | Staging server IP/hostname |
| `STAGING_USER` | SSH username |
| `PROD_SSH_PRIVATE_KEY` | SSH key for production |
| `PROD_HOST` | Production server IP |
| `PROD_USER` | SSH username |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |
| `VITE_API_URL` | Frontend API base URL |

---

## ☁️ AWS Deployment <a name="aws"></a>

### Architecture
- **ECS Fargate** — Serverless containers (no EC2 management)
- **ALB** — Load balancer with health checks
- **CloudFront** — CDN for global performance
- **Route 53** — DNS with alias records
- **ACM** — Free SSL certificates
- **S3** — Static assets + ALB access logs
- **SSM** — Secure secret storage
- **CloudWatch** — Logs + alerting

### Terraform Deployment

```bash
cd terraform

# Initialize
terraform init

# Plan
terraform plan \
  -var="backend_image=registry.gitlab.com/org/app/backend:latest" \
  -var="frontend_image=registry.gitlab.com/org/app/frontend:latest" \
  -var="mongodb_uri=$MONGODB_URI" \
  -var="jwt_secret=$JWT_SECRET"

# Apply (creates all AWS resources)
terraform apply

# Destroy (cleanup)
terraform destroy
```

### Auto-scaling
Backend scales **2 → 10 instances** based on:
- CPU usage > 70% → scale out
- Memory usage > 80% → scale out
- Both support **FARGATE_SPOT** for 70% cost savings

---

## 📊 Monitoring: Prometheus + Grafana <a name="monitoring"></a>

### Prometheus Metrics (collected from `/metrics`)

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method/route/status |
| `http_request_duration_seconds` | Histogram | Request duration distribution |
| `process_cpu_user_seconds_total` | Counter | CPU usage |
| `process_resident_memory_bytes` | Gauge | Memory usage |
| `nodejs_active_handles_total` | Gauge | Active connections |

### Grafana Dashboards
Access at `http://localhost:3000` (admin / laptopzone_grafana_2024)

Pre-built dashboards:
- **LaptopZone Overview** — Request rate, error rate, latency, CPU, memory, disk
- **Node.js Runtime** — GC, event loop, heap usage
- **MongoDB** — Query performance, connections, operations

### Alerting Rules
Critical alerts configured:
- 🚨 API Down (> 1 minute)
- 🚨 Error rate > 15%
- ⚠️ Error rate > 5%
- ⚠️ P95 latency > 2s
- 🚨 CPU > 95%
- ⚠️ Memory > 85%
- ⚠️ Disk > 80%
- 🚨 Website unreachable
- ⚠️ SSL cert expiring < 14 days

---

## 👑 Admin Panel <a name="admin-panel"></a>

Access at `/admin` (requires admin role)

Default credentials:
- Email: `admin@laptopzone.com`
- Password: `Admin@123456`

### Admin Features
| Section | Features |
|---------|---------|
| **Dashboard** | Revenue stats, order counts, top products, revenue charts, order status pie |
| **Products** | Full CRUD, bulk visibility toggle, stock management, image upload |
| **Product Form** | 5-section form: Basic, Pricing, Specifications, Images, Features/Tags |
| **Orders** | Status pipeline, shipping tracking, order timeline |
| **Users** | Customer list, activate/deactivate, order history |
| **Categories** | Add/edit/delete product categories |
| **Coupons** | Create % or fixed coupons, usage tracking |
| **Analytics** | Revenue & orders over time, daily trend charts |

---

## 📡 API Reference <a name="api"></a>

Base URL: `https://laptopzone.com/api`

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login + get JWT |
| GET | `/auth/me` | User | Get profile |
| PUT | `/auth/profile` | User | Update profile |
| PUT | `/auth/change-password` | User | Change password |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password/:token` | Public | Reset password |
| POST | `/auth/address` | User | Add address |
| DELETE | `/auth/address/:id` | User | Remove address |

### Product Endpoints
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/products` | Public | List with filters & pagination |
| GET | `/products/featured` | Public | Featured laptops |
| GET | `/products/bestsellers` | Public | Best selling |
| GET | `/products/new-arrivals` | Public | New products |
| GET | `/products/:slug` | Public | Product detail |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Deactivate product |
| PATCH | `/products/:id/stock` | Admin | Update stock |

### Order Endpoints
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/orders` | User | Place order |
| GET | `/orders/my` | User | My orders |
| GET | `/orders/:id` | User | Order detail |
| POST | `/orders/:id/cancel` | User | Cancel order |
| GET | `/orders/admin/all` | Admin | All orders |
| PUT | `/orders/:id/status` | Admin | Update status |

### Filter Parameters (GET /products)
```
?search=macbook
&brand=Apple,Dell
&minPrice=30000&maxPrice=100000
&ram=16,32
&storage=512,1024
&gpu=NVIDIA
&displaySize=15,16
&subcategory=Gaming Laptops
&sort=price_asc|price_desc|rating|newest|popular|discount
&inStock=true
&page=1&limit=12
```

---

## 🔧 Scripts

```bash
# Backend
npm run dev        # Development with nodemon
npm start          # Production
npm test           # Run tests

# Frontend
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview build

# Docker
docker-compose up -d          # Start all services
docker-compose down           # Stop all
docker-compose logs -f        # Follow logs
docker-compose ps             # Service status

# Terraform
terraform plan    # Preview changes
terraform apply   # Deploy infrastructure
terraform destroy # Tear down
```

---

## 📱 Responsive Design

Fully responsive for all screen sizes:
- **Mobile** (< 640px) — 2-column product grid, mobile nav drawer, stacked checkout
- **Tablet** (640–1024px) — Adaptive layouts, collapsible filters
- **Desktop** (> 1024px) — Full sidebar, multi-column grids

---

## 🚀 Performance

- **Frontend**: Code splitting, lazy loading, image optimization via CDN
- **Backend**: Mongoose query optimization, text indexes, compound indexes
- **CDN**: CloudFront caches static assets for 1 year, API for 0s
- **Database**: MongoDB Atlas with connection pooling
- **Compression**: Gzip on all responses

---

## 📄 License
MIT © 2024 LaptopZone
