import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { localStorageService, PaymentTransaction, Vehicle } from '../lib/localStorageService';
import { ArrowLeft, Car, CreditCard, Loader2, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface PaymentSummaryProps {
  vehicle: Vehicle;
  onBack?: () => void;
  onCancel?: () => void;
  onProceedToPayment: (transaction: PaymentTransaction) => void;
}

export default function PaymentSummary({ vehicle, onBack, onCancel, onProceedToPayment }: PaymentSummaryProps) {
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    createTransaction();
  }, []);

  const createTransaction = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const result = await localStorageService.createPaymentTransaction(vehicle.id, user.id);
      
      if (result.success && result.transaction) {
        setTransaction(result.transaction);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al crear la transacción');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (transaction) {
      onProceedToPayment(transaction);
    }
  };

  const handleBackClick = () => {
    if (onCancel) {
      onCancel();
    } else if (onBack) {
      onBack();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Preparando transacción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleBackClick}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <CreditCard className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resumen de Compra</h1>
          <p className="text-slate-600">Revisa los detalles antes de proceder al pago</p>
        </div>

        {/* Información del Vehículo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Vehículo Seleccionado</h3>
              <p className="text-lg font-bold text-slate-900">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </p>
            </div>
          </div>

          {vehicle.images && vehicle.images[0] && (
            <div className="mb-4">
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Vendedor:</span>
                <p className="font-medium text-slate-900">{vehicle.userName}</p>
              </div>
              <div>
                <span className="text-slate-600">Kilometraje:</span>
                <p className="font-medium text-slate-900">{vehicle.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <span className="text-slate-600">Transmisión:</span>
                <p className="font-medium text-slate-900">
                  {vehicle.transmission === 'manual' ? 'Manual' : 'Automática'}
                </p>
              </div>
              <div>
                <span className="text-slate-600">Combustible:</span>
                <p className="font-medium text-slate-900">
                  {vehicle.fuelType === 'gasoline' ? 'Gasolina' : 
                   vehicle.fuelType === 'diesel' ? 'Diésel' : 
                   vehicle.fuelType === 'electric' ? 'Eléctrico' : 'Híbrido'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CdA4: Desglose de Pago */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Desglose del Pago</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <p className="text-slate-600">Precio del Vehículo</p>
                <p className="text-xs text-slate-500">Este monto será para el vendedor</p>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {formatPrice(transaction.vehiclePrice)}
              </p>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <p className="text-slate-600">Comisión de TuCarrito.com</p>
                <p className="text-xs text-slate-500">
                  {transaction.commissionRate}% del valor del vehículo
                </p>
              </div>
              <p className="text-xl font-semibold text-blue-600">
                {formatPrice(transaction.commissionAmount)}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 bg-blue-50 -mx-6 px-6 py-4 rounded-lg">
              <div>
                <p className="text-lg font-semibold text-slate-900">Total a Pagar</p>
                <p className="text-sm text-slate-600">Comisión de la plataforma</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatPrice(transaction.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Información Importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-blue-900 mb-3">ℹ️ Información Importante</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• El pago de la comisión es requerido para completar la transacción</li>
            <li>• Una vez aprobado el pago, podrás coordinar con el vendedor</li>
            <li>• El pago al vendedor se realizará directamente entre las partes</li>
            <li>• Recibirás un comprobante de pago por correo electrónico</li>
          </ul>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <button
            onClick={handleBackClick}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleProceed}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Proceder al Pago
          </button>
        </div>

        {/* Nota de Seguridad */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Transacción segura y protegida
          </p>
        </div>
      </div>
    </div>
  );
}
