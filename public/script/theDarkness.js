// Shim courtesy of Paul Irish & Jerome Etienne
window.cancelRequestAnimFrame = ( function() {
		return window.cancelAnimationFrame           ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelRequestAnimationFrame    ||
				window.oCancelRequestAnimationFrame      ||
				window.msCancelRequestAnimationFrame     ||
				clearTimeout
} )();

window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame   || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element){
						return window.setTimeout(callback, 1000 / 60);
				};
})();


/**
 * Copyright (C) 2011 by Justin Windle
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * --------------------
 * SETTINGS
 * --------------------
 */

var CONFIG  = {};
var PRESETS = {};
var RENDER_MODES = {
	Darkness:  'darkness',
	Segmented: 'segmented',
	Sketched:  'sketched'
};

PRESETS['Vines']          = {RENDER_MODE:RENDER_MODES.Darkness,BRANCH_PROBABILITY:0.2572,MAX_CONCURRENT:160,NUM_BRANCHES:3,MIN_RADIUS:0.1,MAX_RADIUS:39,MIN_WANDER_STEP:1.0184,MAX_WANDER_STEP:0.1702,MIN_GROWTH_RATE:15,MAX_GROWTH_RATE:11.8251,MIN_SHRINK_RATE:0.99656,MAX_SHRINK_RATE:0.91265,MIN_DIVERGENCE:0.5101,MAX_DIVERGENCE:0.37466};

function configure(settings) {
	for(var prop in settings) {
		CONFIG[prop] = settings[prop];
	}
}

configure(PRESETS['Vines']);

/**
 * --------------------
 * UTILS
 * --------------------
 */

var PI           = Math.PI;
var TWO_PI       = Math.PI * 2;
var HALF_PI      = Math.PI / 2;
var BRANCHES     = [];

function random(min, max) {
	return min + Math.random() * (max - min);
}

/**
 * --------------------
 * BRANCH
 * --------------------
 */

var Branch = function(x, y, theta, radius, scale, generation) {

	this.x           = x;
	this.y           = y;
	this.ox          = x;
	this.oy          = y;
	this.x1          = NaN;
	this.x2          = NaN;
	this.y1          = NaN;
	this.y2          = NaN;
	this.scale       = scale || 1.0;
	this.theta       = theta;
	this.oTheta      = theta;
	this.radius      = radius;
	this.generation  = generation || 1;
	this.growing     = true;
	this.age         = 0;

	this.wanderStep  = random(CONFIG.MIN_WANDER_STEP, CONFIG.MAX_WANDER_STEP);
	this.growthRate  = random(CONFIG.MIN_GROWTH_RATE, CONFIG.MAX_GROWTH_RATE);
	this.shrinkRate  = random(CONFIG.MIN_SHRINK_RATE, CONFIG.MAX_SHRINK_RATE);
}

Branch.prototype = {

	update: function() {
		
		if(this.growing) {
			
			this.ox = this.x;
			this.oy = this.y;
			this.oTheta = this.theta;

			this.theta += random(-this.wanderStep, this.wanderStep);

			this.x += Math.cos(this.theta) * this.growthRate * this.scale;
			this.y += Math.sin(this.theta) * this.growthRate * this.scale;

			this.scale  *= this.shrinkRate;

			// Branch
			if(BRANCHES.length < CONFIG.MAX_CONCURRENT && Math.random() < CONFIG.BRANCH_PROBABILITY) {
				
				var offset = random(CONFIG.MIN_DIVERGENCE, CONFIG.MAX_DIVERGENCE);
				var theta  = this.theta + offset * (Math.random() < 0.5 ? 1 : -1);
				var scale  = this.scale * 0.95;
				var radius = this.radius * scale;
				var branch = new Branch(this.x, this.y, theta, radius, scale);

				branch.generation = this.generation + 1;

				BRANCHES.push(branch);
			}

			// Limit
			if(this.radius * this.scale <= CONFIG.MIN_RADIUS) {
				this.growing = false;
			}

			this.age++;
		}
	},

	render: function(context) {

		if(this.growing) {

			var x1, x2, y1, y2;
			var scale = this.scale;
			var radius = this.radius * scale;

			context.save();

			switch(CONFIG.RENDER_MODE) {

				case RENDER_MODES.Segmented :

					// Draw outline
					context.beginPath();
					context.moveTo(this.ox, this.oy);
					context.lineTo(this.x, this.y);
					
					if(radius > 5.0) {
						context.shadowOffsetX = 1;
						context.shadowOffsetY = 1;
						context.shadowBlur    = scale;
						context.shadowColor   = 'rgba(0,0,0,0.05)';	
					}
					
					context.lineWidth = radius + scale;
					context.strokeStyle = '#000';
					context.lineCap = 'round';
					context.stroke();
					context.closePath();
					
					// Draw fill
					context.beginPath();
					context.moveTo(this.ox, this.oy);
					context.lineTo(this.x, this.y);

					context.lineWidth = radius;
					context.strokeStyle = '#FFF';
					context.lineCap = 'round';
					context.stroke();

					context.closePath();

					break;
				
				case RENDER_MODES.Sketched :

					radius *= 0.5;
					radius += 0.5;

					x1 = this.x + Math.cos(this.theta - HALF_PI) * radius;
					x2 = this.x + Math.cos(this.theta + HALF_PI) * radius;

					y1 = this.y + Math.sin(this.theta - HALF_PI) * radius;
					y2 = this.y + Math.sin(this.theta + HALF_PI) * radius;

					context.lineWidth = 0.5 + scale;
					context.strokeStyle = '#000';
					context.fillStyle = '#FFF';
					context.lineCap = 'round';
					
					// Starting point
					if(this.generation === 1 && this.age === 1) {
						context.beginPath();
						context.arc(this.x, this.y, radius, 0, TWO_PI);
						context.stroke();
						context.fill();
					}

					// Draw sides
					if(this.age > 1) {
						context.beginPath();
						context.moveTo(this.x1, this.y1);
						context.lineTo(x1, y1);
						context.moveTo(this.x2, this.y2);
						context.lineTo(x2, y2);
						context.stroke();
					}

					// Draw ribbon
					context.beginPath();
					context.moveTo(this.x1, this.y1);
					context.lineTo(x1, y1);
					context.lineTo(x2, y2);
					context.lineTo(this.x2, this.y2);
					context.closePath();
					context.fill();

					this.x1 = x1;
					this.x2 = x2;

					this.y1 = y1;
					this.y2 = y2;

					break;

				case RENDER_MODES.Darkness :

					radius *= 0.5;

					x1 = this.x + Math.cos(this.theta - HALF_PI) * radius;
					x2 = this.x + Math.cos(this.theta + HALF_PI) * radius;

					y1 = this.y + Math.sin(this.theta - HALF_PI) * radius;
					y2 = this.y + Math.sin(this.theta + HALF_PI) * radius;

					context.lineWidth = scale;
					context.strokeStyle = 'rgba(255,255,255,0.9)';
					context.lineCap = 'round';
					context.fillStyle = '#111';

					// Starting point
					if(this.generation === 1 && this.age === 1) {
						context.beginPath();
						context.arc(this.x, this.y, radius, 0, TWO_PI);
						context.closePath();
						context.fill();
						context.stroke();
					}
					
					// Shadow
					if(scale > 0.05) {
						context.shadowOffsetX = scale;
						context.shadowOffsetY = scale;
						context.shadowBlur    = scale;
						context.shadowColor   = '#111';	
					}	

					// Draw ribbon
					context.beginPath();
					context.moveTo(this.x1, this.y1);
					context.lineTo(x1, y1);
					context.lineTo(x2, y2);
					context.lineTo(this.x2, this.y2);
					context.closePath();
					context.fill();

					// Draw sides
					if(this.age > 1 && scale > 0.1) {
						context.beginPath();
						context.moveTo(this.x1, this.y1);
						context.lineTo(x1, y1);
						context.moveTo(this.x2, this.y2);
						context.lineTo(x2, y2);
						context.stroke();
					}

					this.x1 = x1;
					this.x2 = x2;

					this.y1 = y1;
					this.y2 = y2;

					break;
			}
			
			context.restore();
		}
	},

	destroy: function() {
		
	}
};

/**
 * --------------------
 * SKETCH
 * --------------------
 */

var Recursion = new function() {

	var started      = false;
	var $canvasB      = $('#canvasBack');
	var $branchCount = $('#output .branchCount');
	var canvasB       = $canvasB[0];
	var context      = canvasB.getContext('2d');

	function spawn(x, y) {

		var theta, radius;

		for(var i = 0; i < CONFIG.NUM_BRANCHES; i++) {
			theta = (i / CONFIG.NUM_BRANCHES) * TWO_PI;
			radius = CONFIG.MAX_RADIUS;
			BRANCHES.push(new Branch(x, y, theta - HALF_PI, radius));
		}
	}

	function update() {

		//cancelRequestAnimFrame(update);
		requestAnimFrame(update);

		var i, n, branch;

		for(i = 0, n = BRANCHES.length; i < n; i++) {
			branch = BRANCHES[i];
			branch.update();
			branch.render(context);
		}

		// Strip dead branches
		for(i = BRANCHES.length - 1; i >= 0; i--) {
			if(!BRANCHES[i].growing) {
				BRANCHES.splice(i,1);
			}
		}

		var count = BRANCHES.length.toString();
		while(count.length < 3) { count = '0' + count; }
		$branchCount.text('Branch count: ' + count);
	}

	function onClick(e) {
	   
	}

	function onResize(e) {

		canvasB.width  = window.innerWidth;
		canvasB.height = window.innerHeight;

		Recursion.reset();
		spawn(window.innerWidth / 2, window.innerHeight / 2);
	}

	return {

		init: function() {

			onResize();

			if(!started) {
			    $(document).on('touch tap click', '.userName_5', function(e) {
			        console.log(e);
            		Recursion.reset();
            		spawn(e.screenX, e.screenY - 80);
            		 update();
			    });
			}
		},

		reset: function() {

			for(var i = 0, n = BRANCHES.length; i < n; i++) {
				BRANCHES[i].destroy();
			}

			BRANCHES = [];
		},


		clear: function() {
			canvasB.width = canvasB.width;
		}
	};
}

/**
 * --------------------
 * GUI
 * --------------------
 */

function saveConfig() {
	var config = [];
	for(var i in CONFIG) { config.push(i + ':' + CONFIG[i]); }
	console.log("PRESETS['__name__'] = {" + config.join(',') + "};");
}

// Build preset map for GUI
var preset = {key:''}, keys = {};
for(var i in PRESETS) { keys[i] = i; }

function randomise() {
	CONFIG.BRANCH_PROBABILITY  = random(0.01,1.0);
	CONFIG.MAX_CONCURRENT      = random(10,1000);
	CONFIG.NUM_BRANCHES        = random(1,20);
	CONFIG.MIN_RADIUS          = random(0.1,2.0);
	CONFIG.MAX_RADIUS          = random(CONFIG.MIN_RADIUS,100);
	CONFIG.MIN_WANDER_STEP     = random(0.1,PI);
	CONFIG.MAX_WANDER_STEP     = random(CONFIG.MIN_WANDER_STEP,PI);
	CONFIG.MIN_GROWTH_RATE     = random(0.1,20);
	CONFIG.MAX_GROWTH_RATE     = random(CONFIG.MIN_GROWTH_RATE,20);
	CONFIG.MIN_SHRINK_RATE     = random(0.9,0.999);
	CONFIG.MAX_SHRINK_RATE     = random(CONFIG.MIN_SHRINK_RATE,0.999);
	CONFIG.MIN_DIVERGENCE      = random(0.0,PI);
	CONFIG.MAX_DIVERGENCE      = random(CONFIG.MIN_DIVERGENCE,PI);
	Recursion.init();
	GUI.listenAll();
}


/**
 * --------------------
 * INIT
 * --------------------
 */

Recursion.init();
