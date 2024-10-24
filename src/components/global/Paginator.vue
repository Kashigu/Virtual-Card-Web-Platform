<script setup>
import { useRouter } from 'vue-router';
import { ref, watchEffect, onMounted } from 'vue'
const props = defineProps({
    totalPages: Number,
    currentPage: Number,
    pageName: String,
    reloadFunction: Function
});

const router = useRouter();
let pagesRef = ref([])
const currentPage = ref(1);

watchEffect(() => {
    currentPage.value = parseInt(router.currentRoute.value.query.page) || 1;
});

function handlePages() {
    const numPagesToShow = 5;
    let pages = [];

    // Calculate the start and end page numbers
    let startPage = Math.max(1, props.currentPage - Math.floor(numPagesToShow / 2));
    let endPage = startPage + numPagesToShow - 1;

    if (startPage === 1 && props.totalPages === 1) {
        pagesRef.value = [1]
        return
    }
    // Adjust the endPage if it exceeds the totalPages
    if (endPage > props.totalPages) {
        endPage = props.totalPages;

        startPage = Math.max(1, endPage - numPagesToShow + 1);
    }

    // Populate the pages array
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    //console.log(pages)
    pagesRef.value = pages
}

function changeToPage(page) {
    router.push({ name: props.pageName, query: { page: page } });
    props.reloadFunction(page, true)
}
onMounted(() => {
    handlePages()
})

</script>

<template>
    <div v-if="pagesRef.length > 1" class="w-full justify-center flex gap-3 my-8">
        <div v-for="page in pagesRef" @click="changeToPage(page)" :class="currentPage === page ? 'border-black' : 'border-gray-500'" class="bg-slate-50 w-10 h-10 flex justify-center items-center select-none cursor-pointer border" :key="page">{{ page }}</div>
    </div>
</template>
