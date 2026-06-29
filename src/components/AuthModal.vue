<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Compass, Lock, Mail, User, X } from 'lucide-vue-next'
import { login, register } from '../api/store'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (userData: { name: string; email: string }) => void
}

const props = defineProps<AuthModalProps>()

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

    setTimeout(() => {
        props.onAuthSuccess({
            name: session.user.name,
            email: session.user.email,
        })
        props.onClose()
    }, 1000)
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
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
    @click.self="onClose"
  >
    <div class="auth-card animate-slide-up relative bg-white border border-slate-100 max-w-4xl w-full shadow-2xl rounded-[2rem] overflow-hidden" id="auth-modal-container">
      
      <!-- Close button overlaying the modal on small screens or just in the corner -->
      <button 
        type="button" 
        class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors md:hidden"
        @click="onClose"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="flex flex-col md:flex-row w-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
        <!-- Left Brand Section -->
        <aside class="auth-brand w-full md:w-[45%] flex-shrink-0">
          <div class="brand-mark mb-6">
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

        <!-- Right Panel Section -->
        <section class="auth-panel w-full md:w-[55%] flex-shrink-0 overflow-y-auto relative p-6 md:p-8 lg:p-10">
          
          <button 
            type="button" 
            class="hidden md:flex absolute top-6 right-6 w-8 h-8 items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            @click="onClose"
          >
            <X class="w-4 h-4" />
          </button>

          <div class="auth-toggle mb-6">
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
                  id="modal-register-input-name"
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
                  id="modal-auth-input-email"
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
                  id="modal-auth-input-password"
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
                  id="modal-register-input-confirm"
                  v-model="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm password"
                />
              </div>
            </label>

            <button
              id="modal-auth-submit-btn"
              type="submit"
              class="button button-dark mt-4"
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

          <button type="button" class="mode-link" @click="toggleMode" id="modal-auth-toggle-mode-btn">
            {{ isLogin ? "Need a collector account? Switch to register" : 'Already have an account? Switch to sign in' }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-brand {
  position: relative;
  padding: 2rem 1.5rem;
  color: #ffffff;
  background: #0f172a;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.05);
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
  margin: 1.5rem 0 0;
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  font-weight: 800;
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
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.8);
}

.brand-points span::before {
  content: '•';
  margin-right: 0.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.auth-toggle {
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.6);
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
  transition: all 0.2s ease;
}

.auth-toggle button.is-active {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.message {
  margin-top: 1rem;
  margin-bottom: 1rem;
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
  min-height: 2.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(248, 250, 252, 0.8);
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  color: #0f172a;
  font: inherit;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.input-shell input:focus {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
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
  gap: 0.4rem;
  min-height: 2.75rem;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.15em;
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
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
}

.button-light {
  background: rgba(255, 255, 255, 0.8);
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
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
  margin-top: 1.5rem;
  padding-top: 1.25rem;
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
  text-align: left;
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (min-width: 768px) {
  .auth-brand {
    padding: 2.5rem;
  }
}
</style>
