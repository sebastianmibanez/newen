import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import SportPage from "./pages/SportPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {/* pt-16 libra la Navbar, que es fixed. Va aca y no en cada pagina: la
            SportPage no lo tenia y el titulo quedaba tapado por la barra. */}
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/handball" element={<SportPage slug="handball" />} />
            <Route path="/basketball" element={<SportPage slug="basketball" />} />
            <Route path="/futbol" element={<SportPage slug="futbol" />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
