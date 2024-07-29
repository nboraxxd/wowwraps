import envConfig from '@/constants/config'
import http from '@/utils/http'

const revalidateApi = (tag: string) => http.get(`/api/revalidate?tag=${tag}`, { baseUrl: envConfig.NEXT_PUBLIC_URL })

export default revalidateApi
