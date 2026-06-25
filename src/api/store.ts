import { api, clearAuthToken, setAuthToken } from './client'
import {
  normalizeBooks,
  normalizeCart,
  normalizeOrders,
  normalizeUserProfile,
  normalizeWishlistIds,
} from './normalizers'
import type { Book, UserProfile } from '../types'

function productIdFor(book: Book) {
  return book.productId ?? book.id
}

export async function fetchProducts() {
  return normalizeBooks(await api.get('/products'))
}

export async function login(email: string, password: string) {
  const data = await api.post<{ user?: unknown; token?: string }>('/login', { email, password })
  if (data.token) setAuthToken(data.token)
  return {
    user: normalizeUserProfile(data.user ?? data),
    token: data.token,
  }
}

export async function register(name: string, email: string, password: string) {
  const data = await api.post<{ user?: unknown; token?: string }>('/register', {
    name,
    email,
    password,
    password_confirmation: password,
  })
  if (data.token) setAuthToken(data.token)
  return {
    user: normalizeUserProfile(data.user ?? data),
    token: data.token,
  }
}

export async function logout() {
  try {
    await api.post('/logout')
  } finally {
    clearAuthToken()
  }
}

export async function fetchProfile() {
  return normalizeUserProfile(await api.get('/profile'))
}

export async function updateProfile(profile: Partial<UserProfile>) {
  return normalizeUserProfile(await api.put('/profile', profile))
}

export async function fetchCart(books: Book[]) {
  return normalizeCart(await api.get('/cart'), books)
}

export async function addCartItem(book: Book, quantity = 1) {
  return api.post('/cart', {
    product_id: productIdFor(book),
    quantity,
  })
}

export async function updateCartItem(cartId: string, quantity: number) {
  return api.put(`/cart/${cartId}`, { quantity })
}

export async function deleteCartItem(cartId: string) {
  return api.delete(`/cart/${cartId}`)
}

export async function fetchWishlist() {
  return normalizeWishlistIds(await api.get('/wishlist'))
}

export async function addWishlistItem(book: Book) {
  return api.post(`/wishlist/${productIdFor(book)}`)
}

export async function deleteWishlistItem(book: Book) {
  return api.delete(`/wishlist/${productIdFor(book)}`)
}

export async function fetchOrders(books: Book[]) {
  return normalizeOrders(await api.get('/orders'), books)
}

export async function checkout() {
  return api.post('/checkout')
}

export async function askAssistant(message: string, limit = 5) {
  return api.post<{
    intent?: string
    message?: string
    categories?: unknown[]
    products?: unknown[]
    actions?: unknown[]
    query?: string
  }>('/assistant', { message, limit })
}
