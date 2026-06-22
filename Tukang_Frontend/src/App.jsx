import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import RegisterPelanggan from "./pages/registerPelanggan";
import RegisterTukang from "./pages/registerTukang";
import Login from "./pages/login";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register-pelanggan" element={<RegisterPelanggan />} />

        <Route path="/register-tukang" element={<RegisterTukang />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
