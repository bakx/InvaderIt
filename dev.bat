rmdir /S /Q dist
mkdir dist
xcopy "./node_modules\pixi.js\dist\pixi.min.js" dist
xcopy "./node_modules\pixi.js\dist\pixi.min.js.map" dist
xcopy "./node_modules\pixi-sound\dist\pixi-sound.js" dist
xcopy "./node_modules\pixi-sound\dist\pixi-sound.js.map" dist
npx webpack --watch --mode development
# npm run-script dev