<script setup lang="ts">
defineProps<{
  hearts: number
  maxHearts: number
  score: number
  streak: number
}>()
</script>

<template>
  <div class="flex justify-between items-center mb-3.5">
    <div class="flex gap-0.5">
      <span
        v-for="i in maxHearts"
        :key="i"
        class="text-[1.1rem] inline-block transition-all duration-200"
        :style="{ filter: i > hearts ? 'grayscale(1) opacity(0.3)' : 'none', transform: i > hearts ? 'scale(0.85)' : 'scale(1)' }"
      >❤️</span>
    </div>
    <div class="text-cream-600 text-[0.82rem] font-extrabold">
      {{ score }} pts
      <span v-if="streak >= 3" class="ml-2 text-[#FF9800]">🔥×{{ streak }}</span>
    </div>
  </div>
</template>
