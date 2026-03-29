<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const searchQuery = ref('')
const loading = ref(true)

interface CarerProfile {
  id: string
  name: string
  age: number
  gender: string
  price: string
  experience: string
  bio: string
  specialty: string
  avatarUrl: string | null
  bgClass: string
  textClass: string
}

const profiles = ref<CarerProfile[]>([])

const fetchProfiles = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('carers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('FoundCaregiver fetch error:', error)
      throw error
    }
    
    console.log('Fetched carers data:', data)
    if (data && data.length === 0) {
      console.warn('No carers found. Check RLS SELECT policies on the "carers" table!')
    }

    if (data) {
      const bgClasses = [
        'bg-primary-fixed',
        'bg-secondary-fixed',
        'bg-tertiary-fixed',
        'bg-error-container',
      ]
      const textClasses = [
        'text-on-primary-fixed',
        'text-on-secondary-fixed',
        'text-on-tertiary-fixed',
        'text-on-error-container',
      ]

      profiles.value = data.map(
        (p, index) =>
          ({
            id: p.id,
            name: p.full_name,
            age: p.age,
            gender: p.gender,
            price: `R$ ${p.price}/dia`,
            experience: p.experience,
            bio: p.bio,
            specialty: p.specialty,
            avatarUrl: p.avatar_url || null,
            bgClass: bgClasses[index % 4],
            textClass: textClasses[index % 4],
          } as CarerProfile)
      )
      console.log('Mapped profiles for display:', profiles.value.map(p => ({ name: p.name, hasAvatar: !!p.avatarUrl, url: p.avatarUrl })))
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfiles)

const filteredProfiles = computed(() => {
  if (!searchQuery.value) return profiles.value
  const query = searchQuery.value.toLowerCase()
  return profiles.value.filter((p) => 
    p.name.toLowerCase().includes(query) || 
    p.specialty.toLowerCase().includes(query)
  )
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div
    class="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen pb-20"
  >
    <!-- Header / Navigation -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <div
        class="floating-pill-nav rounded-full py-3 px-6 flex items-center gap-4 shadow-lg shadow-black/5"
      >
        <!-- Back Button -->
        <button
          @click="goBack"
          class="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all shadow-sm flex-shrink-0"
          aria-label="Voltar"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>

        <!-- Search Bar -->
        <div class="flex-1 relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors"
          >
            <span class="material-symbols-outlined">search</span>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-12 pr-32 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-full text-on-surface placeholder:text-outline focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-inner"
            placeholder="Encontre cuidadores..."
          />
          <button
            class="absolute inset-y-0 right-1.5 px-6 font-bold text-white bg-primary hover:bg-primary-container hover:text-white rounded-full my-1.5 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all text-sm"
          >
            Pesquisar
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 pt-32">
      <!-- Page Title -->
      <div class="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div class="max-w-2xl">
          <span
            class="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-primary font-semibold text-xs tracking-widest uppercase mb-6"
          >
            Nossa Rede
          </span>
          <h1 class="text-5xl font-extrabold text-teal-900 font-headline tracking-tighter mb-4">
            Profissionais próximos de você
          </h1>
          <p class="text-xl text-on-surface-variant font-light">
            Encontre o cuidador ideal para a sua necessidade com segurança, através do nosso
            processo rigoroso.
          </p>
        </div>

        <!-- Right side image placeholder -->
        <div
          class="w-full md:w-64 h-48 shrink-0 rounded-[2rem] bg-surface-container border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-outline/60"
        >
          <span class="material-symbols-outlined text-4xl mb-2">image</span>
          <span class="text-sm font-semibold tracking-widest uppercase">Espaço para Mídia</span>
        </div>
      </div>

      <!-- Profiles Grid -->
      <div
        v-if="filteredProfiles.length"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <article
          v-for="profile in filteredProfiles"
          :key="profile.id"
          class="group bg-surface-container-lowest rounded-[3rem] p-10 border border-outline-variant/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col"
        >
          <!-- Decorative blurred orb -->
          <div
            class="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
            :class="profile.bgClass"
          ></div>

          <!-- Avatar -->
          <div class="flex items-center gap-6 mb-8 relative z-10">
            <div
              v-if="profile.avatarUrl"
              class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm"
            >
              <img 
                :src="profile.avatarUrl" 
                :alt="profile.name" 
                class="w-full h-full object-cover"
                @error="profile.avatarUrl = null" 
              />
            </div>
            <div
              v-else
              class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-sm flex-shrink-0"
              :class="[profile.bgClass, profile.textClass]"
            >
              {{
                profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              }}
            </div>
            <div>
              <h2
                class="text-2xl font-bold text-teal-900 font-headline mb-1 group-hover:text-primary transition-colors"
              >
                {{ profile.name }}
              </h2>
              <p
                class="text-xs font-semibold text-primary uppercase tracking-widest bg-secondary-container px-3 py-1 rounded-full w-fit"
              >
                {{ profile.experience }} exp.
              </p>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="flex-1 flex flex-col relative z-10">
            <div
              class="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 mb-8 space-y-4"
            >
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant text-sm flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">cake</span> Idade
                </span>
                <span class="text-on-surface font-bold">{{ profile.age }} anos</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant text-sm flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">wc</span> Gênero
                </span>
                <span class="text-on-surface font-bold flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-lg opacity-70"
                    :class="profile.gender === 'Feminino' ? 'text-pink-500' : 'text-blue-500'"
                  >
                    {{ profile.gender === 'Feminino' ? 'female' : 'male' }}
                  </span>
                  {{ profile.gender }}
                </span>
              </div>
              <div
                class="pt-4 mt-2 border-t border-outline-variant/20 flex justify-between items-center"
              >
                <span class="text-on-surface-variant text-sm flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">payments</span> Diária
                </span>
                <span class="text-primary font-extrabold text-xl">{{ profile.price }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <button
              class="mt-auto w-full py-4 rounded-full border border-primary/20 text-primary font-bold hover:bg-primary hover:text-on-primary transition-all text-sm group-hover:shadow-lg shadow-primary/20"
            >
              Ver Perfil Completo
            </button>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-32 bg-surface-container-lowest rounded-[3rem] border border-outline-variant/30 mt-8"
      >
        <div
          class="w-20 h-20 mx-auto bg-surface-container-low text-outline rounded-3xl flex items-center justify-center mb-6"
        >
          <span class="material-symbols-outlined text-4xl">search_off</span>
        </div>
        <h3 class="font-headline text-3xl font-bold text-teal-900 mb-4">
          Nenhum profissional encontrado
        </h3>
        <p class="text-on-surface-variant font-light max-w-md mx-auto mb-8">
          Não encontramos cuidadores com o nome pesquisado na nossa rede do santuário.
        </p>
        <button
          @click="searchQuery = ''"
          class="px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-container transition-all"
        >
          Limpar busca
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.floating-pill-nav {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 96, 100, 0.1);
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 300,
    'GRAD' 0,
    'opsz' 24;
}
</style>
