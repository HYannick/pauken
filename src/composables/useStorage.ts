import { ref } from 'vue'
import type { AppStats, WordStatsMap, SectionId, ModuleStats } from '../types'
import { STORAGE_KEY, WORD_STATS_KEY, DEFAULT_STATS } from '../data'

const SYNC_URL = import.meta.env.VITE_SYNC_URL
const SYNC_TOKEN = import.meta.env.VITE_SYNC_TOKEN

function mergeStats(local: AppStats, remote: AppStats): AppStats {
  const ids = [...new Set([...Object.keys(local.modules), ...Object.keys(remote.modules)])] as SectionId[]
  const modules = {} as Record<SectionId, ModuleStats>
  for (const id of ids) {
    const l = local.modules[id] ?? { answered: 0, correct: 0, bestStreak: 0, sessions: 0 }
    const r = remote.modules[id] ?? { answered: 0, correct: 0, bestStreak: 0, sessions: 0 }
    modules[id] = {
      answered: Math.max(l.answered, r.answered),
      correct: Math.max(l.correct, r.correct),
      bestStreak: Math.max(l.bestStreak, r.bestStreak),
      sessions: Math.max(l.sessions, r.sessions),
    }
  }
  return {
    totalXP: Math.max(local.totalXP, remote.totalXP),
    sessionStreak: Math.max(local.sessionStreak, remote.sessionStreak),
    modules,
  }
}

function mergeWordStats(local: WordStatsMap, remote: WordStatsMap): WordStatsMap {
  const merged: WordStatsMap = { ...local }
  for (const key in remote) {
    const l = merged[key] ?? { correct: 0, wrong: 0 }
    merged[key] = {
      correct: Math.max(l.correct, remote[key].correct),
      wrong: Math.max(l.wrong, remote[key].wrong),
    }
  }
  return merged
}

export function useStorage() {
  const stats = ref<AppStats>(structuredClone(DEFAULT_STATS))
  const wordStats = ref<WordStatsMap>({})
  const loaded = ref(false)

  function load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stats.value = JSON.parse(raw)
    } catch (_) {}

    try {
      const raw = localStorage.getItem(WORD_STATS_KEY)
      if (raw) wordStats.value = JSON.parse(raw)
    } catch (_) {}

    loaded.value = true
  }

  function saveStats(newStats: AppStats): void {
    stats.value = newStats
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats)) } catch (_) {}
  }

  function saveWordStats(newWS: WordStatsMap): void {
    wordStats.value = newWS
    try { localStorage.setItem(WORD_STATS_KEY, JSON.stringify(newWS)) } catch (_) {}
  }

  function resetAll(): void {
    const fresh = structuredClone(DEFAULT_STATS)
    saveStats(fresh)
    saveWordStats({})
  }

  async function syncPull(): Promise<void> {
    if (!SYNC_URL || !SYNC_TOKEN) return
    try {
      const res = await fetch(`${SYNC_URL}/stats`, {
        headers: { Authorization: `Bearer ${SYNC_TOKEN}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.appStats) saveStats(mergeStats(stats.value, data.appStats))
      if (data.wordStats) saveWordStats(mergeWordStats(wordStats.value, data.wordStats))
    } catch (_) {}
  }

  async function syncPush(): Promise<void> {
    if (!SYNC_URL || !SYNC_TOKEN) return
    try {
      await fetch(`${SYNC_URL}/stats`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SYNC_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appStats: stats.value, wordStats: wordStats.value }),
      })
    } catch (_) {}
  }

  return { stats, wordStats, loaded, load, saveStats, saveWordStats, resetAll, syncPull, syncPush }
}
