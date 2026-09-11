// Placeholder card shown while the catalog is loading.
export default function BookCardSkeleton() {
  return (
    <div className="card flex flex-col p-3.5">
      <div className="skeleton mb-3 h-56 w-full" />
      <div className="skeleton mb-2 h-3 w-full" />
      <div className="skeleton mb-2 h-3 w-3/5" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}
