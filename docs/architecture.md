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