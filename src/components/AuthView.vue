<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Compass, Lock, Mail, User } from 'lucide-vue-next'
import { login, register } from '../api/store'

type AuthViewProps = {
  onAuthSuccess: (userData: { name: string; email: string }) => void
  onCancel: () => void
}

const props = defineProps<AuthViewProps>()

const isLogin = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function handleSubmit() {
  errorMessage.value = null
  successMessage.value = null

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in the required fields.'
    return
  }

  if (!isLogin.value) {
    if (!name.value) {
      errorMessage.value = 'Please add your full name.'
      return
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match.'
      return
    }

    if (password.value.length < 6) {
      errorMessage.value = 'Password must be at least 6 characters.'
      return
    }
  }

  isLoading.value = true
  try {
    const session = isLogin.value
      ? await login(email.value, password.value)
      : await register(name.value, email.value, password.value)
    successMessage.value = isLogin.value
      ? 'Authentication verified. Loading your archive...'
      : 'Membership created. Welcome to BookBase.'

    props.onAuthSuccess({
      name: session.user.name,
      email: session.user.email,
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function handlePrefill(mode: 'login' | 'register') {
  if (mode === 'login') {
    isLogin.value = true
    email.value = 'collector@bookbase.org'
    password.value = 'parchment77'
    confirmPassword.value = ''
    name.value = ''
  } else {
    isLogin.value = false
    name.value = 'Liheang Heng'
    email.value = 'liheang@bookbase.org'
    password.value = 'privatekeys'
    confirmPassword.value = 'privatekeys'
  }
}

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMessage.value = null
  successMessage.value = null
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-backdrop" aria-hidden="true">
      <div class="auth-orb auth-orb--blue" />
      <div class="auth-orb auth-orb--amber" />
      <div class="auth-orb auth-orb--ink" />
    </div>

    <div class="auth-card" id="auth-card-container">
      <aside class="auth-brand">
        <button type="button" class="auth-close" @click="onCancel" title="Return to store">
          <span>Close</span>
        </button>

        <div class="brand-mark">
          <Compass class="brand-icon" />
        </div>

        <h2>{{ isLogin ? 'Welcome back' : 'Join the archive' }}</h2>
        <p>
          {{ isLogin
            ? 'Sign in to manage bookmarks, saved collections, and your checkout history.'
            : 'Create a free collector profile to unlock bookmarks, checkout, and order tracking.'
          }}
        </p>

        <div class="brand-points">
          <span>Fast access</span>
          <span>Beautiful reading lists</span>
          <span>Order tracking</span>
        </div>
      </aside>

      <section class="auth-panel">
        <div class="auth-toggle">
          <button type="button" :class="{ 'is-active': isLogin }" @click="isLogin = true">Sign in</button>
          <button type="button" :class="{ 'is-active': !isLogin }" @click="isLogin = false">Register</button>
        </div>

        <Transition name="message">
          <div v-if="errorMessage" class="message message-error" id="auth-error-output">
            {{ errorMessage }}
          </div>
        </Transition>

        <Transition name="message">
          <div v-if="successMessage" class="message message-success" id="auth-success-output">
            {{ successMessage }}
          </div>
        </Transition>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <label v-if="!isLogin" class="field">
            <span>Full name</span>
            <div class="input-shell">
              <User class="field-icon" />
              <input
                id="register-input-name"
                v-model="name"
                type="text"
                required
                placeholder="e.g. Liheang Heng"
              />
            </div>
          </label>

          <label class="field">
            <span>Email address</span>
            <div class="input-shell">
              <Mail class="field-icon" />
              <input
                id="auth-input-email"
                v-model="email"
                type="email"
                required
                placeholder="name@email.com"
              />
            </div>
          </label>

          <label class="field">
            <span>Password</span>
            <div class="input-shell">
              <Lock class="field-icon" />
              <input
                id="auth-input-password"
                v-model="password"
                type="password"
                required
                placeholder="Enter password"
              />
            </div>
          </label>

          <label v-if="!isLogin" class="field">
            <span>Confirm password</span>
            <div class="input-shell">
              <Lock class="field-icon" />
              <input
                id="register-input-confirm"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
              />
            </div>
          </label>

          <button
            id="auth-submit-btn"
            type="submit"
            class="button button-dark"
            :class="{ 'is-loading': isLoading }"
            :disabled="isLoading"
          >
            <template v-if="isLoading">
              <span class="spinner" />
              Processing...
            </template>
            <template v-else>
              {{ isLogin ? 'Authenticate' : 'Create account' }}
              <ArrowRight class="button-icon" />
            </template>
          </button>
        </form>

        <div class="quick-actions">
          <p>Demo credentials</p>
          <div class="quick-buttons">
            <button type="button" class="button button-light" @click="handlePrefill('login')">
              Use login demo
            </button>
            <button type="button" class="button button-light" @click="handlePrefill('register')">
              Use register demo
            </button>
          </div>
        </div>

        <button type="button" class="mode-link" @click="toggleMode" id="auth-toggle-mode-btn">
          {{ isLogin ? "Need a collector account? Switch to register" : 'Already have an account? Switch to sign in' }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 4rem);
  padding: 1rem;
  isolation: isolate;
}

.auth-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.12), transparent 34%),
    radial-gradient(circle at 82% 16%, rgba(255, 176, 31, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.88));
}

.auth-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(56px);
  opacity: 0.7;
}

.auth-orb--blue {
  top: 5rem;
  left: -4rem;
  width: 16rem;
  height: 16rem;
  background: rgba(37, 99, 235, 0.18);
}

.auth-orb--amber {
  top: 9rem;
  right: -3rem;
  width: 17rem;
  height: 17rem;
  background: rgba(255, 176, 31, 0.18);
}

.auth-orb--ink {
  bottom: -4rem;
  left: 36%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
}

.auth-card {
  position: relative;
  z-index: 1;
  max-width: 70rem;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
}

.auth-brand {
  position: relative;
  padding: 2rem 1.5rem;
  color: #ffffff;
  background: linear-gradient(145deg, #0f172a, #1d4ed8 68%, #2563eb);
}

.auth-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  appearance: none;
  border: 0;
  border-radius: 9999px;
  padding: 0.55rem 0.85rem;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand-mark {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.brand-icon {
  width: 1.8rem;
  height: 1.8rem;
}

.auth-brand h2 {
  margin: 1.15rem 0 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
  font-weight: 900;
}

.auth-brand p {
  margin: 0.9rem 0 0;
  max-width: 30rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.94rem;
  line-height: 1.8;
}

.brand-points {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.3rem;
}

.brand-points span {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.45rem 0.8rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.auth-panel {
  padding: 1.5rem;
}

.auth-toggle {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
}

.auth-toggle button {
  appearance: none;
  border: 0;
  border-radius: 9999px;
  padding: 0.68rem 1rem;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-toggle button.is-active {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
}

.message {
  margin-top: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.7;
}

.message-error {
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(254, 242, 242, 0.9);
  color: #b91c1c;
}

.message-success {
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: rgba(236, 253, 245, 0.95);
  color: #047857;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
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

.input-shell input {
  width: 100%;
  min-height: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  padding: 0.85rem 1rem 0.85rem 2.7rem;
  color: #0f172a;
  font: inherit;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.input-shell input:focus {
  border-color: rgba(37, 99, 235, 0.34);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  background: #ffffff;
}

.input-shell input::placeholder {
  color: #94a3b8;
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

.button.is-loading {
  opacity: 0.72;
  cursor: progress;
}

.spinner {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.28);
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

.quick-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
}

.quick-actions p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.8rem;
}

.mode-link {
  appearance: none;
  border: 0;
  margin-top: 1rem;
  padding: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.7;
}

.mode-link:hover {
  text-decoration: underline;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.22s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 900px) {
  .auth-card {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
  }

  .auth-brand,
  .auth-panel {
    padding: 2.5rem;
  }
}

@media (max-width: 899px) {
  .auth-shell {
    padding: 0.75rem;
  }
}
</style>
