<script setup lang="ts">
import type { Section, ModuleStats } from '../../types'
import { pct } from '../../composables/useGame'

defineProps<{
  sec: Section
  modStats: ModuleStats
  weakCount: number
  masteredCount: number
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="bg-white rounded-[20px] shadow-[0_3px_0_#D4C9B8] p-[16px_18px] flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#C4B9A8] active:translate-y-0.5 active:shadow-[0_2px_0_#C4B9A8]"
    :style="{ border: `2.5px solid ${sec.color}22` }"
    @click="$emit('click')"
  >
    <div class="w-11 h-11 rounded-[14px] flex items-center justify-center text-[1.4rem] shrink-0"
         :style="{ background: sec.color + '18' }">
      {{ sec.emoji }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center mb-1">
        <span class="font-extrabold text-[#2D2417] text-[0.9rem]">{{ sec.label }}</span>
        <div class="flex items-center gap-1.5">
          <span v-if="weakCount > 0"
                class="text-[0.68rem] font-extrabold text-[#CC4400] bg-[#FFF0E8] border border-[#FFCCA0] rounded-lg px-1.5 py-0.5">
            ⚠️ {{ weakCount }}
          </span>
          <span class="text-[0.72rem] font-extrabold"
                :style="{ color: modStats.answered ? sec.color : '#C0B0A0' }">
            {{ modStats.answered ? `${pct(modStats.correct, modStats.answered)}%` : 'Nouveau' }}
          </span>
        </div>
      </div>
      <div class="text-cream-500 text-[0.72rem] font-bold mb-1.5">{{ sec.sub }}</div>
      <div class="h-1.5 bg-[#F0EAE0] rounded-full overflow-hidden">
        <div class="bar-fill h-full rounded-full"
             :style="{ width: `${pct(masteredCount, sec.data.length)}%`, background: sec.color }" />
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-[0.65rem] text-cream-400 font-bold">{{ masteredCount }} / {{ sec.data.length }} maîtrisés</span>
      </div>
    </div>
    <span class="text-cream-300 text-[1rem]">›</span>
  </button>
</template>
