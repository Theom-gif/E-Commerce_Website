<script setup lang="ts">
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, Compass, Sparkles } from 'lucide-vue-next'

interface ErrorViewProps {
  onNavigateHome: () => void
  onNavigateCatalog: () => void
}

defineProps<ErrorViewProps>()
</script>

<template>
  <div class="error-shell">
    <div class="error-backdrop" aria-hidden="true">
      <div class="orb orb-blue" />
      <div class="orb orb-amber" />
      <div class="orb orb-slate" />
    </div>

    <div class="error-inner">
      <div class="error-card">
        <div class="error-badge">
          <AlertCircle class="error-badge-icon" />
          <span>404 / Missing entry</span>
        </div>

        <div class="error-hero">
          <div class="error-code">
            <span class="error-code-label">Diagnostic</span>
            <strong>404</strong>
          </div>

          <div class="error-copy">
            <h1>Beyond the described margin.</h1>
            <p>
              The index coordinates you requested do not correlate with any physical monographs registered inside our core archive.
            </p>
          </div>
        </div>

        <div class="error-panel">
          <div class="error-panel-top">
            <BookOpen class="error-panel-icon" />
            <span>Recovery notes</span>
          </div>
          <div class="error-meta">
            <p>SECTOR INDEX: FAULT_MARGIN_LINE</p>
            <p>SYSTEM RESOLVER: OFF-CANVAS_ERROR</p>
            <p>REFERENCE STATE: UNBOUNDED_VOID</p>
          </div>
        </div>

        <div class="error-actions">
          <button type="button" class="button button-primary" @click="onNavigateHome">
            <ArrowLeft class="button-icon" />
            <span>Home archive</span>
          </button>

          <button type="button" class="button button-secondary" @click="onNavigateCatalog">
            <Compass class="button-icon" />
            <span>Browse catalog</span>
            <ArrowRight class="button-icon" />
          </button>
        </div>

        <div class="error-footnote">
          <Sparkles class="footnote-icon" />
          <span>The shelf is intact, only this route is missing.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-shell {
  position: relative;
  overflow: hidden;
  min-height: min(100vh, 52rem);
  padding: 3rem 1rem 4rem;
  isolation: isolate;
  color: #0f172a;
}

.error-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(min(100vh, 52rem) - 7rem);
}

.error-card {
  width: 100%;
  max-width: 46rem;
  padding: 1.4rem;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(16px);
}

.error-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(255, 255, 255, 0.92);
  color: #b45309;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.error-badge-icon,
.button-icon,
.footnote-icon,
.error-panel-icon {
  width: 0.95rem;
  height: 0.95rem;
  flex: 0 0 auto;
}

.error-badge-icon {
  color: #ef4444;
}

.error-hero {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.2rem;
  align-items: end;
}

.error-code {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.error-code-label {
  color: #94a3b8;
  font-size: 0.66rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.28em;
}

.error-code strong {
  color: #0f172a;
  font-size: clamp(4rem, 12vw, 7rem);
  line-height: 0.92;
  letter-spacing: -0.08em;
  font-weight: 900;
}

.error-copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.error-copy p {
  margin: 0.8rem 0 0;
  max-width: 34rem;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.85;
}

.error-panel {
  margin-top: 1.4rem;
  padding: 1rem 1.1rem;
  border-radius: 1.4rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 0.84);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.error-panel-top {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.error-panel-icon {
  color: #1d4ed8;
}

.error-meta {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.55rem;
}

.error-meta p {
  margin: 0;
  color: #475569;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.error-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.button {
  appearance: none;
  border: 0;
  min-height: 3rem;
  padding: 0.8rem 1.15rem;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease,
    color 220ms ease,
    border-color 220ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  color: #ffffff;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  box-shadow: 0 18px 32px rgba(37, 99, 235, 0.18);
}

.button-primary:hover {
  background: linear-gradient(135deg, #1e293b, #2563eb);
}

.button-secondary {
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.button-secondary:hover {
  border-color: rgba(37, 99, 235, 0.18);
  background: #ffffff;
}

.error-footnote {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
}

.footnote-icon {
  color: #f59e0b;
  fill: #f59e0b;
}

.error-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 38%),
    radial-gradient(circle at 80% 20%, rgba(255, 176, 31, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.84));
}

.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(54px);
  opacity: 0.65;
  animation: float 16s ease-in-out infinite;
}

.orb-blue {
  top: 4rem;
  left: -3rem;
  width: 15rem;
  height: 15rem;
  background: rgba(37, 99, 235, 0.18);
}

.orb-amber {
  top: 10rem;
  right: -3rem;
  width: 16rem;
  height: 16rem;
  background: rgba(255, 176, 31, 0.18);
  animation-delay: -4s;
}

.orb-slate {
  bottom: -4rem;
  left: 36%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
  animation-delay: -8s;
}

@keyframes float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -16px, 0) scale(1.03);
  }
}

@media (min-width: 768px) {
  .error-shell {
    padding: 4rem 2rem 5rem;
  }

  .error-card {
    padding: 2rem;
  }

  .error-hero {
    grid-template-columns: 0.75fr 1.25fr;
    gap: 1.5rem;
  }

  .error-meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-backdrop,
  .orb,
  .button {
    animation: none !important;
    transition: none !important;
  }
}
</style>
