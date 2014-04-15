opusjs
======

Javascript and wrappers for the standard opus codec implementation.

###Build Steps (Ubuntu)###
- Obtain LLVM 3.2 - http://llvm.org/releases/download.html
- tar -xvf to location of your choosing.
- Add llvm bin folder to your path (whatever method you enjoy).
- Make sure path is correct: ```$ emcc --version``` should return information.

#####Building the Opus Codec Library w/ LLVM#####
- Obtain the Opus codec v1.1 source - http://downloads.xiph.org/releases/opus/opus-1.1.tar.gz
- tar -xvf to location of your choosing.
- cd into the opus library directory
- Execute: ```$ emconfigure ./configure --prefix=<wherever you want it to go>```
- Open the generated config.h file and comment out the ```#define HAVE___MALLOC_HOOK 1``` line if it is set
- Execute: ```$ emmake make install```

