#include <opus/opus.h>
#include <stdio.h>

int OpusCreateEncoder(int fs, int channels, int type)
{
	int error;
	OpusEncoder* enc;
	switch(type)
	{
		case 0:
		enc = opus_encoder_create(fs, channels, OPUS_APPLICATION_VOIP, &error);
		break;

		case 1:
		enc = opus_encoder_create(fs, channels, OPUS_APPLICATION_AUDIO, &error);
		break;	

		default:
		printf("Invalid encoder type specified. Must be 0 (VOIP) or 1 (Audio)\n");
		return -1;
	}	
	if(error)
	{
		printf("Failed to create encoder. Error: %d\n", error);
		return error;
	}
	return (int) enc;
}

int OpusCreateDecoder(int fs, int channels)
{
	int error;
	OpusDecoder* dec = opus_decoder_create(fs, channels, &error);
	if(error)
	{
		printf("Failed to create decoder. Error: %d\n", error);
		return error;
	}
	return (int) dec;
}

void OpusDestroyEncoder(int encoder)
{
	opus_encoder_destroy((OpusEncoder*) encoder);
}

void OpusDestroyDecoder(int decoder)
{
	opus_decoder_destroy((OpusDecoder*) decoder);
}

int OpusGetBitrate(int encoder)
{
	opus_int32 rate;
	opus_encoder_ctl((OpusEncoder*) encoder, OPUS_GET_BITRATE(&rate));
	return rate;
}

int OpusSetBitrate(int encoder, int rate)
{
	int err;
	err = opus_encoder_ctl((OpusEncoder*) encoder, OPUS_SET_BITRATE(rate));
	if(err)
		printf("Could not set bitrate of encoder to %d\n", rate);
	return err;
}

int OpusEncodeFloat(int encoder, const float *pcm, int frame_size, unsigned char* data, opus_int32 max_data_bytes)
{
	return opus_encode_float((OpusEncoder*) encoder, pcm, frame_size, data, max_data_bytes);
}

int OpusDecodeFloat(int decoder, const unsigned char* data, opus_int32 len, float* pcm, int frame_size, int decode_fec)
{
	return opus_decode_float((OpusDecoder*) decoder,  data, len, pcm, frame_size, decode_fec);
}

int main(void)
{
	printf("Loaded Opus Codec library.\n");
	printf("Version: %s\n", opus_get_version_string());
	int enc = OpusCreateEncoder(48000, 1, 0);
	int dec = OpusCreateDecoder(48000, 1);
	OpusSetBitrate(enc, 1024*16);
	printf("Performing codec test on 2880 samples @ 48khz\n");
	float pcm[2880];
	for(int x=0;x<2880;x++)
	{ pcm[x] = x/2880.0; }
	unsigned char buff[2880];
	float out[2880];
	printf("Encoding...\n");
	int result = OpusEncodeFloat(enc, pcm, 2880, buff, 2880); 
	printf("Encoded bytes: %d\n", result);
	printf("Decoding...\n");
	result = OpusDecodeFloat(dec, buff, result, out, 2880, 0);
	printf("Decoded frames: %d\n", result);
	return 0;
}