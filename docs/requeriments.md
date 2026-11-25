# Requerimientos del sistema

## Propósito

El sistema permitirá a una empresa administrar sus contactos desde una aplicación web.
Los usuarios autenticados podrán gestionar la agenda compartida de la empresa según
los permisos de su rol.

## Actores

- **Usuario autenticado (`USER`):** puede consultar y gestionar contactos.
- **Administrador (`ADMIN`):** puede realizar las acciones de un `USER`, administrar
  usuarios y consultar la auditoría global.

## Requerimientos funcionales

Marca cada casilla cuando hayas implementado y revisado el requerimiento.

| Estado | ID | Área | Requerimiento |
|---|---|---|---|
| [ ] | RF-01 | Sesión | Iniciar sesión con credenciales válidas. |
| [ ] | RF-02 | Sesión | Cerrar sesión e invalidar el acceso a los módulos protegidos. |
| [ ] | RF-03 | Sesión | Mantener la sesión al recargar la página o regresar posteriormente, hasta cerrar sesión o alcanzar su expiración. |
| [ ] | RF-04 | Contactos | Registrar un contacto respetando las reglas de negocio. |
| [ ] | RF-05 | Contactos | Consultar la agenda de contactos de la empresa. |
| [ ] | RF-06 | Contactos | Consultar los datos completos de un contacto. |
| [ ] | RF-07 | Contactos | Buscar contactos por DNI, nombres y apellidos. |
| [ ] | RF-08 | Contactos | Editar los datos de un contacto respetando las reglas de negocio. |
| [ ] | RF-09 | Contactos | Desactivar un contacto. |
| [ ] | RF-10 | Contactos | Reactivar un contacto inactivo respetando las reglas de negocio. |
| [ ] | RF-11 | Contactos | Agregar varios teléfonos y correos electrónicos a un contacto. |
| [ ] | RF-12 | Contactos | Adjuntar la fotografía requerida al registrar un contacto. |
| [ ] | RF-13 | Usuarios | Permitir que `ADMIN` cree, modifique y desactive usuarios. |
| [ ] | RF-14 | Auditoría | Registrar la creación, modificación, desactivación y reactivación de contactos. |
| [ ] | RF-15 | Auditoría | Permitir que solo `ADMIN` consulte la auditoría global. |

## Requerimientos de acceso

| Estado | ID | Rol | Acceso |
|---|---|---|---|
| [ ] | RP-01 | `USER` | Consultar, registrar, buscar, editar, desactivar y reactivar contactos. |
| [ ] | RP-02 | `ADMIN` | Realizar las acciones de `USER`, administrar usuarios y consultar la auditoría global. |

## Especificaciones técnicas complementarias

Estas precisiones complementan los requerimientos sin cambiar los identificadores ni el estado de las tablas anteriores.

### Sesión y cuentas

- El inicio de sesión entregará un JWT que se enviará como `Bearer <token>`. El token durará 24 horas y contendrá el rol `USER` o `ADMIN`.
- Angular guardará el token en `localStorage` para mantener la sesión al recargar o regresar. Lo limpiará al cerrar sesión, ante HTTP `401` o al expirar.
- El sistema cargará una cuenta `ADMIN` inicial mediante una semilla idempotente al arrancar, con contraseña hasheada en BCrypt y suministrada por configuración externa. No habrá registro público ni recuperación por correo en esta versión.

### Agenda y contactos

- La búsqueda de RF-07 será parcial por DNI, nombres y apellidos, insensible a mayúsculas/minúsculas y compatible con tildes mediante `utf8mb4_unicode_ci`.
- La agenda de RF-05 será paginada con `page` y `size`, ordenada por apellidos y nombres. Por defecto mostrará contactos activos y permitirá filtrar inactivos.
- Desactivar un contacto conserva su registro y foto en disco. Si se edita con una foto nueva, se reemplaza el archivo anterior y se elimina el anterior del disco. La reactivación seguirá sujeta a RN-13.
- El acceso a las fotografías se realizará mediante un endpoint autenticado del backend.

### Auditoría

- Los registros incluirán entidad afectada e ID, acción, usuario ejecutor, detalle del cambio y timestamp. Las acciones abarcan `LOGIN`, `CREAR`, `ACTUALIZAR`, `DESACTIVAR`, `REACTIVAR` y las acciones de usuario que correspondan.
- La retención será permanente en la base de datos; la aplicación no expondrá operaciones para editar ni eliminar estos registros.

### API y configuración

- La API usará `/api/v1`; Spring Boot escuchará en `8080` y Angular en `4200`, con CORS configurado para el origen local del frontend.
- Las respuestas de error tendrán `timestamp`, `status`, `error`, `message`, `path` y `validationErrors`, sin stacktraces ni secretos.
- MySQL usará `utf8mb4` y `utf8mb4_unicode_ci`. La conexión y secretos se suministrarán mediante variables de entorno y perfiles de Spring (`application.properties`).

## Documentos relacionados

- Las reglas y validaciones de los contactos están en `business-rules.md`.
- La arquitectura del backend, frontend y su comunicación está en `architecture.md`.
- La autenticación, las sesiones y la protección de datos están en `security.md`.
