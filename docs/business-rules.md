# Reglas de negocio

Marca cada casilla cuando la regla esté implementada en el sistema y hayas verificado su cumplimiento.

| Estado | ID | Área | Regla de negocio | Justificación |
|---|---|---|---|---|
| [ ] | RN-01 | DNI | El DNI debe contener exactamente 8 dígitos numéricos. | Evitar documentos con formato inválido. |
| [ ] | RN-02 | DNI | No pueden existir dos contactos activos con el mismo DNI. | Evitar duplicados entre los contactos vigentes. |
| [ ] | RN-03 | DNI | Al editar un contacto, se permite conservar su DNI si no pertenece a otro contacto activo. | Permitir actualizar otros datos sin generar un falso duplicado. |
| [ ] | RN-04 | Nombres | Los nombres y apellidos son obligatorios. | Identificar correctamente al contacto. |
| [ ] | RN-05 | Teléfonos | Se aceptan números móviles peruanos de 9 dígitos que comiencen con 9. | Validar teléfonos según el alcance definido. |
| [ ] | RN-06 | Correos | Cada correo electrónico debe tener un formato válido. | Evitar guardar correos con formato incorrecto. |
| [ ] | RN-07 | Correos | No se puede repetir el mismo correo dentro de un contacto. | Evitar medios de contacto duplicados. |
| [ ] | RN-08 | Medios de contacto | Cada contacto debe tener al menos un teléfono o un correo electrónico. Puede tener ambos. | Asegurar que exista al menos un medio de comunicación. |
| [ ] | RN-09 | Fotografía | La fotografía es obligatoria al registrar un contacto. | Incluir la fotografía solicitada para cada contacto. |
| [ ] | RN-10 | Fotografía | Se aceptan archivos JPG, JPEG, PNG y WEBP de máximo 2 MB. | Limitar el tipo y tamaño de los archivos aceptados. |
| [ ] | RN-11 | Contactos | Un contacto puede tener varios teléfonos y varios correos electrónicos. | Permitir múltiples medios de comunicación. |
| [ ] | RN-12 | Eliminación | Al eliminar un contacto desde la aplicación, este pasa al estado `INACTIVO`; no se borra físicamente. | Evitar perder información de forma permanente. |
| [ ] | RN-13 | Reactivación | Un contacto inactivo solo puede reactivarse si ningún otro contacto activo usa su DNI. | Mantener la unicidad del DNI entre contactos activos. |
| [ ] | RN-14 | Auditoría | El sistema registra automáticamente quién creó cada contacto y quién realizó su última modificación. | Mantener trazabilidad de los cambios. |
| [ ] | RN-15 | Auditoría | Los registros de auditoría no pueden modificarse ni eliminarse desde la aplicación. | Preservar el historial de acciones. |

## Consideraciones

- Las reglas deben validarse en el backend. Las validaciones del frontend no las reemplazan.
- Los requerimientos funcionales relacionados con estas reglas están en `requirements.md`.
- Las decisiones sobre autenticación, sesiones y protección de datos están en `security.md`.