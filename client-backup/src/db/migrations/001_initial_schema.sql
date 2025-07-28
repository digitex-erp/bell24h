-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create buyer profiles table
CREATE TABLE buyer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_name VARCHAR(255),
    industry VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create suppliers table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_name VARCHAR(255),
    industry VARCHAR(255),
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create RFQs table
CREATE TABLE rfqs (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES buyer_profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    budget DECIMAL(10,2),
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bids table
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfqs(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    amount DECIMAL(10,2) NOT NULL,
    delivery_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX idx_bids_rfq_id ON bids(rfq_id);
CREATE INDEX idx_bids_supplier_id ON bids(supplier_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
