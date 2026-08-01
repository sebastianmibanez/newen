import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const SPORTS = [
  { to: "/handball", label: "Handball" },
  { to: "/basketball", label: "Basketball" },
  { to: "/futbol", label: "Fútbol" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-10 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mr-10 flex-shrink-0">
        <img src="/images/logo-newen.webp" alt="Newen" className="w-8 h-8 rounded-full object-cover" />
        <span className="font-black text-base tracking-tight text-white hidden sm:block">
          CLUB <span className="text-newen-green-light">NEWEN</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {SPORTS.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                isActive ? "bg-white text-black" : "text-white/55 hover:text-white"
              }`
            }
          >
            {s.label}
          </NavLink>
        ))}
      </div>

      {/* Right side: Instagram + CTA */}
      <div className="hidden md:flex items-center gap-5 ml-auto">
        <a
          href="https://www.instagram.com/club_deportivo_newen"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors tracking-wide"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @club_deportivo_newen
        </a>

        <a
          href="https://www.instagram.com/club_deportivo_newen"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !py-2 !px-5 text-xs"
        >
          Inscríbete
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto p-2 text-white/60 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex flex-col gap-1 md:hidden">
          {SPORTS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isActive ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/5 mt-2">
            <a
              href="https://www.instagram.com/club_deportivo_newen"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center text-xs"
            >
              Inscríbete
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
