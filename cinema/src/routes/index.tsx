import {Home} from "../pages/Home";
import {Route, Routes} from "react-router-dom";
import {FilmesList} from "../pages/Filmes/FilmesList";
import {FilmeForm} from "../pages/Filmes/FilmeForm";
import {SalasList} from "../pages/Salas/SalasList";
import {SalaForm} from "../pages/Salas/SalaForm";
import {SessoesList} from "../pages/Sessoes/SessoesList";
import {SessaoForm} from "../pages/Sessoes/SessaoForm";
import {PedidosList} from "../pages/Pedidos/PedidosList";
import {LancheCombosList} from "../pages/Combos/LancheCombosList";
import {LancheComboForm} from "../pages/Combos/LancheComboForm";

export const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/filmes" element={<FilmesList/>}/>
                <Route path="/filmes/novo" element={<FilmeForm/>}/>
                <Route path="/filmes/:id/editar" element={<FilmeForm/>}/>
                <Route path="/salas" element={<SalasList/>}/>
                <Route path="/salas/novo" element={<SalaForm/>}/>
                <Route path="/salas/:id/editar" element={<SalaForm/>}/>
                <Route path="/sessoes" element={<SessoesList/>}/>
                <Route path="/sessoes/novo" element={<SessaoForm/>}/>
                <Route path="/sessoes/:id/editar" element={<SessaoForm/>}/>
                <Route path="/pedidos" element={<PedidosList/>}/>
                <Route path="/combos" element={<LancheCombosList/>}/>
                <Route path="/combos/novo" element={<LancheComboForm/>}/>
                <Route path="/combos/:id/editar" element={<LancheComboForm/>}/>
            </Routes>
        </>
    );
};
