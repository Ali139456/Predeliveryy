import Link from 'next/link';

type LegalSection = 'terms' | 'privacy';

export default function LegalPageShell({
  active,
  pageTitle,
  children,
}: {
  active: LegalSection;
  pageTitle: string;
  children: React.ReactNode;
}) {
  const navLink = (section: LegalSection, label: string, href: string) => {
    const isActive = active === section;
    return (
      <Link
        href={href}
        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#0033FF] text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-[#0033FF]'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Legal
            </p>
            <nav className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <ul className="space-y-1">
                <li>{navLink('terms', 'Terms & Conditions', '/terms')}</li>
                <li>{navLink('privacy', 'Privacy Policy', '/privacy')}</li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main document */}
        <main className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <div className="mb-6">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#0033FF]">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="font-medium text-gray-900">{pageTitle}</span>
            </nav>
          </div>
          <div className="legal-doc text-gray-800">{children}</div>
        </main>
      </div>
    </div>
  );
}
