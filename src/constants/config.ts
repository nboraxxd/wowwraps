import { z } from 'zod'

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  MANAGER_REFRESH_TOKEN_CHECK_INTERVAL: z.string(),
  GUEST_REFRESH_TOKEN_CHECK_INTERVAL: z.string(),
})

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  MANAGER_REFRESH_TOKEN_CHECK_INTERVAL: process.env.NEXT_PUBLIC_MANAGER_REFRESH_TOKEN_CHECK_INTERVAL,
  GUEST_REFRESH_TOKEN_CHECK_INTERVAL: process.env.NEXT_PUBLIC_GUEST_REFRESH_TOKEN_CHECK_INTERVAL,
})

if (!configProject.success) {
  throw new Error('Invalid configuration. Please check your .env file.')
}

const envConfig = configProject.data
export default envConfig
