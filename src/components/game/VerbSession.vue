<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import type { WordStatsMap } from '../../types'
import { VERB_TABLES } from '../../data'

const router = useRouter()
const wordStats = inject<Ref<WordStatsMap>>('wordStats')!
const saveWordStats = inject<(ws: WordStatsMap) => void>('saveWordStats')!

const verbIndex = ref(0)
const inputs = ref<string[]>([])
const checked = ref(false)
const revealed = ref(false)
const sessionCorrect = ref(0)
const sessionTotal = ref(0)
const done = ref(false)

const verb = computed(() => VERB_TABLES[verbIndex.value])

watch(verbIndex, () => {
  inputs.value = verb.value.forms.map(() => '')
  checked.value = false
  revealed.value = false
}, { immediate: true })

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function formKey(infinitive: string, pronoun: string) {
  return `verbs:${infinitive}:${pronoun} ___`
}

const cellResults = computed<boolean[]>(() => {
  if (!checked.value && !revealed.value) return []
  return verb.value.forms.map((f, i) =>
    normalize(inputs.value[i]) === normalize(f.answer)
  )
})

function verify() {
  if (checked.value || revealed.value) return
  checked.value = true
  const updated = { ...wordStats.value }
  verb.value.forms.forEach((f, i) => {
    const correct = normalize(inputs.value[i]) === normalize(f.answer)
    const key = formKey(verb.value.infinitive, f.pronoun)
    const prev = updated[key] ?? { correct: 0, wrong: 0 }
    updated[key] = { correct: prev.correct + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1) }
    if (correct) sessionCorrect.value++
    sessionTotal.value++
  })
  saveWordStats(updated)
}

function revealAnswers() {
  if (checked.value) return
  revealed.value = true
  inputs.value = verb.value.forms.map((f) => f.answer)
}

function reset() {
  inputs.value = verb.value.forms.map(() => '')
  checked.value = false
  revealed.value = false
}

function next() {
  if (verbIndex.value + 1 >= VERB_TABLES.length) {
    done.value = true
  } else {
    verbIndex.value++
  }
}

function restart() {
  verbIndex.value = 0
  sessionCorrect.value = 0
  sessionTotal.value = 0
  done.value = false
}
</script>

<template>
  <!-- Done screen -->
  <div v-if="done" class="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-screen-in">
    <div class="text-[3rem]">🎉</div>
    <div class="text-center">
      <div class="font-[Fredoka,sans-serif] text-[1.6rem] font-semibold text-text">Session terminée !</div>
      <div class="text-cream-500 text-[0.85rem] font-bold mt-1">{{ sessionCorrect }} / {{ sessionTotal }} formes correctes</div>
    </div>
    <div class="flex flex-col gap-2.5 w-full max-w-[280px]">
      <button
        class="bg-green-brand text-white font-extrabold text-[1rem] rounded-[16px] px-10 py-[15px] border-none border-b-4 border-b-green-brand-dark cursor-pointer hover:brightness-105 active:translate-y-[2px]"
        @click="restart"
      >Recommencer</button>
      <button
        class="text-cream-600 border-2 border-cream-200 bg-transparent rounded-xl px-4 py-3 text-[0.85rem] font-bold cursor-pointer hover:text-text hover:border-cream-600 transition-colors"
        @click="router.push('/')"
      >Retour à l'accueil</button>
    </div>
  </div>

  <!-- Table exercise -->
  <div v-else class="animate-screen-in">

    <!-- Header -->
    <div class="flex items-center justify-between pt-6 pb-5">
      <button
        class="w-9 h-9 rounded-[12px] bg-white border-2 border-cream-200 flex items-center justify-center text-cream-600 hover:text-text transition-colors cursor-pointer shrink-0"
        @click="router.push('/')"
      >‹</button>
      <div class="text-center">
        <span class="font-[Fredoka,sans-serif] text-[1.4rem] font-semibold text-text">{{ verb.infinitive }}</span>
        <span class="text-cream-500 text-[0.9rem] font-bold ml-2">{{ verb.translation }}</span>
      </div>
      <span class="text-cream-400 text-[0.78rem] font-bold">{{ verbIndex + 1 }}/{{ VERB_TABLES.length }}</span>
    </div>

    <!-- 2-column grid -->
    <div class="grid grid-cols-2 gap-2.5 mb-6">
      <div
        v-for="(form, i) in verb.forms"
        :key="form.pronoun"
        class="rounded-[14px] p-3 flex items-center gap-2 transition-colors duration-150"
        :style="{
          border: `2px solid ${
            !checked && !revealed ? '#E8E0D5' :
            cellResults[i] ? '#58CC02' : '#FF4444'
          }`,
          background: !checked && !revealed ? '#fff' :
            cellResults[i] ? '#E8FAD0' : '#FFE8E8',
        }"
      >
        <label :for="form.pronoun" class="text-[0.7rem] text-cream-500 font-bold shrink-0 w-[52px] leading-tight">{{ form.pronoun }}</label>
        <div class="flex-1 flex items-center gap-1.5 min-w-0">
          <span
            v-if="checked && !cellResults[i]"
            class="text-[0.88rem] font-bold text-[#FF4444] line-through truncate"
          >{{ inputs[i] }}</span>
          <input
            v-else
            :id="form.pronoun"
            v-model="inputs[i]"
            :disabled="checked || revealed"
            class="flex-1 min-w-0 text-[0.9rem] font-bold border-none outline-none bg-transparent text-text disabled:text-text"
            :class="{ 'text-green-brand': checked && cellResults[i] }"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <span
            v-if="checked && !cellResults[i]"
            class="text-[0.88rem] font-bold text-[#CC0000] shrink-0"
          >{{ form.answer }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex gap-2 flex-wrap">
        <button
          class="text-[0.75rem] font-extrabold px-3.5 py-2 rounded-xl border-2 cursor-pointer transition-colors"
          :class="checked || revealed
            ? 'text-cream-300 border-cream-100 bg-transparent cursor-default'
            : 'text-text border-cream-200 bg-white hover:border-cream-400'"
          :disabled="checked || revealed"
          @click="verify"
        >Vérifier</button>
        <button
          class="text-[0.75rem] font-bold px-3.5 py-2 rounded-xl border-2 border-cream-200 bg-transparent text-cream-500 hover:text-text hover:border-cream-400 cursor-pointer transition-colors"
          @click="reset"
        >Recommencer</button>
        <button
          class="text-[0.75rem] font-bold px-3.5 py-2 rounded-xl border-2 cursor-pointer transition-colors"
          :class="checked || revealed
            ? 'text-cream-300 border-cream-100 bg-transparent cursor-default'
            : 'border-cream-200 bg-transparent text-cream-500 hover:text-text hover:border-cream-400'"
          :disabled="checked || revealed"
          @click="revealAnswers"
        >Voir les réponses</button>
      </div>
      <span class="text-cream-400 text-[0.78rem] font-bold shrink-0">
        {{ sessionCorrect }} / {{ sessionTotal }}
      </span>
    </div>

    <!-- FAB: next verb -->
    <div
      v-if="checked || revealed"
      class="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 animate-fade-up z-50 pointer-events-none"
    >
      <button
        class="pointer-events-auto bg-green-brand text-white border-none border-b-4 border-b-green-brand-dark cursor-pointer font-[Nunito,sans-serif] font-extrabold text-[1rem] rounded-[16px] px-12 py-[15px] shadow-xl transition-[transform,filter] duration-[100ms] hover:brightness-105 active:translate-y-[3px]"
        @click="next"
      >
        {{ verbIndex + 1 < VERB_TABLES.length ? 'Suivant →' : 'Terminer →' }}
      </button>
    </div>

  </div>
</template>
