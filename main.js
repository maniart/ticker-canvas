// request animation fram shim by Paul Irish
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

// cancel request animation frame shim by Paul Irish
window.cancelRequestAnimFrame = (function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

// ticker module
var ticker = (function(w, d, undefined, _) {

	// CONST
	var W = 320
	  , H = 40;

	// Vars
	var canvas = d.querySelector('#canvas')
		, ctx = canvas.getContext('2d')
		, textCache = [
			'Read This.',
			'ISIS Devours its own',
			'UP NEXT: Inside a serial killer\'s playground',
			'Inside a serial killer\'s playground'
		];	
	
	// Title Class
	function Title(config) {
		this.x = config.x;
		this.y = config.y;
		this.text = config.text;
		this.color = config.color;
		this.ctx = config.ctx;
		this.rAf = null;
		this.noop = function() {};
	}

	Title.prototype.draw = function draw() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillText(this.text, this.x, this.y);
		return this;
	};

	Title.prototype.move = function move(coords) {
		this.x = coords.x;
		this.y = coords.y;
		return this;
	};

	Title.prototype.clear = function clear() {
		var ctx = this.ctx;
		ctx.fillStyle = 'rgb(235, 235, 235)';
		ctx.fillRect(0, 0, W, H);
		return this;
	}

	Title.prototype.stop = function stop(done) {
		done = done || this.noop;
		cancelRequestAnimFrame(this.rAf);
		this.rAf = null;
		done();
		return this;
	};

	Title.prototype.animate = function animate(to, velocity, direction, done) {
		var animate = _.bind(this.animate, this, to, velocity, direction, done);

		this.rAf = requestAnimFrame(animate);

		this
			.clear()
			.update(velocity, direction)
			.draw();

		
		if(direction === 'down') {
			if(this.y >= to)  {
				this.stop(done);
			}
		} else  {
			if(this.y <= to) {
				this.stop(done);	
			} 
		}	
		
		return this;
	};

	Title.prototype.update = function update(velocity, direction) {
		this.y = direction === 'up' ? this.y - velocity : this.y + velocity;	
		return this;
	};

	Title.create = function create(config) {
		return new this(config);
	};	

	// Ticker class
	function Ticker(config) {

		var self = this;
		
		// props
		this.index = 0;
	    this.ctx = config.ctx;
		this.velocity = config.velocity;
		this.bgColor = config.bgColor;
		this.stageWidth = config.stageWidth;
		this.stageHeight = config.stageHeight;
	    this.itemHeight = config.itemHeight; 
	    this.items = [];
	   	
	   	// const 
	    this.OFF_SCREEN_UP = -1 * this.itemHeight;
	    this.OFF_SCREEN_DOWN = this.stageHeight + this.itemHeight;
	    this.VERTICAL_CENTER = 25;

	    _(textCache).each(function(text) {
	    	self.items.push(Title.create({
	    		text: text,
	    		x: 10,
	    		y: 25,
				ctx: ctx,
				color: '#000',
				font: '12pt Helvetica'
	    	}));	
	    });

	}

	Ticker.prototype.setIndex = function setIndex(newIndex) {
		this.index = newIndex;
		return this;
	};

	Ticker.prototype.getIndex = function getIndex() {
		return this.index;
	};

	Ticker.prototype.clear = function clear() {
		var ctx = this.ctx;
		ctx.fillStyle = this.bgColor,
		ctx.fillRect(0, 0, this.stageWidth, this.stageHeight);	
		return this;
	};

	Ticker.prototype.goTo = function goTo(destinationIndex, direction) {
		var self = this;
		
		this.
			animate(this.index, direction === 'up' ? self.OFF_SCREEN_UP : self.OFF_SCREEN_DOWN, direction, function() {
				self.items[destinationIndex]
					.move({x:10, y: direction === 'up' ? self.OFF_SCREEN_DOWN : self.OFF_SCREEN_UP})
					.draw()
					.animate(self.VERTICAL_CENTER, self.velocity, direction);
					
			})
			.setIndex(destinationIndex);
	
		return this;
	};

	Ticker.prototype.animate = function animate(index, to, direction, done) {
		this.items[index].animate(to, this.velocity, direction, done);
		return this;
	};

	Ticker.prototype.replace = function replace(index, item) {
	    this
	        .remove(index)
	        .insert(index, item);
	    return this;
	};

	Ticker.prototype.insert = function insert(index, item) {
	    this.items.splice(index, 0, item);
	    return this;
	};

	Ticker.prototype.remove = function remove(index) {
	    this.items.splice(index, 1);
	    return this;
	};

	Ticker.prototype.next = function next(direction) {
	    this.goTo(this.getIndex() === this.items.length - 1 ? 0 : this.getIndex() + 1, direction);
	    return this;
	};

	Ticker.prototype.prev = function prev(direction) {
	    this.goTo(this.getIndex() === 0 ? this.items.length - 1 : this.getIndex() - 1, direction);
	    return this;
	};

	Ticker.create = function create(config) {
		return new this(config);
	};


	// clear the stage
	function clear() {
		ctx.fillStyle = 'rgb(235, 235, 235)';
		ctx.fillRect(0, 0, W, H);	
	};

	// Update. called in a loop
	function update() {
		requestAnimFrame(update);
	}

	// Initialize
	function init() {
		console.log('Initializing');
		clear();
		w.ticker = Ticker.create({
			ctx: ctx,
			bgColor: 'rgb(235, 235, 235)',
			stageWidth: W,
			stageHeight: H,
			velocity: 2,
			itemHeight: 30	
		});

		update();
	}

	return {
		init: init
	};

}(window, document, undefined, _));


// kickoff
window.onload = ticker.init;