<script setup lang="ts">
import { computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Section } from './types'
import BottomNav from './components/BottomNav.vue'
import { SECTIONS } from './data'
import { buildCard, getCardKey, isMastered } from './composables/useGame'
import { useStorage } from './composables/useStorage'
import { useGameSession } from './composables/useGameSession'

const router = useRouter()
const route = useRoute()

const { stats, wordStats, loaded, load, saveStats, saveWordStats, resetAll, syncPull, syncPush } = useStorage()
const session = useGameSession(stats, wordStats, saveStats, saveWordStats)

const totalAnswered = computed(() => Object.values(stats.value.modules).reduce((a, m) => a + m.answered, 0))
const totalCorrect = computed(() => Object.values(stats.value.modules).reduce((a, m) => a + m.correct, 0))

const weakCounts = computed<Record<string, number>>(() =>
  Object.fromEntries(
    SECTIONS.map((sec) => [
      sec.id,
      sec.data.filter((item) => {
        const c = buildCard(sec.id, item)
        const ws = wordStats.value[getCardKey(sec.id, c)]
        return ws && ws.wrong > 0 && ws.wrong / (ws.correct + ws.wrong) >= 0.5
      }).length,
    ])
  )
)

const masteredCounts = computed<Record<string, number>>(() =>
  Object.fromEntries(
    SECTIONS.map((sec) => [
      sec.id,
      sec.data.filter((item) => {
        const ws = wordStats.value[getCardKey(sec.id, buildCard(sec.id, item))]
        return isMastered(ws)
      }).length,
    ])
  )
)

function startGame(sec: Section): void {
  session.startGame(sec)
  router.push('/game')
}

provide('stats', stats)
provide('wordStats', wordStats)
provide('saveWordStats', saveWordStats)
provide('totalCorrect', totalCorrect)
provide('totalAnswered', totalAnswered)
provide('weakCounts', weakCounts)
provide('masteredCounts', masteredCounts)
provide('session', session)
provide('startGame', startGame)
provide('resetAll', resetAll)

function handleKeydown(e: KeyboardEvent): void {
  session.handleKeydown(e, route.name as string)
}

watch([session.done, session.gameOver], ([isDone, isGameOver]) => {
  if (isDone || isGameOver) syncPush()
})

onMounted(() => {
  load()
  syncPull()
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-cream-50 font-[Nunito,sans-serif]">

    <div v-if="!loaded" class="min-h-screen flex items-center justify-center text-cream-600 font-bold text-sm">
      Chargement…
    </div>

    <template v-else>
      <div :class="['max-w-115 mx-auto px-4', route.name !== 'game' ? 'pb-20' : 'pb-24']">
        <router-view />
      </div>

      <BottomNav v-if="route.name !== 'game'" />
    </template>
  </div>
</template>
