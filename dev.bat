xcopy "./node_modules\pixi.js\dist\pixi.min.js" dist
xcopy "./node_modules\pixi.js\dist\pixi.min.js.map" dist
npx webpack --watch --mode="development"
# npm run-script devdev