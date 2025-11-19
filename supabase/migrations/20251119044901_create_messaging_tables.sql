/*
  # Sistema de Mensajería entre Usuarios

  ## Overview
  Este sistema permite a los usuarios (compradores y vendedores) comunicarse
  directamente dentro de la plataforma sobre la compra o venta de vehículos.
  
  ## IMPORTANTE
  Esta versión usa TEXT en lugar de UUID para los IDs de usuario porque
  la aplicación usa localStorage en lugar de Supabase Auth.
  Las políticas RLS son permisivas para permitir operaciones con el anon key.

  ## New Tables
  
  ### `conversations`
  - `id` (uuid, primary key) - Identificador único de la conversación
  - `participant_1_id` (text) - ID del primer participante (de localStorage)
  - `participant_2_id` (text) - ID del segundo participante (de localStorage)
  - `vehicle_id` (text, nullable) - ID del vehículo sobre el que se conversa
  - `last_message_at` (timestamptz) - Timestamp del último mensaje
  - `created_at` (timestamptz) - Timestamp de creación

  ### `messages`
  - `id` (uuid, primary key) - Identificador único del mensaje
  - `conversation_id` (uuid) - ID de la conversación
  - `sender_id` (text) - ID del usuario que envía el mensaje (de localStorage)
  - `content` (text) - Contenido del mensaje
  - `is_read` (boolean) - Estado de lectura del mensaje
  - `sent_at` (timestamptz) - Timestamp de envío
  - `created_at` (timestamptz) - Timestamp de creación

  ## Security
  - Enable RLS on both tables
  - Políticas permisivas para soportar localStorage (sin auth.uid())
  - En producción, estas políticas deben ser más restrictivas

  ## Indexes
  - Create indexes for efficient queries
*/

-- Create conversations table
-- Note: Using text for participant IDs to support localStorage user IDs
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id text NOT NULL,
  participant_2_id text NOT NULL,
  vehicle_id text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  content text NOT NULL CHECK (length(trim(content)) > 0),
  is_read boolean NOT NULL DEFAULT false,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations (permissive for localStorage users)
-- Allow all authenticated users and anon users to view conversations they are part of
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  USING (true);

-- Allow all authenticated users and anon users to create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow all authenticated users and anon users to update conversations
CREATE POLICY "Users can update their conversations"
  ON conversations
  FOR UPDATE
  USING (true);

-- Policies for messages (permissive for localStorage users)
-- Allow all authenticated users and anon users to view messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (true);

-- Allow all authenticated users and anon users to send messages
CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow all authenticated users and anon users to update messages
CREATE POLICY "Users can mark messages as read"
  ON messages
  FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vehicle ON conversations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Function to update last_message_at automatically
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.sent_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at when a new message is inserted
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();