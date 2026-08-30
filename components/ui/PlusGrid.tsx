export function PlusGrid({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function PlusGridRow({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group/row relative isolate pt-[calc(theme(spacing[2])+1px)] last:pb-[calc(theme(spacing[2])+1px)]${className ? ` ${className}` : ""}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2"
      >
        <div className="absolute inset-x-0 top-0"></div>
        <div className="absolute inset-x-0 top-2"></div>
        <div className="absolute inset-x-0 bottom-0 hidden"></div>
        <div className="absolute inset-x-0 bottom-2 hidden"></div>
      </div>
      {children}
    </div>
  );
}

export function PlusGridItem({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`group/item relative${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
