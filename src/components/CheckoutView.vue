<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowRight,
  Check,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Ship,
  Tag,
  ClipboardList,
  AlertTriangle,
} from 'lucide-vue-next'
import type { CartItem, ShippingAddress, PaymentDetails, Order } from '../types'

type CheckoutViewProps = {
  cart: CartItem[]
  onPlaceOrder: (order: Order) => Order | void | Promise<Order | void>
  onClearCart: () => void
  onNavigate: (view: string) => void
}

const props = defineProps<CheckoutViewProps>()

const step = ref(1)
const shippingAddress = ref<ShippingAddress>({
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United States',
})
const paymentDetails = ref<PaymentDetails>({
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: '',
})
const promoCodeInput = ref('')
const activeDiscount = ref<{ code: string; percent: number } | null>(null)
const promoError = ref('')
const promoSuccess = ref('')
const finalOrder = ref<Order | null>(null)
const checkoutError = ref('')
const isSubmitting = ref(false)

const subtotal = computed(() => props.cart.reduce((total, item) => total + item.book.price * item.quantity, 0))
const discountAmount = computed(() => (activeDiscount.value ? subtotal.value * (activeDiscount.value.percent / 100) : 0))
const courierRate = computed(() => (subtotal.value > 100 ? 0 : 15))
const estimatedTax = computed(() => (subtotal.value - discountAmount.value) * 0.08)
const grandTotal = computed(() => subtotal.value - discountAmount.value + courierRate.value + estimatedTax.value)

function applyPromoCode() {
  promoError.value = ''
  promoSuccess.value = ''

  const cleanedCode = promoCodeInput.value.trim().toUpperCase()
  if (cleanedCode === 'EDITORIAL' || cleanedCode === 'LAUNCH15') {
    activeDiscount.value = { code: cleanedCode, percent: 15 }
    promoSuccess.value = `${cleanedCode} applied. 15% reduction unlocked.`
    return
  }

  if (cleanedCode === '') {
    promoError.value = 'Enter a promo code to continue.'
    return
  }

  promoError.value = `Code "${cleanedCode}" was not recognized.`
}

function handleNextStep() {
  if (step.value === 1) {
    if (!shippingAddress.value.fullName || !shippingAddress.value.email || !shippingAddress.value.address || !shippingAddress.value.city) {
      alert('Please complete the shipping fields.')
      return
    }
  } else if (step.value === 2) {
    if (!paymentDetails.value.cardNumber || !paymentDetails.value.cardName || !paymentDetails.value.expiry || !paymentDetails.value.cvv) {
      alert('Please complete the payment fields.')
      return
    }
  }

  step.value++
}

async function processOrderPlacement() {
  checkoutError.value = ''
  isSubmitting.value = true
  const customOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const createdOrder: Order = {
    id: customOrderId,
    date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    items: [...props.cart],
    total: grandTotal.value,
    status: 'Pending',
    shippingAddress: shippingAddress.value,
    discountApplied: activeDiscount.value
      ? { code: activeDiscount.value.code, amount: discountAmount.value }
      : undefined,
  }

  try {
    const confirmedOrder = await props.onPlaceOrder(createdOrder)
    finalOrder.value = confirmedOrder || createdOrder
    props.onClearCart()
  } catch (error) {
    checkoutError.value = error instanceof Error ? error.message : 'Checkout failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function formatCardNumber(value: string) {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
  const numeric = value.replace(/[^0-9]/g, '')
  if (numeric.length >= 2) return `${numeric.substring(0, 2)} / ${numeric.substring(2, 4)}`
  return numeric
}
</script>

<template>
  <div v-if="cart.length === 0 && !finalOrder" class="checkout-empty">
    <ClipboardList class="hero-icon" />
    <h3>Your cart is empty</h3>
    <p>Add a few books from the catalog before we can build the checkout flow.</p>
    <button type="button" class="button button-dark" @click="onNavigate('catalog')">
      Browse catalog
    </button>
  </div>

  <div v-else-if="finalOrder" class="checkout-success">
    <div class="success-badge">
      <CheckCircle class="hero-icon" />
    </div>
    <span class="eyebrow">Order confirmed</span>
    <h2>Thanks for your purchase</h2>
    <p>
      Your payment was registered successfully. The order is now moving through the packing and courier queue.
    </p>

    <div class="receipt-card">
      <div class="receipt-row"><span>Order ID</span><strong>{{ finalOrder.id }}</strong></div>
      <div class="receipt-row"><span>Date</span><strong>{{ finalOrder.date }}</strong></div>
      <div class="receipt-row"><span>Recipient</span><strong>{{ finalOrder.shippingAddress.fullName }}</strong></div>
      <div class="receipt-row"><span>Location</span><strong>{{ finalOrder.shippingAddress.city }}, {{ finalOrder.shippingAddress.postalCode }}</strong></div>
      <div class="receipt-row receipt-row--total"><span>Total</span><strong>${{ finalOrder.total.toFixed(2) }} USD</strong></div>
    </div>

    <div class="success-actions">
      <button type="button" class="button button-dark" @click="onNavigate('catalog')">
        Continue shopping
      </button>
      <button type="button" class="button button-light" @click="onNavigate('account')">
        Open account
      </button>
    </div>
  </div>

  <div v-else class="checkout-shell">
    <div class="checkout-backdrop" aria-hidden="true">
      <div class="checkout-orb checkout-orb--blue" />
      <div class="checkout-orb checkout-orb--amber" />
      <div class="checkout-orb checkout-orb--ink" />
    </div>

    <div class="checkout-inner">
      <header class="checkout-hero">
        <span class="eyebrow">Secure checkout</span>
        <h1>Complete your order in three steps</h1>
        <p>We keep the flow clear, elegant, and fast so the experience feels premium from cart to confirmation.</p>
      </header>

      <div class="progress-strip">
        <button type="button" class="step-chip" :class="{ 'is-active': step >= 1 }" @click="step = 1">1. Shipping</button>
        <span class="step-line" :class="{ 'is-active': step > 1 }" />
        <button type="button" class="step-chip" :class="{ 'is-active': step >= 2 }" @click="step > 1 && (step = 2)">2. Payment</button>
        <span class="step-line" :class="{ 'is-active': step > 2 }" />
        <button type="button" class="step-chip" :class="{ 'is-active': step >= 3 }" @click="step > 2 && (step = 3)">3. Review</button>
      </div>

      <div class="checkout-grid">
        <section class="checkout-panel">
          <template v-if="step === 1">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Step 01</span>
                <h3>Shipping details</h3>
              </div>
              <Ship class="panel-icon" />
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Full name</span>
                <input v-model="shippingAddress.fullName" type="text" placeholder="e.g. Arthur Pendelton" id="input-full-name" />
              </label>
              <label class="field">
                <span>Email address</span>
                <input v-model="shippingAddress.email" type="email" placeholder="e.g. a.pendelton@oxford-press.org" id="input-email" />
              </label>
            </div>

            <label class="field">
              <span>Street address</span>
              <input v-model="shippingAddress.address" type="text" placeholder="Room 402, High Street Quads" id="input-street" />
            </label>

            <div class="field-grid field-grid--three">
              <label class="field">
                <span>City</span>
                <input v-model="shippingAddress.city" type="text" placeholder="Oxford" id="input-city" />
              </label>
              <label class="field">
                <span>Postal code</span>
                <input v-model="shippingAddress.postalCode" type="text" placeholder="OX1 4JD" id="input-postal" />
              </label>
              <label class="field">
                <span>Country</span>
                <select v-model="shippingAddress.country" id="input-country">
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Switzerland</option>
                  <option>Germany</option>
                  <option>Japan</option>
                </select>
              </label>
            </div>

            <button type="button" class="button button-dark" @click="handleNextStep" id="shipping-next-step">
              Continue to payment
              <ArrowRight class="button-icon" />
            </button>
          </template>

          <template v-else-if="step === 2">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Step 02</span>
                <h3>Payment details</h3>
              </div>
              <CreditCard class="panel-icon" />
            </div>

            <div class="notice">
              <ShieldCheck class="notice-icon" />
              <p>Your payment details are handled in a clean, secure form state for checkout preview only.</p>
            </div>

            <label class="field">
              <span>Name on card</span>
              <input v-model="paymentDetails.cardName" type="text" placeholder="e.g. Arthur Pendelton" id="input-cardname" />
            </label>

            <label class="field">
              <span>Card number</span>
              <input
                :value="paymentDetails.cardNumber"
                maxlength="19"
                type="text"
                placeholder="4111 2222 3333 4444"
                id="input-cardnumber"
                @input="paymentDetails.cardNumber = formatCardNumber(($event.target as HTMLInputElement).value)"
              />
            </label>

            <div class="field-grid">
              <label class="field">
                <span>Expiry</span>
                <input
                  :value="paymentDetails.expiry"
                  maxlength="7"
                  type="text"
                  placeholder="08 / 29"
                  id="input-card-expiry"
                  @input="paymentDetails.expiry = formatExpiry(($event.target as HTMLInputElement).value)"
                />
              </label>
              <label class="field">
                <span>CVV</span>
                <input v-model="paymentDetails.cvv" maxlength="4" type="password" placeholder="•••" id="input-card-cvv" />
              </label>
            </div>

            <div class="panel-actions">
              <button type="button" class="button button-light" @click="step = 1">Back</button>
              <button type="button" class="button button-dark" @click="handleNextStep" id="billing-next-step">
                Review order
                <ArrowRight class="button-icon" />
              </button>
            </div>
          </template>

          <template v-else>
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Step 03</span>
                <h3>Review and confirm</h3>
              </div>
              <Check class="panel-icon" />
            </div>

            <div class="review-grid">
              <div class="review-card">
                <span class="review-kicker">Shipping</span>
                <p>{{ shippingAddress.fullName }}</p>
                <p>{{ shippingAddress.address }}</p>
                <p>{{ shippingAddress.city }}, {{ shippingAddress.postalCode }}</p>
                <p>{{ shippingAddress.country }}</p>
                <p>{{ shippingAddress.email }}</p>
              </div>

              <div class="review-card">
                <span class="review-kicker">Payment</span>
                <p>{{ paymentDetails.cardName }}</p>
                <p>Card ending {{ paymentDetails.cardNumber.slice(-4) }}</p>
                <p>Expiry {{ paymentDetails.expiry }}</p>
              </div>
            </div>

            <div class="panel-actions">
              <button type="button" class="button button-light" @click="step = 2">Edit payment</button>
              <button type="button" class="button button-dark" :disabled="isSubmitting" @click="processOrderPlacement" id="place-order-final-btn">
                {{ isSubmitting ? 'Placing order...' : 'Finalize order' }}
                <Check class="button-icon" />
              </button>
            </div>
            <div v-if="checkoutError" class="feedback feedback-error">
              <AlertTriangle class="feedback-icon" />
              {{ checkoutError }}
            </div>
          </template>
        </section>

        <aside class="summary-panel">
          <div class="summary-card">
            <div class="summary-head">
              <h4>Order summary</h4>
              <span>{{ cart.length }} items</span>
            </div>

            <div class="cart-list">
              <article v-for="item in cart" :key="item.book.id" class="cart-item">
                <img :src="item.book.coverImage" :alt="item.book.title" referrerpolicy="no-referrer" />
                <div class="cart-item__copy">
                  <strong>{{ item.book.title }}</strong>
                  <span>{{ item.quantity }} x ${{ item.book.price.toFixed(2) }}</span>
                </div>
                <em>${{ (item.book.price * item.quantity).toFixed(2) }}</em>
              </article>
            </div>

            <form class="promo-form" @submit.prevent="applyPromoCode">
              <label class="field">
                <span>Promo code</span>
                <div class="promo-shell">
                  <input v-model="promoCodeInput" type="text" placeholder="EDITORIAL or LAUNCH15" id="promo-code-input" />
                  <button type="submit" class="button button-dark" id="apply-promo-btn">Apply</button>
                </div>
              </label>
            </form>

            <div v-if="promoError" class="feedback feedback-error">
              <AlertTriangle class="feedback-icon" />
              {{ promoError }}
            </div>
            <div v-if="promoSuccess" class="feedback feedback-success">
              <Tag class="feedback-icon" />
              {{ promoSuccess }}
            </div>

            <div class="totals">
              <div><span>Subtotal</span><strong>${{ subtotal.toFixed(2) }}</strong></div>
              <div v-if="activeDiscount"><span>Discount</span><strong>-${{ discountAmount.toFixed(2) }}</strong></div>
              <div><span>Courier</span><strong>{{ courierRate === 0 ? 'Free' : '$' + courierRate.toFixed(2) }}</strong></div>
              <div><span>Tax</span><strong>${{ estimatedTax.toFixed(2) }}</strong></div>
              <div class="totals__grand"><span>Total</span><strong>${{ grandTotal.toFixed(2) }} USD</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-shell {
  position: relative;
  overflow: hidden;
  padding: 1rem 1rem 4rem;
  isolation: isolate;
}

.checkout-inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checkout-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 8%, rgba(37, 99, 235, 0.08), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(255, 176, 31, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
}

.checkout-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(54px);
  opacity: 0.7;
}

.checkout-orb--blue {
  top: 3rem;
  left: -4rem;
  width: 15rem;
  height: 15rem;
  background: rgba(37, 99, 235, 0.18);
}

.checkout-orb--amber {
  top: 9rem;
  right: -4rem;
  width: 16rem;
  height: 16rem;
  background: rgba(255, 176, 31, 0.18);
}

.checkout-orb--ink {
  bottom: -4rem;
  left: 35%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
}

.checkout-hero {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.eyebrow,
.panel-kicker,
.review-kicker {
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

.checkout-hero h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.3rem, 4.8vw, 4.3rem);
  line-height: 0.98;
  letter-spacing: -0.07em;
  font-weight: 900;
}

.checkout-hero p {
  margin: 0;
  max-width: 44rem;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.85;
}

.progress-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.step-chip {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  border-radius: 9999px;
  padding: 0.65rem 0.95rem;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.step-chip.is-active {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
  border-color: transparent;
}

.step-line {
  flex: 1 1 2rem;
  height: 1px;
  background: rgba(226, 232, 240, 0.95);
}

.step-line.is-active {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.45));
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.checkout-panel,
.summary-card,
.checkout-empty,
.checkout-success {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.checkout-panel {
  border-radius: 2rem;
  padding: 1.2rem;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
}

.panel-head h3 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 1.35rem;
  line-height: 1.1;
  font-weight: 900;
}

.panel-kicker {
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.panel-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #2563eb;
}

.field-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.field-grid--three {
  grid-template-columns: 1fr;
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
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.field input:focus,
.field select:focus {
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  background: #ffffff;
}

.notice {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 1.2rem;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.notice-icon {
  width: 1rem;
  height: 1rem;
  color: #f59e0b;
  flex: 0 0 auto;
  margin-top: 0.15rem;
}

.notice p {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.7;
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.15rem;
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

.button-icon {
  width: 0.95rem;
  height: 0.95rem;
}

.summary-panel {
  position: sticky;
  top: 1rem;
}

.summary-card {
  border-radius: 2rem;
  padding: 1.2rem;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
}

.summary-head h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 900;
}

.summary-head span {
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cart-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.7rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
}

.cart-item img {
  width: 3rem;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 0.75rem;
}

.cart-item__copy {
  min-width: 0;
}

.cart-item__copy strong {
  display: block;
  color: #0f172a;
  font-size: 0.82rem;
  line-height: 1.35;
}

.cart-item__copy span,
.cart-item em {
  color: #64748b;
  font-size: 0.72rem;
  font-style: normal;
}

.promo-form {
  margin-top: 1rem;
}

.promo-shell {
  display: flex;
  gap: 0.5rem;
}

.promo-shell input {
  flex: 1 1 auto;
}

.feedback {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.8rem 0.95rem;
  border-radius: 1rem;
  margin-top: 0.75rem;
  font-size: 0.82rem;
  line-height: 1.7;
}

.feedback-icon {
  width: 0.95rem;
  height: 0.95rem;
  margin-top: 0.15rem;
  flex: 0 0 auto;
}

.feedback-error {
  background: rgba(254, 242, 242, 0.95);
  color: #b91c1c;
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.feedback-success {
  background: rgba(236, 253, 245, 0.95);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.totals {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
}

.totals div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #64748b;
  font-size: 0.82rem;
}

.totals strong {
  color: #0f172a;
}

.totals__grand {
  padding-top: 0.75rem;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
}

.totals__grand strong {
  font-size: 1rem;
  font-weight: 900;
}

.checkout-empty,
.checkout-success {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
  border-radius: 2rem;
  padding: 3rem 1.5rem;
}

.hero-icon {
  width: 3rem;
  height: 3rem;
  color: #2563eb;
}

.checkout-empty h3,
.checkout-success h2 {
  margin: 0.8rem 0 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.checkout-empty p,
.checkout-success p {
  margin: 0.75rem auto 0;
  max-width: 36rem;
  color: #475569;
  font-size: 0.94rem;
  line-height: 1.85;
}

.success-badge {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  border-radius: 1.2rem;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #14532d);
  color: #d1fae5;
}

.receipt-card {
  margin: 1.5rem auto 0;
  max-width: 30rem;
  padding: 1rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  text-align: left;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
  color: #475569;
  font-size: 0.82rem;
}

.receipt-row strong {
  color: #0f172a;
}

.receipt-row--total {
  border-bottom: 0;
  padding-top: 0.85rem;
  color: #0f172a;
  font-weight: 900;
}

.success-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.checkout-success {
  margin-top: 2rem;
}

@media (min-width: 1024px) {
  .checkout-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.75fr);
    align-items: start;
  }

  .field-grid--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .checkout-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .panel-actions,
  .summary-head,
  .checkout-hero,
  .progress-strip {
    flex-direction: column;
    align-items: flex-start;
  }

  .step-line {
    display: none;
  }
}
</style>
