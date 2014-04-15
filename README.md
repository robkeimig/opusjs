opusjs
======

Javascript and wrappers for the standard opus codec implementation.

###Build Steps (Ubuntu)###
Make sure you have emscripten set up properly:

https://github.com/kripken/emscripten/wiki/Getting-Started-on-Ubuntu-12.10

#####Building the Opus Codec Library w/ LLVM#####
- Obtain the Opus codec v1.1 source:
  - http://downloads.xiph.org/releases/opus/opus-1.1.tar.gz
- tar -xvf to location of your choosing.
- cd into the opus library directory
- Execute: 
  - ```$ emconfigure ./configure --prefix=<wherever you want it to go>```
- Open the generated config.h file and comment out the ```#define HAVE___MALLOC_HOOK 1``` line if it is set (this fixed my only issue).
- Execute:
  - ```$ emmake make install```

#####Compiling Opus Library LLVM and C Wrapper to JavaScript#####
- Execute from --prefix= path used above:
  - ```$ emcc opusjs.c -I include/ -o opuslib.js -L lib/libopus.a -s EXPORTED_FUNCTIONS="[...]"```
- You can now use opuslib.js with the included opus.js helper file in this repository.

