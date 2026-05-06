import { ref } from 'vue'
import type { AppStats, WordStatsMap } from '../types'
import { STORAGE_KEY, WORD_STATS_KEY, DEFAULT_STATS } from '../data'

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

  return { stats, wordStats, loaded, load, saveStats, saveWordStats, resetAll }
}
