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
      <div v-if="props.isOpen" class="fixed inset-0 z-50 overflow-hidden" id="cart-sidebar-overlay">
        <!-- Backdrop screen filter -->
        <Transition name="fade">
          <div
            class="absolute inset-0 bg-[#121212] backdrop-blur-xs cursor-pointer"
            @click="props.onClose"
          />
        </Transition>

        <div class="absolute inset-y-0 right-0 max-w-full flex">
          <!-- Slide drawer chassis -->
          <Transition name="slide-in">
            <div
              v-if="props.isOpen"
              class="w-screen max-w-md bg-[#faf8f5] border-l border-[#ece8e0] shadow-2xl flex flex-col justify-between"
              id="cart-drawer-panel"
            >
              <!-- Header block -->
              <div class="px-6 py-5 border-b border-[#ece8e0] flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <ShoppingBag class="w-4 h-4 text-[#8f2619]" />
                  <h3 class="font-serif text-lg font-bold text-[#121212]">
                    Printed Ledger Cart
                  </h3>
                </div>
                <button
                  type="button"
                  @click="props.onClose"
                  class="p-1.5 hover:bg-[#ece8e0] text-[#121212] transition-colors"
                  id="close-cart-btn"
                  title="Close Cart Drawer"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Core cart list items body -->
              <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div v-if="props.cart.length === 0" class="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div class="p-4 bg-[#f2efe9] text-[#a29c90]">
                    <ShoppingBag class="w-8 h-8" />
                  </div>
                  <h4 class="font-serif text-lg font-bold text-[#121212]">Your Cart is Empty</h4>
                  <p class="font-sans text-xs text-[#706a5e] max-w-xs leading-relaxed font-light">
                    Browse the catalog records and select active limited printings to include in your local delivery ledger.
                  </p>
                  <button
                    type="button"
                    @click="props.onClose"
                    class="bg-[#121212] hover:bg-[#8f2619] text-white px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest rounded-none"
                  >
                    Return to Archive
                  </button>
                </div>
                <div v-else>
                  <div
                    v-for="item in props.cart"
                    :key="item.book.id"
                    class="flex space-x-4 border-b border-[#ece8e0]/60 pb-5 items-start"
                    :id="'cart-item-' + item.book.id"
                  >
                    <!-- Book Cover Thumbnail -->
                    <div class="w-[70px] aspect-[3/4] bg-white border border-black/10 overflow-hidden flex-shrink-0">
                      <img
                        :src="item.book.coverImage"
                        :alt="item.book.title"
                        class="w-full h-full object-cover"
                      />
                    </div>

                    <div class="flex-1 space-y-2">
                      <div>
                        <p class="font-mono text-[9px] text-[#c49a45] uppercase tracking-wider font-bold">
                          {{ item.book.category }}
                        </p>
                        <h4 class="font-serif text-sm font-bold text-[#121212] leading-tight">
                          {{ item.book.title }}
                        </h4>
                        <p class="font-sans text-[11px] text-[#706a5e]">
                          By {{ item.book.author }}
                        </p>
                      </div>

                      <!-- Modifiers row -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center border border-[#d8d3c5] bg-[#fbfaf7] text-xs">
                          <button
                            type="button"
                            @click="props.onUpdateQuantity(item.book.id, item.quantity - 1)"
                            class="px-2 py-1 text-[#121212] hover:bg-[#ece8e0]"
                            :id="'cart-qty-decrem-' + item.book.id"
                          >
                            <Minus class="w-3 h-3" />
                          </button>
                          <span class="px-3 font-mono font-medium">{{ item.quantity }}</span>
                          <button
                            type="button"
                            @click="props.onUpdateQuantity(item.book.id, item.quantity + 1)"
                            class="px-2 py-1 text-[#121212] hover:bg-[#ece8e0]"
                            :id="'cart-qty-increm-' + item.book.id"
                          >
                            <Plus class="w-3 h-3" />
                          </button>
                        </div>

                        <div class="flex items-center space-x-4">
                          <span class="font-mono text-xs font-bold text-[#121212]">
                            ${{ (item.book.price * item.quantity).toFixed(2) }}
                          </span>
                          <button
                            type="button"
                            @click="props.onRemoveItem(item.book.id)"
                            class="p-1 text-[#a29c90] hover:text-[#8f2619] transition-colors"
                            :id="'cart-trash-' + item.book.id"
                            title="Delete Item"
                          >
                            <Trash2 class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subtotal and proceed checkout pane -->
              <div v-if="props.cart.length > 0" class="p-6 bg-[#f2efe9] border-t border-[#ece8e0] space-y-4">
                <div class="space-y-2.5 font-mono text-xs">
                  <div class="flex justify-between text-[#706a5e]">
                    <span>LEDGER ITEMS</span>
                    <span>{{ props.cart.reduce((s, i) => s + i.quantity, 0) }} UNITS</span>
                  </div>
                  <div class="flex justify-between text-[#121212] font-bold text-sm border-t border-[#d8d3c5]/55 pt-2">
                    <span>SUBTOTAL</span>
                    <span>${{ computedSubtotal.toFixed(2) }} USD</span>
                  </div>
                </div>

                <p class="font-sans text-[10px] text-[#706a5e] leading-relaxed font-light italic">
                  Tax calculations, custom binding choices, and certified courier transport variables will be appended on the checkout ledger.
                </p>

                <button
                  type="button"
                  @click="props.onClose(); props.onGotoCheckout()"
                  class="w-full bg-[#121212] hover:bg-[#8f2619] text-[#faf8f5] transition-all duration-300 py-3.5 px-6 font-mono text-xs uppercase tracking-widest flex items-center justify-center space-x-2 rounded-none"
                  id="checkout-trigger-btn"
                >
                  <span>Proceed to Delivery Stepper</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
