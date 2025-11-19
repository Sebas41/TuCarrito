import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkSupabaseConnection } from './lib/checkSupabase';

// Verificar conexión a Supabase al iniciar
checkSupabaseConnection().then(isConnected => {
  if (!isConnected) {
    console.error('⚠️  ATENCIÓN: El sistema de mensajería no está configurado');
    console.log('📖 Lee SETUP_MESSAGING.md para instrucciones de configuración');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
