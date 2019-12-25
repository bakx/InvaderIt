# Getting started
Make sure NPM is installed. It can be downloaded from: https://nodejs.org/en/ .
In the checkout folder, run:\
```npm install save-dev```

This will install some of the required modules like Pixi.JS, Webpack and others.

To run the web server, run:
```server.bat``` on Windows or ```sh server.sh``` on the Mac

To start developing and set up watchers run:
```dev.bat``` on Windows or ```sh dev.sh``` on the Mac

# Licensing
All code is licensed as MIT.
Graphics are not MIT licensed and will be removed from future commits. If you like the graphics, consider signing up at : http://www.craftpix.net and get your own copy of these files.

# About
This should be considering a **personal learning** project and likely will not follow the correct guidelines. However, if any of the code is useful for your project, feel free to use it. The quality of the code should improve build after build and i tend to clean-up duplication of data from time to time.

The goal of this project is not to build a game engine. If you are searching for game engines based on Pixi, perhaps give https://phaser.io/ a try.

# Next Tasks
To support health bars and such, all enemies should actually be placed into a container and not live directly on the stage. This would also make it easier to just update the container instead of all individual items.

# Developer Internal notes
* Should https://hjson.org/ be used to generate JSON in order to keep the files nicely formatted and easier to maintain?
* Command to resize gfx | `pngquant *.png --ext=.png --force`
* Perhaps build a 'level' builder?
* https://github.com/pixijs/pixi-particles useful for this game?

# Future Projects
* Cool stuff https://www.nativescript.org/
