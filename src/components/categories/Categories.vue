<script setup>
import { useCategoryStore } from '../../stores/categories.js'
import { onMounted, ref } from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import Paginator from '../global/Paginator.vue'
import { useToast } from "vue-toastification"
import { useRouter } from 'vue-router'
const router = useRouter()
const toast = useToast()
const props = defineProps({
  page: Number
});

const categoryStore = useCategoryStore()

let totalPages = ref(null)
let currentPage = ref(null)
let isLoading = ref(true)

let typeFilter = ref('')
let nameFilter = ref('')
async function reloadCategories(pageNum) {
  try {
    isLoading.value = true
    const response = await categoryStore.loadCategoriesPaginate(pageNum, typeFilter.value, nameFilter.value)
    //console.log(response)
    totalPages.value = response.data.last_page
    currentPage.value = response.data.current_page
    isLoading.value = false
  }
  catch (error) {
    isLoading.value = false
    toast.error('Unknown server error')
    console.error(error)
  }
}

async function deleteCategory(category) {
  try {
    await categoryStore.deleteCategory(category)
    await reloadCategories(props.page)
    toast.success('Category ' + category.name + ' was deleted!')
  } catch (error) {
    console.error(error)
    toast.error('Category was not deleted due to an unknown error')
  }
}

onMounted(async () => {
  try {
    await reloadCategories(props.page)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="flex flex-col w-full">

    <div class="text-3xl font-bold mt-8 mb-4 text-center">Categories</div>
    <div v-if="isLoading === false">
      <div class="flex gap-8 mb-4">
        <div>
          <div class="font-semibold">Name:</div>
          <input type="text" class="border-2 border-black rounded-md outline-none pl-1" v-model="nameFilter" />
        </div>
        <div>
          <div class="font-semibold">Type:</div>
          <select v-model="typeFilter" class="border-2 border-black rounded-md outline-none">
            <option value="">Credit/Debit</option>
            <option value="C">Credit</option>
            <option value="D">Debit</option>
          </select>
        </div>
        <div @click="reloadCategories(1); router.push({ name: 'Categories', query: { page: 1 } })" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full ml-auto justify-center flex items-center select-none cursor-pointer">
          <i class="fas fa-search text-white"></i>
          <div class="w-fit">Search</div>
        </div>
        <div @click="router.push({ name: 'AddCategory' })" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full  justify-center flex items-center select-none cursor-pointer">
          <i class="fas fa-plus text-white"></i>
          <div class="w-fit">Add Category</div>
        </div>
      </div>
      <div v-if="categoryStore.categories.length == 0">No categories</div>
      <div v-else v-for="(category) in categoryStore.categories" :class="category.type === 'C' ? 'bg-green-100' : 'bg-orange-100'" class="flex w-full py-8 mb-4 mx-auto px-4" :key="category.id">

        <div class="flex w-80">
          <div class="font-bold mr-2">Name:</div>
          <div>{{ category.name }}</div>
        </div>
        <div class="flex w-40">
          <div class="font-bold mr-2">Type:</div>
          <div>{{ category.type === 'D' ? 'Debit' : category.type === 'C' ? 'Credit' : 'Error' }}</div>
        </div>
        <div class="flex w-fit ml-auto gap-2">
          <router-link :to="{ name: 'Category', params: { id: category.id } }" class="py-2 px-4 bg-black shadow font-semibold text-white rounded-full ml-auto select-none justify-center flex items-center gap-2"><i class="fas fa-eye text-white"></i>View</router-link>
          <router-link :to="{ name: 'EditCategory', params: { id: category.id } }" class="py-2 px-4 bg-yellow-500 font-semibold shadow text-white rounded-full select-none ml-auto justify-center flex items-center gap-2"><i class="fas fa-edit text-white"></i>Edit</router-link>
          <div @click="deleteCategory(category)" class="py-2 px-4 bg-red-500 shadow text-white font-semibold rounded-full ml-auto justify-center flex items-center gap-2 select-none cursor-pointer"><i class="fas fa-trash text-white"></i>Delete</div>
        </div>
      </div>
      <Paginator :totalPages="totalPages" :currentPage="currentPage" :pageName="'Categories'" :reloadFunction="reloadCategories" />
    </div>

    <div v-else class="w-full flex justify-center mt-12">
      <PulseLoader />
    </div>
  </div>
</template>

  