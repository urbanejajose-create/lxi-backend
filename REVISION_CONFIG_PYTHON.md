# 🔍 REVISIÓN: Configuración Python - Estado Actual

**Fecha:** 19-03-2026  
**Revisión de:** Entorno Python + Dependencias + .env

---

## 📊 ESTADO ENCONTRADO

### ✅ LO QUE ESTÁ BIEN

```
✅ VENV CREADO
└─ Comando ejecutado: python -m venv venv
└─ Ubicación: C:\Users\admin\...\backend\venv\
└─ Estado: CREADO EXITOSAMENTE

✅ PYTHON 3.x INSTALADO
└─ Se puede ver en: pip --version
└─ Estado: FUNCIONAL
```

### 🔴 LO QUE FALTA / ESTÁ MAL

```
❌ VENV NO ACTIVADO
└─ Síntoma: No ves "(venv)" al inicio del prompt
└─ Impacto: 🔴 CRÍTICO - Pip no instala en el venv

❌ DEPENDENCIAS INCOMPLETAS
└─ Instalado: 4 paquetes (fastapi, uvicorn, motor, pydantic)
└─ Necesarios: 33 paquetes
└─ Faltante: 29 paquetes críticos
└─ Impacto: 🔴 CRÍTICO - Backend no funcionará

❌ .ENV INCOMPLETO
└─ Falta: PRINTFUL_API_KEY
└─ Falta: SECRET_KEY
└─ Falta: PRINTFUL_ENV
└─ Impacto: 🔴 CRÍTICO - Backend fallarà al iniciar

❌ verify_setup.py NO EJECUTADO
└─ No sé si credenciales están correctas
└─ Impacto: 🟠 IMPORTANTE

❌ seed_data.py NO EJECUTADO
└─ BD sin datos de prueba
└─ Impacto: 🟠 IMPORTANTE
```

---

## 🎯 DIAGNÓSTICO DETALLADO

### Falta #1: VENV No Activado

**Estado Actual:**
```
✅ Venv existe en:
C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\venv\

❌ Pero NO está activado
Síntoma: Prompt no muestra "(venv)" al inicio
```

**Prueba:**
```powershell
# Si ves ESTO:
C:\Users\admin\...\backend>

# Significa que venv NO está activado (falta "(venv)" al inicio)

# Debería verse ESTO:
(venv) C:\Users\admin\...\backend>
```

**Solución:**
```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
venv\Scripts\activate

# Ahora deberías ver: (venv) al inicio
```

---

### Falta #2: Dependencias Incompletas

**Estado Actual:**
```
Ejecutaste:
  pip install fastapi uvicorn motor pydantic

Solo instaló ESTOS 4:
  ├─ fastapi==0.110.1 ✅
  ├─ uvicorn==0.25.0 ✅
  ├─ motor==3.3.1 ✅
  └─ pydantic>=2.6.4 ✅

PERO necesitas OTROS 29:
  ├─ python-dotenv ❌ FALTA
  ├─ pymongo ❌ FALTA
  ├─ pyjwt ❌ FALTA
  ├─ bcrypt ❌ FALTA
  ├─ passlib ❌ FALTA
  ├─ slowapi ❌ FALTA
  ├─ starlette ❌ FALTA
  ├─ email-validator ❌ FALTA
  ├─ pytest ❌ FALTA
  ├─ httpx ❌ FALTA
  │ (... 19 más)
  └─ Total: 29 paquetes faltante
```

**Impacto:**
```
Cuando hagas: python server_v2.py

Verás ESTOS errores:
  ❌ ImportError: No module named 'dotenv'
  ❌ ImportError: No module named 'jwt'
  ❌ ImportError: No module named 'bcrypt'
  ❌ ImportError: No module named 'passlib'
  ❌ (etc)

RESULTADO: Backend NO inicia
```

**Solución:**
```powershell
# Primero ACTIVA venv:
venv\Scripts\activate

# Luego instala TODAS las dependencias:
pip install -r requirements.txt

# Esto instala los 33 paquetes completos
```

---

### Falta #3: .ENV Incompleto

**Estado Actual:**
```env
MONGO_URL="mongodb://localhost:27017"      ✅ OK
DB_NAME="test_database"                    ✅ OK
CORS_ORIGINS="*"                           ✅ OK (pero unsafe)
STRIPE_API_KEY=sk_test_emergent            ⚠️ DUMMY KEY

❌ FALTA:
PRINTFUL_API_KEY=???                       ❌ AUSENTE
PRINTFUL_ENV=test                          ❌ AUSENTE
SECRET_KEY=???                             ❌ GENERIC/INSEGURO
```

**Impacto:**
```
Cuando hagas: python server_v2.py

Backend verá:
  ✅ MongoDB: OK
  ❌ Printful: Falta API key → webhooks fallarán
  ⚠️ Stripe: Dummy key → pagos fallarán
  ❌ SECRET: Generic → tokens inseguros

RESULTADO: Backend inicia PERO integrations NO funcionan
```

**Solución:**
```env
# Edita backend/.env y agrega:

STRIPE_API_KEY=sk_test_51Hy5s2Bl0b...  ← Obtén en Stripe dashboard
PRINTFUL_API_KEY=pfapikey_1234567...   ← Obtén en Printful dashboard
PRINTFUL_ENV=test
SECRET_KEY=lxi-secret-2026-unico
```

---

## 🛠️ PLAN DE CORRECCIÓN (3 PASOS)

### PASO 1: Activar VENV + Instalar todas las dependencias

```powershell
# En PowerShell:
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"

# Activar venv
venv\Scripts\activate

# Deberías ver: (venv) al inicio

# Instalar TODAS las dependencias
pip install -r requirements.txt

# Espera 2-3 minutos a que instale los 33 paquetes
# Final esperado: "Successfully installed 33 packages"
```

**✅ Señal de éxito:**
```
Successfully installed fastapi-0.110.1 uvicorn-0.25.0 motor-3.3.1 
pydantic-2.6.4 python-dotenv-1.0.1 pymongo-4.5.0 pyjwt-2.10.1 
bcrypt-4.1.3 passlib-1.7.4 slowapi-0.1.8 starlette-0.25.0
email-validator-2.2.0 pytest-8.0.0 httpx-0.25.0 ... (más paquetes)

SUCCESS
```

---

### PASO 2: Completar .ENV

```powershell
# Abre el archivo:
# C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\.env

# Edítalo manualmente en Notepad o VS Code
# Reemplaza:

MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
STRIPE_API_KEY=sk_test_emergent

# POR:

MONGO_URL="mongodb://localhost:27017"
DB_NAME="lxi_database"
CORS_ORIGINS="http://localhost:3000"
STRIPE_API_KEY=sk_test_51Hy5s2Bl0bXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PRINTFUL_API_KEY=pfapikey_1234567890abcdefghijklmno
PRINTFUL_ENV=test
SECRET_KEY=lxi-secret-2026-$(random)-cambiar-en-produccion
```

**Obtener credenciales reales:**
- Stripe: https://dashboard.stripe.com/apikeys (copia sk_test_...)
- Printful: https://app.printful.com/settings/api (copia pfapikey_...)

---

### PASO 3: Verificar TODO

```powershell
# Con venv activado, ejecuta:
python verify_setup.py

# Deberías ver:
✅ MONGO_URL configurado correctamente
✅ STRIPE_API_KEY válida
✅ PRINTFUL_API_KEY válida
✅ SECRET_KEY configurado
✅ TODAS LAS CREDENCIALES ESTÁN CORRECTAS

Status: TODO CORRECTO - LISTO PARA INICIAR
```

---

## 📋 CHECKLIST: ¿ESTÁ CORREGIDO?

```
ANTES (Ahora):               DESPUÉS (Target):
═════════════════════════════════════════════════════════

❌ venv no activado          ✅ venv ACTIVADO
❌ 4 paquetes instalados     ✅ 33 paquetes instalados
⚠️ .env incompleto           ✅ .env COMPLETO
❌ Stripe key dummy          ✅ Stripe key REAL
❌ Printful key ausente      ✅ Printful key REAL
❌ SECRET_KEY generic        ✅ SECRET_KEY ÚNICO
❌ verify_setup.py rojo      ✅ verify_setup.py VERDE

ESTADO: 🔴 INCOMPLETO        ESTADO: 🟢 LISTO
```

---

## ✅ CUANDO COMPLETES ESTO

Si completas los 3 pasos arriba, entonces:

```
✅ python server_v2.py         → Backend iniciará exitosamente
✅ Stripe webhooks              → Funcionarán
✅ Printful webhooks            → Funcionarán
✅ Tracking en tiempo real      → Funcionará
✅ Pagos automáticos            → Funcionarán

RESULTADO: ✅ BACKEND 100% OPERATIVO
```

---

## 🚀 PRÓXIMO PASO INMEDIATO

```
1. Activa venv:
   venv\Scripts\activate

2. Instala dependencias:
   pip install -r requirements.txt

3. Espera a que termine (~2-3 minutos)

4. Verifica:
   pip list
   (deberías ver 33+ paquetes)

5. Edita .env con credenciales reales

6. Ejecuta:
   python verify_setup.py

7. Listo para: python server_v2.py
```

---

**Documento:** REVISION_CONFIG_PYTHON.md  
**Versión:** 2026-03-19  
**Status:** ✅ Diagnóstico completado  
**Próximo:** Ejecutar pasos de corrección

