window.onload = function(){
	InitializeUserMedia();
}

var audioContext = null;

function InitializeUserMedia(){
	audioContext = new window["webkitAudioContext"]();
	navigator.webkitGetUserMedia({audio: true}, GetUserMediaSuccess);
}

function GetUserMediaSuccess(stream){
	console.log('Got user media!');
	console.log(audioContext);
	var MIC_READ_SIZE = 1024;
	var microphone = audioContext.createMediaStreamSource(stream);
	var compressor = audioContext.createScriptProcessor( MIC_READ_SIZE, 2, 2 );
	var player = audioContext.createScriptProcessor( MIC_READ_SIZE, 2, 2);
	microphone.connect(compressor);
	player.connect(audioContext.destination);
	compressor.connect(audioContext.destination);
	compressor.onaudioprocess = compressor_loop;
	player.onaudioprocess = playback_loop;
}

var MIC_READ_SIZE = 1024;
var OPUS_ENCODE_SIZE = 480;
var OPUS_SAMPLERATE = 48000;
var PLAYBACK_SAMPLERATE = 44100;
var cbuffer = new CircularBuffer(16384);
var pbcbuffer = new CircularBuffer(16384);
var totalenc = 0;

var opus = new Opus(4096, 64);
opus.initializeAudio(OPUS_SAMPLERATE, 1);

window.setInterval(function(){console.log('Encoded ' + totalenc + ' bytes');}, 2000);

var playback_loop = function(e){
	var output_l = e.outputBuffer.getChannelData(0);
	var output_r = e.outputBuffer.getChannelData(1);
	var data = getSamples(MIC_READ_SIZE);
	for(var x=0; x<MIC_READ_SIZE; x++){
		output_l[x] = data[x];
		output_r[x] = data[x];
	}
};

var compressor_loop = function(e){
	var encoder_resampler = new Resampler(48000, OPUS_SAMPLERATE, 1, 1024*64, false);
	var decoder_resampler = new Resampler(OPUS_SAMPLERATE, PLAYBACK_SAMPLERATE, 1, 1024*64, false);
	var input = e.inputBuffer.getChannelData(0);
	var resampled_input = encoder_resampler.resampler(input);

	//add resampled mic data to the buffer for encoding
	for(var x=0; x<resampled_input.length; x++){
		cbuffer.write(resampled_input[x]);
	}

	//encode data in buffer when possible
	while(cbuffer.getCount()>=OPUS_ENCODE_SIZE){
		var frame = new Float32Array(OPUS_ENCODE_SIZE);
		for(var x=0; x<OPUS_ENCODE_SIZE; x++){
			frame[x] = cbuffer.read();
		}
		var encoded = opus.encodeFloat(frame);
		totalenc += encoded.length;

		var decoded = opus.decodeFloat(encoded);
		for(var x=0; x<decoded.length; x++){
 			pbcbuffer.write(decoded[x]);
 		}
	}
};
    
function getSamples(requested){
	if(pbcbuffer.getCount()>=requested){
		var data = new Float32Array(requested);	
		for(var x=0; x<requested; x++){
			data[x] = pbcbuffer.read();
		}
		return data;
	}
	var data = new Float32Array(pbcbuffer.getCount());
	for(var x=0; x<pbcbuffer.getCount(); x++){
		data[x] = pbcbuffer.read();
	}
	return data;
};


// function GetUserMediaSuccess(stream){


// 	var mic = audioContext.createMediaStreamSource( stream );
// 	var processor = audioContext.createScriptProcessor( MIC_READ_SIZE, 1, 1 );
// 	mic.connect(processor);
// 	processor.connect(audioContext.destination);

// 	//var encoder_resampler = new Resampler(RECORD_SAMPLERATE, OPUS_SAMPLERATE, 1, 1024*64, false);
// 	//var decoder_resampler = new Resampler(OPUS_SAMPLERATE, PLAYBACK_SAMPLERATE, 1, 1024*64, false);
// 	//var xas = new XAudioServer(1, PLAYBACK_SAMPLERATE, 1024, 8192, function(requested){return getSamples(requested);}, 1, function(){});
// 	processor.onaudioprocess = function (event) {
// 		var mic_data = event.inputBuffer.getChannelData(0); //read data from input buffer

// 		//resample mic_data to opus_samplerate
// 		//resampled_mic_data = encoder_resampler.resampler(mic_data);

// 		//add resampled mic data to the buffer for encoding
// 		for(var x=0; x<mic_data.length; x++){
// 			cbuffer.write(mic_data[x]);
// 		}

// 		//encode data in buffer when possible
// 		while(cbuffer.getCount()>=OPUS_ENCODE_SIZE){
// 			var frame = new Float32Array(OPUS_ENCODE_SIZE);
// 			for(var x=0; x<OPUS_ENCODE_SIZE; x++){
// 				frame[x] = cbuffer.read();
// 			}
// 			var encoded = opus.encodeFloat(frame);
// 			totalenc += encoded.length;
// 			//test decoding and playback
// 			var decoded = opus.decodeFloat(encoded);
// 			//var resampled_decoded = decoder_resampler.resampler(decoded);
// 			for(var x=0; x<decoded.length; x++){
// 				//pbcbuffer.write(decoded[x]);
// 			}
// 			// for(var x=0; x<decoded.length; x++){
// 			// 	pbcbuffer.write(decoded[x]);
// 			// }
// 			//xas.executeCallback();
// 		}

		
// 	}
// }