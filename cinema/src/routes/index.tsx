import { Home } from "../pages/Home";
import { Route, Routes } from "react-router-dom";
import { FilmesList } from "../pages/Filmes/FilmesList";
import { FilmeForm } from "../pages/Filmes/FilmeForm";
import { SalasList } from "../pages/Salas/SalasList";
import { SalaForm } from "../pages/Salas/SalaForm";
import { SessoesList } from "../pages/Sessoes/SessoesList";
import { SessaoForm } from "../pages/Sessoes/SessaoForm";

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filmes" element={<FilmesList />} />
        <Route path="/filmes/novo" element={<FilmeForm />} />
        <Route path="/salas" element={<SalasList />} />
        <Route path="/salas/novo" element={<SalaForm />} />
        <Route path="/sessoes" element={<SessoesList />} />
        <Route path="/sessoes/novo" element={<SessaoForm />} />
      </Routes>
    </>
  );
};