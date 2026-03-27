import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import MyBookingsPage from './pages/mybookings'
import MyCarsPage from './pages/mycars'
import ProfilePage from './pages/profile'

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function ProtectedLayout() {
  const user = useSelector((state) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout />
}

function App() {
  const user = useSelector((state) => state.auth.user)

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-cars" element={<MyCarsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
