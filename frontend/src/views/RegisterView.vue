<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleGoogleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      alert(error.message || 'Erro ao realizar login com Google')
    }
  } catch (error) {
    console.error('Google login error:', error)
    alert('Erro de conexão com o servidor')
  }
}

const handleRegister = async () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('As senhas não coincidem.')
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (error) {
      alert(error.message || 'Erro ao realizar o cadastro')
      return
    }

    if (data.user) {
      alert('Cadastro realizado com sucesso! Verifique seu e-mail, se necessário, ou faça login.')
      router.push({ name: 'login' })
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('Erro de conexão com o servidor')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background text-on-surface p-4 font-body selection:bg-primary-fixed selection:text-on-primary-fixed relative"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none"
    ></div>

    <div class="w-full max-w-sm relative z-10">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-6">
        <h1
          class="text-4xl font-extrabold text-teal-900 font-headline tracking-tighter drop-shadow-sm"
        >
          Cuidar<span class="text-primary">Bem</span>
        </h1>
        <p class="text-on-surface-variant font-medium mt-1 text-sm">
          O Santuário Digital do Cuidado
        </p>
      </div>

      <!-- Register Card -->
      <div
        class="bg-white/60 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl shadow-primary/5 border border-white/60 relative overflow-hidden"
      >
        <!-- Decoration -->
        <div
          class="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary-fixed blur-3xl opacity-40 pointer-events-none"
        ></div>

        <form @submit.prevent="handleRegister" class="space-y-4 relative z-10">
          <div>
            <label class="block text-xs font-bold text-teal-900 mb-1.5 ml-1" for="email"
              >E-mail</label
            >
            <input
              id="email"
              v-model="email"
              type="email"
              class="block w-full px-5 py-3 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl text-on-surface placeholder:text-outline/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-teal-900 mb-1.5 ml-1" for="password"
              >Senha</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              class="block w-full px-5 py-3 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl text-on-surface placeholder:text-outline/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-teal-900 mb-1.5 ml-1" for="confirmPassword"
              >Confirmar Senha</label
            >
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="block w-full px-5 py-3 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl text-on-surface placeholder:text-outline/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center py-3 px-6 mt-2 border border-transparent rounded-2xl shadow-md shadow-primary/20 text-white bg-primary hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/30 font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="material-symbols-outlined text-[20px] animate-spin mr-2"
              >progress_activity</span
            >
            {{ loading ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <div class="mt-6 relative z-10">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-outline-variant/30"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-transparent text-on-surface-variant font-medium"
                >ou continue com</span
              >
            </div>
          </div>

          <div class="mt-5">
            <button
              @click="handleGoogleLogin"
              type="button"
              class="w-full inline-flex justify-center items-center py-3 px-6 border border-white/80 rounded-2xl shadow-sm bg-white/70 backdrop-blur-md text-sm font-bold text-teal-900 hover:bg-white focus:outline-none focus:ring-4 focus:ring-outline-variant/30 transition-all hover:-translate-y-0.5"
            >
              <svg
                class="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div class="mt-6 text-center pt-5 border-t border-outline-variant/20 relative z-10">
          <p class="text-on-surface-variant font-medium text-sm">
            Já tem uma conta?
            <RouterLink
              to="/login"
              class="font-bold text-primary hover:text-teal-900 transition-colors ml-1"
              >Faça login</RouterLink
            >
          </p>
        </div>
      </div>

      <!-- Footer Help -->
      <p class="text-center text-outline text-xs mt-6 font-medium">
        &copy; 2026 CuidarBem. Todos os direitos reservados.
      </p>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48;
}
</style>
