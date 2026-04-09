import { Link } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";

const HERO_SLIDES = [
  {
    image: "/images/carrousel-handball1.png",
    label: "Handball · Cadetes",
    title: "Antonia Fuentes al Mundial Juvenil en China",
    subtitle: "Nuestra jugadora cadete parte a representar a Chile en el mundo. Orgullo Newen.",
    cta: { label: "Ver más", href: "/handball" },
  },
  {
    image: "/images/carrousel-basket1.png",
    label: "Basketball · Escuelita",
    title: "Basketball en Newen",
    subtitle: "Formando a los próximos talentos del básquetbol en Renca.",
    cta: { label: "Ver Basketball", href: "/basketball" },
  },
  {
    image: "/images/carrousel-futbol1.png",
    label: "Fútbol · Escuelita",
    title: "El fútbol que une a Renca",
    subtitle: "Escuelita de fútbol para niños y niñas de la comuna.",
    cta: { label: "Ver Fútbol", href: "/futbol" },
  },
];

const FIXTURES = [
  {
    sport: "Handball · Cadetes",
    home: "Newen",
    away: "Puerto Montt",
    result: "28 – 24",
    isResult: true,
    competition: "Liga Nacional",
    date: "5 Abr",
  },
  {
    sport: "Handball · Infantiles",
    home: "Newen",
    away: "Mapocho HC",
    result: null,
    isResult: false,
    competition: "Torneo Regional",
    date: "12 Abr",
  },
  {
    sport: "Basketball · Escuelita",
    home: "Newen",
    away: "Las Condes BC",
    result: "42 – 38",
    isResult: true,
    competition: "Torneo Infantil",
    date: "6 Abr",
  },
  {
    sport: "Fútbol · Escuelita",
    home: "Newen",
    away: "Cerro Navia FC",
    result: null,
    isResult: false,
    competition: "Torneo Comunal",
    date: "14 Abr",
  },
  {
    sport: "Handball · Cadetes",
    home: "Newen",
    away: "Valparaíso HC",
    result: null,
    isResult: false,
    competition: "Liga Nacional",
    date: "19 Abr",
  },
];

const NEWS_FEATURED = {
  image: "/images/noticia-handball1.png",
  label: "Handball · Cadetes",
  title: "Antonia Fuentes al Mundial Juvenil en China",
  body: "Nuestra jugadora cadete parte rumbo al Mundial Juvenil de Especialidad. Todo el esfuerzo y constancia tienen su recompensa. Orgullo Newen.",
};

const NEWS_SECONDARY = [
  {
    image: "/images/noticia-handball2.png",
    label: "Club · Aniversario",
    title: "5° Aniversario Newen 2024",
  },
  {
    image: "/images/noticia-futbol1.png",
    label: "Fútbol · Escuelita",
    title: "Novedades de la Escuelita de Fútbol",
  },
];

const SPORTS = [
  {
    to: "/handball",
    label: "Handball",
    image: "/images/carrousel-handball1.png",
    desc: "Escuelita · Infantiles · Cadetas",
    accent: "from-green-900/70",
  },
  {
    to: "/basketball",
    label: "Basketball",
    image: "/images/carrousel-basket1.png",
    desc: "Escuelita",
    accent: "from-orange-900/70",
  },
  {
    to: "/futbol",
    label: "Fútbol",
    image: "/images/carrousel-futbol1.png",
    desc: "Escuelita",
    accent: "from-blue-900/70",
  },
];

export default function Landing() {
  return (
    <>
      {/* ── Hero carousel fullscreen ── */}
      <div className="pt-16">
        <HeroCarousel slides={HERO_SLIDES} />
      </div>

      {/* ── Fixtures / Resultados strip ── */}
      <section className="bg-[#111] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <span className="section-label">Partidos &amp; Resultados</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/20">2024</span>
          </div>
          <div className="flex gap-3 overflow-x-auto py-5 pb-6" style={{ scrollbarWidth: "none" }}>
            {FIXTURES.map((f, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-52 bg-[#161616] rounded-2xl p-4 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
              >
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-1">{f.competition}</p>
                <p className="text-[10px] font-semibold text-newen-green-light mb-3">{f.sport}</p>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">{f.home}</span>
                    {f.isResult && <span className="font-black text-sm text-newen-green-light tabular-nums">{f.result.split("–")[0].trim()}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white/50">{f.away}</span>
                    {f.isResult && <span className="font-bold text-sm text-white/40 tabular-nums">{f.result.split("–")[1].trim()}</span>}
                  </div>
                </div>
                <p className="text-[10px] text-white/20 border-t border-white/5 pt-2">
                  {f.isResult ? `Resultado · ${f.date}` : `Próximo · ${f.date}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Noticias – editorial PSG style ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">Club Deportivo Newen</p>
            <h2 className="display-title text-4xl md:text-5xl">Noticias</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Featured large – 2/3 width */}
          <article className="group relative overflow-hidden rounded-2xl bg-[#111] cursor-pointer md:col-span-2">
            <div className="aspect-[16/9]">
              <img
                src={NEWS_FEATURED.image}
                alt={NEWS_FEATURED.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="section-label mb-3">{NEWS_FEATURED.label}</p>
              <h3 className="font-black text-2xl md:text-3xl text-white leading-tight mb-2">
                {NEWS_FEATURED.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed hidden md:block">{NEWS_FEATURED.body}</p>
            </div>
          </article>

          {/* Stacked secondary – 1/3 width */}
          <div className="flex flex-col gap-4">
            {NEWS_SECONDARY.map((n, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-[#111] cursor-pointer flex-1 min-h-[180px]"
              >
                <img
                  src={n.image}
                  alt={n.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className="section-label mb-2">{n.label}</p>
                  <h3 className="font-black text-base md:text-lg text-white leading-tight">{n.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disciplinas – visual sport cards ── */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="mb-8">
            <p className="section-label mb-2">Nuestros deportes</p>
            <h2 className="display-title text-4xl md:text-5xl">Disciplinas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {SPORTS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group relative overflow-hidden rounded-2xl block"
                style={{ aspectRatio: "3/4" }}
              >
                <img
                  src={s.image}
                  alt={s.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${s.accent} to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-2">{s.desc}</p>
                  <h3 className="font-black text-2xl text-white mb-3">{s.label}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                    Ver más ›
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Somos Newen – CTA ── */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-4">Renca · Santiago de Chile</p>
            <h2 className="display-title text-4xl md:text-6xl mb-6">Somos Newen</h2>
            <p className="text-white/45 leading-relaxed mb-8 max-w-md text-[15px]">
              Comprometidos con el desarrollo deportivo y social de niños, niñas y jóvenes a través del Handball, Basketball y Fútbol. Nuestras escuelas están abiertas para todas las edades.
            </p>
            <a
              href="https://www.instagram.com/club_deportivo_newen"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Síguenos en Instagram
            </a>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/images/logo-newen.jpg"
              alt="Logo Newen"
              className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>
    </>
  );
}
