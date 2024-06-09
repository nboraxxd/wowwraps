import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isBrowser = typeof window !== 'undefined'

export const addFirstSlashToUrl = (url: string) => {
  return url.startsWith('/') ? url : `/${url}`
}
