import { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import EventCard from "../components/EventCard";

// Lo unico que queda hardcodeado son las fotos de portada y del carrusel: son la
// identidad fija de cada disciplina. Las noticias vienen de la API, asi lo que se
// carga en /admin o se importa de Instagram aparece aca sin tocar codigo.
const SPORT_META = {
  handball: {
    label: "Handball",
    desc: "Escuelita · Infantiles · Cadetas",
    carouselImages: [
      "/images/carrousel-handball1.webp",
      "/images/carrousel-handball2.webp",
      "/images/carrousel-handball3.webp",
    ],
  },
  basketball: {
    label: "Basketball",
    desc: "Escuelita",
    carouselImages: [
      "/images/carrousel-basket1.webp",
      "/images/carrousel-basket2.webp",
      "/images/carrousel-basket3.webp",
    ],
  },
  futbol: {
    label: "Fútbol",
    desc: "Escuelita",
    carouselImages: [
      "/images/carrousel-futbol1.webp",
      "/images/carrousel-futbol2.webp",
      "/images/carrousel-futbol3.webp",
    ],
  },
};

export default function SportPage({ slug }) {
  const meta = SPORT_META[slug] || {};
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    Promise.all([
      fetch(`/api/posts?sport=${slug}`).then((r) => r.json()),
      fetch(`/api/events?sport=${slug}&upcoming=true`).then((r) => r.json()),
    ])
      .then(([p, e]) => {
        if (!vigente) return;
        setPosts(Array.isArray(p) ? p : []);
        setEvents(Array.isArray(e) ? e : []);
      })
      .catch(() => {})
      .finally(() => vigente && setCargando(false));
    // Al cambiar de deporte sin desmontar, la respuesta vieja puede llegar
    // despues de la nueva y pisarla.
    return () => {
      vigente = false;
    };
  }, [slug]);

  const portada = meta.carouselImages?.[0];

  return (
    <>
      {/* ── Portada del deporte ── */}
      <section className="relative h-[42vh] min-h-[300px] overflow-hidden">
        {portada && (
          <img
            src={portada}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/55 to-[#0a0b0d]/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-10 pb-10">
            <p className="section-label mb-3">{meta.desc} · Club Deportivo Newen</p>
            <h1 className="display-title text-5xl md:text-7xl">{meta.label}</h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 flex flex-col gap-16">
        {meta.carouselImages?.length > 0 && (
          <section>
            <p className="section-label mb-4">Galería</p>
            <Carousel images={meta.carouselImages} />
          </section>
        )}

        {posts.length > 0 && (
          <section>
            <h2 className="display-title text-3xl md:text-4xl mb-8">Noticias</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group relative overflow-hidden rounded-2xl bg-[#121317] min-h-[280px] flex"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="relative mt-auto p-6">
                    <h3 className="font-black text-xl md:text-2xl leading-tight mb-2">{post.title}</h3>
                    {post.body && (
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{post.body}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="display-title text-3xl md:text-4xl mb-8">Próximos eventos</h2>
          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-white/45 py-8">
              No hay eventos programados por ahora. Seguinos en{" "}
              <a
                href="https://www.instagram.com/club_deportivo_newen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-newen-green-light hover:underline"
              >
                Instagram
              </a>{" "}
              para enterarte de los próximos.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
