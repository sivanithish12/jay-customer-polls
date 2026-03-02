"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  CheckSquare,
  Bell,
  FileText,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

const features = [
  {
    icon: CheckSquare,
    name: "Smart Checklist",
    description: "Personalised moving checklist that adapts to your move date and situation.",
    href: "https://justmovein.com",
    cta: "Learn more",
    backgroundImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    icon: MessageCircle,
    name: "Multi-Channel Chat",
    description: "Chat via web, WhatsApp, or voice call - whatever suits you best.",
    href: "https://justmovein.com",
    cta: "Start chatting",
    backgroundImage: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&auto=format&fit=crop&q=80",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    icon: Bell,
    name: "Smart Reminders",
    description: "Never miss a deadline with intelligent WhatsApp reminders.",
    href: "https://justmovein.com",
    cta: "Get reminded",
    backgroundImage: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    icon: FileText,
    name: "Document Analysis",
    description: "Upload your EPC, lease, or contracts and Jay will analyse them.",
    href: "https://justmovein.com",
    cta: "Upload docs",
    backgroundImage: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    icon: Globe,
    name: "10 Languages",
    description: "Natural voice conversations in 10 languages with low-latency responses.",
    href: "https://justmovein.com",
    cta: "Explore",
    backgroundImage: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&auto=format&fit=crop&q=80",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

function FeatureCard({
  name,
  className,
  icon: Icon,
  description,
  href,
  cta,
  backgroundImage,
  index,
}: {
  name: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
  backgroundImage: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
        "bg-white border border-brand-light-grey/50",
        "shadow-lg shadow-brand-black/5 hover:shadow-xl hover:shadow-brand-coral/20 transition-all duration-500 hover:-translate-y-1",
        className
      )}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-20 transition-opacity duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-light-orange/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-light-orange to-brand-light-mauve flex items-center justify-center mb-2 group-hover:scale-95 transition-transform duration-300 shadow-sm">
          <Icon className="h-6 w-6 text-brand-coral" />
        </div>
        <h3 className="text-xl font-bold text-brand-black">{name}</h3>
        <p className="max-w-lg text-brand-dark-grey leading-relaxed">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        <a
          href={href}
          className="pointer-events-auto inline-flex items-center gap-2 font-semibold text-brand-coral hover:text-brand-indigo transition-colors"
        >
          {cta}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#F8F8F8_1px,transparent_1px),linear-gradient(to_bottom,#F8F8F8_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-brand-light-mauve text-brand-coral text-sm font-semibold rounded-full mb-4 shadow-sm">
            <CheckSquare className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-black mb-4">
            Everything you need for a
            <br />
            <span className="font-serif italic bg-gradient-to-r from-brand-indigo to-brand-coral bg-clip-text text-transparent">
              stress-free move
            </span>
          </h2>
          <p className="text-lg text-brand-dark-grey max-w-2xl mx-auto">
            Jay combines AI intelligence with practical moving expertise to guide you through every step.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid w-full auto-rows-[22rem] grid-cols-3 gap-5 lg:grid-rows-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.name} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
