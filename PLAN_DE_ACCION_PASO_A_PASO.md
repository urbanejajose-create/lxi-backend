# 🎯 PLAN DE ACCIÓN: De 0% a 100% Operativo

**Tiempo Total:** 2-3 horas  
**Dificultad:** 🟢 Fácil (solo copiar/pegar comandos)  
**Status actual:** 75% (Código listo, Sin ejecutar)

---

## 📍 "Dónde Estamos"

```
┌────────────────────────────────────────────────────────────┐
│ PROYECTO LXI E-COMMERCE - ESTADO ACTUAL                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ✅ Código Backend:      5,000+ líneas (LISTO)            │
│  ✅ Código Frontend:     3,200+ líneas (LISTO)            │
│  ✅ 32 Endpoints:        (LISTO)                          │
│  ✅ 14 Páginas:          (LISTO)                          │
│  ✅ Stripe Integration:  (LISTO)                          │
│  ✅ Printful Integration: (LISTO)                         │
│  ✅ Documentación:       5,000+ líneas (LISTO)            │
│                                                            │
│  ⏳ Entorno Python:      NO INSTALADO                      │
│  ⏳ Entorno Node:        NO INSTALADO                      │
│  ⏳ Credenciales:        NO CONFIGURADAS                   │
│  ⏳ BD MongoDB:          NO VERIFICADA                     │
│                                                            │
│  🚫 SERVIDOR:            NO EJECUTÁNDOSE                  │
│  🚫 SITIO WEB:           NO ACCESIBLE                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 PASO A PASO (Copy-Paste)

### PASO 1: Instalar Python Virtual Environment
**Tiempo:** 5 minutos  
**¿Qué hace?** Crea una "caja aislada" para las librerías de Python

**Abre PowerShell (Windows PowerShell ISE)**
```powershell
# Ir a carpeta backend
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"

# Crear virtual environment
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Deberías ver: (venv) al inicio de la línea
```

**✅ Señal de éxito:**
```
(venv) C:\Users\admin\...\backend>
```

**❌ Si no funciona:**
```
# Asegúrate que Python está instalado:
python --version
# Debe mostrar: Python 3.9+ 

# Si no está instalado, descarga:
# https://www.python.org/downloads/
```

---

### PASO 2: Instalar Dependencias Python
**Tiempo:** 2 minutos  
**¿Qué hace?** Descarga e instala todas las librerías que necesita el backend

**En tu terminal (con venv activado):**
```powershell
# Verificar que venv está activo (debes ver "(venv)" al inicio)
pip install -r requirements.txt
```

**Espera ~2 minutos mientras instala:**
```
Collecting fastapi==0.110.1
Collecting uvicorn==0.25.0
Collecting pydantic>=2.6.4
...
Successfully installed fastapi-0.110.1 uvicorn-0.25.0 ...
```

**✅ Señal de éxito:**
```
Successfully installed [muchos paquetes]
```

**❌ Si error:**
```
ERROR: Could not find a version that satisfies the requirement

→ Solución: Asegúrate que Python 3.9+ está instalado
```

---

### PASO 3: Instalar Dependencias Node.js
**Tiempo:** 2 minutos  
**¿Qué hace?** Descarga e instala todas las librerías que necesita el frontend

**Abre NUEVA terminal (PowerShell):**
```powershell
# Ir a carpeta frontend
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"

# Instalar dependencias
npm install

# Si falla, intenta con yarn (más usado en React)
yarn install
```

**Espera ~2-5 minutos:**
```
added 500+ packages in 3m
```

**✅ Señal de éxito:**
```
added [número] packages
```

**❌ Si error con npm:**
```
# npm no está instalado

→ Descarga Node.js: https://nodejs.org/
→ Reinstala terminal después
```

---

### PASO 4: Obtener Credenciales - STRIPE
**Tiempo:** 5 minutos  
**¿Qué hace?** Conseguir tu API key de Stripe

**EN NAVEGADOR:**

1. Ve a: https://dashboard.stripe.com/apikeys
2. Si no tienes cuenta, crea una: https://dashboard.stripe.com/register
3. Busca: "Secret key" (empieza con `sk_test_` o `sk_live_`)
4. Copia la key completa
5. Guarda en bloc de notas

**Pega aquí temporalmente:**
```
Mi Stripe Key: sk_test_51Hy5s2Bl0bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**✅ Señal de éxito:**
```
sk_test_[40+ caracteres alfanuméricos]
```

**❌ Si no ves la key:**
```
→ Asegúrate de estar en el modo correcto (test vs live)
→ Busca en: https://dashboard.stripe.com → Settings → API keys
```

---

### PASO 5: Obtener Credenciales - PRINTFUL
**Tiempo:** 5 minutos  
**¿Qué hace?** Conseguir tu API key de Printful

**EN NAVEGADOR:**

1. Ve a: https://app.printful.com/settings/api
2. Si no tienes cuenta, crea una: https://www.printful.com/signup
3. En "API", busca: "API key" o "API token"
4. Si dice "Generate API token", haz clic
5. Copia la key completa
6. Guarda en bloc de notas

**Peta aquí temporalmente:**
```
Mi Printful Key: pfapikey_1234567890abcdefghijklmnopqrstuvwxyz
```

**✅ Señal de éxito:**
```
pfapikey_[40+ caracteres alfanuméricos]
```

**❌ Si no la ves:**
```
→ Settings → API → Click "Generate new API token"
→ Espera 10 segundos a que se genere
```

---

### PASO 6: Configurar MongoDB
**Tiempo:** 5-10 minutos  
**¿Qué hace?** Configura dónde guardar la base de datos

**OPCIÓN A: Local (más simple para testing)**
```
# Verifica que MongoDB está instalado:
mongod

# Si ves:
# [initandlisten] Listening on port 27017

# ✅ Funciona localmente
```

**OPCIÓN B: MongoDB Atlas (Cloud - Recomendado)**

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea cuenta / Login
3. Create Project → Create Cluster (free tier)
4. Espera 5-10 minutos a que se cree
5. Database Access → Add user → username/password
6. Network Access → Add 0.0.0.0/0 (permite tu IP)
7. Clusters → Connect → Driver → Selecciona Node.js
8. Copia connection string
9. Reemplaza `<username>` y `<password>`
10. Guarda en bloc de notas

**Pega aquí temporalmente:**
```
Mi MongoDB URL: mongodb+srv://user:password@cluster.mongodb.net/lxi_db
```

**✅ Señal de éxito:**
```
mongodb+srv://[usuario]:[password]@[cluster].mongodb.net/[db]
```

---

### PASO 7: Editar .env (Archivo de Configuración)
**Tiempo:** 2 minutos  
**¿Qué hace?** Guarda todas tus credenciales en un archivo seguro

**Abre archivo:**
```
C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env
```

**Contenido ACTUAL:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
STRIPE_API_KEY=sk_test_emergent
```

**Reemplaza con:**
```env
# Base de datos
MONGO_URL="mongodb+srv://user:password@cluster.mongodb.net/lxi_db"
DB_NAME="lxi_database"

# CORS
CORS_ORIGINS="http://localhost:3000"

# Stripe (copia aquí tu key)
STRIPE_API_KEY=sk_test_51Hy5s2Bl0bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Printful (copia aquí tu key)
PRINTFUL_API_KEY=pfapikey_1234567890abcdefghijklmno

# Entorno Printful
PRINTFUL_ENV=test

# Secret para JWT (genera uno único)
SECRET_KEY=lxi-secret-2026-cambiar-en-produccion-$(random)
```

**🔒 IMPORTANTE:** 
```
⚠️ NUNCA compartas este archivo
⚠️ NUNCA lo subas a GitHub
⚠️ NUNCA lo dejes en servidor público
```

**✅ Señal de éxito:**
```
Todas las líneas rellenadas (sin valores dummy)
```

---

### PASO 8: Verificar Setup
**Tiempo:** 1 minuto  
**¿Qué hace?** Chequea que todo está bien configurado

**En terminal (con venv activado):**
```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"

# Activar venv si no está
venv\Scripts\activate

# Ejecutar verificación
python verify_setup.py
```

**Output esperado:**
```
✅ MONGO_URL configurado correctamente
✅ STRIPE_API_KEY válida
✅ PRINTFUL_API_KEY válida
✅ SECRET_KEY configurado
✅ TODAS LAS CREDENCIALES ESTÁN CORRECTAS

Status: TODO CORRECTO - LISTO PARA INICIAR
```

**❌ Si ve errores:**
```
❌ MONGO_URL no configurado
❌ STRIPE_API_KEY inválida

→ Revisa .env y asegúrate de que los valores son correctos
→ No uses comillas donde no deben estar
```

---

### PASO 9: Cargar Datos de Prueba (Seed)
**Tiempo:** 1 minuto  
**¿Qué hace?** Llenar la BD con 10 productos + admin user

**En terminal:**
```powershell
# Asegúrate de estar en backend con venv activado
python seed_data.py
```

**Output esperado:**
```
Seeding database...
✅ 10 products created
✅ Admin user created
✅ Database seeded successfully

Admin credentials:
Email: admin@lxi.com
Password: admin123
```

**⚠️ Nota:** Estos son datos de TEST, cámbialos en producción

---

### PASO 10: Iniciar Backend
**Tiempo:** 3 minutos  
**¿Qué hace?** Levanta el servidor API FastAPI

**Terminal 1 (la que tenías abierta):**
```powershell
# Asegúrate de estar en backend con venv activado
python server_v2.py
```

**Output esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**✅ Señal de éxito:**
```
Uvicorn running on http://0.0.0.0:8000
```

**❌ Si no ves esto:**
```
ERROR: OSError: [Errno 48] Address already in use

→ Algún otro proceso está usando puerto 8000
→ Cambia puerto en ver_v2.py línea final: 
   uvicorn.run(app, host="0.0.0.0", port=8001)
```

**NO CIERRES ESTA TERMINAL, déjala ejecutando**

---

### PASO 11: Iniciar Frontend
**Tiempo:** 5 minutos  
**¿Qué hace?** Levanta la aplicación React

**Terminal 2 NUEVA (PowerShell):**
```powershell
# Ir a frontend
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"

# Iniciar React
npm start

# O si instalaste con yarn:
yarn start
```

**Espera 3-5 minutos mientras compila...**

**Output esperado:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

**✅ Señal de éxito:**
```
Compiled successfully!
```

**Se abrirá automáticamente en http://localhost:3000**

---

### PASO 12: Testing Completo
**Tiempo:** 30 minutos  
**¿Qué hace?** Verificar que todo funciona end-to-end

**En navegador (http://localhost:3000):**

#### Test 1: Navegar
```
✅ Home page carga
✅ Shop page muestra productos
✅ Detalle producto funciona
✅ Footer/Header visible
```

#### Test 2: Autenticación
```
✅ Click "Register"
✅ Email: testuser@test.com
✅ Password: Test123!
✅ Create account
✅ Deberías ver: "Account created successfully"

✅ Click "Login"
✅ Usa credenciales que acabas de crear
✅ Deberías entrar en Dashboard
```

#### Test 3: Compra
```
✅ Click producto cualquiera
✅ Click "Add to Cart"
✅ Click Cart icon
✅ Click "Checkout"
✅ Rellena dirección:
   - First Name: Test
   - Email: testuser@test.com
   - Address: 123 Main St
   - City: New York
   - ZIP: 10001
✅ Click "Proceed to Payment"
✅ Deberías ir a Stripe checkout
```

#### Test 4: Pago Stripe
```
En Stripe Checkout:
✅ Verás: "Pay" button
✅ Usa tarjeta TEST: 4242 4242 4242 4242
✅ Expira: cualquier fecha futura (ej: 12/25)
✅ CVC: cualquier 3 dígitos (ej: 242)
✅ Nombre: Test Usuario
✅ Click "Pay"
✅ Deberías ver: "Payment successful"
✅ Deberías ir a: /checkout/success
```

#### Test 5: Verificar en Stripe Dashboard
```
Ve a: https://dashboard.stripe.com/payments
✅ Deberías ver tu pago reciente
✅ Status: Succeeded
✅ Monto: correctamente
```

#### Test 6: Verificar en Printful
```
Ve a: https://app.printful.com/orders
✅ Deberías ver una orden NUEVA
✅ Status: "Processing" (1-3 días)
✅ Items: tu orden
```

#### Test 7: Ver Tracking (cuando esté listo en Printful)
```
En http://localhost:3000/orders
✅ Deberías ver tu orden
✅ Status: "Shipped" (cuando Printful envíe)
✅ Tracking number: 1Z999...
✅ Carrier: FedEx / UPS
✅ Click link: Abre tracking externo
```

---

## ✅ "GANASTE" - ERES 100% OPERATIVO

Si llegaste aquí, tu e-commerce está:

```
✅ Backend ejecutando
✅ Frontend ejecutando
✅ Pagos funcionando
✅ Printful funcionando
✅ Tracking funcionando
✅ TODO ESTÁ VERDE

Estado: 🟢 OPERATIVO 100%
```

---

## 🚀 PRÓXIMO PASO: DEPLOY A PRODUCCIÓN

Ahora que funciona localmente, necesitas ponerlo online:

### Opción 1: Namecheap (Compartido)
```
1. Comprar hosting: https://www.namecheap.com
2. Instalar Python + Node
3. Subir código
4. Configurar SSL
5. Cambiar credenciales a LIVE (sk_live_...)
6. Configurar webhooks URLs
```

### Opción 2: VPS
```
1. DigitalOcean / Linode / AWS
2. Más control + más caro
3. Recomendado para e-commerce serios
```

### Opción 3: Vercel (Frontend Solo)
```
1. Frontend a Vercel (gratis)
2. Backend a Heroku (gratis) o Railway
3. Más simple + más rápido
```

---

## 📞 TROUBLESHOOTING RÁPIDO

| Problema | Solución |
|----------|----------|
| "Module not found" | `pip install -r requirements.txt` |
| "npm not found" | Instala Node.js https://nodejs.org |
| "Port 8000 already in use" | Cambia puerto en server_v2.py |
| "MongoDB connection failed" | Verifica MONGO_URL en .env |
| "Stripe key invalid" | Obtén nueva key en https://dashboard.stripe.com |
| "CORS error" | Verifica CORS_ORIGINS en .env |
| "React white screen" | Abre console (F12), busca errores |
| "Payment declined" | Usa tarjeta TEST: 4242 4242 4242 4242 |

---

## 📈 CHECKLIST FINAL

```
[ ] Paso 1: Virtual environment Python ✅
[ ] Paso 2: pip install -r requirements.txt ✅
[ ] Paso 3: npm install (frontend) ✅
[ ] Paso 4: Stripe key obtenida ✅
[ ] Paso 5: Printful key obtenida ✅
[ ] Paso 6: MongoDB configurado ✅
[ ] Paso 7: .env editado ✅
[ ] Paso 8: verify_setup.py pasó ✅
[ ] Paso 9: seed_data.py ejecutado ✅
[ ] Paso 10: Backend iniciado ✅
[ ] Paso 11: Frontend iniciado ✅
[ ] Paso 12: Testing completo ✅

RESULTADO: ✅ OPERATIVO 100%
```

---

**Documento:** PLAN_DE_ACCION_PASO_A_PASO.md  
**Tiempo total:** 2-3 horas  
**Dificultad:** 🟢 Fácil  
**Status:** Siguiendo este plan = ÉXITO ✅

**¿Necesitas ayuda? ¡Hazme saber en qué paso estás atascado!**

