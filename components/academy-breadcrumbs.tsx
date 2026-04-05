import Link from "next/link";
import styles from "./academy-breadcrumbs.module.css";

type Crumb = {
  href?: string;
  label: string;
};

export function AcademyBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className={index === items.length - 1 ? styles.current : styles.item}
          >
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
