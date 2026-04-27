-- Create configurations table
CREATE TABLE IF NOT EXISTS configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample configurations
INSERT INTO configurations (`key`, value, description) VALUES 
('app_name', 'Config Service', 'Application name'),
('max_connections', '100', 'Maximum number of database connections'),
('debug_mode', 'false', 'Enable or disable debug mode');
