/*
  # Sistema de Pagos - Comisión de Vehículos

  ## Overview
  Este sistema permite a los compradores pagar una comisión del 5% del valor
  del vehículo a través de una pasarela de pago simulada.

  ## New Tables
  
  ### `payment_transactions`
  - `id` (uuid, primary key) - Identificador único de la transacción
  - `vehicle_id` (uuid) - ID del vehículo adquirido
  - `buyer_id` (uuid) - ID del comprador
  - `seller_id` (uuid) - ID del vendedor
  - `vehicle_price` (numeric) - Precio del vehículo
  - `commission_rate` (numeric) - Porcentaje de comisión (5%)
  - `commission_amount` (numeric) - Monto de la comisión calculada
  - `total_amount` (numeric) - Total a pagar (igual a commission_amount)
  - `payment_method` (text) - Método de pago (credit_card, pse, nequi)
  - `status` (text) - Estado: pending, completed, rejected, cancelled
  - `transaction_reference` (text) - Referencia de la transacción
  - `payment_gateway_response` (jsonb) - Respuesta de la pasarela
  - `created_at` (timestamptz) - Timestamp de creación
  - `completed_at` (timestamptz) - Timestamp de completado
  - `rejected_reason` (text) - Razón de rechazo si aplica

  ## Security
  - Enable RLS on table
  - Users can view their own transactions (buyer or seller)
  - Users can create transactions for themselves

  ## Indexes
  - Create indexes for efficient queries
*/

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  vehicle_price numeric NOT NULL CHECK (vehicle_price > 0),
  commission_rate numeric NOT NULL DEFAULT 5.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount numeric NOT NULL CHECK (commission_amount > 0),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  payment_method text CHECK (payment_method IN ('credit_card', 'debit_card', 'pse', 'nequi', 'daviplata')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  transaction_reference text,
  payment_gateway_response jsonb,
  rejected_reason text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT valid_commission CHECK (commission_amount = (vehicle_price * commission_rate / 100)),
  CONSTRAINT valid_total CHECK (total_amount = commission_amount)
);

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view transactions where they are buyer or seller
CREATE POLICY "Users can view their transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

-- Policy: Buyers can create payment transactions
CREATE POLICY "Buyers can create transactions"
  ON payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type IN ('buyer', 'both')
      AND validation_status = 'approved'
    )
  );

-- Policy: Only system can update transaction status (simulated by buyer updating their own)
CREATE POLICY "Users can update their own transactions"
  ON payment_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_vehicle ON payment_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_buyer ON payment_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_seller ON payment_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON payment_transactions(created_at DESC);

-- Function to automatically set completed_at timestamp
CREATE OR REPLACE FUNCTION set_completed_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update completed_at when status changes to completed
CREATE TRIGGER trigger_set_completed_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at_timestamp();