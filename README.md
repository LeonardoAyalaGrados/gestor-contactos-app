# NexoDir — Gestión de Contactos

Aplicación web monolítica para administrar contactos de clientes y proveedores. Está construida con Angular y TypeScript, una API REST en Java/Spring Boot y MySQL. Las decisiones funcionales y técnicas detalladas se mantienen en [`docs/`](docs/).

## Stack implementado

- Java 17 y Spring Boot 3.5.16, con Maven.
- Angular 22.1.7 y TypeScript 6.0.2.
- MySQL con `utf8mb4_unicode_ci`.
- JWT HS256 de 24 horas, BCrypt y autorización por roles `USER` y `ADMIN`.

## Requisitos previos

- Java 17.
- Maven 3.9 o superior.
- Node.js compatible con Angular CLI 22 y npm.
- MySQL 8, con permiso para crear la base `gestor_contactos` (o una base indicada en `DB_URL`).

## Configuración local

1. Crea una base de datos MySQL con `utf8mb4_unicode_ci` si el usuario de conexión no puede crearla automáticamente:

   ```sql
   CREATE DATABASE gestor_contactos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copia `.env.example` a `.env` en la raíz y completa las credenciales locales. `.env` está excluido de Git; no lo publiques ni lo incluyas en una entrega.
3. Usa una clave JWT aleatoria de al menos 32 bytes. La semilla crea el usuario ADMIN indicado por `ADMIN_INITIAL_USERNAME` y `ADMIN_INITIAL_PASSWORD` solo si aún no existe.
4. La carpeta de fotos se crea al iniciar el backend. Por defecto es `./uploads/contactos` y queda fuera del repositorio.

## Ejecución

### Backend

Desde `backend/`:

```bash
mvn spring-boot:run
```

La API queda en `http://localhost:8080/api/v1`. El backend carga el `.env` de la raíz al ejecutarse desde `backend/` o desde la raíz.

### Frontend

Desde `frontend/`:

```bash
npm ci
npm start
```

Abre `http://localhost:4200`. La URL base de la API se configura con `API_BASE_URL`; si no se define, el frontend usa `http://localhost:8080/api/v1`. En PowerShell, antes de iniciar Angular:

```powershell
$env:API_BASE_URL = 'http://localhost:8080/api/v1'
npm start
```

## Acceso y permisos

- Inicia sesión desde `/login` con la cuenta ADMIN definida en el `.env` local.
- No se incluye una contraseña compartida ni una cuenta USER de prueba. Crea cuentas USER desde la sección **Usuarios** como ADMIN, o mediante `POST /api/v1/usuarios`.
- Los JWT duran 24 horas. La API exige `Bearer <token>` para contactos y fotos; usuarios y auditoría están reservados a ADMIN.
- En desarrollo, el frontend corre en el puerto 4200 y la API permite CORS desde `http://localhost:4200`.

## Prueba manual con Postman

Importa [`postman/NexoDir.postman_collection.json`](postman/NexoDir.postman_collection.json). La colección guarda el JWT recibido al hacer Login en una variable local y agrupa autenticación, contactos, usuarios y auditoría. Define `baseUrl` si tu API no está en `http://localhost:8080/api/v1`; completa usuario y contraseña en el cuerpo del Login sin guardar secretos en la colección. Para crear contacto, selecciona una imagen local en el campo multipart `foto` y envía `contacto` como JSON.

La colección es una plantilla de inicio basada en las rutas actuales. Puedes importar también tu colección de Postman con tus consultas verificadas; antes de compartirla, elimina tokens, contraseñas y rutas locales privadas.

## Validaciones y pruebas

El repositorio contiene pruebas de integración del backend para contactos, usuarios y persistencia MySQL. Las dos pruebas de endpoints crean registros y archivos en la base configurada, por lo que deben ejecutarse únicamente contra una base de pruebas aislada (no contra la base local con datos de trabajo). La prueba de inicialización también requiere MySQL con la collation indicada. No se ejecutan automáticamente al iniciar la aplicación.

Para compilar el backend y construir el frontend:

```bash
cd backend
mvn -DskipTests package
cd ../frontend
npm ci
npm run build
```

La compilación del frontend genera archivos en `frontend/dist/`; no se incluyen en Git ni en el ZIP fuente. No hay actualmente pruebas unitarias del frontend.

## Arquitectura y reglas

El sistema es un monolito: Angular consume la API REST de Spring Boot, que persiste en MySQL. Las reglas de negocio se validan en backend; las validaciones del frontend sirven de apoyo para la experiencia de uso.

- [`docs/architecture.md`](docs/architecture.md): capas, tecnologías, API, base de datos y fotos.
- [`docs/requeriments.md`](docs/requeriments.md): requerimientos funcionales y permisos; conserva su nombre actual.
- [`docs/business-rules.md`](docs/business-rules.md): reglas de contactos, búsqueda y auditoría.
- [`docs/security.md`](docs/security.md): JWT, roles, protección de datos y secretos.
- [`AGENTS.md`](AGENTS.md): instrucciones de trabajo y tecnologías acordadas.

Las tablas de seguimiento en esos documentos reflejan el estado marcado por el proyecto; consúltalas como fuente para los identificadores y criterios detallados.

## Alcance implementado

- Inicio y cierre de sesión en la interfaz, persistencia local del token, guardas de rutas e interceptor HTTP.
- Contactos: listado paginado, búsqueda y filtro por estado, consulta, alta con fotografía, edición, baja lógica y reactivación.
- Usuarios: administración por ADMIN, búsqueda y filtros, alta, edición y desactivación.
- Auditoría paginada de solo lectura para ADMIN.
- Validaciones de negocio de DNI, teléfonos, correos, medios de contacto y fotografías en el backend, además de validaciones de formulario en Angular.
- Los endpoints se describen en [`docs/requeriments.md`](docs/requeriments.md) y pueden probarse con la colección Postman incluida.

## Seguridad y datos

- Nunca compartas `.env`, JWT, contraseñas o copias de la base con datos personales.
- `.env.example` solo contiene valores de ejemplo que deben reemplazarse localmente.
- Las fotos en `uploads/` son datos locales y se excluyen de Git y del paquete fuente. Para conservarlas, respáldalas junto con MySQL.
- Cerrar sesión limpia la sesión del navegador. Como la API es stateless, un token emitido sigue vigente hasta expirar, salvo que se desactive la cuenta o cambie su rol.

## Uso de IA y proceso de desarrollo

Codex se utilizó como asistente de implementación y revisión bajo las instrucciones de [`AGENTS.md`](AGENTS.md) y las decisiones de [`docs/`](docs/). La persona desarrolladora revisó los flujos con Postman y reportó errores de ejecución e interfaz; las correcciones incluyeron el registro duplicado de `PasswordEncoder`, la longitud mínima de `JWT_SECRET`, la separación visual del login y la habilitación del formulario de contacto cuando el DNI y los demás campos son válidos. Las especificaciones conservan las reglas y los criterios acordados. Las pruebas de integración existentes cubren flujos backend, con los requisitos de aislamiento de base de datos descritos arriba.

## Mejoras futuras

- Añadir pruebas unitarias y de componentes para el frontend.
- Preparar una configuración de pruebas aislada y repetible para MySQL, con limpieza de datos.
- Ampliar documentación operativa de despliegue, copias de seguridad y recuperación.
- Mantener la colección Postman alineada con cualquier cambio de contrato de API.
