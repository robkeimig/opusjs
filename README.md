opusjs
======

Javascript and wrappers for the standard opus codec implementation.

I have not attempted to build on Windows or OSX yet, but the general idea should be the same as emscripten supports both platforms in addition to Linux

###Build Steps for Linux###
I tested these steps on Ubuntu 12.04 x86

Make sure you have emscripten set up properly:

https://github.com/kripken/emscripten/wiki/Getting-Started-on-Ubuntu-12.10

```emcc```, ```emmake``` and ```emconfigure``` should all be on your path.

#####Building the project#####
- Clone this repository.
- Execute make in the main directory.
- Resulting build should be in ```<project root>/build``` folder.

#####Using on your site#####
- Include ```opus.js``` and ```opuslib.js```.
- Note that ```opus.js``` depends on ```opuslib.js```.
- Read more in the repository wiki #todo
