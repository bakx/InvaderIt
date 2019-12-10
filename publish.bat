rmdir /S /Q publish
mkdir publish
call build.bat
xcopy index.html publish
xcopy favicon.ico publish
xcopy "./node_modules\pixi.js\dist\pixi.min.js" publish
xcopy "./node_modules\pixi.js\dist\pixi.min.js.map" publish
xcopy config "publish/config" /s /i
xcopy gfx "publish/gfx" /s /i
xcopy dist "publish/dist" /s /i