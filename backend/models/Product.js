const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  // Processor
  processor: {
    brand: String,        // Intel, AMD, Apple
    model: String,        // Core i9-13900H, Ryzen 9 7945HX, M3 Max
    cores: Number,
    threads: Number,
    baseSpeed: String,   // "2.6 GHz"
    boostSpeed: String,  // "5.4 GHz"
    cache: String,       // "24MB"
    generation: String,  // "13th Gen"
  },
  // Memory
  ram: {
    size: Number,        // in GB
    type: { type: String },        // DDR5, DDR4, LPDDR5
    speed: String,       // "4800MHz"
    slots: Number,
    maxUpgradeable: Number,
  },
  // Storage
  storage: [{
    type: { type: String },  // SSD, HDD, NVMe
    capacity: Number,        // in GB
    speed: String,           // "7000MB/s"
    interface: String,       // PCIe 4.0, SATA
  }],
  // Display
  display: {
    size: Number,            // in inches
    resolution: String,      // "2560x1600"
    type: { type: String },            // IPS, OLED, Mini-LED
    refreshRate: Number,     // in Hz
    brightness: Number,      // in nits
    colorGamut: String,      // "100% sRGB", "DCI-P3"
    touchscreen: Boolean,
    hdr: Boolean,
  },
  // Graphics
  graphics: {
    type: { type: String },            // Dedicated, Integrated
    brand: String,           // NVIDIA, AMD, Intel, Apple
    model: String,           // RTX 4090, Radeon RX 7900M
    vram: Number,            // in GB
  },
  // Battery
  battery: {
    capacity: Number,        // in Wh
    life: String,            // "up to 18 hours"
    fastCharging: Boolean,
    chargerWatt: Number,
  },
  // Connectivity
  ports: {
    usb_a: Number,
    usb_c: Number,
    thunderbolt: Number,
    hdmi: Boolean,
    sdCard: Boolean,
    ethernet: Boolean,
    headphone: Boolean,
    microSD: Boolean,
  },
  // Wireless
  wireless: {
    wifi: String,            // "Wi-Fi 6E"
    bluetooth: String,       // "5.3"
    cellular: Boolean,
  },
  // Physical
  physical: {
    weight: Number,          // in kg
    thickness: Number,       // in mm
    width: Number,           // in mm
    depth: Number,           // in mm
    material: String,        // Aluminum, Magnesium, Plastic
    color: String,
  },
  // Input
  keyboard: {
    backlit: Boolean,
    backlitType: String,     // Single-color, RGB
    numpad: Boolean,
    type: { type: String },            // Chiclet, Mechanical-feel
  },
  // Other
  os: String,                // Windows 11 Home, macOS Ventura, FreeDOS
  webcam: String,            // "1080p IR", "720p"
  fingerprint: Boolean,
  faceRecognition: Boolean,
  speakers: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  brand: {
    type: String,
    required: true,
    enum: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Sony', 'Other'],
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  subcategory: String,  // "Gaming", "Business", "Ultrabook", "Workstation", "Budget"
  sku: { type: String, unique: true },
  description: {
    short: { type: String, maxlength: 500 },
    full: { type: String },
  },
  images: [{
    url: { type: String, required: true },
    publicId: String,  // Cloudinary public ID
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  price: {
    original: { type: Number, required: true, min: 0 },
    discounted: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  discount: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    validUntil: Date,
    label: String,   // "New Year Sale", "Student Discount"
  },
  stock: {
    quantity: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'], default: 'in_stock' },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true },
  },
  specifications: specificationSchema,
  features: [String],    // Key feature highlights
  tags: [String],
  warranty: {
    duration: Number,    // in months
    type: { type: String },        // "International", "Domestic", "OnSite"
    description: String,
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    distribution: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 },
    },
  },
  views: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  metaTitle: String,
  metaDescription: String,
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  shippingInfo: {
    weight: Number,      // in kg (actual shipping weight)
    freeShipping: { type: Boolean, default: false },
    estimatedDelivery: String, // "3-5 business days"
  },
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }

  // Auto-update stock status
  if (this.stock.quantity === 0) {
    this.stock.status = 'out_of_stock';
  } else if (this.stock.quantity <= this.stock.lowStockThreshold) {
    this.stock.status = 'low_stock';
  } else {
    this.stock.status = 'in_stock';
  }

  // Auto-calculate discount percentage
  if (this.price.discounted && this.price.original > 0) {
    this.discount.percentage = Math.round(((this.price.original - this.price.discounted) / this.price.original) * 100);
  }

  next();
});

// Text search index
productSchema.index({
  name: 'text',
  'description.short': 'text',
  brand: 'text',
  tags: 'text',
  'specifications.processor.model': 'text',
});

productSchema.index({ 'price.discounted': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ 'ratings.average': -1 });

module.exports = mongoose.model('Product', productSchema);
