# 🚀 CORRECCIÓN ENTORNO PYTHON - EJECUTA ESTOS COMANDOS

**Elige UNA opción:**

---

## OPCIÓN A: Ejecutar script automático (MÁS FÁCIL)

### Windows PowerShell (Recomendado)

```powershell
# Copia y pega ESTO en PowerShell:

cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"; . .\SETUP_AUTOMATICO.ps1
```

**Qué hace:**
- ✅ Activa venv
- ✅ Instala 33 paquetes
- ✅ Verifica instalación
- ✅ Ejecuta verify_setup.py
- ✅ Todo automático

---

## OPCIÓN B: Ejecutar comandos uno por uno (MANUAL)

### Comando 1: Acceder a carpeta y activar venv

```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
venv\Scripts\activate
```

**Deberías ver:** `(venv)` al inicio del prompt

### Comando 2: Instalar todas las dependencias

```powershell
pip install -r requirements.txt
```

**Espera 2-3 minutos**
**Deberías ver al final:** `Successfully installed [paquetes]`

### Comando 3: Verificar que instaló todo

```powershell
pip list
```

**Deberías ver:** Lista con 33+ paquetes incluyendo:
- fastapi ✅
- motor ✅
- pydantic ✅
- python-dotenv ✅
- jwt ✅
- bcrypt ✅
- (etc)

### Comando 4: Verificar setup completo

```powershell
python verify_setup.py
```

**Deberías ver:**
```
✅ MONGO_URL configurado correctamente
✅ STRIPE_API_KEY válida
✅ PRINTFUL_API_KEY válida
✅ SECRET_KEY configurado
✅ TODAS LAS CREDENCIALES ESTÁN CORRECTAS

Status: TODO CORRECTO - LISTO PARA INICIAR
```

---

## OPCIÓN C: Script CMD (BatchFile)

```cmd
# En cmd.exe (NO PowerShell), copia y pega:

"C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend\SETUP_AUTOMATICO.bat"
```

---

## ✅ DESPUÉS DE COMPLETAR

Una vez que todo esté instalado:

```powershell
# Editar .env (Necesitas VALORES REALES):
# Abre: backend\.env

# Obtén en:
# STRIPE_API_KEY → https://dashboard.stripe.com/apikeys (sk_test_...)
# PRINTFUL_API_KEY → https://app.printful.com/settings/api (pfapikey_...)

# Luego ejecuta:
python seed_data.py

# Finalmente:
python server_v2.py
```

---

## 🆘 SI ALGO FALLA

| Error | Solución |
|-------|----------|
| `"venv" not recognized` | Asegúrate de estar en `backend/` folder |
| `pip: command not found` | venv no está activado. Corre: `venv\Scripts\activate` |
| `ModuleNotFoundError` | Corrió `pip install -r` correctamente? Intenta de nuevo |
| `Permission denied` | Abre PowerShell como Administrator |

---

**¿Cuál opción prefieres ejecutar?**

A) Script automático (recomendado)
B) Comandos manuales (control total)
C) Batch script (simple)

