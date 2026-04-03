import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store'
import NavBar from './components/NavBar'
import PostsSection from './components/PostsSection'
import UsersSection from './components/UsersSection'
import ProductsSection from './components/ProductsSection'
import ToastContainer from './components/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <NavBar />
        <main>
          <Routes>
            <Route path="/posts" element={<PostsSection />} />
            <Route path="/users" element={<UsersSection />} />
            <Route path="/products" element={<ProductsSection />} />
            <Route path="*" element={<Navigate to="/posts" replace />} />
          </Routes>
        </main>
        <footer>
          <p>Лабораторная работа №7 - Работа с API (React)</p>
        </footer>
        <ToastContainer />
      </StoreProvider>
    </BrowserRouter>
  )
}
