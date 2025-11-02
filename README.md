Despliegue en Azure App Service (PaaS) – Oráculo de la Suerte

URL de producción: https://juego-cartas-gafxc8a2avfwbybj.westus3-01.azurewebsites.net/

Servicio: Azure App Service (Linux) · Stack: Node 20 LTS · Región: West US 3 · Plan: F1 (Free)

1) Creación del App Service (Portal Azure)

Crear recurso → Web App (App Services).

Datos básicos

Nombre: JUEGO-CARTAS

Publicar: Código

Sistema operativo: Linux

Pila de tiempo de ejecución: Node 20 LTS

Región: West US 3

Plan de App Service: crear uno nuevo (F1/Gratis para pruebas)

Revisar y crear → Crear.

2) Configuración obligatoria de la Web App

TLS/SSL → Solo HTTPS: Activado.

Configuración → Configuración general

Versión principal de Node: 20

Comando de inicio (SPA):

pm2 serve /home/site/wwwroot --no-daemon --spa


Guardar y Reiniciar si es necesario.

3) CI/CD con GitHub Actions (Deployment Center)

En la Web App: Centro de implementación → Configuración.

Origen: GitHub → seleccionar cuenta, repo y rama main.

Elegir “Agregar un flujo de trabajo” (Actions) y confirmar.

El workflow generado:

hace checkout del repo,

usa Node 20,

ejecuta npm ci && npm run build,

publica el contenido de dist/ en el App Service.

Verificar:

GitHub → Actions: último run Success.

Centro de implementación → Registros: última implementación Succeeded.

4) Validación en producción

Abrir la URL de producción y comprobar que el juego carga y responde.

5) Observabilidad
Application Insights

En la Web App → Application Insights → Habilitar (misma región).

(Opcional) Disponibilidad: crear Prueba estándar (GET) cada 5 min a la URL del sitio.

Métricas/Registros: consultar Server requests, Availability, etc.

Log stream (evidencia de tráfico)

Web App → Supervisión → Log stream.

Si no hay datos: Supervisión → Configuración de diagnóstico

Activar Registros del servidor web (HTTP) y Registros de aplicación (Filesystem) → Guardar.

Volver a Log stream, recargar el sitio (Ctrl+F5) y observar líneas GET … 200.

6) Escalabilidad (mostrar capacidad)

Web App → Plan de App Service → Escalar verticalmente (Scale up).

Solo como evidencia, mostrar que se puede subir de F1 a B1/P1v3 (sin cambiar realmente).

7) Checklist de verificación

 Web App Linux + Node 20 LTS creada y en ejecución

 HTTPS Only activado

 Startup command pm2 … --spa configurado

 Deployment Center conectado a GitHub (main)

 Actions con último run Success y Registros en Succeeded

 Sitio funcional en *.azurewebsites.net

 Application Insights habilitado (métricas / disponibilidad)

 Log stream con líneas GET … 200

 Scale up visible (capacidad de escalar)
