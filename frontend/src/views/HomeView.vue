<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const user = ref<{ email?: string } | null>(null)
const loading = ref(false)

const userName = computed(() => {
  if (!user.value?.email) return 'Usuário'
  return user.value.email.split('@')[0]
})

const loadSession = async () => {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    user.value = null
    return
  }
  user.value = data.session.user
}

const goTo = (routeName: string) => {
  router.push({ name: routeName })
}

const handleSignOut = async () => {
  loading.value = true
  const { error } = await supabase.auth.signOut()
  loading.value = false

  if (error) {
    alert(error.message || 'Erro ao deslogar. Tente novamente.')
    return
  }

  router.replace({ name: 'login' })
}

onMounted(loadSession)

const statsVars = [
  { value: '24/7', label: 'Support' },
  { value: '100%', label: 'Digital' },
  { value: '1.2h', label: 'Avg Response' },
  { value: 'Elite', label: 'Ranking' },
]
</script>

<template>
  <div
    class="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen"
  >
    <!-- Floating TopNavBar -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-fit">
      <div
        class="floating-pill-nav rounded-full py-3.5 flex justify-between items-center shadow-lg shadow-black/5 px-6"
      >
        <div class="text-xl font-extrabold text-primary font-headline tracking-tight mr-4">
          CuidarBem
        </div>
        <!-- Navigation Links -->
        <div class="hidden md:flex items-center gap-6">
          <RouterLink
            class="text-primary font-bold text-sm font-headline tracking-tight hover:opacity-70 transition-opacity"
            :to="{ name: 'home' }"
            >Plataforma</RouterLink
          >
          <a
            class="text-secondary font-medium text-sm hover:text-primary transition-colors duration-300 font-headline tracking-tight"
            href="#"
            >Soluções</a
          >
          <a
            class="text-secondary font-medium text-sm hover:text-primary transition-colors duration-300 font-headline tracking-tight"
            href="#"
            >Sobre</a
          >
        </div>
        <div class="flex items-center ml-4 gap-4">
          <template v-if="user">
            <span class="hidden md:block text-sm font-medium text-secondary"
              >Olá, {{ userName }}</span
            >
            <button
              @click="handleSignOut"
              :disabled="loading"
              class="bg-primary text-white py-2 rounded-full text-sm font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95 px-6 disabled:opacity-50"
            >
              {{ loading ? 'Saindo...' : 'Sair' }}
            </button>
          </template>
          <template v-else>
            <button
              @click="goTo('login')"
              class="bg-primary text-white py-2 rounded-full text-sm font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95 px-6"
            >
              Entrar
            </button>
          </template>
        </div>
      </div>
    </nav>

    <main class="pt-24">
      <!-- Hero Section -->
      <section class="relative min-h-[850px] flex items-center px-8 overflow-hidden bg-white">
        <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <!-- Left Content -->
          <div class="lg:col-span-6 z-10">
            <span
              class="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-primary font-semibold text-xs tracking-widest uppercase mb-8"
            >
              Vocë encontrou o que precisava
            </span>
            <h1
              class="font-headline text-6xl lg:text-8xl font-extrabold text-teal-900 leading-[1.1] tracking-tighter mb-8 text-balance"
            >
              O futuro do <span class="text-primary">cuidado</span>, hoje.
            </h1>
            <p class="text-lg text-on-surface-variant font-light leading-relaxed mb-12 max-w-lg">
              Plataforma que conecta cuidadores e pessoas que precisam de cuidados.
            </p>
            <!-- Hero CTAs -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button
                @click="goTo('found-caregiver')"
                class="bg-primary text-on-primary px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Quero cuidado
              </button>
              <button
                @click="goTo('forms-page')"
                class="px-10 py-4 bg-surface-container-low text-primary border border-primary/10 rounded-full font-bold text-lg hover:bg-surface-container transition-all"
              >
                Quero cuidar
              </button>
            </div>
          </div>
          <!-- Right Visual -->
          <div class="lg:col-span-6 relative h-[600px] lg:h-[700px]">
            <div
              class="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10"
            >
              <img
                alt="Elderly woman smiling with carer"
                class="w-full h-full object-cover"
                src="@/assets/landing-page-elderly-picture.png"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Grid (Asymmetric Bento) -->
      <section class="py-32 px-8 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div class="max-w-2xl">
              <h2 class="font-headline text-4xl lg:text-5xl font-bold text-teal-900 mb-6">
                Conectando pessoas através de cuidados.
              </h2>
              <p class="text-on-surface-variant font-light">
                Nós rejeitamos a desordem dos sistemas de saúde tradicionais para fornecer uma
                experiência respirável e intuitiva.
              </p>
            </div>
            <div class="hidden md:block">
              <a class="text-primary font-semibold flex items-center gap-2 group" href="#">
                Explore nossa filosofia
                <span
                  class="material-symbols-outlined transition-transform group-hover:translate-x-1"
                  >arrow_forward</span
                >
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <!-- Feature 1 -->
            <div
              class="md:col-span-7 bg-surface-container-lowest p-12 rounded-[3rem] border border-outline-variant/30 flex flex-col justify-between min-h-[400px]"
            >
              <div>
                <div
                  class="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8"
                >
                  <span class="material-symbols-outlined text-primary text-3xl">favorite</span>
                </div>
                <h3 class="font-headline text-3xl font-bold text-teal-900 mb-4">
                  Encontro de valores
                </h3>
                <p class="text-on-surface-variant leading-relaxed max-w-md">
                  Nosso processo foca no alinhamento emocional e compatibilidade para garantir que o
                  cuidador e o paciente compartilhem um vínculo genuíno.
                </p>
              </div>
              <div class="mt-8 pt-8 border-t border-outline-variant/20">
                <div class="flex -space-x-3 overflow-hidden">
                  <img
                    alt=""
                    class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPGxIni7ozzx4MWGS0xQhenHnmQ4L4U---oMdfr6f99CpLL5_goHdCKNQCeqDMqdHXM7CXsNZBxeOmQftXO9eR0eKfayXeJjqQzQoIdnOsnZ-eZsOPtJ5gR33usNQJa0AY5Zrooq0VVAt8q7CLUfDUKxg5--WT8VhbVNwVUBM8SretphZUtnpJUdJyrCmtbeRDSdUEvUQpDMUeh5TjqDmqCbGbha4yyZ40kG2CvHxr97GNwUVLQa25YIMm5J2HPLhGaRuze7Z2UcnD"
                  />
                  <img
                    alt=""
                    class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP1Tg1Wzxzg0X9XnV_UDusOILIG5HJMjMAm_t9uWM0FCERILrp3WDZGH2QtQkicbWW_fTOpnwi4r64qm1v4ztrb3lsiTV0SylHGESs0R4kBapIqqIsGKsCp4c87oAwnt3q18q7HtvOmXlvs1S6c1ZwHayCmWLYHD3ES31ThSrgmVNwo7RJfAKhRImEYLB67mH8GorCDXqBzGxzIZoLMUqVTN5p8Re87B9V_nfyBPrJM827Pssrxe5DDP-E09aFbke7cNcDQ4dX9fcN"
                  />
                  <img
                    alt=""
                    class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC13CEcIxP8bpsUr2InLDhdldnm1ttBAdBIWlextZpGQTLr_ltBMFTTleDfYT7dc-CLF4oLbPzlvg-sXY47EOEKP5r57MrrgUtGl1hWpBVX-XIu5zKJO8OgXwDZNtU_PMCvWCAb69-IwbglG-vhrIL_EQ8rlJCaGTPNeVk-GM9ZIFT-XIYCGLnMlKLZ9u1kZc-LK73at8mdaRmIwkOueuECuS-xYyiiN9HRz1XtxqjT_VLwRkb8LdW9yJUAo6DJTLBkEla1D3NisiRz"
                  />
                  <div
                    class="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-primary flex items-center justify-center text-[10px] text-white font-bold"
                  >
                    +2k
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 2 -->
            <div
              class="md:col-span-5 bg-teal-900 text-white p-12 rounded-[3rem] flex flex-col justify-between"
            >
              <div>
                <div
                  class="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-8"
                >
                  <span class="material-symbols-outlined text-white text-3xl">verified_user</span>
                </div>
                <h3 class="font-headline text-3xl font-bold mb-4">Rede de confiança</h3>
                <p class="text-teal-100 font-light leading-relaxed">
                  Os cuidadores são verificados através de um rigoroso processo interno na hora do
                  cadastro.
                </p>
              </div>
              <button
                class="mt-8 w-fit px-8 py-3 border border-white/20 rounded-full hover:bg-white hover:text-teal-900 transition-colors font-bold text-sm"
              >
                Verificar um cuidador
              </button>
            </div>

            <!-- Feature 3 -->
            <div
              class="md:col-span-12 bg-secondary-container/30 p-12 rounded-[3rem] relative overflow-hidden border border-primary/5"
            >
              <div class="relative z-10 max-w-2xl">
                <h3 class="font-headline text-3xl font-bold text-teal-900 mb-4">
                  Deixamos você planejar o seu cuidado
                </h3>
                <p class="text-on-secondary-container leading-relaxed mb-8">
                  Agendamento dinâmico e gerenciamento de rotina que se adapta em tempo real aos
                  marcadores de saúde e necessidades familiares.
                </p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    v-for="(stat, idx) in statsVars"
                    :key="idx"
                    class="p-6 bg-white/60 backdrop-blur rounded-2xl border border-white/40"
                  >
                    <div class="text-3xl font-bold text-teal-900">{{ stat.value }}</div>
                    <div class="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                      {{ stat.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter / CTA Section -->
      <section class="py-32 px-8 bg-white">
        <div class="max-w-5xl mx-auto text-center">
          <h2
            class="font-headline text-5xl lg:text-7xl font-extrabold text-teal-900 mb-12 tracking-tighter"
          >
            Entre no Santuário.
          </h2>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              @click="goTo('found-caregiver')"
              class="bg-primary text-on-primary px-12 py-5 rounded-full font-bold text-lg hover:shadow-xl transition-all"
            >
              Cadastre-se como família
            </button>
            <button
              @click="goTo('forms-page')"
              class="px-12 py-5 bg-surface-container-high text-teal-900 rounded-full font-bold text-lg hover:bg-surface-container-highest transition-all"
            >
              Cadastre-se como cuidador
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 py-16 px-8">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div class="flex flex-col items-center md:items-start gap-3">
          <div class="text-2xl font-green text-primary font-headline">CuidarBem</div>
          <p class="text-slate-400 font-body text-xs tracking-widest uppercase font-semibold">
            © 2026 CuidarBem. O Santuário Digital.
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-10">
          <a class="text-slate-500 hover:text-primary transition-all font-semibold text-sm" href="#"
            >Política de Privacidade</a
          >
          <a class="text-slate-500 hover:text-primary transition-all font-semibold text-sm" href="#"
            >Termos de Uso</a
          >
          <a class="text-slate-500 hover:text-primary transition-all font-semibold text-sm" href="#"
            >Padrões Éticos</a
          >
          <a class="text-slate-500 hover:text-primary transition-all font-semibold text-sm" href="#"
            >Contato</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 300,
    'GRAD' 0,
    'opsz' 24;
}
.floating-pill-nav {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 96, 100, 0.1);
}
.hero-gradient {
  background: linear-gradient(135deg, #00464a 0%, #006064 100%);
}
.text-balance {
  text-wrap: balance;
}
</style>
