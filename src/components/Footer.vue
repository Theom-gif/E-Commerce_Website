<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-vue-next'

const email = ref('')
const subscribed = ref(false)

const handleSubscribe = (e: Event) => {
  e.preventDefault()
  if (email.value.trim().includes('@')) {
    subscribed.value = true
    setTimeout(() => {
      email.value = ''
    }, 3000)
  }
}
</script>

<template>
  <footer class="footer" id="footer-root-container">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="brand-name">BookBase</span>
          <p class="brand-tagline">Your curated digital bookstore for audiobooks, e-books, and more.</p>
        </div>

        <div class="footer-cols">
          <div class="footer-col">
            <h4>Collections</h4>
            <ul>
              <li>Art & Graphic Design</li>
              <li>Spatial Architecture</li>
              <li>Classical Philosophy</li>
              <li>Contemporary Poetry</li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Newsletter</h4>
            <p>Get updates on new releases and curated picks.</p>

            <div v-if="subscribed" class="subscribed-msg">
              <CheckCircle class="check-icon" />
              <span>You're subscribed!</span>
            </div>

            <form v-else class="subscribe-form" @submit="handleSubscribe">
              <div class="subscribe-row">
                <input
                  id="newsletter-email-input"
                  v-model="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                />
                <button id="newsletter-submit-btn" type="submit" title="Subscribe">
                  <ArrowRight class="arrow-icon" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 BookBase. All rights reserved.</p>
        <div class="footer-links">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Shipping</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  font-family: 'Outfit', sans-serif;
  background: #0f172a;
  color: #94a3b8;
  margin-top: auto;
}

.footer-inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 1.5rem;
}

/* ─── Top Section ─── */
.footer-top {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-brand {
  max-width: 22rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.brand-tagline {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #64748b;
}

.footer-cols {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.footer-col h4 {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.75rem;
}

.footer-col ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-col li {
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  transition: color 150ms ease;
}

.footer-col li:hover {
  color: #e2e8f0;
}

.footer-col > p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #64748b;
  margin-bottom: 0.75rem;
}

/* ─── Subscribe Form ─── */
.subscribe-form {
  margin-top: 0;
}

.subscribe-row {
  display: flex;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.subscribe-row input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.6rem 1rem;
  color: #f1f5f9;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
}

.subscribe-row input::placeholder {
  color: #475569;
}

.subscribe-row button {
  appearance: none;
  border: none;
  width: 2.75rem;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 150ms ease;
}

.subscribe-row button:hover {
  background: #1d4ed8;
}

.arrow-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.subscribed-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #34d399;
  font-size: 0.82rem;
  font-weight: 500;
}

.check-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* ─── Bottom Bar ─── */
.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.25rem;
  font-size: 0.78rem;
  color: #475569;
}

.footer-bottom p {
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 1.25rem;
}

.footer-links span {
  cursor: pointer;
  transition: color 150ms ease;
}

.footer-links span:hover {
  color: #e2e8f0;
}

/* ─── Responsive ─── */
@media (min-width: 768px) {
  .footer-inner {
    padding: 3.5rem 2.5rem 1.5rem;
  }

  .footer-top {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .footer-cols {
    flex-direction: row;
    gap: 4rem;
  }

  .footer-bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
