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
          <div class="book-cover-shell">
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
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.05), transparent 45%),
    radial-gradient(circle at 80% 18%, rgba(255, 176, 31, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.8));
}

@keyframes float {
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
  100% { transform: translateY(0px) scale(1); }
}

.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  opacity: 0.7;
  animation: float 8s ease-in-out infinite;
}

.orb-blue {
  top: 2rem;
  left: -5rem;
  width: 20rem;
  height: 20rem;
  background: rgba(37, 99, 235, 0.25);
  animation-delay: 0s;
}

.orb-amber {
  top: 8rem;
  right: -5rem;
  width: 22rem;
  height: 22rem;
  background: rgba(255, 176, 31, 0.2);
  animation-delay: 2s;
}

.orb-slate {
  bottom: -6rem;
  left: 30%;
  width: 24rem;
  height: 24rem;
  background: rgba(15, 23, 42, 0.12);
  animation-delay: 4s;
}

.catalog-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2.5rem;
  padding-top: 2.5rem;
  padding-bottom: 1rem;
}

.catalog-hero__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.eyebrow {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1.15rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.65rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.eyebrow-icon,
.select-shell__icon,
.bookmark-button__icon,
.quick-view-button__icon,
.book-footer__icon,
.empty-state__icon,
.button-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.catalog-hero__copy h1 {
  margin: 0;
  color: transparent;
  background: linear-gradient(135deg, #0f172a 20%, #475569 80%);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: clamp(3.2rem, 6vw, 5.5rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
  font-weight: 900;
  max-width: 60rem;
  filter: drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08));
}

.catalog-hero__copy p {
  margin: 0;
  max-width: 44rem;
  color: #475569;
  font-size: 1.1rem;
  line-height: 1.7;
}

.catalog-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}

.stat-card {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-card span {
  display: block;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

.stat-card strong {
  display: block;
  color: #0f172a;
  font-size: 1.6rem;
  line-height: 1;
  font-weight: 900;
}

.catalog-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.control-group label {
  display: none; /* Hide labels for a cleaner, modern look */
}

.input-shell,
.select-shell {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  transition: all 0.2s ease;
}

.input-shell:focus-within,
.select-shell:focus-within {
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
  background: #ffffff;
  border-color: rgba(37, 99, 235, 0.3);
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
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.pills-row::-webkit-scrollbar {
  display: none;
}

.pill {
  appearance: none;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  transition:
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 300ms ease,
    color 300ms ease,
    box-shadow 300ms ease,
    background 300ms ease;
}

.pill:hover {
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.pill.is-active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
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
  gap: 1.5rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.book-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  cursor: pointer;
  transition:
    transform 350ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 350ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 350ms ease;
}

.book-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 23, 42, 0.12);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.06);
}

.book-cover-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  padding: 1.5rem;
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}

.book-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0) 60%, rgba(15, 23, 42, 0.04) 100%);
  opacity: 0;
  transition: opacity 300ms ease;
}

.book-card:hover .book-cover-overlay {
  opacity: 0.8;
}

.book-cover {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms ease;
}

.book-card:hover .book-cover {
  transform: scale(1.04) translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.15);
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
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 220ms ease,
    color 220ms ease,
    opacity 300ms ease;
}

.bookmark-button {
  top: 1rem;
  left: 1rem;
  width: 2rem;
  height: 2rem;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  color: #94a3b8;
  opacity: 0;
  transform: scale(0.9);
}

.book-card:hover .bookmark-button {
  opacity: 1;
  transform: scale(1);
}

.bookmark-button:hover {
  transform: scale(1.1);
  color: #ef4444;
  background: #ffffff;
}

.bookmark-button__icon.is-active {
  color: #ef4444;
  fill: currentColor;
}

.bookmark-button.is-active {
  opacity: 1;
  transform: scale(1);
}

.quick-view-button {
  left: 50%;
  bottom: 1.25rem;
  transform: translate(-50%, 12px);
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  color: #ffffff;
  opacity: 0;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  white-space: nowrap;
}

.book-card:hover .quick-view-button {
  opacity: 1;
  transform: translate(-50%, 0);
}

.quick-view-button:hover {
  background: #2563eb;
  transform: translate(-50%, -2px);
}

.book-meta {
  padding: 1.25rem 1.25rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.book-category {
  margin: 0;
  color: #64748b;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.book-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
  font-weight: 800;
}

.book-author {
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
}

.book-footer {
  margin: auto 1.25rem 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.book-price {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 900;
}

.book-footer__arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #2563eb;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: transform 250ms ease;
}

.book-card:hover .book-footer__arrow {
  transform: translateX(4px);
}

.quickview-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(24px);
}

.quickview-modal {
  position: relative;
  width: 100%;
  max-width: 68rem;
  max-height: 90vh;
  overflow: auto;
  border-radius: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98));
  box-shadow: 0 40px 100px rgba(2, 6, 23, 0.4);
}

.quickview-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(8px);
  color: #64748b;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: all 250ms ease;
  z-index: 10;
}

.quickview-close:hover {
  color: #0f172a;
  background: #ffffff;
  transform: scale(1.05);
}

.quickview-close__icon {
  width: 1.15rem;
  height: 1.15rem;
}

.quickview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
}

.quickview-cover-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 2rem;
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.5), rgba(248, 250, 252, 0.8));
  box-shadow: inset 0 2px 12px rgba(15, 23, 42, 0.04);
}

.quickview-cover {
  max-width: 16rem;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 1.25rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.28);
}

.quickview-copy {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  justify-content: center;
}

.quickview-kicker {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.quickview-copy h3 {
  margin: 0;
  color: transparent;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.quickview-subline {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
}

.quickview-description {
  margin: 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.8;
}

.quickview-meta {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.85rem;
  padding-top: 0.5rem;
}

.quickview-meta div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 1px dashed rgba(226, 232, 240, 1);
  padding-bottom: 0.4rem;
}

.quickview-meta span {
  color: #94a3b8;
  font-weight: 800;
}

.quickview-actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.quickview-price {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 900;
}

.quickview-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.quick-view-enter-active {
  transition: opacity 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.quick-view-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.quick-view-enter-from,
.quick-view-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

@media (min-width: 768px) {
  .catalog-shell {
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .catalog-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .control-group {
    flex: 0 1 auto;
    min-width: 0;
  }
  
  .control-group:first-child {
    flex: 1;
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
