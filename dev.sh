#!/bin/bash
rmdir /S /Q dist
mkdir dist
cp "./node_modules\pixi.js\dist\pixi.min.js" dist
cp "./node_modules\pixi.js\dist\pixi.min.js.map" dist
cp "./node_modules\pixi-sound\dist\pixi-sound.js" dist
cp "./node_modules\pixi-sound\dist\pixi-sound.js.map" dist
npx http-server %CD% -p 3000
npx webpack --watch --mode development