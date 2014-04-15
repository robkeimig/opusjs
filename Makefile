THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

OPUSSRC=src/third_party/opus/1.1
BUILDDIR=$(THIS_DIR)/build

all: opuslib

opuslib:
	cd $(OPUSSRC); emconfigure ./configure --prefix=$(BUILDDIR)
	cd $(OPUSSRC); emmake make install