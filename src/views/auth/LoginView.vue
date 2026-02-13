<template>
  <div class="row w-100 g-0">
    <div class="col-md-auto">
        <!--Auth Box content -->
        <div class="card auth-box-form border-0 mb-0">
            <div class="position-absolute top-0 end-0" style="width: 180px">
                <!-- <img :src="logoImg" class="auth-card-bg-img" alt="auth-card-bg" /> -->
            </div>
            <div class="card-body min-vh-100 position-relative d-flex flex-column justify-content-center">
                <div class="auth-brand mb-0 text-center">
                    <a href="/" class="logo-dark">
                        <img :src="logoImg" alt="dark logo" />
                    </a>
                    <a href="/" class="logo-light">
                        <img :src="logoImg" alt="logo" />
                    </a>
                </div>

                <div class="mt-auto">
                    <div class="text-center">
                        <h4 class="fw-bold text-dark">{{ t('auth.login.title') }}</h4>
                        <p class="text-muted w-lg-75 mx-auto">{{ t('auth.login.subtitle') }}</p>
                    </div>

                    <div class="row text-muted g-2">
                        <div class="col-md-6">
                            <a href="#!" class="btn btn-default w-100"
                                >{{ t('auth.login.signInWith') }}
                                <svg xmlns="http://www.w3.org/2000/svg" class="ms-1" width="13.68px" height="14px" viewBox="0 0 256 262">
                                    <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                                    <path
                                        fill="#34a853"
                                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                    />
                                    <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
                                    <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" /></svg
                            ></a>
                        </div>
                        <div class="col-md-6">
                            <a href="#!" class="btn btn-default w-100"
                                >{{ t('auth.login.signInWith') }}
                                <svg xmlns="http://www.w3.org/2000/svg" class="ms-1" width="14px" height="14px" viewBox="0 0 64 64">
                                    <path
                                        fill="currentColor"
                                        d="M32 0C14 0 0 14 0 32c0 21 19 30 22 30c2 0 2-1 2-2v-5c-7 2-10-2-11-5c0 0 0-1-2-3c-1-1-5-3-1-3c3 0 5 4 5 4c3 4 7 3 9 2c0-2 2-4 2-4c-8-1-14-4-14-15q0-6 3-9s-2-4 0-9c0 0 5 0 9 4c3-2 13-2 16 0c4-4 9-4 9-4c2 7 0 9 0 9q3 3 3 9c0 11-7 14-14 15c1 1 2 3 2 6v8c0 1 0 2 2 2c3 0 22-9 22-30C64 14 50 0 32 0"
                                    /></svg
                            ></a>
                        </div>
                    </div>
                    <p class="text-center text-muted my-3 auth-line">
                        <span>{{ t('auth.login.continueWithEmail') }}</span>
                    </p>

                    <form class="mt-4" @submit.prevent="submitForm">
                        <div class="mb-3">
                            <BaseTextInput
                                v-model="form.login"
                                name="login"
                                type="email"
                                :label="t('auth.login.emailLabel')"
                                :placeholder="t('auth.login.emailPlaceholder')"
                                rules="required|email"
                                icon="mail"
                                :required="true"
                            />
                        </div>

                        <div class="mb-3">
                            <BasePasswordInput
                                v-model="form.password"
                                name="password"
                                :label="t('auth.login.passwordLabel')"
                                :placeholder="t('auth.login.passwordPlaceholder')"
                                rules="required|min:6"
                                icon="lock-password"
                                :required="true"
                            />
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <BaseCheckbox
                                v-model="form.rememberMe"
                                name="rememberMe"
                                :label="t('auth.login.rememberMe')"
                            />

                            <a href="" class="text-decoration-underline link-offset-3 text-muted">{{ t('auth.login.forgotPassword') }}</a>
                        </div>

                        <div class="d-grid">
                            <base-submit class="btn-block" :processing="loading" type="submit" full>
                                {{ t('auth.login.signInButton') }}
                            </base-submit>

                            <!-- <button type="submit" class="btn btn-primary fw-bold py-2">{{ t('auth.login.signInButton') }}</button> -->
                        </div>
                    </form>
                </div>

                <p class="text-center text-muted mt-auto mb-0">
                    {{ t('auth.login.copyright') }}
                    <span class="fw-bold">{{ t('auth.login.author') }}</span>
                </p>
            </div>
        </div>
        <!-- End Auth Box Content -->
    </div>
    <div class="col">
        <div class="h-100 position-relative card-side-img rounded-0 overflow-hidden" style="background-image: url(/assets/images/auth.jpg)">
            <div class="p-4 card-img-overlay auth-overlay d-flex align-items-end justify-content-center"></div>
        </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useForm } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import { useAxiosTyped } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError } from '@/utils/notification'
import { useI18n } from '@/composables/useI18n'

import type { LoginCredentials, LoginResponse } from '@/types/auth'

import { logoImg, facebookImg, googleImg } from '@/utils/ui-utils'
import BaseCheckbox from '@/components/Form/BaseCheckbox.vue'

const { t } = useI18n()

useHead({ title: computed(() => t('auth.login.pageTitle')) })

const store = useAuthStore()
const { exec, loading, data, error } = useAxiosTyped<LoginResponse>()

const form = reactive({
  login: '',
  password: '',
  rememberMe: true,
})

const { handleSubmit } = useForm<LoginCredentials>({
  initialValues: {
    login: '',
    password: '',
  },
})

const submitForm = handleSubmit(async () => {
  await exec({
    method: 'POST',
    url: `${appConfig.apiUrl}/auth/login`,
    data: { ...form, device_name: navigator.userAgent },
  })
})

watch(data, (response) => {
  if (response && response.token) {
    store.setAuthData({
      token: response.token,
      user: response.user,
    })
  }
})

const user = computed(() => store.user)

watch(user, (currentUser) => {
  if (currentUser && currentUser.id) {
    console.log('Current user:', currentUser)
    window.location.href = '/home'
  }
})

watch(error, (err) => {
  if (err) handleError(err)
})
</script>
<style lang="scss" scoped>
@use '@/assets/styles/auth' as *;
</style>
