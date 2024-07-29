import { redirect } from 'next/navigation'

import envConfig from '@/constants/config'
import { LoginResType } from '@/lib/schema/auth.schema'
import { isBrowser, addFirstSlashToUrl } from '@/utils'
import {
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/utils/local-storage'

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string
  headers?: HeadersInit & { Authorization?: string }
}

type CustomOptionsExcluedBody = Omit<CustomOptions, 'body'>

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

const ENTITY_ERROR_STATUS = 422
const AUTHENTICATION_ERROR_STATUS = 401

let clientLogoutRequest: Promise<any> | null = null

export class HttpError extends Error {
  status: number
  payload: {
    message: string
    [key: string]: any
  }

  constructor({ status, payload, message = 'Http Error' }: { status: number; payload: any; message?: string }) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS = ENTITY_ERROR_STATUS
  payload: EntityErrorPayload

  constructor(payload: EntityErrorPayload) {
    super({ status: ENTITY_ERROR_STATUS, payload, message: 'Entity Error' })
    this.payload = payload
  }
}

const request = async <Response>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options?: CustomOptions) => {
  const body = options?.body instanceof FormData ? options.body : JSON.stringify(options?.body)

  const baseHeaders: HeadersInit = options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }

  const baseUrl = options?.baseUrl || envConfig.NEXT_PUBLIC_API_ENDPOINT

  const fullUrl = `${baseUrl}${addFirstSlashToUrl(url)}`

  if (isBrowser) {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`
    }
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    method,
    body,
  })

  const payload: Response = await res.json()

  const data = {
    status: res.status,
    payload,
  }

  // Intercept errors
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(data.payload as EntityErrorPayload)
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (isBrowser && !clientLogoutRequest) {
        // Gọi đến Next.js API route để logout
        clientLogoutRequest = fetch('/api/auth/logout', {
          method: 'POST',
          body: null, // Logout sẽ luôn cho thành công
          headers: { ...baseHeaders },
        })

        try {
          await clientLogoutRequest
        } catch (error) {
          console.log('😰 clientLogoutRequest', error)
        } finally {
          removeTokensFromLocalStorage()
          clientLogoutRequest = null
          // Redirect về trang login có thể dẫn đến loop vô hạn
          // Nếu không không được xử lý đúng cách
          // Vì nếu rơi vào trường hợp tại trang Login, chúng ta có gọi các API cần access token
          // Mà access token đã bị xóa thì nó lại nhảy vào đây, và cứ thế nó sẽ bị lặp
          window.location.href = '/login'
        }
      }

      if (!isBrowser) {
        // Đây là trường hợp khi mà access token của chúng ta còn hạn
        // Và chúng ta gọi API ở Next.js server (route handler hoặc server component) đến server backend
        const accessToken = options?.headers?.Authorization?.split('Bearer ')[1]

        redirect(`/logout?access-token=${accessToken}`)
      }
      throw new HttpError(data)
    } else {
      throw new HttpError(data)
    }
  }

  // Client gọi đến Next.js API route để login
  if (isBrowser && addFirstSlashToUrl(url) === '/api/auth/login') {
    const { accessToken, refreshToken } = (payload as LoginResType).data

    setAccessTokenToLocalStorage(accessToken)
    setRefreshTokenToLocalStorage(refreshToken)

    // Client gọi đến Next.js API route để logout
  } else if (isBrowser && addFirstSlashToUrl(url) === '/api/auth/logout') {
    removeTokensFromLocalStorage()
  }

  return data
}

const http = {
  get<Response>(url: string, options?: CustomOptionsExcluedBody) {
    return request<Response>('GET', url, options)
  },
  post<Response>(url: string, body: any, options?: CustomOptionsExcluedBody) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(url: string, body: any, options?: CustomOptionsExcluedBody) {
    return request<Response>('PUT', url, { ...options, body })
  },
  delete<Response>(url: string, options?: CustomOptionsExcluedBody) {
    return request<Response>('DELETE', url, options)
  },
}

export default http
