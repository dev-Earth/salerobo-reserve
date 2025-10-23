import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Reserve from './pages/Reserve'
import Notfound from './pages/Notfound'
import Regi from './pages/Regi'
import Manag from './pages/Manag'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/reserve" element={<Reserve />} />
                <Route path="/register" element={<Regi />} />
                <Route path="/manag" element={<Manag />} />
                <Route path="*" element={<Notfound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App