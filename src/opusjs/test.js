InitializeVoip(48000,1);

var floatarr = new Float32Array(2880);
for(var x=0; x<floatarr.length; x++)
{
	floatarr[x] = 1-(Math.random()*2);
}

console.log(EncodePCMFloat(floatarr));