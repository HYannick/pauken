import type { Card, SectionId, AnyWord, WordStatsMap } from '../types'
import { ARTICLE_META, VERB_TABLES } from '../data'

export const MASTERY_CORRECT = 5
const MASTERY_ACCURACY = 0.6

export function isMastered(ws: { correct: number; wrong: number } | undefined): boolean {
  if (!ws || ws.correct < MASTERY_CORRECT) return false
  return ws.correct / (ws.correct + ws.wrong) >= MASTERY_ACCURACY
}

export function buildActivePool(sectionId: SectionId, data: AnyWord[], wordStats: WordStatsMap, poolSize = 20): AnyWord[] {
  const unmastered = data.filter((item) => {
    const key = getCardKey(sectionId, buildCard(sectionId, item))
    return !isMastered(wordStats[key])
  })
  if (unmastered.length > 0) return unmastered.slice(0, poolSize)
  // All mastered: revision with the 20 lowest-correct words
  return [...data]
    .sort((a, b) => {
      const ka = getCardKey(sectionId, buildCard(sectionId, a))
      const kb = getCardKey(sectionId, buildCard(sectionId, b))
      return (wordStats[ka]?.correct ?? 0) - (wordStats[kb]?.correct ?? 0)
    })
    .slice(0, poolSize)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick2<T>(arr: T[]): T[] {
  return shuffle(arr).slice(0, 2)
}

export function buildCard(sectionId: SectionId, item: AnyWord): Omit<Card, 'errorRate' | 'seen'> {
  if (sectionId === 'articles') {
    const w = item as { word: string; translation: string; answer: string }
    return { headline: w.word, subtext: w.translation, context: 'Quel article ?', answer: w.answer, options: ['der', 'die', 'das'], isArticle: true }
  }
  if (sectionId === 'countries') {
    const w = item as { word: string; translation: string; answer: string }
    return { headline: w.word, subtext: w.translation, context: 'Ich komme aus ___', answer: w.answer, options: ['der', 'dem', 'den', 'aucun'], isArticle: false }
  }
  if (sectionId === 'verbs') {
    const w = item as { infinitive: string; pronoun: string; translation: string; answer: string }
    const table = VERB_TABLES.find(t => t.infinitive === w.infinitive)
    const distractors = table
      ? pick2(table.forms.filter(f => f.answer !== w.answer).map(f => f.answer))
      : []
    return { headline: w.infinitive, subtext: w.translation, context: `${w.pronoun} ___`, answer: w.answer, options: shuffle([w.answer, ...distractors]), isArticle: false }
  }
  if (sectionId === 'plurals') {
    const w = item as { singular: string; article: string; translation: string; answer: string; wrong: string[] }
    const isInvariant = w.answer === 'invariant'
    let opts: string[]
    if (isInvariant) {
      opts = shuffle([...pick2(w.wrong), 'invariant'])
    } else {
      // Pick 2 wrong options, occasionally replacing one with 'invariant' as a distractor
      const wrongs = Math.random() > 0.6
        ? shuffle([...pick2(w.wrong), 'invariant']).slice(0, 2)
        : pick2(w.wrong)
      opts = shuffle([w.answer, ...wrongs])
    }
    return { headline: `${w.article} ${w.singular}`, subtext: w.translation, context: 'Pluriel ?', answer: w.answer, options: opts, isArticle: false }
  }
  throw new Error(`Unknown sectionId: ${sectionId}`)
}

export function getCardKey(sectionId: SectionId, card: Omit<Card, 'errorRate' | 'seen'>): string {
  return sectionId === 'verbs'
    ? `${sectionId}:${card.headline}:${card.context}`
    : `${sectionId}:${card.headline}`
}

export function buildDeck(sectionId: SectionId, data: AnyWord[], wordStats: Record<string, { correct: number; wrong: number }> = {}): Card[] {
  const cards: Card[] = data.map((item) => {
    const card = buildCard(sectionId, item)
    const key = getCardKey(sectionId, card)
    const ws = wordStats[key] ?? { correct: 0, wrong: 0 }
    const total = ws.correct + ws.wrong
    const errorRate = total > 0 ? ws.wrong / total : 0
    return { ...card, errorRate, seen: total > 0 }
  })
  const hard   = shuffle(cards.filter((c) => c.errorRate >= 0.5 && c.seen))
  const medium = shuffle(cards.filter((c) => c.errorRate > 0 && c.errorRate < 0.5 && c.seen))
  const fresh  = shuffle(cards.filter((c) => !c.seen))
  const clean  = shuffle(cards.filter((c) => c.seen && c.errorRate === 0))
  return [...hard, ...medium, ...fresh, ...clean]
}

export function pct(correct: number, answered: number): number {
  if (!answered) return 0
  return Math.round((correct / answered) * 100)
}

export function getOptStyle(
  opt: string,
  isRevealed: boolean,
  answer: string,
  chosen: string | null,
  isArticle: boolean,
  sectionColor: string
): Record<string, string> {
  const meta = ARTICLE_META[opt]

  if (!isRevealed) {
    if (isArticle && meta) return { background: meta.light, color: meta.color, borderColor: meta.border, boxShadow: `0 4px 0 ${meta.shadow}` }
    return { background: '#F7F4EF', color: '#2D2417', borderColor: '#E0D8CC', boxShadow: '0 4px 0 #C8BFB0' }
  }

  const isAnswer = opt === answer
  const isChosen = opt === chosen

  if (isChosen && isAnswer)  return { background: '#D7F5B2', color: '#3A7D00', borderColor: '#58CC02', boxShadow: '0 4px 0 #45A800' }
  if (isChosen && !isAnswer) return { background: '#FFD4D4', color: '#CC0000', borderColor: '#FF4444', boxShadow: '0 4px 0 #CC0000' }
  if (!isChosen && isAnswer) return { background: '#D7F5B2', color: '#3A7D00', borderColor: '#58CC02', boxShadow: '0 4px 0 #45A800', opacity: '0.65' }
  return { background: '#F7F4EF', color: '#C0B8AC', borderColor: '#E8E0D5', boxShadow: 'none', opacity: '0.4' }
}
