# ⚡ CONTROL REMOTO: Comandos Copy-Paste

**Tiempo:** 2-3 horas  
**Dificultad:** Solo copy-paste ✂️  
**Resultado:** Sitio 100% operativo

---

## 📋 TODO EN UNO

```powershell
# ┌─────────────────────────────────────── PASO 1 ───────────────────────────────────────┐
# │ INSTALAR PYTHON VENV (En PowerShell)                                                │
# └────────────────────────────────────────────────────────────────────────────────────────┘

cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
python -m venv venv
venv\Scripts\activate

# Deberías ver: (venv) C:\...backup_app_core\backend>


# ┌─────────────────────────────────────── PASO 2 ───────────────────────────────────────┐
# │ INSTALAR DEPENDENCIAS PYTHON (En la misma terminal con venv activo)                 │
# └────────────────────────────────────────────────────────────────────────────────────────┘

pip install -r requirements.txt

# Espera 2-3 minutos...
# Deberías ver al final: Successfully installed [muchos paquetes]


# ┌─────────────────────────────────────── PASO 3 ───────────────────────────────────────┐
# │ INSTALAR DEPENDENCIAS NODE (En NUEVA terminal PowerShell)                            │
# └────────────────────────────────────────────────────────────────────────────────────────┘

cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm install

# Espera 3-5 minutos...
# Deberías ver: added 500+ packages


# ┌─────────────────────────────────────── PASO 4 ───────────────────────────────────────┐
# │ OBTENER CREDENCIALES (En navegador)                                                 │
# └────────────────────────────────────────────────────────────────────────────────────────┘

# STRIPE API KEY:
# 1. Ve a: https://dashboard.stripe.com/apikeys
# 2. Copia la key que empieza con sk_test_
# 3. Guarda en bloc de notas

# PRINTFUL API KEY:
# 1. Ve a: https://app.printful.com/settings/api
# 2. Haz clic "Generate API token"
# 3. Copia el token pfapikey_
# 4. Guarda en bloc de notas

# MONGODB URL (Elige una):
# Opción A (Local):
#   mongodb://localhost:27017

# Opción B (Cloud - recomendado):
# 1. Ve a: https://www.mongodb.com/cloud/atlas
# 2. Crea free cluster + user + get connection string
# 3. Guarda en bloc de notas


# ┌─────────────────────────────────────── PASO 5 ───────────────────────────────────────┐
# │ EDITAR .env (Abre en Notepad o VS Code)                                             │
# │ Ruta: C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env     │
# └────────────────────────────────────────────────────────────────────────────────────────┘

# REEMPLAZA ESTO:
#
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="test_database"
# CORS_ORIGINS="*"
# STRIPE_API_KEY=sk_test_emergent

# CON ESTO (reemplaza con tus valores):
#
# MONGO_URL="mongodb+srv://tuusuario:tupassword@cluster.mongodb.net/lxi_db"
# DB_NAME="lxi_database"
# CORS_ORIGINS="http://localhost:3000"
# STRIPE_API_KEY=sk_test_51Hy5s2Bl0bXXXXXXXXXXXXXXXXXXXXXXXXXX
# PRINTFUL_API_KEY=pfapikey_1234567890abcdefghijklmno
# PRINTFUL_ENV=test
# SECRET_KEY=lxi-secret-2026-cambiar-en-produccion


# ┌─────────────────────────────────────── PASO 6 ───────────────────────────────────────┐
# │ VERIFICAR SETUP (En terminal backend con venv activo)                               │
# └────────────────────────────────────────────────────────────────────────────────────────┘

cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
venv\Scripts\activate
python verify_setup.py

# Deberías ver: ✅ TODAS LAS CREDENCIALES ESTÁN CORRECTAS


# ┌─────────────────────────────────────── PASO 7 ───────────────────────────────────────┐
# │ CARGAR DATOS DE PRUEBA (En terminal backend con venv activo)                        │
# └────────────────────────────────────────────────────────────────────────────────────────┘

python seed_data.py

# Deberías ver:
# ✅ 10 products created
# ✅ Admin user created
# ✅ Database seeded successfully


# ┌─────────────────────────────────────── PASO 8 ───────────────────────────────────────┐
# │ INICIAR BACKEND (En terminal backend con venv activo)                               │
# │ IMPORTANTE: NO CIERRES ESTA TERMINAL, DÉJALA EJECUTANDO                             │
# └────────────────────────────────────────────────────────────────────────────────────────┘

python server_v2.py

# Deberías ver: INFO: Uvicorn running on http://0.0.0.0:8000
# ✅ Backend LISTO


# ┌─────────────────────────────────────── PASO 9 ───────────────────────────────────────┐
# │ INICIAR FRONTEND (En OTRA terminal NUEVA PowerShell)                                │
# │ IMPORTANTE: Dejar ambas terminales abiertas                                         │
# └────────────────────────────────────────────────────────────────────────────────────────┘

cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm start

# Espera 3-5 minutos a que compile...
# Deberías ver: Compiled successfully!
# Debería abrir automáticamente: http://localhost:3000
# ✅ Frontend LISTO

# ✅✅✅ ÉXITO: SITIO 100% OPERATIVO ✅✅✅
```

---

## 🚀 VERSIÓN ULTRA-RÁPIDA (Copy-Paste Todo)

Si todo está listo, corre TODO esto de una vez:

```powershell
# Terminal 1: Backend
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
python -m venv venv; venv\Scripts\activate; pip install -r requirements.txt; python verify_setup.py; python seed_data.py; python server_v2.py

# (En otra terminal - Terminal 2: Frontend)
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm install; npm start
```

---

## 🔍 VERIFICACIÓN RÁPIDA

```powershell
# ¿Qué Status debo ver?

Esperado en Terminal 1 (Backend):
✅ Uvicorn running on http://0.0.0.0:8000
✅ Application startup complete

Esperado en Terminal 2 (Frontend):
✅ Compiled successfully!
✅ You can now view frontend in the browser.

Esperado en Navegador:
✅ http://localhost:3000 abre el sitio web
✅ Ves el home page de LXI
✅ Ves los productos del seed
```

---

## ❌ SI ALGO FALLA

| Error | Solución |
|-------|----------|
| "ModuleNotFoundError: No module named 'fastapi'" | Asegúrate que venv está activado: `venv\Scripts\activate` |
| "npm: command not found" | Instala Node.js: https://nodejs.org/ |
| "Port 8000 already in use" | Otra aplicación usa puerto 8000. Solución: `netstat -ano \| findstr :8000` y mata el proceso |
| "MongoDB connection refused" | MongoDB no está ejecutando. Inicia: `mongod` |
| "Stripe API Key invalid" | Usa key de https://dashboard.stripe.com/apikeys (sk_test_...) |
| "CORS error en consola" | Revisa que CORS_ORIGINS en .env es "http://localhost:3000" |
| "React blank screen" | Abre console (F12) y busca errores en rojo |

---

## 📱 TEST RÁPIDO

Después de que corra todo:

```
1. Ve a http://localhost:3000
2. Click "Register"
3. Email: test@test.com / Password: Test123!
4. Click "Create Account"
5. Click "Login" con tus credenciales
6. Click cualquier producto
7. Click "Add to Cart"
8. Click carrito
9. Click "Checkout"
10. Llenar dirección:
    First Name: Test
    Last Name: User
    Email: test@test.com
    Address: 123 Main St
    City: New York
    ZIP: 10001
11. Click "Proceed to Payment"
12. PayPal te lleva a Stripe
13. Usar tarjeta TEST: 4242 4242 4242 4242
14. Expiry: 12/25
15. CVC: 242
16. Click "Pay"
17. ✅ Deberías ver: "Payment successful"
18. ✅ Deberías ir a: /checkout/success
19. ✅ Ve a /orders para ver tu orden
20. ✅ Deberías ver tracking (en 1-3 días cuando Printful procese)
```

---

## 🎯 CHECKLIST MINUTOS POR MINUTO

```
Min 0-30:   Instalar venv Python
Min 30-35:  pip install
Min 35-50:  npm install
Min 50-55:  Obtener Stripe creds
Min 55-60:  Obtener Printful creds
Min 60-65:  Obtener MongoDB URL
Min 65-70:  Editar .env
Min 70-71:  verify_setup.py
Min 71-72:  seed_data.py
Min 72-74:  python server_v2.py (ejecutar en Terminal 1)
Min 74-79:  npm start (ejecutar en Terminal 2)
Min 79-80:  Esperar compilación
Min 80-100: TESTING

Min 100:    ✅ OPERATIVO 100%
```

---

## 🎁 BONUS: Después que esté funcionando

```powershell
# Ver logs en tiempo real
# (Útil para debugging)

# Backend logs:
# Deberías ver en Terminal 1:
# INFO: GET /api/products [200]
# INFO: POST /api/checkout/create-session [201]
# Etc.

# Frontend logs:
# Abre DevTools (F12) y click "Console"
# Deberías ver tu navegación

# ¿Pagos no funcionan? Revisa Stripe Dashboard:
# https://dashboard.stripe.com/payments

# ¿Órdenes no se crean en Printful? Revisa:
# https://app.printful.com/orders

# ¿BD vacía? Corre seed nuevamente:
# python seed_data.py
```

---

## 📊 STATUS FINAL

```
Antes:
├─ Backend: ❌ No corre
├─ Frontend: ❌ No compila
├─ API: ❌ No responde
├─ Sitio: ❌ No visible
└─ Pagos: ❌ No funciona

Después de seguir esto:
├─ Backend: ✅ Corriendo :8000
├─ Frontend: ✅ Compilado :3000
├─ API: ✅ Respondiendo
├─ Sitio: ✅ Visible en navegador
├─ Pagos: ✅ Funcionando
├─ Printful: ✅ Recibiendo órdenes
└─ Tracking: ✅ Visible en órdenes

= 🟢 100% OPERATIVO
```

---

## 📞 NEED HELP?

Si algo falta o no funciona:

```
1. Lee el error en rojo
2. Busca el error en la tabla "SI ALGO FALLA"
3. Sigue la solución
4. Si persiste, avísame en qué paso estás

Datos útiles para reportar:
├─ ¿En qué paso estás?
├─ ¿Qué comando ejecutaste?
├─ ¿Qué error ves?
└─ ¿Terminal 1 o Terminal 2?
```

---

**Documento:** CONTROL_REMOTO_COMANDOS.md  
**Propósito:** Copy-paste directo  
**Tiempo:** 2-3 horas  
**Status:** ✅ READY

**Ahora sí: ¡COMIENZA! 🚀**

