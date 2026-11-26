# Seguridad

Marca cada casilla cuando el control esté implementado y verificado.

| Estado | ID | Área | Control de seguridad |
|---|---|---|---|
| [x] | SEG-01 | Autenticación | Solo usuarios registrados y autenticados pueden acceder a los módulos protegidos. |
| [x] | SEG-02 | Contraseñas | Las contraseñas se almacenan mediante un algoritmo de hash adecuado; nunca en texto plano. |
| [x] | SEG-03 | Sesiones | La sesión se mantiene según el requisito definido y se invalida al cerrar sesión o expirar. |
| [x] | SEG-04 | Autorización | El backend verifica los permisos de `USER` y `ADMIN` en cada operación protegida. |
| [x] | SEG-05 | Contactos | Solo usuarios autenticados pueden consultar o modificar los contactos de la empresa. |
| [x] | SEG-06 | Usuarios | Solo `ADMIN` puede crear, modificar o desactivar cuentas de usuario. |
| [ ] | SEG-07 | Auditoría | Solo `ADMIN` puede consultar el historial global; la aplicación no permite modificarlo ni eliminarlo. |
| [x] | SEG-08 | Fotografías | El backend valida el contenido y tamaño de cada archivo recibido; no confía únicamente en el nombre o la extensión. |
| [x] | SEG-09 | Fotografías | Los nombres de archivo los genera el sistema y no se aceptan rutas proporcionadas por el usuario. |
| [x] | SEG-10 | Fotografías | El acceso a las fotos se realiza mediante el backend y requiere autorización. |
| [x] | SEG-11 | Secretos | Las credenciales y claves se configuran fuera del código y no se suben al repositorio. |
| [x] | SEG-12 | Errores | Las respuestas al usuario no exponen contraseñas, claves, rutas internas ni detalles técnicos sensibles. |

## Manejo de datos

- El backend vuelve a validar los datos recibidos, aunque Angular también los valide.
- Las fotografías cargadas se excluyen del repositorio Git.
- La carpeta de fotografías y la base de datos deben incluirse en el plan de respaldo.

## Autenticación y sesión

- La API autenticará con JSON Web Tokens (JWT) enviados en el encabezado `Authorization: Bearer <token>`.
- El token incluirá el rol `USER` o `ADMIN` y expirará 24 horas después de su emisión. El backend verificará firma, expiración y permisos en cada operación protegida.
- El frontend guardará el token en `localStorage` para mantener la sesión al recargar o regresar a la aplicación. Lo eliminará al cerrar sesión y ante una respuesta HTTP `401` o al detectar su expiración.
- La clave de firma JWT se suministrará mediante `JWT_SECRET`, mediante configuración externa, con al menos 32 bytes para HS256; no se guardará en el repositorio.
- No habrá registro público ni recuperación de contraseña por correo en esta versión.

## Cuenta ADMIN inicial

- Al iniciar, una semilla idempotente implementada con `CommandLineRunner` o un script inicial asegurará la existencia de un usuario con rol `ADMIN`.
- La contraseña se tomará de configuración externa, se almacenará únicamente como hash BCrypt y no se incluirá en el código ni en los archivos versionados. La semilla no reemplazará ni reiniciará una cuenta existente.

## Fotografías y CORS

- La carpeta configurable de fotografías tendrá como ejemplo `./uploads/contactos`, fuera del código fuente; se creará al iniciar, quedará excluida de Git y deberá respaldarse junto con MySQL.
- El backend validará el contenido real de las imágenes y su tamaño máximo de 2 MB. Solo aceptará JPG, JPEG, PNG y WEBP, y generará nombres UUID sin aceptar rutas del cliente.
- La lectura de fotografías se hará por un endpoint autenticado y autorizado del backend, de acuerdo con `SEG-10`.
- En desarrollo, CORS permitirá el origen del frontend Angular en `http://localhost:4200`.

## Respuestas de error

Los errores tendrán los campos `timestamp`, `status`, `error`, `message`, `path` y `validationErrors`. No se enviarán stacktraces, secretos, claves ni rutas internas al cliente. Los errores de validación podrán incluir detalles por campo en `validationErrors`.

## Implementación actual

- `POST /api/v1/auth/login` autentica usuarios activos y devuelve JWT Bearer firmado con HS256, rol y expiración de 24 horas.
- Las rutas `/api/v1/contactos/**` y el endpoint de fotografías requieren JWT con rol `USER` o `ADMIN`. Las rutas `/api/v1/usuarios/**` requieren `ADMIN`.
- El backend vuelve a comprobar que la cuenta siga activa y que su rol no haya cambiado al validar cada JWT.
- El cierre de sesión del cliente elimina el token y los datos de sesión de `localStorage`; la API no mantiene una lista de revocación de tokens.
- La ruta `/api/v1/auditoria/**` está restringida a `ADMIN`, aunque todavía no existe endpoint de consulta de auditoría.
- En desarrollo local, la API continúa enlazada por defecto a `127.0.0.1`.
