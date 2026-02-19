"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles, Clock, Globe, Shield, Star } from "lucide-react";
import Link from "next/link";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["effortless", "organised", "stress-free", "simple", "guided"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-br from-brand-coral/20 to-brand-coral/10 w-[500px] h-[500px] -top-40 -left-40"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -15, 0],
          y: [0, 15, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-br from-brand-indigo/20 to-brand-indigo/10 w-[400px] h-[400px] top-10 -right-32"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-br from-brand-light-yellow/60 to-brand-light-orange/30 w-72 h-72 bottom-10 left-1/3"
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E9E9F110_1px,transparent_1px),linear-gradient(to_bottom,#E9E9F110_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex gap-8 py-16 lg:py-24 items-center justify-center flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo to-brand-coral rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-brand-coral/10 border border-brand-light-grey/50">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4 text-brand-coral" />
                </motion.div>
                <span className="text-sm font-semibold bg-gradient-to-r from-brand-indigo to-brand-coral bg-clip-text text-transparent">
                  AI-Powered Moving Assistant
                </span>
              </div>
            </div>
          </motion.div>

          {/* Animated Heading */}
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tight text-center font-bold">
              <span className="text-brand-black">Make your move</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-serif italic bg-gradient-to-r from-brand-indigo to-brand-coral bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl leading-relaxed text-brand-dark-grey max-w-2xl text-center"
            >
              Meet Jay, your personal AI moving assistant from JustMoveIn.
              Get expert guidance on utilities, checklists, reminders, and everything
              you need for a smooth UK property move.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.a
              href="https://justmovein.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-md border border-brand-light-grey/80 text-brand-dark-grey font-semibold rounded-2xl shadow-lg shadow-brand-black/10 transition-all duration-300 hover:border-brand-coral/30 hover:shadow-brand-coral/10"
            >
              <MessageCircle className="w-5 h-5 group-hover:text-brand-coral transition-colors" />
              Chat with Jay
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-indigo to-brand-coral rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <Link
                href="#polls"
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-2xl shadow-xl shadow-brand-coral/25 transition-all duration-300"
              >
                Share Your Feedback
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-10"
          >
            {[
              { icon: Clock, text: "24/7 Available" },
              { icon: Globe, text: "10 Languages" },
              { icon: Shield, text: "Secure & Private" },
              { icon: Star, text: "4.9/5 Rating" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-full border border-white/50 shadow-lg shadow-brand-black/5"
              >
                <item.icon className="w-4 h-4 text-brand-coral" />
                <span className="text-sm font-medium text-brand-dark-grey">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { AnimatedHero };
