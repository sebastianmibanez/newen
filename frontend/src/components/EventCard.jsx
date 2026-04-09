export default function EventCard({ event }) {
  const starts = new Date(event.starts_at);
  const dayName = starts.toLocaleDateString("es-CL", { weekday: "long" });
  const day = starts.getDate();
  const month = starts.toLocaleDateString("es-CL", { month: "short" });
  const time = starts.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  return (
    <article className="card flex gap-4 p-4">
      {/* Date badge */}
      <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center bg-newen-green/20 rounded-xl py-3">
        <span className="text-newen-green-light text-xs font-bold uppercase">{month}</span>
        <span className="text-white text-2xl font-black leading-none">{day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white/40 text-xs capitalize mb-1">{dayName} · {time} hs</p>
        <h3 className="font-bold leading-snug line-clamp-2">{event.title}</h3>
        {event.location && (
          <p className="text-white/50 text-sm mt-1 flex items-center gap-1">
            <span>📍</span> {event.location}
          </p>
        )}
        {event.description && (
          <p className="text-white/60 text-sm mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
    </article>
  );
}
