<script setup>
import { ref, watch, onMounted, inject } from 'vue';
import { useUserStore } from '../../stores/user'
import FieldError from '../global/FieldError.vue'
import { useToast } from "vue-toastification"
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import axios from 'axios';

const userStore = useUserStore()
const socket = inject('socket')
const toast = useToast()
let amountField = ref('')
let phoneField = ref('')
let paymentTypeField = ref('')
let referenceField = ref('')
let confirmationCodeField = ref('')

let referencePlaceHolder = ref(userStore.userType == 'A' ? 'Please select your payment type' : 'Please select a destination')

let errors = ref({})

/* ERRORS
    phoneNumberError: '',
    amountError: '',
    paymentTypeError: '',
    refError: '',
*/

let isLoadingUserDetails = ref(true)

function hasMoreThanTwoDecimalPlaces(number) {
    const multiplied = number * 100;
    const floorOfMultiplied = Math.floor(multiplied);
    return multiplied - floorOfMultiplied > 0;
}

function verifyFieldErrors(amount, ref, paymentType, phone, confirmationCode) {

    if (amount == '') errors.value.amountError = "Please insert an amount"
    else if (!Number(amount) || Number(amount) <= 0 || hasMoreThanTwoDecimalPlaces(Number(amount))) errors.value.amountError = "Invalid amount"
    else if (userStore.userType == 'V' && Number(amount) > Number(userStore.userDetails.balance)) errors.value.amountError = "Not enough balance"
    else if (userStore.userType == 'V' && Number(amount) > userStore.userDetails.max_debit) errors.value.amountError = "The amount you've inserted surpasses your account limit for a transaction"
    else errors.value.amountError = ''

    if (paymentType == '') errors.value.paymentTypeError = 'Please insert a payment type'
    else errors.value.paymentTypeError = ''

    if (paymentType != '') {
        if (ref == '') errors.value.refError = 'Please insert a reference'
        else if (paymentType == 'VCARD' && (!Number(ref) || ref[0] != '9' || ref.length != 9)) errors.value.refError = 'Invalid VCARD Phone Number'
        else if (paymentType == 'MBWAY' && (!Number(ref) || ref[0] != '9' || ref.length != 9)) errors.value.refError = 'Invalid MBWAY Phone Number'
        else if (paymentType == 'PAYPAL' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref) == false) errors.value.refError = 'Invalid PAYPAL email'
        else if (paymentType == 'IBAN' && /^[A-Za-z]{2}\d{23}$/.test(ref) == false) errors.value.refError = 'Invalid IBAN'
        else if (paymentType == 'MB' && /^\d{5}-\d{9}$/.test(ref) == false) errors.value.refError = 'Invalid MB'
        else if (paymentType == 'VISA' && /^4\d{15}$/.test(ref) == false) errors.value.refError = 'Invalid VISA'
        else errors.value.refError = ''
    }
    else errors.value.refError = ''

    if (userStore.userType == 'A') {
        if (!Number(phone) || phone[0] != '9' || phone.length != 9) errors.value.phoneError = 'Invalid VCARD Phone Number'
        else errors.value.phoneError = ''
    }

    if (userStore.userType == 'V') {
        if (confirmationCode == '') errors.value.confirmationCodeError = 'Please insert a confirmation code'
        else if (!Number(confirmationCode)) errors.value.confirmationCodeError = 'Invalid confirmation code'
        else errors.value.confirmationCodeError = ''
    }


    if (errors.value.amountError != '' || errors.value.refError != '' || errors.value.paymentTypeError != '' || (userStore.userType == 'A' && errors.value.phoneError != '') || (userStore.userType == 'V' && errors.value.confirmationCodeError != '')) return true
    return false
}
async function makeTransaction(amount, ref, type, phone, confirmationCode) {
    if (verifyFieldErrors(amount, ref, type, phone, confirmationCode)) {
        toast.error('Transaction was not sent due to validation errors!')
        return
    }
    try {
        if (userStore.userType == 'A') {
            const response = await axios.post("/transactions", {
                vcard: phone,
                value: amount,
                payment_reference: ref,
                payment_type: type
            })
        }
        else {
            const response = await axios.post("/transactions", {
                vcard: userStore.userId.toString(),
                value: amount,
                payment_reference: ref,
                payment_type: type,
                confirmation_code: confirmationCode
            })
        }

        toast.success(ref + ' has received ' + amount + '€ !')
        amountField.value = ''
        paymentTypeField.value = ''
        referenceField.value = ''
        phoneField.value = ''
        confirmationCodeField.value = ''
        if (type == 'VCARD') socket.emit('transaction', userStore.user, ref, amount)
        else if (userStore.userType == 'A') socket.emit('admin_transaction', phone, amount)
    } catch (error) {
        console.error(error)
        if (error?.response.status == 403) toast.error('Invalid confirmation code')
        else toast.error('Unknown Server Error!')
    }
}


watch(paymentTypeField, () => {
    if (paymentTypeField.value === 'VCARD') {
        referencePlaceHolder.value = "Reference: (e.g. 915785345)"
        return
    }
    if (paymentTypeField.value === 'MBWAY') {
        referencePlaceHolder.value = "Reference: (e.g. 915785345)"
        return
    }
    if (paymentTypeField.value === 'PAYPAL') {
        referencePlaceHolder.value = "Reference: (e.g. john.doe@gmail.com)"
        return
    }
    if (paymentTypeField.value === 'IBAN') {
        referencePlaceHolder.value = "Reference: (e.g. PT50123456781234567812349)"
        return
    }
    if (paymentTypeField.value === 'MB') {
        referencePlaceHolder.value = "Reference: (e.g. 12345-123456789)"
        return
    }
    if (paymentTypeField.value === 'VISA') {
        referencePlaceHolder.value = "Reference: (e.g. 4123123123123123)"
        return
    }
    referencePlaceHolder.value = 'Please select a destination'
})

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
    <div v-if="!isLoadingUserDetails" class="flex flex-col w-full">
        <div class="text-3xl font-bold mt-8 mb-4 text-center flex flex-col gap-2 justify-center">
            <div>Make a transaction</div>
            <div v-show="userStore.userType == 'V'"><span class="font-bold text-base">Balance:</span><span class="font-bold text-base ml-1">{{ userStore?.userDetails.balance }}€</span></div>
        </div>

        <div class="flex flex-col gap-8 w-1/2 mx-auto">
            <div v-show="userStore.userType == 'A'">
                <input @input="errors.phoneError = ''" type="number" v-model="phoneField" class="w-full border-2 border-black rounded-full outline-none h-12 px-4" placeholder="Vcard Phone Number" />
                <FieldError :error-message="errors?.phoneError" />
            </div>
            <div>
                <input @input="errors.amountError = ''" type="number" v-model="amountField" class="w-full border-2 border-black rounded-full outline-none h-12 px-4" placeholder="Amount (example: 7.50)" />
                <FieldError :error-message="errors?.amountError" />
            </div>
            <div>
                <div class=" flex gap-2">
                    <div class="font-semibold">{{ userStore.userType == 'A' ? 'Payment Type:' : 'Destination:' }}</div>
                    <select @change="errors.paymentTypeError = ''" v-model="paymentTypeField" class="border-2 border-black rounded-md outline-none">
                        <option value="VCARD" v-show="userStore?.userType == 'V'">VCARD</option>
                        <option value="MBWAY">MBWAY</option>
                        <option value="PAYPAL">PAYPAL</option>
                        <option value="IBAN">IBAN</option>
                        <option value="MB">MB</option>
                        <option value="VISA">VISA</option>
                    </select>

                </div>
                <FieldError :error-message="errors?.paymentTypeError" />
            </div>
            <div>
                <input @input="errors.refError = ''" type="text" v-model="referenceField" class="w-full border-2 border-black rounded-full outline-none h-12 px-4" :placeholder="referencePlaceHolder" />
                <FieldError :error-message="errors?.refError" />
            </div>
            <div v-show="userStore.userType == 'V'">
                <input @input="errors.confirmationCodeError = ''" type="password" v-model="confirmationCodeField" class="w-full border-2 border-black rounded-full outline-none h-12 px-4" placeholder="Confirmation Code" />
                <FieldError :error-message="errors?.confirmationCodeError" />
            </div>

        </div>
        <div @click="makeTransaction(amountField, referenceField, paymentTypeField, phoneField.toString(), confirmationCodeField)" class="gap-2 mt-12 shadow rounded-full w-1/2 mx-auto h-12 bg-green-500 justify-center items-center flex font-bold text-gray-100 select-none cursor-pointer">
            <i class="fas fa-paper-plane text-gray-100"></i>
            <div class="w-fit">Send Money</div>
        </div>


    </div>
    <div v-else class="w-full flex justify-center mt-12">
        <PulseLoader />
    </div>
</template>
  