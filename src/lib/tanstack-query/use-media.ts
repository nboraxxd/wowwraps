import { useMutation } from '@tanstack/react-query'

import mediaApi from '@/api-requests/media.api'
import { QueryKey } from '@/constants/query-key'

export function useUploadImageMutation() {
  return useMutation({ mutationFn: mediaApi.uploadImageFromBrowserToBackend, mutationKey: [QueryKey.bUploadImage] })
}
