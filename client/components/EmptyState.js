import Icon from "@/components/Icon";

export default function EmptyState({ icon = "book", title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-body">
      <div className="rounded-full bg-background p-3 text-body">
        <Icon name={icon} size={28} />
      </div>
      {title && <p className="font-medium text-heading">{title}</p>}
      {children && <p className="text-sm">{children}</p>}
    </div>
  );
}
