<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/user.js';
import axios from 'axios';

const userStore = useUserStore();
const lastTransactions = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get(`/statistics/${userStore.userId}/lastTransactions`);
    lastTransactions.value = response.data;
  } catch (error) {
    console.error('Error fetching last transactions:', error);
  }
});
</script>


<template>
  <div class="relative overflow-x-auto">
    <span class="text-black text-2xl font-bold justify-center">Last movements:</span>
    <table class="w-full table-auto text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">
            To
          </th>
          <th scope="col" class="px-6 py-3">
            Payment Type
          </th>
          <th scope="col" class="px-6 py-3">
            Value
          </th>
          <th scope="col" class="px-6 py-3">
            Date
          </th>
          <!-- Add additional columns as needed -->
        </tr>
      </thead>
      <tbody>
        <tr :class="transaction.type === 'C' ? 'bg-green-100' : 'bg-orange-100'" v-for="transaction in lastTransactions"
          :key="transaction.id" class="border-b  dark:border-gray-700">
          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
            {{ transaction.vcard_name }}
          </td>
          <td class="px-6 py-4 font-medium text-gray-900">
            {{ transaction.payment_type }}
          </td>
          <td v-if="transaction.type === 'C'" class="px-6 py-4 font-bold text-green-500">
            +{{ transaction.value }}€
          </td>
          <td v-else-if="transaction.type === 'D'" class="px-6 py-4 font-bold text-red-500">
            -{{ transaction.value }}€
          </td>

          <td class="px-6 py-4 font-medium text-gray-900">
            {{ transaction.date }}
          </td>
        </tr>


      </tbody>
    </table>
  </div>
</template>