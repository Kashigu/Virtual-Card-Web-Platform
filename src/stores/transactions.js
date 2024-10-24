import axios from 'axios'
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useToast } from 'vue-toastification'

export const useTransactionsStore = defineStore('transactions', () => {
  // este ref so serve para evitar prop drilling em certos componentes na aplicaçao
  let transactions = ref(null)
  const userStore = useUserStore()
  const socket = inject('socket')
  const toast = useToast()

  function setTransactions(transactionsArray) {
    transactions.value = transactionsArray.map((t) => {
      let dateValues = t.date.split('-')
      let time = t.datetime.split(' ')
      return {
        id: t.id,
        category_id: t.category_id,
        initial_category_id: t.category_id,
        description: t.description,
        initial_description: t.description,
        pair_vcard: t.pair_vcard,
        new_balance: t.new_balance,
        old_balance: t.old_balance,
        ref: t.payment_reference,
        payment_type: t.payment_type,
        type: t.type,
        value: t.value,
        time: time[1],
        date: `${dateValues[2]}-${dateValues[1]}-${dateValues[0]}`,
        areDetailsOpened: false,
        isEditing: false
      }
    })
  }

  socket.on('received_transaction', (message) => {
    toast.info(message)
    userStore.loadUserDetails()
  })

  return {
    transactions,
    setTransactions
  }
})
