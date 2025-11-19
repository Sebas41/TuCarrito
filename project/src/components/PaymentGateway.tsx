import { useState } from 'react';
import { localStorageService, PaymentTransaction, Vehicle } from '../lib/localStorageService';
import { ArrowLeft, CreditCard, Building2, Loader2, Lock } from 'lucide-react';

interface PaymentGatewayProps {
  vehicle: Vehicle;
  transaction: PaymentTransaction;
  onSuccess: (transaction: PaymentTransaction) => void;
  onRejected: (transaction: PaymentTransaction, reason: string) => void;
  onCancel: () => void;
}

export default function PaymentGateway({ vehicle, transaction, onSuccess, onRejected, onCancel }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const validateForm = (): boolean => {
    setError('');

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardNumber || cardNumber.length !== 16) {
        setError('Número de tarjeta inválido (16 dígitos)');
        return false;
      }

      if (!cardName.trim()) {
        setError('Nombre del titular requerido');
        return false;
      }

      if (!expiryDate || expiryDate.length !== 5) {
        setError('Fecha de vencimiento inválida (MM/AA)');
        return false;
      }

      if (!cvv || cvv.length < 3) {
        setError('CVV inválido (3-4 dígitos)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);
    setError('');

    try {
      const result = await localStorageService.processPayment(
        transaction.id,
        paymentMethod,
        cardNumber
      );

      if (result.success && result.transaction) {
        // CdA1: Pago exitoso
        onSuccess(result.transaction);
      } else {
        // CdA2: Pago rechazado
        onRejected(result.transaction!, result.message);
      }
    } catch (err) {
      setError('Error al procesar el pago');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelClick = async () => {
    // CdA3: Cancelación del pago - permanece pendiente
    await localStorageService.cancelPayment(transaction.id);
    onCancel();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleCancelClick}
              disabled={processing}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Cancelar Pago
            </button>
            <div className="flex items-center gap-2 text-green-600">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Pago Seguro</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pasarela de Pago</h1>
          <p className="text-slate-600">Completa los datos para procesar tu pago</p>
        </div>

        {/* Resumen del Pago */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Resumen del Pago</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Vehículo:</span>
              <span className="font-medium text-slate-900">
                {transaction.vehicleBrand} {transaction.vehicleModel} {transaction.vehicleYear}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Comisión ({transaction.commissionRate}%):</span>
              <span className="font-medium text-slate-900">
                {formatPrice(transaction.commissionAmount)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Total a Pagar:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(transaction.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Pago */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Método de Pago</h3>

          {/* Selector de Método */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === 'credit_card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-slate-400'
              }`} />
              <span className="text-sm font-medium text-slate-900">Crédito</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('debit_card')}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === 'debit_card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'debit_card' ? 'text-blue-600' : 'text-slate-400'
              }`} />
              <span className="text-sm font-medium text-slate-900">Débito</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('pse')}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === 'pse'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'pse' ? 'text-blue-600' : 'text-slate-400'
              }`} />
              <span className="text-sm font-medium text-slate-900">PSE</span>
            </button>
          </div>

          {/* Campos de Tarjeta */}
          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={processing}
                />
                <p className="mt-1 text-xs text-slate-500">
                  💳 Prueba: 4111111111111111 (Aprobada) | 4000000000000002 (Rechazada)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={processing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PSE */}
          {paymentMethod === 'pse' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Banco
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Bancolombia</option>
                  <option>Banco de Bogotá</option>
                  <option>Davivienda</option>
                  <option>BBVA Colombia</option>
                </select>
              </div>
              <p className="text-sm text-slate-600">
                Serás redirigido a la página de tu banco para completar el pago.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pagar {formatPrice(transaction.totalAmount)}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Nota de Seguridad */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            🔒 Tu información está protegida con encriptación SSL de 256 bits
          </p>
        </div>
      </div>
    </div>
  );
}
