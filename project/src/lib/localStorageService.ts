// Servicio de almacenamiento local para el prototipo
import { supabase } from './supabase';

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  idNumber: string;
  userType: 'buyer' | 'seller' | 'both';
  userRole: 'admin' | 'user'; // Nuevo: distinguir administradores
  validationStatus: 'pending' | 'approved' | 'rejected';
  isApproved: boolean; // Nuevo: estado de aprobación del usuario
  approvedBy?: string; // Nuevo: ID del admin que aprobó
  approvedAt?: string; // Nuevo: fecha de aprobación
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  images: string[]; // Base64 encoded images
  licensePlate?: string; // Placa del vehículo
  ownershipCard?: string; // Tarjeta de propiedad (imagen base64)
  soat?: string; // SOAT (imagen base64)
  technicalReview?: string; // Certificado revisión técnica (imagen base64)
  status: 'active' | 'sold' | 'inactive';
  saleStatus: 'draft' | 'pending_validation' | 'validated' | 'for_sale' | 'rejected';
  validationMessage?: string;
  validationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemporaryVehicle {
  id: string;
  sessionId: string; // ID de sesión temporal para identificar al usuario anónimo
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  images: string[];
  status: 'temporary' | 'converted' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePrice: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  commissionRate: number; // Porcentaje de comisión (ej: 5 para 5%)
  commissionAmount: number; // Monto de comisión calculado
  totalAmount: number; // commissionAmount (solo paga comisión el comprador)
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  paymentMethod?: 'credit_card' | 'debit_card' | 'pse' | 'nequi';
  transactionReference?: string; // Referencia de la pasarela de pago
  paymentGatewayResponse?: any; // Respuesta de la pasarela
  rejectedReason?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface VehicleBackground {
  licensePlate: string;
  found: boolean;
  vehicleInfo?: {
    brand: string;
    model: string;
    year: number;
    vin: string;
  };
  ownership?: {
    currentOwner: string;
    ownershipDate: string;
    previousOwners: number;
  };
  accidents?: {
    hasAccidents: boolean;
    totalAccidents: number;
    details: Array<{
      date: string;
      severity: 'minor' | 'moderate' | 'severe';
      description: string;
    }>;
  };
  technicalReview?: {
    status: 'approved' | 'pending' | 'rejected';
    lastReviewDate: string;
    nextReviewDate: string;
    observations: string;
  };
  theftReports?: {
    hasReports: boolean;
    totalReports: number;
    details: Array<{
      reportDate: string;
      status: 'active' | 'recovered' | 'closed';
      description: string;
    }>;
  };
  fines?: {
    hasFines: boolean;
    totalFines: number;
    totalAmount: number;
  };
  lastUpdated: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant1Name: string;
  participant2Id: string;
  participant2Name: string;
  vehicleId?: string;
  vehicleInfo?: {
    brand: string;
    model: string;
    year: number;
    price: number;
  };
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount?: number; // Solo se calcula para el usuario que consulta
  createdAt: string;
}

class LocalStorageService {
  private readonly USERS_KEY = 'tucarrito_users';
  private readonly CURRENT_USER_KEY = 'tucarrito_current_user';
  private readonly VEHICLES_KEY = 'tucarrito_vehicles';
  private readonly TEMP_VEHICLES_KEY = 'tucarrito_temp_vehicles';
  private readonly SESSION_ID_KEY = 'tucarrito_session_id';
  private readonly TRANSACTIONS_KEY = 'tucarrito_transactions';
  
  // Configuración de imágenes
  private readonly MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  // Configuración de pagos
  private readonly COMMISSION_RATE = 5; // 5% de comisión

  // Simular delay de red
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtener todos los usuarios
  private getUsers(): LocalUser[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Guardar usuarios
  private saveUsers(users: LocalUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Registrar nuevo usuario
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    idNumber: string;
    userType: 'buyer' | 'seller' | 'both';
  }): Promise<{ success: boolean; message: string; user?: LocalUser }> {
    await this.delay(1000); // Simular latencia

    const users = this.getUsers();
    
    // Verificar si el email ya existe
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Ya existe un usuario con este correo electrónico' };
    }

    // Crear nuevo usuario
    const newUser: LocalUser = {
      id: Date.now().toString(),
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
      idNumber: userData.idNumber,
      userType: userData.userType,
      userRole: 'user', // Los usuarios registrados son siempre 'user', no 'admin'
      validationStatus: 'pending',
      isApproved: false, // Nuevo: los usuarios registrados requieren aprobación
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return { 
      success: true, 
      message: 'Registro exitoso. Tu cuenta está en proceso de validación.',
      user: newUser
    };
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: LocalUser }> {
    await this.delay(800); // Simular latencia

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Correo o contraseña incorrectos' };
    }

    // Los administradores siempre pueden entrar
    if (user.userRole === 'admin') {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, message: 'Inicio de sesión exitoso', user };
    }

    // Para usuarios normales, verificar aprobación
    if (!user.isApproved) {
      return { 
        success: false, 
        message: 'Tu cuenta está pendiente de aprobación por un administrador. Serás notificado cuando sea aprobada.' 
      };
    }

    if (user.validationStatus === 'rejected') {
      return { 
        success: false, 
        message: 'Tu cuenta ha sido rechazada. Contacta al soporte para más información.' 
      };
    }

    // Login exitoso
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: 'Inicio de sesión exitoso', user };
  }

  // Obtener usuario actual
  getCurrentUser(): LocalUser | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Métodos de utilidad para desarrollo/testing
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.VEHICLES_KEY);
  }

  // Forzar recreación de usuarios de prueba y administradores
  forceResetTestUsers(): void {
    const users = this.getUsers();
    const testEmails = ['vendedor@test.com', 'comprador@test.com', 'admin1@tucarrito.com', 'admin2@tucarrito.com'];
    
    // Eliminar usuarios de prueba existentes
    const filteredUsers = users.filter(u => !testEmails.includes(u.email));
    this.saveUsers(filteredUsers);
    
    console.log('🗑️ Usuarios de prueba eliminados. Reiniciando...');
    
    // Recrear usuarios
    this.initializeTestUsers();
  }

  // Inicializar usuarios de prueba pre-aprobados
  initializeTestUsers(): void {
    const users = this.getUsers();
    
    // Verificar si ya existen usuarios de prueba y administradores
    const testEmails = ['vendedor@test.com', 'comprador@test.com', 'admin1@tucarrito.com', 'admin2@tucarrito.com'];
    const existingTestUsers = users.filter(u => testEmails.includes(u.email));
    
    // Si existen usuarios pero les faltan los nuevos campos, eliminarlos y recrearlos
    const needsUpdate = existingTestUsers.some(u => u.userRole === undefined || u.isApproved === undefined);
    
    if (needsUpdate) {
      // Eliminar usuarios viejos que necesitan actualización
      const filteredUsers = users.filter(u => !testEmails.includes(u.email));
      this.saveUsers(filteredUsers);
      console.log('🔄 Actualizando usuarios de prueba y administradores...');
    }
    
    // Obtener usuarios actualizados
    const currentUsers = this.getUsers();
    const existingEmails = currentUsers.map(u => u.email);
    
    // Solo crear los que no existen
    if (!existingEmails.includes('admin1@tucarrito.com') || !existingEmails.includes('admin2@tucarrito.com') || 
        !existingEmails.includes('vendedor@test.com') || !existingEmails.includes('comprador@test.com')) {
      const testUsers: LocalUser[] = [
        // Administradores (pre-aprobados, no se registran)
        {
          id: 'admin-1',
          email: 'admin1@tucarrito.com',
          password: 'Admin123!',
          fullName: 'Carlos Administrador',
          phone: '3101234567',
          idNumber: 'ADM-001',
          userType: 'both', // Admin puede ver todo
          userRole: 'admin',
          validationStatus: 'approved',
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin-2',
          email: 'admin2@tucarrito.com',
          password: 'Admin456!',
          fullName: 'Ana Administradora',
          phone: '3109876543',
          idNumber: 'ADM-002',
          userType: 'both',
          userRole: 'admin',
          validationStatus: 'approved',
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        // Usuarios de prueba (pre-aprobados)
        {
          id: 'test-seller-1',
          email: 'vendedor@test.com',
          password: '123456',
          fullName: 'Juan Vendedor',
          phone: '3001234567',
          idNumber: '1234567890',
          userType: 'seller',
          userRole: 'user',
          validationStatus: 'approved',
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'test-buyer-1',
          email: 'comprador@test.com',
          password: '123456',
          fullName: 'María Compradora',
          phone: '3009876543',
          idNumber: '0987654321',
          userType: 'buyer',
          userRole: 'user',
          validationStatus: 'approved',
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Agregar solo los usuarios que no existen
      const usersToAdd = testUsers.filter(tu => !existingEmails.includes(tu.email));
      if (usersToAdd.length > 0) {
        currentUsers.push(...usersToAdd);
        this.saveUsers(currentUsers);
        console.log('✅ Usuarios de prueba y administradores creados/actualizados:', usersToAdd.map(u => u.email));
      }
    }
  }

  // Inicializar vehículos de demostración pre-aprobados
  initializeDemoVehicles(): void {
    const vehicles = this.getVehicles();
    
    // Si ya hay vehículos, no crear más
    if (vehicles.length > 0) {
      return;
    }

    // Imágenes de demostración (placeholders)
    const demoImages = [
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%2364748b"%3EImagen Demo%3C/text%3E%3C/svg%3E'
    ];

    const demoVehicles: Vehicle[] = [
      {
        id: 'demo-1',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        price: 85000000,
        description: 'Toyota Corolla 2020 en excelente estado. Único dueño, revisiones al día. Motor 1.8L, transmisión automática CVT. Equipamiento completo: aire acondicionado, sistema de sonido, cámara de reversa, sensores de parqueo.',
        mileage: 45000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        licensePlate: 'ABC123',
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Mazda',
        model: 'CX-5',
        year: 2021,
        price: 120000000,
        description: 'Mazda CX-5 Grand Touring 2021. SUV en perfecto estado, como nueva. Motor 2.5L SkyActiv, tracción AWD. Cuero, techo panorámico, sistema de navegación, control de crucero adaptativo, asientos con calefacción.',
        mileage: 28000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        licensePlate: 'DEF456',
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-3',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Chevrolet',
        model: 'Spark GT',
        year: 2019,
        price: 35000000,
        description: 'Chevrolet Spark GT 2019, ideal para la ciudad. Económico en combustible, perfecto primer vehículo. Motor 1.2L, transmisión manual de 5 velocidades. Aire acondicionado, vidrios eléctricos, dirección asistida.',
        mileage: 62000,
        transmission: 'manual',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-4',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Renault',
        model: 'Duster',
        year: 2022,
        price: 95000000,
        description: 'Renault Duster Intens 2022. Camioneta 4x4 lista para aventuras. Motor 2.0L, transmisión automática CVT. Excelente estado, pocos kilómetros. Control de tracción, ESP, frenos ABS, 6 airbags.',
        mileage: 15000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-5',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Nissan',
        model: 'Versa',
        year: 2020,
        price: 55000000,
        description: 'Nissan Versa Advance 2020. Sedán espacioso y confortable. Motor 1.6L, transmisión automática. Bajo consumo de combustible, ideal para viajes largos. Sistema de audio Bluetooth, control de crucero.',
        mileage: 38000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-6',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Kia',
        model: 'Sportage',
        year: 2021,
        price: 110000000,
        description: 'Kia Sportage Revolution 2021. SUV moderna con todas las comodidades. Motor 2.0L turbo, transmisión automática de 8 velocidades. Pantalla táctil de 10", cámara 360°, asientos ventilados, sistema de sonido premium.',
        mileage: 22000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-7',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Hyundai',
        model: 'Accent',
        year: 2019,
        price: 48000000,
        description: 'Hyundai Accent 2019 en muy buen estado. Sedán confiable y económico. Motor 1.6L, transmisión manual. Mantenimientos realizados en agencia oficial. Aire acondicionado, radio con USB, espejos eléctricos.',
        mileage: 55000,
        transmission: 'manual',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-8',
        userId: 'test-seller-1',
        userEmail: 'vendedor@test.com',
        userName: 'Juan Vendedor',
        userPhone: '3001234567',
        brand: 'Volkswagen',
        model: 'Tiguan',
        year: 2022,
        price: 145000000,
        description: 'Volkswagen Tiguan Highline 2022. SUV premium alemana. Motor 1.4L TSI turbo, transmisión automática DSG. Cuero, techo panorámico, asistentes de conducción, park assist, virtual cockpit, luces LED.',
        mileage: 12000,
        transmission: 'automatic',
        fuelType: 'gasoline',
        images: demoImages,
        status: 'active',
        saleStatus: 'for_sale',
        validationMessage: 'Vehículo validado y aprobado para la venta',
        validationDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveVehicles(demoVehicles);
    console.log('✅ Vehículos de demostración creados:', demoVehicles.length, 'vehículos');
  }

  // ========== MÉTODOS DE VEHÍCULOS ==========

  // Obtener todos los vehículos
  private getVehicles(): Vehicle[] {
    const vehicles = localStorage.getItem(this.VEHICLES_KEY);
    return vehicles ? JSON.parse(vehicles) : [];
  }

  // Guardar vehículos
  private saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(vehicles));
  }

  // Validar archivo de imagen
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Formato no permitido. Solo se aceptan: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`
      };
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `La imagen supera el tamaño máximo permitido de ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }

  // Convertir archivo a Base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Crear vehículo
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'saleStatus' | 'validationMessage' | 'validationDate'>): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(800);

    const vehicles = this.getVehicles();
    
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
      status: 'active',
      saleStatus: 'draft', // Por defecto, el vehículo está en borrador hasta que se registre para venta
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vehicles.push(newVehicle);
    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo publicado exitosamente',
      vehicle: newVehicle
    };
  }

  // Actualizar vehículo
  async updateVehicle(vehicleId: string, updates: Partial<Omit<Vehicle, 'id' | 'userId' | 'createdAt'>>): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo actualizado exitosamente',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Eliminar vehículo
  async deleteVehicle(vehicleId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const filteredVehicles = vehicles.filter(v => v.id !== vehicleId);

    if (vehicles.length === filteredVehicles.length) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    this.saveVehicles(filteredVehicles);

    return {
      success: true,
      message: 'Vehículo eliminado exitosamente'
    };
  }

  // Obtener vehículos de un usuario
  getUserVehicles(userId: string): Vehicle[] {
    const vehicles = this.getVehicles();
    return vehicles.filter(v => v.userId === userId);
  }

  // Obtener todos los vehículos activos
  getAllActiveVehicles(): Vehicle[] {
    const vehicles = this.getVehicles();
    return vehicles.filter(v => v.status === 'active');
  }

  // Obtener vehículo por ID
  getVehicleById(vehicleId: string): Vehicle | null {
    const vehicles = this.getVehicles();
    return vehicles.find(v => v.id === vehicleId) || null;
  }

  // Buscar vehículos
  searchVehicles(filters: {
    brand?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    fuelType?: string;
  }): Vehicle[] {
    let vehicles = this.getAllActiveVehicles();

    if (filters.brand) {
      vehicles = vehicles.filter(v => 
        v.brand.toLowerCase().includes(filters.brand!.toLowerCase())
      );
    }

    if (filters.model) {
      vehicles = vehicles.filter(v => 
        v.model.toLowerCase().includes(filters.model!.toLowerCase())
      );
    }

    if (filters.minYear) {
      vehicles = vehicles.filter(v => v.year >= filters.minYear!);
    }

    if (filters.maxYear) {
      vehicles = vehicles.filter(v => v.year <= filters.maxYear!);
    }

    if (filters.minPrice) {
      vehicles = vehicles.filter(v => v.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      vehicles = vehicles.filter(v => v.price <= filters.maxPrice!);
    }

    if (filters.transmission) {
      vehicles = vehicles.filter(v => v.transmission === filters.transmission);
    }

    if (filters.fuelType) {
      vehicles = vehicles.filter(v => v.fuelType === filters.fuelType);
    }

    return vehicles;
  }

  // ========== MÉTODOS DE VEHÍCULOS TEMPORALES ==========

  // Obtener o crear ID de sesión para usuario anónimo
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  // Obtener todos los vehículos temporales
  private getTemporaryVehicles(): TemporaryVehicle[] {
    const vehicles = localStorage.getItem(this.TEMP_VEHICLES_KEY);
    return vehicles ? JSON.parse(vehicles) : [];
  }

  // Guardar vehículos temporales
  private saveTemporaryVehicles(vehicles: TemporaryVehicle[]): void {
    localStorage.setItem(this.TEMP_VEHICLES_KEY, JSON.stringify(vehicles));
  }

  // Crear vehículo temporal
  async createTemporaryVehicle(vehicleData: Omit<TemporaryVehicle, 'id' | 'sessionId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    message: string;
    vehicle?: TemporaryVehicle;
  }> {
    await this.delay(800);

    const sessionId = this.getOrCreateSessionId();
    const vehicles = this.getTemporaryVehicles();
    
    const newVehicle: TemporaryVehicle = {
      ...vehicleData,
      id: `temp_${Date.now()}`,
      sessionId,
      status: 'temporary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vehicles.push(newVehicle);
    this.saveTemporaryVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo registrado temporalmente. Podrás gestionarlo sin necesidad de crear una cuenta.',
      vehicle: newVehicle
    };
  }

  // Actualizar vehículo temporal
  async updateTemporaryVehicle(vehicleId: string, updates: Partial<Omit<TemporaryVehicle, 'id' | 'sessionId' | 'createdAt'>>): Promise<{
    success: boolean;
    message: string;
    vehicle?: TemporaryVehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getTemporaryVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo temporal no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveTemporaryVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo temporal actualizado exitosamente',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Eliminar vehículo temporal
  async deleteTemporaryVehicle(vehicleId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(500);

    const vehicles = this.getTemporaryVehicles();
    const filteredVehicles = vehicles.filter(v => v.id !== vehicleId);

    if (vehicles.length === filteredVehicles.length) {
      return { success: false, message: 'Vehículo temporal no encontrado' };
    }

    this.saveTemporaryVehicles(filteredVehicles);

    return {
      success: true,
      message: 'Vehículo temporal eliminado exitosamente'
    };
  }

  // Obtener vehículos temporales de la sesión actual
  getSessionTemporaryVehicles(): TemporaryVehicle[] {
    const sessionId = this.getOrCreateSessionId();
    const vehicles = this.getTemporaryVehicles();
    return vehicles.filter(v => v.sessionId === sessionId && v.status === 'temporary');
  }

  // Obtener todos los vehículos temporales activos
  getAllTemporaryVehicles(): TemporaryVehicle[] {
    const vehicles = this.getTemporaryVehicles();
    return vehicles.filter(v => v.status === 'temporary');
  }

  // Obtener vehículo temporal por ID
  getTemporaryVehicleById(vehicleId: string): TemporaryVehicle | null {
    const vehicles = this.getTemporaryVehicles();
    return vehicles.find(v => v.id === vehicleId) || null;
  }

  // Convertir vehículo temporal a permanente (cuando el usuario se registra)
  async convertTemporaryVehicleToPermanent(tempVehicleId: string, userId: string, userEmail: string, userName: string, userPhone: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    const tempVehicle = this.getTemporaryVehicleById(tempVehicleId);
    
    if (!tempVehicle) {
      return { success: false, message: 'Vehículo temporal no encontrado' };
    }

    // Crear vehículo permanente
    const permanentVehicle: Vehicle = {
      id: Date.now().toString(),
      userId,
      userEmail,
      userName,
      userPhone,
      brand: tempVehicle.brand,
      model: tempVehicle.model,
      year: tempVehicle.year,
      price: tempVehicle.price,
      description: tempVehicle.description,
      mileage: tempVehicle.mileage,
      transmission: tempVehicle.transmission,
      fuelType: tempVehicle.fuelType,
      images: tempVehicle.images,
      licensePlate: 'TEMP-' + Date.now().toString().slice(-6), // Placa temporal
      status: 'active',
      saleStatus: 'draft',
      createdAt: tempVehicle.createdAt,
      updatedAt: new Date().toISOString()
    };

    // Guardar vehículo permanente
    const vehicles = this.getVehicles();
    vehicles.push(permanentVehicle);
    this.saveVehicles(vehicles);

    // Marcar vehículo temporal como convertido
    await this.updateTemporaryVehicle(tempVehicleId, { status: 'converted' });

    return {
      success: true,
      message: 'Vehículo convertido a registro permanente exitosamente',
      vehicle: permanentVehicle
    };
  }

  // Limpiar vehículos temporales antiguos (opcional, para mantenimiento)
  cleanExpiredTemporaryVehicles(daysOld: number = 30): number {
    const vehicles = this.getTemporaryVehicles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const activeVehicles = vehicles.filter(v => {
      const vehicleDate = new Date(v.createdAt);
      return vehicleDate > cutoffDate;
    });

    const removedCount = vehicles.length - activeVehicles.length;
    this.saveTemporaryVehicles(activeVehicles);

    return removedCount;
  }

  // ========== MÉTODOS DE REGISTRO PARA VENTA ==========

  // Registrar vehículo para venta (inicia proceso de validación)
  async registerVehicleForSale(vehicleId: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(1000);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    const vehicle = vehicles[vehicleIndex];

    // Verificar que el vehículo esté en estado draft
    if (vehicle.saleStatus !== 'draft') {
      return { 
        success: false, 
        message: `Este vehículo ya está en estado: ${this.getSaleStatusLabel(vehicle.saleStatus)}` 
      };
    }

    // Cambiar estado a pending_validation
    vehicles[vehicleIndex] = {
      ...vehicle,
      saleStatus: 'pending_validation',
      validationMessage: 'Se están validando los datos del vehículo. Este proceso puede tardar hasta 24 horas.',
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo registrado para venta. Se están validando los datos.',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Simular aprobación de validación (para testing/demo)
  async approveVehicleForSale(vehicleId: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      saleStatus: 'for_sale',
      validationMessage: 'Vehículo validado y aprobado para la venta',
      validationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo aprobado para venta',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Rechazar vehículo para venta
  async rejectVehicleForSale(vehicleId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      saleStatus: 'rejected',
      validationMessage: reason,
      validationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo rechazado',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Obtener label del estado de venta
  getSaleStatusLabel(status: Vehicle['saleStatus']): string {
    const labels = {
      draft: 'Borrador',
      pending_validation: 'En Validación',
      validated: 'Validado',
      for_sale: 'En Venta',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  }

  // Obtener color del estado de venta
  getSaleStatusColor(status: Vehicle['saleStatus']): string {
    const colors = {
      draft: 'gray',
      pending_validation: 'yellow',
      validated: 'green',
      for_sale: 'blue',
      rejected: 'red'
    };
    return colors[status] || 'gray';
  }

  // Obtener vehículos disponibles para venta (solo los aprobados)
  getVehiclesForSale(): Vehicle[] {
    const vehicles = this.getVehicles();
    return vehicles.filter(v => v.saleStatus === 'for_sale' && v.status === 'active');
  }

  // ============================================
  // MÉTODOS DE ADMINISTRACIÓN
  // ============================================

  // Obtener usuarios pendientes de aprobación
  getPendingUsers(): LocalUser[] {
    const users = this.getUsers();
    return users.filter(u => u.userRole === 'user' && !u.isApproved);
  }

  // Obtener todos los usuarios (solo para admin)
  getAllUsers(): LocalUser[] {
    return this.getUsers();
  }

  // Aprobar usuario
  async approveUser(userId: string, adminId: string): Promise<{
    success: boolean;
    message: string;
    user?: LocalUser;
  }> {
    await this.delay(500);

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    users[userIndex] = {
      ...users[userIndex],
      isApproved: true,
      validationStatus: 'approved',
      approvedBy: adminId,
      approvedAt: new Date().toISOString()
    };

    this.saveUsers(users);

    return {
      success: true,
      message: 'Usuario aprobado exitosamente',
      user: users[userIndex]
    };
  }

  // Rechazar usuario
  async rejectUser(userId: string, adminId: string): Promise<{
    success: boolean;
    message: string;
    user?: LocalUser;
  }> {
    await this.delay(500);

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    users[userIndex] = {
      ...users[userIndex],
      isApproved: false,
      validationStatus: 'rejected',
      approvedBy: adminId,
      approvedAt: new Date().toISOString()
    };

    this.saveUsers(users);

    return {
      success: true,
      message: 'Usuario rechazado',
      user: users[userIndex]
    };
  }

  // Obtener vehículos pendientes de validación (para admin)
  getPendingVehicles(): Vehicle[] {
    const vehicles = this.getVehicles();
    return vehicles.filter(v => v.saleStatus === 'pending_validation');
  }

  // Aprobar vehículo (por admin) - diferente de approveVehicleForSale
  async adminApproveVehicle(vehicleId: string, adminId: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      saleStatus: 'for_sale',
      validationMessage: `Aprobado por administrador el ${new Date().toLocaleDateString()}`,
      validationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo aprobado y ahora visible en el catálogo público',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // Rechazar vehículo (por admin)
  async adminRejectVehicle(vehicleId: string, adminId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);

    if (vehicleIndex === -1) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      saleStatus: 'rejected',
      validationMessage: `Rechazado: ${reason}`,
      validationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveVehicles(vehicles);

    return {
      success: true,
      message: 'Vehículo rechazado',
      vehicle: vehicles[vehicleIndex]
    };
  }

  // ==================== PAYMENT METHODS ====================

  // Obtener todas las transacciones
  private getTransactions(): PaymentTransaction[] {
    const transactions = localStorage.getItem(this.TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : [];
  }

  // Guardar transacciones
  private saveTransactions(transactions: PaymentTransaction[]): void {
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  // Crear transacción de pago
  async createPaymentTransaction(vehicleId: string, buyerId: string): Promise<{
    success: boolean;
    message: string;
    transaction?: PaymentTransaction;
  }> {
    await this.delay(500);

    const vehicles = this.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return { success: false, message: 'Vehículo no encontrado' };
    }

    if (vehicle.saleStatus !== 'for_sale') {
      return { success: false, message: 'Este vehículo no está disponible para la venta' };
    }

    if (vehicle.userId === buyerId) {
      return { success: false, message: 'No puedes comprar tu propio vehículo' };
    }

    const users = this.getUsers();
    const buyer = users.find(u => u.id === buyerId);
    const seller = users.find(u => u.id === vehicle.userId);

    if (!buyer || !seller) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const commissionAmount = vehicle.price * (this.COMMISSION_RATE / 100);
    const transaction: PaymentTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: vehicle.id,
      vehicleBrand: vehicle.brand,
      vehicleModel: vehicle.model,
      vehicleYear: vehicle.year,
      vehiclePrice: vehicle.price,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      sellerId: seller.id,
      sellerName: seller.fullName,
      sellerEmail: seller.email,
      commissionRate: this.COMMISSION_RATE,
      commissionAmount: commissionAmount,
      totalAmount: commissionAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    return {
      success: true,
      message: 'Transacción creada exitosamente',
      transaction
    };
  }

  // Procesar pago
  async processPayment(
    transactionId: string,
    paymentMethod: PaymentTransaction['paymentMethod'],
    cardNumber: string
  ): Promise<{
    success: boolean;
    message: string;
    transaction?: PaymentTransaction;
  }> {
    await this.delay(2000); // Simular procesamiento de pasarela

    const transactions = this.getTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);

    if (transactionIndex === -1) {
      return { success: false, message: 'Transacción no encontrada' };
    }

    const transaction = transactions[transactionIndex];

    if (transaction.status !== 'pending') {
      return { success: false, message: 'Esta transacción ya fue procesada' };
    }

    // Simulación de validación de tarjeta
    // Tarjetas que terminan en 0000 son rechazadas
    const isCardRejected = cardNumber.endsWith('0000');
    
    if (isCardRejected) {
      transactions[transactionIndex] = {
        ...transaction,
        status: 'rejected',
        rejectedReason: 'Fondos insuficientes en la tarjeta',
        paymentMethod,
        paymentGatewayResponse: {
          success: false,
          errorCode: 'INSUFFICIENT_FUNDS',
          message: 'Fondos insuficientes'
        },
        completedAt: new Date().toISOString()
      };

      this.saveTransactions(transactions);

      return {
        success: false,
        message: 'Pago rechazado: Fondos insuficientes en la tarjeta',
        transaction: transactions[transactionIndex]
      };
    }

    // Pago exitoso
    const authCode = `AUTH-${Date.now()}`;
    transactions[transactionIndex] = {
      ...transaction,
      status: 'completed',
      paymentMethod,
      transactionReference: `REF-${Date.now()}`,
      paymentGatewayResponse: {
        success: true,
        authorizationCode: authCode,
        message: 'Pago aprobado'
      },
      completedAt: new Date().toISOString()
    };

    this.saveTransactions(transactions);

    // Marcar vehículo como vendido
    const vehicles = this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === transaction.vehicleId);
    if (vehicleIndex !== -1) {
      vehicles[vehicleIndex].status = 'sold';
      vehicles[vehicleIndex].saleStatus = 'validated';
      vehicles[vehicleIndex].updatedAt = new Date().toISOString();
      this.saveVehicles(vehicles);
    }

    return {
      success: true,
      message: 'Pago realizado con éxito',
      transaction: transactions[transactionIndex]
    };
  }

  // Cancelar pago
  async cancelPayment(transactionId: string): Promise<{
    success: boolean;
    message: string;
    transaction?: PaymentTransaction;
  }> {
    await this.delay(300);

    const transactions = this.getTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);

    if (transactionIndex === -1) {
      return { success: false, message: 'Transacción no encontrada' };
    }

    const transaction = transactions[transactionIndex];

    if (transaction.status !== 'pending') {
      return { success: false, message: 'Esta transacción no puede ser cancelada' };
    }

    transactions[transactionIndex] = {
      ...transaction,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };

    this.saveTransactions(transactions);

    return {
      success: true,
      message: 'Pago cancelado. El estado permanece como pendiente.',
      transaction: transactions[transactionIndex]
    };
  }

  // Obtener transacciones de un usuario
  getUserTransactions(userId: string): PaymentTransaction[] {
    const transactions = this.getTransactions();
    return transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
  }

  // Obtener transacción por ID
  getTransaction(transactionId: string): PaymentTransaction | null {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === transactionId) || null;
  }

  // ==================== BACKGROUND CHECK METHODS ====================

  // CA1 & CA3: Validar formato de placa
  validateLicensePlate(licensePlate: string): boolean {
    // Formato colombiano: ABC123 o ABC12D
    const plateRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
    return plateRegex.test(licensePlate.toUpperCase().replace(/\s/g, ''));
  }

  // CA5: Generar antecedentes simulados (respuesta en < 5 segundos)
  private generateMockBackground(licensePlate: string, vehicle?: Vehicle): VehicleBackground {
    const plateUpper = licensePlate.toUpperCase();
    
    // Simular diferentes escenarios basados en la placa
    const hasAccidents = plateUpper.includes('Z') || plateUpper.endsWith('0');
    const hasTheft = plateUpper.startsWith('X');
    const hasFines = parseInt(plateUpper.slice(-2)) > 80;

    return {
      licensePlate: plateUpper,
      found: true,
      vehicleInfo: vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        vin: `VIN${Date.now().toString().slice(-10)}`
      } : {
        brand: 'Marca Desconocida',
        model: 'Modelo Desconocido',
        year: 2020,
        vin: `VIN${Date.now().toString().slice(-10)}`
      },
      ownership: {
        currentOwner: vehicle?.userName || 'Propietario Registrado',
        ownershipDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 años atrás
        previousOwners: Math.floor(Math.random() * 3)
      },
      accidents: {
        hasAccidents,
        totalAccidents: hasAccidents ? Math.floor(Math.random() * 2) + 1 : 0,
        details: hasAccidents ? [
          {
            date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            severity: 'minor',
            description: 'Colisión menor en estacionamiento. Daños en parachoques trasero.'
          }
        ] : []
      },
      technicalReview: {
        status: 'approved',
        lastReviewDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        nextReviewDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString(),
        observations: 'Revisión técnico-mecánica y de gases aprobada. Vehículo en óptimas condiciones.'
      },
      theftReports: {
        hasReports: hasTheft,
        totalReports: hasTheft ? 1 : 0,
        details: hasTheft ? [
          {
            reportDate: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'recovered',
            description: 'Vehículo reportado como robado, posteriormente recuperado y devuelto al propietario.'
          }
        ] : []
      },
      fines: {
        hasFines,
        totalFines: hasFines ? Math.floor(Math.random() * 3) + 1 : 0,
        totalAmount: hasFines ? Math.floor(Math.random() * 500000) + 100000 : 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // CA1, CA2, CA3, CA4, CA5: Obtener antecedentes del vehículo
  async getVehicleBackground(licensePlate: string): Promise<{
    success: boolean;
    message: string;
    background?: VehicleBackground;
  }> {
    // CA5: Simular latencia de consulta (máximo 5 segundos)
    await this.delay(Math.random() * 2000 + 1000); // 1-3 segundos

    // CA3: Validar formato de placa
    if (!this.validateLicensePlate(licensePlate)) {
      return {
        success: false,
        message: 'Formato de placa inválido. Use formato ABC123 o ABC12D'
      };
    }

    const plateUpper = licensePlate.toUpperCase().replace(/\s/g, '');

    // Buscar vehículo en la base de datos
    const vehicles = this.getVehicles();
    const vehicle = vehicles.find(v => v.licensePlate?.toUpperCase() === plateUpper);

    // CA3: Placa no encontrada
    if (!vehicle && plateUpper.startsWith('ZZZ')) {
      return {
        success: false,
        message: 'No se encontraron resultados para esta placa. Verifique el número e intente nuevamente.'
      };
    }

    // CA1 & CA2: Consulta exitosa - generar antecedentes
    const background = this.generateMockBackground(plateUpper, vehicle);

    return {
      success: true,
      message: 'Antecedentes consultados exitosamente',
      background
    };
  }

  // CA4: Obtener antecedentes por ID de vehículo
  async getVehicleBackgroundById(vehicleId: string): Promise<{
    success: boolean;
    message: string;
    background?: VehicleBackground;
  }> {
    const vehicles = this.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return {
        success: false,
        message: 'Vehículo no encontrado'
      };
    }

    if (!vehicle.licensePlate) {
      return {
        success: false,
        message: 'Este vehículo no tiene placa registrada'
      };
    }

    return this.getVehicleBackground(vehicle.licensePlate);
  }

  // ==================== SISTEMA DE MENSAJERÍA ====================

  // CdA1: Obtener o crear conversación
  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    vehicleId?: string
  ): Promise<{
    success: boolean;
    message: string;
    conversation?: Conversation;
  }> {
    try {
      // Ordenar IDs para mantener consistencia
      const [participant1, participant2] = [userId, otherUserId].sort();

      // Buscar conversación existente
      const { data: existingConvs, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_1_id', participant1)
        .eq('participant_2_id', participant2)
        .limit(1);

      if (searchError) {
        console.error('Error buscando conversación:', searchError);
        return { success: false, message: 'Error al buscar conversación' };
      }

      if (existingConvs && existingConvs.length > 0) {
        const conv = existingConvs[0];
        
        // Obtener nombres de los usuarios
        const users = this.getUsers();
        const user1 = users.find(u => u.id === conv.participant_1_id);
        const user2 = users.find(u => u.id === conv.participant_2_id);

        // Obtener info del vehículo si existe
        let vehicleInfo;
        if (conv.vehicle_id) {
          const vehicle = this.getVehicles().find(v => v.id === conv.vehicle_id);
          if (vehicle) {
            vehicleInfo = {
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              price: vehicle.price
            };
          }
        }

        const conversation: Conversation = {
          id: conv.id,
          participant1Id: conv.participant_1_id,
          participant1Name: user1?.fullName || 'Usuario',
          participant2Id: conv.participant_2_id,
          participant2Name: user2?.fullName || 'Usuario',
          vehicleId: conv.vehicle_id,
          vehicleInfo,
          lastMessageAt: conv.last_message_at,
          createdAt: conv.created_at
        };

        return { success: true, message: 'Conversación encontrada', conversation };
      }

      // Crear nueva conversación
      const users = this.getUsers();
      const user1 = users.find(u => u.id === participant1);
      const user2 = users.find(u => u.id === participant2);

      if (!user1 || !user2) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: participant1,
          participant_2_id: participant2,
          vehicle_id: vehicleId || null
        })
        .select()
        .single();

      if (insertError || !newConv) {
        console.error('Error creando conversación:', insertError);
        return { success: false, message: 'Error al crear conversación' };
      }

      // Obtener info del vehículo
      let vehicleInfo;
      if (vehicleId) {
        const vehicle = this.getVehicles().find(v => v.id === vehicleId);
        if (vehicle) {
          vehicleInfo = {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price
          };
        }
      }

      const conversation: Conversation = {
        id: newConv.id,
        participant1Id: newConv.participant_1_id,
        participant1Name: user1.fullName,
        participant2Id: newConv.participant_2_id,
        participant2Name: user2.fullName,
        vehicleId: newConv.vehicle_id,
        vehicleInfo,
        lastMessageAt: newConv.last_message_at,
        createdAt: newConv.created_at
      };

      return { success: true, message: 'Conversación creada', conversation };
    } catch (error) {
      console.error('Error en getOrCreateConversation:', error);
      return { success: false, message: 'Error inesperado' };
    }
  }

  // CdA1, CdA2, CdA3: Enviar mensaje
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<{
    success: boolean;
    message: string;
    messageData?: Message;
  }> {
    try {
      // CdA2: Validación de contenido
      if (!content || !content.trim()) {
        return { success: false, message: 'El mensaje no puede estar vacío' };
      }

      // Obtener información del sender
      const users = this.getUsers();
      const sender = users.find(u => u.id === senderId);

      if (!sender) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // CdA1: Insertar mensaje en Supabase
      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim()
        })
        .select()
        .single();

      if (insertError || !newMessage) {
        console.error('Error enviando mensaje:', insertError);
        return { success: false, message: 'Error al enviar mensaje' };
      }

      const messageData: Message = {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        senderId: newMessage.sender_id,
        senderName: sender.fullName,
        content: newMessage.content,
        sentAt: newMessage.sent_at,
        isRead: newMessage.is_read
      };

      return { 
        success: true, 
        message: 'Mensaje enviado', 
        messageData 
      };
    } catch (error) {
      console.error('Error en sendMessage:', error);
      return { success: false, message: 'Error inesperado al enviar mensaje' };
    }
  }

  // CdA1, CdA2, CdA3: Obtener conversaciones de un usuario
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Buscar conversaciones donde el usuario es participante
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo conversaciones:', error);
        return [];
      }

      if (!convs || convs.length === 0) {
        return [];
      }

      const users = this.getUsers();
      const vehicles = this.getVehicles();
      const conversations: Conversation[] = [];

      for (const conv of convs) {
        const user1 = users.find(u => u.id === conv.participant_1_id);
        const user2 = users.find(u => u.id === conv.participant_2_id);

        // Obtener último mensaje para preview
        const { data: lastMsgArray } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(1);

        const lastMsg = lastMsgArray && lastMsgArray.length > 0 ? lastMsgArray[0] : null;

        // CdA3: Contar mensajes no leídos
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false);

        // Obtener info del vehículo
        let vehicleInfo;
        if (conv.vehicle_id) {
          const vehicle = vehicles.find(v => v.id === conv.vehicle_id);
          if (vehicle) {
            vehicleInfo = {
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              price: vehicle.price
            };
          }
        }

        const conversation: Conversation = {
          id: conv.id,
          participant1Id: conv.participant_1_id,
          participant1Name: user1?.fullName || 'Usuario',
          participant2Id: conv.participant_2_id,
          participant2Name: user2?.fullName || 'Usuario',
          vehicleId: conv.vehicle_id,
          vehicleInfo,
          lastMessageAt: conv.last_message_at,
          lastMessagePreview: lastMsg?.content?.substring(0, 50),
          unreadCount: unreadCount || 0,
          createdAt: conv.created_at
        };

        conversations.push(conversation);
      }

      return conversations;
    } catch (error) {
      console.error('Error en getUserConversations:', error);
      return [];
    }
  }

  // CdA1, CdA4, CdA5: Obtener mensajes de una conversación
  async getConversationMessages(conversationId: string, currentUserId: string): Promise<Message[]> {
    try {
      // Obtener mensajes de la conversación
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Error obteniendo mensajes:', error);
        return [];
      }

      if (!msgs || msgs.length === 0) {
        return [];
      }

      // Marcar mensajes del otro usuario como leídos
      const unreadMessages = msgs.filter(m => m.sender_id !== currentUserId && !m.is_read);
      const unreadIds = unreadMessages.map(m => m.id);
      
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }

      // Obtener nombres de usuarios
      const users = this.getUsers();

      const messages: Message[] = msgs.map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: users.find(u => u.id === m.sender_id)?.fullName || 'Usuario',
        content: m.content,
        sentAt: m.sent_at,
        isRead: m.is_read || unreadIds.includes(m.id),
        readAt: m.read_at
      }));

      return messages;
    } catch (error) {
      console.error('Error en getConversationMessages:', error);
      return [];
    }
  }

  // CdA2, CdA3: Obtener conteo total de mensajes no leídos
  async getUnreadMessagesCount(userId: string): Promise<number> {
    try {
      // Obtener todas las conversaciones del usuario
      const { data: convs, error: convsError } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

      if (convsError || !convs) {
        console.error('Error obteniendo conversaciones para conteo:', convsError);
        return 0;
      }

      if (convs.length === 0) {
        return 0;
      }

      const conversationIds = convs.map(c => c.id);

      // Contar mensajes no leídos en todas las conversaciones
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (countError) {
        console.error('Error contando mensajes no leídos:', countError);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error en getUnreadMessagesCount:', error);
      return 0;
    }
  }

  // Obtener información del otro participante
  getOtherParticipant(conversation: Conversation, currentUserId: string): { id: string; name: string } | null {
    if (conversation.participant1Id === currentUserId) {
      return {
        id: conversation.participant2Id,
        name: conversation.participant2Name
      };
    } else if (conversation.participant2Id === currentUserId) {
      return {
        id: conversation.participant1Id,
        name: conversation.participant1Name
      };
    }
    return null;
  }
}

export const localStorageService = new LocalStorageService();

// Inicializar usuarios de prueba al cargar
localStorageService.initializeTestUsers();

// Inicializar vehículos de demostración
localStorageService.initializeDemoVehicles();

// Hacer disponible en consola para debugging (solo desarrollo)
if (typeof window !== 'undefined') {
  (window as any).localStorageService = localStorageService;
  (window as any).resetAdmins = () => {
    localStorageService.forceResetTestUsers();
    console.log('✅ Administradores y usuarios de prueba recreados. Recarga la página.');
  };
}
