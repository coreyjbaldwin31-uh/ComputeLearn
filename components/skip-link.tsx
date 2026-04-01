"use client";

type SkipLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a href={href} className="skip-link">
      {children}
    </a>
  );
}
