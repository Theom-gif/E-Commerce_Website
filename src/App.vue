<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Footer from './components/Footer.vue'
import HomeView from './components/HomeView.vue'
import CatalogView from './components/CatalogView.vue'
import BookDetailView from './components/BookDetailView.vue'
import CartSidebar from './components/CartSidebar.vue'
import CheckoutView from './components/CheckoutView.vue'
import AccountView from './components/AccountView.vue'
import FavoriteView from './components/FavoriteView.vue'
import ErrorView from './components/ErrorView.vue'
import AuthView from './components/AuthView.vue'
import {
  Compass,
  Grid,
  BookOpen,
  Heart,
  Download,
  Headphones,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ShoppingBag,
  User,
  X,
  Play,
  Pause,
  Volume2,
  Send,
  Sparkles,
  ChevronRight,
  Menu,
  Check,
} from 'lucide-vue-next'
import { BOOKS, MOCK_ORDERS } from './data'
import type { Book, CartItem, Order } from './types'
import { getAuthToken, clearAuthToken } from './api/client'
import {
  addCartItem,
  addWishlistItem,
  askAssistant,
  checkout as checkoutCart,
  deleteCartItem,
  deleteWishlistItem,
  fetchCart,
  fetchOrders,
  fetchProducts,
  fetchProfile,
  fetchWishlist,
  logout as apiLogout,
  updateCartItem,
} from './api/store'

const isAuthenticated = ref(Boolean(getAuthToken()) || localStorage.getItem('bookbase_auth_v1') === 'true')

const createCurrentUser = () => {
  const cached = localStorage.getItem('bookbase_user_v1')
  return cached ? JSON.parse(cached) : { name: '', email: '' }
}
const currentUser = ref<{ name: string; email: string }>(createCurrentUser())

const products = ref<Book[]>(BOOKS)
const activeBookId = ref<string | null>(null)
const searchQuery = ref('')

const createCart = () => {
  const cached = localStorage.getItem('the_library_cart_v1')
  return cached ? JSON.parse(cached) : []
}
const cart = ref<CartItem[]>(createCart())

const createBookmarks = () => {
  const cached = localStorage.getItem('the_library_bookmarks_v1')
  return cached ? JSON.parse(cached) : ['warren-buffett', 'true-experiment', 'charlotte-web', 'dhoni-touch', 'sky-runner', 'nelson-mandela']
}
const bookmarks = ref<string[]>(createBookmarks())

const createOrders = () => {
  const cached = localStorage.getItem('the_library_orders_v1')
  return cached ? JSON.parse(cached) : MOCK_ORDERS
}
const orders = ref<Order[]>(createOrders())

const currentView = ref('home')

const isCartOpen = ref(false)
const isAudioDrawerOpen = ref(false)
const isDownloadModalOpen = ref(false)
const isSupportChatOpen = ref(false)
const isMobileMenuOpen = ref(false)

const persistUser = (user: { name: string; email: string }) => {
  currentUser.value = user
  localStorage.setItem('bookbase_user_v1', JSON.stringify(user))
}

const syncAuthenticatedData = async () => {
  if (!isAuthenticated.value) return

  const [profileResult, cartResult, wishlistResult, ordersResult] = await Promise.allSettled([
    fetchProfile(),
    fetchCart(products.value),
    fetchWishlist(),
    fetchOrders(products.value),
  ])

  if (profileResult.status === 'fulfilled') {
    persistUser({
      name: profileResult.value.name,
      email: profileResult.value.email,
    })
  }
  if (cartResult.status === 'fulfilled') cart.value = cartResult.value
  if (wishlistResult.status === 'fulfilled') bookmarks.value = wishlistResult.value
  if (ordersResult.status === 'fulfilled') orders.value = ordersResult.value
}

const loadInitialData = async () => {
  try {
    products.value = await fetchProducts()
  } catch (error) {
    console.warn('Using local product fallback because the API is unavailable.', error)
  }

  await syncAuthenticatedData()
}

onMounted(() => {
  currentView.value = (getHash() || 'home') as any
  void loadInitialData()
})

const getHash = () => window.location.hash.replace('#', '')

watch(
  cart,
  (val) => {
    localStorage.setItem('the_library_cart_v1', JSON.stringify(val))
  },
  { deep: true }
)
watch(
  bookmarks,
  (val) => {
    localStorage.setItem('the_library_bookmarks_v1', JSON.stringify(val))
  },
  { deep: true }
)
watch(
  orders,
  (val) => {
    localStorage.setItem('the_library_orders_v1', JSON.stringify(val))
  },
  { deep: true }
)

watch(currentView, (val) => {
  if (val) window.location.hash = val
})

watch([currentView, activeBookId], () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const handleNavigate = (view: string) => {
  if (view === 'account' && !isAuthenticated.value) {
    currentView.value = 'auth' as any
  } else {
    currentView.value = view as any
  }
  isMobileMenuOpen.value = false
  if (view !== 'detail') {
    activeBookId.value = null
  }
}

const handleSelectBook = (id: string) => {
  activeBookId.value = id
  currentView.value = 'detail'
}

const handleAddToCart = async (book: Book, quantity = 1) => {
  const prev = cart.value
  const idx = prev.findIndex((item) => item.book.id === book.id)
  if (idx > -1) {
    const copy = [...prev]
    copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity }
    cart.value = copy
  } else {
    cart.value = [...prev, { book, quantity }]
  }

  if (!isAuthenticated.value) return

  try {
    await addCartItem(book, quantity)
    cart.value = await fetchCart(products.value)
  } catch (error) {
    console.warn('Unable to sync cart add with API.', error)
  }
}

const handleUpdateQuantity = async (bookId: string, quantity: number) => {
  if (quantity <= 0) {
    handleRemoveItem(bookId)
    return
  }
  const currentItem = cart.value.find((item) => item.book.id === bookId)
  cart.value = cart.value.map((item) => (item.book.id === bookId ? { ...item, quantity } : item))

  if (!isAuthenticated.value || !currentItem?.cartId) return

  try {
    await updateCartItem(currentItem.cartId, quantity)
    cart.value = await fetchCart(products.value)
  } catch (error) {
    console.warn('Unable to sync cart quantity with API.', error)
  }
}

const handleRemoveItem = async (bookId: string) => {
  const currentItem = cart.value.find((item) => item.book.id === bookId)
  cart.value = cart.value.filter((item) => item.book.id !== bookId)

  if (!isAuthenticated.value || !currentItem?.cartId) return

  try {
    await deleteCartItem(currentItem.cartId)
    cart.value = await fetchCart(products.value)
  } catch (error) {
    console.warn('Unable to sync cart removal with API.', error)
  }
}

const handleToggleBookmark = async (id: string) => {
  const prev = [...bookmarks.value]
  const book = products.value.find((item) => item.id === id)
  const wasSaved = prev.includes(id)
  if (prev.includes(id)) {
    bookmarks.value = prev.filter((bookmarkId) => bookmarkId !== id)
  } else {
    bookmarks.value = [...prev, id]
  }

  if (!isAuthenticated.value || !book) return

  try {
    if (wasSaved) {
      await deleteWishlistItem(book)
    } else {
      await addWishlistItem(book)
    }
    bookmarks.value = await fetchWishlist()
  } catch (error) {
    console.warn('Unable to sync wishlist with API.', error)
  }
}

const handlePlaceOrder = async (newOrder: Order) => {
  if (isAuthenticated.value) {
    try {
      const response = await checkoutCart()
      const backendOrder = response.order as any

      let finalOrder = newOrder
      if (backendOrder) {
        finalOrder = {
          ...newOrder,
          id: String(backendOrder.id ?? backendOrder.order_number ?? newOrder.id),
          date: backendOrder.created_at ? new Date(backendOrder.created_at).toLocaleDateString() : newOrder.date,
          status: backendOrder.status ?? newOrder.status,
        }
      }

      const refreshedOrders = await fetchOrders(products.value)
      
      if (refreshedOrders.length > 0) {
        // If the first returned order matches the newly created backend ID, augment it
        // so we don't lose the local shipping address/discount which aren't saved in the backend.
        if (refreshedOrders[0].id === finalOrder.id) {
          refreshedOrders[0] = {
            ...refreshedOrders[0],
            shippingAddress: finalOrder.shippingAddress,
            discountApplied: finalOrder.discountApplied,
          }
        }
        orders.value = refreshedOrders
      } else {
        orders.value = [finalOrder, ...orders.value]
      }
      return finalOrder
    } catch (error) {
      console.warn('Unable to place checkout through API; keeping local order.', error)
    }
  }

  orders.value = [newOrder, ...orders.value]
  return newOrder
}

const handleClearCart = () => {
  cart.value = []
}

const cartCount = computed(() => cart.value.reduce((count, item) => count + item.quantity, 0))

const selectedBook = computed(() => {
  if (activeBookId.value) {
    return products.value.find((b) => b.id === activeBookId.value) || null
  }
  return null
})

const handleSearchKeyPress = (val: string) => {
  searchQuery.value = val
  if (val && currentView.value !== 'catalog' && currentView.value !== 'detail') {
    currentView.value = 'catalog'
  }
}

const handleClearSearch = () => {
  searchQuery.value = ''
}

const audioPlaying = ref(false)
const activeAudioIndex = ref(0)
const playbackSeconds = ref(18)
const volume = ref(75)

const audioTracks = [
  {
    title: 'The Psychology of Money - Chap. 1',
    duration: '14:20',
    author: 'Morgan Housel',
  },
  {
    title: 'How Innovation Works - Introduction',
    duration: '18:45',
    author: 'Matt Ridley',
  },
  {
    title: 'Grid Systems - Historical Monographs',
    duration: '25:10',
    author: 'Josef Müller-Brockmann',
  },
  {
    title: 'A Quiet Geometry - Selected Verses',
    duration: '08:12',
    author: 'Sylvia Vance',
  },
]

let audioTimer: number | null = null
watch(
  audioPlaying,
  (isPlaying) => {
    if (!isPlaying) {
      if (audioTimer) {
        clearInterval(audioTimer)
        audioTimer = null
      }
      return
    }
    audioTimer = window.setInterval(() => {
      if (playbackSeconds.value >= 300) {
        playbackSeconds.value = 0
      } else {
        playbackSeconds.value += 1
      }
    }, 1000)
  },
  { immediate: true }
)

const formatSeconds = (sec: number) => {
  const mins = Math.floor(sec / 60)
  const remaining = sec % 60
  return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

const downloadProgress = ref<Record<string, number>>({})
const downloadSuccessToast = ref<string | null>(null)

const startDownloadSimulator = (fileId: string, fileName: string) => {
  if (downloadProgress.value[fileId] !== undefined) return
  downloadProgress.value = { ...downloadProgress.value, [fileId]: 0 }
  let progress = 0
  const interval = window.setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      downloadProgress.value = { ...downloadProgress.value, [fileId]: 100 }
      downloadSuccessToast.value = `Successfully downloaded "${fileName}"!`
      setTimeout(() => {
        downloadSuccessToast.value = null
        setDownloadProgress((prev) => {
          const copy = { ...prev }
          delete copy[fileId]
          return copy
        })
      }, 4000)
    } else {
      downloadProgress.value = { ...downloadProgress.value, [fileId]: progress }
    }
  }, 400)
}

const setDownloadProgress = (updater: (prev: Record<string, number>) => Record<string, number>) => {
  downloadProgress.value = updater(downloadProgress.value)
}

const chatMessages = ref<Array<{ sender: 'user' | 'bot'; text: string }>>([
  {
    sender: 'bot',
    text: 'Hello! Welcome to BookBase Customer Services. How can I assist you with your library, checkout catalog, or digital downloads today?',
  },
])
const userChatText = ref('')
const botIsTyping = ref(false)

const handleSendChatMessage = async (e: Event) => {
  e.preventDefault()
  if (!userChatText.value.trim()) return
  const userText = userChatText.value
  chatMessages.value = [...chatMessages.value, { sender: 'user', text: userText }]
  userChatText.value = ''
  botIsTyping.value = true

  try {
    const assistantReply = await askAssistant(userText)
    const reply =
      assistantReply.message ||
      'I can help with products, categories, carts, wishlist, orders, or checkout.'
    chatMessages.value = [...chatMessages.value, { sender: 'bot', text: reply }]
  } catch (error) {
    chatMessages.value = [
      ...chatMessages.value,
      {
        sender: 'bot',
        text: 'I could not reach the store assistant endpoint. Please make sure the Laravel backend is running on the configured API URL.',
      },
    ]
    console.warn('Assistant request failed.', error)
  } finally {
    botIsTyping.value = false
  }
}

const handleSimulateLogout = async () => {
  if (!confirm('Are you sure you want to log out? This will reset your session details.')) return
  try {
    await apiLogout()
  } catch (error) {
    clearAuthToken()
    console.warn('Logout endpoint failed; local token cleared.', error)
  }
  cart.value = []
  searchQuery.value = ''
  bookmarks.value = ['warren-buffett', 'charlotte-web']
  isAuthenticated.value = false
  currentUser.value = { name: '', email: '' }
  localStorage.removeItem('bookbase_auth_v1')
  localStorage.removeItem('bookbase_user_v1')
  currentView.value = 'home'
}

const handleAuthSuccess = async (userData: { name: string; email: string }) => {
  isAuthenticated.value = true
  persistUser(userData)
  localStorage.setItem('bookbase_auth_v1', 'true')
  await syncAuthenticatedData()
  currentView.value = 'account'
}

const scrollToId = (id?: string) => {
  if (!id) return
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
</script>

<template>
  <div
    class="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#2563eb] selection:text-white"
    id="bookbase-interactive-shell"
  >
    <!-- UNIVERSAL TOP NAVBAR -->
    <nav class="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-xs" id="bookbase-top-navbar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-20 gap-4">
          <!-- Left Brand Identifier -->
          <div
            class="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
            id="brand-logo-panel"
            @click="handleNavigate('home')"
          >
            <div
              class="bg-[#2563eb] text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-700 group-hover:-rotate-3"
            >
              <Compass class="w-5 h-5" style="animation: spin 12s linear infinite" />
            </div>
            <span class="font-extrabold text-xl font-sans tracking-tight text-slate-850" id="brand-logo-text">
              BookBase
            </span>
          </div>

          <!-- Middle Nav Links (Desktop) -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-2.5" id="top-navbar-links">
            <button
              class="flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300"
              :class="currentView === 'home' ? 'bg-[#2563eb]/8 text-[#2563eb]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'"
              title="Discover New Content"
              @click="handleNavigate('home')"
            >
              <span>Discover</span>
            </button>

            <button
              class="flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300"
              :class="currentView === 'catalog' ? 'bg-[#2563eb]/8 text-[#2563eb]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'"
              title="Category Catalogs"
              @click="handleNavigate('catalog')"
            >
              <span>Category</span>
            </button>

            <button
              class="flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300"
              :class="currentView === 'account' ? 'bg-[#2563eb]/8 text-[#2563eb]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'"
              title="My Library"
              @click="handleNavigate('account')"
            >
              <span>My Library</span>
            </button>

            <button
              class="flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300"
              :class="currentView === 'favorite' ? 'bg-[#2563eb]/8 text-[#2563eb]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'"
              title="Quick Saves"
              @click="handleNavigate('favorite')"
            >
              <span>Favourite</span>
              <span
                v-if="bookmarks.length > 0"
                class="bg-red-100 text-red-600 px-1.5 py-0.5 text-[9px] rounded-full font-extrabold ml-1.5"
              >
                {{ bookmarks.length }}
              </span>
            </button>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center space-x-2.5 flex-shrink-0" id="top-navbar-actions">
            <!-- Navbar search -->
            <div class="relative max-w-sm w-44 lg:w-56 hidden md:flex items-center" id="navbar-search-parent">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search books..."
                v-model="searchQuery"
                @input="handleSearchKeyPress(searchQuery)"
                class="w-full bg-[#f1f5f9] hover:bg-slate-200/50 focus:bg-white border border-transparent focus:border-[#2563eb]/20 text-xs py-2 pl-9 pr-8 rounded-xl outline-none font-medium text-slate-700 transition-all duration-300 placeholder-slate-400 shadow-3xs"
                id="navbar-search-input"
              />
              <button
                v-if="searchQuery"
                class="absolute right-2.5 text-slate-400 hover:text-slate-600 bg-slate-200/50 p-0.5 rounded-full"
                title="Clear search"
                @click="handleClearSearch"
              >
                <X class="w-2.5 h-2.5" />
              </button>
            </div>

            <!-- Mobile search -->
            <button
              class="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
              title="Search Library Catalog"
              @click="handleNavigate('catalog')"
            >
              <Search class="w-4 h-4" />
            </button>

            <!-- Cart -->
            <button
              class="bg-slate-50 hover:bg-[#2563eb]/5 p-2.5 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#2563eb] transition-all relative cursor-pointer"
              id="top-navbar-cart-btn"
              title="View Shoppings"
              @click="isCartOpen = true"
            >
              <ShoppingBag class="w-4 h-4" />
              <span
                v-if="cartCount > 0"
                class="absolute -top-1 -right-1 bg-[#2563eb] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse"
              >
                {{ cartCount }}
              </span>
            </button>

            <!-- Account dropdown -->
            <div class="relative group/profile flex items-center">
              <button
                class="flex items-center space-x-1 p-1 rounded-xl hover:bg-slate-50 text-left transition-all cursor-pointer"
                title="Your Profile Details"
                @click="handleNavigate(isAuthenticated ? 'account' : 'auth')"
              >
                <div
                  class="w-8 h-8 rounded-xl bg-[#2563eb]/10 border border-slate-100 flex items-center justify-center text-xs font-bold text-[#2563eb] overflow-hidden"
                >
                  <span v-if="isAuthenticated && currentUser.name" class="text-xs font-bold text-[#2563eb]">
                    {{ currentUser.name.charAt(0).toUpperCase() }}
                  </span>
                  <User v-else class="w-4 h-4" />
                </div>
                <ChevronRight class="w-3 h-3 text-slate-400 rotate-90 hidden sm:block" />
              </button>

              <!-- Popover -->
              <div
                class="absolute right-0 top-full pt-1.5 opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:pointer-events-auto transition-all duration-200 z-50"
              >
                <div class="bg-white border border-slate-100 rounded-2xl shadow-xl py-2 w-48 text-left">
                  <div class="px-4 py-2.5 border-b border-slate-50">
                    <p class="font-extrabold text-xs text-slate-700">
                      {{ isAuthenticated ? currentUser.name : 'Guest Collector' }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-medium">
                      {{ isAuthenticated ? 'Cabinet Patron' : 'No Account Index' }}
                    </p>
                  </div>

                  <template v-if="isAuthenticated">
                    <button
                      class="w-full text-left px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center space-x-2"
                      @click="scrollToId('profile-header')"
                    >
                      <Settings class="w-3.5 h-3.5" />
                      <span>My Archivist settings</span>
                    </button>
                    <button
                      class="w-full text-left px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center space-x-2"
                      @click="isSupportChatOpen = true"
                    >
                      <HelpCircle class="w-3.5 h-3.5" />
                      <span>Support Desk</span>
                    </button>
                    <button
                      class="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-50 pt-2"
                      @click="handleSimulateLogout"
                    >
                      <LogOut class="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="w-full text-left px-4 py-2 text-xs font-extrabold text-[#2563eb] hover:bg-blue-50 flex items-center space-x-2"
                      @click="handleNavigate('auth')"
                    >
                      <User class="w-3.5 h-3.5" />
                      <span>Login / Register</span>
                    </button>
                    <div
                      class="px-4 py-2 text-[10px] text-slate-400 font-medium border-t border-slate-50 mt-1"
                    >
                      Create an account to activate bookshelves and orders tracking
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Hamburger -->
            <button
              class="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
              id="top-navbar-hamburger-btn"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <Menu class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- MOBILE MENU -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden fixed inset-x-0 top-[64px] bg-white border-b border-slate-100 shadow-xl z-35 animate-fade-in p-4 flex flex-col space-y-2"
      >
        <button
          class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left"
          :class="currentView === 'home' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-slate-600'"
          @click="
            () => {
              isMobileMenuOpen = false
              handleNavigate('home')
            }
          "
        >
          <span>Discover Dashboard</span>
        </button>
        <button
          class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left"
          :class="currentView === 'catalog' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-slate-600'"
          @click="
            () => {
              isMobileMenuOpen = false
              handleNavigate('catalog')
            }
          "
        >
          <span>Category Guides</span>
        </button>
        <button
          class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left"
          :class="currentView === 'account' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-slate-600'"
          @click="
            () => {
              isMobileMenuOpen = false
              handleNavigate('account')
            }
          "
        >
          <span>My Library & Account</span>
        </button>
      </div>
    </nav>

    <!-- Main workspace -->
    <div
      class="flex-grow flex flex-col min-h-[calc(100vh-80px)] bg-[#f8fafc] w-full"
      id="right-workspace-panel"
    >
      <!-- Views -->
      <main class="flex-grow py-5 md:py-8">
        <HomeView
          v-if="currentView === 'home'"
          :books="products"
          :onSelectBook="handleSelectBook"
          :onNavigate="handleNavigate"
          :onAddToCart="handleAddToCart"
          :bookmarks="bookmarks"
          :onToggleBookmark="handleToggleBookmark"
        />

        <CatalogView
          v-if="currentView === 'catalog'"
          :books="products"
          :onSelectBook="handleSelectBook"
          :onAddToCart="handleAddToCart"
          :searchQuery="searchQuery"
          :onSearchChange="(query) => (searchQuery = query)"
          :bookmarks="bookmarks"
          :onToggleBookmark="handleToggleBookmark"
        />

        <BookDetailView
          v-if="currentView === 'detail' && selectedBook"
          :book="selectedBook"
          :onBack="() => handleNavigate('catalog')"
          :onAddToCart="handleAddToCart"
          :isBookmarked="bookmarks.includes(selectedBook.id)"
          :onToggleBookmark="handleToggleBookmark"
        />

        <ErrorView
          v-if="currentView === 'detail' && !selectedBook"
          :onNavigateHome="() => handleNavigate('home')"
          :onNavigateCatalog="() => handleNavigate('catalog')"
        />

        <CheckoutView
          v-if="currentView === 'checkout'"
          :cart="cart"
          :onPlaceOrder="handlePlaceOrder"
          :onClearCart="handleClearCart"
          :onNavigate="handleNavigate"
        />

        <AccountView
          v-if="currentView === 'account'"
          :books="products"
          :orders="orders"
          :onSelectBook="handleSelectBook"
          :bookmarks="bookmarks"
          :onToggleBookmark="handleToggleBookmark"
          :currentUser="currentUser"
        />

        <FavoriteView
          v-if="currentView === 'favorite'"
          :books="products"
          :bookmarks="bookmarks"
          :onSelectBook="handleSelectBook"
          :onToggleBookmark="handleToggleBookmark"
        />

        <AuthView
          v-if="currentView === 'auth'"
          :onAuthSuccess="handleAuthSuccess"
          :onCancel="() => handleNavigate('home')"
        />

        <ErrorView
          v-if="!['home', 'catalog', 'detail', 'checkout', 'account', 'favorite', 'auth'].includes(currentView)"
          :onNavigateHome="() => handleNavigate('home')"
          :onNavigateCatalog="() => handleNavigate('catalog')"
        />
      </main>

      <Footer />
    </div>

    <!-- CART SIDEBAR -->
    <CartSidebar
      :isOpen="isCartOpen"
      :onClose="() => (isCartOpen = false)"
      :cart="cart"
      :onUpdateQuantity="handleUpdateQuantity"
      :onRemoveItem="handleRemoveItem"
      :onGotoCheckout="
        () => {
          isCartOpen = false
          handleNavigate('checkout')
        }
      "
    />

    <!-- AUDIO PLAYER -->
    <div
      v-if="isAudioDrawerOpen"
      class="fixed inset-y-0 right-0 w-80 bg-slate-900 text-white shadow-2xl z-50 flex flex-col justify-between border-l border-slate-800 animate-slide-in"
    >
      <div class="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-2 text-blue-400">
          <Headphones class="w-5 h-5" />
          <span class="font-bold text-sm tracking-tight text-white">Audio Stream</span>
        </div>
        <button
          class="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
          @click="isAudioDrawerOpen = false"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-6 space-y-6 flex-grow overflow-y-auto">
        <div class="bg-slate-950/90 rounded-3xl p-5 border border-slate-800/80 space-y-4 shadow-inner text-center">
          <p class="text-[9px] text-[#2563eb] font-bold tracking-[0.2em] uppercase">
            {{ audioPlaying ? 'STREAMING ACTIVE' : 'STREAM STREAMER' }}
          </p>
          <div class="flex justify-center py-2 relative">
            <div
              class="w-32 h-32 rounded-full border-4 border-slate-700/60 flex items-center justify-center shadow-lg relative"
              :class="audioPlaying ? 'animate-spin' : ''"
              style="
                background: linear-gradient(to top right, #0f172a, #020617, #0f172a);
                animation-duration: 12s;
              "
            >
              <div class="w-12 h-12 rounded-full bg-slate-900 border-2 border-[#2563eb]/40" />
              <Headphones class="w-5 h-5 absolute text-slate-500" />
            </div>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-xs text-slate-100 line-clamp-1">
              {{ audioTracks[activeAudioIndex].title }}
            </h4>
            <p class="text-[10px] text-slate-400 font-medium">{{ audioTracks[activeAudioIndex].author }}</p>
          </div>
          <div class="space-y-1 pt-2">
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{{ formatSeconds(playbackSeconds) }}</span>
              <span>{{ audioTracks[activeAudioIndex].duration }}</span>
            </div>
            <div class="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-1000"
                :style="{ width: `${Math.min(100, (playbackSeconds / 380) * 100)}%` }"
              />
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">Available Digital Chapters</p>
          <div class="space-y-2">
            <div
              v-for="(track, idx) in audioTracks"
              :key="idx"
              class="p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all text-left"
              :class="
                idx === activeAudioIndex
                  ? 'bg-[#2563eb]/10 border-[#2563eb]/40 text-white'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              "
              @click="
                () => {
                  activeAudioIndex = idx
                  playbackSeconds = Math.floor(Math.random() * 20) + 10
                  audioPlaying = true
                }
              "
            >
              <div class="space-y-0.5 max-w-[80%]">
                <p class="font-bold text-xs leading-tight line-clamp-1">{{ track.title }}</p>
                <p class="text-[10px] text-slate-500 font-medium">{{ track.author }}</p>
              </div>
              <span class="text-[10px] text-slate-500 font-mono">{{ track.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
        <div class="flex items-center justify-around py-1">
          <button
            class="text-slate-400 hover:text-white p-2"
            title="Previous track"
            @click="
              () => {
                activeAudioIndex = activeAudioIndex === 0 ? audioTracks.length - 1 : activeAudioIndex - 1
                playbackSeconds = 0
              }
            "
          >
            <ChevronRight class="w-5 h-5" style="transform: rotate(180deg)" />
          </button>
          <button
            class="bg-[#2563eb] text-white p-3.5 rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-500/20"
            :title="audioPlaying ? 'Pause Audiobook' : 'Play Audiobook'"
            @click="audioPlaying = !audioPlaying"
          >
            <Pause v-if="audioPlaying" class="w-5 h-5" />
            <Play v-else class="w-5 h-5" />
          </button>
          <button
            class="text-slate-400 hover:text-white p-2"
            title="Next track"
            @click="
              () => {
                activeAudioIndex = (activeAudioIndex + 1) % audioTracks.length
                playbackSeconds = 0
              }
            "
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
        <div class="flex items-center space-x-3 px-2 text-slate-400">
          <Volume2 class="w-4 h-4 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            v-model="volume"
            class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
          />
          <span class="text-[10px] font-mono min-w-[20px]">{{ volume }}%</span>
        </div>
      </div>
    </div>

    <!-- DOWNLOAD MODAL -->
    <div
      v-if="isDownloadModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-white rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto text-left">
        <button
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"
          @click="isDownloadModalOpen = false"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="space-y-2">
          <div class="bg-blue-50 text-[#2563eb] w-10 h-10 rounded-2xl flex items-center justify-center">
            <Download class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-lg text-slate-800">BookBase Prints & Downloads</h3>
          <p class="text-xs text-slate-400 leading-relaxed font-light">
            Retrieve rich digital formats of your book purchases immediately. Connect with portable e-reader
            configurations for Kindles, Tablets, and e-paper notes.
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <div
            v-for="item in [
              { fileId: 'doc-pom', title: 'The Psychology of Money', type: 'Official EPUB e-Reader', size: '8.6 MB', tag: 'E-Reader' },
              { fileId: 'doc-inno', title: 'How Innovation Works', type: 'Full Digital Textbook Edition (PDF)', size: '14.2 MB', tag: 'Portable Tablet' },
              { fileId: 'doc-grid', title: 'Swiss Grid Typography Manual', type: 'Vector Pages & Outlines (ZIP)', size: '45.0 MB', tag: 'Work Outlines' },
              { fileId: 'doc-poem', title: 'Sylvia Vance Vol. 3 Poems', type: 'Clean Print Edition', size: '3.1 MB', tag: 'Booklet' },
            ]"
            :key="item.fileId"
            class="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="bg-[#2563eb]/10 text-[#2563eb] px-2 py-0.5 text-[8px] font-bold rounded-full uppercase">
                  {{ item.tag }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">{{ item.size }}</span>
              </div>
              <h4 class="font-bold text-xs text-slate-700">{{ item.title }}</h4>
              <p class="text-[10px] text-slate-400 font-light">{{ item.type }}</p>
            </div>
            <div class="flex-shrink-0 min-w-[110px]" id="downloads-trigger-block">
              <div v-if="downloadProgress[item.fileId] !== undefined && downloadProgress[item.fileId] < 100" class="space-y-1 text-center">
                <span class="text-[10px] font-bold text-slate-500 font-mono">Loading {{ downloadProgress[item.fileId] }}%</span>
                <div class="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div class="bg-[#2563eb] h-full" :style="{ width: `${downloadProgress[item.fileId]}%` }" />
                </div>
              </div>
              <span
                v-else-if="downloadProgress[item.fileId] === 100"
                class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
              >
                <Check class="w-3 h-3" />
                <span>Finished</span>
              </span>
              <button
                v-else
                class="w-full bg-white hover:bg-[#2563eb] hover:text-white border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 text-center transition-all cursor-pointer"
                @click="startDownloadSimulator(item.fileId, item.title)"
              >
                Download Print
              </button>
            </div>
          </div>
        </div>

        <div v-if="downloadSuccessToast" class="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-2xl flex items-center space-x-2 text-xs animate-fade-in">
          <Check class="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span class="font-medium">{{ downloadSuccessToast }}</span>
        </div>

        <div class="pt-2 text-center">
          <span class="text-[10px] text-slate-400 font-mono uppercase"> Secure SSL File Sockets Active </span>
        </div>
      </div>
    </div>

    <!-- SUPPORT CHAT -->
    <div
      v-if="isSupportChatOpen"
      class="fixed bottom-6 right-6 w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col justify-between animate-slide-up text-left"
    >
      <div class="p-4 bg-[#2563eb] text-white flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative">
            <Sparkles class="w-5 h-5 text-white animate-pulse" />
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#2563eb]" />
          </div>
          <div class="leading-tight">
            <h4 class="font-bold text-xs tracking-tight">BookBase Assistant</h4>
            <p class="text-[9px] text-blue-100 font-medium">Replies dynamically on immediate ticks</p>
          </div>
        </div>
        <button class="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg" @click="isSupportChatOpen = false">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-4 space-y-3.5 h-64 overflow-y-auto bg-[#f8fafc]/50">
        <div
          v-for="(msg, idx) in chatMessages"
          :key="idx"
          class="flex"
          :class="msg.sender === 'bot' ? 'justify-start' : 'justify-end'"
        >
          <div v-if="msg.sender === 'bot'" class="w-6 h-6 rounded-lg bg-blue-100 text-[#2563eb] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            BB
          </div>
          <div
            class="max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed"
            :class="
              msg.sender === 'bot'
                ? 'bg-white text-slate-700 rounded-bl-xs border border-slate-100 shadow-xs'
                : 'bg-[#2563eb] text-white rounded-br-xs shadow-md'
            "
          >
            {{ msg.text }}
          </div>
        </div>
        <div v-if="botIsTyping" class="flex justify-start items-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-blue-100 text-[#2563eb] flex items-center justify-center text-[10px] font-bold">...</div>
          <span class="text-[10px] text-slate-400 font-mono animate-pulse">Assistant typing replies...</span>
        </div>
      </div>

      <form class="p-3 bg-white border-t border-slate-50 flex items-center gap-2" @submit.prevent="handleSendChatMessage">
        <input
          type="text"
          placeholder="Ask about active coupons, shipping time..."
          v-model="userChatText"
          class="flex-grow bg-[#f1f5f9] hover:bg-slate-200/40 text-xs py-2.5 px-3.5 rounded-xl border border-transparent focus:border-[#2563eb]/20 outline-none font-medium text-slate-700"
          id="live-chat-input-text"
        />
        <button type="submit" class="p-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-600 transition-all cursor-pointer" title="Send Message">
          <Send class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>

<style>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
