"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
}) => (
  <motion.div
    key={name}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
      // Premium glassmorphism light styles
      "bg-white/80 backdrop-blur-sm border border-white/50",
      "[box-shadow:0_0_0_1px_rgba(0,0,0,.02),0_4px_6px_rgba(0,0,0,.04),0_24px_48px_rgba(0,0,0,.06)]",
      "hover:shadow-2xl hover:shadow-orange-500/10 transition-shadow duration-500",
      className,
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1.5 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center mb-2 group-hover:scale-90 transition-transform duration-300">
        <Icon className="h-7 w-7 text-orange-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">
        {name}
      </h3>
      <p className="max-w-lg text-slate-500 leading-relaxed">{description}</p>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button variant="ghost" asChild size="sm" className="pointer-events-auto font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50">
        <a href={href} className="flex items-center gap-2">
          {cta}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-orange-50/50 group-hover:to-transparent" />
  </motion.div>
);

export { BentoCard, BentoGrid };
