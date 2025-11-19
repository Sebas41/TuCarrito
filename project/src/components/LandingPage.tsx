import { Car, Shield, DollarSign, Clock, CheckCircle, Users, TrendingUp, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export default function LandingPage({ onShowLogin, onShowRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-2xl font-bold">TuCarrito.com</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onShowLogin}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>
              <button
                onClick={onShowRegister}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Compra y vende tu vehículo de forma <span className="text-blue-200">segura</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                La plataforma más confiable de Colombia para conectar compradores y vendedores de vehículos. 
                Proceso validado, seguro y transparente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onShowRegister}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-lg shadow-lg"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 rounded-lg transition-colors font-semibold text-lg"
                >
                  Conocer Más
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-3"></div>
                <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
                  <div className="space-y-6">
                    {[
                      { icon: Shield, text: 'Usuarios Verificados', color: 'bg-green-400' },
                      { icon: DollarSign, text: 'Comisión Justa del 5%', color: 'bg-yellow-400' },
                      { icon: Clock, text: 'Proceso Rápido', color: 'bg-blue-400' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white/90 rounded-xl p-4 backdrop-blur-sm">
                        <div className={`${item.color} p-3 rounded-lg`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-slate-900 font-medium text-lg">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Por qué elegir TuCarrito.com?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia para comprar o vender tu vehículo con total confianza
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Seguridad Garantizada',
                description: 'Todos los usuarios pasan por un proceso de validación de identidad antes de poder operar en la plataforma.',
                color: 'text-green-600',
                bgColor: 'bg-green-50'
              },
              {
                icon: Users,
                title: 'Comunidad Verificada',
                description: 'Conecta con compradores y vendedores reales, verificados y confiables a través de nuestro sistema de mensajería.',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                icon: DollarSign,
                title: 'Comisión Justa',
                description: 'Solo cobramos el 5% de comisión al comprador cuando se concreta la transacción. Sin costos ocultos.',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50'
              },
              {
                icon: CheckCircle,
                title: 'Proceso Transparente',
                description: 'Seguimiento completo de tu publicación, mensajes y transacciones en un solo lugar.',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50'
              },
              {
                icon: Clock,
                title: 'Rápido y Eficiente',
                description: 'Publica tu vehículo en minutos y comienza a recibir ofertas de compradores interesados inmediatamente.',
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50'
              },
              {
                icon: TrendingUp,
                title: 'Mejor Alcance',
                description: 'Tu vehículo será visible para miles de compradores potenciales en toda Colombia.',
                color: 'text-red-600',
                bgColor: 'bg-red-50'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`${benefit.bgColor} p-3 rounded-lg inline-flex mb-4`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              En solo 3 simples pasos puedes comenzar a comprar o vender tu vehículo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Para Vendedores */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <Car className="w-8 h-8" />
                Para Vendedores
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Regístrate y Verifica',
                    description: 'Crea tu cuenta y completa el proceso de validación de identidad.'
                  },
                  {
                    step: '2',
                    title: 'Publica tu Vehículo',
                    description: 'Sube fotos, describe tu vehículo y establece el precio. Tu publicación será revisada antes de publicarse.'
                  },
                  {
                    step: '3',
                    title: 'Conecta con Compradores',
                    description: 'Recibe mensajes de interesados, negocia directamente y cierra la venta.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">{item.title}</h4>
                      <p className="text-blue-800">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Para Compradores */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                <Users className="w-8 h-8" />
                Para Compradores
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Crea tu Cuenta',
                    description: 'Regístrate y valida tu identidad para acceder al catálogo completo de vehículos.'
                  },
                  {
                    step: '2',
                    title: 'Busca tu Vehículo',
                    description: 'Explora miles de opciones, filtra por marca, modelo, precio y más.'
                  },
                  {
                    step: '3',
                    title: 'Compra Seguro',
                    description: 'Contacta al vendedor, paga la comisión del 5% y coordina la entrega directamente.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">{item.title}</h4>
                      <p className="text-green-800">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya confían en TuCarrito.com para sus transacciones de vehículos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShowRegister}
              className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Crear Cuenta Gratis
            </button>
            <button
              onClick={onShowLogin}
              className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Usuarios Registrados' },
              { number: '5,000+', label: 'Vehículos Publicados' },
              { number: '3,000+', label: 'Transacciones Exitosas' },
              { number: '4.8/5', label: 'Calificación Promedio' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">TuCarrito.com</span>
              </div>
              <p className="text-slate-400">
                La plataforma más confiable para comprar y vender vehículos en Colombia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={onShowRegister} className="hover:text-white transition-colors">Registrarse</button></li>
                <li><button onClick={onShowLogin} className="hover:text-white transition-colors">Iniciar Sesión</button></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo Funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="mailto:soporte@tucarrito.com" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Seguridad</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Usuarios Verificados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Pagos Seguros
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Datos Protegidos
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 TuCarrito.com. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
