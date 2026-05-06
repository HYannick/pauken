<script setup lang="ts">
import type { Card, Phase, Feedback } from '../../types'
import { ARTICLE_META } from '../../data'
import { getOptStyle } from '../../composables/useGame'

defineProps<{
  card: Card
  phase: Phase
  feedback: Feedback | null
  sectionColor: string
}>()

defineEmits<{ answer: [opt: string] }>()
</script>

<template>
  <div class="flex flex-col gap-2.5 mb-3.5">
    <button
      v-for="(opt, i) in card.options"
      :key="opt"
      class="cursor-pointer font-[Nunito,sans-serif] font-extrabold rounded-[18px] pt-[15px] pr-[10px] pb-[11px] pl-[10px] transition-[transform,box-shadow] duration-[120ms] text-[1rem] leading-[1.2] relative border-[2.5px] hover:-translate-y-[3px] active:translate-y-[2px] disabled:cursor-default"
      :style="getOptStyle(opt, phase === 'reveal', card.answer, feedback?.chosen ?? null, card.isArticle, sectionColor)"
      :disabled="phase === 'reveal'"
      @click="$emit('answer', opt)"
    >
      <span class="absolute top-1 left-2 text-[0.58rem] opacity-35 font-bold">{{ i + 1 }}</span>
      <span class="block">{{ opt }}</span>
      <span v-if="card.isArticle && ARTICLE_META[opt]" class="block text-[0.6rem] font-bold opacity-60 mt-0.5">
        {{ ARTICLE_META[opt].label }}
      </span>
    </button>
  </div>
</template>
