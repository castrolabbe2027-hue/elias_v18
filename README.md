# SMART STUDENT WEB — Plataforma Integral de Gestión Estudiantil (v14)

**Versión:** v14 — Evaluaciones Inteligentes Específicas por Tema y Optimización de Almacenamiento.

---

## ✨ Resumen rápido
- **Objetivo:** Generar evaluaciones educativas específicas por tema usando IA (Genkit + Gemini) y mejorar la robustez del almacenamiento local.
- **Stack:** Next.js 15 (React 18 + TypeScript), Tailwind CSS, Radix UI, Genkit + Google Generative AI (Gemini), Cloudinary, Tesseract.js.
- **Dev:** puerto 9002 (Turbopack).

---

## 🧠 Novedades principales (v14)
- **Evaluaciones por tema:** Prompts y flujos IA optimizados para producir preguntas específicas y pedagógicamente relevantes.
- **Base de conocimientos educativa:** Conteúdos por materia/tema para mejorar la calidad de las preguntas.
- **Manejo de QuotaExceededError:** Límites, limpieza preventiva y fallback para evitar pérdidas de datos por localStorage.
- **Validaciones y UX:** Verificación robusta de curso/asignatura/tema y feedback claro al usuario.

---

## ⚙️ Instalación rápida
```bash
git clone <repo>
cd <repo>
npm install
cp .env.example .env.local
# Añade tu API key de Google AI en .env.local
npm run dev
# http://localhost:9002
```

### Variables de entorno importantes
```bash
GOOGLE_API_KEY=tu_google_ai_api_key
NEXT_PUBLIC_API_URL=http://localhost:9002
CLOUDINARY_CLOUD_NAME=...
```

---

## 📁 Estructura clave (resumen)
- `src/ai/` → Flujos y configuración IA (Genkit)
- `src/app/dashboard/evaluacion/` → Módulo de generación de evaluaciones
- `src/api/extract-pdf-content/` → Extracción y parsing de PDF
- `src/lib/` → Utilidades y datos (e.g., books-data)

---

## 🛠 Comandos útiles
- `npm run dev` — Desarrollo (Turbopack)
- `npm run build` — Construir producción
- `npm run genkit:dev` — Genkit local (IA)
- `npm run lint` / `npm run typecheck`

---

## 🤝 Contribuir
1. Fork
2. `git checkout -b feature/mi-cambio`
3. Hacer commits claros
4. Crear PR

---

## ❗ Notas y troubleshooting
- Si ves **QuotaExceededError**, el sistema intenta reducir y recuperar datos automáticamente; para recuperación manual puedes limpiar claves específicas de `localStorage`.
- Verifica que `GOOGLE_API_KEY` esté presente para generar contenido IA real.

### Comandos y acciones útiles 🔧
- Iniciar Genkit (modo desarrollo):
```bash
npm run genkit:dev
```
- Ver logs de la app en desarrollo:
```bash
npm run dev
# Revisa la consola donde corre la app y la del servidor Genkit
```
- Limpiar claves problemáticas en consola del navegador:
```javascript
// Elimina solo evaluaciones locales
localStorage.removeItem('smart-student-evaluations');
// Elimina historiales de evaluaciones
Object.keys(localStorage)
  .filter(k => k.startsWith('evaluationHistory_'))
  .forEach(k => localStorage.removeItem(k));
```
- Recuperación manual ante QuotaExceededError (pasos):
  1. Exportar historial importante (si es posible) desde la UI de export/import.
  2. Ejecutar limpieza selectiva de claves antiguas.
  3. Reiniciar la app y volver a intentar la operación.

---

## 🧾 API y Endpoints (resumen) 🔌
A continuación un resumen de los endpoints más relevantes. Consulta `src/app/api` para definiciones completas.

### POST /api/extract-pdf-content
- Uso: Extraer texto y metadatos de un PDF (upload o URL).
- Body (form-data o JSON): `{ file: <archivo> }` o `{ url: "https://..." }`
- Respuesta (ejemplo):
```json
{
  "pages": 12,
  "topics": ["Sistema Respiratorio","Célula"],
  "text": "..."
}
```

Ejemplo cURL:
```bash
curl -X POST "http://localhost:9002/api/extract-pdf-content" -F "file=@material.pdf"
```

### POST /api/generate-evaluation
- Uso: Generar una evaluación específica por curso/asignatura/tema.
- Body (JSON): `{ "course":"4to Básico", "subject":"Ciencias Naturales", "topic":"Sistema Respiratorio", "numQuestions":10 }`
- Respuesta (ejemplo):
```json
{
  "id": "eval_123",
  "questions": [ { "type":"mcq", "question":"...", "options":[...] }, ... ]
}
```

Ejemplo fetch (Node/Browser):
```js
await fetch('/api/generate-evaluation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ course, subject, topic, numQuestions })
});
```

---

## ✍️ Ejemplos de uso y pantallazos 🖼️
- Flujo típico:
  1. Admin → Dashboard → Evaluación → Selecciona curso/asignatura/tema.
  2. Hacer click en "Generar evaluación" y revisar preguntas generadas.
  3. Exportar/guardar la evaluación si es correcta.

- Ejemplo práctico (curl):
```bash
curl -X POST 'http://localhost:9002/api/generate-evaluation' \
  -H 'Content-Type: application/json' \
  -d '{"course":"4to Básico","subject":"Ciencias Naturales","topic":"Fotosíntesis","numQuestions":5}'
```

- Pantallazos (placeholder):
  - `/public/screenshots/evaluacion.png` — pantalla de generación de evaluación
  - `/public/screenshots/kpis.png` — panel de KPIs

> Añade pantallazos reales en `public/screenshots/` con los nombres anteriores para que se muestren aquí.

---

## 📊 KPIs y métricas clave
| KPI | Objetivo | Estado |
|---|---:|:---:|
| Preguntas específicas por tema | 100% | ✅ Implementado |
| Errores QuotaExceededError | 0 | ✅ Auto-recover |
| Temas implementados | 50+ | ✅ |
| Cobertura tests unitarios | >=80% | ⚠️ En progreso |
| Latencia IA (p99) | < 500ms | ⚠️ Monitoring |

---

## 🔍 Consejos de debugging rápido
- Revisa que `GOOGLE_API_KEY` esté en `.env.local` y no en `.env` compartido.
- Para reproducir problemas con IA, habilita logs en Genkit y reproduce la petición problemática.
- Si los datos no aparecen en UI: inspecciona `localStorage` y las claves `smart-student-*`.

---

## 📄 Licencia
MIT — ver `LICENSE`.

---

¿Quieres que formatee este README con más secciones (Ej.: ejemplos de API, pantallazos, tabla de KPIs) o lo dejamos así por ahora? ❤️