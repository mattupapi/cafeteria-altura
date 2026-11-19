# Café Altura

Proyecto académico full stack para una cafetería ficticia de Cochabamba. La demostración sigue el flujo obligatorio **MySQL → Express → Angular**: todo el contenido visible predefinido, incluidos textos, precios, multimedia, validaciones y accesibilidad, se obtiene desde MySQL mediante la API.

## Estructura

- `frontend/`: Angular 22, componentes standalone, `HttpClient` y formularios reactivos.
- `backend/`: Express 5, `mysql2/promise`, pool de conexiones e integración con Ollama.
- `database/cafeteria_altura.sql`: esquema MySQL `utf8mb4` y datos iniciales reimportables.

El video 720p y su poster están incluidos en `backend/public/media`. El crédito y la URL original de Pexels se almacenan en MySQL. Las demás fotografías se sirven desde URLs de Unsplash registradas junto con su texto alternativo y crédito.

## Requisitos en Windows

- Node.js 24 (el proyecto fue preparado con Node 24.20.0 y npm 11.19.0).
- MySQL 8 y MySQL Workbench.
- Ollama iniciado y el modelo `gemma3` disponible.

Puertos usados por la entrega: Angular `4201`, Express `3001`, MySQL `3306` y Ollama `11434`.

## 1. Importar MySQL con Workbench

1. Abre MySQL Workbench y entra a tu conexión local.
2. Ve a **File → Open SQL Script** y selecciona `database/cafeteria_altura.sql`.
3. Ejecuta todo el script con el icono del rayo.
4. Actualiza **Schemas** y comprueba que aparece `cafeteria_altura`.

El script usa `CREATE TABLE IF NOT EXISTS` y `ON DUPLICATE KEY UPDATE`. Reimportarlo actualiza el contenido inicial, pero **no borra ni reemplaza** los registros de `contact_messages`.

## 2. Configurar el backend

En una terminal PowerShell desde la raíz:

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
cd backend
npm.cmd install
npm.cmd start
```

Ajusta al menos `DB_USER` y `DB_PASSWORD`. La API queda en `http://127.0.0.1:3001`.

Variables disponibles:

```text
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=cafeteria_altura
DB_CONNECTION_LIMIT=10
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3
OLLAMA_TIMEOUT_MS=45000
```

## 3. Comprobar Ollama

En otra terminal:

```powershell
ollama list
ollama serve
```

Si `ollama serve` indica que el puerto ya está ocupado, Ollama ya está activo. Si `gemma3` no aparece en la lista, ejecuta `ollama pull gemma3`. El sitio y el formulario siguen funcionando aunque Ollama falle; solo el chat muestra el mensaje de error almacenado en MySQL.

## 4. Levantar Angular

En una segunda terminal desde la raíz:

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

Abre `http://localhost:4201`. El proxy de desarrollo dirige `/api` y `/media` hacia Express en el puerto `3001`.

## Endpoints

```text
GET  /api/health
GET  /api/site
POST /api/contact   { "name": "Ada", "email": "ada@example.com", "message": "Mensaje de prueba" }
POST /api/chat      { "message": "¿Cuánto cuesta el latte de tumbo?", "history": [] }
```

## Demostrar que MySQL controla Angular

Con backend y frontend activos, ejecuta en Workbench:

```sql
USE cafeteria_altura;
UPDATE cafeteria_altura.menu_items
SET price = 31.50
WHERE name = 'Cold brew cítrico';
```

Recarga la web: el precio cambia tanto en **Especialidades** como en **Precios** sin editar Angular. Restaura el dato al terminar:

```sql
UPDATE cafeteria_altura.menu_items
SET price = 25.00
WHERE name = 'Cold brew cítrico';
```

La misma demostración funciona con `sections.title` o `media_assets.url`.

## Verificaciones locales

```powershell
cd backend
npm.cmd run check

cd ..\frontend
npm.cmd run build
```

Para comprobar manualmente la API:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health
Invoke-RestMethod http://127.0.0.1:3001/api/site
Invoke-RestMethod -Method Post http://127.0.0.1:3001/api/contact -ContentType 'application/json' -Body '{"name":"Ada","email":"ada@example.com","message":"Mensaje académico de prueba"}'
Invoke-RestMethod -Method Post http://127.0.0.1:3001/api/chat -ContentType 'application/json' -Body '{"message":"¿Cuánto cuesta el latte de tumbo?","history":[]}'
```

## Origen de la integración del chat

Se revisaron en modo de solo lectura `src/app/core/services/chatbot.service.ts`, `server/server.mjs` y `server/ollama-chat.mjs` del proyecto local **Batalla del Chaco**. De allí se adaptaron el flujo Angular → API, el historial corto, `AbortController`, `stream: false` y el contrato `{ reply }`. En Café Altura se reemplazó el archivo JSON de contexto por consultas a MySQL y los mensajes visibles de error por textos almacenados en la base.

## ZIP o repositorio

Las carpetas `node_modules`, `dist`, cachés, `.env` y archivos ZIP están excluidos por `.gitignore`. Para entregar, comprime la raíz conservando `frontend/`, `backend/`, `database/`, `README.md` y `.gitignore`. No se requiere Docker, login, pagos, carrito ni panel administrativo.

