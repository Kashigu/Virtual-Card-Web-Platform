<script setup>
import { useUserStore } from '../stores/user'
import { ref, onMounted } from 'vue'
import PieChart from '../components/charts/vcardPieChart/vcardPieChart.vue'
import BarChart from '../components/charts/vcardBarChart/vcardBarChart.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import lastTransactions from '../components/statistics/TabelaUltimasTransacoes.vue'
import ActiveVcards from '../components/statistics/CurrentActiveVcardUsers.vue'
import SumOfVcardBalences from '../components/statistics/SumOfVcardBalences.vue'
import TransByPtype from '../components/statistics/TotalTransactionsByPaymentType.vue'
import SumOfAllTransactions from '../components/statistics/SumOfAllTransactions.vue'
const userStore = useUserStore()
let isLoadingUserDetails = ref(true)

onMounted(async () => {
  try {
    await userStore.loadUserDetails()
  }
  catch (error) {
    console.error(error)
  }

  isLoadingUserDetails.value = false

});
</script>

<template>
  <div v-if="userStore.userType == 'V'">
    <div class="flex-col flex w-full">

      <div class="border-black justify-start ml-10 ">
        <div class="bg-green-100 rounded-lg shadow-md p-4 text-center mt-10 float-left h-20">
          <div class="text-black text-4xl mb-2 ">
            <span>Current Balance:&nbsp;<span>{{ userStore.userDetails?.balance }}€</span></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="userStore.user" class="flex-row flex justify-center h-1/2 mt-3">

      <div class=" px-4 m-4 border-2  border-gray-400 rounded-lg w-1/3 ">
        <span class="text-black text-3xl mb-2 justify-center ">Expenses by category (€):</span>
        <PieChart class=" m-2 mt-4 items-center h-96" />
      </div>

      <div class="m-4 border-2 px-4 border-gray-400 rounded-lg w-2/3">
        <span class="text-black text-3xl mb-2 justify-center">Expenses per month (€):</span>
        <BarChart class="m-2 mt-4 items-center h-72" />
      </div>

    </div>

    <div v-if="userStore.userType == 'V'" class="block h-full w-full m-2">

      <lastTransactions />
    </div>
  </div>

  <div v-else-if="userStore.userType == 'A'">
    <div class="flex-col flex w-full">

      <span class="text-3xl m-5 font-bold">Statistics:</span>
      <div class="ml-12">
        <ActiveVcards />
        <SumOfVcardBalences />
        <TransByPtype />
        <SumOfAllTransactions />
      </div>
    </div>
  </div>
</template>
  