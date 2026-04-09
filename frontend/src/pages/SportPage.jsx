import { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import PostCard from "../components/PostCard";
import EventCard from "../components/EventCard";

const SPORT_META = {
  handball: {
    label: "Handball",
    emoji: "🤾‍♀️",
    desc: "Escuelita · Infantiles · Cadetas",
    accentClass: "text-green-400",
    bgClass: "from-green-900/40 to-emerald-900/20",
    gradient: "from-green-600 to-emerald-400",
    carouselImages: [
      "/images/carrousel-handball1.png",
      "/images/carrousel-handball2.png",
      "/images/carrousel-handball3.png",
    ],
    news: [
      {
        image: "/images/noticia-handball1.png",
        title: "NOTICIÓN 🔥 Antonia Fuentes al Mundial Juvenil en China",
        body: "Nos levantamos este día con una tremenda noticia: nuestra querida Antonia Fuentes, jugadora de la categoría cadete de Balonmano, parte rumbo al MUNDIAL JUVENIL DE ESPECIALIDAD EN CHINA 🌍🇨🇳 ¡Estamos tremendamente orgullosos de ti Anto! Todo el esfuerzo, las mil horas de entrenamiento, el sacrificio y el gran amor por el Balonmano te trajeron hasta aquí. ¡Te deseamos el mayor de los éxitos! 💫 Vamos Chile 🇨🇱",
      },
      {
        image: "/images/noticia-handball2.png",
        title: "5° Aniversario 2024 🔵🟢🔥",
        body: "Seguimos compartiendo fotos de nuestro Aniversario. En las fotos aparecen la sub 17 de básquet, los niños de fútbol y la premiación con el premio \"Jugador Newen\": aquel jugador que engloba compañerismo, esfuerzo, disciplina y constancia. Nos acompañaron Víctor Cepeda (Psicólogo Deportivo), nuestros amigos de @mundofreestylechile y el Alcalde Claudio Castro. 🙌",
      },
    ],
  },
  basketball: {
    label: "Basketball",
    emoji: "🏀",
    desc: "Escuelita",
    accentClass: "text-orange-400",
    bgClass: "from-orange-900/40 to-amber-900/20",
    gradient: "from-orange-600 to-amber-400",
    carouselImages: [
      "/images/carrousel-basket1.png",
      "/images/carrousel-basket2.png",
      "/images/carrousel-basket3.png",
    ],
    news: [],
  },
  futbol: {
    label: "Fútbol",
    emoji: "⚽",
    desc: "Escuelita",
    accentClass: "text-blue-400",
    bgClass: "from-blue-900/40 to-indigo-900/20",
    gradient: "from-blue-700 to-blue-400",
    carouselImages: [
      "/images/carrousel-futbol1.png",
      "/images/carrousel-futbol2.png",
      "/images/carrousel-futbol3.png",
    ],
    news: [
      {
        image: "/images/noticia-futbol1.png",
        title: "Noticias Fútbol",
        body: "",
      },
    ],
  },
};

export default function SportPage({ slug }) {
  const meta = SPORT_META[slug] || {};
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    setLoadingEvents(true);
    fetch(`/api/events?sport=${slug}&upcoming=true`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, [slug]);

  return (
    <>
      {/* ── Sport header ── */}
      <section className={`bg-gradient-to-br ${meta.bgClass} border-b border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 py-10 flex items-center gap-5">
          <span className="text-5xl">{meta.emoji}</span>
          <div>
            <h1 className={`text-4xl font-black tracking-tight ${meta.accentClass}`}>{meta.label}</h1>
            <p className="text-white/50 mt-0.5">{meta.desc} · Club Deportivo Newen</p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-16">

        {/* ── Carousel ── */}
        {meta.carouselImages?.length > 0 && (
          <section>
            <Carousel images={meta.carouselImages} />
          </section>
        )}

        {/* ── Noticias ── */}
        {meta.news?.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-6">Noticias</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {meta.news.filter(n => n.title).map((noticia, i) => (
                <article key={i} className="card overflow-hidden flex flex-col">
                  {noticia.image && (
                    <img
                      src={noticia.image}
                      alt={noticia.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="font-bold text-lg leading-snug">{noticia.title}</h3>
                    {noticia.body && (
                      <p className="text-white/60 text-sm leading-relaxed">{noticia.body}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Próximos eventos ── */}
        <section>
          <h2 className="text-2xl font-black mb-6">Próximos eventos</h2>
          {loadingEvents ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState message="No hay eventos programados por ahora." />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </section>

      </div>
    </>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-white/30">
      <p className="text-3xl mb-2">🏆</p>
      <p>{message}</p>
    </div>
  );
}
