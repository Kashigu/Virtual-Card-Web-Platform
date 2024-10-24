<script setup>
import { useToast } from "vue-toastification"
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'
import { ref, onMounted } from 'vue'

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const codes = ref({
  current_confirmation_code: '',
  code: '',
  confirmation_code: '',
  phone_number: userStore.userId
})

const errors = ref(null)

const emit = defineEmits(['changedConfirmationCode'])

const changeConfirmationCode = async () => {
  try {
    const result = await userStore.changeConfirmationCode(codes.value)
    emit('changedConfirmationCode')
    if (result) {
      toast.success('Confirmation Code has been changed.')
      router.back()
    }
  } catch (error) {
    if (error.response.status == 422) {
      errors.value = error.response.data.errors
      toast.error('Code has not been changed due to validation errors!')
    } else {
      toast.error('Code has not been changed due to unknown server error!')
    }
  }
}

let isLoadingUser = ref(true)
onMounted(async () => {
  await userStore.restoreToken()
  isLoadingUser.value = false
})


</script>

<template>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="changeConfirmationCode">
    <h3 class="mt-5 mb-3">Change Confirmation</h3>
    <hr>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputCurrentCode" class="form-label">Current Confirmation Code</label>
        <input type="password" class="form-control" :class="{ 'is-invalid': errors ? errors['current_confirmation_code'] : false }" id="inputCurrentCode" required v-model="codes.current_confirmation_code">
        <field-error-message :errors="errors" fieldName="current_confirmation_code"></field-error-message>
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputCode" class="form-label">New Confirmation Code</label>
        <input type="password" class="form-control" :class="{ 'is-invalid': errors ? errors['code'] : false }" id="inputCode" required v-model="codes.code">
        <field-error-message :errors="errors" fieldName="code"></field-error-message>
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputCodeConfirm" class="form-label">Repeat Confirmation Code</label>
        <input type="password" class="form-control" :class="{ 'is-invalid': errors ? errors['confirmation_code'] : false }" id="inputCodeConfirm" required v-model="codes.confirmation_code">
        <field-error-message :errors="errors" fieldName="confirmation_code"></field-error-message>
      </div>
    </div>
    <input type="hidden" class="form-control" :class="{ 'is-invalid': errors ? errors['phone_number'] : false }" id="inputNumero" placeholder="Phone Number" required v-model="codes.phone_number" />
    <div class="mb-3 d-flex justify-content-center">
      <button type="button" class="bg-blue-500 rounded-full text-white py-2 px-5" @click="changeConfirmationCode">Change Code Confirmation</button>
    </div>
  </form>
</template>

