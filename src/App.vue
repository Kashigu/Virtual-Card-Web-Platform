<script setup>

import { RouterView } from 'vue-router'

import { useUserStore } from './stores/user'
import { RouterLink } from 'vue-router'
import { useToast } from "vue-toastification"

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

let isMenuOpened = ref(false)

function openMenu() {

  isMenuOpened.value = !isMenuOpened.value
}

const logout = async () => {
  try {
    await userStore.logout()
    toast.success('User has logged out of the application.')
    router.push({ name: 'Login' })

  } catch (error) {
    console.error(error)
    toast.error('There was a problem logging out of the application!')
  }
}

let isLoadingUser = ref(true)
onMounted(async () => {
  try {
    await userStore.restoreToken()
  }
  catch (error) {
    console.error(error)
  }

  isLoadingUser.value = false

});


</script>


<template>
  <nav class="h-20 w-full bg-black z-100 flex items-center pl-4 pr-12 sticky top-0">
    <router-link class="navbar-brand col-md-3 col-lg-2 me-0 px-3" :to="{ name: 'Home' }">
      <img src="@/assets/logoVcard.png" alt="" width="150" height="24" class="d-inline-block align-text-top">
    </router-link>
    <div class="ml-auto" v-show="isLoadingUser == false">
      <div v-if="userStore.user" @click="openMenu">
        <div>
          <div class="flex items-center cursor-pointer select-none">
            <img class="rounded-full w-14 h-14 z-100" :src="userStore.userPhotoUrl ? userStore.userPhotoUrl : '@/assets/logoVcard.png'" alt="avatar image">
            <div class="ml-4 mr-1 w-fit flex items-center text-white ">{{ userStore.userName }}</div>
            <i class="fas fa-angle-down text-gray-200 scale-75 pt-2 "></i>
          </div>
        </div>
        <div class="relative " v-show="isMenuOpened">
          <div class="bg-slate-700 w-52 absolute right-0 top-6 shadow flex flex-col  text-gray-100">
            <router-link class="px-3 no-underline text-gray-100 hover:bg-slate-800 py-3" :class="{ active: $route.name == 'User' && $route.params.id == userStore.userId }" :to="{ name: 'User', params: { id: userStore.userId } }">
              Profile
            </router-link>
            <router-link class="px-3 no-underline text-gray-100 hover:bg-slate-800 py-3" :class="{ active: $route.name === 'ChangePassword' }" :to="{ name: 'ChangePassword' }">
              Change password
            </router-link>
            <router-link v-if="userStore.userType == 'V'" class="px-3 no-underline text-gray-100 hover:bg-slate-800 py-3" :class="{ active: $route.name === 'ChangeConfirmationCode' }" :to="{ name: 'ChangeConfirmationCode' }">
              Change Confirmation Code
            </router-link>
            <a class="px-3 cursor-pointer select-none no-underline text-gray-100 hover:bg-slate-800 py-3" @click.prevent="logout">
              Logout
            </a>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-row gap-4 ml-auto">
        <router-link class="no-underline text-gray-100" :class="{ active: $route.name === 'Register' }" :to="{ name: 'Register' }">
          <i class="bi bi-person-check-fill"></i>
          Register
        </router-link>

        <router-link class="no-underline text-gray-100" :class="{ active: $route.name === 'Login' }" :to="{ name: 'Login' }">
          <i class="fas fa-sign-in-alt"></i>
          Login
        </router-link>

      </div>
    </div>
  </nav>


  <div class="flex flex-row ml-52">
    <div class="w-52 h-screen bg-gray-200 fixed left-0 top-0 z-10 shadow-sm mt-20 ">
      <div v-show="!isLoadingUser" class="flex flex-col">
        <router-link :to="{ name: 'Home' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'Home' }">
          <i class="fas fa-house text-black"></i>
          <div>Home</div>
        </router-link>

        <router-link :to="{ name: 'MakeTransaction' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'MakeTransaction' }">
          <i class="fas fa-paper-plane text-black"></i>
          <div>Send Money</div>
        </router-link>

        <router-link v-show="userStore.userType == 'V'" :to="{ name: 'Categories' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'Categories' }">
          <i class="fas fa-th text-black"></i>
          <div>Categories</div>
        </router-link>

        <router-link v-show="userStore.userType == 'A'" :to="{ name: 'DefaultCategories' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'DefaultCategories' }">
          <i class="fas fa-th text-black"></i>
          <div>Default Categories</div>
        </router-link>

        <router-link v-show="userStore.userType == 'A'" :to="{ name: 'ManageUsers' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'ManageUsers' }">
          <i class="fas fa-users text-black"></i>
          <div>Manage Users</div>
        </router-link>

        <router-link v-show="userStore.userType == 'V'" :to="{ name: 'TransactionHistory' }" class="px-4 py-6 hover:bg-gray-400 cursor-pointer select-none flex flex-row items-center gap-2" :class="{ 'font-bold': $route.name === 'TransactionHistory' }">
          <i class="fas fa-history text-black"></i>
          <div>Transaction History</div>
        </router-link>
      </div>

    </div>

    <div class="w-full px-8 h-full">
      <router-view></router-view>
    </div>

  </div>
</template>