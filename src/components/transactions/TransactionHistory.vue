<script setup>
import axios from 'axios';
import { computed, ref, onMounted, watch, inject } from 'vue';
import { useUserStore } from '../../stores/user.js'
import { useTransactionsStore } from '../../stores/transactions'
import { useToast } from "vue-toastification"
import Transaction from './Transaction.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import Paginator from '../global/Paginator.vue';
import { useRouter } from 'vue-router'
import { useCategoryStore } from '../../stores/categories'
const categoryStore = useCategoryStore()
const socket = inject('socket')
const router = useRouter()

const props = defineProps({
    page: Number
});

const toast = useToast();
const userStore = useUserStore();
const transactionStore = useTransactionsStore()
let totalPages = ref(null)
let currentPage = ref(null)
let isLoading = ref(true)

let dateStartFilter = ref('')
let dateFinishFilter = ref('')
let paymentTypeFilter = ref('')
let typeFilter = ref('')
let vcardFilter = ref('')

socket.on('received_transaction', () => {
    if (currentPage.value == 1) {
        reloadTransactions(1, false)
    }
})

async function reloadTransactions(pageNum, doesReload) {
    try {
        if (doesReload) isLoading.value = true
        let url = "/vcards/" + userStore.user.id + "/transactions?page=" + pageNum
        if (dateStartFilter.value !== '') url += '&date_start=' + dateStartFilter.value
        if (dateFinishFilter.value !== '') url += '&date_finish=' + dateFinishFilter.value
        if (typeFilter.value !== '') url += '&type=' + typeFilter.value
        if (paymentTypeFilter.value !== '') {
            url += '&payment_type=' + paymentTypeFilter.value
            if (paymentTypeFilter.value === 'VCARD') url += '&vcard=' + vcardFilter.value
        }

        const response = await axios.get(url)
        //console.log(response.data)
        transactionStore.setTransactions(response.data.transactions.data)
        totalPages.value = response.data.transactions.last_page
        currentPage.value = response.data.transactions.current_page
        isLoading.value = false

    }
    catch (err) {
        console.error(err)
        isLoading.value = false
        toast.error('Unknown Server Error')
    }
}


onMounted(async () => {
    try {
        isLoading.value = true
        await categoryStore.loadAllCategories()
        await reloadTransactions(props.page, true)

    }
    catch (error) {
        console.error(error)

    }
})
</script>

<template>
    <div class="flex flex-col w-full">
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
                <div class="font-semibold">Type:</div>
                <select v-model="typeFilter" class="border-2 border-black rounded-md outline-none">
                    <option value="">Credit/Debit</option>
                    <option value="C">Credit</option>
                    <option value="D">Debit</option>
                </select>
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
            <div class="ml-auto">
                <div @click="reloadTransactions(1, true); router.push({ name: 'TransactionHistory', query: { page: 1 } });" class="gap-2 py-2 px-4 bg-blue-600 shadow text-white rounded-full ml-auto justify-center flex items-center select-none cursor-pointer">
                    <i class="fas fa-search text-white"></i>
                    <div class="w-fit">Search</div>
                </div>
            </div>
        </div>
        <div v-if="isLoading === false">
            <div v-if="transactionStore?.transactions.length == 0">No transactions</div>
            <Transaction v-else v-for="(transaction) in transactionStore.transactions" :key="transaction.id" :transaction="transaction" />
            <Paginator :totalPages="totalPages" :currentPage="currentPage" :pageName="'TransactionHistory'" :reloadFunction="reloadTransactions" />
        </div>
        <div v-else class="w-full flex justify-center mt-12">
            <PulseLoader />
        </div>
    </div>
</template>