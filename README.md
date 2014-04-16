opusjs
======

Javascript and wrappers for the standard opus codec implementation.

*I have not attempted to build on Windows or OSX yet, but the general idea should be the same as emscripten supports both platforms in addition to Linux. Makefiles/Visual Studio project files will be required. Feel free to submit these if you get this process working on your environment*

###Build Steps for Linux (*Ubuntu 12.04 x86*)###

NodeJS is optional, but very useful for debugging the JavaScript.

Make sure you have emscripten set up properly:

https://github.com/kripken/emscripten/wiki/Getting-Started-on-Ubuntu-12.10

```emcc```, ```emmake``` and ```emconfigure``` should all be on your path.

Make sure to test emcc with the hello_world example as described in the link above to ensure functionality. 

#####Building the project#####
- Clone this repository.
- Execute make in the main directory.
- Resulting build should be in ```<project root>/build``` folder.

#####Using on your site#####
- Include ```opus.js``` and ```opuslib.js```.
- Note that ```opus.js``` depends on ```opuslib.js```.
- Read more in the repository wiki #todo
