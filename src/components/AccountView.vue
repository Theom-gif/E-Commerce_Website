<script setup lang="ts">
import { computed, ref } from 'vue'
import { MOCK_USER } from '../data'
import type { Book, Order, UserProfile } from '../types'
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Copy, Heart, Mail, MapPin, Package, Phone, User } from 'lucide-vue-next'

const props = defineProps<{
  books: Book[]
  orders: Order[]
  onSelectBook: (id: string) => void
  bookmarks: string[]
  onToggleBookmark: (id: string) => void
  currentUser?: { name: string; email: string }
}>()

function createProfile() {
  if (props.currentUser?.name) {
    return {
      ...MOCK_USER,
      name: props.currentUser.name,
      email: props.currentUser.email,
      shippingAddress: {
        ...MOCK_USER.shippingAddress,
        fullName: props.currentUser.name,
        email: props.currentUser.email,
      },
    }
  }

  return MOCK_USER
}

const profile = ref<UserProfile>(createProfile())
const nameInput = ref(profile.value.name)
const emailInput = ref(profile.value.email)
const phoneInput = ref(profile.value.phoneNumber)
const addressInput = ref(profile.value.shippingAddress.address)
const cityInput = ref(profile.value.shippingAddress.city)
const postalInput = ref(profile.value.shippingAddress.postalCode)
const editSuccess = ref(false)
const expandedOrderId = ref<string | null>(null)
const selectedCategory = ref('All Categories')
const copiedBookId = ref<string | null>(null)
const isCategoryDropdownOpen = ref(false)

const bookmarkedBooks = computed(() => props.books.filter((book) => props.bookmarks.includes(book.id)))
const availableCategories = computed(() => ['All Categories', ...Array.from(new Set(bookmarkedBooks.value.map((book) => book.category).filter(Boolean)))])
const filteredBookmarkedBooks = computed(() =>
  selectedCategory.value === 'All Categories'
    ? bookmarkedBooks.value
    : bookmarkedBooks.value.filter((book) => book.category === selectedCategory.value),
)
const totalOrderValue = computed(() => props.orders.reduce((sum, order) => sum + order.total, 0))

function toggleOrderAccordion(id: string) {
  expandedOrderId.value = expandedOrderId.value === id ? null : id
}

function handleProfileSave(e: Event) {
  e.preventDefault()

  profile.value = {
    ...profile.value,
    name: nameInput.value,
    email: emailInput.value,
    phoneNumber: phoneInput.value,
    shippingAddress: {
      ...profile.value.shippingAddress,
      fullName: nameInput.value,
      email: emailInput.value,
      address: addressInput.value,
      city: cityInput.value,
      postalCode: postalInput.value,
    },
  }

  editSuccess.value = true
  window.setTimeout(() => {
    editSuccess.value = false
  }, 2400)
}

function copyShareLink(book: { id: string }) {
  const url = `${window.location.origin}/#detail?id=${book.id}`
  navigator.clipboard.writeText(url)
  copiedBookId.value = book.id

  window.setTimeout(() => {
    copiedBookId.value = null
  }, 1800)
}
</script>

<template>
  <div class="account-shell" id="account-view-container">
    <div class="account-backdrop" aria-hidden="true">
      <div class="account-orb account-orb--blue" />
      <div class="account-orb account-orb--amber" />
      <div class="account-orb account-orb--ink" />
    </div>

    <div class="account-inner">
      <header class="account-hero">
        <div class="account-hero__copy">
          <span class="eyebrow">Archivist registry</span>
          <h2>Collector Registry No. {{ profile.joinedDate.replace(/[^0-9]/g, '') || '2024' }}</h2>
          <p>
            Archiving since {{ profile.joinedDate }}. Member status:
            <strong>{{ profile.membershipTier }}</strong>
          </p>
        </div>

        <div class="hero-card">
          <User class="hero-card__icon" />
          <div>
            <span>Certified rank</span>
            <strong>{{ profile.membershipTier }} Archivist</strong>
          </div>
        </div>
      </header>

      <div class="metric-strip">
        <div class="metric-card">
          <span>Orders</span>
          <strong>{{ orders.length }}</strong>
        </div>
        <div class="metric-card">
          <span>Total spend</span>
          <strong>${{ totalOrderValue.toFixed(2) }}</strong>
        </div>
        <div class="metric-card">
          <span>Bookmarks</span>
          <strong>{{ bookmarks.length }}</strong>
        </div>
      </div>

      <div class="account-grid">
        <section class="profile-panel">
          <div class="panel-head">
            <div>
              <span class="panel-kicker">Profile</span>
              <h3>Registry metrics</h3>
            </div>
            <Mail class="panel-icon" />
          </div>

          <div v-if="editSuccess" class="notice notice-success">
            <CheckCircle class="notice-icon" />
            Profile updated successfully.
          </div>

          <form class="profile-form" @submit.prevent="handleProfileSave">
            <label class="field">
              <span>Collector full name</span>
              <div class="input-shell">
                <User class="field-icon" />
                <input id="edit-profile-name" v-model="nameInput" type="text" required />
              </div>
            </label>

            <label class="field">
              <span>Email address</span>
              <div class="input-shell">
                <Mail class="field-icon" />
                <input id="edit-profile-email" v-model="emailInput" type="email" required />
              </div>
            </label>

            <label class="field">
              <span>Phone number</span>
              <div class="input-shell">
                <Phone class="field-icon" />
                <input id="edit-profile-phone" v-model="phoneInput" type="text" required />
              </div>
            </label>

            <div class="address-card">
              <div class="address-card__head">
                <MapPin class="panel-icon" />
                <span>Delivery address</span>
              </div>

              <label class="field">
                <span>Street</span>
                <input id="edit-profile-addr" v-model="addressInput" type="text" required />
              </label>

              <div class="field-grid field-grid--two">
                <label class="field">
                  <span>City</span>
                  <input id="edit-profile-city" v-model="cityInput" type="text" required />
                </label>
                <label class="field">
                  <span>Postal code</span>
                  <input id="edit-profile-zip" v-model="postalInput" type="text" required />
                </label>
              </div>
            </div>

            <button type="submit" class="button button-dark" id="save-profile-btn">
              Save registry
            </button>
          </form>
        </section>

        <section class="content-stack">
          <div class="orders-panel">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Orders</span>
                <h3>Secured ledger transactions</h3>
              </div>
              <Package class="panel-icon" />
            </div>

            <div class="order-list">
              <article v-for="order in orders" :key="order.id" class="order-card" :id="`order-row-${order.id}`">
                <button type="button" class="order-summary" @click="toggleOrderAccordion(order.id)">
                  <div class="order-meta">
                    <div>
                      <span>ID code</span>
                      <strong>{{ order.id }}</strong>
                    </div>
                    <div>
                      <span>Commit date</span>
                      <strong>{{ order.date }}</strong>
                    </div>
                    <div>
                      <span>Total value</span>
                      <strong>${{ order.total.toFixed(2) }}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <em :class="order.status === 'Delivered' ? 'status status--good' : 'status status--pending'">
                        {{ order.status }}
                      </em>
                    </div>
                  </div>

                  <component :is="expandedOrderId === order.id ? ChevronUp : ChevronDown" class="panel-icon" />
                </button>

                <transition name="fold">
                  <div v-if="expandedOrderId === order.id" class="order-details" :id="`order-expanded-${order.id}`">
                    <div class="ordered-items">
                      <div v-for="item in order.items" :key="item.book.id" class="ordered-item" @click="onSelectBook(item.book.id)">
                        <BookOpen class="mini-icon" />
                        <div>
                          <strong>{{ item.book.title }}</strong>
                          <span>x{{ item.quantity }} - ${{ (item.book.price * item.quantity).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="order-secondary">
                      <div>
                        <span>Delivery destination</span>
                        <p>{{ order.shippingAddress.fullName }}</p>
                        <p>{{ order.shippingAddress.address }}, {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
                      </div>
                      <div v-if="order.discountApplied">
                        <span>Discount applied</span>
                        <p>Code {{ order.discountApplied.code }}</p>
                        <p>Saved ${{ order.discountApplied.amount.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>
                </transition>
              </article>
            </div>
          </div>

          <div class="bookmarks-panel" id="bookmarks-shelf">
            <div class="panel-head panel-head--split">
              <div>
                <span class="panel-kicker">Bookmarks</span>
                <h3>My books</h3>
              </div>

              <div class="category-picker">
                <button type="button" class="button button-light category-button" @click="isCategoryDropdownOpen = !isCategoryDropdownOpen">
                  <span>{{ selectedCategory }}</span>
                  <ChevronDown class="panel-icon" />
                </button>
                <div v-if="isCategoryDropdownOpen" class="category-menu">
                  <button
                    v-for="category in availableCategories"
                    :key="category"
                    type="button"
                    :class="{ 'is-active': selectedCategory === category }"
                    @click="selectedCategory = category; isCategoryDropdownOpen = false"
                  >
                    {{ category }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="bookmarkedBooks.length === 0" class="empty-panel">
              <Heart class="empty-panel__icon" />
              <p>Your saved collection is empty. Bookmark books in the catalog to build this shelf.</p>
            </div>

            <div v-else-if="filteredBookmarkedBooks.length === 0" class="empty-panel">
              <p>No books found in "{{ selectedCategory }}".</p>
              <button type="button" class="text-link" @click="selectedCategory = 'All Categories'">Clear filter</button>
            </div>

            <div v-else class="bookmark-grid" id="bookmark-saves-grid">
              <article
                v-for="book in filteredBookmarkedBooks"
                :key="book.id"
                class="bookmark-card"
                :id="`bookmark-card-${book.id}`"
                @click="onSelectBook(book.id)"
              >
                <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" />

                <div class="bookmark-copy">
                  <div>
                    <h4>{{ book.title }}</h4>
                    <p>{{ book.description || book.subtitle }}</p>
                  </div>

                  <div class="bookmark-actions">
                    <button type="button" class="button button-light" @click.stop="onSelectBook(book.id)" :id="`read-more-btn-${book.id}`">
                      Read more
                    </button>
                    <div class="icon-row">
                      <button
                        type="button"
                        class="icon-button"
                        :id="`share-btn-${book.id}`"
                        title="Copy share link"
                        @click.stop="copyShareLink(book)"
                      >
                        <Copy class="mini-icon" />
                      </button>
                      <button
                        type="button"
                        class="icon-button icon-button--danger"
                        :id="`unfavorite-btn-${book.id}`"
                        title="Remove from favorites"
                        @click.stop="onToggleBookmark(book.id)"
                      >
                        <Heart class="mini-icon" />
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="copiedBookId === book.id" class="copied-toast">Copied link</div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-shell {
  position: relative;
  overflow: hidden;
  padding: 1rem 1rem 4rem;
  isolation: isolate;
}

.account-inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.account-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 15% 10%, rgba(37, 99, 235, 0.08), transparent 32%),
    radial-gradient(circle at 82% 18%, rgba(255, 176, 31, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
}

.account-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(52px);
  opacity: 0.7;
}

.account-orb--blue {
  top: 3rem;
  left: -4rem;
  width: 15rem;
  height: 15rem;
  background: rgba(37, 99, 235, 0.18);
}

.account-orb--amber {
  top: 9rem;
  right: -4rem;
  width: 16rem;
  height: 16rem;
  background: rgba(255, 176, 31, 0.18);
}

.account-orb--ink {
  bottom: -4rem;
  left: 35%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
}

.account-hero {
  display: grid;
  gap: 1rem;
  align-items: end;
}

.account-hero__copy {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.eyebrow,
.panel-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.45rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.eyebrow {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
}

.account-hero h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 4.8vw, 4.2rem);
  line-height: 0.98;
  letter-spacing: -0.07em;
  font-weight: 900;
}

.account-hero p {
  margin: 0;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.85;
}

.account-hero p strong {
  color: #0f172a;
}

.hero-card,
.metric-card,
.profile-panel,
.orders-panel,
.bookmarks-panel,
.address-card,
.order-card,
.bookmark-card,
.empty-panel,
.notice {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.hero-card {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  border-radius: 1.5rem;
  padding: 1rem 1.1rem;
  width: fit-content;
}

.hero-card__icon,
.panel-icon,
.notice-icon,
.empty-panel__icon,
.mini-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.hero-card__icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #2563eb;
}

.hero-card span {
  display: block;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero-card strong {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
}

.metric-strip {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.metric-card {
  border-radius: 1.35rem;
  padding: 1rem;
}

.metric-card span {
  display: block;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.metric-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
  font-size: 1.45rem;
  line-height: 1;
  font-weight: 900;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.profile-panel,
.orders-panel,
.bookmarks-panel {
  border-radius: 2rem;
  padding: 1.2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
  margin-bottom: 1rem;
}

.panel-head--split {
  align-items: flex-start;
}

.panel-head h3 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 900;
}

.panel-kicker {
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.input-shell {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 1rem;
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
  pointer-events: none;
}

.input-shell input,
.field input,
.field select {
  width: 100%;
  min-height: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  padding: 0.85rem 1rem;
  color: #0f172a;
  outline: none;
  font: inherit;
}

.input-shell input {
  padding-left: 2.7rem;
}

.input-shell input:focus,
.field input:focus,
.field select:focus {
  border-color: rgba(37, 99, 235, 0.34);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  background: #ffffff;
}

.address-card {
  border-radius: 1.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.address-card__head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.field-grid {
  display: grid;
  gap: 0.9rem;
}

.field-grid--two {
  grid-template-columns: 1fr;
}

.notice {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  padding: 0.8rem 0.95rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  background: rgba(236, 253, 245, 0.95);
  color: #047857;
}

.notice-success {
  border-color: rgba(16, 185, 129, 0.2);
}

.button {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0.8rem 1.1rem;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    background-color 220ms ease,
    color 220ms ease,
    box-shadow 220ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-dark {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.18);
}

.button-light {
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.order-list {
  display: grid;
  gap: 0.8rem;
}

.order-card {
  overflow: hidden;
  border-radius: 1.5rem;
}

.order-summary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.order-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  flex: 1 1 auto;
}

.order-meta span {
  display: block;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.order-meta strong,
.order-meta em {
  display: block;
  margin-top: 0.35rem;
  color: #0f172a;
  font-size: 0.82rem;
  font-style: normal;
  font-weight: 800;
}

.status {
  display: inline-flex;
  width: fit-content;
  padding: 0.35rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.status--good {
  background: rgba(236, 253, 245, 0.95);
  color: #047857;
}

.status--pending {
  background: rgba(255, 247, 237, 0.95);
  color: #b45309;
}

.order-details {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
  display: grid;
  gap: 0.85rem;
}

.ordered-items {
  display: grid;
  gap: 0.6rem;
}

.ordered-item {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  padding: 0.75rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  cursor: pointer;
}

.ordered-item strong {
  color: #0f172a;
  font-size: 0.82rem;
}

.ordered-item span {
  color: #64748b;
  font-size: 0.72rem;
}

.order-secondary {
  display: grid;
  gap: 0.85rem;
}

.order-secondary span {
  display: block;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.order-secondary p {
  margin: 0.35rem 0 0;
  color: #475569;
  font-size: 0.82rem;
  line-height: 1.7;
}

.bookmarks-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-picker {
  position: relative;
}

.category-button {
  min-height: 2.6rem;
  padding-inline: 0.95rem;
}

.category-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 10;
  min-width: 13rem;
  padding: 0.45rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.12);
}

.category-menu button {
  width: 100%;
  border: 0;
  border-radius: 0.8rem;
  padding: 0.7rem 0.8rem;
  background: transparent;
  color: #475569;
  cursor: pointer;
  text-align: left;
  font-size: 0.76rem;
  font-weight: 700;
}

.category-menu button.is-active,
.category-menu button:hover {
  background: rgba(37, 99, 235, 0.08);
  color: #0f172a;
}

.empty-panel {
  border-radius: 1.4rem;
  padding: 1.5rem;
  text-align: center;
}

.empty-panel p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.8;
}

.text-link {
  appearance: none;
  border: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 800;
}

.bookmark-grid {
  display: grid;
  gap: 1rem;
}

.bookmark-card {
  position: relative;
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 0.85rem;
  align-items: stretch;
  overflow: hidden;
  border-radius: 1.4rem;
  cursor: pointer;
}

.bookmark-card img {
  width: 100%;
  height: 100%;
  min-height: 8rem;
  object-fit: cover;
}

.bookmark-copy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.9rem 0.9rem 0.9rem 0.15rem;
}

.bookmark-copy h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.3;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.bookmark-copy p {
  margin: 0.45rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.8;
}

.bookmark-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.icon-row {
  display: flex;
  gap: 0.45rem;
}

.icon-button {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.icon-button--danger {
  color: #ef4444;
}

.copied-toast {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.45rem 0.7rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.fold-enter-active,
.fold-leave-active {
  transition: all 0.22s ease;
}

.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (min-width: 1024px) {
  .account-grid {
    grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
  }

  .metric-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .account-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .account-hero {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.2rem;
  }

  .field-grid--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .order-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .panel-head,
  .order-summary,
  .bookmark-actions,
  .account-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-meta {
    grid-template-columns: 1fr;
  }
}
</style>
