<script setup>
import axios from 'axios'
import { useToast } from "vue-toastification"
import { useUserStore } from '../../stores/user.js'
import { ref, watch, onMounted, inject } from 'vue'
import UserDetail from "./UserDetail.vue"
import { useRouter, onBeforeRouteLeave } from 'vue-router'
const socket = inject('socket')

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const props = defineProps({
  id: {
    type: Number,
    default: null
  }
})

const newUser = () => {
  return {
    phone_number: null,
    name: '',
    email: '',
    photo_url: null,
    password: '',
    password_confirmation: '',
    confirmation_code: null,
  }
}

const user = ref(newUser())
const errors = ref(null)
const extraInfo = ref({})
const confirmationLeaveDialog = ref(null)
// String with the JSON representation after loading the project (new or edit)
let originalValueStr = ''

const inserting = (id) => !id || (id < 0)
const loadUser = async (id) => {
  originalValueStr = ''
  errors.value = null
  if (inserting(id)) {
    user.value = newUser()
  } else {
    try {

      const response = await axios.get('/authUsers/' + id)
      user.value = response.data.data
      originalValueStr = JSON.stringify(user.value)
      if (user.value.user_type == 'V') {
        await getextrainfo(response.data.data)
      }
    } catch (error) {
      
    }
  }
}

const getextrainfo = async (user) => {
  const response = await axios.get('/vcards/' + user.id + '/extraInfo')
  extraInfo.value = response.data
  
}


const save = async (userToSave) => {
  errors.value = null
  if (inserting(props.id)) {
    try {
      const response = await axios.post('/vcards', userToSave)
      user.value = response.data.data
      originalValueStr = JSON.stringify(user.value)
      socket.emit('userRegistered', user.value)
      toast.success('User ' + user.value.name + ' was registered successfully.')
      router.push({ name: 'Home' })
    } catch (error) {
      if (error.response.status == 422) {
        errors.value = error.response.data.errors
        toast.error('User was not registered due to validation errors!')
      } else {
        toast.error('User was not registered due to unknown server error!')
      }
    }
  } else {
    try {
      // Esta aqui é para atualizar o user Admin 
      if (user.value.user_type == 'A') {
        const response = await axios.put('/users/' + props.id, { name: userToSave.name, email: userToSave.email })
        user.value = response.data.data
        originalValueStr = JSON.stringify(user.value)
        toast.success('User #' + user.value.id + ' was updated successfully.')
        if (user.value.id == userStore.userId) {
          await userStore.loadUser()
        }
        socket.emit('user_edited', userToSave)
      }
      // Esta aqui é para atualizar o user Vcard 
      else {
        let obj = userStore.userType == 'A' ? { ...userToSave, max_debit: extraInfo.value.max_debit } : userToSave
        const response = await axios.put('/vcards/' + props.id, obj)
        user.value = response.data.data
        originalValueStr = JSON.stringify(user.value)
        toast.success('User #' + user.value.phone_number + ' was updated successfully.')
        if (user.value.phone_number == userStore.userId) {
          await userStore.loadUser()
        }
        socket.emit('user_edited', userToSave)
        router.back()
      }

    } catch (error) {
      
      if (error.response.status == 422) {

        errors.value = error.response.data.errors
        toast.error('User #' + props.id + ' was not updated due to validation errors!')
      } else {
        toast.error('User #' + props.id + ' was not updated due to unknown server error!')
      }
    }
  }
}

const cancel = () => {
  originalValueStr = JSON.stringify(user.value)
  router.back()
}

watch(
  () => props.id,
  (newValue) => {
    loadUser(newValue)
  },
  { immediate: true }
)

let nextCallBack = null
const leaveConfirmed = () => {
  if (nextCallBack) {
    nextCallBack()
  }
}

onBeforeRouteLeave((to, from, next) => {
  nextCallBack = null
  let newValueStr = JSON.stringify(user.value)
  if (originalValueStr != newValueStr) {
    // Some value has changed - only leave after confirmation
    nextCallBack = next
    confirmationLeaveDialog.value.show()
  } else {
    // No value has changed, so we can leave the component without confirming
    next()
  }
})


</script>

<template>
  <confirmation-dialog ref="confirmationLeaveDialog" confirmationBtn="Discard changes and leave" msg="Do you really want to leave? You have unsaved changes!" @confirmed="leaveConfirmed">
  </confirmation-dialog>

  <user-detail :user="user" :extrainfo="extraInfo" :errors="errors" :inserting="inserting(id)" @save="save" @cancel="cancel"></user-detail>
</template>
