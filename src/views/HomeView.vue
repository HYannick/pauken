<script setup lang="ts">
import { inject } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Section, AppStats } from '../types'
import { SECTIONS } from '../data'
import { pct } from '../composables/useGame'
import ModuleCard from '../components/home/ModuleCard.vue'

const router = useRouter()

const stats = inject<Ref<AppStats>>('stats')!
const totalCorrect = inject<ComputedRef<number>>('totalCorrect')!
const totalAnswered = inject<ComputedRef<number>>('totalAnswered')!
const weakCounts = inject<ComputedRef<Record<string, number>>>('weakCounts')!
const masteredCounts = inject<ComputedRef<Record<string, number>>>('masteredCounts')!
const startGame = inject<(sec: Section) => void>('startGame')!
</script>

<template>
  <div class="animate-screen-in">
    <div class="flex justify-between items-center pt-7 pb-5">
      <div>
        <div class="font-[Fredoka,sans-serif] text-[1.7rem] font-semibold text-text">Hallo ! 👋</div>
        <div class="text-cream-600 text-[0.85rem] font-bold mt-0.5">Continue ton apprentissage.</div>
      </div>
      <div class="text-right">
        <div class="font-black text-[1.1rem] text-[#FF9800]">🔥 {{ stats.sessionStreak }}</div>
        <div class="text-[0.7rem] text-cream-500 font-bold">sessions</div>
      </div>
    </div>

    <div class="bg-white border-[2.5px] border-cream-200 rounded-[20px] shadow-[0_3px_0_#D4C9B8] p-[18px_20px] mb-5">
      <div class="flex justify-between items-center mb-3">
        <span class="font-extrabold text-text text-[0.9rem]">Progression globale</span>
        <span class="font-black text-green-brand text-[1rem]">⭐ {{ stats.totalXP }} XP</span>
      </div>
      <div class="h-2.5 bg-[#F0EAE0] rounded-full overflow-hidden">
        <div class="bar-fill h-full bg-linear-to-r from-green-brand to-[#4AA800] rounded-full"
             :style="{ width: pct(totalCorrect, totalAnswered) + '%' }" />
      </div>
      <div class="flex justify-between mt-1.5">
        <span class="text-[0.72rem] text-cream-500 font-bold">{{ totalAnswered }} réponses</span>
        <span class="text-[0.72rem] text-green-brand font-extrabold">{{ pct(totalCorrect, totalAnswered) }}% correct</span>
      </div>
    </div>

    <div class="text-[0.75rem] font-extrabold text-cream-600 uppercase tracking-widest mb-3">Modules</div>

    <div class="flex flex-col gap-4 mb-6">
      <div v-for="sec in SECTIONS" :key="sec.id" class="flex flex-col">
        <ModuleCard
          :sec="sec"
          :mod-stats="stats.modules[sec.id]"
          :weak-count="weakCounts[sec.id]"
          :mastered-count="masteredCounts[sec.id]"
          @click="startGame(sec)"
        />
        <div class="text-right pr-1 mt-1">
          <button
            class="text-[0.68rem] text-cream-400 font-bold hover:text-cream-600 transition-colors"
            @click="router.push('/vocab/' + sec.id)"
          >Voir les mots →</button>
        </div>
      </div>
    </div>
  </div>
</template>
