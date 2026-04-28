import { Link, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GraduationCap } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-[#E2E8F0] fixed w-full z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-primary" size={24} />
                <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Elaris</h1>
                <span className="text-xs text-[#64748B]">Servicios Escolares</span>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  to="/"
                  className="text-sm font-semibold text-[#0F172A] hover:text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/fichas-admision"
                  className="text-sm font-semibold text-[#0F172A] hover:text-primary transition-colors duration-200"
                >
                  Fichas Admisión
                </Link>
                <Link
                  to="/fichas-inscripcion"
                  className="text-sm font-semibold text-[#0F172A] hover:text-primary transition-colors duration-200"
                >
                  Fichas Inscripción
                </Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <Outlet />
      </main>
    </div>
  )
}
