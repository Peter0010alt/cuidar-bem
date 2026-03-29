import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { supabase } from '@/lib/supabaseClient'

const requireAuth = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  if (!session) {
    console.warn('Navigation blocked: No session found. Redirecting to login.')
    return { name: 'login' }
  }
  
  console.log('Navigation authorized for user:', session.user.id)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/found-caregiver',
      name: 'found-caregiver',
      component: () => import('../views/FoundCaregiver.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/forms-page',
      name: 'forms-page',
      component: () => import('../views/FormsPage.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: requireAuth,
    },
  ],
})

export default router
