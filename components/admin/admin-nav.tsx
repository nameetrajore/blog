"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin/homepage", label: "Homepage" },
    { href: "/admin/blog", label: "Blog Posts" },
    { href: "/admin/blog/new", label: "New Post" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <nav className="border-b border-border bg-card px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <Link href="/admin" className="font-bold text-lg shrink-0">
          Admin
        </Link>
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm whitespace-nowrap transition-colors ${
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
      >
        Logout
      </button>
    </nav>
  );
}
