@echo off
echo Installation de Leaflet pour la carte interactive...

cd /d "%~dp0"

echo.
echo Installation de react-leaflet et leaflet...
npm install react-leaflet leaflet

echo.
echo Installation terminee !
echo.
echo Vous pouvez maintenant utiliser la fonctionnalite Map.
pause
