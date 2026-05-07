-- ======================================================
-- LUDIX - DATOS INICIALES (SIN DESCRIPTION EN creative_areas)
-- ======================================================

-- 1. Roles
INSERT INTO rol (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'user', 'Usuario normal');

-- 2. Permisos
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
(25, 'view_users', 'Ver lista de usuarios'),
(26, 'view_user', 'Ver detalle de un usuario'),
(27, 'read_users', 'Leer usuarios'),
(28, 'view_exercises', 'Ver ejercicios');

-- 3. Asignar TODOS los permisos al rol admin
INSERT INTO "rol_permissions" ("rolId", "permissionId")
SELECT 1, id FROM permissions;

-- 4. Asignar permisos básicos al rol user
INSERT INTO "rol_permissions" ("rolId", "permissionId") VALUES
(2, 6),   -- view_stats
(2, 7),   -- create_comment
(2, 8),   -- delete_comment
(2, 28);  -- view_exercises

-- 5. Usuarios
INSERT INTO users (id, email, password, name, "rolId") VALUES
(1, 'admin@ludix.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cFZJ2W8Pq7XpQoQ3WmFqR0tXxJu', 'Admin Principal', 1),
(2, 'user1@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Laura Diseñadora', 2),
(3, 'user2@ludix.com', '$2b$10$Lg6GkYkFZwRgVnQnXqNk9eJ9lN9qo8uLOickgx2ZMRZoMy.Mr/.cF', 'Carlos Ilustrador', 2);

-- 6. Áreas creativas (SIN columna description)
INSERT INTO creative_areas (id, area) VALUES
(1, 'Diseño Gráfico'),
(2, 'UI/UX'),
(3, 'Ilustración'),
(4, 'Animación'),
(5, 'Diseño Industrial');

-- 7. Perfiles
INSERT INTO profiles (id, "userId", "creativeAreaId", bio, location) VALUES
(1, 1, 1, 'Administrador y diseñador', 'Bogotá'),
(2, 2, 2, 'Apasionada por el UX', 'Medellín'),
(3, 3, 3, 'Ilustradora freelance', 'Cali');

-- 8. Tipos de ejercicio
INSERT INTO exercise_types (id, type, description) VALUES
(1, 'Desbloqueo', 'Ejercicios para desbloquear la creatividad'),
(2, 'Ideación', 'Técnicas para generar ideas'),
(3, 'Pausa activa', 'Estiramientos y movimiento');

-- 9. Ejercicios
INSERT INTO exercises (id, name, description, duration, "exerciseTypeId", "createdBy") VALUES
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

-- 11. Historial de ejercicios
INSERT INTO exercise_history (id, "userId", "exerciseId", "completedAt") VALUES
(1, 2, 1, '2025-04-01'),
(2, 2, 3, '2025-04-02'),
(3, 3, 2, '2025-04-01');

-- 12. Favoritos
INSERT INTO favorites (id, "userId", "exerciseId") VALUES
(1, 2, 1),
(2, 2, 3),
(3, 3, 2);

-- 13. Comentarios
INSERT INTO comments (id, "userId", "exerciseId", content, "createdAt") VALUES
(1, 2, 1, 'Excelente ejercicio', NOW()),
(2, 3, 2, 'Muy útil', NOW());

-- 14. Logros obtenidos por usuarios
INSERT INTO user_achievements (id, "userId", "achievementId", "dateOfAchievement") VALUES
(1, 2, 1, '2025-04-01'),
(2, 2, 3, '2025-04-02'),
(3, 3, 2, '2025-04-01');