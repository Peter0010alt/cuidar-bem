<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const user = ref<{ email?: string } | null>(null)

const userName = computed(() => {
  if (!user.value?.email) return 'Usuário'
  return user.value.email.split('@')[0]
})

const loadSession = async () => {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    router.replace({ name: 'login' })
    return
  }
  user.value = data.session.user
}

onMounted(loadSession)

const goToRegister = () => router.push({ name: 'forms-page' })
const goToFindCaregiver = () => router.push({ name: 'found-caregiver' })
</script>

<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
    <!-- Floating TopNavBar (simplified) -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-fit pointer-events-none">
      <div class="floating-pill-nav rounded-full py-3 flex justify-center items-center shadow-lg shadow-black/5 px-8">
        <div class="text-xl font-extrabold text-primary font-headline tracking-tight">CuidarBem</div>
      </div>
    </nav>

    <main class="pt-32 px-8 pb-20 flex flex-col items-center justify-center min-h-screen">
      <!-- Header -->
      <div class="text-center mb-16 max-w-2xl relative z-10">
        <span class="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-primary font-semibold text-xs tracking-widest uppercase mb-6">
          Sua Jornada
        </span>
        <h1 class="font-headline text-5xl md:text-6xl font-extrabold text-teal-900 tracking-tighter mb-6">
          Bem-vindo, <span class="text-primary">{{ userName }}</span>.
        </h1>
        <p class="text-on-surface-variant font-light text-lg">
          Escolha uma das opções abaixo para continuar a sua jornada e acessar nossa plataforma.
        </p>
      </div>

      <!-- The two cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        <!-- Card 1: Cuidador -->
        <div 
          @click="goToRegister" 
          class="group cursor-pointer bg-surface-container-lowest p-12 rounded-[3rem] border border-outline-variant/30 flex flex-col justify-between hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 min-h-[400px]"
        >
          <div>
            <div class="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8">
              <span class="material-symbols-outlined text-primary text-4xl">clinical_notes</span>
            </div>
            <h2 class="font-headline text-3xl font-bold text-teal-900 mb-4">Sou um Cuidador</h2>
            <p class="text-on-surface-variant leading-relaxed mb-8">
              Cadastre seu perfil, ofereça seus serviços e encontre oportunidades de trabalho de forma segura.
            </p>
          </div>
          
          <div class="mt-8 pt-8 border-t border-outline-variant/20 flex items-center text-primary font-bold transition-all">
            <span class="group-hover:mr-2 transition-all">Cadastrar-se</span>
            <span class="material-symbols-outlined ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
          </div>
        </div>

        <!-- Card 2: Seeking Caregiver -->
        <div 
          @click="goToFindCaregiver" 
          class="group cursor-pointer bg-teal-900 text-white p-12 rounded-[3rem] flex flex-col justify-between hover:shadow-2xl hover:shadow-teal-900/30 hover:-translate-y-1 transition-all duration-500 border border-transparent min-h-[400px]"
        >
          <div>
            <div class="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
              <span class="material-symbols-outlined text-white text-4xl">real_estate_agent</span>
            </div>
            <h2 class="font-headline text-3xl font-bold mb-4">Busco um Cuidador</h2>
            <p class="text-teal-100 font-light leading-relaxed mb-8">
              Encontre o profissional ideal para atender às suas necessidades com segurança e confiança.
            </p>
          </div>
          
          <div class="mt-8">
            <button class="px-8 py-4 border border-white/20 rounded-full group-hover:bg-white group-hover:text-teal-900 transition-colors font-bold text-sm w-fit flex items-center gap-2">
              Encontrar profissionais
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
.floating-pill-nav {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 96, 100, 0.1);
}
</style>
