"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "My Journey", href: "/my-journey" },
];

const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 md:gap-4 max-md:flex-col max-md:gap-3 max-md:w-full">
      {navItems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          onClick={onItemClick}
          className={cn(
            "max-md:text-base max-md:py-2 max-md:w-full max-md:text-left",
            pathname === href && "text-primary font-semibold"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavItems;
