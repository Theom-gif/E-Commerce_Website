<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Book } from '../types'
import { Heart } from 'lucide-vue-next'

const props = defineProps<{
  books: Book[]
  bookmarks: string[]
  onSelectBook: (id: string) => void
  onToggleBookmark: (id: string) => void
}>()

const bookmarkedBooks = computed(() => props.books.filter((book) => props.bookmarks.includes(book.id)))
</script>

<template>
  <div class="favorite-shell">
    <div class="favorite-inner">
      <section class="bookmarks-section">
        <header class="favorite-header">
          <div class="header-greeting">
            <h1>Your Favorites</h1>
            <p>Books you've saved for later.</p>
          </div>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ bookmarkedBooks.length }}</span>
              <span class="stat-label">Saved</span>
            </div>
          </div>
        </header>

        <div v-if="bookmarkedBooks.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="book in bookmarkedBooks" :key="book.id" class="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#2563eb]/20 transition-all cursor-pointer flex flex-col h-full" @click="onSelectBook(book.id)">
            <div class="relative aspect-[3/4] bg-slate-50/50 p-6 flex items-center justify-center">
              <img :src="book.coverImage" :alt="book.title" class="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-500" referrerpolicy="no-referrer" />
              <button type="button" @click.stop="onToggleBookmark(book.id)" class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm text-red-500 hover:scale-110 transition-transform">
                <Heart class="w-4 h-4 fill-current" />
              </button>
            </div>
            <div class="p-5 flex flex-col flex-grow">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{{ book.category }}</span>
              <h3 class="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{{ book.title }}</h3>
              <p class="text-xs text-slate-500 mb-4">{{ book.author }}</p>
              <div class="mt-auto flex items-center justify-between">
                <span class="font-bold text-lg tracking-tight text-[#0f172a]">${{ book.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <section v-else class="empty-state">
          <Heart class="empty-icon text-slate-300" />
          <h3>No favorites yet</h3>
          <p>Books you bookmark will appear here.</p>
        </section>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.favorite-shell {
  font-family: 'Outfit', sans-serif;
  padding: 2rem 1.5rem 4rem;
  min-height: calc(100vh - 4rem);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.favorite-inner {
  max-width: 56rem;
  margin: 0 auto;
}

.favorite-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  margin-bottom: 2rem;
}

.header-greeting h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.header-greeting p {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.5;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: transparent;
  border-radius: 1rem;
  border: 1px dashed rgba(15, 23, 42, 0.1);
  margin-top: 2rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}
</style>
