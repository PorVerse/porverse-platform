@echo off
mkdir porverse-platform
cd porverse-platform

:: Foldere principale
mkdir app components lib public styles types docs scripts tests

:: Fisiere config
echo > README.md
echo > .gitignore
echo > next.config.js
echo > tailwind.config.js
echo > tsconfig.json
echo > package.json
echo > .env.local
echo > .env.example
echo > DEPLOYMENT.md

:: Subfoldere utile (goale, dar organizate)
mkdir app\auth app\dashboard app\ecosisteme app\api
mkdir components\ui components\dashboard components\auth
mkdir lib\api lib\ai lib\utils
mkdir public\images public\icons
mkdir styles
mkdir types
mkdir tests\e2e tests\integration

:: Fisiere simbolice ca să le vezi în Explorer
echo > app\page.tsx
echo > components\ui\button.tsx
echo > lib\api\xano.ts
echo > styles\globals.css
echo > types\user.ts
echo > tests\e2e\test.ts

echo ✅ Structura PorVerse a fost creată local cu succes!
pause
