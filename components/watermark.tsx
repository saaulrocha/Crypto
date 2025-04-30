import { Code, Cpu } from "lucide-react"

export function Watermark() {
  return (
    <div className="fixed bottom-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs backdrop-blur-sm border shadow-sm dark:bg-gray-800/80 dark:border-gray-700">
      <div className="flex items-center">
        <Code className="h-3.5 w-3.5 text-primary mr-1" />
        <span>
          Desarrollado por <span className="font-semibold">Saúl Rocha</span>
        </span>
      </div>
      <span className="text-muted-foreground">|</span>
      <div className="flex items-center">
        <Cpu className="h-3.5 w-3.5 text-primary mr-1" />
        <span className="text-muted-foreground">Next.js · TypeScript · Tailwind</span>
      </div>
    </div>
  )
}
