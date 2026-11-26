# Reglas de negocio

Marca cada casilla cuando la regla esté implementada en el sistema y hayas verificado su cumplimiento.

| Estado | ID | Área | Regla de negocio | Justificación |
|---|---|---|---|---|
| [x] | RN-01 | DNI | El DNI debe contener exactamente 8 dígitos numéricos. | Evitar documentos con formato inválido. |
| [ ] | RN-02 | DNI | No pueden existir dos contactos activos con el mismo DNI. | Evitar duplicados entre los contactos vigentes. |
| [x] | RN-03 | DNI | Al editar un contacto, se permite conservar su DNI si no pertenece a otro contacto activo. | Permitir actualizar otros datos sin generar un falso duplicado. |
| [ ] | RN-04 | Nombres | Los nombres y apellidos son obligatorios. | Identificar correctamente al contacto. |
| [ ] | RN-05 | Teléfonos | Se aceptan números móviles peruanos de 9 dígitos que comiencen con 9. | Validar teléfonos según el alcance definido. |
| [ ] | RN-06 | Correos | Cada correo electrónico debe tener un formato válido. | Evitar guardar correos con formato incorrecto. |
| [ ] | RN-07 | Correos | No se puede repetir el mismo correo dentro de un contacto. | Evitar medios de contacto duplicados. |
| [ ] | RN-08 | Medios de contacto | Cada contacto debe tener al menos un teléfono o un correo electrónico. Puede tener ambos. | Asegurar que exista al menos un medio de comunicación. |
| [ ] | RN-09 | Fotografía | La fotografía es obligatoria al registrar un contacto. | Incluir la fotografía solicitada para cada contacto. |
| [ ] | RN-10 | Fotografía | Se aceptan archivos JPG, JPEG, PNG y WEBP de máximo 2 MB. | Limitar el tipo y tamaño de los archivos aceptados. |
| [x] | RN-11 | Contactos | Un contacto puede tener varios teléfonos y varios correos electrónicos. | Permitir múltiples medios de comunicación. |
| [x] | RN-12 | Eliminación | Al eliminar un contacto desde la aplicación, este pasa al estado `INACTIVO`; no se borra físicamente. | Evitar perder información de forma permanente. |
| [ ] | RN-13 | Reactivación | Un contacto inactivo solo puede reactivarse si ningún otro contacto activo usa su DNI. | Mantener la unicidad del DNI entre contactos activos. |
| [ ] | RN-14 | Auditoría | El sistema registra automáticamente quién creó cada contacto y quién realizó su última modificación. | Mantener trazabilidad de los cambios. |
| [x] | RN-15 | Auditoría | Los registros de auditoría no pueden modificarse ni eliminarse desde la aplicación. | Preservar el historial de acciones. |

## Consideraciones

- Las reglas deben validarse en el backend. Las validaciones del frontend no las reemplazan.
- Los requerimientos funcionales relacionados con estas reglas están en `requirements.md`.
- Las decisiones sobre autenticación, sesiones y protección de datos están en `security.md`.

## Búsqueda y listado

- La búsqueda admitirá coincidencias parciales (`LIKE`) por DNI, nombres y apellidos, sin distinguir mayúsculas/minúsculas y siendo compatible con tildes mediante la collation MySQL `utf8mb4_unicode_ci`.
- El listado será paginado mediante los parámetros `page` y `size`, ordenado por apellidos y luego nombres.
- Por defecto se listarán contactos activos. Se podrá solicitar el filtrado de contactos inactivos.

## Fotografías y baja lógica

- Al desactivar un contacto, este pasa a `INACTIVO` sin eliminar su registro ni su fotografía del disco.
- Al editar un contacto con una fotografía nueva, se reemplaza el archivo anterior y se elimina el archivo previo del disco.
- El archivo tendrá un nombre UUID generado por el sistema. El backend verificará el contenido real y aceptará JPG, JPEG, PNG o WEBP de máximo 2 MB.

## Registro de auditoría

- Cada evento de auditoría incluirá entidad afectada, ID de la entidad, acción, usuario que la ejecutó, detalle del cambio y timestamp.
- Se registrarán las acciones `LOGIN`, `CREAR`, `ACTUALIZAR`, `DESACTIVAR` y `REACTIVAR`, además de las acciones de usuario que correspondan.
- La retención será permanente en la base de datos. La aplicación no ofrecerá endpoints para editar ni eliminar registros de auditoría.
