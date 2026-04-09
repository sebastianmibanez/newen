import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <p className="text-7xl">🏆</p>
      <h1 className="text-4xl font-black">Página no encontrada</h1>
      <p className="text-white/50">Esta URL no existe en el sitio de Newen.</p>
      <Link to="/" className="btn-primary">Volver al inicio</Link>
    </div>
  );
}
