"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: create a temporary textarea and execCommand
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // If all else fails, log the error
        console.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-2.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral focus-visible:rounded-xl",
        copied
          ? "bg-green-100 hover:bg-green-200"
          : "bg-gray-100 hover:bg-gray-200",
        className
      )}
      title={copied ? "Copied!" : "Copy link"}
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <Copy className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
