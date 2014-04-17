#include <opus/opus.h>
#include <stdio.h>

OpusEncoder* encoder;
OpusDecoder* decoder;

int OpusDecoderInit(int fs, int channels)
{
	int error;
	opus_decoder_destroy(decoder);
	decoder = opus_decoder_create(fs, channels, &error);
	return error;
}

int OpusDecode(const unsigned char* data, opus_int32 len, opus_int16 *pcm, int frame_size, int decode_fec)
{
	return opus_decode(decoder, data, len, pcm, frame_size, decode_fec);
}

int OpusDecodeFloat(const unsigned char* data, opus_int32 len, float* pcm, int frame_size, int decode_fec)
{
	return opus_decode_float(decoder, data, len, pcm, frame_size, decode_fec);
}

int OpusEncoderInitVoip(int fs, int channels)
{
	int error;
	opus_encoder_destroy(encoder);
	encoder = opus_encoder_create(fs, channels, OPUS_APPLICATION_VOIP, &error);
	return error;
}

int OpusEncoderInitAudio(int fs, int channels)
{
	int error;
	opus_encoder_destroy(encoder);
	encoder = opus_encoder_create(fs, channels, OPUS_APPLICATION_AUDIO, &error);
	return error;
}

int OpusEncode(const opus_int16 *pcm, int frame_size, unsigned char* data, opus_int32 max_data_bytes)
{
	return opus_encode(encoder, pcm, frame_size, data, max_data_bytes);
}


int OpusEncodeFloat(const float *pcm, int frame_size, unsigned char* data, opus_int32 max_data_bytes)
{
	int result = 0;
	result = opus_encode_float(encoder, pcm, frame_size, data, max_data_bytes);
	return result;
}

int main(void)
{
	printf("Loaded Opus Codec library. Version: %s\n", "test");
	//printf("Testing functionality...\n");
	//int result = 0;

	//result = OpusEncoderInitVoip(48000, 1);
	//printf("Calling OpusEncoderInitVoip(48000, 1)... return code: %d\n", result);
	
	//result = OpusEncoderInitAudio(48000, 1);
	//printf("Calling OpusEncoderInitAudio(48000, 1)... return code: %d\n", result);

	return 0;
}