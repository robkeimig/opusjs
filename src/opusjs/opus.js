OpusInitializeVoip = Module.cwrap('OpusEncoderInitVoip', 'number', ['number', 'number']);
OpusInitializeAudio = Module.cwrap('OpusEncoderInitAudio', 'number', ['number', 'number']);
OpusEncodeFloat = Module.cwrap('OpusEncodeFloat', 'number', ['number', 'number', 'number', 'number']);
OpusEncode = Module.cwrap('OpusEncode', 'number', ['number', 'number', 'number', 'number']);
OpusDecoderInit = Module.cwrap('OpusDecoderInit', 'number', ['number', 'number']);
OpusDecodeFloat = Module.cwrap('OpusDecodeFloat', 'number', ['number', 'number', 'number', 'number', 'number']);
OpusDecode = Module.cwrap('OpusDecode', 'number', ['number', 'number', 'number', 'number', 'number']);

//Allocate input buffer
var EncoderInputBuffer = new Object();
EncoderInputBuffer.Length = 4096*4;
EncoderInputBuffer.Bytes = EncoderInputBuffer.Length * Int16Array.BYTES_PER_ELEMENT;
EncoderInputBuffer.Ptr = Module._malloc(EncoderInputBuffer.Bytes);
EncoderInputBuffer.Heap = new Uint8Array(Module.HEAPU8.buffer, EncoderInputBuffer.Ptr, EncoderInputBuffer.Bytes);
console.log('Allocated ' + EncoderInputBuffer.Bytes + ' bytes for int16 encoder input buffer.');

//Allocate float input buffer
var EncoderInputBufferFloat = new Object();
EncoderInputBufferFloat.Length = 4096*4;
EncoderInputBufferFloat.Bytes = EncoderInputBufferFloat.Length * Float32Array.BYTES_PER_ELEMENT;
EncoderInputBufferFloat.Ptr = Module._malloc(EncoderInputBufferFloat.Bytes);
EncoderInputBufferFloat.Heap = new Uint8Array(Module.HEAPU8.buffer, EncoderInputBufferFloat.Ptr, EncoderInputBufferFloat.Bytes);
console.log('Allocated ' + EncoderInputBufferFloat.Bytes + ' bytes for float encoder input buffer.');

//Allocate output buffer
var EncoderOutputBuffer = new Object();
EncoderOutputBuffer.Length = 8192*16;
EncoderOutputBuffer.Bytes = EncoderOutputBuffer.Length * Uint8Array.BYTES_PER_ELEMENT;
EncoderOutputBuffer.Ptr = Module._malloc(EncoderOutputBuffer.Bytes);
EncoderOutputBuffer.Heap = new Uint8Array(Module.HEAPU8.buffer, EncoderOutputBuffer.Ptr, EncoderOutputBuffer.Bytes);
console.log('Allocated ' + EncoderOutputBuffer.Bytes + ' bytes for encoder output buffer.');

function EncodePCMFloat(pcmdata){
	EncoderInputBufferFloat.Heap.set(new Uint8Array(pcmdata.buffer));
	var result = OpusEncodeFloat(EncoderInputBufferFloat.Heap.byteOffset, pcmdata.length,  EncoderOutputBuffer.Heap.byteOffset, EncoderOutputBuffer.Bytes);
	//console.log('Encoding frame of size ' + pcmdata.length + '. Result: ' + result);
	return result;
}

function EncodePCM(pcmdata){
	EncoderInputBuffer.Heap.set(new Uint8Array(pcmdata.buffer));
	var result = OpusEncode(EncoderInputBuffer.Heap.byteOffset, pcmdata.length,  EncoderOutputBuffer.Heap.byteOffset, EncoderOutputBuffer.Bytes);
	//console.log('Encoding frame of size ' + pcmdata.length + '. Result: ' + result);
	return result;
}

function DecodeOpus(opusdata){
	DecoderInputBuffer.Heap.set(new Uint8Array(opusdata.buffer));
	#todo
}

var samplecount=480;
var runcount=1000;
var samplerate = 48000;
var inputsamplerate = 44100;
var channels = 1;
var floatarr = new Float32Array(samplecount);
var intarr = new Int16Array(samplecount);

for(var x=0; x<floatarr.length; x++)
{
	floatarr[x] = 1-(Math.random());
	if(floatarr[x] >= 0){
		intarr[x] = floatarr[x] * 32767;
	} else {
		intarr[x] = floatarr[x] * 32768;
	}
}

var resampler = new Resampler(inputsamplerate, samplerate, channels, 1000, false);
var resampledfloatarr = resampler.resampler(floatarr);
OpusInitializeVoip(samplerate, channels);
console.log('Processing ' + samplecount*runcount + ' samples ' + (samplecount*runcount)/samplerate + ' seconds of audio data');
console.log('start');
var totalencbytes = 0;
for(var x=0; x<runcount; x++)
{
	totalencbytes += EncodePCMFloat(floatarr);
}

console.log('done');
console.log('total encoded bytes: ' + totalencbytes);