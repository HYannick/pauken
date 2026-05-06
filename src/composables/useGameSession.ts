import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Section, Card, Phase, Feedback, AppStats, WordStatsMap } from '../types'
import { MAX_HEARTS, XP_CORRECT, XP_BONUS_COMPLETE, ARTICLE_META, MSGS_OK, MSGS_FAIL } from '../data'
import { buildDeck, buildActivePool, getCardKey } from './useGame'

export function useGameSession(
  stats: Ref<AppStats>,
  wordStats: Ref<WordStatsMap>,
  saveStats: (s: AppStats) => void,
  saveWordStats: (ws: WordStatsMap) => void,
) {
  const activeSection = ref<Section | null>(null)

  const deck = ref<Card[]>([])
  const index = ref(0)
  const score = ref(0)
  const phase = ref<Phase>('question')
  const feedback = ref<Feedback | null>(null)
  const done = ref(false)
  const gameOver = ref(false)
  const streak = ref(0)
  const bestStreak = ref(0)
  const hearts = ref(MAX_HEARTS)
  const shake = ref(false)
  const bounce = ref(false)
  const feedbackMsg = ref('')
  const sessionXP = ref(0)

  const card = computed<Card | undefined>(() => deck.value[index.value])
  const cardKey = computed(() => `${activeSection.value?.id}-${index.value}`)
  const isGrid2x2 = computed(() => (card.value?.options?.length ?? 0) === 4)
  const sessionPct = computed(() => Math.round((score.value / (deck.value.length || 1)) * 100))

  function resetSessionState(): void {
    index.value = 0
    score.value = 0
    phase.value = 'question'
    feedback.value = null
    done.value = false
    gameOver.value = false
    streak.value = 0
    bestStreak.value = 0
    hearts.value = MAX_HEARTS
    bounce.value = false
    shake.value = false
    sessionXP.value = 0
  }

  function startGame(sec: Section): void {
    activeSection.value = sec
    deck.value = buildDeck(sec.id, buildActivePool(sec.id, sec.data, wordStats.value), wordStats.value)
    resetSessionState()
  }

  function resetGame(): void {
    if (!activeSection.value) return
    const sec = activeSection.value
    deck.value = buildDeck(sec.id, buildActivePool(sec.id, sec.data, wordStats.value), wordStats.value)
    resetSessionState()
  }

  function finishGame(finalScore: number, finalBestStreak: number, completed: boolean): void {
    if (!activeSection.value) return
    const xpEarned = finalScore * XP_CORRECT + (completed ? XP_BONUS_COMPLETE : 0)
    sessionXP.value = xpEarned
    const sid = activeSection.value.id
    const prev = stats.value.modules[sid]
    saveStats({
      totalXP: stats.value.totalXP + xpEarned,
      sessionStreak: stats.value.sessionStreak + (finalScore > 0 ? 1 : 0),
      modules: {
        ...stats.value.modules,
        [sid]: {
          answered: prev.answered + (completed ? activeSection.value.data.length : index.value + 1),
          correct: prev.correct + finalScore,
          bestStreak: Math.max(prev.bestStreak, finalBestStreak),
          sessions: prev.sessions + 1,
        },
      },
    } as AppStats)
  }

  function handleAnswer(chosen: string): void {
    if (phase.value !== 'question' || !card.value || !activeSection.value) return
    const c = card.value
    const correct = chosen === c.answer

    feedback.value = { chosen, correct }
    phase.value = 'reveal'

    const wordKey = getCardKey(activeSection.value.id, c)
    const prev = wordStats.value[wordKey] ?? { correct: 0, wrong: 0 }
    saveWordStats({
      ...wordStats.value,
      [wordKey]: { correct: prev.correct + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1) },
    })

    if (correct) {
      score.value++
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
      bounce.value = true
      setTimeout(() => (bounce.value = false), 500)

      if (streak.value > 0 && streak.value % 5 === 0) {
        hearts.value = Math.min(MAX_HEARTS, hearts.value + 1)
        feedbackMsg.value = `🔥 ×${streak.value} — Vie récupérée ! ❤️`
      } else {
        feedbackMsg.value = MSGS_OK[Math.floor(Math.random() * MSGS_OK.length)]
      }
    } else {
      streak.value = 0
      shake.value = true
      setTimeout(() => (shake.value = false), 450)
      feedbackMsg.value = MSGS_FAIL[Math.floor(Math.random() * MSGS_FAIL.length)]
      hearts.value = Math.max(0, hearts.value - 1)
      if (hearts.value === 0) {
        setTimeout(() => {
          finishGame(score.value, bestStreak.value, false)
          gameOver.value = true
        }, 900)
      }
    }
  }

  function handleNext(): void {
    bounce.value = false
    shake.value = false
    if (index.value + 1 >= deck.value.length) {
      finishGame(score.value, bestStreak.value, true)
      done.value = true
      return
    }
    index.value++
    feedback.value = null
    phase.value = 'question'
  }

  function handleKeydown(e: KeyboardEvent, currentView: string): void {
    if (currentView !== 'game') return
    const opts = card.value?.options ?? []
    if (phase.value === 'question') {
      if (e.key === '1' && opts[0]) handleAnswer(opts[0])
      else if (e.key === '2' && opts[1]) handleAnswer(opts[1])
      else if (e.key === '3' && opts[2]) handleAnswer(opts[2])
      else if (e.key === '4' && opts[3]) handleAnswer(opts[3])
    } else if (phase.value === 'reveal') {
      if (e.key === ' ' || e.key === 'Enter') handleNext()
    }
  }

  return {
    activeSection,
    deck,
    index,
    score,
    phase,
    feedback,
    done,
    gameOver,
    streak,
    bestStreak,
    hearts,
    shake,
    bounce,
    feedbackMsg,
    sessionXP,
    card,
    cardKey,
    isGrid2x2,
    sessionPct,
    startGame,
    resetGame,
    handleAnswer,
    handleNext,
    handleKeydown,
  }
}
