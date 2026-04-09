<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import MazInputPhoneNumber from 'maz-ui/components/MazInputPhoneNumber'
import 'maz-ui/styles'

const router = useRouter()
const submitLoading = ref(false)
const signOutLoading = ref(false)
const userId = ref<string | null>(null)
const userEmail = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const userName = computed(() => {
  if (!userEmail.value) return 'Usuário'
  return userEmail.value.split('@')[0]
})

interface StateObj {
  name: string
  state_code: string
}

interface CountryObj {
  name: string
  iso3: string
  iso2: string
  states: StateObj[]
}

const selectedCountry = ref('')
const selectedState = ref('')
const selectedCity = ref('')
const countries = ref<CountryObj[]>([])
const currentStates = ref<StateObj[]>([])
const cities = ref<string[]>([])

const onCountryChange = () => {
  selectedState.value = ''
  selectedCity.value = ''
  cities.value = []
  const countryObj = countries.value.find(c => c.name === selectedCountry.value)
  currentStates.value = countryObj ? [...countryObj.states].sort((a, b) => a.name.localeCompare(b.name)) : []
}

const onStateChange = async () => {
  selectedCity.value = ''
  cities.value = []
  if (!selectedCountry.value || !selectedState.value) return

  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry.value, state: selectedState.value })
    })
    const data = await res.json()
    if (!data.error) {
      cities.value = data.data.sort((a: string, b: string) => a.localeCompare(b))
    }
  } catch (error) {
    console.error("Error fetching cities:", error)
  }
}

const form = ref({
  fullName: '',
  gender: '',
  age: '',
  phone: '',
  location: '',
  specialty: '',
  experience: '',
  bio: '',
  avatarUrl: '' as string,
})

const specialties = [
  'Idosos',
  'Pós-operatório',
  'Alzheimer / Demência',
  'Crianças / PCD',
  'Cuidados Paliativos',
]

const handleSignOut = async () => {
  signOutLoading.value = true
  await supabase.auth.signOut()
  router.replace({ name: 'login' })
}

onMounted(async () => {
  // Load countries API
  try {
    const resp = await fetch("https://countriesnow.space/api/v0.1/countries/states")
    const apiData = await resp.json()
    if (!apiData.error) {
      countries.value = apiData.data.sort((a: CountryObj, b: CountryObj) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    console.error("Error fetching countries:", error)
  }

  // getUser() validates the token server-side — required for RLS to work correctly
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    router.push({ name: 'login' })
    return
  }
  userId.value = user.id
  userEmail.value = user.email ?? null

  // Pre-fill if profile already exists
  const { data: carer } = await supabase.from('carers').select('*').eq('id', userId.value).single()

  if (carer) {
    form.value = {
      fullName: carer.full_name || '',
      gender: carer.gender || '',
      age: carer.age?.toString() || '',
      phone: carer.phone || '',
      location: carer.location || '',
      specialty: carer.specialty || '',
      experience: carer.experience || '',
      bio: carer.bio || '',
      avatarUrl: carer.avatar_url || '',
    }
    if (carer.avatar_url) avatarPreview.value = carer.avatar_url

    // Pre-fill location fields
    if (carer.location && carer.location.includes(' - ')) {
      const parts = carer.location.split(' - ')
      selectedCountry.value = parts[1]
      const cityState = parts[0].split(', ')
      selectedCity.value = cityState[0]
      selectedState.value = cityState[1] || ''

      const cObj = countries.value.find(c => c.name === selectedCountry.value)
      if (cObj) {
        currentStates.value = [...cObj.states].sort((a, b) => a.name.localeCompare(b.name))
      }

      if (selectedState.value) {
         try {
           const cres = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ country: selectedCountry.value, state: selectedState.value })
           })
           const cData = await cres.json()
           if (!cData.error) {
             cities.value = cData.data.sort((a: string, b: string) => a.localeCompare(b))
           }
         } catch(e) { console.error("Prefill cities error", e) }
      }
    } else {
      form.value.location = carer.location || ''
    }
  }
})

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const handleSubmit = async () => {
  if (!userId.value) {
    console.error('Submit attempted without userId')
    return
  }

  console.log('Starting handleSubmit for user:', userId.value)
  submitLoading.value = true
  try {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) {
      throw new Error('User not authenticated')
    }
    console.log('Authenticated user confirmed:', authUser.user.id)

    let avatarUrl = form.value.avatarUrl

    const session = await supabase.auth.getSession()
    console.log('Token ativo:', session.data.session?.access_token ? 'Sim' : 'Não')

    // Upload new avatar if one was selected
    if (avatarFile.value && userId.value) {
      const ext = avatarFile.value.name.split('.').pop()
      const path = `${userId.value}/${userId.value}.${ext}`
      console.log('Uploading image to path:', path)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile.value, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl
      console.log('Image uploaded successfully. Public URL:', avatarUrl)
    }

    const finalLocation = selectedCity.value && selectedState.value && selectedCountry.value
      ? `${selectedCity.value}, ${selectedState.value} - ${selectedCountry.value}`
      : form.value.location

    const payload = {
      id: userId.value,
      full_name: form.value.fullName,
      gender: form.value.gender,
      age: parseInt(form.value.age),
      phone: form.value.phone,
      location: finalLocation,
      specialty: form.value.specialty,
      experience: form.value.experience,
      bio: form.value.bio,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    }

    console.log('Upserting payload:', payload)

    // Using separate insert/update check to be safer with RLS
    const { data: existing } = await supabase
      .from('carers')
      .select('id')
      .eq('id', userId.value)
      .single()

    let error
    if (existing) {
      console.log('Profile exists, updating...')
      const res = await fetch(`http://localhost:3000/api/carers/${userId.value}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json()
        error = new Error(errData.error || 'Falha ao atualizar o perfil')
      }
    } else {
      console.log('No profile exists, inserting...')
      const { error: insertError } = await supabase.from('carers').insert(payload)
      error = insertError
    }

    if (error) {
      console.error('Database operation failed:', error)
      throw error
    }

    console.log('Profile saved successfully')
    // Success — navigate to next step (price setup)
    router.push({ name: 'profile' })
  } catch (err: unknown) {
    // PostgrestError has .message but is not instanceof Error
    const message =
      err instanceof Error
        ? err.message
        : ((err as { message?: string })?.message ?? 'Erro desconhecido')
    console.error('Error saving profile (catch):', err)
    alert('Erro ao salvar perfil: ' + message)
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <div
    class="bg-background text-on-surface font-body min-h-screen flex flex-col selection:bg-secondary-container"
  >
    <!-- Floating TopNavBar (same as HomeView) -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-fit">
      <div
        class="floating-pill-nav rounded-full py-3.5 flex justify-between items-center shadow-lg shadow-black/5 px-6"
      >
        <div class="text-xl font-extrabold text-primary font-headline tracking-tight mr-4">
          CuidarBem
        </div>
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
          <span class="hidden md:block text-sm font-medium text-secondary"
            >Olá, {{ userName }}</span
          >
          <button
            @click="handleSignOut"
            :disabled="signOutLoading"
            class="bg-primary text-white py-2 rounded-full text-sm font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95 px-6 disabled:opacity-50"
          >
            {{ signOutLoading ? 'Saindo...' : 'Sair' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main
      class="flex-grow pt-28 pb-24 px-6 relative overflow-hidden flex items-center justify-center"
    >
      <!-- Abstract Background -->
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-[120px]"
      ></div>

      <div class="w-full max-w-4xl grid md:grid-cols-12 gap-12 items-start relative z-10">
        <!-- Editorial Side -->
        <div class="md:col-span-5 pt-12">
          <h1
            class="font-headline text-5xl font-extrabold tracking-tight text-primary leading-tight mb-8"
          >
            Join the <span class="text-secondary">Sanctuary</span> of Care.
          </h1>
          <p class="text-lg text-on-surface-variant leading-relaxed mb-12 max-w-xs">
            CuidarBem connects expert caregivers with families seeking a digital haven for
            professional health management.
          </p>
          <div
            class="bg-secondary-container/40 p-6 rounded-xl backdrop-blur-md border border-white/30"
          >
            <div class="flex items-center gap-3 mb-4">
              <span
                class="material-symbols-outlined text-primary"
                style="font-variation-settings: 'FILL' 1"
                >auto_awesome</span
              >
              <span class="font-headline font-bold text-primary">AI-Matched Care</span>
            </div>
            <p class="text-sm text-on-secondary-container/80 leading-snug">
              Our platform uses intelligent observation to pair your specific specialties with the
              families that need them most.
            </p>
          </div>
        </div>

        <!-- Registration Card -->
        <div
          class="md:col-span-7 bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/40 shadow-xl shadow-primary/5"
        >
          <form @submit.prevent="handleSubmit" class="space-y-10">
            <!-- Section: Personal -->
            <div class="space-y-6">
              <div class="group">
                <label
                  class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                  >Full Name</label
                >
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface placeholder:text-outline-variant outline-none"
                  placeholder="Elena Rodriguez"
                />
              </div>
              <div class="grid grid-cols-2 gap-8">
                <div class="group">
                  <label
                    class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                    >Age</label
                  >
                  <input
                    v-model="form.age"
                    type="number"
                    required
                    class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface placeholder:text-outline-variant outline-none"
                    placeholder="32"
                  />
                </div>
                <div class="group">
                  <label
                    class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                    >Gender</label
                  >
                  <select
                    v-model="form.gender"
                    class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface appearance-none outline-none"
                  >
                    <option disabled value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div class="group">
                <label
                  class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                  >Phone Number</label
                >
                <MazInputPhoneNumber
                  v-model="form.phone"
                  default-country-code="BR"
                  required
                  class="w-full"
                />
              </div>

              <!-- Location API Section -->
              <div class="space-y-4 pt-2">
                <label class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Localização</label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <select v-model="selectedCountry" @change="onCountryChange" required class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface appearance-none outline-none">
                    <option disabled value="">País</option>
                    <option v-for="c in countries" :key="c.name" :value="c.name">{{ c.name }}</option>
                  </select>
                  <select v-model="selectedState" @change="onStateChange" :disabled="!selectedCountry" required class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface appearance-none outline-none disabled:opacity-50">
                    <option disabled value="">Estado</option>
                    <option v-for="s in currentStates" :key="s.name" :value="s.name">{{ s.name }}</option>
                  </select>
                  <select v-model="selectedCity" :disabled="!selectedState" required class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface appearance-none outline-none disabled:opacity-50">
                    <option disabled value="">Cidade</option>
                    <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section: Expertise -->
            <div class="space-y-6 pt-4">
              <div class="grid grid-cols-2 gap-8">
                <div class="group">
                  <label
                    class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                    >Specialty</label
                  >
                  <select
                    v-model="form.specialty"
                    required
                    class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface appearance-none outline-none"
                  >
                    <option disabled value="">Specialty Area</option>
                    <option v-for="s in specialties" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="group">
                  <label
                    class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                    >Experience (Years)</label
                  >
                  <input
                    v-model="form.experience"
                    type="text"
                    required
                    class="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 px-1 text-on-surface placeholder:text-outline-variant outline-none"
                    placeholder="5"
                  />
                </div>
              </div>
              <div class="group">
                <label
                  class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                  >Professional Bio</label
                >
                <textarea
                  v-model="form.bio"
                  rows="3"
                  required
                  class="w-full bg-surface-container/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all p-4 text-on-surface placeholder:text-outline-variant resize-none outline-none"
                  placeholder="Describe your care philosophy..."
                ></textarea>
              </div>

              <!-- Profile Photo Upload -->
              <div class="group">
                <label
                  class="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1"
                  >Profile Photo</label
                >
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
                <label
                  for="avatar-input"
                  class="flex items-center gap-5 cursor-pointer group/upload"
                >
                  <!-- Preview / Placeholder -->
                  <div
                    class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-outline-variant/40 bg-surface-container/30 flex items-center justify-center transition-all group-hover/upload:border-primary/50"
                  >
                    <img
                      v-if="avatarPreview"
                      :src="avatarPreview"
                      alt="Preview"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="material-symbols-outlined text-3xl text-outline/50"
                      >add_a_photo</span
                    >
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-on-surface">
                      {{ avatarPreview ? 'Change photo' : 'Upload a photo' }}
                    </p>
                    <p class="text-xs text-outline mt-1">JPG, PNG or WEBP · Max 5 MB</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Action -->
            <button
              type="submit"
              :disabled="submitLoading"
              class="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span v-if="submitLoading" class="material-symbols-outlined animate-spin"
                >progress_activity</span
              >
              <span>{{ submitLoading ? 'Saving...' : 'Complete Registration' }}</span>
              <span v-if="!submitLoading" class="material-symbols-outlined text-sm"
                >arrow_forward</span
              >
            </button>
          </form>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="bg-transparent w-full max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center pb-12 pt-24 text-sm tracking-wide"
    >
      <div class="mb-6 md:mb-0">
        <span class="font-headline font-black text-cyan-950 text-lg">CuidarBem</span>
        <p class="text-cyan-800/50 mt-1">© 2026 CuidarBem. The Digital Sanctuary.</p>
      </div>
      <div class="flex gap-8">
        <a
          class="text-cyan-800/50 hover:text-cyan-950 transition-opacity opacity-80 hover:opacity-100"
          href="#"
          >Privacy Policy</a
        >
        <a
          class="text-cyan-800/50 hover:text-cyan-950 transition-opacity opacity-80 hover:opacity-100"
          href="#"
          >Terms of Service</a
        >
        <a
          class="text-cyan-800/50 hover:text-cyan-950 transition-opacity opacity-80 hover:opacity-100"
          href="#"
          >Contact Support</a
        >
      </div>
    </footer>
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

.floating-pill-nav {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 96, 100, 0.1);
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

/* MazPhoneNumberInput Override to match aesthetic */
:deep(.m-input-phone-number) {
  --maz-border-radius: 0;
  --maz-border-width: 0 0 1px 0;
}

:deep(.m-input-wrapper) {
  border: none !important;
  border-bottom: 1px solid rgba(120, 130, 130, 0.3) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background-color: transparent !important;
}

:deep(.m-input-wrapper.is-focused) {
  border-bottom-color: #006064 !important;
}

:deep(.m-input-input) {
  padding-left: 0.25rem !important;
  padding-right: 0.25rem !important;
  color: inherit !important;
}
</style>
