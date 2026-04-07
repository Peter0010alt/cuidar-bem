<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const userId = ref<string | null>(null)
const priceRange = ref(150)

const carer = ref({
  name: '',
  age: 0,
  gender: '',
  specialty: '',
  experience: '',
  location: '',
  bio: '',
  rating: 5.0,
  reviews: 0,
  completedJobs: 0,
  avatarUrl: null as string | null,
})

const firstName = computed(() => {
  return carer.value.name.split(' ')[0] || 'Cuidador'
})

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push({ name: 'login' })
    return
  }
  userId.value = user.id
  await fetchCarerData()
})

const fetchCarerData = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('carers')
      .select('*')
      .eq('id', userId.value)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No carer profile yet
        router.push({ name: 'forms-page' })
        return
      }
      throw error
    }

    if (data) {
      carer.value = {
        name: data.full_name || '',
        age: data.age || 0,
        gender: data.gender || '',
        specialty: data.specialty || '',
        experience: data.experience || '',
        location: data.location || '',
        bio: data.bio || '',
        rating: data.rating || 5.0,
        reviews: data.reviews || 0,
        completedJobs: data.completed_jobs || 0,
        avatarUrl: data.avatar_url || null,
      }
      priceRange.value = data.price || 150
    }
  } catch (error) {
    console.error('Error fetching carer:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdatePrice = async () => {
  if (!userId.value) return
  
  saving.value = true
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) throw new Error('Token de autenticação não encontrado')

    const res = await fetch(`http://localhost:3000/api/carers/${userId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ price: Number(priceRange.value) }),
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Falha ao atualizar o perfil')
    }

    console.log('Price updated successfully, redirecting to FoundCaregiver...')
    router.push({ name: 'found-caregiver' })
  } catch (error) {
    console.error('Error updating price:', error)
    alert('Erro ao atualizar preço.')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div
    class="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed flex flex-col items-center p-6 py-20 relative overflow-hidden"
  >
    <!-- Background Elements -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none"
    ></div>
    <div
      class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
    ></div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>

    <div v-else class="w-full max-w-4xl relative z-10 flex flex-col gap-8">
      <!-- Back Navigation -->
      <button
        @click="goBack"
        class="group w-fit flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-md rounded-full border border-white/60 text-teal-900 font-bold hover:bg-white/80 transition-all shadow-sm"
      >
        <span class="material-symbols-outlined transition-transform group-hover:-translate-x-1"
          >arrow_back</span
        >
        Voltar
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Column: Profile Card -->
        <div class="lg:col-span-5 flex flex-col gap-8">
          <div
            class="bg-white/60 backdrop-blur-3xl p-8 rounded-[3rem] shadow-2xl shadow-primary/5 border border-white/60 relative overflow-hidden"
          >
            <!-- Decorative circle -->
            <div
              class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-secondary-fixed blur-3xl opacity-20"
            ></div>

            <div class="relative z-10 flex flex-col items-center text-center">
              <div class="relative mb-6">
                <div
                  class="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-primary to-primary-fixed p-1 rotate-3 shadow-2xl shadow-primary/20"
                >
                  <div class="w-full h-full rounded-[2.2rem] bg-white overflow-hidden flex items-center justify-center">
                    <img v-if="carer.avatarUrl" :src="carer.avatarUrl" :alt="carer.name" class="w-full h-full object-cover" />
                    <span v-else class="material-symbols-outlined text-6xl text-primary opacity-20">person</span>
                  </div>
                </div>
                <div
                  class="absolute -bottom-2 -right-2 w-12 h-12 bg-teal-900 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg"
                >
                  <span class="material-symbols-outlined text-white text-xl">verified</span>
                </div>
              </div>

              <h1 class="text-3xl font-extrabold text-teal-900 font-headline tracking-tighter mb-2">
                {{ carer.name }}
              </h1>
              <div class="flex items-center gap-2 mb-4">
                <div class="flex text-amber-500">
                  <span class="material-symbols-outlined fill-1">star</span>
                </div>
                <span class="font-bold text-teal-900">{{ carer.rating }}</span>
                <span class="text-on-surface-variant text-sm">({{ carer.reviews }} avaliações)</span>
              </div>
              
              <p class="text-primary font-bold bg-primary-fixed/30 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-8">
                {{ carer.specialty }}
              </p>

              <div class="grid grid-cols-2 w-full gap-4">
                <div class="bg-white/40 p-4 rounded-3xl border border-white/60">
                  <div class="text-2xl font-extrabold text-teal-900">{{ carer.completedJobs }}</div>
                  <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Atendimentos</div>
                </div>
                <div class="bg-white/40 p-4 rounded-3xl border border-white/60">
                  <div class="text-2xl font-extrabold text-teal-900">{{ carer.experience }}</div>
                  <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Experiência</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-teal-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-xl shadow-teal-900/10">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <span class="material-symbols-outlined text-8xl">info</span>
            </div>
            <h3 class="font-bold text-lg mb-4 opacity-80 uppercase tracking-widest text-xs">Informações Rápidas</h3>
            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <span class="material-symbols-outlined opacity-60">cake</span>
                <span class="font-medium">Idade: <span class="font-bold">{{ carer.age }} anos</span></span>
              </li>
              <li class="flex items-center gap-3">
                <span class="material-symbols-outlined opacity-60">wc</span>
                <span class="font-medium">Gênero: <span class="font-bold">{{ carer.gender }}</span></span>
              </li>
              <li class="flex items-center gap-3">
                <span class="material-symbols-outlined opacity-60">location_on</span>
                <span class="font-medium">Localização: <span class="font-bold">{{ carer.location ? carer.location : 'Não informada' }}</span></span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Column: Details & Pricing -->
        <div class="lg:col-span-7 flex flex-col gap-8 text-left">
          <!-- Bio -->
          <div class="bg-white/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl shadow-primary/5 border border-white/60">
            <h2 class="text-2xl font-bold text-teal-900 font-headline mb-6">Sobre o(a) {{ firstName }}</h2>
            <p class="text-lg text-on-surface-variant leading-relaxed font-light">
              {{ carer.bio }}
            </p>
          </div>

          <!-- Pricing & Range Slider -->
          <div class="bg-white/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl shadow-primary/5 border border-white/60 relative overflow-hidden">
            <h2 class="text-2xl font-bold text-teal-900 font-headline mb-8">Ajuste seu Preço</h2>
            
            <div class="space-y-12">
              <div class="relative pt-6">
                <!-- Custom Slider -->
                <input
                  type="range"
                  min="50"
                  max="500"
                  v-model="priceRange"
                  class="w-full h-3 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary focus:outline-none transition-all"
                />
                
                <div class="flex justify-between mt-4 text-xs font-bold text-on-surface-variant tracking-widest uppercase">
                  <span>R$ 50</span>
                  <span>R$ 500+</span>
                </div>

                <!-- Price Tooltip/Display -->
                <div 
                  class="absolute top-[-30px] left-0 right-0 flex justify-center pointer-events-none"
                >
                  <div class="bg-primary text-white px-6 py-2 rounded-2xl font-extrabold text-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                    <span class="text-sm opacity-60">R$</span> {{ priceRange }} <span class="text-xs opacity-60">/dia</span>
                  </div>
                </div>
              </div>

              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 italic text-on-surface-variant text-sm">
                * O valor da sua diária será exibido para as famílias que buscam por cuidados no santuário.
              </div>

              <button 
                @click="handleUpdatePrice"
                :disabled="saving"
                class="w-full py-5 rounded-full bg-primary text-white font-extrabold text-lg shadow-xl shadow-primary/20 hover:bg-primary-container hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                <span v-if="saving" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined">rocket_launch</span>
                <span>{{ saving ? 'Salvando...' : 'Entrar na Rede' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.fill-1 {
  font-variation-settings: 'FILL' 1;
}

/* Custom range slider styling for modern feel */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
