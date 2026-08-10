import { useCallback, useEffect, useState } from "react";
import InstagramPanel from "../components/InstagramPanel";

// ponytail: el token vive en localStorage y es uno solo, compartido. Alcanza
// para un sitio que administra una persona. Si alguna vez lo usan varios y hace
// falta saber quien publico que, ahi recien conviene sesiones y usuarios.
const TOKEN_KEY = "newen_admin_token";

const EMPTY_POST = { title: "", body: "", image: "", sport_slug: "", pinned: false };
const EMPTY_EVENT = { title: "", description: "", location: "", starts_at: "", sport_slug: "" };

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [sports, setSports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [post, setPost] = useState(EMPTY_POST);
  const [event, setEvent] = useState(EMPTY_EVENT);

  const api = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
          ...options.headers,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Token incorrecto. Revisá el valor de ADMIN_TOKEN en Render."
            : data.error || `Error ${res.status}`
        );
      }
      return data;
    },
    [token]
  );

  const reload = useCallback(async () => {
    try {
      const [s, p, e] = await Promise.all([api("/sports"), api("/posts"), api("/events")]);
      setSports(s);
      setPosts(p);
      setEvents(e);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    if (token) reload();
  }, [token, reload]);

  async function submit(path, body, reset) {
    setBusy(true);
    setError("");
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      reset();
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(path, label) {
    if (!confirm(`¿Borrar "${label}"? No se puede deshacer.`)) return;
    setError("");
    try {
      await api(path, { method: "DELETE" });
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!token) {
    return (
      <div className="pt-16 pb-24 px-6 max-w-sm mx-auto">
        <p className="section-label mb-2">Club Deportivo Newen</p>
        <h1 className="display-title text-4xl mb-8">Panel</h1>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            const value = new FormData(ev.target).get("token").trim();
            if (!value) return;
            localStorage.setItem(TOKEN_KEY, value);
            setToken(value);
          }}
        >
          <label className="block text-sm text-white/70 mb-2" htmlFor="token">
            Token de administración
          </label>
          <input
            id="token"
            name="token"
            type="password"
            autoFocus
            className="w-full bg-[#111] border border-white/15 rounded-xl px-4 py-3 mb-4 focus:border-white/40 outline-none"
          />
          <button type="submit" className="btn-primary w-full justify-center">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-label mb-2">Club Deportivo Newen</p>
          <h1 className="display-title text-4xl">Panel</h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken("");
          }}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Salir
        </button>
      </div>

      {error && (
        <p className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-8 text-sm">
          {error}
        </p>
      )}

      <InstagramPanel api={api} sports={sports} onImported={reload} />

      {/* ── Noticias ── */}
      <section className="mb-14">
        <h2 className="font-black text-2xl mb-5">Noticias</h2>

        <form
          className="card p-5 mb-6 flex flex-col gap-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            submit("/posts", post, () => setPost(EMPTY_POST));
          }}
        >
          <Input label="Título" value={post.title} onChange={(v) => setPost({ ...post, title: v })} required />
          <Textarea label="Texto" value={post.body} onChange={(v) => setPost({ ...post, body: v })} />
          <Input
            label="Imagen"
            value={post.image}
            onChange={(v) => setPost({ ...post, image: v })}
            placeholder="/images/noticia-handball1.webp"
            hint="Ruta de una foto que ya esté en el sitio, o una URL completa."
          />
          <div className="flex flex-wrap items-end gap-4">
            <SportSelect
              sports={sports}
              value={post.sport_slug}
              onChange={(v) => setPost({ ...post, sport_slug: v })}
            />
            <label className="flex items-center gap-2 text-sm text-white/70 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={post.pinned}
                onChange={(ev) => setPost({ ...post, pinned: ev.target.checked })}
              />
              Destacada
            </label>
            <button disabled={busy} className="btn-primary ml-auto disabled:opacity-50">
              {busy ? "Guardando…" : "Publicar"}
            </button>
          </div>
        </form>

        <List
          items={posts}
          empty="Todavía no hay noticias."
          render={(p) => (
            <>
              <span className="font-semibold">{p.title}</span>
              {p.pinned && <span className="text-newen-green-light text-xs ml-2">destacada</span>}
              <span className="text-white/50 text-xs ml-2">{p.sport_slug || "club"}</span>
            </>
          )}
          onDelete={(p) => remove(`/posts/${p.id}`, p.title)}
        />
      </section>

      {/* ── Eventos ── */}
      <section>
        <h2 className="font-black text-2xl mb-5">Eventos</h2>

        <form
          className="card p-5 mb-6 flex flex-col gap-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            submit("/events", event, () => setEvent(EMPTY_EVENT));
          }}
        >
          <Input label="Título" value={event.title} onChange={(v) => setEvent({ ...event, title: v })} required />
          <Textarea
            label="Descripción"
            value={event.description}
            onChange={(v) => setEvent({ ...event, description: v })}
          />
          <Input label="Lugar" value={event.location} onChange={(v) => setEvent({ ...event, location: v })} />
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha y hora</label>
              <input
                type="datetime-local"
                required
                value={event.starts_at}
                onChange={(ev) => setEvent({ ...event, starts_at: ev.target.value })}
                className="bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 focus:border-white/40 outline-none"
              />
            </div>
            <SportSelect
              sports={sports}
              value={event.sport_slug}
              onChange={(v) => setEvent({ ...event, sport_slug: v })}
            />
            <button disabled={busy} className="btn-primary ml-auto disabled:opacity-50">
              {busy ? "Guardando…" : "Crear evento"}
            </button>
          </div>
        </form>

        <List
          items={events}
          empty="Todavía no hay eventos."
          render={(e) => (
            <>
              <span className="font-semibold">{e.title}</span>
              <span className="text-white/50 text-xs ml-2">
                {new Date(e.starts_at).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </>
          )}
          onDelete={(e) => remove(`/events/${e.id}`, e.title)}
        />
      </section>
    </div>
  );
}

function Input({ label, value, onChange, hint, ...rest }) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-1">{label}</span>
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="w-full bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 focus:border-white/40 outline-none"
        {...rest}
      />
      {hint && <span className="block text-xs text-white/45 mt-1">{hint}</span>}
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-1">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="w-full bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 focus:border-white/40 outline-none resize-y"
      />
    </label>
  );
}

function SportSelect({ sports, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-white/70 mb-1">Deporte</label>
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 focus:border-white/40 outline-none"
      >
        <option value="">Todo el club</option>
        {sports.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function List({ items, empty, render, onDelete }) {
  if (!items.length) return <p className="text-white/45 text-sm">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id} className="card px-4 py-3 flex items-center justify-between gap-4">
          <span className="min-w-0 truncate">{render(item)}</span>
          <button
            onClick={() => onDelete(item)}
            className="text-white/45 hover:text-red-400 transition-colors text-sm flex-shrink-0"
          >
            Borrar
          </button>
        </li>
      ))}
    </ul>
  );
}
