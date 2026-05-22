# 🖥️ LaptopZone — Full Stack E-Commerce Platform

> India's #1 Laptop Store | Built with React + Node.js + MongoDB Atlas | DevOps with GitHub Actions + Kubernetes + AWS + Prometheus + Grafana

---

## 📋 Table of Contents
- [Architecture Overview](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Local Development Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker)
- [GitHub Actions CI/CD Pipeline](#cicd)
- [Kubernetes (Kustomize) Orchestration](#kubernetes)
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

GitHub Actions ──► Build & Test ──► Push to GHCR ──► SSH Deploy / AWS ECS

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
| GitHub Actions | 8-job enterprise-grade pipeline |
| Kubernetes (Kustomize) | Declarative Staging & Production orchestration |
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
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # 8-job enterprise GitHub Actions pipeline
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
├── k8s/                        # Production-grade Kubernetes Orchestration
│   ├── base/                   # Universal blueprints (Deployments, Services, ConfigMaps)
│   └── overlays/               # Environment variations (Staging, Production)
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
└── README.md                   # Project documentation
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
git clone https://github.com/ShelarAtharva404/laptopzone.git
cd laptopzone

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

## 🔄 GitHub Actions CI/CD Pipeline <a name="cicd"></a>

The `.github/workflows/ci-cd.yml` defines a production-grade **8-job continuous integration and deployment pipeline**:

```
[Validate (Backend/Frontend)] ──► [Test (Backend/Frontend)] ──► [Build & Push (GHCR)]
                                                                          │
 ┌────────────────────────────────────────────────────────────────────────┘
 │
 ├──► [Security (Trivy Scan / NPM Audit)]
 │
 ├──► [Deploy Staging (SSH)] ──► [Integration Tests (Curl Staging)]
 │
 └──► [Deploy Production (SSH - Blue/Green)] ──► [Deploy AWS ECS] ──► [Notify (Slack)]
```

### CI/CD Workflow Stages

| Stage | Jobs | Description |
|-------|------|-------------|
| **Validate** | `validate-backend`, `validate-frontend` | Installs dependencies with strict lockfile checks (`npm ci`) to guarantee clean base builds. |
| **Test** | `test-backend`, `test-frontend` | Spins up a MongoDB 7.0 container in-pipeline to run backend health validation, and compiles the React application to verify zero compilation breaks. |
| **Build & Push** | `build` | Builds multi-platform optimized Docker images, caches layers using GitHub Actions cache (`type=gha`), downcases repository naming variables, and pushes tagged images to GitHub Container Registry (GHCR). |
| **Security** | `security-scan-backend`, `dependency-audit` | Performs static security container analysis via Aqua Security `Trivy` (failing the build on CRITICAL vulnerabilities) and audits npm packages. |
| **Deploy Staging** | `deploy-staging` | Automatically triggers on pushes to the `develop` branch. Authenticates with GHCR on the staging host, pulls the target tags, and does rolling zero-downtime container swaps. |
| **Integration Test**| `integration-test-staging` | Validates endpoint availability and performs API smoke tests against the active staging environment. |
| **Deploy Production**| `deploy-production` | Triggered on pushes to the `main` branch or release tags. Executes an automated Blue-Green container swap (backing up previous compose settings, scaling up new instances, verifying local health, and safely pruning old images). |
| **Deploy AWS ECS** | `deploy-aws-ecs` | Deploys release versions to AWS ECS Fargate clusters automatically upon git tag creation. |
| **Notify** | `notify` | Dispatches dynamic Slack cards detailing build results, short commit SHA, author handles, and execution summaries. |

### Required Repository Secrets
To execute this pipeline successfully, navigate to **Settings → Secrets and Variables → Actions** in your GitHub repository and declare:

| Secret | Description |
|---------|-------------|
| `STAGING_HOST` | IP/domain name of your staging server |
| `STAGING_USER` | SSH administrative username for staging (e.g. `ubuntu`) |
| `STAGING_SSH_PRIVATE_KEY` | Private SSH key authorized for remote access on staging |
| `PROD_HOST` | IP/domain name of your production server |
| `PROD_USER` | SSH administrative username for production |
| `PROD_SSH_PRIVATE_KEY` | Private SSH key authorized for remote access on production |
| `AWS_ACCESS_KEY_ID` | AWS service account key for ECS orchestrations |
| `AWS_SECRET_ACCESS_KEY` | AWS service account secret key |
| `SLACK_WEBHOOK_URL` | Incoming Slack webhook endpoint for notification logs |
| `VITE_API_URL` | API Gateway base URL injected into the React static files at build time |
| `KUBERNETES_KUBE_CONFIG` | Complete YAML content of your cluster's `.kube/config` (or service account credentials) |

---

## ☸️ Kubernetes (Kustomize) Orchestration <a name="kubernetes"></a>

We manage environment configurations declaratively using **Kustomize** within the `/k8s` directory. This ensures a clean separation between the base templates and environment overlays without manifest duplication.

### Architecture Structure

- **`k8s/base`**: Standard blueprints mapping base resources:
  - `backend-deployment.yaml`: Rolling update strategy, liveness/readiness health probes, resource requests/limits, and secure non-root user security context.
  - `backend-service.yaml`: ClusterIP service exposing the API on port `5000`.
  - `frontend-deployment.yaml` & `frontend-service.yaml`: Serving the React client application on port `80`.
  - `configmap.yaml` & `kustomization.yaml`: Baseline config configurations.
- **`k8s/overlays/staging`**:
  - Sets staging-specific properties.
  - Overrides replicas to `1` (conserves resources on smaller environments).
  - Appends `-staging` name suffix to all resources.
- **`k8s/overlays/production`**:
  - Overrides baseline configuration to `2` minimum replicas for high availability.
  - Appends `-prod` name suffix to resources.
  - Attaches **HorizontalPodAutoscalers** (`hpa.yaml`) scaling backend containers between `2` and `10` pods dynamically based on CPU/Memory usage.
  - Configures ingress routing rules (`ingress.yaml`) mapped with `cert-manager` for automatic Let's Encrypt SSL terminations.

### Manifest Verification

You can dry-run and compile the unified environment manifests locally to confirm they compile with no errors:

```bash
# Validate Staging Manifest
kubectl kustomize k8s/overlays/staging

# Validate Production Manifest
kubectl kustomize k8s/overlays/production
```

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
  -var="backend_image=ghcr.io/shelaratharva404/laptopzone/backend:latest" \
  -var="frontend_image=ghcr.io/shelaratharva404/laptopzone/frontend:latest" \
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
