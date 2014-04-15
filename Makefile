THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

OPUSSRC=src/third_party/opus/1.1
OPUSBUILDDIR=$(THIS_DIR)/build/opus
OPUSLIBJS=src/opusjs/opuslib.js

all: $(OPUSLIBJS)

$(OPUSLIBJS): $(OPUSBUILDDIR)/lib/libopus.a 
	
$(OPUSBUILDDIR)/lib/libopus.a:
	cd $(OPUSSRC); emconfigure ./configure --prefix=$(OPUSBUILDDIR)
	cd $(OPUSSRC); emmake make clean
	cd $(OPUSSRC); emmake make install
