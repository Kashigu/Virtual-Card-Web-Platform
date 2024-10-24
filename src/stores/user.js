import axios from 'axios'
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const toast = useToast()
  const serverBaseUrl = inject('serverBaseUrl')
  const socket = inject('socket')
  const storagePath = '/storage/fotos/'
  const user = ref(null)

  const userDetails = ref(null)

  const userName = computed(() => user.value?.name ?? 'Anonymous')

  const userId = computed(() => user.value?.id ?? -1)

  const userType = computed(() => user.value?.user_type ?? 'V')

  const userPhotoUrl = computed(() => getUserImgUrl(user.value.photo_url))

  async function loadUser() {
    try {
      const response = await axios.get('/authUsers/me')
      user.value = response.data.data
      //console.log(user.value)
    } catch (error) {
      clearUser()
    }
  }

  async function loadUserDetails() {
    try {
      if (userType.value === 'V') {
        let response = await axios.get('/vcards/' + user.value.id)
        //console.log(response.data.data)
        userDetails.value = response.data.data
      } else if (userType.value === 'A') {
        let response = await axios.get('/users/' + user.value.id)
        userDetails.value = response.data.data
        //console.log(userDetails.value)
      } else {
        //console.error('funcao loadUserDetails no user.js')
        throw 'Error while loading user'
      }
    } catch (error) {
      clearUser()
    }
  }

  function clearUser() {
    delete axios.defaults.headers.common.Authorization
    sessionStorage.removeItem('token')
    user.value = null
    userDetails.value = null
  }

  async function login(credentials) {
    try {
      const response = await axios.post('/auth/login', credentials)
      axios.defaults.headers.common.Authorization = 'Bearer ' + response.data.access_token
      sessionStorage.setItem('token', response.data.access_token)
      await loadUser()
      await loadUserDetails()
      socket.emit('loggedIn', user.value)
    } catch (error) {
      clearUser()
      throw error
    }
  }

  async function logout() {
    try {
      await axios.post('auth/logout')
      socket.emit('loggedIn', user.value)
      clearUser()
      return true
    } catch (error) {
      return false
    }
  }

  async function changePassword(passwords) {
    if (!user.value.id) throw 'Invalid User'
    try {
      if (userType.value === 'V') {
        await axios.patch(`/vcards/${user.value.id}/password`, passwords)
        return true
      } else if (userType.value === 'A') {
        await axios.patch(`/users/${user.value.id}/password`, passwords)
        return true
      }
    } catch (error) {
      throw error
    }
  }

  async function changeConfirmationCode(codes) {
    if (!user.value.id) throw 'Invalid User'
    try {
      await axios.patch(`/vcards/${user.value.id}/confirmation_code`, codes)
      return true
    } catch (error) {
      throw error
    }
  }

  async function restoreToken() {
    let storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken
      await loadUser()
      socket.emit('loggedIn', user.value)
      return true
    }
    clearUser()
    return false
  }

  function getUserImgUrl(photo_url) {
    return photo_url ? serverBaseUrl + storagePath + photo_url : avatarNoneUrl
  }

  socket.on('userRegistered', (user) => {
    if (userType.value == 'A') {
      if (user.user_type == 'A') toast.info(`Admin ${user.name} has been created!`)
      else toast.info(`User ${user.name} has been created!`)
    }
  })

  socket.on('you_are_blocked', (message) => {
    if (userType.value == 'V') {
      toast.error(message)
      clearUser()
      router.push({ name: 'Login' })
    }
  })

  socket.on('user_blocked', (message) => {
    if (userType.value == 'A') {
      toast.info(message)
    }
  })

  return {
    user,
    userId,
    userName,
    userType,
    userPhotoUrl,
    loadUser,
    clearUser,
    login,
    logout,
    restoreToken,
    changePassword,
    loadUserDetails,
    userDetails,
    changeConfirmationCode,
    getUserImgUrl
  }
})
