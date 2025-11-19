import React, { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { localStorageService, Vehicle, PaymentTransaction } from '../lib/localStorageService';
import { Car, LogOut, User, CheckCircle, Plus, Search, Settings, List, MessageCircle } from 'lucide-react';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';
import PaymentSummary from './PaymentSummary';
import PaymentGateway from './PaymentGateway';
import PaymentResult from './PaymentResult';
import MessagingSystem from './MessagingSystem';

type ViewType = 'dashboard' | 'publish' | 'catalog' | 'my-vehicles' | 'edit-vehicle' | 'payment-summary' | 'payment-gateway' | 'payment-result' | 'messages';

export default function SimpleDashboard() {
  const { user, logout } = useSimpleAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [myVehiclesCount, setMyVehiclesCount] = useState(0);
  const [selectedVehicleForPurchase, setSelectedVehicleForPurchase] = useState<Vehicle | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState<string>('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [messagingInitialUserId, setMessagingInitialUserId] = useState<string | undefined>();
  const [messagingInitialVehicleId, setMessagingInitialVehicleId] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      const vehicles = localStorageService.getUserVehicles(user.id);
      setMyVehiclesCount(vehicles.length);
      
      // Cargar contador de mensajes no leídos
      localStorageService.getUnreadMessagesCount(user.id).then(count => {
        setUnreadMessagesCount(count);
      });
    }
  }, [user, currentView]);

  const handleLogout = () => {
    logout();
  };

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'buyer': return 'Comprador';
      case 'seller': return 'Vendedor';
      case 'both': return 'Comprador y Vendedor';
      default: return 'Usuario';
    }
  };

  const handlePublishSuccess = () => {
    setCurrentView('my-vehicles');
    setVehicleToEdit(null);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setCurrentView('edit-vehicle');
  };

  const handleCancelEdit = () => {
    setVehicleToEdit(null);
    setCurrentView('dashboard');
  };

  const handleStartPurchase = (vehicle: Vehicle) => {
    setSelectedVehicleForPurchase(vehicle);
    setCurrentView('payment-summary');
  };

  const handleProceedToPayment = (transaction: PaymentTransaction) => {
    setCurrentTransaction(transaction);
    setCurrentView('payment-gateway');
  };

  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    setCurrentTransaction(transaction);
    setPaymentRejectionReason('');
    setCurrentView('payment-result');
  };

  const handlePaymentRejected = (transaction: PaymentTransaction, reason: string) => {
    setCurrentTransaction(transaction);
    setPaymentRejectionReason(reason);
    setCurrentView('payment-result');
  };

  const handlePaymentCancel = () => {
    setCurrentView('catalog');
    setSelectedVehicleForPurchase(null);
    setCurrentTransaction(null);
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedVehicleForPurchase(null);
    setCurrentTransaction(null);
    setPaymentRejectionReason('');
  };

  const handleRetryPayment = () => {
    if (selectedVehicleForPurchase) {
      setCurrentView('payment-summary');
    }
  };

  const handleContactSeller = (sellerId: string, vehicleId: string) => {
    setMessagingInitialUserId(sellerId);
    setMessagingInitialVehicleId(vehicleId);
    setCurrentView('messages');
  };

  // Renderizar la vista de mensajes
  if (currentView === 'messages') {
    return (
      <MessagingSystem
        onBack={() => {
          setCurrentView('dashboard');
          setMessagingInitialUserId(undefined);
          setMessagingInitialVehicleId(undefined);
        }}
        initialOtherUserId={messagingInitialUserId}
        initialVehicleId={messagingInitialVehicleId}
      />
    );
  }

  // Renderizar la vista de resumen de pago
  if (currentView === 'payment-summary' && selectedVehicleForPurchase) {
    return (
      <PaymentSummary
        vehicle={selectedVehicleForPurchase}
        onProceedToPayment={handleProceedToPayment}
        onCancel={handlePaymentCancel}
      />
    );
  }

  // Renderizar la vista de pasarela de pago
  if (currentView === 'payment-gateway' && selectedVehicleForPurchase && currentTransaction) {
    return (
      <PaymentGateway
        vehicle={selectedVehicleForPurchase}
        transaction={currentTransaction}
        onSuccess={handlePaymentSuccess}
        onRejected={handlePaymentRejected}
        onCancel={handlePaymentCancel}
      />
    );
  }

  // Renderizar la vista de resultado de pago
  if (currentView === 'payment-result' && currentTransaction) {
    return (
      <PaymentResult
        transaction={currentTransaction}
        rejectionReason={paymentRejectionReason}
        onRetry={handleRetryPayment}
        onBackToCatalog={handleBackToCatalog}
      />
    );
  }

  // Renderizar la vista de formulario de vehículo
  if (currentView === 'publish' || currentView === 'edit-vehicle') {
    return (
      <VehicleForm
        vehicleToEdit={vehicleToEdit}
        onSuccess={handlePublishSuccess}
        onCancel={handleCancelEdit}
      />
    );
  }

  // Renderizar la vista de catálogo
  if (currentView === 'catalog') {
    return (
      <VehicleList
        onBack={() => setCurrentView('dashboard')}
        onEditVehicle={handleEditVehicle}
        onStartPurchase={handleStartPurchase}
        onContactSeller={handleContactSeller}
        showMyVehicles={false}
      />
    );
  }

  // Renderizar la vista de mis vehículos
  if (currentView === 'my-vehicles') {
    return (
      <VehicleList
        onBack={() => setCurrentView('dashboard')}
        onEditVehicle={handleEditVehicle}
        showMyVehicles={true}
      />
    );
  }

  // Vista principal del dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">TuCarrito.com</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Bienvenido, {user?.fullName}
              </h2>
              <p className="text-slate-600 mb-2">
                Email: {user?.email}
              </p>
              <p className="text-slate-600 mb-2">
                Teléfono: {user?.phone}
              </p>
              <p className="text-slate-600">
                Tipo de usuario: <span className="font-medium">{getUserTypeLabel()}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Cuenta Validada
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => setCurrentView('catalog')}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Buscar Vehículos</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Explora nuestro catálogo de vehículos disponibles
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('messages')}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Mensajes</h3>
              {unreadMessagesCount > 0 && (
                <div className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm">
              Chatea con compradores y vendedores
            </p>
          </div>

          {(user?.userType === 'seller' || user?.userType === 'both') && (
            <>
              <div 
                onClick={() => setCurrentView('publish')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Publicar Vehículo</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Anuncia tu vehículo en la plataforma
                </p>
              </div>

              <div 
                onClick={() => setCurrentView('my-vehicles')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <List className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Mis Vehículos</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Gestiona tus {myVehiclesCount} vehículo{myVehiclesCount !== 1 ? 's' : ''} publicado{myVehiclesCount !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}

          {user?.userType === 'buyer' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Configuración</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Administra tu perfil y preferencias
              </p>
            </div>
          )}
        </div>

        {/* Información del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
            Sistema de Publicación de Vehículos
          </h3>
          <p className="text-slate-600 text-center max-w-2xl mx-auto">
            Publica tus vehículos de forma segura. Cada publicación pasa por un proceso de validación antes de aparecer en el catálogo público.
          </p>
        </div>
      </main>
    </div>
  );
}