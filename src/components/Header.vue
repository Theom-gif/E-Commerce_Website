<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, ShoppingBag, User, Search, X, Heart, Bell } from 'lucide-vue-next'
import type { CartItem } from '../types'

type HeaderProps = {
  currentView: string
  onNavigate: (view: string) => void
  cart: CartItem[]
  cartCount: number
  onOpenCart: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  bookmarkCount?: number
}

const props = withDefaults(defineProps<HeaderProps>(), {
  bookmarkCount: 0,
})

const searchFocused = ref(false)

const scrollToFooter = () => {
  const footer = document.getElementById('footer-root-container')
  if (footer) footer.scrollIntoView({ behavior: 'smooth' })
}

const handleSearchKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') props.onNavigate('catalog')
  if (e.key === 'Escape') searchFocused.value = false
}
</script>

<template>
  <header class="hdr">
    <div class="hdr__bar">

      <!-- ── Brand ── -->
      <button type="button" @click="onNavigate('home')" class="hdr__brand" id="header-brand-container">
        <span class="hdr__logo">
          <BookOpen :size="16" stroke-width="2.5" />
        </span>
        <span class="hdr__wordmark">BookBase</span>
      </button>

      <!-- ── Desktop Nav ── -->
      <nav class="hdr__nav" id="nav-container-desktop" aria-label="Main navigation">
        <button type="button" @click="onNavigate('home')"
          class="hdr__link" :class="{ 'hdr__link--on': currentView === 'home' }" id="nav-home-btn">
          Home
        </button>
        <button type="button" @click="onNavigate('catalog')"
          class="hdr__link" :class="{ 'hdr__link--on': currentView === 'catalog' }" id="nav-catalog-btn">
          Catalog
        </button>
        <button type="button" @click="onNavigate('catalog')"
          class="hdr__link" id="nav-blog-btn">
          Blog
        </button>
        <button type="button" @click="onNavigate('account')"
          class="hdr__link" :class="{ 'hdr__link--on': currentView === 'account' }" id="nav-account-btn">
          My Library
        </button>
        <button type="button" @click="scrollToFooter"
          class="hdr__link" id="nav-contact-btn">
          Contact
        </button>
      </nav>

      <!-- ── Search + Actions ── -->
      <div class="hdr__right">

        <!-- Inline Search -->
        <div class="hdr__search" :class="{ 'hdr__search--focused': searchFocused }">
          <Search :size="15" class="hdr__search-ico" />
          <input
            type="text"
            placeholder="Search products, brands…"
            :value="searchQuery"
            @input="(e) => onSearchChange((e.target as HTMLInputElement).value)"
            @keydown="handleSearchKey"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            class="hdr__search-input"
            id="search-input-field"
          />
          <button v-if="searchQuery" type="button" @click="onSearchChange('')" class="hdr__search-clear" id="search-clear-btn">
            <X :size="12" />
          </button>
        </div>

        <!-- Divider -->
        <div class="hdr__div" aria-hidden="true" />

        <!-- Icon cluster -->
        <div class="hdr__icons">
          <!-- Bookmarks -->
          <button type="button" @click="onNavigate('account')" class="hdr__ico" title="Saved items" id="header-bookmarks-icon-btn">
            <Heart :size="17" :class="bookmarkCount > 0 ? 'ico-heart-on' : ''" />
            <span v-if="bookmarkCount > 0" class="hdr__dot hdr__dot--red">{{ bookmarkCount }}</span>
          </button>

          <!-- Account pill -->
          <button type="button" @click="onNavigate('account')" class="hdr__account" title="My Account" id="header-account-icon-btn">
            <span class="hdr__avatar">A</span>
            <span class="hdr__account-label">Account</span>
          </button>

          <!-- Cart -->
          <button type="button" @click="onOpenCart" class="hdr__cart" title="Shopping cart" id="header-cart-icon-btn">
            <ShoppingBag :size="17" />
            <span v-if="cartCount > 0" class="hdr__dot hdr__dot--blue">{{ cartCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Mobile Nav ── -->
    <nav class="hdr__mob" id="nav-container-mobile" aria-label="Mobile navigation">
      <button type="button" @click="onNavigate('home')" class="hdr__mob-link" :class="{ 'hdr__mob-link--on': currentView === 'home' }">Home</button>
      <button type="button" @click="onNavigate('catalog')" class="hdr__mob-link" :class="{ 'hdr__mob-link--on': currentView === 'catalog' }">Catalog</button>
      <button type="button" @click="onNavigate('catalog')" class="hdr__mob-link">Blog</button>
      <button type="button" @click="onNavigate('account')" class="hdr__mob-link" :class="{ 'hdr__mob-link--on': currentView === 'account' }">Library</button>
    </nav>
  </header>
</template>

<style scoped>
/* ─── Root ─── */
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #f0f2f5;
  box-shadow: 0 1px 0 #f0f2f5, 0 4px 24px rgba(15, 23, 42, 0.04);
}

.hdr__bar {
  max-width: 88rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 1.75rem;
  height: 62px;
}

/* ─── Brand ─── */
.hdr__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: opacity 180ms;
}
.hdr__brand:hover { opacity: 0.8; }

.hdr__logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(145deg, #1d4ed8, #2563eb, #3b82f6);
  display: grid;
  place-items: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}

.hdr__wordmark {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.035em;
  line-height: 1;
}

/* ─── Nav ─── */
.hdr__nav {
  display: none;
  align-items: center;
  gap: 0.1rem;
  flex: 1;
}

.hdr__link {
  position: relative;
  appearance: none;
  background: none;
  border: none;
  padding: 0.5rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: color 180ms, background-color 180ms;
  white-space: nowrap;
}
.hdr__link:hover {
  color: #111827;
  background: #f9fafb;
}
.hdr__link--on {
  color: #2563eb;
  font-weight: 700;
}
.hdr__link--on::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0.7rem;
  right: 0.7rem;
  height: 2px;
  border-radius: 2px;
  background: #2563eb;
}

/* ─── Right area ─── */
.hdr__right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-left: auto;
  flex-shrink: 0;
}

/* ─── Search ─── */
.hdr__search {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 1rem;
  background: #f4f6f8;
  border: 1.5px solid transparent;
  border-radius: 10px;
  width: 220px;
  transition: all 220ms;
}
.hdr__search--focused {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  width: 270px;
}
.hdr__search-ico {
  color: #9ca3af;
  flex-shrink: 0;
  transition: color 180ms;
}
.hdr__search--focused .hdr__search-ico { color: #2563eb; }
.hdr__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
  color: #111827;
  min-width: 0;
}
.hdr__search-input::placeholder { color: #9ca3af; }
.hdr__search-clear {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 4px;
  transition: color 150ms;
  flex-shrink: 0;
}
.hdr__search-clear:hover { color: #374151; }

/* ─── Divider ─── */
.hdr__div {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* ─── Icon cluster ─── */
.hdr__icons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.hdr__ico {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 180ms, background-color 180ms;
}
.hdr__ico:hover { color: #111827; background: #f3f4f6; }
.ico-heart-on { fill: #ef4444; color: #ef4444 !important; }

/* Account pill */
.hdr__account {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem 0.35rem 0.35rem;
  border-radius: 9999px;
  border: 1.5px solid #e5e7eb;
  background: none;
  cursor: pointer;
  transition: border-color 180ms, background-color 180ms;
}
.hdr__account:hover { border-color: #d1d5db; background: #f9fafb; }
.hdr__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hdr__account-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

/* Cart */
.hdr__cart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  background: #111827;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 200ms, transform 150ms, box-shadow 200ms;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.2);
  white-space: nowrap;
}
.hdr__cart:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(29, 78, 216, 0.35);
}

/* Dots / badges */
.hdr__dot {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 17px;
  height: 17px;
  border-radius: 9999px;
  font-size: 0.55rem;
  font-weight: 900;
  color: #fff;
  display: grid;
  place-items: center;
  padding: 0 3px;
  border: 2px solid #fff;
  line-height: 1;
}
.hdr__dot--blue { background: #2563eb; }
.hdr__dot--red  { background: #ef4444; }

/* ─── Mobile Nav ─── */
.hdr__mob {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.6rem 1rem;
  border-top: 1px solid #f3f4f6;
  overflow-x: auto;
  scrollbar-width: none;
}
.hdr__mob::-webkit-scrollbar { display: none; }

.hdr__mob-link {
  appearance: none;
  border: none;
  background: none;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 180ms, background-color 180ms;
}
.hdr__mob-link:hover { color: #111827; background: #f3f4f6; }
.hdr__mob-link--on { color: #2563eb; background: rgba(37, 99, 235, 0.07); font-weight: 700; }

/* ─── Responsive ─── */
@media (min-width: 768px) {
  .hdr__nav { display: flex; }
  .hdr__mob { display: none; }
  .hdr__bar { padding: 0 2.5rem; }
}

@media (max-width: 767px) {
  .hdr__search { width: 140px; }
  .hdr__search--focused { width: 190px; }
  .hdr__account-label { display: none; }
  .hdr__account { padding: 0.35rem; }
  .hdr__div { display: none; }
}

@media (max-width: 480px) {
  .hdr__search { display: none; }
  .hdr__cart { padding: 0.5rem 0.75rem; }
}
</style>
