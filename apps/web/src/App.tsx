import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Importando todos os CSS existentes para preservar a estética
import './App.css'

// Componentes de páginas (vamos criar preservando o HTML atual)
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MinhasCifrasPage from './pages/MinhasCifrasPage'
import FavoritasPage from './pages/FavoritasPage'
import PerfilPage from './pages/PerfilPage'
import RepertoriosPage from './pages/RepertoriosPage'
import CategoriasPage from './pages/CategoriasPage'
import RepertoriosComunidadePage from './pages/RepertoriosComunidadePage'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/minhas-cifras" element={<MinhasCifrasPage />} />
          <Route path="/favoritas" element={<FavoritasPage />} />
          <Route path="/repertorios" element={<RepertoriosPage />} />
          <Route path="/repertorios-comunidade" element={<RepertoriosComunidadePage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
