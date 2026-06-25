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
  <div class="relative min-h-screen px-4 md:px-8 pb-20 overflow-hidden text-slate-800 bg-[#f8fafc] font-sans selection:bg-blue-500 selection:text-white">
    <!-- Background Decor -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-400/10 rounded-full blur-[100px] mix-blend-multiply" />
      <div class="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] bg-slate-400/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style="animation-delay: 2s;" />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-16 md:gap-24 pt-8 md:pt-16">
      
      <!-- HERO -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-6 flex flex-col gap-8">
          <div class="inline-flex self-start items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 bg-white/60 backdrop-blur-md shadow-sm">
            <Sparkles class="w-4 h-4 text-blue-500" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-600">Curated Reading Room</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-slate-900">
            Discover a <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">gallery wall</span><br/>
            of stories.
          </h1>
          
          <p class="text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
            Browse featured titles, jump through categories, bookmark favorites, and drop books into the cart without leaving the home screen.
          </p>
          
          <div class="flex flex-wrap gap-4 pt-2">
            <button type="button" @click="onNavigate('catalog')" class="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-blue-600/30 hover:-translate-y-1 cursor-pointer">
              <span>Explore Catalog</span>
              <ArrowRight class="w-4 h-4" />
            </button>
            <button type="button" @click="onNavigate('account')" class="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm uppercase tracking-wider border border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer">
              <span>Open Library</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-6 pt-10 mt-2 border-t border-slate-200/60">
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titles</span>
              <strong class="text-3xl font-black text-slate-800">{{ books.length }}</strong>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Featured</span>
              <strong class="text-3xl font-black text-slate-800">{{ featuredBooks.length }}</strong>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categories</span>
              <strong class="text-3xl font-black text-slate-800">{{ totalCategories }}</strong>
            </div>
          </div>
        </div>

        <!-- Spotlight Card -->
        <div class="lg:col-span-6 relative perspective-1000">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 opacity-60 mix-blend-multiply blur-xl animate-pulse" :style="{ backgroundColor: spotlightBook.bgAccent ? spotlightBook.bgAccent + '40' : undefined }" />
          
          <div class="relative bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 hover:shadow-3xl transition-all duration-500 group flex flex-col gap-8">
            <!-- Spotlight Header -->
            <div class="flex justify-between items-center">
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-inner">
                <BookOpen class="w-3.5 h-3.5" />
                Editor's Pick
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-md">
                <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {{ spotlightBook.rating.toFixed(1) }}
              </span>
            </div>
            
            <!-- Spotlight Image -->
            <div class="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-100 flex items-center justify-center p-6 shadow-inner group-hover:bg-slate-50 transition-colors" :style="{ backgroundColor: spotlightBook.bgAccent || '#eab308' }">
              <img :src="spotlightBook.coverImage" :alt="spotlightBook.title" referrerpolicy="no-referrer" class="relative z-10 w-2/3 h-auto max-h-[90%] object-cover rounded-xl shadow-[0_20px_40px_rgb(0,0,0,0.3)] group-hover:scale-105 group-hover:rotate-2 transition-transform duration-700 ease-out" />
            </div>
            
            <!-- Spotlight Details -->
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ spotlightBook.category }}</p>
                <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{{ spotlightBook.title }}</h2>
                <p class="text-sm font-semibold text-slate-500 mt-1">{{ spotlightBook.author }}</p>
              </div>
              
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <button type="button" @click="onAddToCart(spotlightBook)" class="flex-1 min-w-[160px] inline-flex justify-center items-center gap-2 px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                  Add to Cart — ${{ spotlightBook.price.toFixed(2) }}
                </button>
                <button type="button" @click="onToggleBookmark(spotlightBook.id)" class="inline-flex items-center justify-center w-12 h-12 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all duration-300 border border-slate-200 hover:border-red-200 shadow-sm cursor-pointer" :title="isBookmarked(spotlightBook.id) ? 'Remove Bookmark' : 'Save Book'">
                  <Heart class="w-5 h-5 transition-transform hover:scale-110" :class="{ 'fill-current text-red-500': isBookmarked(spotlightBook.id) }" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Grid -->
      <section class="flex flex-col gap-10 mt-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-black tracking-tight text-slate-900">Featured Books</h2>
            <p class="text-sm text-slate-500 font-medium">A quick look at the strongest picks in the collection.</p>
          </div>
          <button type="button" @click="onNavigate('catalog')" class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer">
            <span>See all</span>
            <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article v-for="book in featuredBooks" :key="book.id" @click="onSelectBook(book.id)" class="group cursor-pointer bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-400 flex flex-col gap-5">
            <div class="relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center p-6 bg-slate-100" :style="{ backgroundColor: book.bgAccent || '#eab308' }">
              <div class="absolute inset-0 bg-black/5" />
              <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="relative z-10 w-auto h-full max-w-[85%] object-cover rounded-md shadow-xl group-hover:scale-105 group-hover:rotate-2 transition-transform duration-500" />
            </div>
            
            <div class="flex flex-col gap-1.5 px-2">
              <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">{{ book.category }}</p>
              <h3 class="text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{{ book.title }}</h3>
              <p class="text-xs text-slate-500 font-medium">{{ book.author }}</p>
            </div>
            
            <div class="mt-auto px-2 flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-base font-black text-slate-900">${{ book.price.toFixed(2) }}</span>
              <button type="button" @click.stop="onAddToCart(book)" class="px-4 py-2 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer">
                Add
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Category Filter & Grid -->
      <section class="flex flex-col gap-10 bg-white/60 backdrop-blur-2xl border border-slate-200/50 rounded-[3rem] p-6 md:p-12 shadow-sm mt-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-black tracking-tight text-slate-900">Browse Categories</h2>
            <p class="text-sm text-slate-500 font-medium">Filter the catalog by the kind of reading mood you want.</p>
          </div>
          <button type="button" @click="onNavigate('catalog')" class="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
            <Compass class="w-4 h-4 text-blue-500" />
            <span>Catalog</span>
          </button>
        </div>
        
        <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <button v-for="pill in categoryPills" :key="pill" type="button" @click="activeCategory = pill" class="shrink-0 px-6 py-3 rounded-full text-xs font-bold tracking-wider transition-all duration-300 border cursor-pointer" :class="activeCategory === pill ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 transform -translate-y-0.5' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:shadow-sm'">
            {{ pill }}
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 pt-2">
          <article v-for="book in filteredBooks" :key="book.id" @click="onSelectBook(book.id)" class="group cursor-pointer bg-white border border-slate-100 rounded-[1.5rem] p-3 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-400 flex flex-col gap-3">
            <div class="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="relative z-10 w-auto h-full max-w-[90%] object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-500" />
              
              <button type="button" @click.stop="onToggleBookmark(book.id)" class="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors cursor-pointer" :title="isBookmarked(book.id) ? 'Remove bookmark' : 'Save to favorites'">
                <Heart class="w-4 h-4" :class="{ 'fill-current text-red-500': isBookmarked(book.id) }" />
              </button>
              
              <div class="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-white text-[9px] font-bold">
                <Star class="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {{ book.rating.toFixed(1) }}
              </div>
            </div>
            
            <div class="flex flex-col gap-1 px-1 text-center pt-2">
              <h3 class="text-[11px] md:text-xs font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{{ book.title }}</h3>
              <p class="text-[9px] md:text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{{ book.author }}</p>
            </div>
            
            <div class="mt-auto px-1 flex items-center justify-between pt-3 border-t border-slate-50">
              <span class="text-xs font-black text-slate-900">${{ book.price.toFixed(2) }}</span>
              <button type="button" @click.stop="onAddToCart(book)" class="px-2 py-1.5 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
                + Add
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Trending Section -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-8">
        <div class="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col gap-8">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="text-2xl font-black tracking-tight text-slate-900">Trending Now</h2>
              <p class="text-xs text-slate-500 font-medium">The highest-rated titles.</p>
            </div>
            <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
              <BookOpen class="w-5 h-5 text-slate-400" />
            </div>
          </div>
          
          <div class="flex flex-col gap-4">
            <article v-for="book in trendingBooks" :key="book.id" @click="onSelectBook(book.id)" class="group cursor-pointer flex items-center gap-5 p-3 pr-5 bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <div class="relative w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0" :style="{ backgroundColor: book.bgAccent || '#eab308' }">
                <img :src="book.coverImage" :alt="book.title" referrerpolicy="no-referrer" class="relative z-10 w-auto h-full max-w-[85%] object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div class="flex flex-col gap-1 flex-1 min-w-0">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">{{ book.category }}</p>
                <h3 class="text-sm font-bold text-slate-800 leading-tight truncate group-hover:text-blue-600 transition-colors">{{ book.title }}</h3>
                <p class="text-[10px] text-slate-500 truncate">{{ book.author }}</p>
              </div>
              
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <div class="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100">
                  <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                  {{ book.rating.toFixed(1) }}
                </div>
                <span class="text-sm font-black text-blue-600">${{ book.price.toFixed(2) }}</span>
              </div>
            </article>
          </div>
        </div>
        
        <div class="lg:col-span-7 relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl flex flex-col justify-between gap-12 bg-slate-900 group">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
          <div class="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div class="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-amber-400/10 rounded-full blur-3xl" />
          
          <div class="relative z-10 flex flex-col gap-6 max-w-lg">
            <span class="inline-flex self-start items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-100 border border-white/10 shadow-inner">
              Exclusive Access
            </span>
            <h2 class="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
              Start with a featured title, then branch into the catalog.
            </h2>
            <p class="text-sm md:text-base text-blue-100/90 leading-relaxed font-light">
              The interface keeps discovery light and fast. You can jump into details, save books for later, or add a copy to the cart with one click.
            </p>
          </div>
          
          <div class="relative z-10 flex flex-wrap items-center gap-4 mt-auto pt-8">
            <button type="button" @click="onNavigate('catalog')" class="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <span>Open Catalog</span>
              <ArrowRight class="w-4 h-4 text-blue-600" />
            </button>
            <div class="inline-flex items-center px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-xs font-semibold text-white shadow-inner">
              {{ bookmarkedCount }} bookmarked titles ready
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Utility for hiding scrollbar but allowing scroll */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
