"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  loaderClassName?: string;
  "aria-label"?: string;
}

/**
 * Renders an <a> tag (same as Next.js Link) so SSR and client HTML match.
 * Intercepts clicks to show an inline spinner while the route loads.
 */
export function LoadingLink({
  href,
  className,
  children,
  loaderClassName,
  "aria-label": ariaLabel,
}: LoadingLinkProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        router.push(href);
      }}
      className={cn("cursor-pointer", className)}
    >
      {loading ? (
        <Loader2 className={cn("w-4 h-4 animate-spin", loaderClassName)} />
      ) : (
        children
      )}
    </a>
  );
}
