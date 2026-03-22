# 🔍 DIAGNÓSTICO: npm install falla en Frontend

**Problema:** `npm install` retorna Exit Code 1 (error)  
**Ubicación:** `C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend`  
**Status:** ❌ npm install no completó

---

## 🆘 SOLUCIONES POR ORDEN DE PROBABILIDAD

### Solución #1: Verificar que Node.js está instalado ⭐ MÁS PROBABLE

**En PowerShell, ejecuta:**
```powershell
node --version
npm --version
```

**Si ves algo como:**
```
v18.17.0
9.6.7
```
✅ Node.js está instalado

**Si ves:**
```
'node' is not recognized as an internal or external command
```
❌ Node.js NO está instalado

**Solución:** Descargar e instalar Node.js
- Ve a: https://nodejs.org/
- Descarga LTS (recomendado)
- Instala y reinicia terminal
- Luego vuelve a intentar `npm install`

---

### Solución #2: Limpiar cache de npm

```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm cache clean --force
npm install
```

---

### Solución #3: Eliminar carpetas y reintentar

```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"

# Eliminar carpetas anteriores
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Reintentar
npm install
```

---

### Solución #4: Usar YARN en lugar de npm

```powershell
# Instalar yarn (si no lo tienes):
npm install -g yarn

# Luego en frontend:
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
yarn install
```

---

### Solución #5: Ver el error exacto

```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm install --verbose
```

Esto mostrará el error exacto que ocurre.

---

## 🎯 PASOS DE DIAGNÓSTICO

**PRIMERO, verifica node:**
```powershell
node --version
npm --version
```

**Luego intenta:**
```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
npm install
```

**Si falla nuevamente, ejecuta esto para ver el error:**
```powershell
npm install --verbose 2>&1 | Tee-Object -FilePath error.log
```

---

## 📋 CHECKLIST: ¿Qué verificar?

```
[ ] ¿Node.js está instalado?           (node --version)
[ ] ¿npm funciona?                     (npm --version)
[ ] ¿Estoy en la carpeta frontend/?    (cd frontend)
[ ] ¿Hay .npmrc corrupto?              (Delete si existe)
[ ] ¿Hay espacio en disco?             (Ver en Explorador)
[ ] ¿Tengo permisos?                   (Ejecutar como Admin?)
[ ] ¿Internet funciona?                (Ping google.com)
```

---

## 🔧 COMANDO PARA LIMPIAR Y REINTENTAR

```powershell
# Copia y pega TODO esto:
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm cache clean --force
npm install
```

---

## ❌ ERRORES COMUNES Y SOLUCIONES

| Error | Solución |
|-------|----------|
| `'npm' is not recognized` | Instalar Node.js desde nodejs.org |
| `ERR! code ERESOLVE` | Ejecutar: `npm install --legacy-peer-deps` |
| `ERR! permission denied` | Ejecutar PowerShell como Administrator |
| `unable to resolve dependency tree` | `npm install --force` |
| `EACCES: permission denied` | En Linux/Mac: `sudo npm install` |

---

## 🆘 SI NADA FUNCIONA

**Ejecuta esto en PowerShell como Administrator:**

```powershell
cd "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend"

# Limpiar completamente
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item .npmrc -Force -ErrorAction SilentlyContinue

# Actualizar npm a la versión más reciente
npm install -g npm@latest

# Reintentar con flags
npm install --legacy-peer-deps --verbose
```

---

## 📞 INFORMACIÓN PARA REPORTAR

Si persiste el error, avísame con:
```
1. Output de: node --version
2. Output de: npm --version
3. Output completo de: npm install --verbose
4. ¿Ejecutaste como Administrator?
5. ¿Hay carpeta node_modules ya?
```

---

**Documento:** NPM_INSTALL_ERROR.md  
**Status:** Soluciones listadas  
**Próximo paso:** Ejecuta Solución #1 primero (verificar Node.js)

