<script setup lang="ts">
defineProps<{
  score: number
  answered: number
  sessionXP: number
}>()

defineEmits<{ retry: []; goHome: [] }>()
</script>

<template>
  <div class="animate-card-in text-center">
    <div class="bg-white border-[2.5px] border-[#FFD0D0] rounded-[28px] shadow-[0_4px_0_#F0B0B0] p-[40px_28px]">
      <div class="text-[3rem] mb-3">💔</div>
      <div class="font-[Fredoka,sans-serif] text-[2rem] font-bold text-[#CC0000] mb-2">Plus de vies !</div>
      <div class="text-cream-600 text-[0.88rem] font-bold mb-1.5">
        {{ score }} bonne{{ score > 1 ? 's' : '' }} réponse{{ score > 1 ? 's' : '' }} sur {{ answered }}
      </div>
      <div v-if="sessionXP > 0" class="text-green-brand font-black text-[0.9rem] mb-2">+{{ sessionXP }} XP quand même 💪</div>
      <div class="text-cream-500 text-[0.8rem] font-semibold mb-6">5 bonnes réponses d'affilée = +1 vie ❤️</div>
      <button
        class="w-full text-white border-none rounded-[16px] px-10 py-[15px] font-extrabold text-[1rem] cursor-pointer mb-2.5 transition-[transform,filter]"
        style="background:#FF4444;border-bottom:4px solid #CC0000"
        @click="$emit('retry')"
      >🔁 Réessayer</button>
      <button
        class="w-full text-cream-600 border-2 border-cream-200 bg-transparent rounded-xl px-4 py-2 text-[0.78rem] font-bold cursor-pointer hover:text-[#2D2417] transition-colors"
        @click="$emit('goHome')"
      >← Accueil</button>
    </div>
  </div>
</template>
