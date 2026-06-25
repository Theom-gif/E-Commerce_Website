import { API_BASE_URL } from './client'
import { BOOKS, MOCK_USER } from '../data'
import type { Book, CartItem, Order, Review, ShippingAddress, UserProfile } from '../types'

type AnyRecord = Record<string, any>

const fallbackCover =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=500'

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function unwrapCollection<T = unknown>(payload: unknown, preferredKeys: string[] = []): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!isRecord(payload)) return []

  for (const key of [...preferredKeys, 'data', 'items', 'products', 'categories', 'wishlist', 'orders', 'cart']) {
    const value = payload[key]
    if (Array.isArray(value)) return value as T[]
    if (isRecord(value) && Array.isArray(value.data)) return value.data as T[]
  }

  return []
}

function normalizeAssetUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return fallbackCover
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value

  const apiRoot = API_BASE_URL.replace(/\/api$/, '')
  return `${apiRoot}/${value.replace(/^\/+/, '')}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function numberFrom(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function stringFrom(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeCategory(value: unknown) {
  if (isRecord(value)) return stringFrom(value.name, 'General')
  return stringFrom(value, 'General')
}

function normalizeReviews(value: unknown): Review[] {
  return unwrapCollection<AnyRecord>(value).map((review, index) => ({
    id: String(review.id ?? `review-${index}`),
    author: stringFrom(review.author ?? review.user?.name ?? review.name, 'Reader'),
    rating: numberFrom(review.rating, 5),
    date: stringFrom(review.date ?? review.created_at, ''),
    comment: stringFrom(review.comment ?? review.body ?? review.review, ''),
  }))
}

export function normalizeBook(product: unknown): Book {
  if (!isRecord(product)) return BOOKS[0]

  const title = stringFrom(product.title ?? product.name, 'Untitled product')
  const id = String(product.id ?? product.product_id ?? product.slug ?? slugify(title))
  const category = normalizeCategory(product.category ?? product.category_name)
  const price = numberFrom(product.price ?? product.sale_price ?? product.unit_price, 0)

  return {
    id,
    productId: product.id ?? product.product_id ?? id,
    title,
    subtitle: stringFrom(product.subtitle ?? product.short_description, ''),
    author: stringFrom(product.author ?? product.brand ?? product.creator, 'BookBase'),
    category,
    price,
    publishDate: stringFrom(product.publish_date ?? product.published_at ?? product.created_at, 'Available now'),
    coverImage: normalizeAssetUrl(
      product.coverImage ?? product.cover_image ?? product.image_url ?? product.image ?? product.thumbnail,
    ),
    isbn: stringFrom(product.isbn ?? product.sku, String(product.id ?? '')),
    pages: numberFrom(product.pages, 0),
    binding: stringFrom(product.binding ?? product.format, 'Paperback'),
    publisher: stringFrom(product.publisher ?? product.vendor, 'BookBase'),
    dimensions: stringFrom(product.dimensions, 'Standard'),
    description: stringFrom(product.description ?? product.long_description, 'No description provided yet.'),
    authorBio: stringFrom(product.author_bio ?? product.authorBio, ''),
    rating: numberFrom(product.rating ?? product.average_rating, 4.6),
    featured: Boolean(product.featured ?? product.is_featured),
    bgAccent: stringFrom(product.bgAccent ?? product.bg_accent, ''),
    curatedCollection: stringFrom(product.curatedCollection ?? product.curated_collection, ''),
    insidePages: Array.isArray(product.inside_pages) ? product.inside_pages : product.insidePages,
    specifications: isRecord(product.specifications)
      ? product.specifications
      : {
          Stock: String(product.stock ?? product.quantity ?? 'Available'),
          Format: stringFrom(product.format ?? product.binding, 'Standard'),
        },
    reviews: normalizeReviews(product.reviews),
  }
}

export function normalizeBooks(payload: unknown) {
  const products = unwrapCollection<unknown>(payload, ['products'])
  return products.length ? products.map(normalizeBook) : BOOKS
}

function findBook(productLike: unknown, books: Book[]) {
  const productRecord = isRecord(productLike) ? productLike : {}
  const id = String(productRecord.id ?? productRecord.product_id ?? productRecord.slug ?? '')
  const found = books.find((book) => book.id === id || String(book.productId ?? '') === id)
  return found ?? normalizeBook(productLike)
}

export function normalizeCart(payload: unknown, books: Book[]) {
  return unwrapCollection<AnyRecord>(payload, ['cart', 'items']).map<CartItem>((item) => {
    const product = item.product ?? item.book ?? item
    const book = findBook(product, books)

    return {
      id: item.id === undefined ? undefined : String(item.id),
      cartId: item.id === undefined ? undefined : String(item.id),
      productId: item.product_id ?? book.productId ?? book.id,
      book,
      quantity: Math.max(1, numberFrom(item.quantity ?? item.qty, 1)),
    }
  })
}

function normalizeAddress(value: unknown): ShippingAddress {
  const source = isRecord(value) ? value : {}

  return {
    fullName: stringFrom(source.fullName ?? source.full_name ?? source.name, MOCK_USER.shippingAddress.fullName),
    email: stringFrom(source.email, MOCK_USER.shippingAddress.email),
    address: stringFrom(source.address ?? source.street, MOCK_USER.shippingAddress.address),
    city: stringFrom(source.city, MOCK_USER.shippingAddress.city),
    postalCode: stringFrom(source.postalCode ?? source.postal_code ?? source.zip, MOCK_USER.shippingAddress.postalCode),
    country: stringFrom(source.country, MOCK_USER.shippingAddress.country),
  }
}

export function normalizeOrders(payload: unknown, books: Book[]): Order[] {
  return unwrapCollection<AnyRecord>(payload, ['orders']).map((order) => {
    const rawItems = unwrapCollection<AnyRecord>(order.items ?? order.order_items ?? [], ['items'])
    const items = rawItems.map<CartItem>((item) => {
      const product = item.product ?? item.book ?? item
      const book = findBook(product, books)
      return {
        id: item.id === undefined ? undefined : String(item.id),
        productId: item.product_id ?? book.productId ?? book.id,
        book,
        quantity: Math.max(1, numberFrom(item.quantity ?? item.qty, 1)),
      }
    })

    return {
      id: String(order.id ?? order.order_number ?? order.code ?? `ORD-${Date.now()}`),
      date: stringFrom(order.date ?? order.created_at, new Date().toLocaleDateString()),
      items,
      total: numberFrom(order.total ?? order.grand_total ?? order.amount, 0),
      status: stringFrom(order.status, 'Pending') as Order['status'],
      shippingAddress: normalizeAddress(order.shipping_address ?? order.address),
    }
  })
}

export function normalizeWishlistIds(payload: unknown) {
  return unwrapCollection<AnyRecord>(payload, ['wishlist']).map((item) =>
    String(item.product_id ?? item.product?.id ?? item.book?.id ?? item.id),
  )
}

export function normalizeUserProfile(payload: unknown): UserProfile {
  const source = isRecord(payload) && isRecord(payload.user) ? payload.user : isRecord(payload) ? payload : {}

  return {
    ...MOCK_USER,
    name: stringFrom(source.name, MOCK_USER.name),
    email: stringFrom(source.email, MOCK_USER.email),
    phoneNumber: stringFrom(source.phoneNumber ?? source.phone_number ?? source.phone, MOCK_USER.phoneNumber),
    shippingAddress: {
      ...MOCK_USER.shippingAddress,
      fullName: stringFrom(source.name, MOCK_USER.shippingAddress.fullName),
      email: stringFrom(source.email, MOCK_USER.shippingAddress.email),
    },
  }
}
