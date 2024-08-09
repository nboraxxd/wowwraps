import envConfig from '@/constants/config'
import { getAccessTokenFromLocalStorage } from '@/utils/local-storage'
import { io } from 'socket.io-client'

const socket = io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
  auth: {
    Authorization: `Bearer ${getAccessTokenFromLocalStorage()}`,
  },
})

export default socket
