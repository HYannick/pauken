<script setup lang="ts">
import { inject, watchEffect } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Section, Card, Phase, Feedback } from '../types'
import { MAX_HEARTS } from '../data'
import GameHeader from '../components/game/GameHeader.vue'
import HeartsBar from '../components/game/HeartsBar.vue'
import QuestionCard from '../components/game/QuestionCard.vue'
import OptionsGrid from '../components/game/OptionsGrid.vue'
import GameOverScreen from '../components/game/GameOverScreen.vue'
import ResultScreen from '../components/game/ResultScreen.vue'
import VerbSession from '../components/game/VerbSession.vue'

interface GameSession {
  activeSection: Ref<Section | null>
  deck: Ref<Card[]>
  index: Ref<number>
  score: Ref<number>
  phase: Ref<Phase>
  feedback: Ref<Feedback | null>
  done: Ref<boolean>
  gameOver: Ref<boolean>
  streak: Ref<number>
  bestStreak: Ref<number>
  hearts: Ref<number>
  shake: Ref<boolean>
  bounce: Ref<boolean>
  feedbackMsg: Ref<string>
  sessionXP: Ref<number>
  card: ComputedRef<Card | undefined>
  cardKey: ComputedRef<string>
  isGrid2x2: ComputedRef<boolean>
  sessionPct: ComputedRef<number>
  resetGame: () => void
  handleAnswer: (chosen: string) => void
  handleNext: () => void
}

const router = useRouter()
const session = inject<GameSession>('session')!
const {
  activeSection, deck, index, score, phase, feedback, done, gameOver,
  streak, bestStreak, hearts, shake, bounce, feedbackMsg, sessionXP,
  card, cardKey, isGrid2x2, sessionPct,
  resetGame, handleAnswer, handleNext,
} = session

watchEffect(() => {
  if (!activeSection.value) router.replace('/')
})
</script>

<template>
  <div v-if="activeSection">

    <!-- Verb conjugation table mode -->
    <VerbSession v-if="activeSection.id === 'verbs'" />

    <template v-else>
    <GameHeader
      :index="index"
      :deck-length="deck.length"
      :color="activeSection.color"
      @back="router.push('/')"
    />

    <!-- Playing -->
    <template v-if="!done && !gameOver && card">
      <HeartsBar :hearts="hearts" :max-hearts="MAX_HEARTS" :score="score" :streak="streak" />

      <Transition name="card-transition" mode="out-in">
        <div :key="cardKey">
          <QuestionCard
            :card="card"
            :feedback="feedback"
            :feedback-msg="feedbackMsg"
            :shake="shake"
            :bounce="bounce"
            :section-color="activeSection.color"
          />

          <OptionsGrid
            :card="card"
            :phase="phase"
            :feedback="feedback"
            :section-color="activeSection.color"
            @answer="handleAnswer($event)"
          />
        </div>
      </Transition>

      <div class="text-center text-[#D0C8BC] text-[0.7rem] font-bold">
        Touches 1 · 2 · 3{{ isGrid2x2 ? ' · 4' : '' }}
      </div>

      <div class="text-center mt-[18px]">
        <button
          class="text-cream-600 border-2 border-cream-200 bg-transparent rounded-xl px-3.5 py-1.5 text-[0.78rem] font-bold cursor-pointer hover:text-[#2D2417] hover:border-cream-600 transition-colors"
          @click="resetGame()"
        >↺ Recommencer</button>
      </div>

      <!-- FAB: continue button, fixed at bottom of viewport -->
      <div
        v-if="phase === 'reveal'"
        class="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 animate-fade-up z-50 pointer-events-none"
      >
        <button
          class="pointer-events-auto bg-green-brand text-white border-none border-b-4 border-b-green-brand-dark cursor-pointer font-[Nunito,sans-serif] font-extrabold text-[1rem] rounded-[16px] px-12 py-[15px] shadow-xl transition-[transform,filter] duration-[100ms] hover:brightness-105 active:translate-y-[3px]"
          @click="handleNext()"
        >
          {{ index + 1 >= deck.length ? 'Voir mes résultats →' : 'Continuer →' }}
        </button>
        <div class="text-[#C8C0B4] text-[0.7rem] font-bold">Espace ou Entrée</div>
      </div>
    </template>

    <!-- Game Over -->
    <GameOverScreen
      v-else-if="gameOver"
      :score="score"
      :answered="index + 1"
      :session-x-p="sessionXP"
      @retry="resetGame()"
      @go-home="router.push('/')"
    />

    <!-- Done -->
    <ResultScreen
      v-else-if="done"
      :score="score"
      :deck-length="deck.length"
      :session-pct="sessionPct"
      :session-x-p="sessionXP"
      :best-streak="bestStreak"
      @replay="resetGame()"
      @go-home="router.push('/')"
    />

    </template>
  </div>
</template>
