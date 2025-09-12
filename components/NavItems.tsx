"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "My Journey", href: "/my-journey" },
];

const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if we're on sign-in page and get the redirect URL
  const redirectUrl = searchParams.get("redirect_url");

  // Function to check if a nav item should be active
  const isActiveItem = (href: string) => {
    // Direct match
    if (pathname === href) return true;

    // Handle sub-routes (e.g., /companions/new, /companions/[id] should highlight Companions)
    if (href === "/companions" && pathname.startsWith("/companions"))
      return true;

    // If we're on sign-in page and this href matches the redirect URL
    if (pathname === "/sign-in" && redirectUrl === href) return true;

    // If we're on sign-in and redirect URL starts with this href (for sub-routes)
    if (
      pathname === "/sign-in" &&
      redirectUrl &&
      redirectUrl.startsWith(href) &&
      href !== "/"
    )
      return true;

    return false;
  };

  return (
    <nav className="flex items-center gap-4 md:gap-4 max-md:flex-col max-md:gap-3 max-md:w-full">
      {navItems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          onClick={onItemClick}
          className={cn(
            "max-md:text-base max-md:py-2 max-md:w-full max-md:text-left",
            "relative px-4 py-2 rounded-lg transition-all duration-300",
            // Desktop hover effects (only on md and larger screens)
            "md:hover:bg-gray-100 md:dark:hover:bg-gray-800",
            "md:hover:scale-105 md:active:scale-95",
            // Underline effect only on desktop
            "md:before:absolute md:before:bottom-0 md:before:left-1/2 md:before:w-0 md:before:h-0.5",
            "md:before:bg-gradient-to-r md:before:from-blue-500 md:before:to-cyan-500",
            "md:before:transition-all md:before:duration-300 md:before:transform md:before:-translate-x-1/2",
            "md:hover:before:w-full",
            // Active states - different for mobile and desktop
            isActiveItem(href) && [
              "text-primary font-semibold",
              // Desktop active state with underline
              "md:before:w-full md:bg-gray-50 md:dark:bg-gray-800",
              // Mobile active state with simple background
              "max-md:bg-blue-50 max-md:dark:bg-blue-900/20 max-md:border-l-4 max-md:border-blue-500",
            ]
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavItems;
