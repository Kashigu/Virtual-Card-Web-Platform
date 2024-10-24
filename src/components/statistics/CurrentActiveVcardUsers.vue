<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';

const activeVcards = ref();


onMounted(async () => {
    try {
        const response = await axios.get(`/statistics/currentVcards`);
        activeVcards.value = response.data;
    } catch (error) {
        console.error('Error fetching last transactions:', error);
    }
});


</script>

<template>
    <div class="flex-col flex w-full">
        <div class="rounded shadow w-1/4 h-24 mb-5 row">
            <span class="font-bold text-gray-400 text-2xl ml-2 mt-2">Number of Active Vcards: </span>
            <span class="font-bold text-black-400 text-3xl ml-2 ">{{ activeVcards }}</span>
        </div>
    </div>
</template>