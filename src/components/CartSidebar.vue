<!--
  Vue 3 rewrite of CartSidebar.
  Interface preserved:
  - Props: isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onGotoCheckout
  - Style: preserved from original React JSX
  - Motion behaviors replaced with standard Vue transitions
-->

<script setup lang="ts">
import { computed } from 'vue'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-vue-next'
import type { CartItem } from '../types'

type CartSidebarProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (bookId: string, quantity: number) => void
  onRemoveItem: (bookId: string) => void
  onGotoCheckout: () => void
}

const props = defineProps<CartSidebarProps>()

const computedSubtotal = computed(() => {
  return props.cart.reduce((total, item) => total + item.book.price * item.quantity, 0)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cart-sidebar">
      <div v-if="props.isOpen" class="cart-overlay" id="cart-sidebar-overlay">
        <Transition name="fade">
          <div class="cart-backdrop" @click="props.onClose" />
        </Transition>

        <div class="cart-drawer-wrapper">
          <Transition name="slide-in">
            <div v-if="props.isOpen" class="cart-drawer" id="cart-drawer-panel">
              <!-- Header -->
              <div class="cart-header">
                <div class="cart-header-left">
                  <ShoppingBag class="header-icon" />
                  <h3>Shopping Cart</h3>
                </div>
                <button
                  type="button"
                  @click="props.onClose"
                  class="close-btn"
                  id="close-cart-btn"
                  title="Close cart"
                >
                  <X class="close-icon" />
                </button>
              </div>

              <!-- Cart Items -->
              <div class="cart-body">
                <div v-if="props.cart.length === 0" class="cart-empty">
                  <div class="empty-icon-wrap">
                    <ShoppingBag class="empty-bag-icon" />
                  </div>
                  <h4>Your cart is empty</h4>
                  <p>Browse the catalog and add items to get started.</p>
                  <button type="button" class="browse-btn" @click="props.onClose">
                    Browse catalog
                  </button>
                </div>

                <div v-else class="cart-items">
                  <div
                    v-for="item in props.cart"
                    :key="item.book.id"
                    class="cart-item"
                    :id="'cart-item-' + item.book.id"
                  >
                    <div class="item-thumb-wrap">
                      <img
                        :src="item.book.coverImage"
                        :alt="item.book.title"
                        referrerpolicy="no-referrer"
                      />
                    </div>

                    <div class="item-details">
                      <div class="item-top">
                        <span class="item-category">{{ item.book.category }}</span>
                        <h4 class="item-title">{{ item.book.title }}</h4>
                        <span class="item-author">{{ item.book.author }}</span>
                      </div>

                      <div class="item-bottom">
                        <div class="qty-controls">
                          <button
                            type="button"
                            @click="props.onUpdateQuantity(item.book.id, item.quantity - 1)"
                            :id="'cart-qty-decrem-' + item.book.id"
                          >
                            <Minus class="qty-icon" />
                          </button>
                          <span class="qty-value">{{ item.quantity }}</span>
                          <button
                            type="button"
                            @click="props.onUpdateQuantity(item.book.id, item.quantity + 1)"
                            :id="'cart-qty-increm-' + item.book.id"
                          >
                            <Plus class="qty-icon" />
                          </button>
                        </div>

                        <div class="item-price-row">
                          <span class="item-price">${{ (item.book.price * item.quantity).toFixed(2) }}</span>
                          <button
                            type="button"
                            class="trash-btn"
                            @click="props.onRemoveItem(item.book.id)"
                            :id="'cart-trash-' + item.book.id"
                            title="Remove item"
                          >
                            <Trash2 class="trash-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer / Checkout -->
              <div v-if="props.cart.length > 0" class="cart-footer">
                <div class="footer-row">
                  <span class="footer-label">{{ props.cart.reduce((s, i) => s + i.quantity, 0) }} items</span>
                  <span class="footer-label">Subtotal</span>
                </div>
                <div class="footer-row footer-total">
                  <span></span>
                  <span>${{ computedSubtotal.toFixed(2) }}</span>
                </div>
                <p class="footer-note">Shipping and taxes calculated at checkout.</p>
                <button
                  type="button"
                  class="checkout-btn"
                  @click="props.onClose(); props.onGotoCheckout()"
                  id="checkout-trigger-btn"
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight class="checkout-arrow" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
}

.cart-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.cart-drawer-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.cart-drawer {
  font-family: 'Outfit', sans-serif;
  pointer-events: auto;
  width: 100%;
  max-width: 26rem;
  background: #ffffff;
  border-left: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ─── Header ─── */
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.cart-header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #0f172a;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0.4rem;
  border-radius: 9999px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 150ms ease, background-color 150ms ease;
}

.close-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.04);
}

.close-icon {
  width: 1.15rem;
  height: 1.15rem;
}

/* ─── Body ─── */
.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.cart-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem;
}

.empty-icon-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: #f1f5f9;
  display: grid;
  place-items: center;
}

.empty-bag-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
}

.cart-empty h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
}

.cart-empty p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  max-width: 18rem;
  line-height: 1.5;
}

.browse-btn {
  appearance: none;
  border: none;
  background: #0f172a;
  color: #ffffff;
  padding: 0.55rem 1.25rem;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.browse-btn:hover {
  background: #1e293b;
}

/* ─── Cart Items ─── */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-item {
  display: flex;
  gap: 0.85rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}

.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-thumb-wrap {
  width: 4rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f8fafc;
}

.item-thumb-wrap img {
  width: 100%;
  height: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
}

.item-category {
  font-size: 0.68rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-title {
  margin: 0.1rem 0 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-author {
  font-size: 0.78rem;
  color: #64748b;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.qty-controls {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.qty-controls button {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  color: #334155;
  transition: background-color 120ms ease;
}

.qty-controls button:hover {
  background: #f1f5f9;
}

.qty-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.qty-value {
  min-width: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-price {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.trash-btn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0.3rem;
  border-radius: 9999px;
  cursor: pointer;
  color: #cbd5e1;
  transition: color 150ms ease;
}

.trash-btn:hover {
  color: #ef4444;
}

.trash-icon {
  width: 0.85rem;
  height: 0.85rem;
}

/* ─── Footer ─── */
.cart-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  background: #f8fafc;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.footer-total {
  margin-top: 0.25rem;
}

.footer-total span {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.footer-note {
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
}

.checkout-btn {
  appearance: none;
  border: none;
  width: 100%;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 9999px;
  background: #0f172a;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.checkout-btn:hover {
  background: #1e293b;
}

.checkout-arrow {
  width: 0.9rem;
  height: 0.9rem;
}

/* ─── Transitions ─── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-enter-active {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-in-leave-active {
  transition: transform 200ms ease-in;
}
.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
}
</style>

