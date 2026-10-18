@echo off
echo =========================================================
echo 🚀 Running Full C++ Engines Performance Benchmarks
echo =========================================================

echo.
echo [1/2] Benchmarking C++ Ranking Engine (20,000 devices)...
.\bin\ranking_engine.exe --benchmark --count=20000

echo.
echo [2/2] Benchmarking C++ Spec Verification Engine (5,000 devices / 45,000 fields)...
.\bin\verification_engine.exe --benchmark --count=5000

echo.
echo [3/3] Benchmarking C++ Direct Memory Sync Engine...
.\bin\mongo_redis_sync.exe

echo.
echo =========================================================
echo 🏁 Benchmark Completed Successfully!
echo =========================================================
