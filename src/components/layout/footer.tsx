"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const quickLinks = [
  { title: "Home", url: "/" },
  { title: "Courses", url: "/courses" },
  { title: "Mentors", url: "/mentors" },
  { title: "About", url: "/about" },
  { title: "Blog", url: "/blog" },
  { title: "Testimonials", url: "/testimonials" },
  { title: "Contact", url: "/contact" },
  { title: "Dashboard", url: "/dashboard" },
  { title: "Privacy Policy", url: "/privacy" },
  { title: "Terms", url: "/terms" },
];

const socialLinks = [
  {
    title: "Client Repository",
    url: "https://github.com/zabirarkam27/level2-assignment05-skill-bridge-client",
    icon: Github,
  },
  {
    title: "Server Repository",
    url: "https://github.com/zabirarkam27/level2-assignment05-skill-bridge-server",
    icon: ExternalLink,
  },
  {
    title: "Developer LinkedIn",
    url: "https://www.linkedin.com/in/zabirarkam27",
    icon: Linkedin,
  },
  {
    title: "Email MentorForge",
    url: "mailto:support@mentorforge.com",
    icon: Mail,
  },
];

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/mentorforge-icon.svg"
                alt="MentorForge Logo"
                width={38}
                height={38}
               
              />
              <span className="bg-linear-to-r from-[#7b2a85] via-[#611f69] to-[#4a174f] bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-[#d8b4fe] dark:via-[#c084fc] dark:to-[#a855f7]">
                MentorForge
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7">
              A payment-first tutor booking platform for discovering mentors,
              managing sessions, tracking invoices, and keeping learning
              records organized.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    target={item.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel={item.url.startsWith("mailto:") ? undefined : "noreferrer"}
                    aria-label={item.title}
                    title={item.title}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#611f69] hover:text-[#611f69] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <nav aria-label="Footer quick links">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <div className="mt-4 grid max-w-md grid-cols-2 gap-x-8 gap-y-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="text-sm transition-colors hover:text-[#611f69] dark:hover:text-[#c084fc]"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Contact & Updates
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#611f69] dark:text-[#c084fc]" />
                <span>123 MentorForge Ave, Dhaka, Bangladesh</span>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#611f69] dark:text-[#c084fc]" />
                <span>support@mentorforge.com</span>
              </p>
              <p className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#611f69] dark:text-[#c084fc]" />
                <span>+880 1234 567890</span>
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="footer-newsletter-email"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Get learning updates
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder="Your email"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition-colors focus:border-[#611f69] dark:border-gray-700 dark:bg-gray-900 dark:focus:border-[#c084fc]"
                />
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#611f69] px-4 text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} MentorForge. All rights reserved.</p>
          <p>Built for secure tutor booking, payments, and learning records.</p>
        </div>
      </div>
    </footer>
  );
}
