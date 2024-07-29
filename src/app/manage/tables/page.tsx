import { Suspense } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TableTable from '@/app/manage/tables/table-table'

export default function TablesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>Bàn ăn</CardTitle>
            <CardDescription>Quản lý bàn ăn</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="my-24 flex items-center justify-center">
                  <LoaderCircleIcon className="size-8 animate-spin" />
                </div>
              }
            >
              <TableTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
