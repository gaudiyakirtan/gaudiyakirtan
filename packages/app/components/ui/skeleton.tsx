
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="rounded-md animate-pulse bg-primary/5"
      {...props}
    />
  )
}

export { Skeleton }
