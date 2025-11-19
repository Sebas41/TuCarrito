import { PaymentTransaction } from '../lib/localStorageService';
import { CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react';

interface PaymentResultProps {
  transaction: PaymentTransaction;
  rejectionReason?: string;
  onRetry?: () => void;
  onBackToCatalog: () => void;
}

export default function PaymentResult({ transaction, rejectionReason = '', onRetry, onBackToCatalog }: PaymentResultProps) {
  const isSuccess = transaction.status === 'completed';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = () => {
    // Simulación de descarga de comprobante
    const receipt = `
TuCarrito.com - Comprobante de Pago
=====================================

Transacción: ${transaction.transactionReference || transaction.id}
Fecha: ${formatDate(transaction.completedAt || transaction.createdAt)}
Estado: ${isSuccess ? 'APROBADO' : 'RECHAZADO'}

Vehículo:
${transaction.vehicleBrand} ${transaction.vehicleModel} ${transaction.vehicleYear}

Comprador: ${transaction.buyerName}
Vendedor: ${transaction.sellerName}

Detalles del Pago:
------------------
Precio del Vehículo: ${formatPrice(transaction.vehiclePrice)}
Comisión (${transaction.commissionRate}%): ${formatPrice(transaction.commissionAmount)}
Total Pagado: ${formatPrice(transaction.totalAmount)}

Método de Pago: ${transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'N/A'}
${transaction.paymentGatewayResponse?.authorizationCode ? `Código de Autorización: ${transaction.paymentGatewayResponse.authorizationCode}` : ''}

=====================================
Gracias por usar TuCarrito.com
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-${transaction.transactionReference || transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Resultado Principal */}
        <div className={`bg-white rounded-xl shadow-lg border-2 p-8 text-center mb-6 ${
          isSuccess ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className={`inline-flex p-4 rounded-full mb-6 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          <h1 className={`text-3xl font-bold mb-3 ${
            isSuccess ? 'text-green-900' : 'text-red-900'
          }`}>
            {isSuccess ? '¡Pago Realizado con Éxito!' : 'Pago Rechazado'}
          </h1>

          <p className={`text-lg mb-6 ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}>
            {isSuccess 
              ? 'Tu pago ha sido procesado correctamente'
              : rejectionReason || transaction.rejectedReason || 'El pago no pudo ser procesado'}
          </p>

          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                📧 Hemos enviado un comprobante a tu correo electrónico
              </p>
            </div>
          )}

          {!isSuccess && (rejectionReason || transaction.rejectedReason) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">
                Motivo: {rejectionReason || transaction.rejectedReason}
              </p>
              <p className="text-xs text-red-700 mt-2">
                Por favor, verifica tus datos e intenta nuevamente
              </p>
            </div>
          )}
        </div>

        {/* Detalles de la Transacción */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Detalles de la Transacción</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Referencia:</span>
              <span className="font-mono font-medium text-slate-900">
                {transaction.transactionReference || transaction.id}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Fecha:</span>
              <span className="font-medium text-slate-900">
                {formatDate(transaction.completedAt || transaction.createdAt)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Vehículo:</span>
              <span className="font-medium text-slate-900">
                {transaction.vehicleBrand} {transaction.vehicleModel} {transaction.vehicleYear}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Vendedor:</span>
              <span className="font-medium text-slate-900">{transaction.sellerName}</span>
            </div>

            {transaction.paymentMethod && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Método de Pago:</span>
                <span className="font-medium text-slate-900">
                  {transaction.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                   transaction.paymentMethod === 'debit_card' ? 'Tarjeta de Débito' :
                   transaction.paymentMethod === 'pse' ? 'PSE' :
                   transaction.paymentMethod === 'nequi' ? 'Nequi' : 'Daviplata'}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 bg-slate-50 -mx-6 px-6 rounded-lg">
              <span className="font-semibold text-slate-900">Monto Pagado:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(transaction.totalAmount)}
              </span>
            </div>

            {isSuccess && transaction.paymentGatewayResponse?.authorizationCode && (
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Código de Autorización:</span>
                <span className="font-mono font-medium text-green-600">
                  {transaction.paymentGatewayResponse.authorizationCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Próximos Pasos */}
        {isSuccess && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Próximos Pasos</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Puedes contactar al vendedor para coordinar la entrega</li>
              <li>✓ Verifica los documentos del vehículo antes de la transferencia</li>
              <li>✓ El pago al vendedor se realizará según lo acordado</li>
              <li>✓ Guarda este comprobante para tus registros</li>
            </ul>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-4">
          {isSuccess && (
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar Comprobante
            </button>
          )}
          {!isSuccess && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              Reintentar Pago
            </button>
          )}
          <button
            onClick={onBackToCatalog}
            className={`${isSuccess || onRetry ? 'flex-1' : 'w-full'} px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2`}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Catálogo
          </button>
        </div>

        {/* Soporte */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ¿Tienes alguna duda? Contáctanos a{' '}
            <a href="mailto:soporte@tucarrito.com" className="text-blue-600 hover:underline">
              soporte@tucarrito.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
