import { VehicleBackground } from '../lib/localStorageService';
import { ArrowLeft, Car, User, AlertTriangle, Wrench, ShieldAlert, DollarSign, CheckCircle, XCircle, Download } from 'lucide-react';

interface VehicleHistoryReportProps {
  background: VehicleBackground;
  onBack: () => void;
}

export default function VehicleHistoryReport({ background, onBack }: VehicleHistoryReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadReport = () => {
    const report = `
REPORTE DE ANTECEDENTES VEHICULARES
=====================================

Placa: ${background.licensePlate}
Fecha de consulta: ${formatDate(background.lastUpdated)}

INFORMACIÓN DEL VEHÍCULO
-------------------------
Marca: ${background.vehicleInfo?.brand}
Modelo: ${background.vehicleInfo?.model}
Año: ${background.vehicleInfo?.year}
VIN: ${background.vehicleInfo?.vin}

PROPIEDAD
---------
Propietario actual: ${background.ownership?.currentOwner}
Fecha de adquisición: ${background.ownership?.ownershipDate ? formatDate(background.ownership.ownershipDate) : 'N/A'}
Propietarios anteriores: ${background.ownership?.previousOwners}

ACCIDENTES
----------
¿Tiene reportes?: ${background.accidents?.hasAccidents ? 'SÍ' : 'NO'}
Total de accidentes: ${background.accidents?.totalAccidents || 0}
${background.accidents?.details.map(acc => `
- Fecha: ${formatDate(acc.date)}
  Severidad: ${acc.severity}
  Descripción: ${acc.description}
`).join('\n') || 'Sin detalles'}

REVISIÓN TÉCNICA
----------------
Estado: ${background.technicalReview?.status}
Última revisión: ${background.technicalReview?.lastReviewDate ? formatDate(background.technicalReview.lastReviewDate) : 'N/A'}
Próxima revisión: ${background.technicalReview?.nextReviewDate ? formatDate(background.technicalReview.nextReviewDate) : 'N/A'}
Observaciones: ${background.technicalReview?.observations}

REPORTES DE ROBO
----------------
¿Tiene reportes?: ${background.theftReports?.hasReports ? 'SÍ' : 'NO'}
Total de reportes: ${background.theftReports?.totalReports || 0}
${background.theftReports?.details.map(report => `
- Fecha: ${formatDate(report.reportDate)}
  Estado: ${report.status}
  Descripción: ${report.description}
`).join('\n') || 'Sin detalles'}

MULTAS E INFRACCIONES
---------------------
¿Tiene multas pendientes?: ${background.fines?.hasFines ? 'SÍ' : 'NO'}
Total de multas: ${background.fines?.totalFines || 0}
Monto total: $${background.fines?.totalAmount.toLocaleString('es-CO') || 0}

=====================================
Reporte generado por TuCarrito.com
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antecedentes-${background.licensePlate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Determinar estado general del vehículo
  const hasIssues = 
    background.accidents?.hasAccidents ||
    background.theftReports?.hasReports ||
    background.fines?.hasFines ||
    background.technicalReview?.status !== 'approved';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Nueva Consulta
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar Reporte
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Título y Estado General */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Reporte de Antecedentes
              </h1>
              <p className="text-lg text-slate-600">
                Placa: <span className="font-mono font-bold text-slate-900">{background.licensePlate}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Última actualización: {formatDate(background.lastUpdated)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              hasIssues ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {hasIssues ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Revisar detalles</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Sin alertas</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CA2: Información del Vehículo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Información del Vehículo</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Marca</p>
              <p className="font-semibold text-slate-900">{background.vehicleInfo?.brand}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Modelo</p>
              <p className="font-semibold text-slate-900">{background.vehicleInfo?.model}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Año</p>
              <p className="font-semibold text-slate-900">{background.vehicleInfo?.year}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">VIN</p>
              <p className="font-semibold text-slate-900 font-mono text-sm">{background.vehicleInfo?.vin}</p>
            </div>
          </div>
        </div>

        {/* CA2: Propiedad */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Historial de Propiedad</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Propietario actual:</span>
              <span className="font-semibold text-slate-900">{background.ownership?.currentOwner}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Fecha de adquisición:</span>
              <span className="font-semibold text-slate-900">
                {background.ownership?.ownershipDate ? formatDate(background.ownership.ownershipDate) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Propietarios anteriores:</span>
              <span className="font-semibold text-slate-900">{background.ownership?.previousOwners || 0}</span>
            </div>
          </div>
        </div>

        {/* CA2: Reportes de Accidentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${
              background.accidents?.hasAccidents ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                background.accidents?.hasAccidents ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Reportes de Accidentes</h2>
          </div>
          
          {background.accidents?.hasAccidents ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  ⚠️ Este vehículo tiene <strong>{background.accidents.totalAccidents}</strong> reporte(s) de accidente
                </p>
              </div>
              <div className="space-y-3">
                {background.accidents.details.map((accident, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900">Accidente #{index + 1}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        accident.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        accident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {accident.severity === 'severe' ? 'Severo' :
                         accident.severity === 'moderate' ? 'Moderado' : 'Menor'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Fecha: {formatDate(accident.date)}</p>
                    <p className="text-sm text-slate-700">{accident.description}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-medium">Sin reportes de accidentes</span>
            </div>
          )}
        </div>

        {/* CA2: Revisión Técnica */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${
              background.technicalReview?.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <Wrench className={`w-6 h-6 ${
                background.technicalReview?.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Revisión Técnico-Mecánica y de Gases</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Estado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                background.technicalReview?.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {background.technicalReview?.status === 'approved' ? '✓ Aprobada' : 'Pendiente'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Última revisión:</span>
              <span className="font-semibold text-slate-900">
                {background.technicalReview?.lastReviewDate ? formatDate(background.technicalReview.lastReviewDate) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Próxima revisión:</span>
              <span className="font-semibold text-slate-900">
                {background.technicalReview?.nextReviewDate ? formatDate(background.technicalReview.nextReviewDate) : 'N/A'}
              </span>
            </div>
            {background.technicalReview?.observations && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Observaciones:</p>
                <p className="text-sm text-slate-900">{background.technicalReview.observations}</p>
              </div>
            )}
          </div>
        </div>

        {/* CA2: Denuncias de Robo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${
              background.theftReports?.hasReports ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <ShieldAlert className={`w-6 h-6 ${
                background.theftReports?.hasReports ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Denuncias de Robo</h2>
          </div>
          
          {background.theftReports?.hasReports ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">
                  ⚠️ Este vehículo tiene <strong>{background.theftReports.totalReports}</strong> reporte(s) de robo
                </p>
              </div>
              <div className="space-y-3">
                {background.theftReports.details.map((report, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900">Reporte #{index + 1}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        report.status === 'recovered' ? 'bg-green-100 text-green-800' :
                        report.status === 'active' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {report.status === 'recovered' ? 'Recuperado' :
                         report.status === 'active' ? 'Activo' : 'Cerrado'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Fecha: {formatDate(report.reportDate)}</p>
                    <p className="text-sm text-slate-700">{report.description}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-medium">Sin denuncias de robo</span>
            </div>
          )}
        </div>

        {/* CA2: Multas e Infracciones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${
              background.fines?.hasFines ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                background.fines?.hasFines ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Multas e Infracciones</h2>
          </div>
          
          {background.fines?.hasFines ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  ⚠️ Este vehículo tiene <strong>{background.fines.totalFines}</strong> multa(s) pendiente(s)
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total de multas:</span>
                  <span className="font-semibold text-slate-900">{background.fines.totalFines}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Monto total:</span>
                  <span className="font-bold text-red-600 text-lg">
                    ${background.fines.totalAmount.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-medium">Sin multas pendientes</span>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
          <p className="text-sm text-slate-600">
            Este reporte es generado con información disponible al momento de la consulta.
            TuCarrito.com no se hace responsable por la exactitud o completitud de la información.
            Se recomienda verificar directamente con las autoridades competentes.
          </p>
        </div>
      </div>
    </div>
  );
}
