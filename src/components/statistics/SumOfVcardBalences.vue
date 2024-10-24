<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';

const sumOfVcardBalences = ref();


onMounted(async () => {
    try {
        const response = await axios.get(`statistics/sumOfVcardBalences`);
        sumOfVcardBalences.value = response.data;
    } catch (error) {
        console.error('Error fetching last transactions:', error);
    }
});


</script>

<template>
    <div class="flex-col flex w-full">
        <div class="rounded shadow w-1/3 h-24 mb-5 row">
            <span class="font-bold text-gray-400 text-2xl ml-2 mt-2">Total sum of all vcards balances:</span>
            <span class="font-bold text-black text-3xl ml-2 ">{{ sumOfVcardBalences }}€</span>
        </div>
    </div>
</template>