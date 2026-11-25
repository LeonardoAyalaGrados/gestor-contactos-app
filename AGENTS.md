# Instrucciones para el agente

## Proyecto

Se desarrollará un gestor web de contactos para una empresa.

## Tecnologías acordadas

- Frontend: Angular y TypeScript.
- Backend: Java con Spring Boot.
- Base de datos: MySQL.
- Mantener una sola aplicación de negocio, sin microservicios.

## Forma de trabajo

- Trabaja únicamente en la tarea solicitada.
- Avanza en cambios pequeños; no intentes implementar todo el sistema de una vez.
- Antes de cambiar archivos, revisa el contexto disponible y explica brevemente el enfoque.
- No inventes requisitos ni reglas de negocio. Si falta una decisión necesaria, indícala antes de asumirla.
- Respeta la estructura existente. Si todavía no existe una estructura, propón una antes de crearla.
- No cambies tecnologías ni arquitectura sin explicar el motivo.
- Al terminar, resume los cambios y señala qué aspectos quedan pendientes o requieren revisión.

## Documentación del proyecto

Cuando existan, consulta y respeta estos documentos:

- `docs/requirements.md`: funcionalidades y criterios de aceptación.
- `docs/business-rules.md`: reglas de negocio.
- `docs/architecture.md`: estructura y decisiones de arquitectura.
- `docs/security.md`: decisiones y requisitos de seguridad.

Si una tarea cambia un requisito o una regla documentada, señala que la documentación también debería actualizarse.

## Seguridad

- No guardes credenciales, claves ni secretos reales en el repositorio.
- No almacenes contraseñas en texto plano.
- Aplica en el backend las validaciones importantes; las validaciones del frontend no las reemplazan.
- Las operaciones protegidas deben comprobar la autenticación y los permisos en el servidor.

## Cambios y commits

- No crees commits automáticamente.
- Antes de sugerir un commit, resume qué cambio completo y revisado incluiría.
- Mantén cada cambio coherente con una sola tarea.