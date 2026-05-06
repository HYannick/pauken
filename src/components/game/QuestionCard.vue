<script setup lang="ts">
import type { Card, Feedback } from '../../types'
import { ARTICLE_META } from '../../data'

defineProps<{
  card: Card
  feedback: Feedback | null
  feedbackMsg: string
  shake: boolean
  bounce: boolean
  sectionColor: string
}>()
</script>

<template>
  <div
    :class="['rounded-[28px] p-[40px_28px_32px] text-center mb-3.5 min-h-[200px] flex flex-col items-center justify-center relative transition-[border-color,box-shadow] duration-[250ms]',
             { 'animate-shake': shake, 'animate-bounce-card': bounce }]"
    :style="{
      background: '#fff',
      border: `2.5px solid ${feedback ? (feedback.correct ? '#58CC02' : '#FF4444') : '#E8E0D5'}`,
      boxShadow: feedback ? (feedback.correct ? '0 4px 0 #45A800' : '0 4px 0 #CC0000') : '0 4px 0 #D4C9B8',
    }"
  >
    <div v-if="feedback"
         class="animate-fade-up absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[0.9rem]"
         :style="{ background: feedback.correct ? '#58CC02' : '#FF4444' }">
      {{ feedback.correct ? '✓' : '✗' }}
    </div>

    <div v-if="card.errorRate > 0 && !feedback"
         class="absolute top-3.5 left-3.5 text-[0.65rem] font-extrabold rounded-lg px-1.5 py-0.5"
         :style="{
           color: card.errorRate >= 0.5 ? '#CC4400' : '#AA7700',
           background: card.errorRate >= 0.5 ? '#FFF0E8' : '#FFFAE8',
           border: `1.5px solid ${card.errorRate >= 0.5 ? '#FFCCA0' : '#FFE8A0'}`,
         }">
      {{ Math.round(card.errorRate * 100) }}% erreurs
    </div>

    <div class="text-[#C0B0A0] text-[0.7rem] font-extrabold uppercase tracking-[0.1em] mb-3">
      {{ card.context }}
    </div>

    <div class="font-[Fredoka,sans-serif] text-[clamp(2.2rem,9vw,3rem)] font-semibold leading-[1.1] mb-2 transition-colors duration-[250ms]"
         :style="{ color: feedback ? (card.isArticle ? ARTICLE_META[card.answer]?.color : sectionColor) : '#2D2417' }">
      <span v-if="feedback && card.isArticle" :style="{ color: ARTICLE_META[card.answer]?.color }">
        {{ card.answer }}&nbsp;
      </span>
      {{ card.headline }}
    </div>

    <div class="text-cream-500 text-[0.88rem] font-bold">{{ card.subtext }}</div>

    <div v-if="feedback"
         class="animate-fade-up mt-3 text-[0.88rem] font-extrabold"
         :style="{ color: feedback.correct ? '#3A7D00' : '#CC0000' }">
      {{ feedbackMsg }}
    </div>

    <div v-if="feedback && !feedback.correct"
         class="animate-fade-up mt-2 px-4 py-2 bg-[#FFF8E8] border-2 border-[#FFD080] rounded-xl text-[#997700] text-[0.8rem] font-bold">
      Réponse : {{ card.answer }}
      <span v-if="card.answer === 'invariant'" class="text-[#BB9900]"> · pas de pluriel usuel</span>
      <span v-else-if="card.isArticle && ARTICLE_META[card.answer]" class="text-[#BB9900]">
        &nbsp;· {{ ARTICLE_META[card.answer].label }}
      </span>
    </div>
  </div>
</template>
