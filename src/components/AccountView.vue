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
    <div class="account-inner">
      <header class="account-header">
        <div class="header-greeting">
          <h1>Purchase History</h1>
          <p>Hi <strong>{{ profile.name }}</strong> — here's a summary of all your orders.</p>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">{{ orders.length }}</span>
            <span class="stat-label">Orders</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-value">${{ totalOrderValue.toFixed(2) }}</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </div>
      </header>

      <section class="orders-section" v-if="orders.length > 0">
        <div class="orders-table">
          <div class="table-header">
            <span>Order</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
            <span></span>
          </div>

          <article v-for="order in orders" :key="order.id" class="order-row" :id="`order-row-${order.id}`">
            <button type="button" class="order-row-btn" @click="toggleOrderAccordion(order.id)">
              <span class="cell cell-id">#{{ order.id }}</span>
              <span class="cell cell-date">{{ order.date }}</span>
              <span class="cell cell-total">${{ order.total.toFixed(2) }}</span>
              <span class="cell">
                <em :class="order.status === 'Delivered' ? 'badge badge--delivered' : 'badge badge--pending'">
                  {{ order.status }}
                </em>
              </span>
              <span class="cell cell-chevron">
                <component :is="expandedOrderId === order.id ? ChevronUp : ChevronDown" class="chevron-icon" />
              </span>
            </button>

            <transition name="fold">
              <div v-if="expandedOrderId === order.id" class="order-expanded" :id="`order-expanded-${order.id}`">
                <div class="expanded-items">
                  <div v-for="item in order.items" :key="item.book.id" class="expanded-item" @click="onSelectBook(item.book.id)">
                    <img :src="item.book.coverImage" :alt="item.book.title" referrerpolicy="no-referrer" class="item-thumb" />
                    <div class="item-info">
                      <strong>{{ item.book.title }}</strong>
                      <span>Qty: {{ item.quantity }} · ${{ (item.book.price * item.quantity).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <div class="expanded-footer">
                  <div class="footer-detail">
                    <span class="detail-label">Shipped to</span>
                    <p>{{ order.shippingAddress.fullName }}<br>{{ order.shippingAddress.address }}, {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
                  </div>
                  <div v-if="order.discountApplied" class="footer-detail">
                    <span class="detail-label">Discount</span>
                    <p>Code <strong>{{ order.discountApplied.code }}</strong> · Saved ${{ order.discountApplied.amount.toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </transition>
          </article>
        </div>
      </section>

      <section v-else class="empty-state">
        <Package class="empty-icon" />
        <h3>No orders yet</h3>
        <p>When you make a purchase, your order history will appear here.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.account-shell {
  font-family: 'Outfit', sans-serif;
  padding: 2rem 1.5rem 4rem;
  min-height: calc(100vh - 4rem);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.account-inner {
  max-width: 56rem;
  margin: 0 auto;
}

/* ─── Header ─── */
.account-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  margin-bottom: 2rem;
}

.header-greeting h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.header-greeting p {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.5;
}

.header-greeting p strong {
  color: #0f172a;
  font-weight: 600;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
}

.stat-divider {
  width: 1px;
  height: 2.5rem;
  background: rgba(15, 23, 42, 0.08);
}

/* ─── Orders Table ─── */
.orders-section {
  margin-top: 0.5rem;
}

.orders-table {
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.table-header {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1fr 2.5rem;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.order-row {
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}

.order-row:last-child {
  border-bottom: none;
}

.order-row-btn {
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1fr 2.5rem;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-family: 'Outfit', sans-serif;
  transition: background-color 150ms ease;
}

.order-row-btn:hover {
  background: rgba(248, 250, 252, 0.8);
}

.cell {
  font-size: 0.88rem;
  color: #334155;
  font-weight: 400;
}

.cell-id {
  font-weight: 600;
  color: #0f172a;
}

.cell-total {
  font-weight: 600;
  color: #0f172a;
}

.cell-chevron {
  display: flex;
  justify-content: center;
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  font-style: normal;
  line-height: 1;
}

.badge--delivered {
  background: #ecfdf5;
  color: #059669;
}

.badge--pending {
  background: #fffbeb;
  color: #d97706;
}

/* ─── Expanded Order Details ─── */
.order-expanded {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expanded-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.expanded-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.expanded-item:hover {
  background: #f1f5f9;
}

.item-thumb {
  width: 2.75rem;
  height: 3.5rem;
  object-fit: cover;
  border-radius: 0.4rem;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.item-info strong {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-info span {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 400;
}

.expanded-footer {
  display: flex;
  gap: 2rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(15, 23, 42, 0.08);
}

.footer-detail {
  flex: 1;
}

.detail-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.footer-detail p {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.6;
}

/* ─── Empty State ─── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #334155;
}

.empty-state p {
  margin: 0.4rem 0 0;
  color: #94a3b8;
  font-size: 0.88rem;
}

/* ─── Transitions ─── */
.fold-enter-active,
.fold-leave-active {
  transition: all 0.2s ease;
}

.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .account-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-item {
    align-items: flex-start;
  }

  .table-header {
    display: none;
  }

  .order-row-btn {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1rem;
  }

  .cell-chevron {
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
  }

  .expanded-footer {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (min-width: 769px) {
  .account-shell {
    padding: 3rem 2.5rem 4rem;
  }
}
</style>



