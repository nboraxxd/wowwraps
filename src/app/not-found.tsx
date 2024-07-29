import Link from 'next/link'

import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex h-screen flex-col justify-center gap-4 px-4 md:gap-8 md:px-8">
      <div className="py-5 lg:py-20">
        <h1 className="mb-5 flex flex-col items-center gap-5 text-center text-3xl font-bold lg:text-4xl">
          <span className="inline-block text-7xl">404</span>
          <span>Không tìm thấy trang</span>
        </h1>
        <p className="mx-auto mb-10 max-w-[588px] text-center text-lg text-gray-500">
          Dường như trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy kiểm tra lại đường dẫn hoặc quay về trang
          chủ.
        </p>

        <div className="text-center">
          <Button asChild>
            <Link href="/" className="group h-12">
              <ArrowLeftIcon className="size-5 transition-transform group-hover:-translate-x-1" />
              <span>Về trang chủ</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
