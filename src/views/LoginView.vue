<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

async function handleSubmit (e) {
  e.preventDefault()
  await auth.login(email.value, password.value)
  if (auth.token) router.push('/')
}
</script>

<template>
  <section class="auth-container">
    <h2>Iniciar sesión</h2>
    <form @submit="handleSubmit">
      <label>Email</label>
      <input v-model="email" type="email" required />
      <label>Contraseña</label>
      <input v-model="password" type="password" required />
      <button type="submit" :disabled="auth.loading">Entrar</button>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <router-link to="/register">¿No tienes cuenta? Regístrate</router-link>
    </form>
  </section>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
label {
  font-weight: 600;
}
input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: var(--clr-primary);
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.error { color: red; }
</style>
