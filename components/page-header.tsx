import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center space-y-1.5 sm:space-y-2">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        <Link 
          href="/"
          className="text-orange-400 hover:text-orange-300 transition-colors duration-200"
        >
          {title}
        </Link>
      </h1>
      {description && (
        <p className="text-muted-foreground text-xs sm:text-sm px-2">{description}</p>
      )}
    </div>
  )
}
