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

## Documentos relacionados

- Las reglas y validaciones de los contactos están en `business-rules.md`.
- La arquitectura del backend, frontend y su comunicación está en `architecture.md`.
- La autenticación, las sesiones y la protección de datos están en `security.md`.