# Guía de pruebas y actualizaciones – ADMOND / Rodipack CENTRAL

Objetivo: que cada vez que cambies algo **solo se actualice lo que cambiaste**, y que un bug
se detecte **antes** de que lo vean los usuarios.

## 1. Cómo probar (3 niveles, de menos a más esfuerzo)

| Nivel | Qué hace | Comando | Cuándo |
|---|---|---|---|
| Análisis estático (ESLint) | Encuentra variables no definidas, código inalcanzable, etc. sin abrir la app | `npm run lint` | Siempre antes de subir |
| Pruebas automáticas (Playwright) | Abre la app en un Chromium real con Supabase **simulado** (no toca producción) y verifica flujos clave | `npm test` | Siempre antes de subir |
| Prueba manual guiada | Checklist de abajo en el entorno de pruebas | — | Antes de publicar cambios grandes |

Primera vez en tu PC (una sola vez):

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

Uso diario: `npm.cmd run check` (= lint + todas las pruebas). Si algo falla, el reporte HTML queda en `playwright-report/`
(`npx.cmd playwright show-report`).

> En PowerShell usa `npm.cmd` / `npx.cmd` si ves el error "la ejecución de scripts está deshabilitada".

### Checklist manual (5 minutos, en el sitio de pruebas)
- [ ] Login con un usuario real (no el de respaldo) y cierre de sesión.
- [ ] Chat: enviar mensaje, recargar la página, que el mensaje siga ahí.
- [ ] Operaciones: crear expediente, editarlo, abrirlo desde otro navegador, eliminarlo (debe desaparecer en ambos).
- [ ] Consecutivo / Proveedores: editar una celda y verla en otro dispositivo.
- [ ] Correo interno: enviar y responder (aparece el aviso verde).

## 2. Flujo con GitHub (solo se actualiza lo que cambias)

```
rama de trabajo ──► Pull Request ──► CI automático (lint + pruebas) ──► merge a master ──► GitHub Pages publica
```

1. Crea una rama por cambio (no trabajes directo en `master`):
   `git checkout -b fix/nombre-corto`
2. Haz el cambio **pequeño** (un solo tema) y corre `npm.cmd run check`.
3. Ejecuta `npm.cmd run bump` → cambia el `?v=` de los archivos modificados en `index.html`
   para que los navegadores de los usuarios bajen la versión nueva (si no, siguen con la vieja en caché).
4. `git add -A && git commit -m "fix: ..." && git push -u origin fix/nombre-corto`
5. Abre el Pull Request en GitHub. El workflow **CI (pruebas)** (`.github/workflows/ci.yml`) corre solo.
   Si sale ✅ → *Merge*. Si sale ❌ → no fusionar, revisa el reporte.
6. En GitHub: *Settings → Branches → Add rule* sobre `master` → marca **Require status checks to pass**
   (`pruebas`) para que sea imposible publicar con pruebas rotas.
7. Si algo sale mal en producción: en GitHub abre el PR fusionado y pulsa **Revert** (vuelve atrás solo ese cambio).

### Qué se despliega y qué no
- **Frontend (HTML/JS/CSS)**: se publica con GitHub Pages al hacer merge a `master`. Solo cambian los archivos que tocaste.
- **Base de datos (Supabase)**: **no** se despliega con git. Los cambios van como archivos numerados en
  `supabase/migrations/` (001, 002, …) que se ejecutan **una vez** en el SQL Editor. Nunca edites una migración ya aplicada: crea la siguiente.
- Mantén separados los cambios de código y de base de datos en PR distintos cuando sea posible.

## 3. Entorno de pruebas para la base de datos (recomendado)

Probar migraciones directamente en producción es lo que más riesgo tiene. Opciones:

1. **Segundo proyecto Supabase gratuito** ("CENTRAL-test"): ejecuta `supabase_schema.sql` + migraciones allí, y apunta la app
   a él desde la consola del navegador: `saveSupabaseConfig('URL_TEST','ANON_KEY_TEST')` (ya está soportado por `supabase_config.js`).
2. **Supabase CLI + Docker** (`supabase start`) para una base local desechable.
3. **Respaldo antes de migrar**: Dashboard → Database → Backups (o exporta con `pg_dump`) antes de ejecutar un SQL.

## 4. Alternativas de herramientas

| Herramienta | Para qué | Costo |
|---|---|---|
| **Playwright** (ya configurado) | Pruebas de navegador automáticas, también graba pasos (`npx playwright codegen http://localhost:4173`) | Gratis |
| **GitHub Actions** (ya configurado) | Ejecutar pruebas en cada PR | Gratis en repos públicos / 2000 min en privados |
| **ESLint** (ya configurado) | Bugs estáticos | Gratis |
| **Sentry** (plan gratuito) | Ver los errores JavaScript que sufren los usuarios reales, con usuario/navegador (agregar 1 `<script>`) | Gratis |
| **Supabase Advisors** | Revisión mensual de seguridad/rendimiento (las capturas que enviaste) | Incluido |
| **Lighthouse** (Chrome DevTools) | Rendimiento y accesibilidad | Gratis |
| **Dependabot** | Avisa de librerías CDN/npm desactualizadas | Gratis |
| **Cypress / Selenium** | Alternativas a Playwright | Gratis |
| **BrowserStack / LambdaTest** | Probar en celulares/navegadores reales | De pago (prueba gratis) |
