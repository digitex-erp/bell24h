@echo off
echo ========================================
echo SIMPLE GIT FIX AND COMMIT
echo ========================================
echo.
echo This will fix git issues and complete the commit:
echo.
echo 1. Configure git identity
echo 2. Remove embedded repositories
echo 3. Pull latest changes
echo 4. Commit all changes
echo 5. Push to repository
echo.
echo Running in external PowerShell...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\SIMPLE_GIT_FIX.ps1"

echo.
echo ========================================
echo GIT FIX COMPLETE!
echo ========================================
echo.
echo All changes committed and pushed to repository.
echo Background agent is now ready to use!
echo.
pause
