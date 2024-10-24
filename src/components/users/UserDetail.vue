<script setup>
import axios from 'axios'
import { useToast } from "vue-toastification"
import { ref, watch, computed, inject,onMounted } from "vue";
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useUserStore } from '../../stores/user.js'
import { useRouter } from 'vue-router'

const serverBaseUrl = inject("serverBaseUrl");
const userStore = useUserStore()
const router = useRouter()

const toast = useToast()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  inserting: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    required: false,
  },
  extrainfo: {
    type: Object,
    required: false,
  },
});

const credentials = ref({
  current_confirmation_code: '',
  current_password: ''
})


const emit = defineEmits(["save", "cancel"]);

const editingUser = ref(props.user)
const errors = ref(null)
const inputPhotoFile = ref(null)
const editingImageAsBase64 = ref(null)
const deletePhotoOnTheServer = ref(false)

watch(
  () => props.user,
  (newUser) => {
    editingUser.value = newUser
  },
  { immediate: true }
)

const photoFullUrl = computed(() => {
  if (deletePhotoOnTheServer.value) {
    return avatarNoneUrl
  }
  if (editingImageAsBase64.value) {
    return editingImageAsBase64.value
  } else {
    return editingUser.value.photo_url
      ? serverBaseUrl + "/storage/fotos/" + editingUser.value.photo_url
      : avatarNoneUrl
  }
})

const userTitle = computed(() => {
  if (!editingUser.value) {
    return ''
  }
  return props.inserting ? 'Register a new User' : 'User ' + editingUser.value.id
})

const save = () => {
  const userToSave = editingUser.value
  userToSave.deletePhotoOnServer = deletePhotoOnTheServer.value
  userToSave.base64ImagePhoto = editingImageAsBase64.value
  emit("save", userToSave);
}

const cancel = () => {
  emit("cancel", editingUser.value);
}

const apagar = async (userStore) => {
  errors.value = null;
  try {
    let url = editingUser.value.user_type == 'A' ? '/users/' + editingUser.value.id : '/vcards/' + editingUser.value.id
    const deleteData =
    editingUser.value.user_type != 'A'
      ? {
          data: {
            password: credentials.value.current_password,
            confirmation_code: credentials.value.current_confirmation_code,
          },
        }
      : {};

    await axios.delete(url, deleteData);
    let name = editingUser.value.user_type == 'A' ? 'Admin' : 'User'
    if(editingUser.value.id == userStore.user.id)
    {
        //delete a si mesmo
        toast.success(name +' '+ userStore.userId + ' was deleted successfully.');
        userStore.clearUser()
        router.push({ name: "Login" });
    }
    else
    {
        toast.success(name +' '+ editingUser.value.id + ' was deleted successfully.');
        router.back()
    }
  } catch (error) {
    if (error.response.status == 400) {
      errors.value = error.response.data.errors;
      toast.error('User was not deleted due to non-zero balance!');
    } else {
      toast.error('User was not deleted due to incorrect credentials!');
    }
  }
};



// When changing the photo file, change the editingImageAsBase64.value
const changePhotoFile = () => {
  try {
    const file = inputPhotoFile.value.files[0]
    if (!file) {
      editingImageAsBase64.value = null
    } else {
      const reader = new FileReader()
      reader.addEventListener(
        'load',
        () => {
          // convert image file to base64 string
          editingImageAsBase64.value = reader.result
          deletePhotoOnTheServer.value = false
        },
        false,
      )
      if (file) {
        reader.readAsDataURL(file)
      }
    }
  } catch (error) {
    editingImageAsBase64.value = null
  }
}

const cleanPhoto = () => {
  deletePhotoOnTheServer.value = true
}

/*onMounted(async () => {
    try {
        await extrainfo()
    } catch (error) {
        console.error(error)
    }
})
*/

</script>

<template>
  <form class="row g-3 needs-validation w-full" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">{{ userTitle }}</h3>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <div class="w-75 pe-4">
        <div class="mb-3" v-if="inserting || editingUser.user_type == 'V'">
          <label for="inputName" class="form-label">Phone Number</label>
          <input v-if="inserting" :disabled="!inserting" type="text" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['phone_number'] : false }" id="inputNumero" placeholder="Phone Number" required v-model="editingUser.phone_number" />
          <input v-else :disabled="!inserting" type="text" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['phone_number'] : false }" id="inputNumero" placeholder="Phone Number" required v-model="editingUser.id" />
          <field-error-message :errors="props.errors" fieldName="phone_number"></field-error-message>
        </div>
        <div class="mb-3">
          <label for="inputName" class="form-label">Name</label>
          <input :disabled="!inserting && userStore.user.id != props.user.id" type="text" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['name'] : false }" id="inputName" placeholder="User Name" required v-model="editingUser.name" />
          <field-error-message :errors="props.errors" fieldName="name"></field-error-message>
        </div>
        <div class="mb-3 px-1">
          <label for="inputEmail" class="form-label">Email</label>
          <input :disabled="!inserting && userStore.user.id != props.user.id" type="email" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['email'] : false }" id="inputEmail" placeholder="Email" required v-model="editingUser.email" />
          <field-error-message :errors="props.errors" fieldName="email"></field-error-message>
        </div>
        <div class="mb-3" v-if="!inserting && userStore.user.id == props.user.id && userStore.userType == 'V'">
          <label class="form-label">To Delete the Account insert the credentials</label>
        </div>
        <div class="mb-3" v-if="inserting || userStore.user.id == props.user.id && userStore.userType == 'V'">
          <label for="inputPassword" class="form-label">Password</label>
          <input v-if="inserting" type="password" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['password'] : false }" id="inputPassword" placeholder="Password" v-model="editingUser.password" />
          <input v-else-if="userStore.user.id == props.user.id " type="password" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['password'] : false }" id="inputCurrentPassword" placeholder="Password" v-model="credentials.current_password" />
          <field-error-message :errors="props.errors"  fieldName="password"></field-error-message>
        </div>
        <div class="mb-3" v-if="inserting">
          <label for="inputPasswordConfirmation" class="form-label">Password Confirmation</label>
          <input type="password" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['password_confirmation'] : false }" id="inputPasswordConfirmation" placeholder="Password Confirmation" v-model="editingUser.password_confirmation" />
          <field-error-message :errors="props.errors" fieldName="password_confirmation"></field-error-message>
        </div>
        <div class="mb-3" v-if="inserting || userStore.user.id == props.user.id && userStore.userType == 'V'">
          <label for="inputPasswordConfirmation" class="form-label">Pin</label>
          <input v-if="inserting" type="password" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['confirmation_code'] : false }" id="inputConfirmation_code" placeholder="Pin" v-model="editingUser.confirmation_code" />
          <input v-else-if="userStore.user.id == props.user.id" type="password" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['confirmation_code'] : false }" id="inputCurrentConfirmationCode" placeholder="Pin" v-model="credentials.current_confirmation_code" />
          <field-error-message :errors="props.errors" fieldName="confirmation_code"></field-error-message>
        </div>
        <div class="mb-3" v-if="userStore.userType == 'A' && editingUser.user_type == 'V'">
          <label for="inputPasswordConfirmation" class="form-label">Balance</label>
          <input disabled type="text" class="form-control" id="inputBalance" placeholder="Balance" v-model="props.extrainfo.balance" />  
        </div>
        <div class="mb-3" v-if="userStore.userType == 'A' && editingUser.user_type == 'V'">
          <label for="inputPasswordConfirmation" class="form-label">Max_Debit</label>
          <input type="text" class="form-control" :class="{ 'is-invalid': props.errors ? props.errors['max_debit'] : false }" id="inputMax_debit" placeholder="Max Debit" v-model="props.extrainfo.max_debit" />
          <field-error-message :errors="props.errors" fieldName="max_debit"></field-error-message>
         </div>
      </div>
      <div v-if="editingUser.user_type != 'A' " class="w-25">
        <div class="d-flex flex-column">
          <label class="form-label">Photo</label>
          <div class="form-control text-center">
            <img :src="photoFullUrl" class="w-100" />
          </div>
          <div v-if="userStore.userType=='V' || inserting" class="mt-3 d-flex justify-content-between flex-wrap">
            <label  for="inputPhoto" class="btn btn-dark flex-grow-1 mx-1">Load</label>
            <button class="btn btn-danger flex-grow-1 mx-1" @click.prevent="cleanPhoto" v-show="editingUser.photo_url || editingImageAsBase64">Delete</button>
          </div>
          <div>
            <field-error-message :errors="props.errors" fieldName="base64ImagePhoto"></field-error-message>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="d-flex justify-content-between">
      <div>
        <button v-if="!inserting" type="button" class="bg-red-500 rounded-full text-white py-2 px-5" @click="apagar(userStore)">Delete Account</button>
      </div>
      <div>
        <button type="button" class="bg-blue-500 rounded-full text-white py-2 px-5" @click="save">Save</button>
        <button type="button" class="bg-zinc-500 rounded-full text-white py-2 px-5" @click="cancel">Cancel</button>
      </div>
    </div>

  </form>
  <input type="file" class="hidden" id="inputPhoto" ref="inputPhotoFile" @change="changePhotoFile" />
</template>

<style scoped>
.total_hours {
  width: 26rem;
}
</style>
