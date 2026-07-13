"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, UserCircle } from "lucide-react";
import { useSessionContext } from "@/context/SessionContext";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "./ModeToggle";
import { useLogout } from "@/lib/logout";
import { getAvatarUrl } from "@/lib/avatar";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  title: string;
  url: string;
}

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { user, loading, refetch } = useSessionContext();
  const logout = useLogout();
  const dashboardUrl =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TUTOR"
        ? "/tutor/dashboard"
        : "/dashboard";
  const profileUrl =
    user?.role === "ADMIN"
      ? "/admin/profile"
      : user?.role === "TUTOR"
        ? "/tutor/profile"
        : "/dashboard/profile";

  const menu: MenuItem[] = [
    { title: "Home", url: "/" },
    { title: "Courses", url: "/courses" },
    { title: "Mentors", url: "/mentors" },
    { title: "About", url: "/about" },
    { title: "Blog", url: "/blog" },
    { title: "Testimonials", url: "/testimonials" },
    { title: "Contact Us", url: "/contact" },
    ...(user ? [{ title: "Dashboard", url: dashboardUrl }] : []),
  ];

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mentorforge-icon.svg"
              alt="MentorForge Logo"
              width={32}
              height={32}
            />
          </Link>
          <Button size="sm" variant="outline" disabled>
            Loading...
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <nav className="hidden h-16 items-center justify-between lg:flex">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/mentorforge-icon.svg"
                alt="MentorForge Logo"
                width={32}
                height={32}
               
              />
              <span className="relative rounded-md px-3 py-1 text-lg font-semibold tracking-tighter bg-linear-to-r from-[#7b2a85] via-[#611f69] to-[#4a174f] dark:from-[#d8b4fe] dark:via-[#c084fc] dark:to-[#a855f7] bg-size-[200%_200%] bg-left bg-clip-text text-transparent transition-all duration-500 hover:bg-right hover:bg-clip-padding hover:text-white dark:hover:text-black">
                MentorForge
              </span>
            </Link>

            {/* Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300 hover:text-[#611f69] hover:bg-[#611f69]/10 dark:hover:text-[#d8b4fe] dark:hover:bg-white/10"
                    >
                      <Link href={item.url}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden w-72 xl:block">
              <GlobalSearch />
            </div>
            {!loading && user ? (
              <>
                <div className="hidden xl:block">
                  <NotificationBell />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 items-center gap-2 rounded-full border bg-background px-1.5 pr-3 text-left text-sm transition-colors hover:bg-muted"
                      aria-label="Open profile menu"
                    >
                      <Image
                        src={getAvatarUrl(user.image)}
                        alt={user.name || "Profile"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="hidden max-w-28 truncate font-medium xl:inline">
                        {user.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <span className="block truncate">{user.name}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboardUrl}>
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={profileUrl}>
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => logout(refetch)}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[#611f69] text-[#611f69] hover:bg-[#611f69] hover:text-white dark:border-[#c084fc] dark:text-[#e9d5ff] dark:hover:bg-[#c084fc] dark:hover:text-black"
                >
                  <Link href="/login">Sign In</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
            <div className="hidden xl:block">
              <ModeToggle />
            </div>
          </div>
        </nav>

        {/* Mobile */}
        <div className="flex h-16 items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mentorforge-icon.svg"
              alt="MentorForge Logo"
              width={32}
              height={32}
             
            />
          </Link>

          <div className="flex items-center gap-2">
            {!loading && user && (
              <>
                <div className="lg:hidden">
                  <NotificationBell />
                </div>
                <Link href={dashboardUrl} aria-label="Open dashboard">
                  <Image
                    src={getAvatarUrl(user.image)}
                    alt="profile"
                    width={36}
                    height={36}
                    className="rounded-full border"
                  />
                </Link>
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/mentorforge-icon.svg"
                      alt="MentorForge Logo"
                      width={32}
                      height={32}
                    />
                    <span className="relative rounded-md px-3 py-1 text-lg font-semibold tracking-tighter bg-linear-to-r from-[#7b2a85] via-[#611f69] to-[#4a174f] dark:from-[#d8b4fe] dark:via-[#c084fc] dark:to-[#a855f7] bg-size-[200%_200%] bg-left bg-clip-text text-transparent transition-all duration-500 hover:bg-right hover:bg-clip-padding hover:text-white dark:hover:text-black">
                      MentorForge
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-6">
                  <div className="px-4">
                    <GlobalSearch />
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {menu.map((item) => (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="h-10 justify-center flex flex-col rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300 hover:text-[#611f69] hover:bg-[#611f69]/10 dark:hover:text-[#d8b4fe] dark:hover:bg-white/10"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    {!loading && user ? (
                      <>
                        <div className="px-4 text-sm text-gray-600 dark:text-gray-300">
                          Signed in as{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                        </div>
                      <Button
                        onClick={() => logout(refetch)}
                        className="bg-red-500 hover:bg-red-600 mx-4"
                      >
                        Logout
                      </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          className="border-[#611f69] text-[#611f69] hover:bg-[#611f69] hover:text-white dark:border-[#611f69]  dark:text-[#e9d5ff] dark:hover:bg-[#611f69] dark:hover:text-white mx-4"
                        >
                          <Link href="/login">Sign In</Link>
                        </Button>

                        <Button
                          asChild
                          className="bg-[#611f69] text-white hover:bg-[#4a174f] mx-4"
                        >
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Medium action layer */}
        <div className="hidden border-t border-border/70 py-3 lg:flex xl:hidden">
          <div className="flex w-full items-center gap-3">
            <div className="min-w-0 flex-1">
              <GlobalSearch />
            </div>
            {!loading && user && <NotificationBell />}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
