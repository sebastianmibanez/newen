export default function PostCard({ post }) {
  const date = new Date(post.created_at).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="card group cursor-default">
      {post.image && (
        <div className="aspect-square overflow-hidden">
          <img
            src={post.image}
            alt={post.title || "Publicación"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        {post.pinned && (
          <span className="inline-block text-xs font-bold text-newen-green-light mb-2">📌 Destacado</span>
        )}
        {post.title && <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.title}</h3>}
        {post.body && <p className="text-white/60 text-sm line-clamp-3">{post.body}</p>}
        <p className="text-white/30 text-xs mt-3">{date}</p>
      </div>
    </article>
  );
}
