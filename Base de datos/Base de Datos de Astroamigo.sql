CREATE DATABASE ASTROAMIGO;
USE ASTROAMIGO;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL, -- El hash cifra la contraseña --
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

INSERT INTO categoria (nombre, descripcion)
VALUES
('Sistema Solar', 'Aprende sobre el Sol, los planetas y otros cuerpos celestes.'),
('Estrellas', 'Conoce cómo nacen, evolucionan y se clasifican las estrellas.'),
('Galaxias', 'Descubre las galaxias, sus características y sus diferentes tipos.');

SELECT * FROM categoria;

CREATE TABLE leccion (
    id_leccion INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE cuestionario (
    id_cuestionario INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    id_leccion INT NOT NULL UNIQUE,
    FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion)
);

CREATE TABLE pregunta (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    enunciado TEXT NOT NULL,
    id_cuestionario INT NOT NULL,
    FOREIGN KEY (id_cuestionario) REFERENCES cuestionario(id_cuestionario)
);

-- TABLA 6: OPCION_RESPUESTA
CREATE TABLE opcion_respuesta (
    id_opcion INT AUTO_INCREMENT PRIMARY KEY,
    texto_opcion VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    id_pregunta INT NOT NULL,
    FOREIGN KEY (id_pregunta)
        REFERENCES pregunta(id_pregunta)
);

-- TABLA 7: INTENTO
CREATE TABLE intento (
    id_intento INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_cuestionario INT NOT NULL,
    puntuacion DECIMAL(5,2) NOT NULL,
    fecha_intento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_cuestionario) REFERENCES cuestionario(id_cuestionario)
);

SHOW TABLES;



SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'ASTROAMIGO'
AND REFERENCED_TABLE_NAME IS NOT NULL;
