export type SectionId = 'articles' | 'countries' | 'verbs' | 'plurals'
export type View = 'home' | 'game' | 'stats'
export type Phase = 'question' | 'reveal'

export interface ArticleWord {
  word: string
  translation: string
  answer: string
}

export interface CountryWord {
  word: string
  translation: string
  answer: string
}

export interface VerbWord {
  infinitive: string
  pronoun: string
  translation: string
  answer: string
}

export interface PluralWord {
  singular: string
  article: string
  translation: string
  answer: string
  wrong: string[]
}

export type AnyWord = ArticleWord | CountryWord | VerbWord | PluralWord

export interface Section {
  id: SectionId
  label: string
  sub: string
  emoji: string
  color: string
  data: AnyWord[]
}

export interface Card {
  headline: string
  subtext: string
  context: string
  answer: string
  options: string[]
  isArticle: boolean
  errorRate: number
  seen: boolean
}

export interface ArticleMetaItem {
  color: string
  light: string
  border: string
  shadow: string
  label: string
}

export interface ModuleStats {
  answered: number
  correct: number
  bestStreak: number
  sessions: number
}

export interface AppStats {
  totalXP: number
  sessionStreak: number
  modules: Record<SectionId, ModuleStats>
}

export interface WordStat {
  correct: number
  wrong: number
}

export type WordStatsMap = Record<string, WordStat>

export interface Feedback {
  chosen: string
  correct: boolean
}

export interface VerbForm {
  pronoun: string
  answer: string
}

export interface VerbTable {
  infinitive: string
  translation: string
  forms: VerbForm[]
}
