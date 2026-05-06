<script setup lang="ts">
const props = defineProps<{
  score: number
  deckLength: number
  sessionPct: number
  sessionXP: number
  bestStreak: number
}>()

defineEmits<{ replay: []; goHome: [] }>()

const trophy = props.sessionPct >= 80 ? '🏆' : props.sessionPct >= 60 ? '💪' : '📚'
const pctColor = props.sessionPct >= 80 ? '#3A7D00' : props.sessionPct >= 60 ? '#CC7700' : '#CC0000'
const message = props.sessionPct >= 80
  ? 'Excellent ! Continue comme ça 🎉'
  : props.sessionPct >= 60
    ? 'Pas mal ! Encore un peu de pratique.'
    : 'Courage, ça viendra !'
</script>

<template>
  <div class="animate-card-in text-center">
    <div class="bg-white border-[2.5px] border-cream-200 rounded-[28px] shadow-[0_4px_0_#D4C9B8] p-[40px_28px]">
      <div class="text-[3rem] mb-3">{{ trophy }}</div>
      <div class="font-[Fredoka,sans-serif] text-[3rem] font-bold text-[#2D2417] mb-1">{{ score }}/{{ deckLength }}</div>
      <div class="font-extrabold text-[1.1rem] mb-1.5" :style="{ color: pctColor }">{{ sessionPct }}%</div>
      <div v-if="sessionXP > 0" class="text-green-brand font-black text-[1rem] mb-1">+{{ sessionXP }} XP ⭐</div>
      <div v-if="bestStreak >= 3" class="text-[#FF9800] font-extrabold text-[0.88rem] mb-2">🔥 Meilleure série : {{ bestStreak }}</div>
      <div class="text-cream-500 text-[0.82rem] font-semibold mb-6">{{ message }}</div>
      <button
        class="w-full bg-green-brand text-white border-none border-b-4 border-b-green-brand-dark rounded-[16px] px-10 py-[15px] font-extrabold text-[1rem] cursor-pointer mb-2.5 hover:brightness-105 transition-[filter]"
        @click="$emit('replay')"
      >🔁 Rejouer</button>
      <button
        class="w-full text-cream-600 border-2 border-cream-200 bg-transparent rounded-xl px-4 py-2 text-[0.78rem] font-bold cursor-pointer hover:text-[#2D2417] transition-colors"
        @click="$emit('goHome')"
      >← Accueil</button>
    </div>
  </div>
</template>
