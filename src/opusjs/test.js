window.onload = function(){
	InitializeUserMedia();
}

var audioContext = null;
var audioContext2 = null;

function InitializeUserMedia(){
	if(navigator.getUserMedia){
		console.log('Opera');
		context_type = 'opera';
		//todo impl
	}
	else if(navigator.webkitGetUserMedia){
		console.log('webkit');
		context_type = 'webkit';
		audioContext = new window["webkitAudioContext"]();
		audioContext2 = new window["webkitAudioContext"]();
		navigator.webkitGetUserMedia({audio: true}, GetUserMediaSuccess, function(){});
	}
	else if(navigator.mozAudioContext){
		console.log('moz');
		context_type = 'moz';
		//todo impl
	}
	else{
		return null;
	}
}

var pbcbuffer = new CircularBuffer(1024*1024);

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

function GetUserMediaSuccess(stream){
	console.log('Got user media!');
	console.log('Firing up Opus...');
	var cbuffer = new CircularBuffer(32768);	//circular buffer for framing pcm data

	var opus = new Opus();
	var MIC_READ_SIZE = 1024;
	var OPUS_ENCODE_SIZE = 480;
	var OPUS_SAMPLERATE = 48000;
	var RECORD_SAMPLERATE = audioContext.sampleRate
	var PLAYBACK_SAMPLERATE = 44100;
	console.log(RECORD_SAMPLERATE);
	opus.initializeVoip(OPUS_SAMPLERATE, 1);

	var mic = audioContext.createMediaStreamSource( stream );
	var processor = audioContext.createScriptProcessor( MIC_READ_SIZE, 1, 1 );
	mic.connect(processor);
	processor.connect(audioContext.destination);

	var player = audioContext2.createScriptProcessor( 4096, 0, 1);
	
	var encoder_resampler = new Resampler(RECORD_SAMPLERATE, OPUS_SAMPLERATE, 1, 1024*512, false);
	var decoder_resampler = new Resampler(OPUS_SAMPLERATE, PLAYBACK_SAMPLERATE, 1, 1024*512, false);
	var xas = new XAudioServer(1, PLAYBACK_SAMPLERATE, 1024, 8192, function(requested){return getSamples(requested);}, 1, function(){});
	processor.onaudioprocess = function (event) {
		var mic_data = event.inputBuffer.getChannelData(0); //read data from input buffer

		//resample mic_data to opus_samplerate
		resampled_mic_data = encoder_resampler.resampler(mic_data);

		//add resampled mic data to the buffer for encoding
		for(var x=0; x<resampled_mic_data.length; x++){
			cbuffer.write(resampled_mic_data[x]);
		}

		//encode data in buffer when possible
		while(cbuffer.getCount()>=OPUS_ENCODE_SIZE){
			var frame = new Float32Array(OPUS_ENCODE_SIZE);
			for(var x=0; x<OPUS_ENCODE_SIZE; x++){
				frame[x] = cbuffer.read();
			}
			var encoded = opus.encodeFloat(frame);

			//test decoding and playback
			var decoded = opus.decodeFloat(encoded);
			var resampled_decoded = decoder_resampler.resampler(decoded);
			for(var x=0; x<resampled_decoded.length; x++){
				pbcbuffer.write(resampled_decoded[x]);
			}
			// for(var x=0; x<decoded.length; x++){
			// 	pbcbuffer.write(decoded[x]);
			// }
			xas.executeCallback();
		}

		
	}
}