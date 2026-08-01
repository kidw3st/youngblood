import { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';

const NAV_LINKS = [
  { href: 'index.html', label: 'Главная' },
  { href: 'about.html', label: 'О нас' },
  { href: 'artists.html', label: 'Артисты' },
  { href: 'location.html', label: 'Расположение' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 z-20 w-full px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="index.html" className="flex items-center gap-2 text-white">
            <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5">
              <path
                d="M6 14l4 3 6-9 6 9 4-3-2 12H8L6 14z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <rect x="9" y="28" width="22" height="2.4" rx="1.2" fill="currentColor" stroke="none" />
            </svg>
            <span className="font-brush text-base tracking-tight">YB</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/90 transition-transform duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+79991234567"
              className="flex items-center gap-2 rounded-xl bg-white p-1 pr-3 transition-transform duration-200 hover:scale-105 active:scale-95 sm:pr-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Phone size={14} strokeWidth={2} className="text-black" />
              </span>
              <span className="hidden text-sm text-gray-900 sm:inline">+7 (999) 123-45-67</span>
            </a>
            <button
              type="button"
              aria-label="Меню"
              onClick={() => setMenuOpen((open) => !open)}
              className="liquid-glass flex h-9 w-9 items-center justify-center rounded-xl text-white transition-transform duration-200 md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="liquid-glass absolute left-4 right-4 top-20 z-20 mx-4 rounded-2xl p-2 md:hidden">
          {[...NAV_LINKS, { href: 'booking.html', label: 'Записаться' }].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
