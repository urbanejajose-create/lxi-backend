# 🗺️ MAPA VISUAL: ¿Qué Necesito Hacer Ahora?

## 📍 TÚ ESTÁS AQUÍ

```
Tu Proyecto LXI
├── ✅ Backend LISTO (32 endpoints)
├── ✅ Frontend LISTO (14 páginas)
├── ✅ Printful Integración LISTA (en código)
├── ✅ Stripe Integración LISTA (en código)
├── ❌ .env SIN TENER CREDENCIALES REALES
└── ❌ NO HEMOS PROBADO EN VIVO
```

---

## 🎯 LOS 3 DATOS QUE NECESITAS NOW

### 1️⃣ STRIPE API KEY

```
┌─────────────────────────────────────────────────────┐
│ 1. Abre: https://dashboard.stripe.com/apikeys      │
│ 2. Tab: "API keys"                                 │
│ 3. Busca: "Secret key"                             │
│ 4. Copiar: sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh... │
│                                                      │
│ Pegalo en backend/.env:                            │
│ STRIPE_API_KEY=sk_test_51Hy5s2Bl0b3gH4bZ9Y2...    │
└─────────────────────────────────────────────────────┘
```

### 2️⃣ PRINTFUL API KEY

```
┌─────────────────────────────────────────────────────┐
│ 1. Abre: https://app.printful.com/settings/api     │
│ 2. Botón: "Generate new token"                    │
│ 3. COPIA (aparece una sola vez!)                   │
│ 4. Pegalo: pfapikey_1234567890abcdefghijklmn...   │
│                                                      │
│ Pegalo en backend/.env:                            │
│ PRINTFUL_API_KEY=pfapikey_1234567890abcdef...     │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ MONGODB URL

```
┌─────────────────────────────────────────────────────┐
│ OPCIÓN A: Usa ATLAS (nube - Recomendado)          │
│ 1. Abre: https://www.mongodb.com/cloud/atlas      │
│ 2. Crea Cluster FREE                               │
│ 3. Connection String: mongodb+srv://user:pass...  │
│ MONGO_URL=mongodb+srv://lxi_user:Pass123@...      │
│                                                      │
│ OPCIÓN B: Usa LOCAL (rápido para testing)         │
│ MONGO_URL=mongodb://localhost:27017               │
└─────────────────────────────────────────────────────┘
```

---

## 📄 ARCHIVO .env (Edita esto)

**Ubicación:**
```
c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env
```

**Contenido MÍNIMO que necesitas:**

```env
# BASE DE DATOS
MONGO_URL="mongodb://localhost:27017"
DB_NAME="lxi_db"

# STRIPE
STRIPE_API_KEY=sk_test_TU_KEY_AQUI

# PRINTFUL
PRINTFUL_API_KEY=pfapikey_TU_KEY_AQUI
PRINTFUL_ENV=test

# OTROS (no cambiar para testing local)
SECRET_KEY=lxi-secret-key-12345
CORS_ORIGINS="*"
ENVIRONMENT=development
DEBUG=True
```

---

## ✅ PASO A PASO AHORA

### PASO 1: Obtén tus 3 keys (15 minutos)

```
[ ] 1. Abre Stripe → Copia Secret Key
[ ] 2. Abre Printful → Genera Token  
[ ] 3. Abre MongoDB Atlas → Crea Connection String
```

### PASO 2: Edita backend/.env (5 minutos)

```
[ ] Abre: c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env
[ ] Reemplaza STRIPE_API_KEY = tu key
[ ] Reemplaza PRINTFUL_API_KEY = tu key
[ ] Reemplaza MONGO_URL = tu URL
[ ] Guarda (Ctrl+S)
```

### PASO 3: Verifica Setup (5 minutos)

```bash
cd backend
python verify_setup.py
```

**Debe mostrar:**
```
✅ TODAS LAS CREDENCIALES ESTÁN CONFIGURADAS CORRECTAMENTE
```

### PASO 4: Inicia Backend (5 minutos)

```bash
cd backend
python server_v2.py
```

**Debe mostrar:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### PASO 5: Inicia Frontend (5 minutos)

```bash
cd frontend
npm start
```

**Debe mostrar:**
```
Compiled successfully!
You can now view lxi in the browser at http://localhost:3000
```

### PASO 6: Prueba Compra (30 minutos)

```
[ ] Ve a http://localhost:3000/register
[ ] Crea usuario: test@example.com / Test12345!
[ ] Login
[ ] Ve a /shop → Selecciona producto
[ ] Carrito → Checkout
[ ] Rellena dirección envío
[ ] Paga con tarjeta: 4242 4242 4242 4242
[ ] Verifica que llega a Stripe y Printful
```

---

## 📊 VERIFICAR QUE TODO FUNCIONA

### En Navegador
```
✅ http://localhost:3000      → Frontend cargó
✅ http://localhost:3000/shop → Puedes ver productos
✅ Puedes hacer login
✅ Puedes añadir al carrito
✅ Checkout funciona
✅ Stripe pago exitoso
```

### En Backend (Logs)
```
✅ INFO - Created checkout session: cs_test_...
✅ INFO - Auto-sent to Printful: 123456
✅ INFO - Webhook: Payment completed
```

### En Dashboards
```
✅ Stripe: https://dashboard.stripe.com/payments
   Deberías ver tu transacción

✅ Printful: https://app.printful.com/orders
   Deberías ver nueva orden

✅ Frontend: http://localhost:3000/orders
   Deberías ver orden + tracking si Printful envía
```

---

## 🚨 SI ALGO NO FUNCIONA

### Stripe dice "Invalid API Key"
```
❌ STRIPE_API_KEY no tiene comillas extras?
❌ Empieza con sk_test_?
❌ Está en backend/.env (no en frontend)?
```

### Printful dice "Authentication failed"
```
❌ PRINTFUL_API_KEY es correcto?
❌ Empieza con pfapikey_?
❌ No tiene espacios extras?
```

### MongoDB "Connection refused"
```
❌ ¿Usas localhost? ¿Está corriendo mongod?
❌ ¿Usas Atlas? ¿IP whitelist configurada?
```

### Backend no inicia
```bash
# Verifica que estás en carpeta correcta
cd c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend

# Verifica que .env existe
dir .env

# Verifica que Python está OK
python --version

# Reinstala requirements
pip install -r requirements.txt
```

---

## 📚 DOCUMENTOS QUE TIENES

| Archivo | Para Qué |
|---------|----------|
| `README_INICIO_RAPIDO.md` | COMIENZA AQUÍ (resumen ejecutivo) |
| `SETUP_CREDENCIALES_PASO_A_PASO.md` | Cómo obtener cada credencial detalladamente |
| `CHECKLIST_TESTING_VIVO.md` | Testing paso a paso (compra completa) |
| `backend/verify_setup.py` | Script que verifica que todo está OK |
| `backend/.env.template` | Template con todos los valores posibles |
| `ECOMMERCE_ARCHITECTURE.md` | Documentación técnica |

---

## 🎯 RESUMEN ULTIMo

```
AHORA MISMO:
1. Obtén 3 keys (Stripe, Printful, MongoDB)
2. Edita backend/.env
3. Ejecuta verify_setup.py
4. Inicia backend + frontend
5. Haz compra de prueba

RESULTADO:
✅ Compra exitosa en Stripe
✅ Orden aparece en Printful automáticamente
✅ Tracking disponible cuando Printful envíe
✅ Todo sin fricción, 100% automatizado
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Debo usar MongoDB Atlas o localhost?**
R: Atlas para Namecheap. Localhost solo para testing local.

**P: ¿Qué pasa con Stripe después?**
R: Cuando vayas a producción, cambias `sk_test_` a `sk_live_`

**P: ¿Y Printful?**
R: Lo mismo: `test` a `live`. Solo cambia env + API key.

**P: ¿Necesito configurar WebHooks manualmente?**
R: No ahora. Después cuando tengas dominio en Namecheap.

**P: ¿Funciona con compartido hosting?**
R: Con MongoDB Atlas SÍ. Si usas MongoDB local, necesitas VPS.

---

## 🚀 SIGUIENTE LÍNEA

Una vez todo funcione localmente:

```
1. Cambiar credenciales a PRODUCTION
2. Deploy a Namecheap
3. Configurar webhooks con dominio real
4. ¡LANZAR! 🎉
```

---

**¿LISTO? Comienza con PASO 1 ahora mismo! ⏱️**

Avísame cuando termines cada paso y te ayudaré. 💪
