var MIC_READ_SIZE = 512;
var OPUS_ENCODE_SIZE = 480;
var OPUS_SAMPLERATE = 48000;
var PLAYBACK_SAMPLERATE = 44100;
var cbuffer = new CircularBuffer(1024*64);
var pbcbuffer = new CircularBuffer(1024*64);
var totalenc = 0;
var opus = new Opus(16384, 1024);
opus.initializeAudio(OPUS_SAMPLERATE, 1);

window.onload = function(){
	
	audioContext = new window["webkitAudioContext"]();
	var player = audioContext.createScriptProcessor( MIC_READ_SIZE, 2, 2);
	var decoder_resampler = new Resampler(OPUS_SAMPLERATE, audioContext.sampleRate, 1, 1024*64, false);
	player.connect(audioContext.destination);
	player.onaudioprocess = playback_loop;

	socket.on('audio', function(data) {
		var b64samples = data.opusdata;
		var u8_2 = new Uint8Array(atob(b64samples).split("").map(function(c) {
	    return c.charCodeAt(0); }));
	    var decoded = opus.decodeFloat(u8_2);
	    var decoded_resampled = decoder_resampler.resampler(decoded);
		for(var x=0; x<decoded_resampled.length; x++){
			pbcbuffer.write(decoded_resampled[x]);
		}
	});

	InitializeUserMedia();
}

var socket = io.connect('http://479340aa.ngrok.com');
socket.on('news', function (data) {
	console.log(data);
});

var audioContext = null;

function InitializeUserMedia(){
	
	navigator.webkitGetUserMedia({audio: true}, GetUserMediaSuccess);
}

function GetUserMediaSuccess(stream){
	console.log('Got user media!');
	console.log(audioContext);
	var MIC_READ_SIZE = 1024;
	var microphone = audioContext.createMediaStreamSource(stream);
	var compressor = audioContext.createScriptProcessor( MIC_READ_SIZE, 2, 2 );
	
	microphone.connect(compressor);
	
	compressor.connect(audioContext.destination);
	compressor.onaudioprocess = compressor_loop;
}
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
	var encoder_resampler = new Resampler(audioContext.sampleRate, OPUS_SAMPLERATE, 1, 1024*64, false);
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
		var b64encoded = btoa(String.fromCharCode.apply(null, encoded));
		socket.emit('audio', { opusdata: b64encoded });
		totalenc += encoded.length;
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