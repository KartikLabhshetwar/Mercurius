interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-orange-400">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  )
}
