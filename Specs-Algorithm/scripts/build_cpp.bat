@echo off
echo ===================================================
echo 🛠️  Compiling C++ Algorithmic Engines with g++ -O3
echo ===================================================

if not exist bin mkdir bin

echo Compiling C++ Ranking Engine...
g++ -O3 -std=c++14 cpp/ranking_main.cpp -o bin/ranking_engine.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile ranking_engine.exe
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] bin/ranking_engine.exe built successfully.

echo.
echo Compiling C++ Spec Verification Engine...
g++ -O3 -std=c++14 cpp/verification_main.cpp -o bin/verification_engine.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile verification_engine.exe
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] bin/verification_engine.exe built successfully.

echo.
echo Compiling C++ MongoDB and Redis Sync Worker...
g++ -O3 -std=c++14 cpp/mongo_redis_sync.cpp -o bin/mongo_redis_sync.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile mongo_redis_sync.exe
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] bin/mongo_redis_sync.exe built successfully.

echo.
echo ===================================================
echo ✨ All C++ Engines Compiled Successfully into bin/!
echo ===================================================
