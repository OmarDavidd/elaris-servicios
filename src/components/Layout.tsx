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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-[#1D7B43]" size={24} />
                <h1 className="text-xl font-bold tracking-tight text-black">Elaris</h1>
                <span className="text-xs text-gray-600">Servicios Escolares</span>
              </div>
              <nav className="flex items-center gap-6">
                <Link 
                  to="/" 
                  className="text-sm font-semibold text-black hover:text-[#1D7B43] transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/fichas-admision" 
                  className="text-sm font-semibold text-black hover:text-[#1D7B43] transition-colors"
                >
                  Fichas Admisión
                </Link>
                <Link 
                  to="/fichas-inscripcion" 
                  className="text-sm font-semibold text-black hover:text-[#1D7B43] transition-colors"
                >
                  Fichas Inscripción
                </Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#1D7B43] text-white text-sm font-bold rounded-lg hover:bg-[#155f32] transition-colors"
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
