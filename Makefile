THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

OPUSSRC=src/third_party/opus/1.1
OPUSBUILDDIR=$(THIS_DIR)/build/opus
OPUSLIB=$(OPUSBUILDDIR)/lib/libopus.a
OPUSLIBINC=$(OPUSBUILDDIR)/include 

OPUSJSBUILDDIR=$(THIS_DIR)/build/opusjs
OPUSLIBJS=$(OPUSJSBUILDDIR)/opuslib.js
OPUSJS=src/opusjs/opus.js
OPUSWRAPPER=src/opusjs/wrapper.c

EXPORTEDFUNCTIONS="['_main', '_OpusEncoderInitVoip', '_OpusEncoderInitAudio']"

all: $(OPUSLIBJS)

rebuild_opusjs: 
	rm -rf $(OPUSJSBUILDDIR)
	$(MAKE) $(OPUSLIBJS)
	
$(OPUSLIB):	
	$(info Building Opus library...)
	cd $(OPUSSRC); emconfigure ./configure --prefix=$(OPUSBUILDDIR)
	cd $(OPUSSRC); emmake make clean
	cd $(OPUSSRC); emmake make install

$(OPUSLIBJS): $(OPUSLIB)
	$(info Building OpusJS...)
	mkdir -p $(OPUSJSBUILDDIR)
	emcc $(OPUSWRAPPER) -I $(OPUSLIBINC) -o $(OPUSLIBJS) -L $(OPUSLIB) -s EXPORTED_FUNCTIONS=$(EXPORTEDFUNCTIONS)
	cp $(OPUSJS) $(OPUSJSBUILDDIR)