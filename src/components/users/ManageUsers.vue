<script setup>
import { onMounted, ref, inject } from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import Paginator from '../global/Paginator.vue'
import { useToast } from "vue-toastification"
import { useRouter } from 'vue-router'
import axios from 'axios';
import { useUserStore } from '../../stores/user.js'

const userStore = useUserStore()
const router = useRouter()
const toast = useToast()
const socket = inject('socket')
const props = defineProps({
    page: Number
});

let totalPages = ref(null)
let currentPage = ref(null)
let isLoading = ref(true)

let typeFilter = ref('')
let nameFilter = ref('')

let users = ref([])

socket.on('user_edited', (userEdited) => {

    if (users.value != null && users.value.length > 0) {
        users.value.map((u, index) => {
            if (u.id == userEdited.id) {
                users.value[index] = userEdited
                return
            }
        })
    }
})

socket.on('user_registered', () => {
    //ha chance de o novo user aparecer na pagina onde estamos
    reloadUsers(currentPage.value, false)
})

async function changeBlocked(user, newBlockedValue) {
    try {
        user.canBlock = false
        const response = await axios.put('/vcards/' + user.id, { blocked: newBlockedValue })
        if (newBlockedValue === true) socket.emit('user_blocked', user)
        users.value.map((u, index) => {
            if (u.id == user.id) {
                users.value[index] = user
                return
            }
        })
        await reloadUsers(props.page, false)
    } catch (error) {
        toast.error('Unknown server error')
        console.error(error)
    }
    user.canBlock = true
}
async function reloadUsers(pageNum, doesReload) {
    try {
        if (doesReload) isLoading.value = true
        let url = '/authUsers?page=' + pageNum
        if (typeFilter.value !== '') url += '&type=' + typeFilter.value
        if (nameFilter.value !== '') url += '&name=' + nameFilter.value
        const response = await axios.get(url)
        //console.log(response)
        users.value = response.data.data
        users.value.map((u) => {
            u.canBlock = true
        })
        totalPages.value = response.data.meta.last_page
        currentPage.value = response.data.meta.current_page
    } catch (error) {
        toast.error('Unknown server error')
        console.error(error)
    }
    isLoading.value = false
}
onMounted(async () => {
    try {
        await reloadUsers(props.page, true)
    } catch (error) {
        console.error(error)
    }
})
</script>
<template>
    <div class="flex flex-col w-full">
        <div class="text-3xl font-bold mt-8 mb-4 text-center">Manage Users</div>
        <div v-if="isLoading === false">
            <div class="flex gap-8 mb-4">
                <div>
                    <div class="font-semibold">Name:</div>
                    <input type="text" class="border-2 border-black rounded-md outline-none pl-1" v-model="nameFilter" />
                </div>
                <div>
                    <div class="font-semibold">Type:</div>
                    <select v-model="typeFilter" class="border-2 border-black rounded-md outline-none">
                        <option value="">Admin/Vcard</option>
                        <option value="A">Admin</option>
                        <option value="V">Vcard</option>
                    </select>
                </div>
                <div class="ml-auto gap-4 flex flex-row">
                    <div @click="router.push({ name: 'CreateNewAdmin' });" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full justify-center flex items-center select-none cursor-pointer">
                        <i class="fas fa-add text-white"></i>
                        <div class="w-fit">Create New Admin</div>
                    </div>
                    <div @click="reloadUsers(1, true); router.push({ name: 'ManageUsers', query: { page: 1 } });" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full justify-center flex items-center select-none cursor-pointer">
                        <i class="fas fa-search text-white"></i>
                        <div class="w-fit">Search</div>
                    </div>
                </div>

            </div>
            <div v-if="users.length == 0">No users</div>
            <div v-else v-for="user in users" class="flex w-full py-4 px-4 shadow-sm mb-4 bg-slate-200">
                <div class="mr-auto flex flex-row gap-3 items-center">
                    <div class="flex flex-col gap-3">
                        <i :class="user.user_type == 'A' ? 'fa-user-shield' : 'fa-user'" class="fas fa-2x text-black"></i>
                        <i v-show="user.blocked" class="fas fa-2x fa-lock text-black"></i>
                    </div>

                    <img class="rounded-full h-20 w-20" :src="userStore.getUserImgUrl(user?.photo_url)" />
                    <div class="font-semibold">{{ user.name }}</div>
                </div>
                <div class="flex w-fit ml-auto gap-2 items-center">
                    <router-link :to="{ name: 'User', params: { id: user.id } }" class="py-2 h-fit px-4 bg-yellow-500 font-semibold shadow text-white rounded-full select-none ml-auto justify-center flex items-center gap-2"><i class="fas fa-edit text-white"></i>Edit</router-link>
                    <div v-show="user.user_type == 'V'" @click="user.canBlock ? changeBlocked(user, !user.blocked) : null" :class="user.canBlock ? 'bg-red-500 cursor-pointer' : 'bg-red-300'" class=" py-2 h-fit px-4 font-semibold shadow text-white rounded-full select-none ml-auto justify-center flex items-center gap-2 "><i :class="user.blocked ? 'fa-unlock' : 'fa-lock'" class="fas text-white"></i>{{ user.blocked ? 'Unblock' : 'Block' }}</div>
                </div>
            </div>
            <Paginator :totalPages="totalPages" :currentPage="currentPage" :pageName="'ManageUsers'" :reloadFunction="reloadUsers" />
        </div>
        <div v-else class="w-full flex justify-center mt-12">
            <PulseLoader />
        </div>
    </div>
</template>