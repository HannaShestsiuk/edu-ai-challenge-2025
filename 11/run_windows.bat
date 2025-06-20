@echo off
echo Building project (suppressing warnings)...

:: Build and redirect warnings to nul
dotnet build --nologo > build.log 2>&1

if %errorlevel% neq 0 (
    echo Build failed. See build.log for details.
    exit /b %errorlevel%
)

echo Running app...
dotnet run --no-build
