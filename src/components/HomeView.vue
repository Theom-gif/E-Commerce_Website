<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  Heart,
  Sparkles,
  Star,
} from 'lucide-vue-next'
import { BOOKS } from '../data'
import type { Book } from '../types'

type HomeViewProps = {
  books: Book[]
  onSelectBook: (id: string) => void
  onNavigate: (view: string) => void
  onAddToCart: (book: Book) => void
  bookmarks: string[]
  onToggleBookmark: (id: string) => void
}

const props = defineProps<HomeViewProps>()

const activeCategory = ref('All')

const categoryPills = computed(() => ['All', ...Array.from(new Set(props.books.map((book) => book.category)))])

const featuredBooks = computed(() =>
  [...props.books]
    .filter((book) => book.featured || book.bgAccent)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
)

const spotlightBook = computed<Book>(
  () => featuredBooks.value[0] ?? [...props.books].sort((a, b) => b.rating - a.rating)[0] ?? BOOKS[0],
)

const trendingBooks = computed(() =>
  [...props.books]
    .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
    .slice(0, 3)
)

const filteredBooks = computed(() => {
  const source =
    activeCategory.value === 'All'
      ? props.books
      : props.books.filter((book) => book.category === activeCategory.value)

  return [...source].sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title)).slice(0, 10)
})

const totalCategories = computed(() => new Set(props.books.map((book) => book.category)).size)
const bookmarkedCount = computed(() => props.bookmarks.length)

const isBookmarked = (bookId: string) => props.bookmarks.includes(bookId)
</script>

<template>
  <div class="home-shell">
    <div class="home-backdrop" aria-hidden="true">
      <div class="orb orb-blue" />
      <div class="orb orb-amber" />
      <div class="orb orb-slate" />
    </div>

    <div class="home-inner">
      <section class="hero-section">
        <div class="hero-copy">
          <div class="eyebrow">
            <Sparkles class="eyebrow-icon" />
            <span>Curated reading room</span>
          </div>

          <div class="hero-text">
            <h1>A bookstore interface that feels like a gallery wall.</h1>
            <p>
              Browse featured titles, jump through categories, bookmark favorites, and drop books into the cart without leaving the home screen.
            </p>
          </div>

          <div class="hero-actions">
            <button type="button" class="button button-primary" @click="onNavigate('catalog')">
              <span>Explore catalog</span>
              <ArrowRight class="button-icon" />
            </button>

            <button type="button" class="button button-secondary" @click="onNavigate('account')">
              <span>Open library</span>
              <ChevronRight class="button-icon" />
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Titles</span>
              <strong>{{ books.length }}</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">Featured</span>
              <strong>{{ featuredBooks.length }}</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">Categories</span>
              <strong>{{ totalCategories }}</strong>
            </div>
          </div>
        </div>

        <div class="spotlight-card">
          <div
            class="spotlight-glow"
            :style="{
              background: `radial-gradient(circle at top left, ${spotlightBook.bgAccent || '#2563eb'} 0%, rgba(255,255,255,0) 58%), linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)`,
            }"
          />
          <div class="spotlight-halo spotlight-halo-one" />
          <div class="spotlight-halo spotlight-halo-two" />

          <div class="spotlight-content">
            <div class="spotlight-top">
              <span class="spotlight-chip">
                <BookOpen class="chip-icon" />
                Editor's pick
              </span>
              <span class="spotlight-score">
                <Star class="score-icon" />
                {{ spotlightBook.rating.toFixed(1) }}
              </span>
            </div>

            <div class="spotlight-frame">
              <img
                :src="spotlightBook.coverImage"
                :alt="spotlightBook.title"
                referrerpolicy="no-referrer"
                class="spotlight-cover"
              />
            </div>

            <div class="spotlight-meta">
              <div class="spotlight-copy">
                <p class="spotlight-category">{{ spotlightBook.category }}</p>
                <h2 class="spotlight-title">{{ spotlightBook.title }}</h2>
                <p class="spotlight-author">{{ spotlightBook.author }}</p>
              </div>

              <p class="spotlight-subtitle">
                {{ spotlightBook.subtitle }}
              </p>

              <div class="spotlight-actions">
                <button type="button" class="button button-dark" @click="onAddToCart(spotlightBook)">
                  Add to cart
                </button>
                <button type="button" class="button button-bookmark" @click="onToggleBookmark(spotlightBook.id)">
                  <Heart class="button-icon" :class="isBookmarked(spotlightBook.id) ? 'is-active' : ''" />
                  <span>{{ isBookmarked(spotlightBook.id) ? 'Saved' : 'Save' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-head">
          <div>
            <h2>Featured books</h2>
            <p>A quick look at the strongest picks in the collection.</p>
          </div>
          <button type="button" class="text-link" @click="onNavigate('catalog')">
            <span>See all</span>
            <ChevronRight class="text-link-icon" />
          </button>
        </div>

        <div class="featured-grid">
          <article
            v-for="book in featuredBooks"
            :key="book.id"
            class="book-card book-card-featured"
            @click="onSelectBook(book.id)"
          >
            <div class="book-cover-shell" :style="{ backgroundColor: book.bgAccent || '#eab308' }">
              <div class="book-cover-overlay" />
              <img
                :src="book.coverImage"
                :alt="book.title"
                referrerpolicy="no-referrer"
                class="book-cover"
              />
            </div>

            <div class="book-copy">
              <p class="book-category">{{ book.category }}</p>
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
            </div>

            <div class="book-footer">
              <span class="book-price">${{ book.price.toFixed(2) }}</span>
              <button type="button" class="mini-button" @click.stop="onAddToCart(book)">
                Add
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="content-section">
        <div class="section-head">
          <div>
            <h2>Browse categories</h2>
            <p>Filter the catalog by the kind of reading mood you want.</p>
          </div>
          <button type="button" class="pill-button" @click="onNavigate('catalog')">
            <Compass class="pill-button-icon" />
            <span>Catalog</span>
          </button>
        </div>

        <div class="pills-row">
          <button
            v-for="pill in categoryPills"
            :key="pill"
            type="button"
            class="category-pill"
            :class="{ 'is-active': activeCategory === pill }"
            @click="activeCategory = pill"
          >
            {{ pill }}
          </button>
        </div>

        <div class="category-grid">
          <article
            v-for="book in filteredBooks"
            :key="book.id"
            class="book-card book-card-compact"
            @click="onSelectBook(book.id)"
          >
            <div class="book-cover-shell book-cover-shell-compact">
              <img
                :src="book.coverImage"
                :alt="book.title"
                referrerpolicy="no-referrer"
                class="book-cover book-cover-compact"
              />

              <button
                type="button"
                class="bookmark-button"
                :title="isBookmarked(book.id) ? 'Remove bookmark' : 'Save to favorites'"
                @click.stop="onToggleBookmark(book.id)"
              >
                <Heart class="bookmark-icon" :class="{ 'is-active': isBookmarked(book.id) }" />
              </button>

              <div class="rating-badge">
                <Star class="rating-icon" />
                <span>{{ book.rating.toFixed(1) }}</span>
              </div>
            </div>

            <div class="book-copy book-copy-center">
              <h3 class="book-title book-title-small">{{ book.title }}</h3>
              <p class="book-author book-author-small">{{ book.author }}</p>
            </div>

            <div class="book-footer">
              <span class="book-price book-price-small">${{ book.price.toFixed(2) }}</span>
              <button type="button" class="mini-button" @click.stop="onAddToCart(book)">
                + Add
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="content-section feature-grid">
        <div class="trend-panel">
          <div class="section-head section-head-tight">
            <div>
              <h2>Trending now</h2>
              <p>The highest-rated titles in the room.</p>
            </div>
            <BookOpen class="section-head-icon" />
          </div>

          <div class="trend-list">
            <article
              v-for="book in trendingBooks"
              :key="book.id"
              class="trend-item"
              @click="onSelectBook(book.id)"
            >
              <div class="trend-cover" :style="{ backgroundColor: book.bgAccent || '#eab308' }">
                <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="trend-cover-image" />
              </div>

              <div class="trend-copy">
                <p class="trend-category">{{ book.category }}</p>
                <h3 class="trend-title">{{ book.title }}</h3>
                <p class="trend-author">{{ book.author }}</p>
              </div>

              <div class="trend-meta">
                <div class="trend-rating">
                  <Star class="rating-icon" />
                  <span>{{ book.rating.toFixed(1) }}</span>
                </div>
                <p class="trend-price">${{ book.price.toFixed(2) }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="cta-panel">
          <div class="cta-halo cta-halo-one" />
          <div class="cta-halo cta-halo-two" />

          <div class="cta-content">
            <div class="cta-copy">
              <span class="cta-chip">Exclusive collection access</span>
              <h2>Start with a featured title, then branch into the catalog from there.</h2>
              <p>
                The interface keeps discovery light and fast. You can jump into details, save books for later, or add a copy to the cart with one click.
              </p>
            </div>

            <div class="cta-footer">
              <button type="button" class="button button-inverse" @click="onNavigate('catalog')">
                <span>Open catalog</span>
                <ArrowRight class="button-icon" />
              </button>
              <div class="cta-note">
                {{ bookmarkedCount }} bookmarked titles ready in your shelf
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-shell {
  position: relative;
  overflow: hidden;
  padding: 0 1rem 5rem;
  isolation: isolate;
  color: #0f172a;
}

.home-inner {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 80rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding-top: 0.5rem;
  animation: fadeUp 0.7s ease both;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.eyebrow {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.88);
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 0.625rem;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
}

.eyebrow-icon,
.button-icon,
.chip-icon,
.score-icon,
.text-link-icon,
.pill-button-icon,
.section-head-icon,
.rating-icon,
.bookmark-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-text h1 {
  max-width: 18ch;
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.5rem, 5vw, 4.35rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.hero-text p {
  max-width: 42rem;
  margin: 0;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.button {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 3.1rem;
  padding: 0.8rem 1.2rem;
  border-radius: 1.05rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
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
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.22);
}

.button-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.button-secondary {
  color: #334155;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
}

.button-secondary:hover {
  color: #0f172a;
  border-color: rgba(148, 163, 184, 0.4);
  background: #ffffff;
}

.button-dark {
  color: #ffffff;
  background: #0f172a;
}

.button-dark:hover {
  background: #2563eb;
}

.button-bookmark {
  color: #334155;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.9);
}

.button-bookmark:hover {
  border-color: rgba(248, 113, 113, 0.28);
  color: #dc2626;
}

.button-bookmark .is-active {
  color: #ef4444;
  fill: currentColor;
}

.button-inverse {
  color: #2563eb;
  background: #ffffff;
}

.button-inverse:hover {
  color: #1d4ed8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
}

.stat-label {
  display: block;
  color: #94a3b8;
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.24em;
}

.stat-card strong {
  display: block;
  margin-top: 0.6rem;
  color: #0f172a;
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  line-height: 1;
  font-weight: 900;
}

.spotlight-card {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
}

.spotlight-glow {
  position: absolute;
  inset: 0;
  opacity: 0.92;
}

.spotlight-halo {
  position: absolute;
  border-radius: 9999px;
  filter: blur(40px);
}

.spotlight-halo-one {
  right: -3rem;
  top: -3rem;
  width: 9rem;
  height: 9rem;
  background: rgba(255, 255, 255, 0.32);
}

.spotlight-halo-two {
  bottom: -4rem;
  left: -2.5rem;
  width: 12rem;
  height: 12rem;
  background: rgba(37, 99, 235, 0.12);
}

.spotlight-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.25rem;
}

.spotlight-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.spotlight-chip,
.spotlight-score {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.5rem 0.8rem;
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.spotlight-chip {
  background: rgba(255, 255, 255, 0.88);
  color: #64748b;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.spotlight-score {
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
}

.score-icon {
  color: #ffb01f;
  fill: #ffb01f;
}

.spotlight-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.1rem;
  border-radius: 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
}

.spotlight-cover {
  position: relative;
  z-index: 1;
  max-width: 72%;
  height: 19rem;
  object-fit: cover;
  border-radius: 0.8rem;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.32);
  transition: transform 420ms ease;
}

.spotlight-card:hover .spotlight-cover,
.book-card:hover .book-cover,
.trend-item:hover .trend-cover-image {
  transform: scale(1.04);
}

.spotlight-meta {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.spotlight-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spotlight-category,
.book-category,
.trend-category {
  margin: 0;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.24em;
}

.spotlight-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  font-weight: 900;
}

.spotlight-author {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
}

.spotlight-subtitle,
.book-author,
.trend-author {
  margin: 0;
}

.spotlight-subtitle {
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.75;
}

.spotlight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.content-section {
  animation: fadeUp 0.7s ease both;
  animation-delay: 0.12s;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.section-head-tight {
  align-items: center;
}

.section-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.2rem, 2vw, 1.65rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.section-head p {
  margin: 0.45rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #2563eb;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.text-link:hover {
  text-decoration: underline;
}

.pill-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.7rem 0.95rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  color: #334155;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    background-color 220ms ease,
    box-shadow 220ms ease;
}

.pill-button:hover {
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.45);
  color: #0f172a;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.featured-grid {
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.book-card {
  border-radius: 1.75rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.book-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.14);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.book-card-featured {
  padding: 1rem;
}

.book-cover-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 1.2rem;
  aspect-ratio: 4 / 3;
  padding: 1rem;
}

.book-cover-shell-compact {
  aspect-ratio: 3 / 4;
  background: #f8fafc;
  padding: 0.85rem;
}

.book-cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.05);
}

.book-cover {
  position: relative;
  z-index: 1;
  max-width: 72%;
  height: 84%;
  object-fit: cover;
  border-radius: 0.8rem;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.26);
  transition: transform 420ms ease;
}

.book-copy {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.book-copy-center {
  margin-top: 0.85rem;
  text-align: center;
}

.book-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.book-title-small {
  font-size: 0.82rem;
}

.book-author {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 500;
}

.book-author-small {
  font-size: 0.68rem;
}

.book-footer {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border-top: 1px solid rgba(226, 232, 240, 1);
  padding-top: 0.9rem;
}

.book-price {
  color: #1e293b;
  font-size: 0.98rem;
  font-weight: 800;
}

.book-price-small {
  font-size: 0.8rem;
}

.mini-button {
  min-height: 2rem;
  padding: 0.45rem 0.8rem;
  border-radius: 0.8rem;
  color: #475569;
  background: #eef2f7;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  transition:
    transform 220ms ease,
    background-color 220ms ease,
    color 220ms ease;
}

.mini-button:hover {
  transform: translateY(-1px);
  background: #2563eb;
  color: #ffffff;
}

.pills-row {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
  scrollbar-width: none;
}

.pills-row::-webkit-scrollbar {
  display: none;
}

.category-pill {
  appearance: none;
  cursor: pointer;
  white-space: nowrap;
  padding: 0.7rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    background-color 220ms ease,
    box-shadow 220ms ease;
}

.category-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.45);
  color: #0f172a;
}

.category-pill.is-active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.2);
}

.category-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.book-card-compact {
  padding: 0.8rem;
}

.bookmark-button {
  position: absolute;
  left: 0.7rem;
  top: 0.7rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition:
    transform 220ms ease,
    color 220ms ease;
}

.bookmark-button:hover {
  transform: scale(1.08);
  color: #ef4444;
}

.bookmark-icon {
  color: #94a3b8;
}

.bookmark-icon.is-active {
  color: #ef4444;
  fill: currentColor;
}

.rating-badge {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0.45rem 0.65rem;
  background: rgba(15, 23, 42, 0.76);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  backdrop-filter: blur(10px);
}

.rating-icon {
  color: #ffb01f;
  fill: #ffb01f;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.trend-panel {
  padding: 1.4rem;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.trend-list {
  margin-top: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.8rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 0.72);
  cursor: pointer;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    box-shadow 220ms ease;
}

.trend-item:hover {
  transform: translateY(-2px);
  border-color: rgba(226, 232, 240, 0.95);
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.trend-cover {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 4.3rem;
  overflow: hidden;
  border-radius: 0.9rem;
}

.trend-cover-image {
  width: 88%;
  height: 88%;
  object-fit: cover;
  border-radius: 0.55rem;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.18);
  transition: transform 420ms ease;
}

.trend-copy {
  min-width: 0;
  flex: 1;
}

.trend-title {
  margin: 0.18rem 0 0;
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.2;
}

.trend-author {
  margin-top: 0.18rem;
  color: #64748b;
  font-size: 0.75rem;
}

.trend-meta {
  flex: 0 0 auto;
  text-align: right;
}

.trend-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 800;
}

.trend-price {
  margin: 0.35rem 0 0;
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 800;
}

.cta-panel {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  padding: 1.4rem;
  color: #ffffff;
  background: linear-gradient(145deg, #2563eb 0%, #334155 58%, #0f172a 100%);
  box-shadow: 0 22px 60px rgba(2, 6, 23, 0.2);
}

.cta-halo {
  position: absolute;
  border-radius: 9999px;
  filter: blur(42px);
  opacity: 0.16;
}

.cta-halo-one {
  top: 0;
  right: -2.5rem;
  width: 11rem;
  height: 11rem;
  background: #ffffff;
}

.cta-halo-two {
  left: -1.5rem;
  bottom: -2rem;
  width: 14rem;
  height: 14rem;
  background: #ffb01f;
}

.cta-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 100%;
}

.cta-copy {
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.cta-chip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.12);
  color: #dbeafe;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.cta-copy h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3.3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.cta-copy p {
  margin: 0;
  max-width: 40rem;
  color: #dbeafe;
  font-size: 0.94rem;
  line-height: 1.8;
}

.cta-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.cta-note {
  display: inline-flex;
  align-items: center;
  min-height: 3.1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #dbeafe;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(12px);
}

.home-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 38%),
    radial-gradient(circle at 80% 18%, rgba(255, 176, 31, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
  animation: backdropShift 18s ease-in-out infinite alternate;
}

.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(48px);
  opacity: 0.65;
  animation: orbFloat 14s ease-in-out infinite;
}

.orb-blue {
  top: 5rem;
  left: -4rem;
  width: 14rem;
  height: 14rem;
  background: rgba(37, 99, 235, 0.18);
}

.orb-amber {
  top: 14rem;
  right: -3rem;
  width: 16rem;
  height: 16rem;
  background: rgba(255, 176, 31, 0.18);
  animation-delay: -4s;
}

.orb-slate {
  bottom: -5rem;
  left: 32%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
  animation-delay: -8s;
}

.hero-section {
  animation: fadeUp 0.7s ease both;
}

.content-section {
  animation: fadeUp 0.7s ease both;
  animation-delay: 0.12s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.03);
  }
}

@keyframes backdropShift {
  0% {
    filter: saturate(1) brightness(1);
  }
  100% {
    filter: saturate(1.05) brightness(1.02);
  }
}

@media (min-width: 768px) {
  .home-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1024px) {
  .hero-section {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2rem;
  }

  .hero-copy {
    grid-column: span 7 / span 7;
  }

  .spotlight-card {
    grid-column: span 5 / span 5;
  }

  .featured-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .category-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .feature-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
  }

  .trend-panel {
    grid-column: span 5 / span 5;
  }

  .cta-panel {
    grid-column: span 7 / span 7;
  }
}

@media (max-width: 767px) {
  .section-head,
  .spotlight-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .spotlight-cover {
    max-width: 78%;
    height: 17rem;
  }

  .stats-grid,
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-backdrop,
  .orb,
  .hero-section,
  .content-section,
  .book-card,
  .spotlight-card,
  .trend-item,
  .button,
  .category-pill,
  .mini-button,
  .bookmark-button,
  .spotlight-cover,
  .book-cover,
  .trend-cover-image,
  .stat-card {
    animation: none !important;
    transition: none !important;
  }
}
</style>
