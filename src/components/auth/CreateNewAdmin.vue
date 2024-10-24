<script setup>
import axios from 'axios'
import { ref, inject } from "vue";
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useUserStore } from '../../stores/user.js'
import { useToast } from "vue-toastification"
import { useRouter, onBeforeRouteLeave } from 'vue-router'
const socket = inject('socket')
const serverBaseUrl = inject("serverBaseUrl");
const userStore = useUserStore()
const router = useRouter()
const toast = useToast()

const errors = ref(null)

const newAdmin = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  user_type: 'A',
  photo_url: null,
})

const save = async (adminAux) => {
  errors.value = null
  try {
    const response = await axios.post('/users', adminAux)
    toast.success('Admin ' + adminAux.name + ' was registered successfully.')
    socket.emit('userRegistered', adminAux)
    router.push({ name: 'Home' })
  } catch (error) {
    console.error(error)
    if (error.response.status == 422) {
      errors.value = error.response.data.errors
      toast.error('User was not registered due to validation errors!')
    } else {
      toast.error('User was not registered due to unknown server error!')
    }
  }
}

const cancel = () => {
  router.back()
}

</script>

<template>
  <form class="row g-3 needs-validation w-full" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">Register New Admin</h3>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <div class="w-75 pe-4">
        <div class="mb-3">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" :class="{ 'is-invalid': errors ? errors['name'] : false }" id="inputName" placeholder="User Name" required v-model="newAdmin.name" />
          <field-error-message :errors="errors" fieldName="name"></field-error-message>
        </div>

        <div class="mb-3 px-1">
          <label for="inputEmail" class="form-label">Email</label>
          <input type="email" class="form-control" :class="{ 'is-invalid': errors ? errors['email'] : false }" id="inputEmail" placeholder="Email" required v-model="newAdmin.email" />
          <field-error-message :errors="errors" fieldName="email"></field-error-message>
        </div>
        <div class="mb-3">
          <label for="inputPassword" class="form-label">Password</label>
          <input type="password" class="form-control" :class="{ 'is-invalid': errors ? errors['password'] : false }" id="inputPassword" placeholder="Password" v-model="newAdmin.password" />
          <field-error-message :errors="errors" fieldName="password"></field-error-message>
        </div>
        <div class="mb-3">
          <label for="inputPasswordConfirmation" class="form-label">Password Confirmation</label>
          <input type="password" class="form-control" :class="{ 'is-invalid': errors ? errors['password_confirmation'] : false }" id="inputPasswordConfirmation" placeholder="Password Confirmation" v-model="newAdmin.password_confirmation" />
          <field-error-message :errors="errors" fieldName="password_confirmation"></field-error-message>
        </div>
      </div>
    </div>
    <hr />
    <div class="mt-2 d-flex justify-content-end">
      <button type="button" class="btn btn-primary px-5 mx-2" @click="save(newAdmin)">Save</button>
      <button type="button" class="btn btn-light px-5 mx-2" @click="cancel">Cancel</button>
    </div>

  </form>
  <input type="file" class="hidden" id="inputPhoto" ref="inputPhotoFile" @change="changePhotoFile" />
</template>

<style scoped>
.total_hours {
  width: 26rem;
}
</style>
