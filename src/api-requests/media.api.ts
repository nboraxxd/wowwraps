import http from '@/utils/http'
import { UploadImageResType } from '@/lib/schema/media.schema'

const mediaApi = {
  // API OF BACKEND SERVER
  uploadImageFromBrowserToBackend: (data: FormData) => http.post<UploadImageResType>('/media/upload', data),

  // API OF NEXT.JS SERVER
}

export default mediaApi
