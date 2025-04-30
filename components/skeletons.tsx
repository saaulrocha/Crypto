import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CryptoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-1 h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mt-2 grid gap-1">
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
