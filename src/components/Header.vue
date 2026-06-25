<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, ShoppingBag, User, Search, X, Heart, ChevronDown } from 'lucide-vue-next'
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

const showSearchInput = ref(false)

const scrollToFooter = () => {
  const footer = document.getElementById('footer-root-container')
  if (footer) footer.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__backdrop" aria-hidden="true" />
    <div class="site-header__inner">
      <button
        type="button"
        @click="onNavigate('home')"
        class="brand"
        id="header-brand-container"
      >
        <div class="brand__mark">
          <BookOpen class="brand__icon" />
        </div>
        <div class="brand__copy">
          <h1>BookBase</h1>
          <p>The archive shop</p>
        </div>
      </button>

      <nav class="header-nav" id="nav-container-desktop">
        <button
          type="button"
          @click="onNavigate('home')"
          class="header-link"
          :class="{ 'is-active': currentView === 'home' }"
          id="nav-home-btn"
        >
          <span>Home</span>
          <ChevronDown class="header-link__icon" />
        </button>
        <button
          type="button"
          @click="onNavigate('catalog')"
          class="header-link"
          :class="{ 'is-active': currentView === 'catalog' }"
          id="nav-catalog-btn"
        >
          <span>Catalog</span>
          <ChevronDown class="header-link__icon" />
        </button>
        <button
          type="button"
          @click="onNavigate('catalog')"
          class="header-link"
          id="nav-blog-btn"
        >
          <span>Blog</span>
          <ChevronDown class="header-link__icon" />
        </button>
        <button
          type="button"
          @click="onNavigate('account')"
          class="header-link"
          :class="{ 'is-active': currentView === 'account' }"
          id="nav-account-btn"
        >
          <span>My Library</span>
          <ChevronDown class="header-link__icon" />
        </button>
        <button
          type="button"
          @click="scrollToFooter"
          class="header-link header-link--plain"
          id="nav-contact-btn"
        >
          Contact
        </button>
      </nav>

      <div class="header-actions">
        <div class="header-search">
          <div v-if="showSearchInput" class="header-search__panel">
            <Search class="header-search__icon" />
            <input
              type="text"
              placeholder="ISBN, Category, Author..."
              :value="searchQuery"
              @input="(e) => onSearchChange((e.target as HTMLInputElement).value)"
              @keydown.enter="onNavigate('catalog')"
              class="header-search__input"
              autofocus
              id="search-input-field"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="onSearchChange('')"
              class="header-search__clear"
              id="search-clear-btn"
            >
              <X class="header-search__clear-icon" />
            </button>
          </div>

          <button
            type="button"
            @click="showSearchInput = !showSearchInput"
            class="icon-button"
            title="Search Book Database"
            id="header-search-icon-btn"
          >
            <Search class="icon-button__icon" />
          </button>
        </div>

        <button
          type="button"
          @click="onNavigate('account')"
          class="icon-button icon-button--bookmark"
          title="Saved Bookmarks Collection"
          id="header-bookmarks-icon-btn"
        >
          <Heart class="icon-button__icon" />
          <span v-if="bookmarkCount > 0" class="badge badge--bookmark">
            {{ bookmarkCount }}
          </span>
        </button>

        <button
          type="button"
          @click="onNavigate('account')"
          class="icon-button"
          title="Archivist Dashboard"
          id="header-account-icon-btn"
        >
          <User class="icon-button__icon" />
        </button>

        <button
          type="button"
          @click="onOpenCart"
          class="icon-button icon-button--cart"
          title="Open Interactive Cart"
          id="header-cart-icon-btn"
        >
          <ShoppingBag class="icon-button__icon" />
          <span v-if="cartCount > 0" class="badge badge--cart">
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="header-mobile" id="nav-container-mobile">
      <button
        type="button"
        @click="onNavigate('home')"
        class="header-mobile__link"
        :class="{ 'is-active': currentView === 'home' }"
      >
        Home
      </button>
      <button
        type="button"
        @click="onNavigate('catalog')"
        class="header-mobile__link"
        :class="{ 'is-active': currentView === 'catalog' }"
      >
        Catalog
      </button>
      <button
        type="button"
        @click="onNavigate('catalog')"
        class="header-mobile__link"
      >
        Blog
      </button>
      <button
        type="button"
        @click="onNavigate('account')"
        class="header-mobile__link"
        :class="{ 'is-active': currentView === 'account' }"
      >
        My Library
      </button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  width: 100%;
  border-bottom: 1px solid rgba(226, 232, 240, 0.82);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.78)),
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 30%),
    radial-gradient(circle at top right, rgba(255, 176, 31, 0.08), transparent 28%);
  backdrop-filter: blur(20px);
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.06),
    inset 0 -1px 0 rgba(255, 255, 255, 0.6);
}

.site-header__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 26%),
    radial-gradient(circle at top right, rgba(255, 176, 31, 0.08), transparent 24%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
}

.site-header__inner {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 86rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.15rem;
  padding: 1rem 1rem 0.9rem;
}

.brand {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.25rem 0.5rem 0.25rem 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: transform 220ms ease;
}

.brand:hover {
  transform: translateY(-1px);
}

.brand__mark {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 35%),
    linear-gradient(135deg, #0f172a, #1d4ed8 55%, #2563eb);
  color: #ffffff;
  box-shadow:
    0 18px 30px rgba(37, 99, 235, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.brand__icon {
  width: 1.15rem;
  height: 1.15rem;
}

.brand__copy {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.brand__copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 900;
}

.brand__copy p {
  margin: 0;
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.header-nav {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  background: rgba(248, 250, 252, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.header-link {
  appearance: none;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.7rem 1rem;
  border-radius: 9999px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    background-color 220ms ease;
}

.header-link:hover {
  transform: translateY(-1px);
  color: #0f172a;
  background: rgba(255, 255, 255, 0.9);
}

.header-link.is-active {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.18);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(29, 78, 216, 0.04));
}

.header-link__icon {
  width: 0.8rem;
  height: 0.8rem;
  opacity: 0.55;
}

.header-link--plain {
  letter-spacing: 0.1em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 1.1rem;
  background: rgba(248, 250, 252, 0.6);
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.header-search__panel {
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 18rem;
  padding: 0.6rem 0.8rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  box-shadow:
    0 20px 45px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
}

.header-search__icon {
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
  flex: 0 0 auto;
}

.header-search__input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 600;
}

.header-search__input::placeholder {
  color: #94a3b8;
}

.header-search__clear {
  appearance: none;
  border: 0;
  padding: 0.15rem;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: color 220ms ease, transform 220ms ease;
}

.header-search__clear:hover {
  color: #0f172a;
  transform: scale(1.05);
}

.header-search__clear-icon {
  width: 0.85rem;
  height: 0.85rem;
}

.icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.85rem;
  height: 2.85rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  color: #0f172a;
  cursor: pointer;
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  transition:
    transform 220ms ease,
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    box-shadow 220ms ease;
}

.icon-button:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 99, 235, 0.16);
  color: #2563eb;
  box-shadow:
    0 18px 30px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.icon-button__icon {
  width: 1rem;
  height: 1rem;
}

.icon-button--cart:hover {
  color: #1d4ed8;
}

.icon-button--bookmark:hover {
  color: #ef4444;
}

.badge {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  min-width: 1rem;
  height: 1rem;
  display: grid;
  place-items: center;
  padding: 0 0.28rem;
  border-radius: 9999px;
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

.badge--bookmark {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.badge--cart {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.header-mobile {
  margin: 0 auto;
  max-width: 86rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.6rem;
  padding: 0 1rem 1rem;
  color: #64748b;
}

.header-mobile__link {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 9999px;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.92);
  color: inherit;
  cursor: pointer;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    background-color 220ms ease;
}

.header-mobile__link:hover {
  transform: translateY(-1px);
  color: #0f172a;
}

.header-mobile__link.is-active {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.06);
}

@media (min-width: 768px) {
  .site-header__inner {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .header-nav {
    display: flex;
  }

  .header-mobile {
    display: none;
  }
}

@media (max-width: 767px) {
  .site-header__inner {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .site-header {
    border-bottom-color: rgba(226, 232, 240, 0.72);
  }

  .brand__copy h1 {
    font-size: 1rem;
  }

  .header-nav {
    display: none;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    order: 3;
  }

  .header-search__panel {
    min-width: min(16rem, calc(100vw - 8rem));
  }
}
</style>
