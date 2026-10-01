# AUDITORÍA — Deuda técnica y seguridad activa

> Bitácora del QA Auditor. Los hallazgos pendientes viven aquí (deuda activa); al resolverse, se trasladan a `## ✅ Resuelto`.

## 🔴 Pendiente

- [ ] **[Harness / Protocolo] Ausencia de `## Límites` en PROJECT.md:** `.agents/PROJECT.md` no define la sección canónica de límites (§0.5). Propuesta: sembrar un bloque con las restricciones operativas clave (despliegue manual a Firebase, no push remoto a GitHub, verificación obligatoria con `verify.sh`, protección de paleta Grimdark).
- [ ] **[Harness / Limpieza] Objetivos completados o huérfanos en `tracking/goals/`:** Existen 3 archivos de objetivos sin lock activo en PENDING (`GOAL_migracion_fase_4.md`, `GOAL_migracion_fase_5.md`, `GOAL_purge_legacy_dependencies.md`) con criterios ya cerrados o absorbidos. Deben archivarse en `tracking/plans/`.
- [ ] **[Arquitectura / Duplicación] Coexistencia de motores duales TS/JS:** La lógica de `app/lib/battlekit_legality_engine.ts` y `public/js/22_battlekit_legality_engine.js` (y `cost_calculation.ts` / `09_warband_core.js`) se mantiene duplicada entre la app Next.js y el runner de tests clásico `verify.sh`.
- [ ] **[Calidad / Tipado] `@ts-nocheck` transversal en librerías y datos:** 13 archivos en `app/data/*.ts` y `app/lib/*.ts` desactivan la verificación de TypeScript. Se debe planificar la tipificación estricta progresiva para evitar regresiones silenciosas en esquemas de datos.
- [ ] **[Seguridad / Resiliencia] Control de cuota en `localStorage` y fallbacks:** Proteger las operaciones de guardado de bandas frente a `QuotaExceededError` y asegurar mensajes amigables al usuario si la sincronización con Firestore falla por pérdida de conectividad.

---

## ✅ Resuelto

- [x] **[Canon / Legalidad] Bloqueo de Shotel y Anfarro a ELITE en Abyssinia:** Resuelto tratando la estipulación canónica *Chewa & ELITE only* como unión lógica en `battlekit_legality_engine.ts` y `.js`, permitiendo a cualquier ELITE equiparlos sin Chewa y a Troops con la mejora Chewa.
- [x] **[Calidad / Tests] Falta de test unitario formal para `isStrongOverride`:** Creada la suite dedicada `tests/test_strong_shield_combo.js` validando formalmente los criterios canónicos de *Escudo + STRONG + arma 2H Melee sin CUMBERSOME* (11 ✓).

