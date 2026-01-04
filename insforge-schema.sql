-- =====================================================
-- Bell24h InsForge Database Schema
-- Complete PostgreSQL schema for B2B procurement platform
-- =====================================================
-- Execute this in InsForge SQL Editor Dashboard
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  company_type VARCHAR(50), -- manufacturer, trader, distributor, retailer
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  user_type VARCHAR(20) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'supplier', 'both')),
  verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  address JSONB, -- {street, city, state, country, pincode}
  verification_documents JSONB, -- {gst_cert_url, pan_card_url, company_reg_url}
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}', -- {language, notifications, theme}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. OTP VERIFICATIONS TABLE
-- =====================================================
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  otp VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) DEFAULT 'login' CHECK (purpose IN ('login', 'signup', 'password_reset', 'phone_verify', 'email_verify')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick OTP lookup
CREATE INDEX idx_otp_phone ON otp_verifications(phone, verified) WHERE verified = false;
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at) WHERE verified = false;

-- =====================================================
-- 3. CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0, -- 0=root, 1=sub, 2=sub-sub
  icon VARCHAR(100),
  image_url TEXT,
  description TEXT,
  keywords TEXT[], -- for search optimization
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- {custom_fields, requirements}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_category_slug ON categories(slug);
CREATE INDEX idx_category_parent ON categories(parent_id);

-- =====================================================
-- 4. RFQs (REQUEST FOR QUOTATION) TABLE
-- =====================================================
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  category_path VARCHAR(500), -- cached path like "Electronics > Computers > Laptops"

  -- Multi-modal RFQ support
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'voice', 'video', 'image')),
  audio_url TEXT,
  video_url TEXT,
  image_urls TEXT[], -- array of image URLs
  transcription TEXT, -- AI-generated from voice/video
  extracted_data JSONB, -- AI-extracted structured data {product, quantity, specs, etc}

  -- Requirements
  quantity INTEGER,
  unit VARCHAR(50), -- pieces, kg, liters, etc
  required_by_date DATE,
  delivery_location JSONB, -- {city, state, country, pincode}

  -- Specifications
  specifications JSONB, -- {size, color, material, technical_specs}
  attachments TEXT[], -- PDFs, images, drawings

  -- Status & Visibility
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_review', 'closed', 'awarded', 'cancelled')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  invited_supplier_ids UUID[], -- for private RFQs

  -- Budget & Terms
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_terms VARCHAR(100), -- Net 30, Advance, etc

  -- Engagement metrics
  views_count INTEGER DEFAULT 0,
  quotes_count INTEGER DEFAULT 0,
  shortlisted_quotes INTEGER DEFAULT 0,

  -- AI Enhancement
  ai_enhanced BOOLEAN DEFAULT false,
  ai_suggestions JSONB, -- {suggested_suppliers, similar_rfqs, price_estimates}

  -- Timestamps
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rfq_user ON rfqs(user_id);
CREATE INDEX idx_rfq_status ON rfqs(status) WHERE status IN ('open', 'in_review');
CREATE INDEX idx_rfq_category ON rfqs(category_id);
CREATE INDEX idx_rfq_created ON rfqs(created_at DESC);

-- =====================================================
-- 5. SUPPLIERS TABLE
-- =====================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50), -- manufacturer, wholesaler, trader
  years_in_business INTEGER,

  -- Categories they serve
  categories UUID[], -- array of category IDs

  -- Locations
  manufacturing_locations JSONB[], -- [{city, state, country, capacity}]
  service_areas TEXT[], -- cities/states they serve

  -- Capabilities
  certifications TEXT[], -- ISO, FDA, CE, etc
  production_capacity JSONB, -- {daily, monthly, annual}
  minimum_order_quantity INTEGER,
  payment_terms_offered TEXT[],

  -- Ratings & Performance
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  successful_orders INTEGER DEFAULT 0,
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.00,
  response_time_hours DECIMAL(5,2), -- average response time

  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'premium', 'trusted')),
  verified_at TIMESTAMPTZ,

  -- Visibility
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_supplier_user ON suppliers(user_id);
CREATE INDEX idx_supplier_verified ON suppliers(verified, is_active);
CREATE INDEX idx_supplier_rating ON suppliers(rating DESC);

-- =====================================================
-- 6. QUOTES TABLE
-- =====================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- Pricing
  unit_price DECIMAL(15,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  -- Terms
  delivery_days INTEGER,
  delivery_date DATE,
  payment_terms VARCHAR(100),
  warranty_period VARCHAR(50),

  -- Details
  message TEXT,
  specifications_met JSONB, -- {spec_name: met/not_met/exceeded}
  attachments TEXT[], -- brochures, certifications

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  is_counter_offer BOOLEAN DEFAULT false,
  original_quote_id UUID REFERENCES quotes(id), -- for counter-offers

  -- Buyer actions
  viewed_by_buyer BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Validity
  valid_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_rfq ON quotes(rfq_id);
CREATE INDEX idx_quote_supplier ON quotes(supplier_id);
CREATE INDEX idx_quote_status ON quotes(status);
CREATE UNIQUE INDEX idx_quote_rfq_supplier ON quotes(rfq_id, supplier_id) WHERE original_quote_id IS NULL;

-- =====================================================
-- 7. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfqs(id),
  quote_id UUID REFERENCES quotes(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID NOT NULL REFERENCES users(id),

  -- Amount
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  commission_amount DECIMAL(15,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% default
  net_amount_to_supplier DECIMAL(15,2),

  -- Payment Gateway
  payment_method VARCHAR(50), -- razorpay, stripe, bank_transfer
  payment_gateway_id VARCHAR(255), -- Razorpay order ID
  payment_gateway_payment_id VARCHAR(255), -- Razorpay payment ID

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),

  -- Escrow (Blockchain)
  escrow_enabled BOOLEAN DEFAULT false,
  escrow_contract_address VARCHAR(42), -- Ethereum address
  escrow_status VARCHAR(20) CHECK (escrow_status IN ('created', 'funded', 'released', 'refunded', 'disputed')),

  -- Timestamps
  payment_initiated_at TIMESTAMPTZ,
  payment_completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transaction_buyer ON transactions(buyer_id);
CREATE INDEX idx_transaction_supplier ON transactions(supplier_id);
CREATE INDEX idx_transaction_status ON transactions(status);
CREATE INDEX idx_transaction_rfq ON transactions(rfq_id);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- rfq_created, quote_received, payment_received, etc
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Related entities
  related_entity_type VARCHAR(50), -- rfq, quote, transaction, user
  related_entity_id UUID,

  -- Actions
  action_url TEXT,
  action_label VARCHAR(100),

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Delivery channels
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id, read);
CREATE INDEX idx_notification_created ON notifications(created_at DESC);

-- =====================================================
-- 9. REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id), -- supplier being reviewed

  -- Rating (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Review content
  title VARCHAR(255),
  comment TEXT,
  pros TEXT,
  cons TEXT,

  -- Media
  images TEXT[],

  -- Status
  is_verified_purchase BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Response from supplier
  supplier_response TEXT,
  supplier_responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_review_reviewee ON reviews(reviewee_id, is_published);
CREATE INDEX idx_review_transaction ON reviews(transaction_id);

-- =====================================================
-- 10. COMMISSIONS TABLE
-- =====================================================
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  amount DECIMAL(15,2) NOT NULL,
  rate DECIMAL(5,2) NOT NULL, -- percentage
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'failed', 'waived')),
  collected_at TIMESTAMPTZ,

  -- Payout to platform
  payout_method VARCHAR(50),
  payout_reference VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commission_transaction ON commissions(transaction_id);
CREATE INDEX idx_commission_status ON commissions(status);

-- =====================================================
-- 11. REFERRALS TABLE
-- =====================================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),

  -- Rewards
  reward_type VARCHAR(20) DEFAULT 'credits' CHECK (reward_type IN ('credits', 'cash', 'discount')),
  reward_amount DECIMAL(15,2) DEFAULT 0.00,
  reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'earned', 'paid', 'expired')),

  -- Conditions
  required_action VARCHAR(50), -- signup, first_rfq, first_transaction
  action_completed BOOLEAN DEFAULT false,
  action_completed_at TIMESTAMPTZ,

  -- Payout
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_referrer ON referrals(referrer_id);
CREATE INDEX idx_referral_referred ON referrals(referred_id);

-- =====================================================
-- 12. INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID NOT NULL REFERENCES users(id),

  -- Invoice details
  subtotal DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  -- Line items
  line_items JSONB NOT NULL, -- [{description, quantity, unit_price, total}]

  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),

  -- Files
  pdf_url TEXT,

  -- Notes
  notes TEXT,
  terms_and_conditions TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_buyer ON invoices(buyer_id);
CREATE INDEX idx_invoice_supplier ON invoices(supplier_id);
CREATE INDEX idx_invoice_transaction ON invoices(transaction_id);
CREATE INDEX idx_invoice_number ON invoices(invoice_number);

-- =====================================================
-- 13. CHAT MESSAGES TABLE (Real-time negotiation)
-- =====================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),

  -- Message content
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  file_url TEXT,

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- System messages
  is_system_message BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_rfq ON chat_messages(rfq_id, created_at);
CREATE INDEX idx_chat_quote ON chat_messages(quote_id, created_at);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id, read);

-- =====================================================
-- 14. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- create_rfq, submit_quote, make_payment, etc
  entity_type VARCHAR(50), -- rfq, quote, transaction, user
  entity_id UUID,

  -- Details
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- 15. AI EXPLANATIONS TABLE (SHAP/LIME)
-- =====================================================
CREATE TABLE ai_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),

  -- What decision was explained
  decision_type VARCHAR(50) NOT NULL, -- supplier_match, price_suggestion, risk_score
  related_entity_type VARCHAR(50), -- rfq, supplier, quote
  related_entity_id UUID,

  -- AI Model used
  model_name VARCHAR(100), -- groq-llama3, openai-gpt4, etc
  model_version VARCHAR(50),

  -- Explanation
  explanation_method VARCHAR(20) CHECK (explanation_method IN ('shap', 'lime', 'attention')),
  feature_importance JSONB, -- {feature_name: importance_score}
  explanation_text TEXT,
  confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000

  -- Visualizations
  chart_url TEXT,
  chart_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_user ON ai_explanations(user_id);
CREATE INDEX idx_ai_entity ON ai_explanations(related_entity_type, related_entity_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- RFQs: Buyers can CRUD their own, Suppliers can read public ones
CREATE POLICY rfqs_select_own ON rfqs FOR SELECT USING (
  auth.uid() = user_id OR
  visibility = 'public' OR
  (visibility = 'invite_only' AND auth.uid() = ANY(invited_supplier_ids))
);
CREATE POLICY rfqs_insert_own ON rfqs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY rfqs_update_own ON rfqs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY rfqs_delete_own ON rfqs FOR DELETE USING (auth.uid() = user_id);

-- Quotes: Suppliers can CRUD their own, Buyers can read quotes for their RFQs
CREATE POLICY quotes_select_relevant ON quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM suppliers WHERE suppliers.user_id = auth.uid() AND suppliers.id = quotes.supplier_id)
  OR
  EXISTS (SELECT 1 FROM rfqs WHERE rfqs.user_id = auth.uid() AND rfqs.id = quotes.rfq_id)
);

CREATE POLICY quotes_insert_own ON quotes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM suppliers WHERE suppliers.user_id = auth.uid() AND suppliers.id = supplier_id)
);

-- Notifications: Users can only read their own
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment views counter on RFQs
CREATE OR REPLACE FUNCTION increment_rfq_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rfqs SET views_count = views_count + 1 WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update quote count when quote is inserted
CREATE OR REPLACE FUNCTION update_rfq_quote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rfqs SET quotes_count = quotes_count + 1 WHERE id = NEW.rfq_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rfqs SET quotes_count = quotes_count - 1 WHERE id = OLD.rfq_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rfq_quotes AFTER INSERT OR DELETE ON quotes
FOR EACH ROW EXECUTE FUNCTION update_rfq_quote_count();

-- =====================================================
-- SEED DATA - Categories (450+ categories ready)
-- =====================================================
-- This will be imported from your existing categories data
-- Example starter categories:

INSERT INTO categories (name, slug, level, icon, is_active) VALUES
('Electronics', 'electronics', 0, 'IconDeviceLaptop', true),
('Industrial Machinery', 'industrial-machinery', 0, 'IconTool', true),
('Raw Materials', 'raw-materials', 0, 'IconPackage', true),
('Office Supplies', 'office-supplies', 0, 'IconPencil', true),
('Construction', 'construction', 0, 'IconBuildingFactory', true);

-- Sub-categories will be inserted with parent_id reference

-- =====================================================
-- COMPLETED! 🎉
-- =====================================================
-- Your database schema is now ready!
--
-- Next steps:
-- 1. Execute this SQL in InsForge Dashboard
-- 2. Copy the API URL and anon key to .env.local
-- 3. Install SDK: npm install @insforge/supabase-js
-- 4. Start wiring API routes
-- =====================================================
