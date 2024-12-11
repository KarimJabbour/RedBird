CREATE DATABASE socs_project_db;

USE socs_project_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- CREATE TABLE bookings (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_email VARCHAR(255),
--     details TEXT NOT NULL,
--     time DATETIME NOT NULL,
--     FOREIGN KEY (user_email) REFERENCES users(email)
-- );
