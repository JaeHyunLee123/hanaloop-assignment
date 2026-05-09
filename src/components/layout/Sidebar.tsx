"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "This Month", path: "/this-month" },
    { name: "Data Input", path: "/data-input" },
    { name: "Posts", path: "/posts" },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">KENDER</h1>
        <p className="text-sm text-gray-400 mt-1">Carbon Management</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-background font-medium"
                  : "text-foreground hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
