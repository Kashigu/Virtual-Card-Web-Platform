<script setup>
import axios from 'axios';
import { computed, ref, onMounted } from 'vue';
import Transaction from '../transactions/Transaction.vue'
import { useTransactionsStore } from '../../stores/transactions'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import Paginator from '../global/Paginator.vue';
import { useToast } from "vue-toastification"
const toast = useToast()

let isLoading = ref(true)
let category = ref(null)
let totalPages = ref(null)
let currentPage = ref(null)

let dateStartFilter = ref('')
let dateFinishFilter = ref('')
let paymentTypeFilter = ref('')
let vcardFilter = ref('')

const transactionStore = useTransactionsStore()


const props = defineProps({
    id: {
        type: Number,
        default: null
    },
    page: Number
})
const capitalizedCategoryName = computed(() => {
    if (category !== null && category.value?.name) {
        return category.value.name.charAt(0).toUpperCase() + category.value.name.slice(1);
    }
    return null;
});

async function reloadTransactions(pageNum) {
    try {
        isLoading.value = true
        let url = '/categories/' + props.id + '/transactions?page=' + pageNum
        if (dateStartFilter.value !== '') url += '&date_start=' + dateStartFilter.value
        if (dateFinishFilter.value !== '') url += '&date_finish=' + dateFinishFilter.value
        if (paymentTypeFilter.value !== '') {
            url += '&payment_type=' + paymentTypeFilter.value
            if (paymentTypeFilter.value === 'VCARD') url += '&vcard=' + vcardFilter.value
        }
        const response = await axios.get(url)
        //console.log(response.data)
        category.value = response.data.category
        transactionStore.setTransactions(response.data.transactions.data)
        totalPages.value = response.data.transactions.last_page
        currentPage.value = response.data.transactions.current_page
        isLoading.value = false
    } catch (err) {
        console.error(err)
        isLoading.value = false
        toast.error('Unknown Server Error')
    }
}


onMounted(async () => {
    try {
        await reloadTransactions(props.page)
    } catch (error) {
        console.error(error)
    }
})
</script>

<template>
    <div class="flex flex-col w-full">
        <div v-if="isLoading === false">
            <div class="text-3xl font-bold mt-8 mb-4 text-center">
                {{ capitalizedCategoryName }}
            </div>
            <div class="text-2xl font-bold mt-8 mb-4 text-left">
                Transactions:
            </div>
            <div class="flex gap-8 mb-4">
                <div>
                    <div class="font-semibold">Since:</div>
                    <input type="date" v-model="dateStartFilter" class="border-2 border-black rounded-md outline-none">
                </div>
                <div>
                    <div class="font-semibold">Until:</div>
                    <input type="date" v-model="dateFinishFilter" class="border-2 border-black rounded-md outline-none">
                </div>
                <div>
                    <div class="font-semibold">Payment Type:</div>
                    <select v-model="paymentTypeFilter" class="border-2 border-black rounded-md outline-none">
                        <option value="">All</option>
                        <option value="VCARD">VCARD</option>
                        <option value="MBWAY">MBWAY</option>
                        <option value="PAYPAL">PAYPAL</option>
                        <option value="IBAN">IBAN</option>
                        <option value="MB">MB</option>
                        <option value="VISA">VISA</option>
                    </select>
                </div>
                <div v-if="paymentTypeFilter == 'VCARD'">
                    <div class="font-semibold">Vcard:</div>
                    <input type="text" v-model="vcardFilter" class="border-2 border-black rounded-md outline-none" />
                </div>
                <div @click="reloadTransactions(props.page)" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full ml-auto justify-center flex items-center select-none cursor-pointer">
                    <i class="fas fa-search text-white"></i>
                    <div class="w-fit">Search</div>
                </div>
            </div>
            <div v-if="transactionStore?.transactions.length == 0">No transactions</div>
            <Transaction v-else v-for="(transaction) in transactionStore.transactions" :key="transaction.id" :transaction="transaction" />
            <Paginator :totalPages="totalPages" :currentPage="currentPage" :pageName="'Category'" :reloadFunction="reloadTransactions" />


        </div>
        <div v-else class="w-full flex justify-center mt-12">
            <PulseLoader />
        </div>
    </div>
</template>
  