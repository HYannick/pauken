<script setup lang="ts">
import { inject } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { AppStats } from '../types'
import { SECTIONS } from '../data'
import { pct } from '../composables/useGame'

const stats = inject<Ref<AppStats>>('stats')!
const totalCorrect = inject<ComputedRef<number>>('totalCorrect')!
const totalAnswered = inject<ComputedRef<number>>('totalAnswered')!
const resetAll = inject<() => void>('resetAll')!

const SUMMARY_TILES = (s: AppStats, answered: number, correct: number) => [
  { label: 'XP total',  value: s.totalXP + ' XP',            color: '#58CC02', emoji: '⭐' },
  { label: 'Sessions',  value: s.sessionStreak,               color: '#FF9800', emoji: '🔥' },
  { label: 'Réponses',  value: answered,                      color: '#4A90E2', emoji: '📝' },
  { label: 'Précision', value: pct(correct, answered) + '%',  color: '#E8407A', emoji: '🎯' },
]
</script>

<template>
  <div class="animate-screen-in">
    <div class="pt-7 pb-5">
      <div class="font-[Fredoka,sans-serif] text-[1.7rem] font-semibold text-[#2D2417] mb-1">Mes stats 📊</div>
      <div class="text-cream-600 text-[0.85rem] font-bold">Toutes tes sessions combinées.</div>
    </div>

    <div class="grid grid-cols-2 gap-2.5 mb-5">
      <div
        v-for="s in SUMMARY_TILES(stats, totalAnswered, totalCorrect)"
        :key="s.label"
        class="bg-white border-[2.5px] border-cream-200 rounded-[18px] shadow-[0_3px_0_#D4C9B8] p-[16px_18px] text-center"
      >
        <div class="text-[1.5rem] mb-1">{{ s.emoji }}</div>
        <div class="font-[Fredoka,sans-serif] text-[1.6rem] font-semibold" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="text-[0.72rem] text-cream-500 font-bold">{{ s.label }}</div>
      </div>
    </div>

    <div class="text-[0.75rem] font-extrabold text-cream-600 uppercase tracking-widest mb-3">Par module</div>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="sec in SECTIONS"
        :key="sec.id"
        class="bg-white rounded-[18px] shadow-[0_3px_0_#D4C9B8] p-[16px_18px]"
        :style="{ border: `2.5px solid ${sec.color}22` }"
      >
        <div class="flex justify-between items-center mb-2.5">
          <div class="flex items-center gap-2.5">
            <span class="text-[1.2rem]">{{ sec.emoji }}</span>
            <div>
              <div class="font-extrabold text-[#2D2417] text-[0.88rem]">{{ sec.label }}</div>
              <div class="text-cream-500 text-[0.7rem] font-bold">
                {{ stats.modules[sec.id].sessions }} session{{ stats.modules[sec.id].sessions !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
          <div class="font-black text-[1rem]" :style="{ color: sec.color }">
            {{ stats.modules[sec.id].answered ? `${pct(stats.modules[sec.id].correct, stats.modules[sec.id].answered)}%` : '—' }}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1.5 mb-2.5">
          <div
            v-for="s in [
              { label: 'Réponses', val: stats.modules[sec.id].answered },
              { label: 'Correctes', val: stats.modules[sec.id].correct },
              { label: 'Série max', val: stats.modules[sec.id].bestStreak },
            ]"
            :key="s.label"
            class="bg-cream-50 rounded-[10px] p-[8px_6px] text-center"
          >
            <div class="font-extrabold text-[#2D2417] text-[0.95rem]">{{ s.val }}</div>
            <div class="text-[0.6rem] text-cream-500 font-bold">{{ s.label }}</div>
          </div>
        </div>

        <div class="h-[7px] bg-[#F0EAE0] rounded-full overflow-hidden">
          <div class="bar-fill h-full rounded-full"
               :style="{ width: `${pct(stats.modules[sec.id].correct, stats.modules[sec.id].answered)}%`, background: sec.color }" />
        </div>
      </div>
    </div>

    <div class="mt-5 text-center">
      <button
        class="text-[0.72rem] text-[#CC6666] border border-[#FFD0D0] bg-transparent rounded-xl px-4 py-2 font-bold cursor-pointer hover:border-[#CC6666] transition-colors"
        @click="resetAll()"
      >
        Réinitialiser les stats
      </button>
    </div>
  </div>
</template>
