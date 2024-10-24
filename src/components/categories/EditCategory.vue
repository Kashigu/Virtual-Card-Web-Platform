<script setup>
import axios from 'axios';
import { computed, ref, onMounted, watch, reactive } from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { useToast } from "vue-toastification"
import { useCategoryStore } from '../../stores/categories.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const categoryStore = useCategoryStore()
const toast = useToast()
const props = defineProps({
    id: {
        type: Number,
        default: null
    }
})

let category = ref(null)
let isLoading = ref(true)
let categoryToSave = ref(null)
let areThereChanges = ref(false)

function changesCategory(categoryAux) {
    if (category.value.name != categoryAux.name || category.value.type != categoryAux.type) {
        areThereChanges.value = true
        return
    }
    areThereChanges.value = false
}

async function save(categoryAux) {
    try {
        const response = await axios.put('/categories/' + props.id, { type: categoryAux.type, name: categoryAux.name })
        category.value = { ...response.data.data };
        categoryToSave.value = { ...response.data.data };
        areThereChanges.value = false
        toast.success('Category ' + response.data.data.name + ' has been changed!')
    } catch (error) {
        console.error(error)
        toast.error('Category ' + categoryAux.name + ' did not save due to an unknown server error!')
    }
}

async function deleteCategory(categoryAux) {
    try {
        await categoryStore.deleteCategory(categoryAux)
        router.push({ name: 'Categories' })
    } catch (error) {
        //console.error(error)
        toast.error('Category was not deleted due to an unknown error')
    }
}

onMounted(async () => {
    try {
        const response = await axios.get('/categories/' + props.id)
        //console.log(response.data.data)
        category.value = { ...response.data.data };
        categoryToSave.value = { ...response.data.data };

        isLoading.value = false
    } catch (error) {
        console.error(error)
    }
})
</script>

<template>
    <div class="flex flex-col w-full">
        <div v-if="!isLoading">
            <div class="text-3xl font-bold mt-8 mb-4 text-center">
                Edit Category
            </div>

            <div class="flex flex-row gap-2 mb-4">
                <div class="font-semibold">Name:</div>
                <input type="text" v-model="categoryToSave.name" @input="changesCategory(categoryToSave)" class=" border-2 border-black rounded-full outline-none px-3" />
            </div>
            <div class="flex flex-row gap-2 mb-4">
                <div class="font-semibold">Type of Transactions:</div>
                <select v-model="categoryToSave.type" @change="changesCategory(categoryToSave)" class="border-2 border-black rounded-md outline-none">
                    <option value="D">Debit</option>
                    <option value="C">Credit</option>
                </select>
            </div>

            <div class="flex flex-row gap-8">
                <div @click="areThereChanges ? save(categoryToSave) : null" :class="areThereChanges ? 'cursor-pointer bg-blue-500' : 'bg-blue-300'" class=" w-fit py-2 px-4 shadow font-semibold text-white rounded-full select-none justify-center flex items-center gap-2"><i class="fas fa-save text-white"></i>Save</div>
                <div @click="deleteCategory(category)" class="w-fit py-2 px-4 bg-red-500 shadow text-white font-semibold rounded-full justify-center flex items-center gap-2 select-none cursor-pointer"><i class="fas fa-trash text-white"></i>Delete</div>
            </div>

        </div>

        <div v-else class="w-full flex justify-center mt-12">
            <PulseLoader />
        </div>
    </div>
</template>