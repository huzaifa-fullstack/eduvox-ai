"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Toast from "./ui/toast";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setToast({ message: "Please enter your email", type: "error" });
      return;
    }

    if (!isValidEmail(email)) {
      setToast({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: "Successfully subscribed! You'll receive our newsletter.",
          type: "success",
        });
        setEmail("");
      } else {
        setToast({
          message: data.error || "Something went wrong",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: "Failed to subscribe. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerSections = {
    platform: {
      title: "Platform",
      links: [
        { label: "Home", href: "/" },
        { label: "Companions", href: "/companions" },
        { label: "My Journey", href: "/my-journey" },
        { label: "Create Companion", href: "/companions/new" },
        { label: "Subscription", href: "/subscription" },
      ],
    },
    subjects: {
      title: "Subjects",
      links: [
        { label: "Mathematics", href: "/companions?subject=maths" },
        { label: "Science", href: "/companions?subject=science" },
        { label: "Language", href: "/companions?subject=language" },
        { label: "Coding", href: "/companions?subject=coding" },
        { label: "History", href: "/companions?subject=history" },
        { label: "Economics", href: "/companions?subject=economics" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Help Center", href: "/help" },
      ],
    },
  };

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 mt-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-14 py-16 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-4 group">
              <svg
                width="140"
                height="35"
                viewBox="0 0 160 40"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <defs>
                  <linearGradient
                    id="footerPrimaryGradient"
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
                    id="footerSecondaryGradient"
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

                <g transform="translate(2, 4)">
                  <path
                    d="M4 8 L20 4 Q28 6, 28 16 Q28 26, 20 28 L4 24 Q0 20, 0 16 Q0 12, 4 8 Z"
                    fill="url(#footerPrimaryGradient)"
                  />

                  <path
                    d="M6 16 Q12 10, 18 16 Q24 22, 30 16"
                    stroke="url(#footerSecondaryGradient)"
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

                  <circle cx="10" cy="12" r="1.5" fill="white" opacity="0.8" />
                  <circle
                    cx="14"
                    cy="10"
                    r="1"
                    fill="url(#footerSecondaryGradient)"
                    opacity="0.9"
                  />
                  <circle cx="18" cy="12" r="1.2" fill="white" opacity="0.6" />
                </g>

                <g transform="translate(44, 8)">
                  <text
                    x="0"
                    y="16"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="18"
                    fontWeight="700"
                    fill="#1F2937"
                  >
                    Edu<tspan fill="url(#footerSecondaryGradient)">Vox</tspan>
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
            </Link>

            <p className="text-gray-600 leading-relaxed max-w-md">
              Revolutionizing education through AI-powered learning companions.
              Create personalized learning experiences with voice conversations
              that make studying engaging and effective.
            </p>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4 h-fit shadow-sm">
            <h4 className="text-xl font-bold text-gray-900">
              Ready to start learning?
            </h4>
            <p className="text-gray-600 text-sm">
              Join thousands of students already learning with AI companions
            </p>
            <Link
              href="/companions/new"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-lg w-fit"
            >
              <Image src="/icons/plus.svg" alt="plus" width={16} height={16} />
              <span>Create Your Companion</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {key === "company" ? (
                      <span className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm block cursor-pointer">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4 md:col-span-1">
            <h4 className="font-bold text-gray-900 text-lg">Stay Updated</h4>
            <p className="text-gray-600 text-sm mb-4">
              Get the latest updates on new features and learning tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`px-4 py-3 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                  !isValidEmail(email) && email.length > 0
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                }`}
                disabled={isSubmitting}
              />
              {!isValidEmail(email) && email.length > 0 && (
                <p className="text-red-500 text-xs">
                  Please enter a valid email address
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !isValidEmail(email) || !email.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © {currentYear} EduVox. All rights reserved.
            </p>
            <div className="flex gap-6 text-center">
              <span className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm cursor-pointer">
                Privacy Policy
              </span>
              <span className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm cursor-pointer">
                Terms of Service
              </span>
              <span className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm cursor-pointer">
                Cookie Policy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">Follow us</span>
            <div className="flex gap-3">
              {[
                {
                  name: "Twitter",
                  href: "https://twitter.com",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  name: "LinkedIn",
                  href: "https://www.linkedin.com",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  name: "GitHub",
                  href: "https://github.com",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-110 hover:shadow-md"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </footer>
  );
};

export default Footer;
