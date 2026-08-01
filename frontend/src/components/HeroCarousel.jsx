import { useState, useEffect, useCallback } from "react";

export default function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 700);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full h-[92vh] min-h-[560px] overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-16 md:pb-20 max-w-4xl">
        {slide.label && (
          <span className="section-label mb-4">{slide.label}</span>
        )}
        <h2 className="display-title text-4xl md:text-6xl lg:text-7xl text-white mb-4 max-w-2xl">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed mb-8">
            {slide.subtitle}
          </p>
        )}
        {slide.cta && (
          <div>
            <a href={slide.cta.href} className="btn-primary">{slide.cta.label}</a>
          </div>
        )}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 hover:border-white/60 bg-black/30 hover:bg-black/60 flex items-center justify-center text-white text-xl transition-all backdrop-blur-sm"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Foto siguiente"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 hover:border-white/60 bg-black/30 hover:bg-black/60 flex items-center justify-center text-white text-xl transition-all backdrop-blur-sm"
          >
            ›
          </button>
        </>
      )}

      {/* Progress dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-8 md:right-16 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a la foto ${i + 1}`}
              aria-current={i === current}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-8 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
