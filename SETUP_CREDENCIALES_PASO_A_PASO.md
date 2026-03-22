# 🔐 GUÍA COMPLETA: Obtener Credenciales Stripe + Printful + MongoDB

## 📋 Resumen de lo que necesitas

| Servicio | Lo que obtendrás | Dónde lo usas |
|----------|------------------|---------------|
| Stripe | `sk_test_xxxxx` | Backend `.env` → `STRIPE_API_KEY` |
| Printful | `pfapikey_xxxxx` | Backend `.env` → `PRINTFUL_API_KEY` |
| MongoDB | `mongodb+srv://...` | Backend `.env` → `MONGO_URL` |

---

## 🟦 1️⃣ STRIPE API KEY (10 minutos)

### 1.1 Abre tu Stripe Dashboard

**URL:** https://dashboard.stripe.com/

**Opciones:**
- ✅ Ya tienes cuenta → Login directo
- ❌ No tienes → Haz click en "Sign up"

### 1.2 Obtén la API Key

**En el dashboard:**

1. Click en **Developers** (abajo a la izquierda, en la barra negra)
2. Click en **API keys**
3. Asegúrate que estás en **Test mode** (verás un toggle arriba)

**Verás 2 keys:**
```
Publishable key    pk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh...
Secret key         sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGh...
                   ↑ ESTA ES LA QUE NECESITAS
```

4. Click **Reveal** (en Secret key)
5. COPIA TODO (es largo, ej: 100 caracteres)

### 1.3 Guarda en .env

```env
STRIPE_API_KEY=sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGhIj5kLmN...
```

---

## 📄 2️⃣ PRINTFUL API KEY (10 minutos)

### 2.1 Abre Printful

**URL:** https://app.printful.com/

**Opciones:**
- ✅ Ya tienes cuenta → Login directo
- ❌ No tienes → Click en "Sign up" (arriba)

### 2.2 Obtén tu API Key

**En el dashboard:**

1. Click en **Settings** (rueda engranaje abajo a la izquierda)
2. En el sidebar izquierdo, click en **API**
3. Click en **"Generate new token"** (botón azul)
4. **IMPORTANTE:** El token aparece UNA SOLA VEZ
5. Haz click en **Copy**
6. PEGA en notepad ahora mismo (no lo pierdes)

El token se ve así:
```
pfapikey_1234567890abcdefghijklmn...
```

### 2.3 Configura Webhook en Printful (Para después)

**Por ahora solo toma nota:**
- Volveremos aquí cuando tengas dominio/hosting
- En Printful → Settings → **Webhooks** → Add webhook

---

## 🗄️ 3️⃣ MONGODB URL (15 minutos)

### Opción A: MongoDB Atlas (☁️ Recomendado para Namecheap)

**Ventaja:** Tu BD en la nube, accesible desde cualquier hosting

#### Paso 1: Crea cuenta

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Click **Sign Up**
3. Completa: Email, nombre, contraseña
4. Verifica email

#### Paso 2: Crea tu Cluster

1. Click **Create a Deployment**
2. Selecciona **M0 (FREE)**
3. Region: Elige la más cercana a tu audience (USA = Virginia)
4. Cluster Name: `lxi-cluster` (como quieras)
5. Click **Create**
6. **Espera 5 minutos** (aparecerá verde)

#### Paso 3: Obtén la Connection String

1. Cuando esté listo, click **Connect**
2. Click **Drivers**
3. Language: **Python** → Version: **3.12**
4. Verás una cadena como:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

#### Paso 4: Reemplaza valores

Necesitas crear un usuario:

1. En MongoDB Atlas → **Database Access** (left sidebar)
2. Click **Add Database User**
3. Username: `lxi_user`
4. Password: Genera uno fuerte (ej: `P@ssw0rd123!LXI`)
5. User Privileges: **Built-in role** → `readWriteAnyDatabase`
6. Click **Add User**
7. Espera confirmación

Ahora reemplaza en tu connection string:

```
De: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/...

A:  mongodb+srv://lxi_user:P@ssw0rd123!LXI@cluster0.xxxxx.mongodb.net/lxi_db?retryWrites=true&w=majority
                 ^^^^^^^^               ^^^^^^^^              ^^^^^^^^         ^^^^^^
                 usuario                password             tu cluster        DB name
```

#### Paso 5: IP Whitelist (IMPORTANTE)

1. MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. **OPCIÓN A** (para testing): Click **"Allow Access from Anywhere"**
   - **0.0.0.0/0** (inseguro pero para testing)
4. **OPCIÓN B** (producción): Manualmente la IP de Namecheap
5. Click **Confirm**

### Opción B: MongoDB Local (💻 Para testing rápido)

Si ya tienes MongoDB instalado localmente:

```
mongodb://localhost:27017
```

---

## 📝 4️⃣ ACTUALIZA TU .env

Abre el archivo:

```
c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env
```

**Reemplaza con tus valores reales:**

```env
# DATABASE
MONGO_URL="mongodb+srv://lxi_user:P@ssw0rd123!LXI@cluster0.xxxxx.mongodb.net/lxi_db?retryWrites=true&w=majority"
DB_NAME="lxi_db"

# STRIPE
STRIPE_API_KEY=sk_test_51Hy5s2Bl0b3gH4bZ9Y2xC3fGhIj5kLmN...

# PRINTFUL
PRINTFUL_API_KEY=pfapikey_1234567890abcdefghijklmn...
PRINTFUL_ENV=test

# SECURITY
SECRET_KEY=lxi-secret-key-12345-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OTHER
CORS_ORIGINS="*"
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
WEBHOOK_BASE_URL=http://localhost:8000
API_VERSION=2.0.0
```

---

## ✅ VERIFICA que todo está correcto

### 1. Stripe está conectado:

```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Stripe:', os.getenv('STRIPE_API_KEY')[:20])"
```

Deberías ver:
```
Stripe: sk_test_51Hy5s2Bl0b3gH4bZ...
```

### 2. Printful está conectado:

```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Printful:', os.getenv('PRINTFUL_API_KEY')[:20])"
```

Deberías ver:
```
Printful: pfapikey_1234567890abcde...
```

### 3. MongoDB conecta:

```bash
python
>>> from motor.motor_asyncio import AsyncIOMotorClient
>>> import os
>>> from dotenv import load_dotenv
>>> load_dotenv()
>>> mongo_url = os.getenv('MONGO_URL')
>>> if mongo_url:
>>>     print(f"MongoDB conectando a: {mongo_url[:50]}...")
```

Deberías ver:
```
MongoDB conectando a: mongodb+srv://lxi_user:***@cluster0.xxxxx.m...
```

---

## 🚀 Siguiente Paso: Iniciar Servidor

Una vez tengas todo el `.env` configurado:

```bash
cd backend
python server_v2.py
```

Deberías ver:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🎯 Para Producción en Namecheap (Después)

Cuando estés listo para ir live:

1. **Stripe:**
   - Solicita "Live mode" en Stripe
   - Reemplaza `sk_test_` con `sk_live_`

2. **Printful:**
   - Activa modo live
   - Reemplaza `PRINTFUL_ENV=test` con `PRINTFUL_ENV=live`

3. **MongoDB:**
   - Ya está en la nube ✅
   - Funcionará desde cualquier hosting

4. **Domain & Webhooks:**
   - Actualiza `WEBHOOK_BASE_URL` a tu dominio
   - Configura webhooks en Stripe y Printful con tu dominio

---

## 📞 Problemas Comunes

### ❌ "ModuleNotFoundError: No module named 'dotenv'"

```bash
pip install python-dotenv
```

### ❌ "MongoDB connection refused"

- ¿Está corriendo MongoDB? Para MongoDB Local: `mongod`
- ¿La URL es correcta? Verifica en `.env`

### ❌ "Stripe API key not found"

Para Windows, el `.env` necesita estar en la carpeta `/backend` exactamente.

---

**¿Listos? Una vez tengas todo, avísame y hacemos el test en VIVO! 🚀**
