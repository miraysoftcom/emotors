'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HtmlEditor } from '@/components/admin/HtmlEditor'
import {
  getProductImageBackgroundStyle,
  productImageBackgroundOptions,
  type ProductImageBackground,
} from '@/lib/product-image-background'
import {
  AlertCircle,
  BadgeCheck,
  BadgePercent,
  Banknote,
  Box,
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  FileText,
  Gauge,
  ImageIcon,
  Loader,
  PackageCheck,
  Palette,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  UploadCloud,
} from 'lucide-react'

type ProductType = 'scooter' | 'motorcycle'
type FieldErrors = Record<string, string>

interface Category {
  id: number
  name: string
}

interface Variant {
  id: string
  name: string
  hex: string
  sku: string
  ean: string
  price_delta: number
  stock_quantity: number
  active: boolean
  is_default: boolean
  delivery_status: string
  image: string
}

interface CustomProperty {
  id: string
  label: string
  value: string
  unit: string
}

interface ProductFormData {
  title: string
  slug: string
  product_type: ProductType
  short_description: string
  description: string
  long_description: string
  category_id: string
  brand: string
  sku: string
  ean: string
  manufacturer_sku: string
  image: string
  images: string[]
  image_background: ProductImageBackground
  image_background_color: string
  price: number
  discount_price: number
  discount_percentage: number
  monthly_price: number
  stock_quantity: number
  minimum_stock: number
  availability: string
  availability_manual: boolean
  inventory_tracking: boolean
  allow_backorders: boolean
  delivery_time: string
  warehouse_location: string
  max_order_quantity: number
  min_order_quantity: number
  pre_order_enabled: boolean
  pre_order_date: string
  sales_start: string
  sales_end: string
  condition: string
  license_required: string
  license_type: string
  warranty: string
  battery_warranty: string
  warranty_unit: string
  warranty_terms: string
  legal_region: string
  street_approval: boolean
  helmet_required: boolean
  insurance_required: boolean
  plate_required: boolean
  minimum_age: string
  homologation_number: string
  coc_available: boolean
  vehicle_papers_available: boolean
  model_year: string
  origin_country: string
  manufacturer: string
  model: string
  product_series: string
  target_group: string
  usage_area: string
  assembly_state: string
  maintenance_notes: string
  safety_notes: string
  shipping_weight_kg: number
  package_length_cm: number
  package_width_cm: number
  package_height_cm: number
  seo_title: string
  seo_description: string
  featured: boolean
  bestseller: boolean
  new_product: boolean
  recommended: boolean
  active: boolean
  archived: boolean
  specs: Record<string, string | number | boolean>
  variants: Variant[]
  package_contents: string[]
  custom_properties: CustomProperty[]
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & Record<string, unknown>
  mode?: 'create' | 'edit'
  productId?: number
}

interface SpecField {
  key: string
  label: string
  unit?: string
  type: 'text' | 'number' | 'checkbox' | 'select'
  placeholder?: string
  description: string
  options?: string[]
  min?: number
  max?: number
}

interface SpecGroup {
  title: string
  fields: SpecField[]
}

const sections = [
  { id: 'general', label: 'Allgemein', icon: FileText },
  { id: 'pricing', label: 'Preise', icon: Banknote },
  { id: 'media', label: 'Medien', icon: ImageIcon },
  { id: 'technical', label: 'Technische Daten', icon: Gauge },
  { id: 'inventory', label: 'Inventar', icon: PackageCheck },
  { id: 'variants', label: 'Varianten & Farben', icon: Palette },
  { id: 'additional', label: 'Zusatzinfos', icon: ShieldCheck },
  { id: 'shipping', label: 'Versand', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'publishing', label: 'Veröffentlichung', icon: Sparkles },
]

const scooterSpecs: SpecGroup[] = [
  {
    title: 'Leistung & Geschwindigkeit',
    fields: [
      { key: 'motor_nominal_w', label: 'Motorleistung nominal', type: 'number', unit: 'W', placeholder: '500', description: 'Dauerleistung des Motors.', min: 0 },
      { key: 'motor_max_w', label: 'Motorleistung maximal', type: 'number', unit: 'W', placeholder: '1000', description: 'Kurzzeitige Spitzenleistung.', min: 0 },
      { key: 'max_speed_kmh', label: 'Höchstgeschwindigkeit', type: 'number', unit: 'km/h', placeholder: '20', description: 'Maximal erreichbare Geschwindigkeit.', min: 0, max: 120 },
      { key: 'approved_speed_kmh', label: 'Zulässige Geschwindigkeit', type: 'number', unit: 'km/h', placeholder: '20', description: 'Relevanter Wert für die Zulassung.', min: 0 },
      { key: 'gradeability_percent', label: 'Steigfähigkeit', type: 'number', unit: '%', placeholder: '25', description: 'Maximale Steigung laut Hersteller.', min: 0, max: 100 },
    ],
  },
  {
    title: 'Akku & Laden',
    fields: [
      { key: 'battery_wh', label: 'Akkukapazität', type: 'number', unit: 'Wh', placeholder: '720', description: 'Energieinhalt des Akkus.', min: 0 },
      { key: 'battery_voltage_v', label: 'Akkuspannung', type: 'number', unit: 'V', placeholder: '48', description: 'Systemspannung.', min: 0 },
      { key: 'charging_time_h', label: 'Ladezeit', type: 'number', unit: 'Std.', placeholder: '6', description: 'Typische Ladezeit.', min: 0 },
      { key: 'battery_type', label: 'Akkutyp', type: 'select', description: 'Chemie oder Bauart des Akkus.', options: ['Lithium-Ionen', 'Lithium-Eisenphosphat', 'Blei-Gel'] },
      { key: 'removable_battery', label: 'Entnehmbarer Akku', type: 'checkbox', description: 'Akku kann zum Laden entnommen werden.' },
    ],
  },
  {
    title: 'Reichweite',
    fields: [
      { key: 'range_km', label: 'Reichweite', type: 'number', unit: 'km', placeholder: '60', description: 'Herstellerangabe unter idealen Bedingungen.', min: 0 },
    ],
  },
  {
    title: 'Fahrwerk & Reifen',
    fields: [
      { key: 'max_load_kg', label: 'Maximale Belastung', type: 'number', unit: 'kg', placeholder: '120', description: 'Zulässige Fahrer- und Gepäcklast.', min: 0 },
      { key: 'product_weight_kg', label: 'Produktgewicht', type: 'number', unit: 'kg', placeholder: '28', description: 'Gewicht ohne Verpackung.', min: 0 },
      { key: 'tire_size_inch', label: 'Reifengröße', type: 'number', unit: 'Zoll', placeholder: '10', description: 'Reifendurchmesser.', min: 0 },
      { key: 'tire_type', label: 'Reifentyp', type: 'select', description: 'Bauart der Reifen.', options: ['Luftreifen', 'Vollgummi', 'Tubeless'] },
      { key: 'front_suspension', label: 'Federung vorne', type: 'text', placeholder: 'Hydraulisch', description: 'Federung an der Vorderachse.' },
      { key: 'rear_suspension', label: 'Federung hinten', type: 'text', placeholder: 'Doppelfederbein', description: 'Federung an der Hinterachse.' },
    ],
  },
  {
    title: 'Bremsen & Sicherheit',
    fields: [
      { key: 'front_brake', label: 'Bremsanlage vorne', type: 'text', placeholder: 'Scheibenbremse', description: 'Vordere Bremse.' },
      { key: 'rear_brake', label: 'Bremsanlage hinten', type: 'text', placeholder: 'Scheibenbremse', description: 'Hintere Bremse.' },
      { key: 'regenerative_brake', label: 'Rekuperationsbremse', type: 'checkbox', description: 'Energierückgewinnung beim Bremsen.' },
      { key: 'front_light', label: 'Beleuchtung vorne', type: 'checkbox', description: 'Frontlicht vorhanden.' },
      { key: 'rear_light', label: 'Rücklicht', type: 'checkbox', description: 'Rücklicht vorhanden.' },
      { key: 'indicators', label: 'Blinker', type: 'checkbox', description: 'Blinker vorhanden.' },
    ],
  },
  {
    title: 'Komfort & Konnektivität',
    fields: [
      { key: 'display_type', label: 'Displaytyp', type: 'select', description: 'Anzeigeeinheit am Fahrzeug.', options: ['LCD', 'LED', 'TFT', 'Kein Display'] },
      { key: 'app_support', label: 'App-Unterstützung', type: 'checkbox', description: 'Hersteller-App verfügbar.' },
      { key: 'bluetooth', label: 'Bluetooth', type: 'checkbox', description: 'Bluetooth-Verbindung verfügbar.' },
      { key: 'nfc', label: 'NFC', type: 'checkbox', description: 'NFC-Entsperrung verfügbar.' },
      { key: 'cruise_control', label: 'Tempomat', type: 'checkbox', description: 'Tempomatfunktion vorhanden.' },
      { key: 'folding_mechanism', label: 'Faltmechanismus', type: 'checkbox', description: 'Fahrzeug ist faltbar.' },
      { key: 'ip_rating', label: 'IP-Schutzklasse', type: 'text', placeholder: 'IP54', description: 'Wasser- und Staubschutz.' },
    ],
  },
  {
    title: 'Zulassung & Dokumente',
    fields: [
      { key: 'road_approval', label: 'Straßenzulassung', type: 'checkbox', description: 'Zulassung kann im Admin gepflegt werden.' },
      { key: 'license_plate_holder', label: 'Kennzeichenhalter', type: 'checkbox', description: 'Kennzeichenhalter vorhanden.' },
      { key: 'operating_permit', label: 'Betriebserlaubnis / Dokumente', type: 'text', placeholder: 'ABE vorhanden', description: 'Frei editierbare Dokumentinformation.' },
    ],
  },
]

const motorcycleSpecs: SpecGroup[] = [
  {
    title: 'Leistung & Geschwindigkeit',
    fields: [
      { key: 'vehicle_category', label: 'Fahrzeugkategorie', type: 'select', description: 'Kategorie nach interner Pflege.', options: ['L1e', 'L3e', 'L6e', 'L7e', 'Andere'] },
      { key: 'motor_nominal_kw', label: 'Motorleistung nominal', type: 'number', unit: 'kW', placeholder: '4', description: 'Dauerleistung.', min: 0 },
      { key: 'motor_max_kw', label: 'Motorleistung maximal', type: 'number', unit: 'kW', placeholder: '8', description: 'Spitzenleistung.', min: 0 },
      { key: 'max_speed_kmh', label: 'Höchstgeschwindigkeit', type: 'number', unit: 'km/h', placeholder: '80', description: 'Maximale Geschwindigkeit.', min: 0 },
      { key: 'torque_nm', label: 'Drehmoment', type: 'number', unit: 'Nm', placeholder: '120', description: 'Maximales Drehmoment.', min: 0 },
      { key: 'drive_type', label: 'Antriebsart', type: 'select', description: 'Antriebsübertragung.', options: ['Radnabenmotor', 'Riemenantrieb', 'Kettenantrieb'] },
    ],
  },
  {
    title: 'Akku & Laden',
    fields: [
      { key: 'battery_kwh', label: 'Akkukapazität', type: 'number', unit: 'kWh', placeholder: '4', description: 'Energieinhalt.', min: 0 },
      { key: 'battery_voltage_v', label: 'Akkuspannung', type: 'number', unit: 'V', placeholder: '72', description: 'Systemspannung.', min: 0 },
      { key: 'battery_type', label: 'Akkutyp', type: 'select', description: 'Akkuchemie.', options: ['Lithium-Ionen', 'Lithium-Eisenphosphat', 'Blei-Gel'] },
      { key: 'battery_count', label: 'Anzahl der Akkus', type: 'number', placeholder: '1', description: 'Akkuanzahl im Fahrzeug.', min: 0 },
      { key: 'removable_battery', label: 'Entnehmbarer Akku', type: 'checkbox', description: 'Akku kann entnommen werden.' },
      { key: 'charging_time_h', label: 'Ladezeit', type: 'number', unit: 'Std.', placeholder: '7', description: 'Typische Ladezeit.', min: 0 },
      { key: 'charging_option', label: 'Lademöglichkeit', type: 'text', placeholder: 'Haushaltssteckdose', description: 'Ladeumgebung.' },
      { key: 'charging_port', label: 'Ladeanschluss', type: 'text', placeholder: 'Typ 2 / Schuko', description: 'Anschlussart.' },
    ],
  },
  {
    title: 'Reichweite',
    fields: [
      { key: 'range_km', label: 'Reichweite', type: 'number', unit: 'km', placeholder: '100', description: 'Herstellerangabe.', min: 0 },
    ],
  },
  {
    title: 'Fahrwerk & Reifen',
    fields: [
      { key: 'empty_weight_kg', label: 'Leergewicht', type: 'number', unit: 'kg', placeholder: '95', description: 'Gewicht fahrbereit.', min: 0 },
      { key: 'gross_weight_kg', label: 'Zulässiges Gesamtgewicht', type: 'number', unit: 'kg', placeholder: '250', description: 'Zulässiges Gesamtgewicht.', min: 0 },
      { key: 'seats', label: 'Sitzplätze', type: 'number', placeholder: '2', description: 'Anzahl Sitzplätze.', min: 0 },
      { key: 'seat_height_mm', label: 'Sitzhöhe', type: 'number', unit: 'mm', placeholder: '780', description: 'Sitzhöhe.', min: 0 },
      { key: 'front_wheel_size', label: 'Radgröße vorne', type: 'text', placeholder: '12 Zoll', description: 'Vorderradgröße.' },
      { key: 'rear_wheel_size', label: 'Radgröße hinten', type: 'text', placeholder: '12 Zoll', description: 'Hinterradgröße.' },
      { key: 'tire_type', label: 'Reifentyp', type: 'select', description: 'Reifentyp.', options: ['Sommerreifen', 'Allwetterreifen', 'Offroad'] },
    ],
  },
  {
    title: 'Bremsen & Sicherheit',
    fields: [
      { key: 'front_suspension', label: 'Federung vorne', type: 'text', placeholder: 'Teleskopgabel', description: 'Vordere Federung.' },
      { key: 'rear_suspension', label: 'Federung hinten', type: 'text', placeholder: 'Doppelfederbein', description: 'Hintere Federung.' },
      { key: 'brake_system', label: 'Bremssystem', type: 'text', placeholder: 'Hydraulische Scheibenbremsen', description: 'Bremssystem.' },
      { key: 'abs', label: 'ABS', type: 'checkbox', description: 'ABS vorhanden.' },
      { key: 'cbs', label: 'CBS', type: 'checkbox', description: 'CBS vorhanden.' },
      { key: 'alarm', label: 'Alarmanlage', type: 'checkbox', description: 'Alarmanlage vorhanden.' },
      { key: 'keyless_go', label: 'Keyless-Go', type: 'checkbox', description: 'Schlüsselloser Start.' },
    ],
  },
  {
    title: 'Komfort & Konnektivität',
    fields: [
      { key: 'ride_modes', label: 'Fahrmodi', type: 'text', placeholder: 'Eco, Normal, Sport', description: 'Verfügbare Fahrmodi.' },
      { key: 'reverse_gear', label: 'Rückwärtsgang', type: 'checkbox', description: 'Rückwärtsgang vorhanden.' },
      { key: 'recuperation', label: 'Rekuperation', type: 'checkbox', description: 'Rekuperation vorhanden.' },
      { key: 'display', label: 'Display', type: 'select', description: 'Displaytyp.', options: ['LCD', 'TFT', 'LED'] },
      { key: 'bluetooth', label: 'Bluetooth', type: 'checkbox', description: 'Bluetooth vorhanden.' },
      { key: 'app_support', label: 'App-Unterstützung', type: 'checkbox', description: 'App verfügbar.' },
      { key: 'usb_port', label: 'USB-Anschluss', type: 'checkbox', description: 'USB-Ladeanschluss vorhanden.' },
    ],
  },
  {
    title: 'Zulassung & Dokumente',
    fields: [
      { key: 'license_class', label: 'Führerscheinklasse', type: 'text', placeholder: 'AM / A1 / B196', description: 'Frei editierbare Klasse.' },
      { key: 'vehicle_approval', label: 'Fahrzeugzulassung', type: 'text', placeholder: 'CH / EU', description: 'Regionale Zulassungsinfo.' },
      { key: 'homologation', label: 'Homologation', type: 'text', placeholder: 'EEC', description: 'Homologationsangabe.' },
      { key: 'coc_document', label: 'CoC-Dokument', type: 'checkbox', description: 'CoC vorhanden.' },
      { key: 'battery_warranty', label: 'Garantie Akku', type: 'text', placeholder: '24 Monate', description: 'Akku-Garantie.' },
      { key: 'vehicle_warranty', label: 'Garantie Fahrzeug', type: 'text', placeholder: '24 Monate', description: 'Fahrzeug-Garantie.' },
    ],
  },
]

const defaultFormData: ProductFormData = {
  title: '',
  slug: '',
  product_type: 'scooter',
  short_description: '',
  description: '',
  long_description: '',
  category_id: '',
  brand: '',
  sku: '',
  ean: '',
  manufacturer_sku: '',
  image: '',
  images: [],
  image_background: 'transparent',
  image_background_color: '#21d878',
  price: 0,
  discount_price: 0,
  discount_percentage: 0,
  monthly_price: 0,
  stock_quantity: 0,
  minimum_stock: 2,
  availability: 'out_of_stock',
  availability_manual: false,
  inventory_tracking: true,
  allow_backorders: false,
  delivery_time: '',
  warehouse_location: '',
  max_order_quantity: 0,
  min_order_quantity: 1,
  pre_order_enabled: false,
  pre_order_date: '',
  sales_start: '',
  sales_end: '',
  condition: 'new',
  license_required: 'no',
  license_type: '',
  warranty: '',
  battery_warranty: '',
  warranty_unit: 'Monate',
  warranty_terms: '',
  legal_region: 'Schweiz',
  street_approval: false,
  helmet_required: false,
  insurance_required: false,
  plate_required: false,
  minimum_age: '',
  homologation_number: '',
  coc_available: false,
  vehicle_papers_available: false,
  model_year: '',
  origin_country: '',
  manufacturer: '',
  model: '',
  product_series: '',
  target_group: '',
  usage_area: '',
  assembly_state: '',
  maintenance_notes: '',
  safety_notes: '',
  shipping_weight_kg: 0,
  package_length_cm: 0,
  package_width_cm: 0,
  package_height_cm: 0,
  seo_title: '',
  seo_description: '',
  featured: false,
  bestseller: false,
  new_product: false,
  recommended: false,
  active: true,
  archived: false,
  specs: {},
  variants: [],
  package_contents: ['Fahrzeug', 'Ladegerät', 'Bedienungsanleitung'],
  custom_properties: [],
}

function normalizeInitialData(initialData?: ProductFormProps['initialData']): ProductFormData {
  if (!initialData) return defaultFormData

  const metadata = typeof initialData.metadata === 'object' && initialData.metadata !== null
    ? initialData.metadata as Record<string, unknown>
    : {}

  return {
    ...defaultFormData,
    ...initialData,
    product_type: (metadata.product_type === 'motorcycle' ? 'motorcycle' : metadata.product_type === 'scooter' ? 'scooter' : initialData.product_type || 'scooter') as ProductType,
    category_id: initialData.category_id ? String(initialData.category_id) : '',
    image_background: (
      typeof metadata.image_background === 'string'
        ? metadata.image_background
        : defaultFormData.image_background
    ) as ProductImageBackground,
    image_background_color: String(metadata.image_background_color || defaultFormData.image_background_color),
    manufacturer_sku: String(metadata.manufacturer_sku || initialData.manufacturer_sku || ''),
    minimum_stock: Number(metadata.minimum_stock || initialData.minimum_stock || defaultFormData.minimum_stock),
    variants: Array.isArray(metadata.variants) ? metadata.variants as Variant[] : [],
    package_contents: Array.isArray(metadata.package_contents) ? metadata.package_contents as string[] : defaultFormData.package_contents,
    custom_properties: Array.isArray(metadata.custom_properties) ? metadata.custom_properties as CustomProperty[] : [],
    legal_region: String((metadata.legal as Record<string, unknown> | undefined)?.region || defaultFormData.legal_region),
    shipping_weight_kg: Number((metadata.shipping as Record<string, unknown> | undefined)?.weight_kg || 0),
    package_length_cm: Number((metadata.shipping as Record<string, unknown> | undefined)?.length_cm || 0),
    package_width_cm: Number((metadata.shipping as Record<string, unknown> | undefined)?.width_cm || 0),
    package_height_cm: Number((metadata.shipping as Record<string, unknown> | undefined)?.height_cm || 0),
    specs: typeof initialData.specs === 'object' && initialData.specs !== null ? initialData.specs as ProductFormData['specs'] : {},
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatCHF(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function suggestedAvailability(stock: number, minimumStock: number) {
  if (stock <= 0) return 'out_of_stock'
  if (minimumStock > 0 && stock <= minimumStock) return 'low_stock'
  return 'in_stock'
}

function availabilityLabel(value: string) {
  const labels: Record<string, string> = {
    in_stock: 'Auf Lager',
    low_stock: 'Geringer Bestand',
    out_of_stock: 'Ausverkauft',
    pre_order: 'Vorbestellbar',
    coming_soon: 'Bald verfügbar',
    discontinued: 'Nicht mehr verfügbar',
  }
  return labels[value] || value
}

function calculateDiscountPercentage(price: number, discountPrice: number) {
  if (price <= 0 || discountPrice <= 0 || discountPrice >= price) return 0
  return Math.max(1, Math.round(((price - discountPrice) / price) * 100))
}

type ImageBackgroundAnalysis =
  | { status: 'idle'; message: string }
  | { status: 'checking'; message: string }
  | { status: 'transparent'; message: string }
  | { status: 'white'; message: string }
  | { status: 'colored'; message: string }
  | { status: 'unknown'; message: string }

async function analyzeImageBackground(source: string | File): Promise<ImageBackgroundAnalysis> {
  if (!source || (typeof source === 'string' && !source.trim())) {
    return { status: 'idle', message: '' }
  }

  const objectUrl = source instanceof File ? URL.createObjectURL(source) : ''
  const src = objectUrl || String(source)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      if (!objectUrl && /^https?:\/\//i.test(src)) img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Bild konnte nicht analysiert werden.'))
      img.src = src
    })

    const size = 72
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas nicht verfügbar.')

    context.drawImage(image, 0, 0, size, size)
    const { data } = context.getImageData(0, 0, size, size)
    let borderPixels = 0
    let transparentPixels = 0
    let whitePixels = 0

    const sample = (x: number, y: number) => {
      const index = (y * size + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const a = data[index + 3]
      borderPixels += 1
      if (a < 24) transparentPixels += 1
      if (a > 230 && r > 242 && g > 242 && b > 242) whitePixels += 1
    }

    for (let index = 0; index < size; index += 1) {
      sample(index, 0)
      sample(index, size - 1)
      sample(0, index)
      sample(size - 1, index)
    }

    const transparentRatio = transparentPixels / Math.max(borderPixels, 1)
    const whiteRatio = whitePixels / Math.max(borderPixels, 1)

    if (transparentRatio > 0.12) {
      return {
        status: 'transparent',
        message: 'Bild wirkt transparent. Es passt ideal zu frei wählbaren Produkt-Arkaplanen.',
      }
    }

    if (whiteRatio > 0.72) {
      return {
        status: 'white',
        message: 'Hinweis: Das Bild scheint einen festen weissen Hintergrund zu haben. Für die sauberste Darstellung empfehlen wir PNG/WebP mit Transparenz oder den Hintergrund “Weiss”.',
      }
    }

    return {
      status: 'colored',
      message: 'Hinweis: Das Bild scheint keinen transparenten oder rein weissen Hintergrund zu haben. Wählen Sie unten einen passenden Produkt-Arkaplan oder laden Sie eine freigestellte PNG/WebP-Datei hoch.',
    }
  } catch {
    return {
      status: 'unknown',
      message: 'Der Bildhintergrund konnte nicht geprüft werden. Bei externen URLs kann der Browser die Analyse aus Sicherheitsgründen blockieren.',
    }
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}

function sectionForField(field: string) {
  if (['title', 'slug', 'category_id', 'brand'].includes(field)) return 'general'
  if (['price', 'discount_price', 'discount_percentage', 'monthly_price'].includes(field)) return 'pricing'
  if (['sku', 'ean', 'stock_quantity', 'minimum_stock'].includes(field)) return 'inventory'
  if (field.startsWith('variants')) return 'variants'
  if (field.startsWith('specs')) return 'technical'
  return 'general'
}

function fieldHasValue(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (Array.isArray(value)) return value.length > 0
  return String(value || '').trim().length > 0
}

function Card({ id, title, description, icon, children }: {
  id: string
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-2 text-sm font-medium text-red-600">{message}</p>
}

function TextField({ label, name, value, onChange, error, placeholder, helper, type = 'text', required = false }: {
  label: string
  name: string
  value: string | number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
  helper?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-red-400' : 'border-border'}`}
      />
      {helper && <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>}
      <FieldError message={error} />
    </label>
  )
}

function TextAreaField({ label, name, value, onChange, error, rows = 3, placeholder, helper, plain = false }: {
  label: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  error?: string
  rows?: number
  placeholder?: string
  helper?: string
  plain?: boolean
}) {
  if (!plain) {
    return (
      <div className="block">
        <HtmlEditor
          label={label}
          value={value}
          onChange={(nextValue) => onChange({ target: { name, value: nextValue } } as ChangeEvent<HTMLTextAreaElement>)}
          minHeightClassName={rows > 3 ? 'min-h-56' : 'min-h-36'}
        />
        {helper && <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>}
        {error && <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">{label}</span>
      <textarea
        name={name}
        value={value}
        rows={rows}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-red-400' : 'border-border'}`}
      />
      {helper && <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>}
      <FieldError message={error} />
    </label>
  )
}

function SelectField({ label, name, value, onChange, children, error, helper }: {
  label: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
  error?: string
  helper?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`h-12 w-full appearance-none rounded-xl border bg-background px-4 pr-10 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-red-400' : 'border-border'}`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {helper && <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>}
      <FieldError message={error} />
    </label>
  )
}

function UnitInput({ field, value, onChange }: {
  field: SpecField
  value: string | number | boolean | undefined
  onChange: (key: string, value: string | number | boolean) => void
}) {
  if (field.type === 'checkbox') {
    return (
      <label className="flex min-h-24 items-start gap-3 rounded-xl border border-border bg-background p-4">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked)}
          className="mt-1 h-4 w-4 accent-accent"
        />
        <span>
          <span className="block text-sm font-semibold text-foreground">{field.label}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{field.description}</span>
        </span>
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-foreground">{field.label}</span>
        <select
          value={String(value || '')}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="">Bitte wählen</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{field.description}</p>
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">{field.label}</span>
      <div className="flex h-12 overflow-hidden rounded-xl border border-border bg-background transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        <input
          type={field.type}
          min={field.min}
          max={field.max}
          value={String(value || '')}
          onChange={(event) => onChange(field.key, field.type === 'number' ? Number(event.target.value) || 0 : event.target.value)}
          placeholder={field.placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
        />
        {field.unit && (
          <span className="flex items-center border-l border-border bg-secondary px-3 text-sm font-medium text-muted-foreground">
            {field.unit}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{field.description}</p>
    </label>
  )
}

function StockStatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    in_stock: 'bg-emerald-100 text-emerald-700',
    low_stock: 'bg-amber-100 text-amber-700',
    out_of_stock: 'bg-red-100 text-red-700',
    pre_order: 'bg-blue-100 text-blue-700',
    coming_soon: 'bg-violet-100 text-violet-700',
    discontinued: 'bg-slate-200 text-slate-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[value] || styles.discontinued}`}>
      {availabilityLabel(value)}
    </span>
  )
}

export function ProductForm({ initialData, mode = 'create', productId }: ProductFormProps) {
  const router = useRouter()
  const draftKey = `admin-product-${mode}-${productId || 'new'}`
  const [formData, setFormData] = useState<ProductFormData>(() => normalizeInitialData(initialData))
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageBackgroundAnalysis, setImageBackgroundAnalysis] = useState<ImageBackgroundAnalysis>({
    status: 'idle',
    message: '',
  })
  const [isDirty, setIsDirty] = useState(false)
  const [discountPercentageManual, setDiscountPercentageManual] = useState(() => Boolean(initialData?.discount_percentage))
  const [newPackageItem, setNewPackageItem] = useState('')
  const hasSubmittedRef = useRef(false)

  const specGroups = formData.product_type === 'motorcycle' ? motorcycleSpecs : scooterSpecs
  const activePrice = formData.discount_price > 0 ? formData.discount_price : formData.price
  const savings = formData.price > 0 && formData.discount_price > 0 && formData.discount_price < formData.price
    ? formData.price - formData.discount_price
    : 0
  const automaticDiscountPercentage = calculateDiscountPercentage(formData.price, formData.discount_price)
  const discountPercentage = formData.discount_percentage || automaticDiscountPercentage
  const completion = useMemo(() => {
    const keys: Array<keyof ProductFormData> = ['title', 'slug', 'price', 'category_id', 'sku', 'stock_quantity', 'short_description', 'seo_title']
    const completed = keys.filter((key) => fieldHasValue(formData[key])).length
    return Math.round((completed / keys.length) * 100)
  }, [formData])

  const sectionErrors = useMemo(() => {
    const result = new Set<string>()
    Object.keys(fieldErrors).forEach((field) => result.add(sectionForField(field)))
    return result
  }, [fieldErrors])
  const selectedImageBackgroundStyle = getProductImageBackgroundStyle(
    formData.image_background,
    formData.image_background_color
  )

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : data.data || []
          setCategories(list.map((cat: { id: number; name: string }) => ({ id: cat.id, name: cat.name })))
        }
      } catch (err) {
        console.error('[Fetch Categories Error]', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey)
    if (!saved || mode === 'edit') return
    try {
      setFormData({ ...defaultFormData, ...JSON.parse(saved) })
    } catch {
      window.localStorage.removeItem(draftKey)
    }
  }, [draftKey, mode])

  useEffect(() => {
    if (!isDirty) return
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(formData))
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [draftKey, formData, isDirty])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (formData.availability_manual) return
    const next = suggestedAvailability(formData.stock_quantity, formData.minimum_stock)
    if (next !== formData.availability) {
      setFormData((prev) => ({ ...prev, availability: next }))
    }
  }, [formData.stock_quantity, formData.minimum_stock, formData.availability, formData.availability_manual])

  useEffect(() => {
    if (!formData.image.trim()) {
      setImageBackgroundAnalysis({ status: 'idle', message: '' })
      return
    }

    let cancelled = false
    setImageBackgroundAnalysis({ status: 'checking', message: 'Bildhintergrund wird geprüft...' })
    const timeout = window.setTimeout(() => {
      analyzeImageBackground(formData.image).then((result) => {
        if (!cancelled) setImageBackgroundAnalysis(result)
      })
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [formData.image])

  function updateForm(patch: Partial<ProductFormData>) {
    setFormData((prev) => ({ ...prev, ...patch }))
    setIsDirty(true)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = event.target
    const numberFields = new Set([
      'price',
      'discount_price',
      'discount_percentage',
      'monthly_price',
      'stock_quantity',
      'minimum_stock',
      'max_order_quantity',
      'min_order_quantity',
      'shipping_weight_kg',
      'package_length_cm',
      'package_width_cm',
      'package_height_cm',
    ])
    const checkbox = event.target instanceof HTMLInputElement && type === 'checkbox'
    const nextValue = checkbox ? event.target.checked : numberFields.has(name) ? Number(value) || 0 : value
    const patch: Partial<ProductFormData> = {
      [name]: nextValue,
      ...(name === 'title' && !formData.slug ? { slug: slugify(value) } : {}),
    } as Partial<ProductFormData>

    if (name === 'discount_percentage') {
      const manualValue = Number(value) || 0
      setDiscountPercentageManual(manualValue > 0)
      if (manualValue <= 0) {
        patch.discount_percentage = calculateDiscountPercentage(formData.price, formData.discount_price)
      }
    }

    if ((name === 'price' || name === 'discount_price') && !discountPercentageManual) {
      const nextPrice = name === 'price' ? Number(nextValue) || 0 : formData.price
      const nextDiscountPrice = name === 'discount_price' ? Number(nextValue) || 0 : formData.discount_price
      patch.discount_percentage = calculateDiscountPercentage(nextPrice, nextDiscountPrice)
    }

    updateForm(patch)
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    setIsUploadingImage(true)
    setToast(null)

    try {
      const uploadedUrls: string[] = []
      for (const file of files) {
        if (uploadedUrls.length === 0) {
          setImageBackgroundAnalysis({ status: 'checking', message: 'Bildhintergrund wird geprüft...' })
          analyzeImageBackground(file).then(setImageBackgroundAnalysis)
        }
        const payload = new FormData()
        payload.append('file', file)
        const response = await fetch('/api/admin/uploads', {
          method: 'POST',
          body: payload,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload fehlgeschlagen.')
        uploadedUrls.push(data.url)
      }

      updateForm({
        image: uploadedUrls[0] || formData.image || '',
        images: Array.from(new Set([...formData.images, ...uploadedUrls])),
      })
      setToast({ type: 'success', message: uploadedUrls.length === 1 ? 'Bild wurde hochgeladen.' : `${uploadedUrls.length} Bilder wurden hochgeladen.` })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Upload fehlgeschlagen.' })
    } finally {
      setIsUploadingImage(false)
    }
  }

  function updateSpec(key: string, value: string | number | boolean) {
    updateForm({ specs: { ...formData.specs, [key]: value } })
  }

  function validateClient() {
    const errors: FieldErrors = {}
    if (!formData.title.trim()) errors.title = 'Bitte geben Sie einen Produktnamen ein.'
    if (!formData.slug.trim()) errors.slug = 'Bitte geben Sie einen gültigen URL-Slug ein.'
    if (formData.price <= 0) errors.price = 'Der Verkaufspreis muss größer als 0 sein.'
    if (formData.discount_price > 0 && formData.discount_price >= formData.price) {
      errors.discount_price = 'Der Aktionspreis muss niedriger als der reguläre Preis sein.'
    }
    if (formData.ean && !/^[0-9]{8,14}$/.test(formData.ean.replace(/\s+/g, ''))) {
      errors.ean = 'Bitte geben Sie eine gültige EAN/GTIN mit 8 bis 14 Ziffern ein.'
    }
    formData.variants.forEach((variant, index) => {
      if (!variant.name.trim() && variant.hex.trim()) errors[`variants.${index}.name`] = 'Bitte geben Sie einen Farbnamen ein.'
      if (variant.hex && !/^#[0-9A-Fa-f]{6}$/.test(variant.hex)) errors[`variants.${index}.hex`] = 'Bitte geben Sie einen gültigen HEX-Farbcode ein.'
    })
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      document.getElementById(sectionForField(Object.keys(errors)[0]))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setToast({ type: 'error', message: 'Bitte prüfen Sie die markierten Felder.' })
      return false
    }
    return true
  }

  function requestBody(activeOverride?: boolean) {
    return {
      ...formData,
      active: activeOverride ?? formData.active,
      color: formData.variants.map((variant) => variant.name).filter(Boolean),
      power_watts: Number(formData.specs.motor_nominal_w || 0),
      battery_capacity: String(formData.specs.battery_wh || formData.specs.battery_kwh || ''),
      range_km: Number(formData.specs.range_km || 0),
      max_speed: Number(formData.specs.max_speed_kmh || 0),
      weight_kg: Number(formData.specs.product_weight_kg || formData.specs.empty_weight_kg || 0),
      charge_time: String(formData.specs.charging_time_h || ''),
      max_load: String(formData.specs.max_load_kg || ''),
      metadata: {
        product_type: formData.product_type,
        image_background: formData.image_background,
        image_background_color: formData.image_background_color,
        manufacturer_sku: formData.manufacturer_sku,
        minimum_stock: formData.minimum_stock,
        inventory_tracking: formData.inventory_tracking,
        allow_backorders: formData.allow_backorders,
        warehouse_location: formData.warehouse_location,
        max_order_quantity: formData.max_order_quantity,
        min_order_quantity: formData.min_order_quantity,
        pre_order_enabled: formData.pre_order_enabled,
        pre_order_date: formData.pre_order_date,
        sales_start: formData.sales_start,
        sales_end: formData.sales_end,
        variants: formData.variants,
        package_contents: formData.package_contents,
        custom_properties: formData.custom_properties,
        legal: {
          region: formData.legal_region,
          street_approval: formData.street_approval,
          helmet_required: formData.helmet_required,
          insurance_required: formData.insurance_required,
          plate_required: formData.plate_required,
          minimum_age: formData.minimum_age,
          homologation_number: formData.homologation_number,
          coc_available: formData.coc_available,
          vehicle_papers_available: formData.vehicle_papers_available,
        },
        shipping: {
          weight_kg: formData.shipping_weight_kg,
          length_cm: formData.package_length_cm,
          width_cm: formData.package_width_cm,
          height_cm: formData.package_height_cm,
        },
      },
    }
  }

  async function submitForm(activeOverride?: boolean) {
    if (hasSubmittedRef.current || !validateClient()) return
    hasSubmittedRef.current = true
    setIsLoading(true)
    setToast(null)

    try {
      const endpoint = mode === 'edit' && productId ? `/api/admin/products/${productId}` : '/api/admin/products'
      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody(activeOverride)),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errors = data.fieldErrors && typeof data.fieldErrors === 'object' ? data.fieldErrors as FieldErrors : {}
        setFieldErrors(errors)
        const firstField = Object.keys(errors)[0]
        if (firstField) document.getElementById(sectionForField(firstField))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        throw new Error(data.error || 'Das Produkt konnte aufgrund eines Serverfehlers nicht gespeichert werden.')
      }

      window.localStorage.removeItem(draftKey)
      setIsDirty(false)
      setToast({
        type: 'success',
        message: mode === 'edit' ? 'Änderungen wurden erfolgreich übernommen.' : 'Produkt wurde erfolgreich erstellt.',
      })
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Das Produkt konnte aufgrund eines Serverfehlers nicht gespeichert werden.'
      setToast({ type: 'error', message })
      if (process.env.NODE_ENV === 'development') console.error('[Product Submit Error]', err)
    } finally {
      hasSubmittedRef.current = false
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submitForm(mode === 'create' ? formData.active : undefined)
  }

  function saveDraft() {
    window.localStorage.setItem(draftKey, JSON.stringify({ ...formData, active: false }))
    setToast({ type: 'success', message: 'Entwurf wurde gespeichert.' })
    setIsDirty(false)
  }

  function addVariant() {
    updateForm({
      variants: [
        ...formData.variants,
        {
          id: newId(),
          name: '',
          hex: '#111827',
          sku: '',
          ean: '',
          price_delta: 0,
          stock_quantity: 0,
          active: true,
          is_default: formData.variants.length === 0,
          delivery_status: 'in_stock',
          image: '',
        },
      ],
    })
  }

  function updateVariant(id: string, patch: Partial<Variant>) {
    updateForm({
      variants: formData.variants.map((variant) => {
        if (variant.id !== id) return patch.is_default ? { ...variant, is_default: false } : variant
        return { ...variant, ...patch }
      }),
    })
  }

  function removeVariant(id: string) {
    updateForm({ variants: formData.variants.filter((variant) => variant.id !== id) })
  }

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="relative">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {toast.type === 'success' ? <Check className="mt-0.5 h-5 w-5" /> : <AlertCircle className="mt-0.5 h-5 w-5" />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Produktdaten</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              {mode === 'edit' ? 'Produkt bearbeiten' : 'Neues Produkt erstellen'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Strukturierte Erfassung für elektrische Scooter und elektrische Motorräder.
            </p>
          </div>
          <div className="min-w-64">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Vollständigkeit</span>
              <span className="font-bold text-accent">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      {Object.keys(fieldErrors).some((key) => fieldErrors[key]) && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-bold">Bitte korrigieren Sie die markierten Felder.</p>
              <p className="mt-1 text-sm">Die betroffenen Bereiche sind links in der Navigation markiert.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 space-y-2 rounded-xl border border-border bg-card p-3">
            {sections.map((section) => {
              const Icon = section.icon
              const hasError = sectionErrors.has(section.id)
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  {hasError ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Circle className="h-2 w-2 text-border" />}
                </a>
              )
            })}
          </nav>
        </aside>

        <div className="space-y-8 pb-28">
          <Card id="general" title="Allgemeine Informationen" description="Grunddaten, Kategorie und sichtbare Beschreibung des Produkts." icon={<FileText className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Produktname" name="title" value={formData.title} onChange={handleInputChange} error={fieldErrors.title} required placeholder="MK City Pro" />
              <TextField label="URL-Slug" name="slug" value={formData.slug} onChange={handleInputChange} error={fieldErrors.slug} required placeholder="mk-city-pro" helper="Wird automatisch aus dem Produktnamen vorgeschlagen." />
              <SelectField label="Produkttyp" name="product_type" value={formData.product_type} onChange={handleInputChange}>
                <option value="scooter">Elektrischer Scooter</option>
                <option value="motorcycle">Elektrisches Motorrad</option>
              </SelectField>
              <SelectField label="Kategorie" name="category_id" value={formData.category_id} onChange={handleInputChange} error={fieldErrors.category_id}>
                <option value="">Kategorie wählen</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </SelectField>
              <TextField label="Marke" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="MK-eMotors Dornach" />
              <TextField label="Modell" name="model" value={formData.model} onChange={handleInputChange} placeholder="City Pro" />
            </div>
            <div className="mt-5 grid gap-5">
              <TextAreaField label="Kurzbeschreibung" name="short_description" value={formData.short_description} onChange={handleInputChange} rows={2} placeholder="Kompakte Beschreibung für Produktkarten." />
              <TextAreaField label="Beschreibung" name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Ausführliche Produktbeschreibung." />
            </div>
          </Card>

          <Card id="pricing" title="Preise" description="Verkaufspreis, Aktion und monatliche Finanzierungsrate." icon={<Banknote className="h-5 w-5" />}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Regulärer Verkaufspreis" name="price" type="number" value={formData.price} onChange={handleInputChange} error={fieldErrors.price} required helper="CHF, ohne Währung im Feld." />
                <TextField label="Aktionspreis" name="discount_price" type="number" value={formData.discount_price} onChange={handleInputChange} error={fieldErrors.discount_price} helper="0 lassen, wenn kein Rabatt aktiv ist." />
                <TextField
                  label="Rabattkennzeichnung"
                  name="discount_percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  helper={discountPercentageManual
                    ? `Manuell gesetzt. Automatisch berechnet wären ${automaticDiscountPercentage}%.`
                    : 'Wird automatisch aus regulärem Preis und Aktionspreis berechnet. Bei Bedarf manuell überschreiben.'}
                />
                <TextField label="Monatliche Finanzierungsrate" name="monthly_price" type="number" value={formData.monthly_price} onChange={handleInputChange} helper="Optionale Rate in CHF." />
              </div>
              <aside className="rounded-xl border border-border bg-secondary/70 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Live Vorschau</span>
                  {savings > 0 && <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">-{discountPercentage}%</span>}
                </div>
                <p className="text-sm text-muted-foreground">Angezeigter Preis</p>
                <p className="mt-1 text-4xl font-black tracking-tight text-foreground">{formatCHF(activePrice)}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
                  <div><p className="text-xs text-muted-foreground">Regulär</p><p className="mt-1 font-bold">{formatCHF(formData.price)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Ersparnis</p><p className="mt-1 font-bold text-accent">{formatCHF(savings)}</p></div>
                </div>
                <div className="mt-5 rounded-lg bg-background px-4 py-3 text-sm font-semibold">
                  {formData.monthly_price > 0 ? `${formatCHF(formData.monthly_price)} / Monat` : 'Keine Monatsrate hinterlegt'}
                </div>
                {savings > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Rabatt automatisch: {automaticDiscountPercentage}% · Badge: {discountPercentage}%
                  </p>
                )}
              </aside>
            </div>
          </Card>

          <Card id="media" title="Medien" description="Produktbild und Galerie mit direktem Upload oder sicheren Bild-URLs." icon={<ImageIcon className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-[1fr_220px]">
              <div className="space-y-5">
                <TextField label="Hauptbild URL" name="image" value={formData.image} onChange={handleInputChange} placeholder="/images/product.png" />
                {imageBackgroundAnalysis.message && (
                  <div className={`rounded-xl border p-4 text-sm font-semibold ${
                    imageBackgroundAnalysis.status === 'transparent'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : imageBackgroundAnalysis.status === 'checking'
                        ? 'border-border bg-secondary text-muted-foreground'
                        : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{imageBackgroundAnalysis.message}</p>
                    </div>
                  </div>
                )}
                <div className="rounded-xl border border-border bg-secondary/50 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-foreground">Produktbild-Arkaplan</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Dieser Hintergrund wird in Shop, Kollektion und Produktdetail automatisch hinter dem Bild verwendet.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {productImageBackgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateForm({ image_background: option.value })}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                          formData.image_background === option.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-background text-foreground hover:border-accent/50'
                        }`}
                      >
                        <span
                          className="h-7 w-7 rounded-lg border border-border"
                          style={option.value === 'transparent'
                            ? {
                                backgroundImage: 'linear-gradient(45deg,#d1d5db 25%,transparent 25%),linear-gradient(-45deg,#d1d5db 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d1d5db 75%),linear-gradient(-45deg,transparent 75%,#d1d5db 75%)',
                                backgroundSize: '10px 10px',
                                backgroundPosition: '0 0,0 5px,5px -5px,-5px 0',
                              }
                            : { background: option.swatch }}
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {formData.image_background === 'custom' && (
                    <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm font-semibold">
                      <span>Eigene Farbe</span>
                      <input
                        type="color"
                        name="image_background_color"
                        value={formData.image_background_color}
                        onChange={handleInputChange}
                        className="h-9 w-16 rounded-lg border border-border bg-background p-1"
                      />
                      <span className="text-muted-foreground">{formData.image_background_color}</span>
                    </label>
                  )}
                </div>
                <TextAreaField label="Galeriebilder" name="imagesText" value={formData.images.join('\n')} onChange={(event) => updateForm({ images: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} rows={5} helper="Ein Bild pro Zeile." plain />
              </div>
              <label
                className="group flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border text-center transition hover:border-accent hover:bg-accent/5"
                style={selectedImageBackgroundStyle}
              >
                {formData.image ? (
                  <img src={formData.image} alt="Produktbild Vorschau" className="h-36 w-full object-contain p-4" />
                ) : (
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-accent" />
                )}
                <span className="px-5 py-4">
                  <span className="block text-sm font-semibold">{isUploadingImage ? 'Upload läuft...' : 'Bilder hochladen'}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">JPG, PNG, WebP, GIF oder SVG bis 8 MB. Mehrere Dateien möglich.</span>
                </span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploadingImage} className="sr-only" />
              </label>
            </div>
          </Card>

          <Card id="technical" title="Technische Daten" description="Schema-driven Spezifikationen je nach Produkttyp." icon={<Gauge className="h-5 w-5" />}>
            <div className="space-y-5">
              {specGroups.map((group) => (
                <details key={group.title} open className="rounded-xl border border-border bg-secondary/50">
                  <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-foreground">{group.title}</summary>
                  <div className="grid gap-5 border-t border-border p-5 md:grid-cols-2">
                    {group.fields.map((field) => (
                      <UnitInput key={field.key} field={field} value={formData.specs[field.key]} onChange={updateSpec} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card id="inventory" title="Inventar & Verfügbarkeit" description="SKU, EAN, Lagerbestand und Verkaufsstatus mit automatischer Status-Empfehlung." icon={<PackageCheck className="h-5 w-5" />}>
            <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-secondary/60 p-4">
              <div>
                <p className="text-sm font-bold text-foreground">Aktueller Lagerstatus</p>
                <p className="text-xs text-muted-foreground">Wird anhand von Lagerbestand und Mindestbestand vorgeschlagen.</p>
              </div>
              <StockStatusBadge value={formData.availability} />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <TextField label="Artikelnummer / SKU" name="sku" value={formData.sku} onChange={handleInputChange} error={fieldErrors.sku} helper="Wird normalisiert und auf Eindeutigkeit geprüft." />
              <TextField label="EAN / GTIN" name="ean" value={formData.ean} onChange={handleInputChange} error={fieldErrors.ean} helper="8 bis 14 Ziffern." />
              <TextField label="Hersteller-Artikelnummer" name="manufacturer_sku" value={formData.manufacturer_sku} onChange={handleInputChange} />
              <TextField label="Lagerbestand" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleInputChange} error={fieldErrors.stock_quantity} />
              <TextField label="Mindestbestand" name="minimum_stock" type="number" value={formData.minimum_stock} onChange={handleInputChange} error={fieldErrors.minimum_stock} />
              <SelectField label="Verfügbarkeit" name="availability" value={formData.availability} onChange={(event) => updateForm({ availability: event.target.value, availability_manual: true })}>
                <option value="in_stock">Auf Lager</option>
                <option value="low_stock">Geringer Bestand</option>
                <option value="out_of_stock">Ausverkauft</option>
                <option value="pre_order">Vorbestellbar</option>
                <option value="coming_soon">Bald verfügbar</option>
                <option value="discontinued">Nicht mehr verfügbar</option>
              </SelectField>
              <TextField label="Lieferzeit" name="delivery_time" value={formData.delivery_time} onChange={handleInputChange} placeholder="2-4 Werktage" />
              <TextField label="Lagerort" name="warehouse_location" value={formData.warehouse_location} onChange={handleInputChange} placeholder="Dornach A1" />
              <TextField label="Max. Bestellmenge" name="max_order_quantity" type="number" value={formData.max_order_quantity} onChange={handleInputChange} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['inventory_tracking', 'Lagerverwaltung aktivieren'],
                ['allow_backorders', 'Nachbestellungen erlauben'],
                ['pre_order_enabled', 'Vorbestellung aktivieren'],
              ].map(([name, label]) => (
                <label key={name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold">
                  <input type="checkbox" name={name} checked={Boolean(formData[name as keyof ProductFormData])} onChange={handleInputChange} className="h-4 w-4 accent-accent" />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card id="variants" title="Varianten & Farben" description="Farbvarianten mit Swatch, SKU, EAN, Preisaufschlag, Bestand und Standardvariante." icon={<Palette className="h-5 w-5" />}>
            <div className="mb-5 flex justify-end">
              <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
                <Plus className="h-4 w-4" /> Farbe hinzufügen
              </button>
            </div>
            <div className="space-y-4">
              {formData.variants.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Noch keine Farbvarianten angelegt.</div>
              )}
              {formData.variants.map((variant, index) => (
                <details key={variant.id} open className="rounded-xl border border-border bg-secondary/50">
                  <summary className="cursor-pointer px-5 py-4">
                    <div className="inline-flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: variant.hex || '#ffffff' }} />
                      <span className="font-bold">{variant.name || `Farbvariante ${index + 1}`}</span>
                      <span className="text-xs text-muted-foreground">{variant.sku || 'Ohne SKU'}</span>
                      {variant.is_default && <span className="rounded-full bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">Standard</span>}
                    </div>
                  </summary>
                  <div className="grid gap-5 border-t border-border p-5 md:grid-cols-3">
                    <TextField label="Farbname" name={`variant-name-${variant.id}`} value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} error={fieldErrors[`variants.${index}.name`]} placeholder="Mattschwarz" />
                    <TextField label="HEX" name={`variant-hex-${variant.id}`} value={variant.hex} onChange={(event) => updateVariant(variant.id, { hex: event.target.value })} error={fieldErrors[`variants.${index}.hex`]} placeholder="#111827" />
                    <input aria-label="Farbe wählen" type="color" value={variant.hex || '#111827'} onChange={(event) => updateVariant(variant.id, { hex: event.target.value })} className="mt-7 h-12 w-full rounded-xl border border-border bg-background p-1" />
                    <TextField label="Varyant SKU" name={`variant-sku-${variant.id}`} value={variant.sku} onChange={(event) => updateVariant(variant.id, { sku: event.target.value })} />
                    <TextField label="EAN" name={`variant-ean-${variant.id}`} value={variant.ean} onChange={(event) => updateVariant(variant.id, { ean: event.target.value })} />
                    <TextField label="Bestand" type="number" name={`variant-stock-${variant.id}`} value={variant.stock_quantity} onChange={(event) => updateVariant(variant.id, { stock_quantity: Number(event.target.value) || 0 })} />
                    <TextField label="Preisaufschlag" type="number" name={`variant-price-${variant.id}`} value={variant.price_delta} onChange={(event) => updateVariant(variant.id, { price_delta: Number(event.target.value) || 0 })} />
                    <TextField label="Bild URL" name={`variant-image-${variant.id}`} value={variant.image} onChange={(event) => updateVariant(variant.id, { image: event.target.value })} />
                    <SelectField label="Lieferstatus" name={`variant-delivery-${variant.id}`} value={variant.delivery_status} onChange={(event) => updateVariant(variant.id, { delivery_status: event.target.value })}>
                      <option value="in_stock">Auf Lager</option>
                      <option value="low_stock">Geringer Bestand</option>
                      <option value="out_of_stock">Ausverkauft</option>
                      <option value="pre_order">Vorbestellbar</option>
                    </SelectField>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold">
                      <input type="checkbox" checked={variant.active} onChange={(event) => updateVariant(variant.id, { active: event.target.checked })} className="h-4 w-4 accent-accent" />
                      Aktiv
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold">
                      <input type="checkbox" checked={variant.is_default} onChange={(event) => updateVariant(variant.id, { is_default: event.target.checked })} className="h-4 w-4 accent-accent" />
                      Standardvariante
                    </label>
                    <button type="button" onClick={() => removeVariant(variant.id)} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      <Trash2 className="h-4 w-4" /> Entfernen
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card id="additional" title="Zusätzliche Informationen" description="Lieferumfang, Garantie, rechtliche Hinweise und individuelle Eigenschaften." icon={<ShieldCheck className="h-5 w-5" />}>
            <div className="grid gap-8">
              <div>
                <h3 className="mb-3 font-bold">Lieferumfang</h3>
                <div className="flex gap-2">
                  <input value={newPackageItem} onChange={(event) => setNewPackageItem(event.target.value)} placeholder="z. B. Werkzeugset" className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  <button type="button" onClick={() => { if (newPackageItem.trim()) { updateForm({ package_contents: [...formData.package_contents, newPackageItem.trim()] }); setNewPackageItem('') } }} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">Hinzufügen</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.package_contents.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm">
                      {item}
                      <button type="button" onClick={() => updateForm({ package_contents: formData.package_contents.filter((entry) => entry !== item) })} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <TextField label="Fahrzeuggarantie" name="warranty" value={formData.warranty} onChange={handleInputChange} placeholder="24" />
                <TextField label="Akkugarantie" name="battery_warranty" value={formData.battery_warranty} onChange={handleInputChange} placeholder="24" />
                <SelectField label="Garantieeinheit" name="warranty_unit" value={formData.warranty_unit} onChange={handleInputChange}>
                  <option value="Monate">Monate</option>
                  <option value="Jahre">Jahre</option>
                </SelectField>
              </div>
              <TextAreaField label="Garantiebedingungen" name="warranty_terms" value={formData.warranty_terms} onChange={handleInputChange} rows={3} />
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ['street_approval', 'Straßenzulassung'],
                  ['helmet_required', 'Helmpflicht'],
                  ['insurance_required', 'Versicherungspflicht'],
                  ['plate_required', 'Kennzeichenpflicht'],
                  ['coc_available', 'CoC vorhanden'],
                  ['vehicle_papers_available', 'Fahrzeugpapiere vorhanden'],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold">
                    <input type="checkbox" name={name} checked={Boolean(formData[name as keyof ProductFormData])} onChange={handleInputChange} className="h-4 w-4 accent-accent" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <TextField label="Mindestalter" name="minimum_age" value={formData.minimum_age} onChange={handleInputChange} />
                <TextField label="Homologationsnummer" name="homologation_number" value={formData.homologation_number} onChange={handleInputChange} />
                <TextField label="Herkunftsland" name="origin_country" value={formData.origin_country} onChange={handleInputChange} />
              </div>
              <TextAreaField label="Wartungshinweise" name="maintenance_notes" value={formData.maintenance_notes} onChange={handleInputChange} rows={3} />
              <TextAreaField label="Sicherheitshinweise" name="safety_notes" value={formData.safety_notes} onChange={handleInputChange} rows={3} />
            </div>
          </Card>

          <Card id="shipping" title="Versand & Abmessungen" description="Gewicht, Paketmaße und Versandhinweise für Logistik und Versand." icon={<Truck className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-4">
              <TextField label="Versandgewicht" name="shipping_weight_kg" type="number" value={formData.shipping_weight_kg} onChange={handleInputChange} helper="kg" />
              <TextField label="Länge" name="package_length_cm" type="number" value={formData.package_length_cm} onChange={handleInputChange} helper="cm" />
              <TextField label="Breite" name="package_width_cm" type="number" value={formData.package_width_cm} onChange={handleInputChange} helper="cm" />
              <TextField label="Höhe" name="package_height_cm" type="number" value={formData.package_height_cm} onChange={handleInputChange} helper="cm" />
            </div>
          </Card>

          <Card id="seo" title="SEO" description="Suchmaschinen-Titel und Beschreibung für organische Sichtbarkeit." icon={<Search className="h-5 w-5" />}>
            <div className="grid gap-5">
              <TextField label="SEO Titel" name="seo_title" value={formData.seo_title} onChange={handleInputChange} placeholder="MK City Pro kaufen" />
              <TextAreaField label="SEO Beschreibung" name="seo_description" value={formData.seo_description} onChange={handleInputChange} rows={3} plain />
            </div>
          </Card>

          <Card id="publishing" title="Veröffentlichung" description="Sichtbarkeit, Kampagnenstatus und Katalog-Markierungen." icon={<Sparkles className="h-5 w-5" />}>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['active', 'Veröffentlicht'],
                ['featured', 'Featured'],
                ['bestseller', 'Bestseller'],
                ['new_product', 'Neuheit'],
                ['recommended', 'Empfohlen'],
                ['archived', 'Archiviert'],
              ].map(([name, label]) => (
                <label key={name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold">
                  <input type="checkbox" name={name} checked={Boolean(formData[name as keyof ProductFormData])} onChange={handleInputChange} className="h-4 w-4 accent-accent" />
                  {label}
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDirty ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <BadgeCheck className="h-4 w-4 text-emerald-500" />}
            {isDirty ? 'Nicht gespeicherte Änderungen' : 'Alle Änderungen gespeichert'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => router.push('/admin/products')} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Abbrechen</button>
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold">
              <Save className="h-4 w-4" /> Entwurf speichern
            </button>
            <button type="button" onClick={() => window.open('/products', '_blank')} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Vorschau</button>
            <button type="button" disabled={isLoading} onClick={() => void submitForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-accent-foreground disabled:opacity-60">
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Box className="h-4 w-4" />}
              {mode === 'edit' ? 'Änderungen speichern' : 'Veröffentlichen'}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}
