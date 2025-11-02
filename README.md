Oráculo de la Suerte – Despliegue en Azure App Service (PaaS)

Autor: Elias Poma
Producción: https://juego-cartas-gafxc8a2avfwbybj.westus3-01.azurewebsites.net/

Repositorio: este repo
Tecnologías: Vite (SPA) + JavaScript/React, Node.js 20 LTS, Azure App Service (Linux)

Juego web tipo “oráculo” donde el usuario baraja y revela cartas siguiendo reglas predefinidas. El objetivo académico es demostrar PaaS + CI/CD con Azure App Service y GitHub Actions, más observabilidad con Application Insights.

1) Requisitos

Node.js 18+ (usamos 20 LTS en Azure)
npm

Cuenta de GitHub y Azure (con permisos para crear App Service)


2) Entorno en Azure (PaaS)

Servicio: Azure App Service (Linux)

Sistema operativo: Linux

Stack: Node 20 LTS

Región: West US 3

Plan: F1 (Free) – escalable a B1 / P1v3

HTTPS Only: Activado

Application Insights: Habilitado

Comando de inicio (SPA)

Para servir el dist/ como Single Page App:

pm2 serve /home/site/wwwroot --no-daemon --spa


Ubicación en el portal: App Service → Configuración → Configuración general → Comando de inicio.

3) CI/CD con GitHub Actions (automático en cada push a main)

Este repo está conectado a Deployment Center del App Service.
El workflow realiza:

checkout del repo

setup-node (20.x)

npm ci + npm run build

Publica el artefacto dist/ al App Service

Ejemplo de pasos clave del workflow:

- uses: actions/checkout@v4

- name: Use Node 20
  uses: actions/setup-node@v3
  with:
    node-version: '20.x'

- name: Install & build
  run: |
    npm ci
    npm run build

# …login OIDC a Azure y deploy del contenido de ./dist al App Service…
# with:
#   app-name: 'JUEGO-CARTAS'
#   package: 'dist'


Dónde verlo:

GitHub → Actions → último run Success

App Service → Centro de implementación → Configuración y Registros

4) Observabilidad y logs
Application Insights

Métricas: App Service → Application Insights → Métrica (ej. Server requests)

Disponibilidad: Availability test cada 5 min

Consultas (Logs/Kusto):

requests, availabilityResults, pageViews, exceptions, etc.

También exportado a Log Analytics Workspace si está habilitado.

Ejemplos de consultas:

requests | where timestamp > ago(30m) | take 50
availabilityResults | where timestamp > ago(30m) | take 20

Log stream (en vivo)

App Service → Supervisión → Log stream

Abre el sitio y Ctrl+F5 para ver líneas GET … 200

5) Escalabilidad

App Service → Plan de App Service → Escalar verticalmente (Scale up)

Se puede subir de F1 a B1/P1v3 para más CPU/RAM y características.

6) Pasos de despliegue (resumen)

Crear App Service (Linux, Node 20 LTS) en la región deseada.

Deployment Center → conectar GitHub (repo y rama main).

Configurar:

HTTPS Only: Activado

Comando de inicio SPA: pm2 serve /home/site/wwwroot --no-daemon --spa

Application Insights: Habilitar y (opcional) configurar Availability.

Hacer push a main → Actions compila y publica automáticamente.

Validar visitando https://<app>.azurewebsites.net.

7) Solución de problemas

Página “esperando contenido”:
Asegúrate de que el workflow publique dist/ y que el comando de inicio sea el de arriba.

404 en rutas del SPA:
Confirma --spa en el startup command.

Log stream vacío:
Activa en Supervisión → Configuración de diagnóstico:
“Registros del servidor web (HTTP)” y “Registros de aplicación (Filesystem)”.
