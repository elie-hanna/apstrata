@echo off
call devconsole.build.properties.bat
mkdir %apstratapath%\devConsole
xcopy /s %devconsolepath% %apstratapath%\devConsole
cd /D %utilpath%
build profileFile=%profilepath% action=clean,release releaseName=