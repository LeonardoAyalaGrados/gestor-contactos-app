# Seguridad

Marca cada casilla cuando el control esté implementado y verificado.

| Estado | ID | Área | Control de seguridad |
|---|---|---|---|
| [ ] | SEG-01 | Autenticación | Solo usuarios registrados y autenticados pueden acceder a los módulos protegidos. |
| [ ] | SEG-02 | Contraseñas | Las contraseñas se almacenan mediante un algoritmo de hash adecuado; nunca en texto plano. |
| [ ] | SEG-03 | Sesiones | La sesión se mantiene según el requisito definido y se invalida al cerrar sesión o expirar. |
| [ ] | SEG-04 | Autorización | El backend verifica los permisos de `USER` y `ADMIN` en cada operación protegida. |
| [ ] | SEG-05 | Contactos | Solo usuarios autenticados pueden consultar o modificar los contactos de la empresa. |
| [ ] | SEG-06 | Usuarios | Solo `ADMIN` puede crear, modificar o desactivar cuentas de usuario. |
| [ ] | SEG-07 | Auditoría | Solo `ADMIN` puede consultar el historial global; la aplicación no permite modificarlo ni eliminarlo. |
| [ ] | SEG-08 | Fotografías | El backend valida el contenido y tamaño de cada archivo recibido; no confía únicamente en el nombre o la extensión. |
| [ ] | SEG-09 | Fotografías | Los nombres de archivo los genera el sistema y no se aceptan rutas proporcionadas por el usuario. |
| [ ] | SEG-10 | Fotografías | El acceso a las fotos se realiza mediante el backend y requiere autorización. |
| [ ] | SEG-11 | Secretos | Las credenciales y claves se configuran fuera del código y no se suben al repositorio. |
| [ ] | SEG-12 | Errores | Las respuestas al usuario no exponen contraseñas, claves, rutas internas ni detalles técnicos sensibles. |

## Manejo de datos

- El backend vuelve a validar los datos recibidos, aunque Angular también los valide.
- Las fotografías cargadas se excluyen del repositorio Git.
- La carpeta de fotografías y la base de datos deben incluirse en el plan de respaldo.