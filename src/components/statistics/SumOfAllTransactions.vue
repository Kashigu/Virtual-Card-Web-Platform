<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";

const toast = useToast();
const dataArray = ref([]);
const isLoading = ref(true);
const totalSumOfTransactions = ref(0);
const dateStartFilter = ref('');
const dateFinishFilter = ref('');

async function reloadTransactions() {
    try {
        isLoading.value = true;
        let url = "/statistics/sumOfTransactionsByDate";

        if (dateStartFilter.value !== '') {
            url += `?date_start=${dateStartFilter.value}`;
        }

        if (dateFinishFilter.value !== '') {
            // Use & if there is already a query parameter
            url += `${dateStartFilter.value !== '' ? '&' : '?'}date_finish=${dateFinishFilter.value}`;
        }

        const response = await axios.get(url);
        totalSumOfTransactions.value = response.data.sum;

        isLoading.value = false;
    } catch (err) {
        console.error(err);
        isLoading.value = false;
        toast.error('Unknown Server Error');
    }
}

onMounted(async () => {
    try {
        await reloadTransactions();
    } catch (error) {
        console.error('Error fetching last transactions:', error);
    }
});
</script>



<template>
    <div class="row">
        <div class="rounded shadow w-1/2 h-80 mb-5 column flex">
            <div class="flex-1">
                <span class="font-bold text-gray-400 text-2xl ml-4 mt-2 mb-4">Sum of all transactions: </span>

                <div class="block ml-12 mt-12">
                    <div>
                        <div class="font-semibold">Since:</div>
                        <input type="date" v-model="dateStartFilter" class="border-2 border-black rounded-md outline-none">
                    </div>
                    <div>
                        <div class="font-semibold">Until:</div>
                        <input type="date" v-model="dateFinishFilter" class="border-2 border-black rounded-md outline-none">
                    </div>
                    <div class="w-1/3 mt-4">
                        <div @click="reloadTransactions(1)"
                            class="gap-2 py-2 px-4  bg-blue-600 hover:bg-blue-800 hover:font-bold text-white rounded-full ml-auto justify-center flex items-center select-none cursor-pointer">
                            <i class="fas fa-search text-white"></i>
                            <div class="w-fit">Search</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="float-left mr-32 mt-32">
                <span class="font-bold text-black-400 text-3xl ml-12">{{ totalSumOfTransactions }}€</span>
            </div>

        </div>
    </div>
</template>