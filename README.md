# tareas-uni

App web personal para gestionar tareas universitarias, ordenadas por fecha de entrega.

**Live:** https://ch-devx.github.io/tareas-uni/

## Stack

- HTML + CSS + JavaScript vanilla — sin frameworks
- API: Cloudflare Worker ([tareas-uni-api](https://github.com/ch-devx/tareas-uni-api))
- Base de datos: Neon PostgreSQL

## Funcionalidades

- Crear, editar y eliminar tareas con título, descripción, materia y deadline
- Ordenamiento automático por fecha de entrega
- Indicador visual de urgencia por colores (vencida, próxima, ok)
- Gestión de materias con color personalizado
- Vista de tareas completadas
- Diseño responsivo — optimizado para móvil

## Estructura

```
tareas-uni/
└── index.html    # App completa en un solo archivo
```

## Configuración

La URL del Worker está definida en la constante `API` dentro del `<script>` en `index.html`:

```javascript
const API = 'https://uni-tasks-worker.tareas-uni.workers.dev';
```

Si el Worker cambia de URL, actualiza esa línea y haz push.

## Deploy

GitHub Pages sirve el `index.html` directamente desde la rama `main`. Cualquier push a `main` se refleja automáticamente en la URL de producción.
