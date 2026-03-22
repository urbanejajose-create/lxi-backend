# ✅ CHECKLIST: Conectar Stripe + Printful + MongoDB en VIVO

## 🎯 Objetivo
Probar la integración COMPLETA: Usuario → Compra → Stripe → Printful → Tracking

---

## 📋 FASE 1: OBTENER CREDENCIALES (30 minutos)

### ☑️ Stripe API Key
- [ ] Acceder a https://dashboard.stripe.com/apikeys
- [ ] Copiar **Secret Key** (que empieza con `sk_test_`)
- [ ] Guardar en `.env` → `STRIPE_API_KEY=sk_test_xxxxx`

**Verificación:**
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('STRIPE_API_KEY'))"
# Debe mostrar: sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh...
```

### ☑️ Printful API Key
- [ ] Acceder a https://app.printful.com/settings/api
- [ ] Click "Generate new token"
- [ ] Copiar token (aparece una sola vez)
- [ ] Guardar en `.env` → `PRINTFUL_API_KEY=pfapikey_xxxxx`

**Verificación:**
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('PRINTFUL_API_KEY'))"
# Debe mostrar: pfapikey_1234567890abcdefghijklmn...
```

### ☑️ MongoDB URL
**Opción A: MongoDB Atlas (Recomendado)**
- [ ] Ir a https://www.mongodb.com/cloud/atlas
- [ ] Crear Cluster FREE
- [ ] Crear usuario en "Database Access"
- [ ] Obtener Connection String
- [ ] Guardar en `.env` → `MONGO_URL=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/lxi_db...`

**Opción B: Local**
- [ ] MongoDB corriendo en `localhost:27017`
- [ ] Guardar en `.env` → `MONGO_URL=mongodb://localhost:27017`

**Verificación:**
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('MONGO_URL')[:50])"
```

### ☑️ Otras configuraciones en `.env`
```env
DB_NAME=lxi_db
PRINTFUL_ENV=test
ENVIRONMENT=development
DEBUG=True
CORS_ORIGINS="*"
SECRET_KEY=lxi-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
WEBHOOK_BASE_URL=http://localhost:8000
```

**Verifica todo de una vez:**
```bash
cd backend
python verify_setup.py
```

Deberías ver: ✅ TODAS LAS CREDENCIALES ESTÁN CONFIGURADAS CORRECTAMENTE

---

## 🚀 FASE 2: INICIAR SERVIDORES (10 minutos)

### ☑️ Terminal 1: Backend

```bash
cd c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend
python server_v2.py
```

**Deberías ver:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### ☑️ Terminal 2: Frontend

```bash
cd c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend
npm start
```

**Deberías ver:**
```
Compiled successfully!
You can now view lxi in the browser at http://localhost:3000
```

### ☑️ Verifica que ambos están corriendo

```bash
# Terminal 3
curl http://localhost:8000/api/health
# Debe retornar: {"status":"healthy","brand":"LXI","edition":"Founders MMXXVI"}
```

---

## 🧪 FASE 3: TEST DE INTEGRACIÓN (30 minutos)

### Paso 1: Crear Usuario
1. Ve a http://localhost:3000/register
2. Llena formulario:
   - Email: `test@example.com`
   - Password: `Test12345!` (mayús + número)
   - First Name: `John`
   - Last Name: `Doe`
3. Click "Create Account"

**Esperado:** Redirige a `/login` → Luego a home

### Paso 2: Login
1. Ve a http://localhost:3000/login
2. Email: `test@example.com` / Password: `Test12345!`
3. Click "Login"

**Esperado:** Acceso exitoso, ves Home

### Paso 3: Añadir Producto al Carrito
1. Navega a http://localhost:3000/shop
2. Busca un producto
3. Click en un producto cualquiera
4. Click "Add to Cart"

**Esperado:** Toast "Added to cart"

### Paso 4: Ir a Checkout
1. Haz click en CartDrawer (abajo)
2. Click "Checkout"

**Esperado:** Redirige a `/checkout`

### Paso 5: Completar Información de Envío
Rellena:
```
First Name: John
Last Name: Doe
Email: test@example.com
Phone: +1234567890
Address: 123 Main St
City: New York
Zip Code: 10001
Country: United States
```

Click "Pay $XX.XX"

### Paso 6: Pagar con Stripe (TEST)
1. Redirige a Stripe Checkout
2. En la página de Stripe, clic en "PayPal" o tarjeta
3. **Datos de prueba (TEST):**

**Para VISA de prueba:**
- Número: `4242 4242 4242 4242`
- Expiración: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier 3 dígitos (ej: 123)

**O haz click en "LINk Payments" si quieres alternativa**

4. Click "Pay"

**Esperado:** Pago completado, redirige a `/checkout/success`

### Paso 7: Verifica que TODO funcionó

#### En Frontend
- [ ] CheckoutSuccess muestra orden confirmada
- [ ] URL tiene `session_id=cs_test_xxxxx`

#### En Backend - Logs
```
INFO - Created checkout session: cs_test_xxxxx
INFO - Auto-sent to Printful: 123456
INFO - Webhook: Payment completed
```

#### En Base de Datos (MongoDB)
Si tienes acceso a MongoDB:
```javascript
// Verifica orden fue creada
db.payment_transactions.findOne()
// Debe tener:
// {
//   "session_id": "cs_test_...",
//   "payment_status": "paid",
//   "printful_order_id": "123456",
//   "printful_status": "processing"
// }
```

#### En Dashboard de Stripe
1. Ve a https://dashboard.stripe.com/payments
2. Filtra recientes
3. Deberías ver tu transacción de $XX.XX
4. Haz click → Verifica detalles

#### En Dashboard de Printful
1. Ve a https://app.printful.com/orders
2. Deberías ver nueva orden
3. Status: "Pending" o "Received"

---

## ✅ FASE 4: VERIFICACIÓN FINAL

### ☑️ Todo funciona si:

- [ ] Usuario puede registrarse
- [ ] Usuario puede hacer login
- [ ] Puede añadir productos
- [ ] Checkout acepta dirección completa
- [ ] Pago con Stripe EXITOSO
- [ ] Backend retorna orden con `printful_order_id`
- [ ] Orden apareció en Printful dashboard
- [ ] Logs no muestran errores

### ☑️ Ver órdenes después:

1. Ve a http://localhost:3000/orders
2. Deberías ver la orden que acabas de hacer
3. Cuando Printful envíe el paquete, verás:
   ```
   Status: Shipped ✅
   Tracking #: 1Z999...
   Link a FedEx/UPS
   ```

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Printful API key not configured"
```bash
# Verifica que está en .env
cat backend/.env | grep PRINTFUL_API_KEY
# Debe mostrar tu key

# Si no está, añádelo
echo "PRINTFUL_API_KEY=tu_key" >> backend/.env
```

### Error: "Cannot connect to MongoDB"
```bash
# Verifica URL en .env
cat backend/.env | grep MONGO_URL

# Si es local, verifica que mongod está corriendo
# Si es Atlas, verifica IP whitelist en MongoDB dashboard
```

### Error en Stripe: "Invalid API Key"
```bash
# Verifica que NO tiene comillas extras
cat backend/.env | grep STRIPE_API_KEY
# ✅ STRIPE_API_KEY=sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh...
# ❌ STRIPE_API_KEY="sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh..."
```

### Logs del backend no muestran nada
```bash
# Verifica que backend está corriendo
curl http://localhost:8000/api/health
```

---

## 📞 CHECKLIST FINAL ANTES DE IR A NAMECHEAP

- [ ] Backend corriendo localmente ✅
- [ ] Frontend corriendo localmente ✅
- [ ] Librería `httpx` instalada `pip install httpx` ✅
- [ ] `printful_integration.py` existe en `/backend` ✅
- [ ] `server_v2.py` tiene los 4 endpoints Printful ✅
- [ ] `Checkout.js` envía dirección completa ✅
- [ ] `Orders.js` muestra tracking ✅
- [ ] `.env` tiene todas las credenciales ✅
- [ ] Compra de prueba EXITOSA ✅

---

## 🎉 CUANDO TODO FUNCIONE LOCALMENTE

**Próximos pasos para Namecheap:**

1. Cambiar `STRIPE_API_KEY` a `sk_live_...`
2. Cambiar `PRINTFUL_ENV` de `test` a `live`
3. Cambiar `PRINTFUL_API_KEY` a production key
4. Configurar webhooks en Printful con tu dominio
5. Deploy a Namecheap

---

**Avísame cuando termines la FASE 3 y te ayudaré con lo que sigue! 🚀**
