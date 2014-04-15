CC=emcc
THIRDPARTY=src/third_party
OPUSVER=1.1
OPUSSRC=$(THIRDPARTY)/opus/$(OPUSVER)
EMCONF=emconfigure
all: opuslib

opuslib: 
	$(EMCONF) src/third_party/.configure --prefix=build/opuslib
