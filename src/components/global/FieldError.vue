<script setup>

defineProps({
    errorMessage: {
        type: String,
    }
})
</script>

<template>
    <div v-show="errorMessage" class="text-red-600 font-normal text-xs mt-1">
        {{ errorMessage }}
    </div>
</template>