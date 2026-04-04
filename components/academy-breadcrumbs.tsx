import Link from "next/link";

type Crumb = {
  href?: string;
  label: string;
};

export function AcademyBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="academy-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
