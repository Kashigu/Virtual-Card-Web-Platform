<script setup>
import { useToast } from "vue-toastification"
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'
import { ref } from 'vue'


const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const credentials = ref({
  username: '',
  password: ''
})

const emit = defineEmits(['login'])

const login = async () => {
  try {
    await userStore.login(credentials.value)

    toast.success('User ' + credentials.value.username + ' has entered the application.')
    emit('login')

    router.push({ name: 'Home' })
  }
  catch (error) {
    console.error(error)
    credentials.value.password = ''
    if (error?.response.status == '401') {
      toast.error('You are BLOCKED!')
      return
    }
    if (error?.response.data.message == "The user credentials were incorrect.") {
      toast.error('User credentials are invalid!')
      return
    }
    toast.error('Unknown server error!')

  }
}

</script>

<template>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="login">
    <h3 class="mt-5 mb-3">Login</h3>
    <hr>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputUsername" class="form-label">Phone Number</label>
        <input type="text" class="form-control" id="inputUsername" required v-model="credentials.username">
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="inputPassword" required v-model="credentials.password">
      </div>
    </div>
    <label>Don't have an account? Register
      <router-link class="text-blue-400 hover:text-blue-700 font-bold underline" :class="{ active: $route.name === 'Register' }" :to="{ name: 'Register' }">
        <i class="bi bi-person-check-fill"></i>
        here
      </router-link>
    </label>
    <div class="mb-3 d-flex justify-content-center">
      <button type="button" class="bg-blue-600 hover:bg-blue-800 hover:text-xl text-white px-5 rounded h-10 w-40 text-lg" @click="login">Login</button>
    </div>
  </form>
</template>

