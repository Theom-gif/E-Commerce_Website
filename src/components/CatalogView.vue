<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertCircle, ArrowUpDown, Bookmark, ChevronRight, Filter, ShoppingCart, View, X } from 'lucide-vue-next'
import type { Book } from '../types'

type CatalogViewProps = {
  books: Book[]
  onSelectBook: (id: string) => void
  onAddToCart: (book: Book) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  bookmarks: string[]
  onToggleBookmark: (id: string) => void
}

const props = defineProps<CatalogViewProps>()

const selectedCategory = ref('All')
const sortBy = ref('curated')
const quickViewBook = ref<Book | null>(null)

const categories = computed(() => ['All', ...Array.from(new Set(props.books.map((book) => book.category)))])

const filteredBooks = computed(() => {
  return props.books.filter((book) => {
    const query = props.searchQuery.toLowerCase()
    const matchQuery =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.includes(props.searchQuery) ||
      (book.subtitle && book.subtitle.toLowerCase().includes(query)) ||
      book.category.toLowerCase().includes(query)

    const matchCategory = selectedCategory.value === 'All' || book.category === selectedCategory.value

    return matchQuery && matchCategory
  })
})

const sortedBooks = computed(() => {
  const list = [...filteredBooks.value]
  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'alphabetical') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    list.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
  }
  return list
})

function resetFilters() {
  props.onSearchChange('')
  selectedCategory.value = 'All'
  sortBy.value = 'curated'
}

const isBookmarked = (bookId: string) => props.bookmarks.includes(bookId)

function openSelectedFromQuickView() {
  if (!quickViewBook.value) return
  const selectedId = quickViewBook.value.id
  quickViewBook.value = null
  props.onSelectBook(selectedId)
}
</script>

<template>
  <div class="catalog-shell">
    <div class="catalog-backdrop" aria-hidden="true">
      <div class="orb orb-blue" />
      <div class="orb orb-amber" />
      <div class="orb orb-slate" />
    </div>

    <div class="catalog-inner">
      <section class="catalog-hero">
        <div class="catalog-hero__copy">
          <span class="eyebrow">
            <Filter class="eyebrow-icon" />
            The Folio Registry
          </span>
          <h1>Bibliographical catalog</h1>
          <p>
            Browse the archive, narrow by category, and open any book into a detailed card with one click.
          </p>
        </div>

        <div class="catalog-stats">
          <div class="stat-card">
            <span>Total titles</span>
            <strong>{{ books.length }}</strong>
          </div>
          <div class="stat-card">
            <span>Visible results</span>
            <strong>{{ sortedBooks.length }}</strong>
          </div>
          <div class="stat-card">
            <span>Categories</span>
            <strong>{{ categories.length }}</strong>
          </div>
        </div>
      </section>

      <section class="catalog-toolbar">
        <div class="control-group">
          <label>Search ledger</label>
          <div class="input-shell">
            <input
              id="catalog-search-id"
              :value="searchQuery"
              type="text"
              placeholder="Title, ISBN, author, keyword..."
              @input="onSearchChange(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div class="control-group">
          <label>Filter by category</label>
          <div class="pills-row">
            <button
              v-for="cat in categories"
              :key="cat"
              :id="'cat-filter-btn-' + cat.toLowerCase().replace(/[^a-z0-9]/g, '')"
              type="button"
              class="pill"
              :class="{ 'is-active': selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Sort indices</label>
          <div class="select-shell">
            <select
              id="catalog-sort-select"
              :value="sortBy"
              @change="sortBy = ($event.target as HTMLSelectElement).value"
            >
              <option value="curated">Curated registry score</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="alphabetical">Title A to Z</option>
            </select>
            <ArrowUpDown class="select-shell__icon" />
          </div>
        </div>
      </section>

      <section class="catalog-summary">
        <span>FOUND {{ sortedBooks.length }} REGISTERED MONOGRAPHS</span>
        <button v-if="searchQuery" type="button" class="text-link" @click="onSearchChange('')">
          Clear active query
        </button>
      </section>

      <section v-if="sortedBooks.length === 0" class="empty-state">
        <AlertCircle class="empty-state__icon" />
        <h3>End of described archive</h3>
        <p>
          We found no publications indexable under the query <em>{{ searchQuery }}</em> and category <em>{{ selectedCategory }}</em>.
        </p>
        <button type="button" class="button button-dark" @click="resetFilters">
          Reset filters
        </button>
      </section>

      <section v-else class="catalog-grid">
        <article
          v-for="book in sortedBooks"
          :key="book.id"
          :id="'catalog-card-' + book.id"
          class="book-card"
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

            <button
              :id="'bookmark-btn-' + book.id"
              type="button"
              class="bookmark-button"
              :title="isBookmarked(book.id) ? 'Saved in Archivist Ledger' : 'Bookmark this Edition'"
              @click.stop="onToggleBookmark(book.id)"
            >
              <Bookmark class="bookmark-button__icon" :class="{ 'is-active': isBookmarked(book.id) }" />
            </button>

            <button
              :id="'quickview-btn-' + book.id"
              type="button"
              class="quick-view-button"
              title="Quick Spec Sheets"
              @click.stop="quickViewBook = book"
            >
              <View class="quick-view-button__icon" />
              <span>Quick spec sheet</span>
            </button>
          </div>

          <div class="book-meta">
            <p class="book-category">{{ book.category }}</p>
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">By {{ book.author }}</p>
          </div>

          <div class="book-footer">
            <span class="book-price">${{ book.price.toFixed(2) }} USD</span>
            <span class="book-footer__arrow">
              Shed detail
              <ChevronRight class="book-footer__icon" />
            </span>
          </div>
        </article>
      </section>
    </div>

    <Teleport to="body">
      <Transition name="quick-view">
        <div
          v-if="quickViewBook"
          class="quickview-overlay"
          id="quick-view-overlay"
          @click="quickViewBook = null"
        >
          <div class="quickview-modal" id="quick-view-modal" @click.stop>
            <button id="close-quick-view" type="button" class="quickview-close" @click="quickViewBook = null">
              <X class="quickview-close__icon" />
            </button>

            <div class="quickview-grid">
              <div class="quickview-cover-panel">
                <img
                  :src="quickViewBook.coverImage"
                  :alt="quickViewBook.title"
                  referrerpolicy="no-referrer"
                  class="quickview-cover"
                />
              </div>

              <div class="quickview-copy">
                <span class="quickview-kicker">{{ quickViewBook.category }} Registry</span>
                <h3>{{ quickViewBook.title }}</h3>
                <p class="quickview-subline">
                  By {{ quickViewBook.author }} • published {{ quickViewBook.publishDate }}
                </p>
                <p class="quickview-description">
                  {{ quickViewBook.description }}
                </p>

                <div class="quickview-meta">
                  <div><span>ISBN:</span> {{ quickViewBook.isbn }}</div>
                  <div><span>Binding:</span> {{ quickViewBook.binding }}</div>
                  <div><span>Pages:</span> {{ quickViewBook.pages }} pp</div>
                  <div><span>Scale:</span> {{ quickViewBook.dimensions }}</div>
                </div>

                <div class="quickview-actions">
                  <span class="quickview-price">${{ quickViewBook.price.toFixed(2) }} USD</span>
                  <div class="quickview-buttons">
                    <button
                      id="quickview-add-to-cart"
                      type="button"
                      class="button button-dark"
                      @click="onAddToCart(quickViewBook); quickViewBook = null"
                    >
                      <ShoppingCart class="button-icon" />
                      <span>Secure copy</span>
                    </button>
                    <button
                      type="button"
                      class="button button-light"
                      @click="openSelectedFromQuickView"
                    >
                      Inspect book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.catalog-shell {
  position: relative;
  overflow: hidden;
  padding: 0 1rem 4rem;
  isolation: isolate;
  color: #0f172a;
}

.catalog-inner {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 80rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.catalog-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 38%),
    radial-gradient(circle at 80% 18%, rgba(255, 176, 31, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
}

.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(48px);
  opacity: 0.65;
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
}

.orb-slate {
  bottom: -4rem;
  left: 36%;
  width: 18rem;
  height: 18rem;
  background: rgba(15, 23, 42, 0.08);
}

.catalog-hero {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  align-items: end;
  padding-top: 0.5rem;
}

.catalog-hero__copy {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.eyebrow {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.95rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 0.625rem;
  font-weight: 800;
}

.eyebrow-icon,
.select-shell__icon,
.bookmark-button__icon,
.quick-view-button__icon,
.book-footer__icon,
.empty-state__icon,
.button-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
}

.catalog-hero__copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
  font-weight: 900;
}

.catalog-hero__copy p {
  margin: 0;
  max-width: 42rem;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.8;
}

.catalog-stats {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  padding: 1rem;
  border-radius: 1.35rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.stat-card span {
  display: block;
  color: #94a3b8;
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.stat-card strong {
  display: block;
  margin-top: 0.55rem;
  color: #0f172a;
  font-size: clamp(1.45rem, 2vw, 2rem);
  line-height: 1;
  font-weight: 900;
}

.catalog-toolbar {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  padding: 1rem;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.control-group label {
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.24em;
}

.input-shell,
.select-shell {
  display: flex;
  align-items: center;
  min-height: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.input-shell input,
.select-shell select {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0.85rem 1rem;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 600;
}

.input-shell input::placeholder {
  color: #94a3b8;
}

.select-shell {
  position: relative;
}

.select-shell select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.6rem;
}

.select-shell__icon {
  position: absolute;
  right: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
}

.pills-row {
  display: flex;
  gap: 0.55rem;
  overflow-x: auto;
  padding-bottom: 0.1rem;
  scrollbar-width: none;
}

.pills-row::-webkit-scrollbar {
  display: none;
}

.pill {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  padding: 0.65rem 0.95rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.pill:hover {
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.45);
  color: #0f172a;
}

.pill.is-active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.18);
}

.catalog-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 0.25rem;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.text-link {
  appearance: none;
  border: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.text-link:hover {
  text-decoration: underline;
}

.empty-state {
  max-width: 38rem;
  margin: 0 auto;
  padding: 3.5rem 1.5rem;
  text-align: center;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.empty-state__icon {
  margin: 0 auto 1rem;
  color: #f59e0b;
}

.empty-state h3 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.05em;
}

.empty-state p {
  margin: 0.8rem auto 0;
  max-width: 32rem;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.8;
}

.button {
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0.8rem 1.15rem;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
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
  background: rgba(248, 250, 252, 0.92);
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 1);
}

.catalog-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.book-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 1.75rem;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.book-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.14);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
}

.book-cover-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  padding: 1rem;
}

.book-cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.05);
}

.book-cover {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.24);
  transition: transform 420ms ease;
}

.book-card:hover .book-cover {
  transform: scale(1.03);
}

.bookmark-button,
.quick-view-button {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    transform 220ms ease,
    background-color 220ms ease,
    color 220ms ease;
}

.bookmark-button {
  top: 0.85rem;
  left: 0.85rem;
  width: 2rem;
  height: 2rem;
  justify-content: center;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  color: #94a3b8;
}

.bookmark-button:hover {
  transform: scale(1.08);
  color: #ef4444;
}

.bookmark-button__icon.is-active {
  color: #ef4444;
  fill: currentColor;
}

.quick-view-button {
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  justify-content: center;
  padding: 0.6rem 0.8rem;
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  opacity: 0;
  transform: translateY(8px);
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.book-card:hover .quick-view-button {
  opacity: 1;
  transform: translateY(0);
}

.quick-view-button:hover {
  background: #2563eb;
}

.book-meta {
  padding: 1rem 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.book-category {
  margin: 0;
  color: #94a3b8;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.book-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 900;
}

.book-author {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
}

.book-footer {
  margin: 0 1rem 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(226, 232, 240, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.book-price {
  color: #1e293b;
  font-size: 0.88rem;
  font-weight: 900;
}

.book-footer__arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #2563eb;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.quickview-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(14px);
}

.quickview-modal {
  position: relative;
  width: 100%;
  max-width: 64rem;
  max-height: 90vh;
  overflow: auto;
  border-radius: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.35);
}

.quickview-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: 0.85rem;
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.quickview-close:hover {
  color: #0f172a;
}

.quickview-close__icon {
  width: 1rem;
  height: 1rem;
}

.quickview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.2rem;
}

.quickview-cover-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  border-radius: 1.5rem;
  background: linear-gradient(145deg, #e2e8f0, #f8fafc);
}

.quickview-cover {
  max-width: 14rem;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.24);
}

.quickview-copy {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.quickview-kicker {
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.quickview-copy h3 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.4rem, 3vw, 2rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.quickview-subline {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.75;
}

.quickview-description {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.8;
}

.quickview-meta {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.65rem;
  padding-top: 0.25rem;
}

.quickview-meta div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.quickview-meta span {
  color: #94a3b8;
  font-weight: 800;
}

.quickview-actions {
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.quickview-price {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 900;
}

.quickview-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quick-view-enter-active,
.quick-view-leave-active {
  transition: all 0.24s ease;
}

.quick-view-enter-from,
.quick-view-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (min-width: 768px) {
  .catalog-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .catalog-toolbar {
    grid-template-columns: 1.15fr 1.45fr 0.9fr;
  }

  .catalog-hero {
    grid-template-columns: 1.3fr 0.8fr;
    gap: 1.5rem;
  }

  .quickview-grid {
    grid-template-columns: 0.9fr 1.1fr;
    gap: 1.8rem;
    padding: 1.5rem;
  }

  .quickview-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .catalog-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .catalog-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .catalog-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-view-button {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
