<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';

const dataArray = ref([]);


onMounted(async () => {
    try {
        const response = await axios.get(`statistics/totalTransactionsByPaymentType`);
        dataArray.value = response.data;
    } catch (error) {
        console.error('Error fetching last transactions:', error);
    }
});


</script>

<template>
    <div class="row flex-col flex w-full">
        <div class="rounded shadow w-5/6 h-24 mb-5 justify-evenly">
            <span class="font-bold text-gray-400 text-2xl ml-4 mt-2 mb-4">Number of Transactions by Payment Type: </span>
            <p class="mt-2"><span v-for="value in dataArray" class="font-bold text-black-400 text-3xl ml-10 ">{{ value.payment_type  }}: {{value.total }}</span></p>
        </div>
    </div>
</template>