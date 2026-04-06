-- ======================================================
-- LUDIX - Datos iniciales (VERSIÓN FINAL CORREGIDA)
-- Incluye todos los permisos necesarios para los controladores
-- ======================================================

-- 1. Agregar columna description a creative_areas si no existe
ALTER TABLE creative_areas ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Roles
INSERT INTO rol (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'user', 'Usuario normal');

-- 4. Permisos (todos los necesarios, incluyendo los que usan los controladores)
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
(23, 'manage_users', 'Gestionar usuarios'),
(24, 'manage_achievements', 'Gestionar logros'),
(25, 'view_users', 'Ver lista de usuarios'),        -- para GET /users
(26, 'view_user', 'Ver detalle de un usuario'),     -- para GET /users/:id
(27, 'read_users', 'Leer usuarios'),                -- alternativo
(28, 'view_exercises', 'Ver ejercicios');           -- para GET /exercises

-- 5. Asignar TODOS los permisos al rol admin (rolId=1)
INSERT INTO "rol_permissions" ("rolId", "permissionId")
SELECT 1, id FROM permissions;

-- 6. Asignar permisos básicos al rol user (rolId=2)
INSERT INTO "rol_permissions" ("rolId", "permissionId") VALUES
(2, 6),  -- view_stats
(2, 7),  -- create_comment
(2, 8);  -- delete_comment

-- 7. Usuarios (contraseñas hasheadas con bcrypt)
-- admin123 -> $2a$10$OL3.a6rwZHkAkb0ChQyebu8dT8FacL9OZOghOLUv6HBtyeAhbOeKq
-- user123  -> $2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF
INSERT INTO users (id, email, password, name, "rolId") VALUES
(1, 'admin@ludix.com', '$2a$10$OL3.a6rwZHkAkb0ChQyebu8dT8FacL9OZOghOLUv6HBtyeAhbOeKq', 'Admin Principal', 1),
(2, 'user1@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Laura Diseñadora', 2),
(3, 'user2@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Carlos Ilustrador', 2);

-- 8. Áreas creativas
INSERT INTO creative_areas (id, area, description) VALUES
(1, 'Diseño Gráfico', 'Diseño de identidad, branding, editorial'),
(2, 'UI/UX', 'Diseño de interfaces y experiencia de usuario'),
(3, 'Ilustración', 'Ilustración digital y tradicional'),
(4, 'Animación', 'Animación 2D y 3D'),
(5, 'Diseño Industrial', 'Producto y objetos');

-- 9. Perfiles
INSERT INTO profiles (id, "userId", "creativeAreaId", bio, location) VALUES
(1, 1, 1, 'Administrador y diseñador', 'Bogotá'),
(2, 2, 2, 'Apasionada por el UX', 'Medellín'),
(3, 3, 3, 'Ilustradora freelance', 'Cali');

-- 10. Tipos de ejercicio
INSERT INTO exercise_types (id, type, description) VALUES
(1, 'Desbloqueo', 'Ejercicios para desbloquear la creatividad'),
(2, 'Ideación', 'Técnicas para generar ideas'),
(3, 'Pausa activa', 'Estiramientos y movimiento');

-- 11. Ejercicios
INSERT INTO exercises (id, name, description, duration, "exerciseTypeId", "createdBy") VALUES
(1, 'Crazy 8''s', 'Dobla una hoja en 8 partes y dibuja una idea en cada una en 8 minutos', 8, 2, 'admin'),
(2, 'SCAMPER', 'Aplica las 7 preguntas a un objeto o idea', 10, 2, 'admin'),
(3, 'Estiramiento de manos', 'Ejercicios para liberar tensión en muñecas y dedos', 3, 3, 'admin'),
(4, 'Dibujo a ciegas', 'Dibuja sin mirar el papel', 5, 1, 'admin'),
(5, 'Mapa mental', 'Crea un mapa mental sobre un tema', 12, 2, 'admin'),
(6, 'Pausa de ojos', 'Ejercicios de enfoque visual', 2, 3, 'admin');

-- 12. Logros
INSERT INTO achievements (id, name, description, requirement) VALUES
(1, 'Primer comentario', 'Deja tu primer comentario', 'Crear 1 comentario'),
(2, 'Racha de 7 días', 'Completa ejercicios 7 días seguidos', '7 días consecutivos'),
(3, 'Explorador', 'Completa 5 ejercicios diferentes', '5 ejercicios distintos');

-- 13. Historial de ejercicios
INSERT INTO exercise_history (id, "userId", "exerciseId", "completedAt") VALUES
(1, 2, 1, '2025-04-01'),
(2, 2, 3, '2025-04-02'),
(3, 3, 2, '2025-04-01');

-- 14. Favoritos
INSERT INTO favorites (id, "userId", "exerciseId") VALUES
(1, 2, 1),
(2, 2, 3),
(3, 3, 2);

-- 15. Comentarios (opcional - descomentar si se necesitan)
INSERT INTO comments (id, "userId", "exerciseId", content, "createdAt") VALUES
(1, 2, 1, 'Excelente ejercicio', NOW()),
(2, 3, 2, 'Muy útil', NOW());

-- 16. Logros obtenidos por usuarios
INSERT INTO user_achievements (id, "userId", "achievementId", "dateOfAchievement") VALUES
(1, 2, 1, '2025-04-01'),
(2, 2, 3, '2025-04-02'),
(3, 3, 2, '2025-04-01');

-- 17. Reiniciar secuencias (para que los IDs sigan correctamente)
SELECT setval('rol_id_seq', COALESCE((SELECT MAX(id) FROM rol), 1));
SELECT setval('permissions_id_seq', COALESCE((SELECT MAX(id) FROM permissions), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('creative_areas_id_seq', COALESCE((SELECT MAX(id) FROM creative_areas), 1));
SELECT setval('profiles_id_seq', COALESCE((SELECT MAX(id) FROM profiles), 1));
SELECT setval('exercise_types_id_seq', COALESCE((SELECT MAX(id) FROM exercise_types), 1));
SELECT setval('exercises_id_seq', COALESCE((SELECT MAX(id) FROM exercises), 1));
SELECT setval('achievements_id_seq', COALESCE((SELECT MAX(id) FROM achievements), 1));
SELECT setval('exercise_history_id_seq', COALESCE((SELECT MAX(id) FROM exercise_history), 1));
SELECT setval('favorites_id_seq', COALESCE((SELECT MAX(id) FROM favorites), 1));
SELECT setval('user_achievements_id_seq', COALESCE((SELECT MAX(id) FROM user_achievements), 1));