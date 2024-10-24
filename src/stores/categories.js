import axios from 'axios'
import { ref, inject } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCategoryStore = defineStore('category', () => {
  const socket = inject('socket')
  const userStore = useUserStore()

  const categories = ref([])

  async function loadCategoriesPaginate(pageNum, typeFilter, nameFilter) {
    clearCategories()
    try {
      if (!userStore.user || userStore.userType != 'V') throw 'Invalid User'
      let url = '/vcards/' + userStore.user.id + '/categories?page=' + pageNum

      if (typeFilter !== '') url += '&type=' + typeFilter
      if (nameFilter !== '') url += '&name=' + nameFilter
      const response = await axios.get(url)
      //console.log(response.data)
      categories.value = response.data.data
      return response
    } catch (error) {
      console.error(error)
    }
  }

  async function loadAllCategories() {
    clearCategories()
    try {
      if (!userStore.user || userStore.userType != 'V') throw 'Invalid User'
      if (!userStore.user) throw 'Invalid User'
      const response = await axios.get('/vcards/' + userStore.user.id + '/categories')
      //console.log(response.data)
      categories.value = response.data
      return response
    } catch (error) {
      console.error(error)
    }
  }

  async function loadDefaultCategoriesPaginate(pageNum, typeFilter, nameFilter) {
    clearCategories()
    try {
      if (!userStore.user || userStore.userType != 'A') throw 'Invalid User'
      let url = '/defaultCategories?page=' + pageNum
      if (typeFilter !== '') url += '&type=' + typeFilter
      if (nameFilter !== '') url += '&name=' + nameFilter
      const response = await axios.get(url)
      //console.log(response.data)
      categories.value = response.data.data
      return response
    } catch (error) {
      console.error(error)
    }
  }

  function clearCategories() {
    categories.value = []
  }

  async function addCategory(name, type) {
    const user = userStore.user
    if (!user) throw 'Invalid User'
    const response = await axios.post('/categories', {
      vcard: user.id.toString(),
      name: name,
      type: type
    })
    return response
  }

  async function addDefaultCategory(name, type) {
    const user = userStore.user
    if (!user) throw 'Invalid User'
    const response = await axios.post('/defaultCategories', {
      name: name,
      type: type
    })
    return response
  }

  async function deleteCategory(categoryObj) {
    try {
      const response = await axios.delete('/categories/' + categoryObj.id)
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteDefaultCategory(categoryObj) {
    try {
      if (!userStore.user || userStore.userType != 'A') throw 'Invalid User'
      const response = await axios.delete('/defaultCategories/' + categoryObj.id)
    } catch (error) {
      console.error(error)
    }
  }

  function getCategoriesByType(type) {
    return categories.value.filter((c) => c.type == type)
  }

  socket.on('default_category_changed', (newCategory) => {
    if (userStore.userType == 'A') {
      if (categories.value != null && categories.value.length > 0) {
        categories.value.map((c, index) => {
          if (c.id == newCategory.id) {
            categories.value[index] = newCategory
            return
          }
        })
      }
    }
  })
  return {
    deleteCategory,
    categories,
    loadCategoriesPaginate,
    loadAllCategories,
    clearCategories,
    addCategory,
    loadDefaultCategoriesPaginate,
    deleteDefaultCategory,
    addDefaultCategory,
    getCategoriesByType
  }
})
