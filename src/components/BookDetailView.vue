<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, Bookmark, CheckCircle, ChevronLeft, ChevronRight, PenTool, ShoppingCart, Star } from 'lucide-vue-next'
import type { Book, Review } from '../types'

type BookDetailViewProps = {
  book: Book
  onBack: () => void
  onAddToCart: (book: Book, quantity: number) => void
  isBookmarked: boolean
  onToggleBookmark: (id: string) => void
}

const props = defineProps<BookDetailViewProps>()

const activeTab = ref<'inside' | 'specs' | 'reviews'>('inside')
const quantity = ref(1)
const insidePageIndex = ref(0)
const reviewAuthor = ref('')
const reviewRating = ref(5)
const reviewComment = ref('')
const reviewSuccess = ref(false)
const showReviewForm = ref(false)
const addedSuccess = ref(false)

const localReviews = ref<Review[]>([...props.book.reviews])
const hasInsidePages = computed(() => (props.book.insidePages?.length ?? 0) > 0)
const currentInsidePage = computed(() => props.book.insidePages?.[insidePageIndex.value] ?? '')
const ratingLabel = computed(() => props.book.rating.toFixed(1))

const formattedPublishDate = computed(() => {
  if (!props.book?.publishDate) return ''
  try {
    const d = new Date(props.book.publishDate)
    if (isNaN(d.getTime())) return props.book.publishDate
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch(e) {
    return props.book.publishDate
  }
})

function prevInsidePage() {
  if (insidePageIndex.value > 0) insidePageIndex.value--
}

function nextInsidePage() {
  const pageCount = props.book.insidePages?.length ?? 0
  if (insidePageIndex.value < pageCount - 1) insidePageIndex.value++
}

function triggerAddToCart() {
  props.onAddToCart(props.book, quantity.value)
  addedSuccess.value = true
  window.setTimeout(() => {
    addedSuccess.value = false
  }, 2200)
}

function handleReviewSubmit(e: Event) {
  e.preventDefault()

  if (!reviewAuthor.value.trim() || !reviewComment.value.trim()) return

  const newReview: Review = {
    id: `local-rev-${Date.now()}`,
    author: reviewAuthor.value.trim(),
    rating: reviewRating.value,
    date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    comment: reviewComment.value.trim(),
  }

  localReviews.value = [newReview, ...localReviews.value]
  reviewAuthor.value = ''
  reviewComment.value = ''
  reviewSuccess.value = true

  window.setTimeout(() => {
    reviewSuccess.value = false
    showReviewForm.value = false
  }, 2400)
}

function setRating(nextRating: number) {
  reviewRating.value = nextRating
}
</script>

<template>
  <div class="detail-shell">
    <div class="detail-backdrop" aria-hidden="true">
      <div class="detail-orb detail-orb--blue" />
      <div class="detail-orb detail-orb--amber" />
      <div class="detail-orb detail-orb--ink" />
    </div>

    <div class="detail-inner">
      <button type="button" class="back-link" @click="onBack" id="detail-back-button">
        <ArrowLeft class="icon-sm" />
        <span>Back to catalog</span>
      </button>

      <section class="hero-grid">
        <div class="cover-stage">
          <div class="cover-card">
            <img
              :src="book.coverImage"
              :alt="book.title"
              referrerpolicy="no-referrer"
              class="cover-image"
            />
            <button
              type="button"
              class="bookmark-chip"
              @click="onToggleBookmark(book.id)"
              :title="isBookmarked ? 'Remove from bookmarks' : 'Save this book'"
              id="detail-bookmark-btn"
            >
              <Bookmark class="icon-sm" :class="{ 'is-active': isBookmarked }" />
              <span>{{ isBookmarked ? 'Saved' : 'Bookmark' }}</span>
            </button>
          </div>

          <div class="cover-metadata">
            <span>ISBN {{ book.isbn }}</span>
            <span>{{ book.pages }} pages</span>
            <span>{{ book.binding }}</span>
          </div>
        </div>

        <div class="copy-stage">
          <div class="eyebrow-row">
            <span class="eyebrow-chip">{{ book.category }}</span>
            <span v-if="book.curatedCollection" class="eyebrow-note">{{ book.curatedCollection }}</span>
          </div>

          <h1 id="detail-title">{{ book.title }}</h1>
          <p v-if="book.subtitle" class="detail-subtitle">{{ book.subtitle }}</p>

          <div class="byline-row">
            <span>By <strong>{{ book.author }}</strong></span>
            <span class="dot">•</span>
            <span>{{ formattedPublishDate }}</span>
            <span class="dot">•</span>
            <span class="rating-inline">
              <Star class="icon-sm star-filled" />
              {{ ratingLabel }} / 5
            </span>
          </div>

          <p class="detail-copy">{{ book.description }}</p>

          <div class="info-grid">
            <div class="info-card">
              <span>Publisher</span>
              <strong>{{ book.publisher }}</strong>
            </div>
            <div class="info-card">
              <span>Dimensions</span>
              <strong>{{ book.dimensions }}</strong>
            </div>
            <div class="info-card">
              <span>Binding</span>
              <strong>{{ book.binding }}</strong>
            </div>
            <div class="info-card">
              <span>Author bio</span>
              <strong>{{ book.authorBio }}</strong>
            </div>
          </div>

          <div class="purchase-panel">
            <div class="quantity-block">
              <span>Quantity</span>
              <div class="quantity-controls">
                <button type="button" @click="quantity = Math.max(1, quantity - 1)">-</button>
                <strong>{{ quantity }}</strong>
                <button type="button" @click="quantity++">+</button>
              </div>
            </div>

            <div class="price-block">
              <span>Total</span>
              <strong>${{ (book.price * quantity).toFixed(2) }}</strong>
              <small>${{ book.price.toFixed(2) }} each</small>
            </div>

            <div class="action-block">
              <div v-if="addedSuccess" class="success-pill" id="add-cart-success">
                <CheckCircle class="icon-sm" />
                Added to cart
              </div>
              <button v-else type="button" class="button button-dark" @click="triggerAddToCart" id="add-to-cart-btn">
                <ShoppingCart class="icon-sm" />
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="tabs-shell">
        <div class="tabs-header">
          <button
            type="button"
            class="tab-btn"
            :class="{ 'is-active': activeTab === 'inside' }"
            @click="activeTab = 'inside'"
            id="tab-inside"
          >
            Inside the book
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'is-active': activeTab === 'specs' }"
            @click="activeTab = 'specs'"
            id="tab-specs"
          >
            Tactile specs
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'is-active': activeTab === 'reviews' }"
            @click="activeTab = 'reviews'"
            id="tab-reviews"
          >
            Reader reviews ({{ localReviews.length }})
          </button>
        </div>

        <div class="tabs-body">
          <section v-if="activeTab === 'inside'" class="inside-panel">
            <div class="reader-card">
              <div class="reader-topline">
                <span>{{ book.isbn }}</span>
                <span v-if="hasInsidePages">Spread {{ insidePageIndex + 1 }} of {{ book.insidePages?.length }}</span>
              </div>

              <div v-if="hasInsidePages" class="reader-page">
                <p>{{ currentInsidePage }}</p>
              </div>
              <div v-else class="reader-empty">
                No inside pages were recorded for this edition.
              </div>

              <div v-if="hasInsidePages" class="reader-controls">
                <button type="button" :disabled="insidePageIndex === 0" @click="prevInsidePage">
                  <ChevronLeft class="icon-sm" />
                  Previous
                </button>
                <span>Page {{ 12 + insidePageIndex * 16 }}</span>
                <button type="button" :disabled="insidePageIndex === (book.insidePages?.length ?? 0) - 1" @click="nextInsidePage">
                  Next
                  <ChevronRight class="icon-sm" />
                </button>
              </div>
            </div>
          </section>

          <section v-else-if="activeTab === 'specs'" class="specs-panel">
            <div class="spec-grid">
              <div v-for="(value, key) in book.specifications" :key="key" class="spec-row">
                <span>{{ key }}</span>
                <strong>{{ value }}</strong>
              </div>
            </div>
          </section>

          <section v-else class="reviews-panel">
            <div class="reviews-header">
              <div>
                <h3>Reader transcripts</h3>
                <p>Notes, reactions, and close readings from the archive.</p>
              </div>
              <button type="button" class="button button-light" @click="showReviewForm = !showReviewForm" id="write-review-toggle">
                <PenTool class="icon-sm" />
                {{ showReviewForm ? 'Close form' : 'Write a review' }}
              </button>
            </div>

            <div v-if="showReviewForm" class="review-form-card" id="review-form-panel">
              <div v-if="reviewSuccess" class="success-banner">
                <CheckCircle class="icon-sm" />
                Review saved successfully.
              </div>

              <form v-else class="review-form" @submit="handleReviewSubmit">
                <div class="field-grid">
                  <label class="field">
                    <span>Your name</span>
                    <input
                      v-model="reviewAuthor"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      id="review-author-input"
                    />
                  </label>

                  <label class="field">
                    <span>Rating</span>
                    <div class="rating-picker">
                      <button
                        v-for="n in 5"
                        :key="n"
                        type="button"
                        @click="setRating(n)"
                        :class="{ 'is-active': n <= reviewRating }"
                        :id="'star-rating-select-' + n"
                      >
                        <Star class="icon-sm" />
                      </button>
                    </div>
                  </label>
                </div>

                <label class="field">
                  <span>Comment</span>
                  <textarea
                    v-model="reviewComment"
                    rows="4"
                    required
                    placeholder="Share your reading notes, print observations, or binding impressions..."
                    id="review-comment-textarea"
                  />
                </label>

                <button type="submit" class="button button-dark" id="review-submit-button">
                  File review
                </button>
              </form>
            </div>

            <div class="reviews-list">
              <p v-if="localReviews.length === 0" class="empty-copy">
                No reviews yet. Be the first to leave a note.
              </p>

              <article v-for="review in localReviews" :key="review.id" class="review-card" :id="'critique-' + review.id">
                <div class="review-topline">
                  <strong>{{ review.author }}</strong>
                  <span>{{ review.date }}</span>
                </div>
                <div class="review-stars">
                  <Star
                    v-for="n in 5"
                    :key="n"
                    class="icon-sm"
                    :class="{ 'star-filled': n <= review.rating }"
                  />
                </div>
                <p>“{{ review.comment }}”</p>
              </article>
            </div>
          </section>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.detail-shell {
  position: relative;
  overflow: hidden;
  padding: 1rem 1rem 4rem;
  isolation: isolate;
  color: #0f172a;
}

.detail-inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.08), transparent 35%),
    radial-gradient(circle at 90% 12%, rgba(255, 176, 31, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
}

.detail-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(52px);
  opacity: 0.7;
}

.detail-orb--blue {
  top: 3rem;
  left: -4rem;
  width: 15rem;
  height: 15rem;
  background: rgba(37, 99, 235, 0.18);
}

.detail-orb--amber {
  top: 9rem;
  right: -4rem;
  width: 16rem;
  height: 16rem;
  background: rgba(255, 176, 31, 0.18);
}

.detail-orb--ink {
  bottom: -4rem;
  left: 35%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
}

.back-link {
  appearance: none;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
}

.back-link:hover {
  color: #0f172a;
}

.icon-sm {
  width: 0.95rem;
  height: 0.95rem;
  flex: 0 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.cover-stage,
.copy-stage,
.tabs-shell,
.reader-card,
.review-form-card {
  border: none;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
}

.cover-stage {
  padding: 0;
  border-radius: 0;
}

.cover-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-chip {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 9999px;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  color: #0f172a;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.bookmark-chip:hover {
  transform: translateY(-1px);
}

.bookmark-chip .is-active {
  color: #ef4444;
  fill: currentColor;
}

.cover-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.9rem;
  color: #64748b;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cover-metadata span {
  padding: 0.55rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.92);
}

.copy-stage {
  border-radius: 0;
  padding: 0 1.5rem;
}

.eyebrow-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}

.eyebrow-chip,
.eyebrow-note {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  border-radius: 9999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.eyebrow-chip {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
}

.eyebrow-note {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.92);
  color: #64748b;
}

.copy-stage h1 {
  margin: 0.8rem 0 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 3.5vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  font-weight: 900;
}

.detail-subtitle {
  margin: 0.75rem 0 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.8;
  font-style: italic;
}

.byline-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.byline-row strong,
.rating-inline {
  color: #0f172a;
}

.dot {
  color: #cbd5e1;
}

.star-filled {
  color: #f59e0b;
  fill: currentColor;
}

.detail-copy {
  margin: 1.05rem 0 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.85;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 1.15rem;
}

.info-card {
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px dashed rgba(15, 23, 42, 0.15);
  background: transparent;
}

.info-card span {
  display: block;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.info-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
  font-size: 0.85rem;
  line-height: 1.7;
  font-weight: 700;
}

.purchase-panel {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.04);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
  backdrop-filter: blur(12px);
  color: #0f172a;
}

.quantity-block,
.price-block,
.action-block {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.quantity-block span,
.price-block span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.quantity-controls {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.6);
  width: fit-content;
}

.quantity-controls button {
  appearance: none;
  border: 0;
  width: 2rem;
  height: 2rem;
  background: transparent;
  color: #0f172a;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
}

.quantity-controls strong {
  min-width: 2rem;
  text-align: center;
  font-size: 0.9rem;
}

.price-block strong {
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.price-block small {
  color: #94a3b8;
  font-size: 0.7rem;
}

.button {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.64rem;
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
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.success-pill,
.success-banner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.7rem 0.95rem;
  background: rgba(255, 255, 255, 0.12);
  color: #d1fae5;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tabs-shell {
  border-radius: 2rem;
  padding: 1rem;
}

.tabs-header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tab-btn {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  padding: 0.78rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.tab-btn.is-active {
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #ffffff;
  border-color: transparent;
}

.tabs-body {
  margin-top: 1rem;
}

.reader-card {
  border-radius: 1.75rem;
  padding: 1rem;
}

.reader-topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.reader-page {
  margin-top: 1rem;
  min-height: 18rem;
  padding: 1.4rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #fbfdff, #eef2ff);
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.reader-page p {
  margin: 0;
  white-space: pre-line;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.95;
}

.reader-empty {
  margin-top: 1rem;
  padding: 1.8rem 1rem;
  border-radius: 1.25rem;
  background: rgba(248, 250, 252, 0.96);
  color: #64748b;
  text-align: center;
}

.reader-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.reader-controls button {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 9999px;
  padding: 0.65rem 0.9rem;
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  cursor: pointer;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.reader-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spec-grid {
  display: grid;
  gap: 0.75rem;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.35rem;
  padding: 0.95rem 1rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.92);
}

.spec-row span {
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.spec-row strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.7;
}

.reviews-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.reviews-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.reviews-header p {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.7;
}

.review-form-card {
  border-radius: 1.75rem;
  padding: 1rem;
}

.review-form,
.field-grid,
.field {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field-grid {
  gap: 1rem;
}

.field span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.field input,
.field textarea {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.95);
  padding: 0.9rem 1rem;
  color: #0f172a;
  outline: none;
  font: inherit;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.field textarea {
  resize: vertical;
  min-height: 8rem;
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.rating-picker {
  display: flex;
  gap: 0.35rem;
}

.rating-picker button {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.95);
  color: #cbd5e1;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.rating-picker button.is-active {
  color: #f59e0b;
  fill: currentColor;
  border-color: rgba(245, 158, 11, 0.25);
}

.success-banner {
  background: linear-gradient(135deg, #0f172a, #14532d);
  color: #d1fae5;
  width: fit-content;
}

.reviews-list {
  display: grid;
  gap: 0.75rem;
}

.empty-copy {
  margin: 0;
  padding: 1rem 0;
  color: #64748b;
  font-size: 0.92rem;
  text-align: center;
}

.review-card {
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.92);
}

.review-topline {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.75rem;
}

.review-topline strong {
  color: #0f172a;
}

.review-stars {
  display: flex;
  gap: 0.2rem;
  margin: 0.45rem 0 0.7rem;
  color: #cbd5e1;
}

.review-card p {
  margin: 0;
  color: #475569;
  font-size: 0.94rem;
  line-height: 1.85;
}

@media (min-width: 768px) {
  .detail-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .hero-grid {
    grid-template-columns: clamp(250px, 35vw, 420px) 1fr;
    gap: 4rem;
    align-items: start;
  }

  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .purchase-panel {
    flex-wrap: nowrap;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .spec-row {
    grid-template-columns: 0.35fr 0.65fr;
    align-items: start;
  }
}

@media (max-width: 767px) {
  .reviews-header,
  .reader-controls,
  .cover-metadata {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
