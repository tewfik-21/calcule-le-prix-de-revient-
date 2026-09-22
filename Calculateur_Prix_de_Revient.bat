@echo off
chcp 65001 >nul
title Lancement du Calculateur Prix de Revient Carriere
echo ==========================================================
echo   LANCEMENT DU CALCULATEUR PRIX DE REVIENT CARRIERE
echo ==========================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Dossier node_modules absent. Installation des dependances...
    call npm.cmd install
)

echo [INFO] Compilation de l'application (mode securise immuable)...
call npm.cmd run build

echo [INFO] Demarrage du serveur de production securise...
start /b npm.cmd start

echo [INFO] En attente du demarrage du serveur (4 secondes)...
timeout /t 4 /nobreak >nul

echo [INFO] Ouverture de l'application...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

echo.
echo ==========================================================
echo   APPLICATION LANCEE AVEC SUCCES !
echo   Garder cette fenetre ouverte pour maintenir le serveur.
echo ==========================================================
echo.
pause
