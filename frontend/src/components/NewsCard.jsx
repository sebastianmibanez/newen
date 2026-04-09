export default function NewsCard({ image, label, title, body, size = "normal" }) {
  const isLarge = size === "large";
  return (
    <article className={`editorial-card ${isLarge ? "md:col-span-2" : ""}`}>
      <div className={`overflow-hidden ${isLarge ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        {label && <p className="section-label mb-2">{label}</p>}
        <h3 className={`font-black leading-tight text-white ${isLarge ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
          {title}
        </h3>
        {body && isLarge && (
          <p className="text-white/60 text-sm mt-2 leading-relaxed line-clamp-2">{body}</p>
        )}
      </div>
    </article>
  );
}
