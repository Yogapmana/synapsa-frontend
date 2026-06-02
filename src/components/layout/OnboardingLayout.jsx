export default function OnboardingLayout({ children }) {
  return (
    <main className="min-h-screen bg-neutral text-primary font-serif">
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">{children}</div>
      </section>
    </main>
  )
}
