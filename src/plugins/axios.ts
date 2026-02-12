import { ref, type App } from 'vue'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { appConfig } from '@/config/app'
import { makeAxios } from '@vue-composable/axios'
import { useCookie } from '@vue-composable/cookie'

const config = {
    baseURL: appConfig.apiBaseURL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
}

// Access cookies reactively
const { cookie: xsrfToken } = useCookie('XSRF-TOKEN')
const { cookie: token } = useCookie('token')
const { cookie: baseToken } = useCookie('base_token')

// Set global Axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
}
if (xsrfToken.value) {
    axios.defaults.headers.common['X-XSRF-TOKEN'] = xsrfToken.value
}

// Create axios instance with config
const apiClient = axios.create(config)

// Request interceptor to add Authorization header conditionally
apiClient.interceptors.request.use(
    (config) => {
        if (baseToken.value && config.url?.startsWith(import.meta.env.VITE_PROCEDURE_API_URL)) {
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${baseToken.value}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Vue plugin install method
const axiosPlugin = {
    install(app: App) {
        // Add axios instance to globalProperties so you can use via this.$axios
        app.config.globalProperties.$axios = apiClient
        // Provide axios instance for inject()
        app.provide('axios', apiClient)
    },
}

// Ajoute ça dans `axios.ts` à côté de `useAxios`

export function useAxiosTyped<T = any>() {
    const loading = ref(false)
    const data = ref<T | null>(null)
    const error = ref<any>(null)

    const exec = async (config: any) => {
        loading.value = true
        error.value = null
        try {
            const response: AxiosResponse<T> = await apiClient(config)
            data.value = response.data
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    return { exec, loading, data, error }
}


// Export named instances and composable
export const $axios = apiClient
export const axiosInstance = apiClient
export function useAxios() {
    return makeAxios(apiClient)
}
export default axiosPlugin
