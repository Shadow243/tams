import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { App } from 'vue'
import type { ChannelAuthorizationCallback } from 'pusher-js'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<'reverb'>
  }
}

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY as string,
  wsHost: import.meta.env.VITE_REVERB_HOST as string,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  /**
   * Use the existing authenticated axios instance for private-channel auth
   * instead of a plain fetch — this ensures the Bearer token is always sent.
   */
  authorizer: (channel: { name: string }) => ({
    authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
      axiosInstance
        .post(`${appConfig.apiUrl}/broadcasting/auth`, {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((res) => callback(null, res.data))
        .catch((err) => callback(err, null))
    },
  }),
})

window.Echo = echo

const echoPlugin = {
  install(app: App) {
    app.config.globalProperties.$echo = echo
    app.provide('echo', echo)
  },
}

export { echo }
export default echoPlugin
