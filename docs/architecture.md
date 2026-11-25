# Arquitectura del sistema

## 1. Objetivo

El sistema será una aplicación web para gestionar los contactos de una empresa.
Estará organizado como un monolito modular, sin microservicios, con un frontend
Angular, un backend Spring Boot y una base de datos MySQL.

## 2. Tecnologías

- **Frontend:** Angular y TypeScript.
- **Backend:** Java y Spring Boot.
- **Comunicación:** API REST.
- **Base de datos:** MySQL.

Las versiones concretas de estas tecnologías se definirán al iniciar el proyecto y
se registrarán en los archivos de configuración correspondientes.

## Flujo general

El usuario utiliza la interfaz desarrollada en Angular. Angular se comunica mediante
HTTP con la API REST de Spring Boot. El backend procesa las solicitudes y consulta o
guarda los datos en MySQL.

## Almacenamiento de fotografías

El backend almacenará las fotografías de contactos en una carpeta configurable,
separada del código fuente. Al iniciar, Spring Boot creará la carpeta si no existe.
La aplicación necesitará permisos para escribir en ella.

Cada fotografía tendrá un nombre generado por el sistema. MySQL guardará una
referencia relativa al archivo, no la imagen ni una ruta absoluta de una computadora.

Los archivos cargados no se incluirán en Git. En producción, la carpeta deberá ser
persistente y respaldarse junto con la base de datos.

## API y ejecución local

- La API REST usará el prefijo `/api/v1` y el backend escuchará en el puerto `8080`.
- El frontend Angular se ejecutará en el puerto `4200`. Spring Boot permitirá por CORS las solicitudes del origen local del frontend.
- Los errores de la API tendrán un formato uniforme con los campos `timestamp`, `status`, `error`, `message`, `path` y `validationErrors`; este último incluirá errores por campo cuando corresponda. Las respuestas no incluirán stacktraces, secretos ni rutas internas.

## Configuración de MySQL

- La conexión se configurará mediante variables de entorno y perfiles de Spring, usando `application.properties` y archivos `application-{profile}.properties` cuando corresponda.
- La base de datos y sus tablas utilizarán `utf8mb4` con collation `utf8mb4_unicode_ci`, incluida para que las búsquedas textuales sean insensibles a mayúsculas y compatibles con tildes.
- Las credenciales de base de datos y demás secretos se mantendrán fuera del repositorio.

## Fotografías de contactos

- La carpeta será configurable mediante una propiedad externa. La ruta local de ejemplo es `./uploads/contactos`; Spring Boot la creará al iniciar si no existe.
- El backend generará el nombre de cada archivo usando un UUID. Validará el contenido real de la imagen y aceptará únicamente JPG, JPEG, PNG o WEBP de hasta 2 MB.
- La fotografía se consultará mediante un endpoint del backend que exige autenticación y autorización.
- Al editar un contacto con una fotografía nueva, se reemplazará la referencia y se borrará del disco el archivo anterior. Al desactivar un contacto se conservarán su registro y su fotografía para permitir su reactivación.
- La carpeta de fotografías se excluirá de Git y se respaldará junto con MySQL.

