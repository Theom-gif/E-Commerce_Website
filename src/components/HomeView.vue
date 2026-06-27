<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowRight,
  BookOpen,
  Compass,
  Heart,
  Sparkles,
  Star,
  ShoppingCart,
  TrendingUp,
  Tag,
  ChevronRight,
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

const categoryPills = computed(() => ['All', ...Array.from(new Set(props.books.map((b) => b.category)))])

const featuredBooks = computed(() =>
  [...props.books].filter((b) => b.featured || b.bgAccent).sort((a, b) => b.rating - a.rating).slice(0, 4)
)

const spotlightBook = computed<Book>(
  () => featuredBooks.value[0] ?? [...props.books].sort((a, b) => b.rating - a.rating)[0] ?? BOOKS[0]
)

const trendingBooks = computed(() =>
  [...props.books].sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title)).slice(0, 4)
)

const filteredBooks = computed(() => {
  const source =
    activeCategory.value === 'All'
      ? props.books
      : props.books.filter((b) => b.category === activeCategory.value)
  return [...source].sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title)).slice(0, 10)
})

const totalCategories = computed(() => new Set(props.books.map((b) => b.category)).size)
const bookmarkedCount = computed(() => props.bookmarks.length)
const isBookmarked = (id: string) => props.bookmarks.includes(id)
</script>

<template>
  <main class="page">

    <!-- ════════════════════════════════════
         HERO
    ════════════════════════════════════ -->
    <section class="hero">
      <div class="container">
        <div class="hero__grid">

          <!-- Left: copy -->
          <div class="hero__copy">
            <div class="label-chip">
              <Sparkles :size="12" class="label-chip__ico" />
              Curated Reading Room
            </div>

            <h1 class="hero__h1">
              Discover a<br />
              <em class="hero__em">gallery wall</em><br />
              of stories.
            </h1>

            <p class="hero__lead">
              Browse featured titles, filter by category, bookmark favourites, and drop items into your cart — all without leaving home.
            </p>

            <div class="hero__actions">
              <button type="button" @click="onNavigate('catalog')" class="cta-primary">
                Explore Catalog
                <ArrowRight :size="16" />
              </button>
              <button type="button" @click="onNavigate('account')" class="cta-ghost">
                Open Library
              </button>
            </div>

            <!-- Stats row -->
            <div class="hero__stats">
              <div class="hstat">
                <strong class="hstat__num">{{ books.length }}</strong>
                <span class="hstat__lbl">Titles</span>
              </div>
              <div class="hstat-sep" aria-hidden="true" />
              <div class="hstat">
                <strong class="hstat__num">{{ featuredBooks.length }}</strong>
                <span class="hstat__lbl">Featured</span>
              </div>
              <div class="hstat-sep" aria-hidden="true" />
              <div class="hstat">
                <strong class="hstat__num">{{ totalCategories }}</strong>
                <span class="hstat__lbl">Categories</span>
              </div>
            </div>
          </div>

          <!-- Right: spotlight card -->
          <div class="spotlight-wrap">
            <!-- Decorative blur behind card -->
            <div class="spotlight-blob" :style="{ background: spotlightBook.bgAccent ? spotlightBook.bgAccent + '55' : 'rgba(99,102,241,0.15)' }" aria-hidden="true" />

            <div class="spotlight">
              <!-- Head row -->
              <div class="spotlight__top">
                <span class="chip chip--light">
                  <BookOpen :size="11" /> Editor's Pick
                </span>
                <span class="chip chip--dark">
                  <Star :size="11" class="chip__star" />
                  {{ spotlightBook.rating.toFixed(1) }}
                </span>
              </div>

              <!-- Cover -->
              <div class="spotlight__img-wrap" :style="{ backgroundColor: spotlightBook.bgAccent || '#eef2ff' }">
                <img
                  :src="spotlightBook.coverImage"
                  :alt="spotlightBook.title"
                  referrerpolicy="no-referrer"
                  class="spotlight__img"
                />
              </div>

              <!-- Info -->
              <div class="spotlight__info">
                <p class="spotlight__cat">{{ spotlightBook.category }}</p>
                <h2 class="spotlight__title">{{ spotlightBook.title }}</h2>
                <p class="spotlight__author">by {{ spotlightBook.author }}</p>
              </div>

              <!-- Actions -->
              <div class="spotlight__foot">
                <span class="spotlight__price">${{ spotlightBook.price.toFixed(2) }}</span>
                <div class="spotlight__btns">
                  <button
                    type="button"
                    @click="onToggleBookmark(spotlightBook.id)"
                    class="ico-btn"
                    :class="{ 'ico-btn--saved': isBookmarked(spotlightBook.id) }"
                    :title="isBookmarked(spotlightBook.id) ? 'Remove' : 'Save'"
                  >
                    <Heart :size="16" :class="{ 'fill-rose-500 text-rose-500': isBookmarked(spotlightBook.id) }" />
                  </button>
                  <button type="button" @click="onAddToCart(spotlightBook)" class="cta-primary cta-primary--sm">
                    Add to Cart <ArrowRight :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════
         TRENDING + PROMO BANNER
    ════════════════════════════════════ -->
    <section class="mid-section">
      <div class="container">
        <div class="mid-grid">

          <!-- Trending list -->
          <div class="card">
            <div class="card__head">
              <div>
                <h2 class="card__title">Trending Now</h2>
                <p class="card__sub">Highest-rated picks</p>
              </div>
              <span class="icon-circle">
                <TrendingUp :size="16" class="text-blue-600" />
              </span>
            </div>

            <ol class="trend-list">
              <li
                v-for="(book, i) in trendingBooks"
                :key="book.id"
                @click="onSelectBook(book.id)"
                class="trend-item"
              >
                <span class="trend-item__num">{{ String(i + 1).padStart(2, '0') }}</span>

                <div class="trend-item__thumb" :style="{ background: book.bgAccent || '#e8edf5' }">
                  <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="trend-item__img" />
                </div>

                <div class="trend-item__copy">
                  <p class="trend-item__cat">{{ book.category }}</p>
                  <h3 class="trend-item__name">{{ book.title }}</h3>
                  <p class="trend-item__by">{{ book.author }}</p>
                </div>

                <div class="trend-item__right">
                  <span class="star-tag">
                    <Star :size="11" class="star-tag__ico" /> {{ book.rating.toFixed(1) }}
                  </span>
                  <strong class="trend-item__price">${{ book.price.toFixed(2) }}</strong>
                </div>
              </li>
            </ol>

            <button type="button" @click="onNavigate('catalog')" class="card__more">
              View all <ChevronRight :size="14" />
            </button>
          </div>

          <!-- Promo banner -->
          <div class="promo">
            <!-- circles decoration -->
            <div class="promo__blob promo__blob--1" aria-hidden="true" />
            <div class="promo__blob promo__blob--2" aria-hidden="true" />

            <div class="promo__body">
              <span class="promo__tag">Exclusive Access</span>
              <h2 class="promo__h2">
                Start with a featured title,<br />
                then dive into the catalog.
              </h2>
              <p class="promo__txt">
                Discovery stays light and fast. Jump to details, save for later, or add to cart in one click.
              </p>
            </div>

            <div class="promo__foot">
              <button type="button" @click="onNavigate('catalog')" class="promo__cta">
                Open Catalog <ArrowRight :size="15" />
              </button>
              <div v-if="bookmarkedCount > 0" class="promo__saved">
                <Heart :size="13" class="promo__saved-ico" />
                {{ bookmarkedCount }} saved
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════
         BROWSE GRID
    ════════════════════════════════════ -->
    <section class="browse">
      <div class="container">

        <div class="browse__head">
          <div>
            <h2 class="section-h2">Browse Products</h2>
            <p class="section-sub">Filter by category to find what you need</p>
          </div>
          <button type="button" @click="onNavigate('catalog')" class="cta-ghost cta-ghost--sm">
            <Compass :size="14" /> Full Catalog
          </button>
        </div>

        <!-- Category pills -->
        <div class="cats" role="tablist" aria-label="Category filter">
          <button
            v-for="pill in categoryPills"
            :key="pill"
            type="button"
            role="tab"
            @click="activeCategory = pill"
            class="cat"
            :class="{ 'cat--on': activeCategory === pill }"
          >
            {{ pill }}
          </button>
        </div>

        <!-- Product grid -->
        <div class="grid">
          <article
            v-for="book in filteredBooks"
            :key="book.id"
            @click="onSelectBook(book.id)"
            class="pcard"
          >
            <!-- Cover -->
            <div class="pcard__cover">
              <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="pcard__img" />

              <!-- Hover overlay -->
              <div class="pcard__overlay">
                <button type="button" @click.stop="onAddToCart(book)" class="pcard__quick">
                  <ShoppingCart :size="15" /> Quick Add
                </button>
              </div>

              <!-- Badge: Save -->
              <button
                type="button"
                @click.stop="onToggleBookmark(book.id)"
                class="pcard__save"
                :class="{ 'pcard__save--on': isBookmarked(book.id) }"
              >
                <Heart :size="13" />
              </button>

              <!-- Badge: Rating -->
              <span class="pcard__rating">
                <Star :size="10" class="pcard__star" />{{ book.rating.toFixed(1) }}
              </span>
            </div>

            <!-- Info -->
            <div class="pcard__body">
              <p class="pcard__cat">
                <Tag :size="9" class="pcard__cat-ico" />
                {{ book.category }}
              </p>
              <h3 class="pcard__name">{{ book.title }}</h3>
              <p class="pcard__by">{{ book.author }}</p>
            </div>

            <!-- Footer -->
            <div class="pcard__foot">
              <span class="pcard__price">${{ book.price.toFixed(2) }}</span>
              <button type="button" @click.stop="onAddToCart(book)" class="pcard__add">
                <ShoppingCart :size="14" />
              </button>
            </div>
          </article>
        </div>

      </div>
    </section>

  </main>
</template>

<style scoped>
/* ════ tokens ════ */
:root {
  --c-bg: #f7f8fa;
  --c-surface: #ffffff;
  --c-border: #eaecf0;
  --c-ink: #111827;
  --c-muted: #6b7280;
  --c-faint: #9ca3af;
  --c-blue: #2563eb;
  --c-blue-soft: rgba(37, 99, 235, 0.09);
  --c-rose: #ef4444;
  --c-amber: #f59e0b;
  --radius-card: 20px;
  --radius-sm: 10px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
}

/* ════ page ════ */
.page {
  min-height: 100vh;
  background: var(--c-bg);
  padding-bottom: 6rem;
}

.container {
  max-width: 88rem;
  margin: 0 auto;
  padding: 0 1.75rem;
}

/* ════ utility ════ */
.section-h2 {
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--c-ink);
  margin: 0;
  line-height: 1.2;
}
.section-sub {
  font-size: 0.8rem;
  color: var(--c-faint);
  margin: 0.25rem 0 0;
  font-weight: 500;
}

/* ════ label chip ════ */
.label-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.9rem;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-muted);
  box-shadow: var(--shadow-sm);
}
.label-chip__ico { color: var(--c-blue); }

/* ════ chips ════ */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.chip--light { background: #f3f4f6; color: #374151; }
.chip--dark  { background: #111827; color: #fff; }
.chip__star  { fill: #f59e0b; color: #f59e0b; }

/* ════ CTAs ════ */
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.78rem 1.6rem;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 200ms, transform 160ms, box-shadow 200ms;
  box-shadow: 0 2px 10px rgba(17,24,39,0.2);
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.cta-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(29,78,216,0.35);
}
.cta-primary--sm { padding: 0.6rem 1.1rem; font-size: 0.8rem; }

.cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 1.4rem;
  background: #fff;
  color: #374151;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 180ms, background 180ms, transform 160ms;
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
}
.cta-ghost:hover { border-color: #d1d5db; background: #f9fafb; transform: translateY(-1px); }
.cta-ghost--sm { padding: 0.55rem 1rem; font-size: 0.78rem; }

/* icon button */
.ico-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--c-border);
  background: #fff;
  display: grid;
  place-items: center;
  color: #9ca3af;
  cursor: pointer;
  transition: all 180ms;
  flex-shrink: 0;
}
.ico-btn:hover { color: var(--c-rose); border-color: #fca5a5; background: #fff1f2; }
.ico-btn--saved { color: var(--c-rose); border-color: #fca5a5; }

/* ════ icon circle ════ */
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eff6ff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* ═══════════════════════════════════
   HERO
═══════════════════════════════════ */
.hero {
  padding: 3.5rem 0 2rem;
}

.hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

/* copy */
.hero__copy {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero__h1 {
  font-size: clamp(2.6rem, 5.5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1.07;
  color: var(--c-ink);
  margin: 0;
}
.hero__em {
  font-style: normal;
  background: linear-gradient(120deg, #2563eb 10%, #7c3aed 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__lead {
  font-size: 1rem;
  line-height: 1.75;
  color: #6b7280;
  margin: 0;
  max-width: 36rem;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--c-border);
}
.hstat { display: flex; flex-direction: column; gap: 0.15rem; }
.hstat__num {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: var(--c-ink);
  line-height: 1;
}
.hstat__lbl {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-faint);
}
.hstat-sep {
  width: 1px;
  height: 2.5rem;
  background: var(--c-border);
  flex-shrink: 0;
}

/* Spotlight */
.spotlight-wrap { position: relative; }

.spotlight-blob {
  position: absolute;
  inset: -3rem;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.spotlight {
  position: relative;
  z-index: 1;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.spotlight__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.spotlight__img-wrap {
  border-radius: 16px;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1.25rem;
  transition: background-color 300ms;
}
.spotlight__img {
  height: 100%;
  width: auto;
  max-width: 60%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.2);
  transition: transform 500ms ease;
}
.spotlight:hover .spotlight__img { transform: scale(1.05) rotate(1.5deg); }

.spotlight__info { display: flex; flex-direction: column; gap: 0.2rem; }
.spotlight__cat {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-faint);
  margin: 0;
}
.spotlight__title {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--c-ink);
  line-height: 1.2;
  margin: 0;
}
.spotlight__author {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--c-muted);
  margin: 0;
}

.spotlight__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
}
.spotlight__price {
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--c-ink);
}
.spotlight__btns { display: flex; align-items: center; gap: 0.6rem; }

/* ═══════════════════════════════════
   MID SECTION
═══════════════════════════════════ */
.mid-section {
  padding: 2rem 0;
}
.mid-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* card wrapper */
.card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.card__title {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--c-ink);
  margin: 0;
}
.card__sub {
  font-size: 0.75rem;
  color: var(--c-faint);
  margin: 0.2rem 0 0;
  font-weight: 500;
}

/* trending list */
.trend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.7rem 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  background: #fafafa;
  border: 1px solid transparent;
  transition: all 180ms;
}
.trend-item:hover {
  background: #fff;
  border-color: var(--c-border);
  transform: translateX(3px);
  box-shadow: var(--shadow-sm);
}

.trend-item__num {
  font-size: 0.65rem;
  font-weight: 800;
  color: #d1d5db;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  width: 1.4rem;
  text-align: center;
}

.trend-item__thumb {
  width: 44px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.trend-item__img {
  width: auto;
  height: 100%;
  max-width: 88%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14);
  transition: transform 300ms;
}
.trend-item:hover .trend-item__img { transform: scale(1.07); }

.trend-item__copy { flex: 1; min-width: 0; }
.trend-item__cat {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-faint);
  margin: 0;
}
.trend-item__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.1rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 180ms;
}
.trend-item:hover .trend-item__name { color: var(--c-blue); }
.trend-item__by {
  font-size: 0.68rem;
  color: var(--c-faint);
  margin: 0.1rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trend-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
}

.star-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: #374151;
  background: #fef9c3;
  padding: 0.18rem 0.5rem;
  border-radius: 9999px;
}
.star-tag__ico { fill: #f59e0b; color: #f59e0b; }

.trend-item__price {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--c-blue);
}

.card__more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  padding: 0.7rem;
  background: none;
  border: 1.5px dashed #e5e7eb;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--c-muted);
  cursor: pointer;
  transition: all 180ms;
}
.card__more:hover { border-color: var(--c-blue); color: var(--c-blue); background: var(--c-blue-soft); }

/* ─── promo banner ─── */
.promo {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
  padding: 2.5rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #2563eb 80%, #4f46e5 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.35);
  min-height: 340px;
}
.promo__blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.promo__blob--1 {
  width: 300px; height: 300px;
  top: -80px; right: -80px;
  background: rgba(255,255,255,0.07);
  filter: blur(50px);
}
.promo__blob--2 {
  width: 200px; height: 200px;
  bottom: -60px; left: 20px;
  background: rgba(250,204,21,0.12);
  filter: blur(40px);
}

.promo__body { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1rem; }

.promo__tag {
  display: inline-block;
  align-self: flex-start;
  padding: 0.3rem 0.85rem;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 9999px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.85);
}

.promo__h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.22;
  margin: 0;
}

.promo__txt {
  font-size: 0.88rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.7);
  margin: 0;
}

.promo__foot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
}

.promo__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #fff;
  color: #111827;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 200ms;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
.promo__cta:hover { background: #f1f5f9; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.24); }

.promo__saved {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.promo__saved-ico { fill: #fca5a5; color: #fca5a5; }

/* ═══════════════════════════════════
   BROWSE / GRID
═══════════════════════════════════ */
.browse { padding: 0 0 2rem; }

.browse__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* category pills */
.cats {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
  margin-bottom: 1.75rem;
}
.cats::-webkit-scrollbar { display: none; }

.cat {
  appearance: none;
  border: 1.5px solid var(--c-border);
  background: #fff;
  border-radius: 9999px;
  padding: 0.45rem 1.1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-muted);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 200ms;
  box-shadow: var(--shadow-sm);
}
.cat:hover { border-color: #d1d5db; color: var(--c-ink); background: #fff; }
.cat--on {
  background: var(--c-blue);
  border-color: var(--c-blue);
  color: #fff;
  box-shadow: 0 4px 14px rgba(37,99,235,0.35);
}

/* product grid */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.1rem;
}

/* product card */
.pcard {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 220ms, box-shadow 220ms, border-color 220ms;
}
.pcard:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: #d1d5db;
}

.pcard__cover {
  position: relative;
  aspect-ratio: 1 / 1.1;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
}
.pcard__img {
  height: 100%;
  width: auto;
  max-width: 85%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.13);
  transition: transform 350ms ease;
}
.pcard:hover .pcard__img { transform: scale(1.06); }

/* overlay on hover */
.pcard__overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1rem;
  opacity: 0;
  transition: opacity 220ms;
}
.pcard:hover .pcard__overlay { opacity: 1; }
.pcard__quick {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  background: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  transform: translateY(6px);
  transition: transform 220ms;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}
.pcard:hover .pcard__quick { transform: translateY(0); }
.pcard__quick:hover { background: #1d4ed8; color: #fff; }

/* save */
.pcard__save {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none;
  display: grid;
  place-items: center;
  color: #9ca3af;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  transition: color 160ms;
  z-index: 2;
}
.pcard__save:hover { color: var(--c-rose); }
.pcard__save--on { color: var(--c-rose); }

/* rating */
.pcard__rating {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.22rem 0.55rem;
  background: rgba(15,23,42,0.72);
  color: #fff;
  border-radius: 9999px;
  font-size: 0.6rem;
  font-weight: 800;
  backdrop-filter: blur(6px);
  z-index: 2;
}
.pcard__star { fill: #f59e0b; color: #f59e0b; }

/* body */
.pcard__body {
  padding: 0.85rem 1rem 0.4rem;
  flex: 1;
}
.pcard__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-blue);
  margin: 0 0 0.25rem;
}
.pcard__cat-ico { opacity: 0.7; }
.pcard__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 180ms;
}
.pcard:hover .pcard__name { color: var(--c-blue); }
.pcard__by {
  font-size: 0.68rem;
  color: var(--c-faint);
  margin: 0.2rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* footer */
.pcard__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid #f3f4f6;
}
.pcard__price {
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}
.pcard__add {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid var(--c-border);
  background: #fff;
  display: grid;
  place-items: center;
  color: var(--c-muted);
  cursor: pointer;
  transition: all 160ms;
}
.pcard__add:hover { background: #111827; color: #fff; border-color: #111827; }

/* ═══════════════════════════════════
   RESPONSIVE
═══════════════════════════════════ */
@media (min-width: 600px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 900px) {
  .hero { padding: 4.5rem 0 2.5rem; }
  .hero__grid {
    grid-template-columns: 55fr 45fr;
    gap: 5rem;
  }
  .mid-grid { grid-template-columns: 45fr 55fr; }
  .grid { grid-template-columns: repeat(5, 1fr); }
}

@media (min-width: 1100px) {
  .container { padding: 0 2.5rem; }
  .promo { padding: 3rem; }
}
</style>
