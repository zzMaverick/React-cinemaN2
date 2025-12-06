import { BrowserRouter } from "react-router-dom";
import { Nav } from "./components/Nav";
import {AppRouter} from "./routes";

function App() {
    return(
        <>
            <BrowserRouter>
                <Nav/>
                <AppRouter/>
            </BrowserRouter>
        </>
    )
}

export default App
