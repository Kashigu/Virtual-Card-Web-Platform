<script setup>
import { useToast } from 'vue-toastification';
import { useTransactionsStore } from '../../stores/transactions'
import { useCategoryStore } from '../../stores/categories'
import axios from 'axios';
import { ref, onMounted } from 'vue'
const toast = useToast()

const transactionStore = useTransactionsStore()
const categoryStore = useCategoryStore()


const props = defineProps({
    transaction: {
        type: Object,
        required: true
    }
})

function openDetails(id) {
    const transaction = transactionStore.transactions.find((t) => t.id === id)
    if (transaction == null) return

    transaction.areDetailsOpened = !transaction.areDetailsOpened
}

function handleChangeDescription(transaction) {
    const maxDescriptionLength = 255;

    // Change the input value
    transaction.description = transaction.description.slice(0, maxDescriptionLength);

    checkIsEditing(transaction)
}

function checkIsEditing(transaction) {
    transaction.isEditing = (transaction.initial_description !== transaction.description) || (transaction.initial_category_id !== transaction.category_id);
}

async function saveTransactionChanges(transaction) {
    try {
        const response = await axios.put('/transactions/' + transaction.id, { category_id: transaction.category_id, description: transaction.description })
        toast.success("Transaction was saved successfully!")
    } catch (error) {
        console.error(error)
        toast.error("Transaction was not saved due to an unknown server error!")
    }
}

</script>

<template>
    <div class="w-full mb-4 mx-auto ">
        <div :class="transaction.type === 'C' ? 'bg-green-100' : 'bg-orange-100'" class="flex w-full py-8 cursor-pointer px-4 shadow-sm" @click="openDetails(transaction.id)">
            <div class="mr-auto flex items-center">
                <div class="w-fit flex mr-20">
                    <div v-if="transaction.type === 'C'" class="text-green-600 font-bold text-3xl">
                        +{{ transaction.value }}€
                    </div>
                    <div v-else-if="transaction.type === 'D'" class="text-red-600 font-bold text-3xl">
                        -{{ transaction.value }}€
                    </div>
                </div>
                <div v-show="transaction.description != null" class="flex justify-center">
                    <div v-if="transaction.description?.length > 32" :class="transaction.type === 'C' ? 'text-green-800' : 'text-orange-800'" class=" opacity-50">
                        {{ '"' + transaction.description.slice(0, 29) + '..."' }}
                    </div>
                    <div v-else :class="transaction.type === 'C' ? 'text-green-800' : 'text-orange-800'" class=" opacity-50">
                        {{ '"' + transaction.description + '"' }}
                    </div>
                </div>
            </div>
            <div class="ml-auto flex items-center">
                <div class="w-60 flex justify-center">
                    <div>
                        <span class="font-bold">Date:</span> {{ transaction.date }}
                    </div>
                </div>
                <div class="w-40 flex justify-center mr-8">
                    <div>
                        <span class="font-bold">Time:</span> {{ transaction.time }}
                    </div>
                </div>
                <div class="ml-auto flex items-center pr-2">
                    <i v-if="transaction.areDetailsOpened === true" class="fas fa-chevron-up "></i>
                    <i v-else class="fas fa-chevron-down"></i>
                </div>
            </div>


        </div>
        <div v-show="transaction.areDetailsOpened === true" class="w-full py-8  px-4 flex" :class="transaction.type === 'C' ? 'bg-green-200' : 'bg-orange-200'">
            <div class="w-2/3 pr-4 flex flex-col">
                <div class="font-bold">Description:</div>
                <textarea @input="handleChangeDescription(transaction)" v-model="transaction.description" type="text" placeholder="No description" class="mt-2 w-2/3" style="resize: none;" rows="4" />
            </div>
            <div class="w-1/3 ml-auto pr-2">
                <div class="flex gap-1 ">
                    <div class="font-bold">Balance Change:</div>
                    <div>{{ transaction.old_balance + '€ -> ' + transaction.new_balance + '€' }}</div>
                </div>
                <div class="flex gap-1 mt-2">
                    <div class="font-bold">Payment Reference:</div>
                    <div>{{ transaction.ref }}</div>
                </div>
                <div class="flex gap-1 mt-2">
                    <div class="font-bold">Payment Type:</div>
                    <div>{{ transaction.payment_type }}</div>
                </div>
                <div class="flex gap-1 mt-2">
                    <div class="font-bold">Category:</div>
                    <select @change="checkIsEditing(transaction)" v-model="transaction.category_id" class="border-2 border-black rounded-md outline-none w-2/3">
                        <option v-for="category in categoryStore.getCategoriesByType(transaction.type)" :value="category.id">{{ category.name }}</option>
                    </select>
                </div>
                <div v-show="transaction.payment_type === 'VCARD'" class="mt-2">
                    <div v-if="transaction.type === 'C'" class="flex gap-1">
                        <div class="font-bold">Sender:</div>
                        <div>{{ transaction.pair_vcard }}</div>
                    </div>
                    <div v-else class="flex gap-1">
                        <div class="font-bold">Sent to:</div>
                        <div>{{ transaction.pair_vcard }}</div>
                    </div>
                </div>
                <div v-show="transaction.isEditing === true">
                    <div @click="saveTransactionChanges(transaction)" class="bg-blue-700 shadow-sm px-4 py-2 text-white rounded-full w-fit mt-4 text-sm font-semibold cursor-pointer">Save Changes</div>
                </div>
            </div>
        </div>

    </div>
</template>
