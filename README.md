# Getting started
Make sure NPM is installed. It can be downloaded from: https://nodejs.org/en/ .
In the checkout folder, run:\
```npm install save-dev```

This will install some of the required modules like Pixi.JS, Webpack and others.

Currently the project is configured to run from http://local.gamedev.bakx.ca . This will point to `127.0.0.1` so you are able to simply use that domain. Feel free to change
it to something else.  Configure your webserver to serve files from the root folder of this repo.

# Licensing
All code is licensed as MIT.
Graphics are not MIT licensed and will be removed from future commits. If you like the graphics, consider signing up at : http://www.craftpix.net and get your own copy of these files.

# About
This should be considering a **personal learning** project and likely will not follow the correct guidelines. However, if any of the code is useful for your project, feel free to use it. The quality of the code should improve build after build and i tend to clean-up duplication of data from time to time.

The goal of this project is not to build a game engine. If you are searching for game engines based on Pixi, perhaps give https://phaser.io/ a try.

# Developer Internal notes
* Should https://hjson.org/ be used to generate JSON in order to keep the files nicely formatted and easier to maintain?
* Command to resize gfx | `pngquant *.png --ext=.png --force`
* Perhaps build a 'level' builder?

