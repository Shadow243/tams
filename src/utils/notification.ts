// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import toastr from 'toastr'
import _forEach from 'lodash/forEach'
import _isEmpty from 'lodash/isEmpty'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
import { useCookie } from '@vue-composable/cookie'

// Optional: Toastr global config (customize as you like)
toastr.options = {
  positionClass: 'toast-top-right',
  closeButton: true,
  progressBar: true,
  timeOut: 3000,
  extendedTimeOut: 1000,
  showMethod: 'slideDown',
  hideMethod: 'slideUp',
}

export function showSuccessMessage(
  message: string | null = null,
  title = 'Effectué',
  timeOut = 3000,
) {
  toastr.success(message || '', title, { timeOut })
}

export function showErrorMessage(message: string | null = null, timeOut = 3000) {
  toastr.error(message || '', 'Erreur', { timeOut })
}

export function showWarningMessage(message: string | null = null, timeOut = 3000) {
  toastr.warning(message || '', 'Avertissement', { timeOut })
}

export function showToast(options: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  timeOut?: number
}) {
  const { type, message, title, timeOut = 3000 } = options
  
  switch (type) {
    case 'success':
      toastr.success(message, title || 'Effectué', { timeOut })
      break
    case 'error':
      toastr.error(message, title || 'Erreur', { timeOut })
      break
    case 'warning':
      toastr.warning(message, title || 'Avertissement', { timeOut })
      break
    case 'info':
      toastr.info(message, title || 'Information', { timeOut })
      break
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function showSessionErrors(param: any) {
  if (!param) return

  if (param.errors) {
    _forEach(param.errors, (val) => {
      toastr.error(Array.isArray(val) ? val[0] : val)
    })
  }

  if ((param.error_message || param.message) && param.message !== 'The given data was invalid.') {
    const msg = param.error_message || param.message || ''
    toastr.error(msg)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleError(error: any) {
  if (error === null || (!error.response && !error.error_message)) {
    return
  }

  if (process.env.NODE_ENV !== 'production' && error.response) {
    console.error('ERREUR', error.response || error)
  }

  if (error.error_message) {
    showSessionErrors(error)
    return
  }

  const { status, data } = error.response

  if (status === 500) {
    toastr.error("Une erreur interne s'est produite.")
    return
  }

  if (status === 503) {
    return
  }

  if ([400, 422, 403, 409, 429].includes(status)) {
    showSessionErrors(data)
  }

  if (status === 419) {
    console.log('csrf')
    // Optionally reload to refresh CSRF token
    // window.location.reload();
  }

  if (status === 401 && data.message === 'Unauthenticated.') {
    const pathname = window.location.pathname
    const authExceptionPaths = ['/login', '/password', '/contact', '/souscription']

    if (!authExceptionPaths.includes(pathname)) {
      const store = useAuthStore()
      const { setCookie: setConfigLoaded } = useCookie('config-loaded', 0)

      store.setUser(null)
      setConfigLoaded(0)
      window.location.href = `/login`
    }
  }
}

export function showSwalMessage(
  message: string | null = null,
  title = 'Confirmation',
  type: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success',
  confirmButtonText = 'OK!',
) {
  if (message) {
    Swal.fire({
      title,
      text: message,
      icon: type,
      showCancelButton: false,
      confirmButtonText,
    })
  }
}

export function showDialogMessage(
  callback: (confirmed: boolean) => void,
  params: {
    title?: string
    message?: string
    showCancel?: boolean
    yes?: string
    no?: string
  } = {},
) {
  return Swal.fire({
    title: params.title || 'Effectué',
    text: params.message || 'Message .?',
    icon: 'question',
    showCancelButton: params.showCancel || false,
    confirmButtonText: params.yes || 'OK!',
    cancelButtonText: params.no || 'Non!',
  }).then((result) => {
    callback(result.isConfirmed)
  })
}

export function confirmDialog(
  callback: (confirmed: boolean) => void,
  params: {
    message?: string
    title?: string
    type?: 'warning' | 'info' | 'error' | 'success' | 'question'
    yes?: string
    no?: string
  } = {},
) {
  let message = 'Voulez-vous vraiment supprimer .?'
  if (params.message !== undefined && !_isEmpty(params.message)) {
    message = params.message
  }
  return Swal.fire({
    title: params.title || 'Êtes-vous sûr?',
    text: message,
    icon: params.type || 'warning',
    reverseButtons: true,
    showCancelButton: true,
    confirmButtonText: params.yes || 'Oui!',
    cancelButtonText: params.no || 'Non!',
  }).then((result) => {
    callback(result.isConfirmed)
  })
}