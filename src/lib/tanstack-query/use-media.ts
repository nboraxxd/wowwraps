import { useMutation } from '@tanstack/react-query'

import mediaApi from '@/api-requests/media.api'
import { QueryKey } from '@/constants/query-key'

export function useBUploadImageMutation() {
  return useMutation({ mutationFn: mediaApi.bUploadImage, mutationKey: [QueryKey.bUploadImage] })
}
