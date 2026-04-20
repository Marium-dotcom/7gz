import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const sidebarLinks = [
  { href: '/admin/hero', label: 'Hero Section', icon: '🖼' },
  { href: '/admin/services', label: 'Services', icon: '⚙️' },
  { href: '/admin/blog', label: 'Blog Posts', icon: '✍️' },
  { href: '/admin/about', label: 'About Section', icon: '📝' },
  { href: '/admin/features', label: 'Features', icon: '✨' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
  { href: '/admin/footer', label: 'Footer', icon: '📌' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/doctors', label: 'Doctors', icon: '🩺' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white flex flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <svg
            aria-label="Appo admin"
            viewBox="0 0 32 32"
            fill="none"
            className="h-7 w-7 shrink-0"
          >
            <rect width="32" height="32" rx="8" fill="#01696f" />
            <path
              d="M10 22L16 10L22 22M13 18h6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold text-gray-900 text-sm">Appo Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Sections
          </p>
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                Admin
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}