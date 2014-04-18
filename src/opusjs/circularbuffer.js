function CircularBuffer(size){
	this._size = size;
	this._start = 0;
	this._count = 0;
	this._array = new Float32Array(this._size);

	CircularBuffer.prototype.getCount = function(){
		return this._count;
	};

	CircularBuffer.prototype.write = function(element){
		var end = (this._start + this._count) % this._size;
		this._array[end] = element;
		if(this._count === this._size){
			//console.log('Buffer overflow!');
			return;
		} else {
			this._count += 1;
		}
	};

	CircularBuffer.prototype.read = function(){
		if(this._count<=0){
			//console.log('Buffer underflow!');
			return null;
		}
		var result = this._array[this._start];
		this._start = (this._start + 1) % this._size;
		this._count -= 1;
		return result;
	};
}