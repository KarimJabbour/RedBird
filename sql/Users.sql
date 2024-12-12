
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Professor', 'TA', 'Student') NOT NULL,
    default_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled BOOLEAN DEFAULT TRUE);

-- Insert sample users into the 'users' table
INSERT INTO users (email, password, full_name, role, default_location, created_at, notifications_enabled)
VALUES
('alice@mail.mcgill.ca', 'password123', 'Alice Johnson', 'Student', 'Downtown Campus', NOW(), TRUE),
('bob@mail.mcgill.ca', 'securepass456', 'Bob Smith', 'Professor', 'Main Campus', NOW(), TRUE),
('carol@mail.mcgill.ca', 'qwerty789', 'Carol White', 'TA', 'Engineering Building', NOW(), FALSE),
('dave@mail.mcgill.ca', 'mypassword321', 'Dave Brown', 'Student', NULL, NOW(), TRUE),
('eve@mail.mcgill.ca', 'letmein654', 'Eve Green', 'Professor', 'Law Library', NOW(), FALSE);
