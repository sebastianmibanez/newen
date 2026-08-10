import { useCallback, useEffect, useState } from "react";

/** Primera linea util del caption, que es lo mas parecido a un titular que trae
 *  Instagram. Igual queda editable: los captions vienen con hashtags y emojis. */
function tituloSugerido(caption) {
  const linea = (caption || "")
    .split("\n")
    .map((l) => l.replace(/[➡️🔥🥳🙌👏😱💫❤️🏀⚽🤾‍♀️🌍🇨🇳🇨🇱🌏🔵🟢]/gu, "").trim())
    .find((l) => l.length > 3);
  return (linea || "Publicación de Instagram").replace(/#\w+/g, "").trim().slice(0, 90);
}

export default function InstagramPanel({ api, sports, onImported }) {
  const [estado, setEstado] = useState(null);
  const [link, setLink] = useState("");
  const [publicaciones, setPublicaciones] = useState(null);
  const [seleccion, setSeleccion] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const cargarEstado = useCallback(async () => {
    try {
      setEstado(await api("/instagram/status"));
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    cargarEstado();
    // Al volver del OAuth, Instagram nos manda de vuelta con ?instagram=ok
    const params = new URLSearchParams(window.location.search);
    if (params.get("instagram") === "error") {
      setError(`No se pudo conectar: ${params.get("detalle") || "error desconocido"}`);
    }
    if (params.get("instagram")) {
      window.history.replaceState({}, "", "/admin");
    }
  }, [cargarEstado]);

  async function accion(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const generarLink = () =>
    accion(async () => {
      const { url } = await api("/instagram/connect", { method: "POST" });
      setLink(url);
    });

  const traer = () =>
    accion(async () => {
      const items = await api("/instagram/media");
      setPublicaciones(items);
      setSeleccion(
        Object.fromEntries(
          items.filter((i) => !i.imported).map((i) => [i.id, { marcada: false, title: tituloSugerido(i.caption), sport_slug: "" }])
        )
      );
    });

  const importar = () =>
    accion(async () => {
      const items = Object.entries(seleccion)
        .filter(([, v]) => v.marcada)
        .map(([id, v]) => ({ id, title: v.title, sport_slug: v.sport_slug, pinned: false }));
      if (!items.length) throw new Error("No marcaste ninguna publicación.");
      const res = await api("/instagram/import", { method: "POST", body: JSON.stringify({ items }) });
      setPublicaciones(null);
      onImported?.();
      if (res.omitidos?.length) {
        setError(`Importadas ${res.importados.length}. Omitidas: ${res.omitidos.map((o) => o.motivo).join(", ")}`);
      }
    });

  const marcadas = Object.values(seleccion).filter((v) => v.marcada).length;

  return (
    <section className="mb-14">
      <h2 className="font-black text-2xl mb-5">Instagram</h2>

      {error && (
        <p className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </p>
      )}

      <div className="card p-5">
        {!estado ? (
          <p className="text-white/45 text-sm">Cargando…</p>
        ) : estado.connected ? (
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">@{estado.username}</span>
            <span className={`text-xs ${estado.days_left < 15 ? "text-amber-400" : "text-white/50"}`}>
              El acceso vence en {estado.days_left} días (se renueva solo al usarlo)
            </span>
            <button onClick={traer} disabled={busy} className="btn-primary ml-auto disabled:opacity-50">
              {busy ? "Trayendo…" : "Traer publicaciones"}
            </button>
            <button
              onClick={() => accion(async () => { await api("/instagram/disconnect", { method: "POST" }); cargarEstado(); })}
              className="text-sm text-white/45 hover:text-red-400 transition-colors"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white/70 text-sm mb-4">
              La cuenta todavía no está conectada. Generá el link y mandáselo a quien administra el
              Instagram del club: lo abre, aprueba, y listo. Nunca vas a necesitar su contraseña.
            </p>
            {link ? (
              <div className="flex flex-col gap-2">
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <div className="flex gap-3">
                  <button onClick={() => navigator.clipboard?.writeText(link)} className="btn-primary">
                    Copiar link
                  </button>
                  <span className="text-xs text-white/45 self-center">Vence en 30 minutos.</span>
                </div>
              </div>
            ) : (
              <button onClick={generarLink} disabled={busy} className="btn-primary disabled:opacity-50">
                {busy ? "Generando…" : "Generar link de autorización"}
              </button>
            )}
          </div>
        )}
      </div>

      {publicaciones && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/70">
              {publicaciones.length} publicaciones · {marcadas} marcadas
            </p>
            <button onClick={importar} disabled={busy || !marcadas} className="btn-primary disabled:opacity-40">
              {busy ? "Importando…" : `Importar ${marcadas || ""}`}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {publicaciones.map((item) => {
              const sel = seleccion[item.id];
              return (
                <article key={item.id} className={`card p-4 ${item.imported ? "opacity-45" : ""}`}>
                  <div className="flex gap-3">
                    {item.preview && (
                      <img
                        src={item.preview}
                        alt=""
                        loading="lazy"
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/45 mb-1">
                        {new Date(item.timestamp).toLocaleDateString("es-CL")} · {item.media_type}
                      </p>
                      <p className="text-xs text-white/60 line-clamp-3">{item.caption || "(sin texto)"}</p>
                    </div>
                  </div>

                  {item.imported ? (
                    <p className="text-xs text-newen-green-light mt-3">Ya está en el sitio</p>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      <input
                        value={sel?.title || ""}
                        onChange={(e) =>
                          setSeleccion({ ...seleccion, [item.id]: { ...sel, title: e.target.value } })
                        }
                        placeholder="Título para el sitio"
                        className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-2 py-1.5 text-sm"
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={sel?.sport_slug || ""}
                          onChange={(e) =>
                            setSeleccion({ ...seleccion, [item.id]: { ...sel, sport_slug: e.target.value } })
                          }
                          className="bg-[#0a0a0a] border border-white/15 rounded-lg px-2 py-1.5 text-sm"
                        >
                          <option value="">Todo el club</option>
                          {sports.map((s) => (
                            <option key={s.slug} value={s.slug}>{s.name}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto">
                          <input
                            type="checkbox"
                            checked={sel?.marcada || false}
                            onChange={(e) =>
                              setSeleccion({ ...seleccion, [item.id]: { ...sel, marcada: e.target.checked } })
                            }
                          />
                          Importar
                        </label>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
