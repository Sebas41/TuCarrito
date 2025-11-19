import { supabase } from './supabase';

/**
 * Verifica la conexión a Supabase y si las tablas de mensajería existen
 */
export async function checkSupabaseConnection() {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    // Test básico de conexión
    const { error } = await supabase.from('conversations').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('❌ Las tablas de mensajería no existen en Supabase');
        console.log('📝 Para crearlas, ejecuta en tu dashboard de Supabase:');
        console.log('   SQL Editor > New Query > Pega el contenido de:');
        console.log('   supabase/migrations/20251111000000_create_messaging_tables.sql');
        return false;
      }
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión exitosa. Tabla conversations existe.');
    
    // Verificar tabla messages
    const { error: msgError } = await supabase.from('messages').select('count', { count: 'exact', head: true });
    
    if (msgError) {
      console.error('❌ Tabla messages no existe');
      return false;
    }
    
    console.log('✅ Tabla messages existe.');
    console.log('✅ Sistema de mensajería listo!');
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando Supabase:', error);
    return false;
  }
}

/**
 * Inicializa las tablas si no existen (requiere permisos de admin)
 */
export async function initMessagingTables() {
  console.log('⚠️  Esta función requiere ejecutar el SQL manualmente en Supabase Dashboard');
  console.log('📝 Pasos:');
  console.log('1. Ve a https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a SQL Editor');
  console.log('4. New Query');
  console.log('5. Copia y pega el contenido de: supabase/migrations/20251111000000_create_messaging_tables.sql');
  console.log('6. Ejecuta (Run)');
}
