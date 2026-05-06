<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { WordStatsMap } from '../types'
import { SECTIONS, VERB_TABLES } from '../data'
import { buildCard, getCardKey, isMastered, MASTERY_CORRECT } from '../composables/useGame'

const route = useRoute()
const router = useRouter()
const wordStats = inject<Ref<WordStatsMap>>('wordStats')!

type Tab = 'learning' | 'fresh' | 'mastered'
const activeTab = ref<Tab>('learning')

const section = computed(() => SECTIONS.find((s) => s.id === route.params.sectionId))

watch(() => route.params.sectionId, () => { activeTab.value = 'learning' })

interface WordEntry {
  headline: string
  subtext: string
  correct: number
}

const totalCount = computed(() =>
  section.value?.id === 'verbs' ? VERB_TABLES.length : (section.value?.data.length ?? 0)
)

const groups = computed(() => {
  const sec = section.value
  if (!sec) return { mastered: [] as WordEntry[], learning: [] as WordEntry[], fresh: [] as WordEntry[] }

  const mastered: WordEntry[] = []
  const learning: WordEntry[] = []
  const fresh: WordEntry[] = []

  if (sec.id === 'verbs') {
    for (const verb of VERB_TABLES) {
      const formStats = verb.forms.map((f) =>
        wordStats.value[`verbs:${verb.infinitive}:${f.pronoun} ___`]
      )
      const allMastered = formStats.every((ws) => isMastered(ws))
      const anySeen = formStats.some((ws) => ws && (ws.correct + ws.wrong) > 0)
      const minCorrect = Math.min(...formStats.map((ws) => ws?.correct ?? 0))
      const entry: WordEntry = { headline: verb.infinitive, subtext: verb.translation, correct: minCorrect }

      if (allMastered) mastered.push(entry)
      else if (anySeen) learning.push(entry)
      else fresh.push(entry)
    }
  } else {
    for (const item of sec.data) {
      const card = buildCard(sec.id, item)
      const ws = wordStats.value[getCardKey(sec.id, card)]
      const correct = ws?.correct ?? 0
      const total = correct + (ws?.wrong ?? 0)
      const entry: WordEntry = { headline: card.headline, subtext: card.subtext, correct }

      if (isMastered(ws)) mastered.push(entry)
      else if (total > 0) learning.push(entry)
      else fresh.push(entry)
    }
    learning.sort((a, b) => b.correct - a.correct)
  }

  return { mastered, learning, fresh }
})

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: 'learning', label: 'En cours',    color: '#CC8800' },
  { key: 'fresh',    label: 'À apprendre', color: '#9E8F7E' },
  { key: 'mastered', label: 'Maîtrisés',   color: '#58CC02' },
]
</script>

<template>
  <div v-if="section" class="animate-screen-in">

    <!-- Header -->
    <div class="flex items-center gap-3 pt-6 pb-4">
      <button
        class="w-9 h-9 rounded-[12px] bg-white border-2 border-cream-200 flex items-center justify-center text-cream-600 hover:text-text transition-colors cursor-pointer shrink-0"
        @click="router.push('/')"
      >‹</button>
      <div class="flex items-center gap-2">
        <span class="text-[1.4rem]">{{ section.emoji }}</span>
        <div>
          <div class="font-[Fredoka,sans-serif] text-[1.3rem] font-semibold text-text leading-tight">{{ section.label }}</div>
          <div class="text-cream-500 text-[0.72rem] font-bold">
            {{ totalCount }} {{ section.id === 'verbs' ? 'verbes' : 'mots' }} au total
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b-2 border-cream-200 mb-4">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="flex-1 flex flex-col items-center gap-0.5 pb-2.5 pt-1 font-extrabold text-[0.78rem] transition-colors cursor-pointer border-none bg-transparent"
        :style="{
          color: activeTab === tab.key ? tab.color : '#C0B0A0',
          borderBottom: `3px solid ${activeTab === tab.key ? tab.color : 'transparent'}`,
          marginBottom: '-2px',
        }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span
          class="text-[0.65rem] font-bold rounded-full px-1.5"
          :style="{
            background: activeTab === tab.key ? tab.color + '20' : '#F0EAE0',
            color: activeTab === tab.key ? tab.color : '#B0A090',
          }"
        >{{ groups[tab.key].length }}</span>
      </button>
    </div>

    <!-- Word list -->
    <div class="flex flex-col gap-1.5">

      <div v-if="groups[activeTab].length === 0" class="text-center text-cream-400 font-bold text-[0.85rem] py-10">
        {{ activeTab === 'mastered' ? 'Aucun élément maîtrisé pour l\'instant.' :
           activeTab === 'learning' ? 'Aucun élément en cours — commence une session !' :
           'Tout a été vu.' }}
      </div>

      <div
        v-for="w in groups[activeTab]"
        :key="w.headline"
        class="bg-white rounded-[14px] px-3.5 py-2.5 flex items-center justify-between gap-3"
        :style="{
          border: `2px solid ${
            activeTab === 'mastered' ? '#C0EE90' :
            activeTab === 'learning' ? '#FFE8A0' :
            '#E8E0D5'
          }`
        }"
      >
        <div class="min-w-0">
          <div class="font-extrabold text-text text-[0.9rem] truncate">{{ w.headline }}</div>
          <div class="text-cream-500 text-[0.72rem] font-bold truncate">{{ w.subtext }}</div>
        </div>
        <div class="flex gap-[4px] shrink-0">
          <span
            v-for="i in MASTERY_CORRECT"
            :key="i"
            class="w-2 h-2 rounded-full"
            :style="{ background: i <= w.correct ? section.color : '#E8E0D5' }"
          />
        </div>
      </div>

    </div>
  </div>
</template>
