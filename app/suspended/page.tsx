export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5F3FB]">
        <svg className="h-8 w-8 text-[#103D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-[#103D48]">Account Suspended</h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/50">
        Your account has been suspended or is currently inactive.
        If you believe this is a mistake, please reach out to our support team.
      </p>

      <a
        href="mailto:support@example.com"
        className="mt-8 inline-block rounded-xl bg-[#103D48] px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
      >
        Contact Support
      </a>

      <a href="/" className="mt-4 text-xs text-black/30 underline hover:text-black/60">
        Go back home
      </a>

    </div>
  );
}
