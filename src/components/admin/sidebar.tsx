"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  LogOut,
  Brain,
  Home,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarWrapper,
  SidebarBody,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/polls",
    label: "All Polls",
    icon: ClipboardList,
  },
  {
    href: "/polls/new",
    label: "Create Poll",
    icon: PlusCircle,
  },
];

// Custom Logo component
const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-lg"
    >
      <div className="h-9 w-9 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
        <Brain className="h-5 w-5 text-white" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        <span className="font-bold text-brand-black whitespace-pre">Jay Polls</span>
        <span className="text-xs text-brand-mid-grey">Admin Panel</span>
      </motion.div>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex items-center justify-center text-sm py-1 relative z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-lg"
    >
      <div className="h-9 w-9 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
        <Brain className="h-5 w-5 text-white" />
      </div>
    </Link>
  );
};

// Custom SidebarLink with active state
function NavLink({ item }: { item: typeof navItems[0] }) {
  const pathname = usePathname();
  const { open, animate } = useSidebar();

  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 group/sidebar py-3 px-3 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-lg",
        isActive
          ? "bg-brand-light-orange text-brand-coral"
          : "text-brand-dark-grey hover:bg-brand-alabaster hover:text-brand-black",
        !open && "justify-center"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-brand-coral" : "text-brand-mid-grey group-hover/sidebar:text-brand-dark-grey"
        )}
      />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
          isActive ? "text-brand-coral" : "text-brand-dark-grey"
        )}
      >
        {item.label}
      </motion.span>
    </Link>
  );
}

// Inner logout button — must be inside <form> to use useFormStatus
function LogoutButtonInner({ open, animate }: { open: boolean; animate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex items-center gap-3 group/sidebar py-3 px-3 rounded-xl transition-all duration-200 text-brand-dark-grey hover:bg-red-50 hover:text-red-600 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-lg disabled:opacity-60",
        !open && "justify-center"
      )}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 flex-shrink-0 text-red-400 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5 flex-shrink-0 text-brand-mid-grey group-hover/sidebar:text-red-500 transition-colors" />
      )}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {pending ? "Logging out…" : "Logout"}
      </motion.span>
    </button>
  );
}

// Logout button component
function LogoutButton() {
  const { open, animate } = useSidebar();
  return (
    <form action={logout}>
      <LogoutButtonInner open={open} animate={animate} />
    </form>
  );
}

// Back to site link
function BackToSiteLink() {
  const { open, animate } = useSidebar();

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-3 group/sidebar py-3 px-3 rounded-xl transition-all duration-200 text-brand-dark-grey hover:bg-brand-alabaster hover:text-brand-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-lg",
        !open && "justify-center"
      )}
    >
      <Home className="h-5 w-5 flex-shrink-0 text-brand-mid-grey group-hover/sidebar:text-brand-dark-grey transition-colors" />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        Back to Site
      </motion.span>
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <SidebarWrapper open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-white shadow-md">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="mb-8">
            {open ? <Logo /> : <LogoIcon />}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1 pt-4">
          <BackToSiteLink />
          <LogoutButton />
        </div>
      </SidebarBody>
    </SidebarWrapper>
  );
}
