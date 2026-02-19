export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="decorative-blob blob-coral w-96 h-96 -top-32 -left-32 opacity-40" />
      <div className="decorative-blob blob-lavender w-80 h-80 top-1/3 -right-20 opacity-40" />
      <div className="decorative-blob blob-cream w-64 h-64 bottom-10 left-1/4 opacity-50" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
