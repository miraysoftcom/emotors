import { pgTable, text, boolean, timestamp, serial, jsonb, integer, uniqueIndex } from 'drizzle-orm/pg-core'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refreshToken: text('refreshToken'),
  accessToken: text('accessToken'),
  expiresAt: timestamp('expiresAt'),
  tokenType: text('tokenType'),
  scope: text('scope'),
  idToken: text('idToken'),
  sessionState: text('sessionState'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// App Tables
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  short_description: text('short_description'),
  description: text('description'),
  long_description: text('long_description'),
  price: integer('price').notNull(),
  discount_price: integer('discount_price'),
  discount_percentage: integer('discount_percentage'),
  monthly_price: integer('monthly_price'),
  category_id: integer('category_id').references(() => categories.id),
  subcategory_id: integer('subcategory_id').references(() => categories.id),
  brand: text('brand'),
  sku: text('sku'),
  ean: text('ean'),
  image: text('image'),
  images: text('images').array().default([]),
  video_url: text('video_url'),
  pdf_url: text('pdf_url'), // Technical documentation
  downloads: jsonb('downloads').default({}), // Multiple downloadable files
  image_360: text('image_360'), // 360 image support
  power_watts: integer('power_watts'),
  battery_capacity: text('battery_capacity'),
  range_km: integer('range_km'),
  max_speed: integer('max_speed'),
  weight_kg: integer('weight_kg'),
  charge_time: text('charge_time'),
  max_load: text('max_load'),
  warranty: text('warranty'),
  delivery_time: text('delivery_time'),
  color: text('color').array().default([]),
  availability: text('availability').default('in_stock'),
  stock_quantity: integer('stock_quantity').default(0),
  financing_available: boolean('financing_available').default(true),
  license_required: text('license_required'),
  license_type: text('license_type'),
  condition: text('condition').default('new'),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  og_image: text('og_image'),
  og_title: text('og_title'),
  og_description: text('og_description'),
  structured_data: jsonb('structured_data').default({}),
  featured: boolean('featured').default(false),
  bestseller: boolean('bestseller').default(false),
  new_product: boolean('new_product').default(false),
  recommended: boolean('recommended').default(false),
  active: boolean('active').default(true),
  archived: boolean('archived').default(false),
  specs: jsonb('specs').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const heroContent = pgTable('hero_content', {
  id: serial('id').primaryKey(),
  sectionNumber: text('section_number').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  stats: jsonb('stats'),
  ctaText: text('cta_text'),
  ctaLink: text('cta_link'),
  imageEmoji: text('image_emoji'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  order: integer('order').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  value: integer('value').notNull(),
  suffix: text('suffix').default(''),
  order: integer('order').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const faq = pgTable('faq', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  order: integer('order').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const sliders = pgTable('sliders', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  desktopImage: text('desktop_image'),
  mobileImage: text('mobile_image'),
  ctaText: text('cta_text'),
  ctaLink: text('cta_link'),
  animationType: text('animation_type').default('zoom'),
  textPosition: text('text_position').default('left'),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const hero_sliders = pgTable('hero_sliders', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  cta_text: text('cta_text'),
  cta_link: text('cta_link'),
  image_url: text('image_url'),
  background_color: text('background_color'),
  text_color: text('text_color').default('#ffffff'),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  long_description: text('long_description'),
  type: text('type').default('main'), // main, subcategory
  parent_id: integer('parent_id').references(() => categories.id, { onDelete: 'set null' }),
  license_required: boolean('license_required').default(false),
  icon: text('icon'), // icon URL or emoji
  image: text('image'), // category image URL
  banner: text('banner'), // category banner URL
  color: text('color').default('#000000'), // hex color for UI
  featured: boolean('featured').default(false),
  active: boolean('active').default(true),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  sort_priority: integer('sort_priority').default(0),
  order: integer('order').default(0),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const financing_plans = pgTable('financing_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  interest_rate: text('interest_rate'),
  terms: integer('terms'),
  features: text('features').array().default([]),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  author_name: text('author_name').notNull(),
  author_title: text('author_title'),
  content: text('content').notNull(),
  rating: integer('rating').default(5),
  image_url: text('image_url'),
  verified: boolean('verified').default(false),
  order: integer('order').default(0),
  featured: boolean('featured').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  order: integer('order').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const site_content = pgTable('site_content', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  section: text('section'),
  title: text('title'),
  content: text('content'),
  value: jsonb('value'),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const contact_settings = pgTable('contact_settings', {
  id: serial('id').primaryKey(),
  headline: text('headline').default('Wir freuen uns auf Ihre Anfrage'),
  description: text('description').default('Kontaktieren Sie uns für weitere Informationen.'),
  address: text('address').default('MK-eMotors Dornach, Schweiz'),
  phone: text('phone').default('+41 61 701 50 50'),
  email: text('email').default('info@mk-emotorsdornach.ch'),
  opening_hours: jsonb('opening_hours').default({
    monday: '09:00 - 17:00',
    tuesday: '09:00 - 17:00',
    wednesday: '09:00 - 17:00',
    thursday: '09:00 - 17:00',
    friday: '09:00 - 17:00',
    saturday: '10:00 - 14:00',
    sunday: 'Geschlossen',
  }),
  whatsapp: text('whatsapp').default('+41 61 701 50 50'),
  google_maps_embed: text('google_maps_embed').default(''),
  google_maps_lat: text('google_maps_lat').default('47.5196'),
  google_maps_lng: text('google_maps_lng').default('7.5886'),
  recaptcha_site_key: text('recaptcha_site_key').default(''),
  smtp_host: text('smtp_host').default(''),
  smtp_port: integer('smtp_port').default(587),
  smtp_user: text('smtp_user').default(''),
  smtp_password: text('smtp_password').default(''),
  recipient_email: text('recipient_email').default('info@mk-emotorsdornach.ch'),
  auto_reply_subject: text('auto_reply_subject').default('Wir haben Ihre Anfrage erhalten'),
  auto_reply_message: text('auto_reply_message').default('Vielen Dank für Ihre Anfrage. Wir werden Sie bald kontaktieren.'),
  social_links: jsonb('social_links').default({
    instagram: '',
    facebook: '',
    linkedin: '',
  }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const contact_messages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  vorname: text('vorname').notNull(),
  nachname: text('nachname').notNull(),
  firma: text('firma'),
  email: text('email').notNull(),
  telefon: text('telefon'),
  plz: text('plz'),
  ort: text('ort'),
  land: text('land'),
  produktinteresse: text('produktinteresse'),
  nachricht: text('nachricht').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  read: boolean('read').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category'),
  details: text('details'),
  cta_text: text('cta_text'),
  cta_link: text('cta_link'),
  image_url: text('image_url'),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Role Management
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('editor'), // super_admin, moderator_admin, editor
  permissions: text('permissions').array().default([]),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company'),
  phone: text('phone').notNull(),
  billingStreet: text('billing_street').notNull(),
  billingPostalCode: text('billing_postal_code').notNull(),
  billingCity: text('billing_city').notNull(),
  billingCountry: text('billing_country').notNull(),
  shippingStreet: text('shipping_street'),
  shippingPostalCode: text('shipping_postal_code'),
  shippingCity: text('shipping_city'),
  shippingCountry: text('shipping_country'),
  shippingMethod: text('shipping_method').default('standard'), // standard, express, overnight, pickup
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').default(0),
  couponCode: text('coupon_code').references(() => coupons.code, { onDelete: 'set null' }),
  voucherCode: text('voucher_code').references(() => vouchers.code, { onDelete: 'set null' }),
  shippingCost: integer('shipping_cost').default(0),
  tax: integer('tax').default(0),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').default('CHF'),
  status: text('status').default('pending'), // pending, paid, unpaid, pending_payment, processing, preparing, shipped, completed, cancelled, refunded
  paymentMethod: text('payment_method').default('stripe'), // stripe, paypal, twint, bank_transfer, financing, manual
  paymentStatus: text('payment_status').default('unpaid'), // paid, unpaid, pending, refunded
  estimatedDelivery: timestamp('estimated_delivery'),
  shippedAt: timestamp('shipped_at'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Order Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
})

// Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  paypalTransactionId: text('paypal_transaction_id').unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('CHF'),
  status: text('status').default('pending'), // pending, succeeded, failed, processing
  paymentMethod: text('payment_method').default('stripe'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Customers (extended user info)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  company: text('company'),
  defaultAddress: text('default_address'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country'),
  totalOrders: integer('total_orders').default(0),
  totalSpent: integer('total_spent').default(0),
  notes: text('notes'),
  isBlacklisted: boolean('is_blacklisted').default(false),
  lastOrderDate: timestamp('last_order_date'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Financing Requests
export const financingRequests = pgTable('financing_requests', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name'),
  purchasePrice: integer('purchase_price').notNull(),
  downPayment: integer('down_payment').notNull(),
  requestedDuration: integer('requested_duration').notNull(), // months
  estimatedMonthlyPayment: integer('estimated_monthly_payment').notNull(),
  status: text('status').default('pending'), // pending, approved, rejected, completed
  notes: text('notes'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Email Logs
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  emailType: text('email_type').notNull(), // order_confirmation, payment_confirmation, shipping_notification, status_update, new_order_admin, new_financing_request
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  financingRequestId: integer('financing_request_id').references(() => financingRequests.id, { onDelete: 'set null' }),
  status: text('status').default('pending'), // pending, sent, failed
  errorMessage: text('error_message'),
  attemptCount: integer('attempt_count').default(0),
  lastAttemptAt: timestamp('last_attempt_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('createdAt').defaultNow(),
})

// Product Reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(), // 1-5
  title: text('title').notNull(),
  comment: text('comment').notNull(),
  image: text('image'),
  approved: boolean('approved').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Navigation Menu CMS
export const navigationMenu = pgTable('navigation_menu', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  parentId: integer('parent_id').references(() => navigationMenu.id, { onDelete: 'cascade' }),
  position: integer('position').default(0),
  location: text('location').notNull(), // header, footer, dropdown
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Pages CMS
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  images: text('images').array().default([]),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})


// Coupons & Discounts
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // percentage, fixed, free_shipping
  value: integer('value').notNull(),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').default(0),
  min_purchase: integer('min_purchase').default(0),
  max_discount: integer('max_discount'),
  valid_from: timestamp('valid_from'),
  valid_until: timestamp('valid_until'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Vouchers & Gift Cards
export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  amount: integer('amount').notNull(),
  balance: integer('balance').notNull(),
  used_by: text('used_by').references(() => user.id, { onDelete: 'set null' }),
  valid_from: timestamp('valid_from'),
  valid_until: timestamp('valid_until'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Customer Addresses
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company'),
  street: text('street').notNull(),
  postalCode: text('postal_code').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull().default('CH'),
  phone: text('phone'),
  email: text('email'),
  type: text('type').default('billing'), // billing, shipping
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Banners Management
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // image, video, text, product
  image: text('image'),
  video: text('video'),
  videoAutoplay: boolean('video_autoplay').default(true),
  videoMute: boolean('video_mute').default(true),
  videoLoop: boolean('video_loop').default(true),
  headline: text('headline'),
  description: text('description'),
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  location: text('location').notNull(), // homepageHero, homepageSection, shopPage, categoryPage, productPage, footerArea
  position: integer('position').default(0),
  height: text('height').default('auto'), // auto, 200px, 300px, 400px, 500px
  width: text('width').default('100%'),
  backgroundColor: text('background_color'),
  overlayOpacity: integer('overlay_opacity').default(0),
  textPosition: text('text_position').default('center'),
  buttonStyle: text('button_style').default('primary'), // primary, secondary, outline
  borderRadius: text('border_radius').default('0px'),
  animation: text('animation').default('none'), // none, fadeIn, slideUp, slideDown, slideLeft, slideRight, zoom
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Blog Articles
export const blogArticles = pgTable('blog_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  author: text('author'),
  category: text('category'),
  tags: text('tags').array().default([]),
  published: boolean('published').default(false),
  views: integer('views').default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Job Listings
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  qualifications: text('qualifications'),
  location: text('location').notNull(),
  employmentType: text('employment_type').notNull(), // fulltime, parttime, contract, temporary
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  currency: text('currency').default('CHF'),
  department: text('department'),
  image: text('image'),
  published: boolean('published').default(true),
  featured: boolean('featured').default(false),
  position: integer('position').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Job Applications
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  cvUrl: text('cv_url'),
  coverLetter: text('cover_letter'),
  attachments: text('attachments').array().default([]),
  status: text('status').default('pending'), // pending, reviewing, accepted, rejected
  rating: integer('rating'), // 1-5
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// SEO Management
export const seoManagement = pgTable('seo_management', {
  id: serial('id').primaryKey(),
  pageType: text('page_type').notNull(), // homepage, product, category, faq, blog, jobs, page
  entityId: integer('entity_id'), // product_id, category_id, etc.
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  canonicalUrl: text('canonical_url'),
  ogImage: text('og_image'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  twitterCard: text('twitter_card').default('summary_large_image'),
  twitterTitle: text('twitter_title'),
  twitterDescription: text('twitter_description'),
  schemaType: text('schema_type'), // Product, FAQ, Article, Organization, LocalBusiness
  schemaJson: jsonb('schema_json'),
  robotsIndex: text('robots_index').default('index'),
  robotsFollow: text('robots_follow').default('follow'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Website Settings
export const websiteSettings = pgTable('website_settings', {
  id: serial('id').primaryKey(),
  websiteTitle: text('website_title').default('MK-eMotors Dornach'),
  websiteDescription: text('website_description').default('Premium Electric Mobility Solutions'),
  logo: text('logo'),
  favicon: text('favicon'),
  contactPhone: text('contact_phone').default('+41 61 701 50 50'),
  contactEmail: text('contact_email').default('info@mk-emotorsdornach.ch'),
  contactAddress: text('contact_address').default('Dornach, Switzerland'),
  googleMapsEmbed: text('google_maps_embed'),
  footerText: text('footer_text').default('© 2026 MK-eMotors Dornach. All rights reserved.'),
  copyrightText: text('copyright_text').default('© 2026 MK-eMotors Dornach'),
  socialInstagram: text('social_instagram'),
  socialFacebook: text('social_facebook'),
  socialLinkedin: text('social_linkedin'),
  socialTwitter: text('social_twitter'),
  privacyPolicyUrl: text('privacy_policy_url'),
  termsUrl: text('terms_url'),
  headerAboutText: text('header_about_text'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// License Types for Products
export const licenseTypes = pgTable('license_types', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'without_license', 'with_license'
  label: text('label').notNull(), // 'Ohne Führerschein', 'Mit Führerschein'
  badgeColor: text('badge_color').notNull(), // 'green', 'gold'
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
})
