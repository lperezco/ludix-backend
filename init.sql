-- ======================================================
-- LUDIX - Datos iniciales para pruebas
-- ======================================================

-- 1. Roles
INSERT INTO rol (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'user', 'Usuario normal');

-- 2. Permisos (lista completa para la aplicación)
INSERT INTO permissions (id, name, description) VALUES
(1, 'create_exercise', 'Crear ejercicios'),
(2, 'edit_exercise', 'Editar ejercicios'),
(3, 'delete_exercise', 'Eliminar ejercicios'),
(4, 'block_user', 'Bloquear usuarios'),
(5, 'manage_reports', 'Gestionar reportes'),
(6, 'view_stats', 'Ver estadísticas'),
(7, 'create_comment', 'Crear comentarios'),
(8, 'delete_comment', 'Eliminar comentarios propios'),
(9, 'delete_any_comment', 'Eliminar cualquier comentario'),
(10, 'read_rol', 'Ver roles'),
(11, 'create_rol', 'Crear roles'),
(12, 'update_rol', 'Actualizar roles'),
(13, 'delete_rol', 'Eliminar roles'),
(14, 'read_permission', 'Ver permisos'),
(15, 'create_permission', 'Crear permisos'),
(16, 'update_permission', 'Actualizar permisos'),
(17, 'delete_permission', 'Eliminar permisos'),
(18, 'read_rol_permission', 'Ver asignaciones rol-permiso'),
(19, 'create_rol_permission', 'Asignar permisos a roles'),
(20, 'update_rol_permission', 'Actualizar asignaciones'),
(21, 'delete_rol_permission', 'Eliminar asignaciones'),
(22, 'manage_comments', 'Moderar comentarios'),
(23, 'manage_users', 'Gestionar usuarios (ver, editar, eliminar)'),
(24, 'manage_achievements', 'Gestionar logros');

-- 3. Asignar todos los permisos al rol admin (id=1)
INSERT INTO rol_permissions (rolId, permissionId)
SELECT 1, id FROM permissions;

-- 4. Asignar permisos básicos al rol user (id=2)
INSERT INTO rol_permissions (rolId, permissionId) VALUES
(2, 6),  -- view_stats
(2, 7),  -- create_comment
(2, 8);  -- delete_comment (solo propios)

-- 5. Usuarios (las contraseñas deben estar hasheadas con bcrypt)
-- Para "admin123" (bcrypt, salt=10): $2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cFZJ2W8Pq7XpQoQ3WmFqR0tXxJu
-- Para "user123": $2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF
-- Puedes generar los hashes con `bcrypt.hashSync('admin123', 10)` en Node.

INSERT INTO users (id, email, password, name, rolId) VALUES
(1, 'admin@ludix.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cFZJ2W8Pq7XpQoQ3WmFqR0tXxJu', 'Admin Principal', 1),
(2, 'user1@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Laura Diseñadora', 2),
(3, 'user2@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Carlos Ilustrador', 2);

-- 6. Áreas creativas
INSERT INTO creative_areas (id, area, description) VALUES
(1, 'Diseño Gráfico', 'Diseño de identidad, branding, editorial'),
(2, 'UI/UX', 'Diseño de interfaces y experiencia de usuario'),
(3, 'Ilustración', 'Ilustración digital y tradicional'),
(4, 'Animación', 'Animación 2D y 3D'),
(5, 'Diseño Industrial', 'Producto y objetos');

-- 7. Perfiles (relación usuario-área creativa)
INSERT INTO profiles (id, userId, creativeAreaId, bio, location) VALUES
(1, 1, 1, 'Administrador y diseñador', 'Bogotá'),
(2, 2, 2, 'Apasionada por el UX', 'Medellín'),
(3, 3, 3, 'Ilustradora freelance', 'Cali');

-- 8. Tipos de ejercicio
INSERT INTO exercise_types (id, type, description) VALUES
(1, 'Desbloqueo', 'Ejercicios para desbloquear la creatividad'),
(2, 'Ideación', 'Técnicas para generar ideas'),
(3, 'Pausa activa', 'Estiramientos y movimiento');

-- 9. Ejercicios de ejemplo
INSERT INTO exercises (id, name, description, duration, exerciseTypeId, createdBy) VALUES
(1, 'Crazy 8''s', 'Dobla una hoja en 8 partes y dibuja una idea en cada una en 8 minutos', 8, 2, 'admin'),
(2, 'SCAMPER', 'Aplica las 7 preguntas a un objeto o idea', 10, 2, 'admin'),
(3, 'Estiramiento de manos', 'Ejercicios para liberar tensión en muñecas y dedos', 3, 3, 'admin'),
(4, 'Dibujo a ciegas', 'Dibuja sin mirar el papel', 5, 1, 'admin'),
(5, 'Mapa mental', 'Crea un mapa mental sobre un tema', 12, 2, 'admin'),
(6, 'Pausa de ojos', 'Ejercicios de enfoque visual', 2, 3, 'admin');

-- 10. Logros
INSERT INTO achievements (id, name, description, requirement) VALUES
(1, 'Primer comentario', 'Deja tu primer comentario', 'Crear 1 comentario'),
(2, 'Racha de 7 días', 'Completa ejercicios 7 días seguidos', '7 días consecutivos'),
(3, 'Explorador', 'Completa 5 ejercicios diferentes', '5 ejercicios distintos');

-- 11. Historial de ejercicios (ejemplo para usuarios)
INSERT INTO exercise_history (id, userId, exerciseId, completedAt) VALUES
(1, 2, 1, '2025-04-01'),
(2, 2, 3, '2025-04-02'),
(3, 3, 2, '2025-04-01');

-- 12. Favoritos
INSERT INTO favorites (id, userId, exerciseId) VALUES
(1, 2, 1),
(2, 2, 3),
(3, 3, 2);

-- 13. Comentarios (si la tabla ya existe)
-- INSERT INTO comments (userId, exerciseId, content, createdAt) VALUES
-- (2, 1, '¡Me encantó este ejercicio!', NOW()),
-- (3, 2, 'Muy útil para desbloquear ideas', NOW());

-- 14. Logros obtenidos por usuarios
INSERT INTO user_achievements (userId, achievementId, dateOfAchievement) VALUES
(2, 1, '2025-04-01'),
(2, 3, '2025-04-02'),
(3, 2, '2025-04-01');

-- Reiniciar secuencias (opcional, útil si insertaste IDs manuales)
SELECT setval('rol_id_seq', (SELECT MAX(id) FROM rol));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('creative_areas_id_seq', (SELECT MAX(id) FROM creative_areas));
SELECT setval('profiles_id_seq', (SELECT MAX(id) FROM profiles));
SELECT setval('exercise_types_id_seq', (SELECT MAX(id) FROM exercise_types));
SELECT setval('exercises_id_seq', (SELECT MAX(id) FROM exercises));
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
SELECT setval('exercise_history_id_seq', (SELECT MAX(id) FROM exercise_history));
SELECT setval('favorites_id_seq', (SELECT MAX(id) FROM favorites));
SELECT setval('user_achievements_id_seq', (SELECT MAX(id) FROM user_achievements));
