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
  <footer class="site-footer" id="footer-root-container">
    <div class="site-footer__backdrop" aria-hidden="true" />

    <div class="site-footer__inner">
      <div class="site-footer__grid">
        <section class="footer-brand">
          <span class="footer-brand__label">BookBase</span>
          <h2>Discover audiobooks and digital books anytime.</h2>
          <p>
            A calm, editorial storefront designed for fast browsing, thoughtful curation, and a polished reading journey.
          </p>

          <div class="footer-brand__meta">
            <span>ARCHIVE METADATA: VER_2026_06</span>
            <span>OPERATING WITH INTELLECTUAL DEVOTION</span>
          </div>
        </section>

        <section class="footer-links">
          <h3>Collections</h3>
          <ul>
            <li><span>[001] Art &amp; Graphic Design</span></li>
            <li><span>[002] Spatial Architecture</span></li>
            <li><span>[003] Classical Philosophy</span></li>
            <li><span>[004] Contemporary Poetry</span></li>
          </ul>
        </section>

        <section class="footer-newsletter">
          <h3>The Dispatch</h3>
          <p>
            Receive limited release announcements, curatorial essays, and catalog entries printed every lunar cycle.
          </p>

          <div v-if="subscribed" class="success-card">
            <CheckCircle class="success-card__icon" />
            <div>
              <p>Dispatch confirmed</p>
              <span>Your name is added to our private ledger.</span>
            </div>
          </div>

          <form v-else class="newsletter-form" @submit="handleSubscribe">
            <div class="newsletter-form__row">
              <input
                id="newsletter-email-input"
                v-model="email"
                type="email"
                required
                placeholder="Enter email address"
                class="newsletter-form__input"
              />
              <button
                id="newsletter-submit-btn"
                type="submit"
                class="newsletter-form__button"
                title="Subscribe"
              >
                <ArrowRight class="newsletter-form__icon" />
              </button>
            </div>

            <div class="newsletter-form__hint">
              <ShieldCheck class="newsletter-form__hint-icon" />
              <span>No marketing noise. Unsubscribe at any mark.</span>
            </div>
          </form>
        </section>
      </div>

      <div class="site-footer__bottom">
        <p>&copy; 2026 The Library Press. Built with editorial integrity.</p>
        <div class="site-footer__bottom-links">
          <span>Ledger Rules</span>
          <span>Transit Options</span>
          <span>Sovereign Integrity</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  overflow: hidden;
  margin-top: auto;
  border-top: 1px solid rgba(51, 65, 85, 0.72);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 28%),
    radial-gradient(circle at 85% 0%, rgba(255, 176, 31, 0.12), transparent 22%),
    linear-gradient(180deg, #08101f 0%, #0f172a 52%, #111827 100%);
  color: #e2e8f0;
}

.site-footer__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.45;
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 2.5rem 2.5rem;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 96%);
}

.site-footer__inner {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 86rem;
  padding: 4.5rem 1rem 2rem;
}

.site-footer__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.78);
}

.footer-brand,
.footer-links,
.footer-newsletter {
  min-width: 0;
}

.footer-brand__label {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.9rem;
  color: #93c5fd;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.footer-brand h2 {
  margin: 0;
  max-width: 15ch;
  color: #ffffff;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
  font-weight: 900;
}

.footer-brand p {
  margin: 1rem 0 0;
  max-width: 34rem;
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.8;
}

.footer-brand__meta {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #94a3b8;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.footer-brand__meta span {
  padding: 0.5rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.04);
}

.footer-links h3,
.footer-newsletter h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.footer-links ul {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.7rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.footer-links span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  padding: 0.45rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.04);
  transition: color 220ms ease;
}

.footer-links span:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}

.footer-newsletter p {
  margin: 1rem 0 0;
  color: #cbd5e1;
  font-size: 0.92rem;
  line-height: 1.8;
}

.success-card {
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(52, 211, 153, 0.18);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(15, 23, 42, 0.12));
  color: #d1fae5;
  box-shadow: 0 18px 32px rgba(2, 6, 23, 0.2);
}

.success-card__icon {
  width: 1.35rem;
  height: 1.35rem;
  color: #34d399;
  flex: 0 0 auto;
}

.success-card p {
  margin: 0;
  color: #ecfdf5;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.success-card span {
  display: block;
  margin-top: 0.3rem;
  color: #a7f3d0;
  font-size: 0.76rem;
  line-height: 1.6;
}

.newsletter-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.newsletter-form__row {
  display: flex;
  align-items: stretch;
  border-radius: 1rem;
  border: 1px solid rgba(51, 65, 85, 0.95);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9)),
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 30%);
  box-shadow:
    0 22px 42px rgba(2, 6, 23, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.newsletter-form__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  padding: 0.85rem 0.95rem;
  background: transparent;
  color: #f8fafc;
  font-size: 0.92rem;
}

.newsletter-form__input::placeholder {
  color: #64748b;
}

.newsletter-form__button {
  appearance: none;
  border: 0;
  width: 3rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8 70%, #1e40af);
  color: #ffffff;
  cursor: pointer;
  transition:
    background-color 220ms ease,
    transform 220ms ease,
    box-shadow 220ms ease;
}

.newsletter-form__button:hover {
  transform: scale(1.02);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.newsletter-form__icon {
  width: 1rem;
  height: 1rem;
}

.newsletter-form__hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.newsletter-form__hint-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
}

.site-footer__bottom {
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.site-footer__bottom p {
  margin: 0;
}

.site-footer__bottom-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem 1.5rem;
}

.site-footer__bottom-links span {
  padding: 0.4rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: color 220ms ease;
}

.site-footer__bottom-links span:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.07);
}

@media (min-width: 768px) {
  .site-footer__inner {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .site-footer__grid {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 2.5rem;
  }

  .footer-links ul {
    gap: 0.85rem;
  }

  .site-footer__bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  .newsletter-form__button,
  .footer-links span,
  .site-footer__bottom-links span {
    transition: none !important;
  }
}
</style>
