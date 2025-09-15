"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import NavItems from "./NavItems";
import { useState, useEffect, Suspense } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Clean up overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer navbar-logo group">
            <svg
              width="160"
              height="40"
              viewBox="0 0 160 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="primaryGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#1E40AF", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#3B82F6", stopOpacity: 1 }}
                  />
                </linearGradient>
                <linearGradient
                  id="secondaryGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#0EA5E9", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#06B6D4", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>

              {/* Icon container */}
              <g transform="translate(2, 4)">
                {/* Modern geometric shapes */}
                <path
                  d="M4 8 L20 4 Q28 6, 28 16 Q28 26, 20 28 L4 24 Q0 20, 0 16 Q0 12, 4 8 Z"
                  fill="url(#primaryGradient)"
                />

                {/* Dynamic wave element */}
                <path
                  d="M6 16 Q12 10, 18 16 Q24 22, 30 16"
                  stroke="url(#secondaryGradient)"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.9"
                />
                <path
                  d="M8 16 Q12 12, 16 16 Q20 20, 24 16"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                />

                {/* Modern dots accent */}
                <circle cx="10" cy="12" r="1.5" fill="white" opacity="0.8" />
                <circle
                  cx="14"
                  cy="10"
                  r="1"
                  fill="url(#secondaryGradient)"
                  opacity="0.9"
                />
                <circle cx="18" cy="12" r="1.2" fill="white" opacity="0.6" />
              </g>

              {/* Text */}
              <g transform="translate(44, 8)">
                <text
                  x="0"
                  y="16"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="18"
                  fontWeight="700"
                  fill="#1F2937"
                >
                  Edu<tspan fill="url(#secondaryGradient)">Vox</tspan>
                </text>
                <text
                  x="0"
                  y="28"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="8"
                  fontWeight="400"
                  fill="#6B7280"
                  letterSpacing="0.5px"
                >
                  EDUCATION PLATFORM
                </text>
              </g>
            </svg>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex">
            <Suspense fallback={<div></div>}>
              <NavItems />
            </Suspense>
          </div>

          <SignedOut>
            <SignInButton>
              <button className="btn-signin hover-scale">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="hover-scale">
              <UserButton />
            </div>
          </SignedIn>

          {/* Mobile Menu Button - only shown on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {isMobileMenuOpen ? (
                // Close icon
                <>
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                // Hamburger icon
                <>
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu - only shown when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-lg transform transition-all duration-300 ease-out"
          style={{ top: isScrolled ? "68px" : "80px" }}
        >
          <div className="px-4 py-4">
            <Suspense fallback={<div></div>}>
              <NavItems onItemClick={() => setIsMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
