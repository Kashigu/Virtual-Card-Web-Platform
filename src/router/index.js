import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import Login from '../components/auth/Login.vue'
import ChangePassword from '../components/auth/ChangePassword.vue'
import User from '../components/users/User.vue'
import ManageUsers from '../components/users/ManageUsers.vue'
import HomeView from '../views/HomeView.vue'
import ChangeConfirmationCode from '../components/auth/ChangeConfirmationCode.vue'
import MakeTransaction from '../components/transactions/MakeTransaction.vue'
import TransactionHistory from '../components/transactions/TransactionHistory.vue'
import Categories from '../components/categories/Categories.vue'
import DefaultCategories from '../components/categories/DefaultCategories.vue'
import Category from '../components/categories/Category.vue'
import EditCategory from '../components/categories/EditCategory.vue'
import EditDefaultCategory from '../components/categories/EditDefaultCategory.vue'
import CreateNewAdmin from '../components/auth/CreateNewAdmin.vue'
import AddCategory from '../components/categories/AddCategory.vue'
import AddDefaultCategory from '../components/categories/AddDefaultCategory.vue'
let handlingFirstRoute = true

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/password',
      name: 'ChangePassword',
      component: ChangePassword
    },
    {
      path: '/confirmationCode',
      name: 'ChangeConfirmationCode',
      component: ChangeConfirmationCode
    },
    {
      path: '/createNewAdmin',
      name: 'CreateNewAdmin',
      component: CreateNewAdmin
    },
    {
      path: '/manageUsers',
      name: 'ManageUsers',
      component: ManageUsers,
      props: (route) => ({ page: parseInt(route.query.page) || 1 })
    },
    {
      path: '/users/new',
      name: 'Register',
      component: User,
      props: { id: -1 }
    },
    {
      path: '/users/:id',
      name: 'User',
      component: User,
      //props: true
      // Replaced with the following line to ensure that id is a number
      props: (route) => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/maketransaction',
      name: 'MakeTransaction',
      component: MakeTransaction
    },
    {
      path: '/categories',
      name: 'Categories',
      component: Categories,
      props: (route) => ({ page: parseInt(route.query.page) || 1 })
    },
    {
      path: '/categories/add',
      name: 'AddCategory',
      component: AddCategory
    },
    {
      path: '/defaultCategories',
      name: 'DefaultCategories',
      component: DefaultCategories,
      props: (route) => ({ page: parseInt(route.query.page) || 1 })
    },
    {
      path: '/defaultCategories/add',
      name: 'AddDefaultCategory',
      component: AddDefaultCategory
    },
    {
      path: '/category/:id',
      name: 'Category',
      component: Category,
      props: (route) => ({ id: parseInt(route.params.id), page: parseInt(route.query.page) || 1 })
    },
    {
      path: '/category/:id/edit',
      name: 'EditCategory',
      component: EditCategory,
      props: (route) => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/defaultCategory/:id/edit',
      name: 'EditDefaultCategory',
      component: EditDefaultCategory,
      props: (route) => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/history',
      name: 'TransactionHistory',
      component: TransactionHistory,
      props: (route) => ({ page: parseInt(route.query.page) || 1 })
    }
  ]
})
const adminRoutes = [
  'Home',
  'ChangePassword',
  'CreateNewAdmin',
  'ManageUsers',
  'MakeTransaction',
  'DefaultCategories',
  'AddDefaultCategory',
  'EditDefaultCategory'
]
//DON'T INCLUDE THE USER ROUTE IN THE VCARD ROUTES
const vcardRoutes = [
  'Home',
  'ChangePassword',
  'ChangeConfirmationCode',
  'Register',
  'MakeTransaction',
  'Categories',
  'AddCategory',
  'Category',
  'EditCategory',
  'TransactionHistory'
]
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if (handlingFirstRoute) {
    handlingFirstRoute = false
    await userStore.restoreToken()
  }
  if (to.name == 'Register' || to.name == 'Login') {
    if (userStore.user != null) {
      next({ name: 'Home' })
      return
    }
    next()
    return
  }
  if (!userStore.user) {
    //no user logged in and trying to access something other than register/login
    next({ name: 'Login' })
    return
  }
  if (to.name == 'User') {
    if (userStore.user.user_type == 'A' || userStore.user.id == to.params.id) {
      next()
      return
    }
    //vcard trying to access another vcard's profile
    next({ name: 'Home' })
    return
  }

  if (
    (userStore.user.user_type == 'A' && !adminRoutes.includes(to.name)) ||
    (userStore.user.user_type == 'V' && !vcardRoutes.includes(to.name))
  ) {
    next({ name: 'Home' })
    return
  }
  next()
})

export default router
