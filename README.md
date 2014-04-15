opusjs
======

Javascript and wrappers for the standard opus codec implementation.

###Build Steps (Ubuntu)###
Make sure you have emscripten set up properly:

https://github.com/kripken/emscripten/wiki/Getting-Started-on-Ubuntu-12.10

```emcc```, ```emmake``` and ```emconfigure``` should all be on your path.

#####Building the Opus Codec Library w/ LLVM#####
- Clone this repository.
- Execute make in the main directory.
- Resulting build should be in ```opusjs/build``` folder.

#####Compiling Opus Library LLVM and C Wrapper to JavaScript#####
- Execute from --prefix= path used above:
  - ```$ emcc opusjs.c -I include/ -o opuslib.js -L lib/libopus.a -s EXPORTED_FUNCTIONS="[...]"```
- You can now use opuslib.js with the included opus.js helper file in this repository.

