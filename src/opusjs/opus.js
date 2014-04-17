//js wrappers for wrapper.c functions
OpusInitializeVoip = Module.cwrap('OpusEncoderInitVoip', 'number', ['number', 'number']);
OpusInitializeAudio = Module.cwrap('OpusEncoderInitAudio', 'number', ['number', 'number']);
OpusInitializeDecoder = Module.cwrap('OpusDecoderInit', 'number', ['number, 'number']);
OpusEncodeFloat = Module.cwrap('OpusEncodeFloat', 'number', ['number', 'number', 'number', 'number']);

//encoder - 32 bit float input buffer
encoderInputBufferFloat = new Object();
encoderInputBufferFloat.Length = 4096;
encoderInputBufferFloat.Bytes = encoderInputBufferFloat.Length * Float32Array.BYTES_PER_ELEMENT;
encoderInputBufferFloat.Ptr = Module._malloc(encoderInputBufferFloat.Bytes);	//get pointer to 'heap'
encoderInputBufferFloat.Heap = new Uint8Array(Module.HEAPU8.buffer, encoderInputBufferFloat.Ptr, encoderInputBufferFloat.Bytes);
console.log('Allocated ' + encoderInputBufferFloat.Bytes + ' bytes for ' + encoderInputBufferFloat.Length + ' sample, 32-bit float encoder input buffer.');
	
//encoder - output buffer
encoderOutputBuffer = new Object();
encoderOutputBuffer.Length = 8192;
encoderOutputBuffer.Bytes = encoderOutputBuffer.Length * Uint8Array.BYTES_PER_ELEMENT;
encoderOutputBuffer.Ptr = Module._malloc(encoderOutputBuffer.Bytes);
encoderOutputBuffer.Heap = new Uint8Array(Module.HEAPU8.buffer, encoderOutputBuffer.Ptr, encoderOutputBuffer.Bytes);
console.log('Allocated ' + encoderOutputBuffer.Bytes + ' bytes for encoder output buffer.');

function InitializeVoip(sample_rate, channels){
	var err = 0;
	console.log('Initializing Opus VOIP encoder at ' + sample_rate + 'hz w/ ' + channels + ' channels.');
	err = OpusInitializeVoip(sample_rate, channels);
	if(err!==0) { console.log('Could not initialize Opus VOIP encoder. Errorcode: ' + err); }
};

function EncodePCMFloat(pcmdata) {
	var frame_length = pcmdata.length;
	var encoded_bytes = 0;
	encoderInputBufferFloat.Heap.set(new Uint8Array(pcmdata.buffer));
	encoded_bytes = OpusEncodeFloat(encoderInputBufferFloat.Heap.byteOffset, frame_length, 
					encoderOutputBuffer.Heap.byteOffset, encoderOutputBuffer.Bytes);
	if(encoded_bytes < 1) { 
		console.log('Could not encode frame of length ' + frame_length); 
		return new Uint8Array();
	}
	return encoderOutputBuffer.Heap.subarray(0, encoded_bytes);
};

