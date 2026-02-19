import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MessageCircle,
  ArrowRight,
  Vote,
  Users,
  Phone,
  Brain,
  Zap,
  Sparkles,
} from "lucide-react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { FeaturesSection } from "@/components/ui/features-section";

// Fetch active polls from database
async function getActivePolls() {
  const supabase = await createClient();
  const { data: polls } = await supabase
    .from("polls")
    .select("id, title, question, slug, total_votes, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return polls || [];
}

export default async function HomePage() {
  const activePolls = await getActivePolls();

  return (
    <main className="min-h-screen overflow-hidden bg-brand-alabaster">
      {/* Animated Hero Section */}
      <section className="relative flex items-center bg-gradient-to-br from-brand-light-orange/60 via-brand-light-mauve/40 to-brand-alabaster">
        <AnimatedHero />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Communication Channels - Premium Design */}
      <section className="py-20 bg-gradient-to-br from-brand-light-orange/60 via-brand-light-mauve/40 to-brand-alabaster/80 relative overflow-hidden">
        {/* Animated decorative elements */}
        <div className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-br from-brand-coral/15 to-brand-coral/10 w-80 h-80 -top-20 right-1/4 animate-pulse" />
        <div className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-br from-brand-indigo/15 to-brand-indigo/10 w-64 h-64 bottom-10 -left-20" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/90 backdrop-blur-sm text-brand-coral text-sm font-semibold rounded-full mb-4 shadow-lg shadow-brand-coral/10 border border-brand-light-grey/50">
              <MessageCircle className="w-4 h-4" />
              Communication
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-black mb-4">
              Talk to Jay
              <br />
              <span className="font-serif italic bg-gradient-to-r from-brand-indigo to-brand-coral bg-clip-text text-transparent">your way</span>
            </h2>
            <p className="text-lg text-brand-dark-grey max-w-2xl mx-auto">
              Choose your preferred communication channel - Jay is available wherever you are
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "Web Chat",
                description: "Rich conversations with document upload, markdown formatting, and checklist integration.",
                best: "Detailed discussions",
                gradient: "from-brand-bright-blue to-[#06B6D4]",
              },
              {
                icon: Phone,
                title: "WhatsApp",
                description: "Quick questions on the go with voice messages and scheduled reminders.",
                best: "Mobile users",
                gradient: "from-brand-bright-emerald to-[#34D399]",
              },
              {
                icon: Zap,
                title: "Voice Call",
                description: "Natural voice conversations in 10 languages with low-latency responses.",
                best: "Hands-free help",
                gradient: "from-brand-indigo to-brand-coral",
              },
            ].map((channel, index) => (
              <div
                key={index}
                className="group relative bg-white/90 backdrop-blur-md border border-brand-light-grey/40 rounded-3xl p-8 text-center shadow-xl shadow-brand-black/5 hover:shadow-2xl hover:shadow-brand-coral/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${channel.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500`} />

                <div className="relative">
                  <div className={`w-18 h-18 bg-gradient-to-br ${channel.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-black/10 group-hover:scale-110 transition-transform duration-300`} style={{ width: '4.5rem', height: '4.5rem' }}>
                    <channel.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-black mb-3">
                    {channel.title}
                  </h3>
                  <p className="text-brand-dark-grey mb-5 leading-relaxed">
                    {channel.description}
                  </p>
                  <span className="inline-block px-4 py-2 bg-brand-alabaster text-brand-dark-grey text-sm font-medium rounded-full border border-brand-light-grey">
                    Best for: {channel.best}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Polls Section - Premium Design */}
      {activePolls.length > 0 && (
        <section id="polls" className="py-20 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#F8F8F8_1px,transparent_1px),linear-gradient(to_bottom,#F8F8F8_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-brand-light-mauve text-brand-coral text-sm font-semibold rounded-full mb-4 shadow-sm">
                <Vote className="w-4 h-4" />
                Your Voice Matters
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-brand-black mb-4">
                Active
                <span className="font-serif italic bg-gradient-to-r from-brand-indigo to-brand-coral bg-clip-text text-transparent"> Polls</span>
              </h2>
              <p className="text-lg text-brand-dark-grey max-w-2xl mx-auto">
                Help us improve by sharing your feedback. Your opinion shapes the future of Jay.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.map((poll, index) => (
                <Link
                  key={poll.id}
                  href={`/p/${poll.slug}`}
                  className="group relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-brand-light-grey/50 shadow-lg shadow-brand-black/5 hover:shadow-xl hover:shadow-brand-coral/20 transition-all duration-300 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient border on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-indigo to-brand-coral rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-light-orange to-brand-light-mauve rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <Vote className="w-7 h-7 text-brand-coral" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-brand-black mb-1.5 truncate group-hover:text-brand-coral transition-colors">
                          {poll.title}
                        </h3>
                        <p className="text-sm text-brand-dark-grey line-clamp-2 mb-3 leading-relaxed">
                          {poll.question}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5 text-brand-mid-grey font-medium">
                            <Users className="w-4 h-4" />
                            {poll.total_votes} votes
                          </span>
                          <span className="px-2.5 py-1 bg-brand-light-emerald text-brand-bright-emerald rounded-full font-semibold border border-brand-mid-emerald">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-brand-light-grey/50 flex items-center justify-between">
                      <span className="text-sm text-brand-dark-grey font-medium">Share your opinion</span>
                      <div className="w-8 h-8 bg-brand-light-orange rounded-full flex items-center justify-center group-hover:bg-brand-light-orange/80 transition-colors">
                        <ArrowRight className="w-4 h-4 text-brand-coral group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Brand Gradient */}
      <section className="py-20 bg-gradient-brand relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute rounded-full blur-3xl pointer-events-none bg-white/10 w-[500px] h-[500px] -bottom-40 -left-40 animate-pulse" />
        <div className="absolute rounded-full blur-3xl pointer-events-none bg-white/10 w-96 h-96 top-0 -right-32" />
        <div className="absolute rounded-full blur-3xl pointer-events-none bg-brand-coral/20 w-64 h-64 top-1/2 left-1/3" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Join 10,000+ UK movers
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to make your
            <br />
            <span className="font-serif italic">move easier?</span>
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of UK movers who&apos;ve simplified their move with Jay&apos;s AI-powered assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://justmovein.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-brand-coral font-bold rounded-2xl shadow-2xl shadow-brand-black/30 hover:shadow-brand-black/40 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started with Jay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gradient-to-b from-brand-alabaster to-white border-t border-brand-light-grey/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo to-brand-coral rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                <div className="relative w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-coral/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-brand-black text-lg">Jay</p>
                <p className="text-sm text-brand-mid-grey">by JustMoveIn</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="https://uk.trustpilot.com/review/justmovein.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-dark-grey hover:text-brand-coral transition-colors font-medium"
              >
                Trustpilot Reviews
              </a>
              <a
                href="https://justmovein.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-dark-grey hover:text-brand-coral transition-colors font-medium"
              >
                JustMoveIn.com
              </a>
              <Link href="/login" className="text-brand-dark-grey hover:text-brand-coral transition-colors font-medium">
                Admin
              </Link>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-brand-light-grey/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brand-mid-grey text-sm">
              &copy; {new Date().getFullYear()} JustMoveIn. All rights reserved.
            </p>
            <p className="text-brand-mid-grey text-sm">
              Made with care for UK movers
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
