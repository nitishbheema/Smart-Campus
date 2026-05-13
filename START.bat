@echo off
echo ========================================
echo   CampusEvents - Starting Backend...
echo ========================================
cd /d "%~dp0backend"
if not exist "target\event-management-0.0.1-SNAPSHOT.jar" (
    echo [ERROR] Jar file not found. Building backend first...
    call mvnw.cmd package -DskipTests
)
start "Backend - Spring Boot" cmd /k "java -jar target\event-management-0.0.1-SNAPSHOT.jar"

echo ========================================
echo   CampusEvents - Starting Frontend...
echo ========================================
cd /d "%~dp0frontend"
timeout /t 3 /nobreak >nul
start "Frontend - Vite" cmd /k "npm run dev"

echo ========================================
echo   Opening Browser in 5 seconds...
echo ========================================
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo Done! Both servers are running.

