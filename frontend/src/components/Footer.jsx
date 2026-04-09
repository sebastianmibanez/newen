import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/images/logo-newen.jpg" alt="Newen" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-newen-green-light font-black text-sm tracking-tight">CLUB DEPORTIVO NEWEN</span>
            </Link>
            <p className="text-white/25 text-sm leading-relaxed">Renca, Santiago de Chile</p>
          </div>

          {/* Deportes */}
          <div>
            <p className="text-white/50 font-bold text-[10px] tracking-widest uppercase mb-5">Deportes</p>
            <ul className="space-y-3">
              <li><Link to="/handball" className="text-white/30 hover:text-white text-sm transition-colors">Handball</Link></li>
              <li><Link to="/basketball" className="text-white/30 hover:text-white text-sm transition-colors">Basketball</Link></li>
              <li><Link to="/futbol" className="text-white/30 hover:text-white text-sm transition-colors">Fútbol</Link></li>
            </ul>
          </div>

          {/* Club */}
          <div>
            <p className="text-white/50 font-bold text-[10px] tracking-widest uppercase mb-5">Club</p>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/30 hover:text-white text-sm transition-colors">Inicio</Link></li>
              <li><span className="text-white/20 text-sm">Noticias</span></li>
              <li><span className="text-white/20 text-sm">Historia</span></li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <p className="text-white/50 font-bold text-[10px] tracking-widest uppercase mb-5">Redes Sociales</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/club_deportivo_newen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/30 hover:text-white text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/20 text-xs">
          <span>© 2024 Club Deportivo Newen · Renca, Santiago de Chile</span>
          <span>Hecho con orgullo en Renca</span>
        </div>
      </div>
    </footer>
  );
}
