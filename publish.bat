rmdir /S /Q publish
mkdir publish
xcopy index.html publish
xcopy favicon.ico publish
xcopy config "publish/config" /s /i
xcopy gfx "publish/gfx" /s /i
xcopy sfx "publish/sfx" /s /i
xcopy dist "publish/dist" /s /i