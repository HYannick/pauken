<script setup lang="ts">
defineProps<{
  index: number
  deckLength: number
  color: string
}>()

defineEmits<{ back: [] }>()
</script>

<template>
  <div class="flex items-center gap-3 pt-5 pb-4">
    <button class="bg-none border-none cursor-pointer text-[1.2rem] text-cream-600 p-1" @click="$emit('back')">←</button>
    <div class="flex-1 h-[10px] bg-cream-200 rounded-full overflow-hidden">
      <div class="bar-fill h-full rounded-full"
           :style="{ width: `${(index / deckLength) * 100}%`, background: color }" />
    </div>
    <div class="text-cream-600 text-[0.8rem] font-extrabold min-w-[44px] text-right">
      {{ index + 1 }}/{{ deckLength }}
    </div>
  </div>
</template>
