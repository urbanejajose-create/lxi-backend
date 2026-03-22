# 🎯 RESUMEN EJECUTIVO: Prueba en VIVO - Stripe + Printful + MongoDB

## 📁 Archivos creados para ti

He creado 4 archivos cruciales en tu carpeta `/backup_app_core`:

```
backup_app_core/
├── 📄 SETUP_CREDENCIALES_PASO_A_PASO.md    ← LEE ESTO PRIMERO
├── 📄 CHECKLIST_TESTING_VIVO.md             ← Luego esto
├── backend/
│   ├── .env.template                        ← Usa como referencia
│   ├── .env                                 ← Edita con tus credenciales ⭐
│   ├── verify_setup.py                      ← Ejecuta para verificar
│   ├── server_v2.py                         ← Ya tiene endpoints Printful
│   └── printful_integration.py               ← Ya existe
├── frontend/
│   └── src/pages/
│       ├── Checkout.js                      ← Ya está actualizado
│       └── Orders.js                        ← Ya muestra tracking
└── ECOMMERCE_ARCHITECTURE.md                ← Documentación técnica
```

---

## 🚀 PROCESO EN 5 PASOS (2-3 horas TOTAL)

### PASO 1: Obtener Credenciales (30 min)
**Archivo:** `SETUP_CREDENCIALES_PASO_A_PASO.md`

```
1. Abre https://dashboard.stripe.com/apikeys → Copia Secret Key
2. Abre https://app.printful.com/settings/api → Genera token
3. Abre https://www.mongodb.com/cloud/atlas → Crea BD (o usa local)
4. Llena tus 3 valores en backend/.env
```

### PASO 2: Verificar Setup (5 min)
**Comando:**
```bash
cd backend
python verify_setup.py
```

**Esperado:** ✅ TODAS LAS CREDENCIALES ESTÁN CONFIGURADAS

### PASO 3: Iniciar Servidores (5 min)
**Terminal 1:**
```bash
cd backend
python server_v2.py
# Verás: INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2:**
```bash
cd frontend
npm start
# Verás: You can now view lxi in the browser at http://localhost:3000
```

### PASO 4: Hacer Compra de Prueba (30 min)
**Archivo:** `CHECKLIST_TESTING_VIVO.md`

1. Registrate: http://localhost:3000/register
2. Login: http://localhost:3000/login
3. Compra: Shop → Producto → Checkout → Pagar con Stripe
4. Verifica: `/orders` muestra la compra

### PASO 5: Confirmar Integraciones (10 min)
- [ ] Stripe: Orden en https://dashboard.stripe.com/payments
- [ ] Printful: Orden en https://app.printful.com/orders
- [ ] MongoDB: Orden en BD con `printful_order_id`
- [ ] Frontend: `/orders` muestra tracking cuando Printful envíe

---

## 📊 VER ESTADO EN TIEMPO REAL

### 1️⃣ Backend Logs
En la terminal del backend verás:
```
INFO - Created checkout session: cs_test_xxxxx
INFO - Auto-sent to Printful: 123456
INFO - Webhook: Payment completed
```

### 2️⃣ Dashboard de Stripe
https://dashboard.stripe.com/payments
- Busca tu transacción reciente
- Verá monto, timestamp, detalles

### 3️⃣ Dashboard de Printful
https://app.printful.com/orders
- Verá orden con status "Received" o "Pending"
- Cuando empiece producción, verá "Processing"
- Cuando envíe el paquete, webhook actualiza BD con tracking

### 4️⃣ Base de Datos MongoDB
Si usas MongoDB Compass o similar:

```javascript
// Colección: payment_transactions
{
  "_id": "...",
  "session_id": "cs_test_...",
  "user_id": "user_123",
  "amount": 99.99,
  "payment_status": "paid",           // ✅ Stripe pagó
  "printful_status": "processing",    // 🖨️ Printful está produciendo
  "printful_order_id": "123456",      // 📦 ID en Printful
  "tracking_number": "1Z999...",      // 📍 Tracking (cuando envíe)
  "tracking_url": "https://...",      // 🔗 Link a FedEx/UPS
  "shipped_at": "2026-03-20T10:00:00Z"
}
```

---

## ✅ CHECKLIST RÁPIDO

Marca cada paso conforme avanzas:

- [ ] Tengo API Key de Stripe (empieza con `sk_test_`)
- [ ] Tengo API Key de Printful (empieza con `pfapikey_`)
- [ ] Tengo MongoDB URL (Atlas o localhost)
- [ ] Actualicé `.env` con mis 3 credenciales
- [ ] Ejecuté `verify_setup.py` → Mostró ✅
- [ ] Backend está corriendo en `localhost:8000`
- [ ] Frontend está corriendo en `localhost:3000`
- [ ] Registré usuario de prueba
- [ ] Hice compra con tarjeta de prueba Stripe
- [ ] Orden aparece en `/orders`
- [ ] Orden aparece en Printful dashboard
- [ ] Backend logs no tienen errores

---

## 🎮 DATOS DE PRUEBA STRIPE

Stripe proporciona tarjetas de prueba en Test Mode:

**Tarjeta de ÉXITO:**
```
Número:      4242 4242 4242 4242
Expiración:  12/25 (o cualquier fecha futura)
CVC:         123 (cualquier 3 dígitos)
```

**Tarjeta que FALLA:**
```
Número:      4000 0000 0000 0002
Expiración:  12/25
CVC:         123
```

---

## 🌐 PARA NAMECHEAP (DESPUÉS)

Una vez todo funcione localmente:

### 1. Cambiar a Producción

**En Stripe→ Dashboard → "Switch to Live"**
```env
STRIPE_API_KEY=sk_live_tu_api_key_aqui
```

**En Printful → Settings → API**
```env
PRINTFUL_API_KEY=pfapikey_production_key
PRINTFUL_ENV=live
```

### 2. Configurar Webhooks en Producción

**En Stripe:**
- Settings → Webhooks → Add endpoint
- URL: `https://tu-dominio-namecheap.com/api/webhook/stripe`
- Events: `charge.succeeded`, `charge.failed`

**En Printful:**
- Settings → Webhooks → Add webhook
- URL: `https://tu-dominio-namecheap.com/api/webhook/printful`
- Events: `order:created`, `shipment:updated`, etc.

### 3. Actualizar .env en Namecheap

```env
WEBHOOK_BASE_URL=https://tu-dominio-namecheap.com
CORS_ORIGINS="https://tu-dominio-namecheap.com"
ENVIRONMENT=production
DEBUG=False
```

---

## 🆘 PROBLEMAS COMUNES & SOLUCIONES

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: No module named 'dotenv'` | `pip install python-dotenv` |
| `ModuleNotFoundError: No module named 'httpx'` | `pip install httpx` |
| Stripe: "Invalid API Key" | Verifica key en `.env` sin comillas extras |
| Printful: "Authentication failed" | Verifica que token es correcto y no expiró |
| MongoDB: "Connection refused" | Si es local, ¿mongod está corriendo? |
| Frontend no conecta backend | Verificar `REACT_APP_BACKEND_URL` en frontend/.env |
| Webhook no recibe | ¿Firewall? ¿URL pública correcta? |

---

## 📞 PRÓXIMOS PASOS DESPUÉS DE TESTING

Una vez que **TODO FUNCIONE LOCALMENTE**:

1. **Email Confirmaciones:** Usar SendGrid/Gmail SMTP
2. **SMS Tracking:** Integrar Twilio (opcional)
3. **Admin Dashboard:** Ver estatus de órdenes en tiempo real
4. **Análytics:** Google Analytics para conversiones
5. **Integración CRON:** Para sincronizar productos automáticamente
6. **Testing E2E:** Cypress o Playwright

---

## 📚 DOCUMENTOS DE REFERENCIA

Todos están en `/backup_app_core`:

| Archivo | Qué es |
|---------|--------|
| `SETUP_CREDENCIALES_PASO_A_PASO.md` | Guía detallada obtener cada credencial |
| `CHECKLIST_TESTING_VIVO.md` | Paso a paso testing completo |
| `ECOMMERCE_ARCHITECTURE.md` | Documentación técnica y diagramas |
| `backend/.env.template` | Template con todas variables |
| `backend/verify_setup.py` | Script que verifica todo está OK |
| `backend/printful_integration.py` | Módulo Printful (lógica) |
| `backend/server_v2.py` | Backend con todos endpoints |

---

## 🎯 RESUMEN DE ARQUITECTURA

```
┌─────────────────────────────────────────────────────┐
│              USUARIO HACE COMPRA                    │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌──────────┐
    │Frontend│    │Backend │    │ Webhooks │
    │ React  │───▶│FastAPI │◀───│ (Async)  │
    └────────┘    └────────┘    └──────────┘
        │              │              │
        │              ▼              │
        │         ┌──────────┐        │
        ├────────▶│ Stripe   │        │
        │         │ Payment  │───────┐│
        │         └──────────┘       ││
        │              │ (webhook)   ││
        │              ▼             ▼▼
        │         ┌──────────┐    ┌──────────┐
        │         │ MongoDB  │    │ Printful │
        │         │  BD      │◀───│ Production
        │         └──────────┘    │ & Shipping
        │              │          └──────────┘
        │              │ (webhook)
        │              ▼
        │         ┌──────────┐
        ├────────▶│Tracking  │
        │         │ Update   │
        │         └──────────┘
        │              │
        ▼              ▼
    ┌──────────────────────────┐
    │ Usuario ve Tracking Info │
    │ (FedEx/UPS link)         │
    └──────────────────────────┘
```

---

## 🚀 AHORA, COMIENZA AQUÍ:

1. **Lee:** `SETUP_CREDENCIALES_PASO_A_PASO.md`
2. **Obtén:** Tus 3 credenciales (Stripe, Printful, MongoDB)
3. **Actualiza:** Tu `.env` en `backend/`
4. **Verifica:** `python backend/verify_setup.py`
5. **Abre Terminal 1:** `cd backend && python server_v2.py`
6. **Abre Terminal 2:** `cd frontend && npm start`
7. **Sigue:** `CHECKLIST_TESTING_VIVO.md` para testing

---

**¿Preguntas? Avísame cuando estés en cada fase y te ayudaré 🚀**

*Última actualización: 2026-03-19 | Arquitectura: React + FastAPI + MongoDB + Stripe + Printful*
