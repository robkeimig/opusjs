function Opus(input_buffer, output_buffer){
	//some constants
	var INPUT_BUFFER_SAMPLES = input_buffer; //number of samples that the input buffers will be allocated for
	var OUTPUT_BUFFER_BYTES = output_buffer; //number of bytes allocated to the encoder output buffer

	//js wrappers for wrapper.c functions
	this._initializeVoip = Module.cwrap('OpusEncoderInitVoip', 'number', ['number', 'number']);
	this._initializeAudio = Module.cwrap('OpusEncoderInitAudio', 'number', ['number', 'number']);
	this._initializeDecoder = Module.cwrap('OpusDecoderInit', 'number', ['number', 'number']);
	this._encodeFloat = Module.cwrap('OpusEncodeFloat', 'number', ['number', 'number', 'number', 'number']);
	this._encodeInteger = Module.cwrap('OpusEncode', 'number', ['number', 'number', 'number', 'number']);
	this._decodeFloat = Module.cwrap('OpusDecodeFloat', 'number', ['number', 'number', 'number', 'number', 'number']);
	this._decodeInteger = Module.cwrap('OpusDecode', 'number', ['number', 'number', 'number', 'number', 'number']);

	//main encoder object
	this._encoder = new Object();

	//floating point encoder input buffer
	this._encoder.inputBufferFloat = new Object();
	this._encoder.inputBufferFloat.Length = INPUT_BUFFER_SAMPLES;
	this._encoder.inputBufferFloat.Bytes = this._encoder.inputBufferFloat.Length * Float32Array.BYTES_PER_ELEMENT;
	this._encoder.inputBufferFloat.Ptr = Module._malloc(this._encoder.inputBufferFloat.Bytes);
	this._encoder.inputBufferFloat.Heap = new Uint8Array(Module.HEAPU8.buffer, this._encoder.inputBufferFloat.Ptr, this._encoder.inputBufferFloat.Bytes);
	console.log('Allocated ' + this._encoder.inputBufferFloat.Bytes + ' bytes for ' + this._encoder.inputBufferFloat.Length + ' sample, 32-bit float encoder input buffer.');

	//fixed point int16 encoder input buffer
	this._encoder.inputBufferInt16 = new Object();
	this._encoder.inputBufferInt16.Length = INPUT_BUFFER_SAMPLES;
	this._encoder.inputBufferInt16.Bytes = this._encoder.inputBufferInt16.Length * Int16Array.BYTES_PER_ELEMENT;
	this._encoder.inputBufferInt16.Ptr = Module._malloc(this._encoder.inputBufferInt16.Bytes);
	this._encoder.inputBufferInt16.Heap = new Uint8Array(Module.HEAPU8.buffer, this._encoder.inputBufferInt16.Ptr, this._encoder.inputBufferInt16.Bytes);
	console.log('Allocated ' + this._encoder.inputBufferInt16.Bytes + ' bytes for ' + this._encoder.inputBufferInt16.Length + ' sample, 32-bit float encoder input buffer.');	

	//output buffer for the encoder (byte array)
	this._encoder.outputBuffer = new Object();
	this._encoder.outputBuffer.Length = OUTPUT_BUFFER_BYTES;
	this._encoder.outputBuffer.Bytes = this._encoder.outputBuffer.Length * Uint8Array.BYTES_PER_ELEMENT;
	this._encoder.outputBuffer.Ptr = Module._malloc(this._encoder.outputBuffer.Bytes);
	this._encoder.outputBuffer.Heap = new  Uint8Array(Module.HEAPU8.buffer, this._encoder.outputBuffer.Ptr, this._encoder.outputBuffer.Bytes);
	console.log('Allocated ' + this._encoder.outputBuffer.Bytes + ' bytes for encoder output buffer.');

	//main decoder object
	this._decoder = new Object();

	//decoder input buffer (byte array)
	this._decoder.inputBuffer = new Object();
	this._decoder.inputBuffer.Length = OUTPUT_BUFFER_BYTES; //maximum possible size of opus data frame
	this._decoder.inputBuffer.Bytes = this._decoder.inputBuffer.Length * Uint8Array.BYTES_PER_ELEMENT;
	this._decoder.inputBuffer.Ptr = Module._malloc(this._decoder.inputBuffer.Bytes);
	this._decoder.inputBuffer.Heap = new Uint8Array(Module.HEAPU8.buffer, this._decoder.inputBuffer.Ptr, this._decoder.inputBuffer.Bytes);
	console.log('Allocated ' + this._decoder.inputBuffer.Bytes + ' bytes for decoder input buffer.');

	//decoder output buffer (floating point)
	this._decoder.outputBufferFloat = new Object();
	this._decoder.outputBufferFloat.Length = INPUT_BUFFER_SAMPLES; //maximum possible pcm frame size before encoding
	this._decoder.outputBufferFloat.Bytes = this._decoder.outputBufferFloat.Length * Float32Array.BYTES_PER_ELEMENT;
	this._decoder.outputBufferFloat.Ptr = Module._malloc(this._decoder.outputBufferFloat.Bytes);
	this._decoder.outputBufferFloat.Heap = new Uint8Array(Module.HEAPU8.buffer, this._decoder.outputBufferFloat.Ptr, this._decoder.outputBufferFloat.Bytes);
	console.log('Allocated ' + this._decoder.outputBufferFloat.Bytes + ' bytes for decoder floating point output buffer.');


	Opus.prototype.initializeVoip = function(sample_rate, channel_count){
		var err = 0;
		console.log('Initializing Opus encoder in VOIP mode. Sample rate: ' + sample_rate + 'hz. Channels: ' + channel_count);
		err = this._initializeVoip(sample_rate, channel_count);
		if(err!==0){
			console.log('Could not initialize Opus encoder in VOIP mode. Errorcode: ' + err);
			return -1;
		}
		err = this._initializeDecoder(sample_rate, channel_count);
		if(err!==0){
			console.log('Could not initialize Opus decoder. Errorcode: ' + err);
			return -1;
		}
		return 0;
	};

	Opus.prototype.initializeAudio = function(sample_rate, channel_count){
		var err = 0;
		console.log('Initializing Opus encoder in audio mode. Sample rate: ' + sample_rate + 'hz. Channels: ' + channel_count);
		err = this._initializeAudio(sample_rate, channel_count);
		if(err!==0){
			console.log('Could not initialize Opus encoder in audio mode. Errorcode: ' + err);
			return -1;
		}
		err = this._initializeDecoder(sample_rate, channel_count);
		if(err!==0){
			console.log('Could not initialize Opus decoder. Errorcode: ' + err);
			return -1;
		}
		return  0;
	};

	Opus.prototype.encodeFloat = function(pcm_data){
		var encoded_bytes = 0;
		this._encoder.inputBufferFloat.Heap.set(new Uint8Array(pcm_data.buffer));
		encoded_bytes = this._encodeFloat(this._encoder.inputBufferFloat.Heap.byteOffset, pcm_data.length,
			this._encoder.outputBuffer.Heap.byteOffset, this._encoder.outputBuffer.Bytes);
		if(encoded_bytes < 1){
			console.log('Could not encode frame of length ' + pcm_data.length);
			return new Uint8Array(); //return empty array []
		}
		return this._encoder.outputBuffer.Heap.subarray(0, encoded_bytes); //return only encoded bytes from buffer
	};

	Opus.prototype.encodeInteger = function(pcm_data){
		var encoded_bytes = 0;
		this._encoder.inputBufferInt16.Heap.set(new Uint8Array(pcm_data.buffer));
		encoded_bytes = this._encodeFloat(this._encoder.inputBufferInt16.Heap.byteOffset, pcm_data.length,
			this._encoder.outputBuffer.Heap.byteOffset, this._encoder.outputBuffer.Bytes);
		if(encoded_bytes < 1){
			console.log('Could not encode frame of length ' + pcm_data.length);
			return new Uint8Array(); //return empty array []
		}
		return this._encoder.outputBuffer.Heap.subarray(0, encoded_bytes); //return only encoded bytes from buffer
	};

	Opus.prototype.decodeFloat = function(opus_data){
		var decoded_samples = 0;
		this._decoder.inputBuffer.Heap.set(new Uint8Array(opus_data));
		decoded_samples = this._decodeFloat(this._decoder.inputBuffer.Heap.byteOffset, opus_data.length,
			this._decoder.outputBufferFloat.Heap.byteOffset, this._decoder.outputBufferFloat.Bytes, 0);
		if(decoded_samples < 0){
			console.log('Could not decode opus frame of size ' + opus_data.length + ' bytes. Error: ' + decoded_samples );
			return new Float32Array();
		}
		return new Float32Array(this._decoder.outputBufferFloat.Heap.buffer, this._decoder.outputBufferFloat.Heap.byteOffset, decoded_samples);
	};
}