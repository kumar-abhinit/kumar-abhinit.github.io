/** Static technology chip (not a filter). */
export default function TechChip({ label }: { label: string }) {
  return (
    <li className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
      {label}
    </li>
  );
}

export function TechChipList({
  items,
  label,
}: {
  items: readonly string[];
  label: string;
}) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <TechChip key={item} label={item} />
      ))}
    </ul>
  );
}
