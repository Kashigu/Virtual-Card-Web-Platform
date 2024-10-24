<script setup>
import axios from 'axios';
import { computed, ref, onMounted, watch, reactive } from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { useToast } from "vue-toastification"
import { useCategoryStore } from '../../stores/categories.js'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
const categoryStore = useCategoryStore()

const props = defineProps({
    id: {
        type: Number,
        default: null
    }
})

let categoryToSave = ref({
    name: '',
    type: ''
})

async function save(c) {
    try {
        const response = await categoryStore.addDefaultCategory(c.name, c.type)
        //console.log(response)
        toast.success('Default Category ' + c.name + ' was created successfully!')
    } catch (error) {
        const t = c.type == 'C' ? 'Credit' : 'Debit'
        console.error(error)
        if (error.response.status === 409) toast.error(t + " Default Category " + c.name + ' already exists!')
        else toast.error("Unknown error while saving category")

    }
}

</script>

<template>
    <div class="flex flex-col w-full">
        <div>
            <div class="text-3xl font-bold mt-8 mb-4 text-center">
                Add Default Category
            </div>

            <div class="flex flex-row gap-2 mb-4">
                <div class="font-semibold">Name:</div>
                <input type="text" v-model="categoryToSave.name" class=" border-2 border-black rounded-full outline-none px-3" />
            </div>
            <div class="flex flex-row gap-2 mb-4">
                <div class="font-semibold">Type of Transactions:</div>
                <select v-model="categoryToSave.type" class="border-2 border-black rounded-md outline-none">
                    <option value="D">Debit</option>
                    <option value="C">Credit</option>
                </select>
            </div>

            <div class="flex flex-row gap-8">
                <div @click="save(categoryToSave)" class="cursor-pointer bg-blue-500 w-fit py-2 px-4 shadow font-semibold text-white rounded-full select-none justify-center flex items-center gap-2"><i class="fas fa-save text-white"></i>Save</div>
            </div>

        </div>
    </div>
</template>