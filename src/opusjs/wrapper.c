#include <opus/opus.h>
#include <stdio.h>

OpusEncoder* encoder;

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
	int error;
	error = opus_encode(encoder, pcm, frame_size, data, max_data_bytes);
	return error;
}


int OpusEncodeFloat(const float *pcm, int frame_size, unsigned char* data, opus_int32 max_data_bytes)
{
	int error;
	error = opus_encode_float(encoder, pcm, frame_size, data, max_data_bytes);
	return error;
}

int main(void)
{
	printf("Loaded OpusJS library\n");
	//printf("Testing functionality...\n");
	//int result = 0;

	//result = OpusEncoderInitVoip(48000, 1);
	//printf("Calling OpusEncoderInitVoip(48000, 1)... return code: %d\n", result);
	
	//result = OpusEncoderInitAudio(48000, 1);
	//printf("Calling OpusEncoderInitAudio(48000, 1)... return code: %d\n", result);

	return 0;
}