import { auth, signIn, signOut } from '@/auth';
import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Doctors', href: '/book' },
  { label: 'Blog', href: '/blog' },
];

export const Navbar = async () => {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="w-full bg-white border-b border-black/8">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-10 py-4">

        {/* Logo */}
        <Link href="/" className="text-base font-extrabold tracking-tight text-[#103D48]">
          MediCare
        </Link>

        {/* Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-black/70 transition-colors hover:text-[#103D48]"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {role === 'admin' && (
            <li>
              <Link href="/admin/hero" className="text-sm font-medium text-black/70 transition-colors hover:text-[#103D48]">
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Auth */}
        {session?.user ? (
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-[#103D48]/30 bg-[#E5F3FB] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#103D48] transition-colors hover:bg-[#103D48] hover:text-white"
            >
              Sign out
            </button>
          </form>
        ) : (
          <form
            action={async () => {
              'use server';
              await signIn('google');
            }}
          >
            <button
              type="submit"
              className="rounded-full bg-[#103D48] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black"
            >
              Sign in
            </button>
          </form>
        )}

      </nav>
    </header>
  );
};
