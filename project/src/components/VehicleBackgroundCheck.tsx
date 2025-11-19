import { useState, useEffect } from 'react';
import { localStorageService, VehicleBackground } from '../lib/localStorageService';
import { Search, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import VehicleHistoryReport from './VehicleHistoryReport';

interface VehicleBackgroundCheckProps {
  onBack?: () => void;
  initialLicensePlate?: string; // CA4: Para acceso desde ficha del vehículo
}

export default function VehicleBackgroundCheck({ onBack, initialLicensePlate = '' }: VehicleBackgroundCheckProps) {
  const [licensePlate, setLicensePlate] = useState(initialLicensePlate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [background, setBackground] = useState<VehicleBackground | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // CA1 & CA3: Manejar búsqueda
  const handleSearch = async () => {
    if (!licensePlate.trim()) {
      setError('Por favor ingrese un número de placa');
      return;
    }

    setLoading(true);
    setError('');
    setBackground(null);
    setSearchPerformed(true);

    try {
      const result = await localStorageService.getVehicleBackground(licensePlate);
      
      if (result.success && result.background) {
        // CA1: Consulta exitosa
        setBackground(result.background);
      } else {
        // CA3: Datos inválidos
        setError(result.message);
      }
    } catch {
      setError('Error al consultar los antecedentes. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // CA4: Si hay placa inicial, buscar automáticamente
  useEffect(() => {
    if (initialLicensePlate) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNewSearch = () => {
    setLicensePlate('');
    setBackground(null);
    setError('');
    setSearchPerformed(false);
  };

  // Si ya hay un reporte, mostrarlo
  if (background) {
    return (
      <VehicleHistoryReport 
        background={background}
        onBack={handleNewSearch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      {onBack && (
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Consulta de Antecedentes</h1>
          <p className="text-slate-600">
            Verifica el historial completo del vehículo antes de realizar tu compra
          </p>
        </div>

        {/* CA5: Información sobre tiempo de respuesta */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Consulta segura y rápida</p>
              <p>La información se obtiene en menos de 5 segundos desde bases de datos oficiales.</p>
            </div>
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Número de Placa
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length <= 6) {
                  setLicensePlate(value);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono uppercase"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !licensePlate.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Formato: ABC123 o ABC12D (6 caracteres)
          </p>
        </div>

        {/* CA3: Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900 mb-1">No se encontraron resultados</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {!searchPerformed && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              ¿Qué incluye la consulta?
            </h3>
            <ul className="space-y-3">
              {[
                'Historial de propiedad y propietarios anteriores',
                'Reportes de accidentes y siniestros',
                'Estado de revisiones técnico-mecánicas y de gases',
                'Denuncias de robo o hurto',
                'Multas e infracciones pendientes',
                'Información del vehículo (VIN, marca, modelo, año)'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
