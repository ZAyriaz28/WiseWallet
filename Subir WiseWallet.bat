@echo off
title WiseWallet Super Push - Fixed Branch
color 0a

echo ========================================
echo   SUBIENDO PROYECTO A GITHUB (MODO FUERZA)
echo ========================================

:: 1. Reparar repositorio si es necesario
if not exist ".git" (
    echo [!] Reparando conexion con GitHub...
    git init
    git remote add origin https://github.com/ZAyriaz28/WiseWallet.git
)

:: 2. Asegurar que la rama se llame 'main'
:: Esto corrige el error 'src refspec main does not match any'
git branch -M main

:: 3. Preparar los archivos
echo [1/3] Agregando archivos nuevos...
git add .

:: 4. Guardar cambios
set /p msg="¿Que cambiaste? (ej. Firebase): "
git commit -m "%msg%"

:: 5. Subir a la fuerza
echo [2/3] Subiendo a GitHub...
git push origin main --force

echo [3/3] ¡LISTO!
echo ========================================
echo Revisa tu web: https://zayriaz28.github.io/WiseWallet/
echo ========================================
pause