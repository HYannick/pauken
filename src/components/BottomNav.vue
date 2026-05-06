<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const TABS = [
  { id: 'home', path: '/', label: 'Accueil', emoji: '🏠' },
  { id: 'stats', path: '/stats', label: 'Stats', emoji: '📊' },
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-cream-200 flex justify-center">
    <div class="flex max-w-[460px] w-full px-4">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="flex-1 flex flex-col items-center gap-0.5 py-3 border-none bg-none cursor-pointer font-[Nunito,sans-serif] font-extrabold text-[0.78rem] transition-colors"
        :style="{
          color: route.name === tab.id ? '#2D2417' : '#C0B0A0',
          borderBottom: `3px solid ${route.name === tab.id ? '#2D2417' : 'transparent'}`,
        }"
        @click="router.push(tab.path)"
      >
        <span class="text-[1.2rem]">{{ tab.emoji }}</span>
        <span class="text-[0.68rem]">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
