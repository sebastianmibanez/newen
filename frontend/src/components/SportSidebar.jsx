import { NavLink } from "react-router-dom";

const SPORTS = [
  { slug: "handball", label: "Handball", emoji: "🤾‍♀️", accent: "text-green-400", activeBg: "bg-green-500/20 border-green-500/40" },
  { slug: "basketball", label: "Basketball", emoji: "🏀", accent: "text-orange-400", activeBg: "bg-orange-500/20 border-orange-500/40" },
  { slug: "futbol", label: "Fútbol", emoji: "⚽", accent: "text-blue-400", activeBg: "bg-blue-500/20 border-blue-500/40" },
];

const TABS = [
  { key: "galeria", label: "Galería", icon: "📸" },
  { key: "eventos", label: "Eventos", icon: "📅" },
];

export default function SportSidebar({ currentSlug, activeTab, onTabChange }) {
  const currentSport = SPORTS.find((s) => s.slug === currentSlug);

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col gap-6 py-8 pr-4">
      {/* Sport switcher */}
      <div>
        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3 px-3">Deportes</p>
        <nav className="flex flex-col gap-1">
          {SPORTS.map((s) => (
            <NavLink
              key={s.slug}
              to={`/${s.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isActive
                    ? `${s.activeBg} ${s.accent} border-current`
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="text-lg">{s.emoji}</span>
              {s.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Section tabs for current sport */}
      <div>
        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3 px-3">Sección</p>
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
                activeTab === t.key
                  ? `${currentSport?.activeBg || "bg-white/10 border-white/20"} ${currentSport?.accent || "text-white"}`
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Back to home */}
      <div className="mt-auto">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          ← Inicio
        </NavLink>
      </div>
    </aside>
  );
}
