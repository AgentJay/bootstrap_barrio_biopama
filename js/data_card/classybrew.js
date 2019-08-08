(function () {

	var classyBrew = (function () {

		return function () {
			this.series = undefined;
			this.numClasses = null;
			this.breaks = undefined;
			this.colorCode = undefined;
			this.range = undefined;
			this.statMethod = undefined;

			// define array of values
			this.setSeries = function (seriesArr) {
				this.series = Array();
				this.series = seriesArr;
				this.series = this.series.sort(function (a, b) { return a-b });
			};

			// return array of values
			this.getSeries = function () {
				return this.series;
			};

			// set number of classes
			this.setNumClasses = function (n) {
				this.numClasses = n;
				return this.numClasses;
			};

			// get number of classes
			this.getNumClasses = function () {
				return this.numClasses;
			};

			// define color ramp color
			this.setColorCode = function (color) {
				this.colorCode = color;
			};

			// get available color ramps
			this.getColorCode = function () {
				return this.colorCode;
			};

			// get color codes
			this.getColorCodes = function () {
				var colorCodes = [];
				for ( code in this.colorSchemes ) {
					if ( this.colorSchemes.hasOwnProperty(code) ) {
						colorCodes.push(code);
					}
				}
				return colorCodes;
			};

			// get color codes by type
			this.getColorCodesByType = function () {
				var colorTypes = {};
				for ( code in this.colorSchemes ) {
					if ( this.colorSchemes.hasOwnProperty(code) ) {
						if( !colorTypes.hasOwnProperty(this.colorSchemes[code].properties.type) ) {
							colorTypes[this.colorSchemes[code].properties.type] = []
						}
						colorTypes[this.colorSchemes[code].properties.type].push(code);
					}
				}
				return colorTypes;
			};

			/**** Classification Methods ****/

			this._classifyEqualInterval = function () {
				var min = Math.min.apply(null, this.series);
				var max = Math.max.apply(null, this.series);

			    var a = [];
			    var val = min;
			    var interval = (max - min) / this.getNumClasses();

			    for (i = 0; i <= this.getNumClasses(); i++) {
			        a[i] = val;
			        val += interval;
			    }

			    //-> Fix last bound to Max of values
			    a[this.getNumClasses()] = max;

			    this.range = a;
			    this.range.sort(function (a, b) { return a-b });

			    return this.range;
			};

			this._classifyQuantile = function () {
				var tmp = this.series.sort(function (a, b) { return a-b });
				var quantiles = [];
				var step = this.series.length / this.getNumClasses();
				for (var i = 1; i < this.getNumClasses(); i++) {
					var qidx = Math.round(i*step+0.49);
					quantiles.push(tmp[qidx-1]); // zero-based
				}
				var bounds = quantiles;

				bounds.unshift(tmp[0]);
				if (bounds[tmp.length - 1] !== tmp[tmp.length - 1])
					bounds.push(tmp[tmp.length - 1]);

				this.range = bounds;
				this.range.sort(function (a, b) { return a-b });

				return this.range;
			};

			this._classifyStdDeviation = function () {
			    var min = Math.min.apply(null, this.series);
				var max = Math.max.apply(null, this.series);

			    var a = [];

			    // number of classes is odd
			    if(this.getNumClasses % 2 == 1) {

			    	// Euclidean division to get the inferior bound
			    	var infBound = Math.floor(this.getNumClasses() / 2);

			    	var supBound = infBound + 1;

			    	// we set the central bounds
			    	a[infBound] = this._mean(this.series) - ( this._stdDev(this.series) / 2);
			    	a[supBound] = this._mean(this.series) + ( this._stdDev(this.series) / 2);

			    	// Values < to infBound, except first one
			    	for (i = infBound - 1; i > 0; i--) {
			    		var val = a[i+1] - this._stdDev(this.series);
				        a[i] = val;
				    }

			    	// Values > to supBound, except last one
			    	for (i = supBound + 1; i < this.getNumClasses(); i++) {
			    		var val = a[i-1] + this._stdDev(this.series);
				        a[i] = val;
				    }

			    	// number of classes is even
			    } else {

			    	var meanBound = this.getNumClasses() / 2;

			    	// we get the mean value
			    	a[meanBound] = this._mean(this.series);

			    	// Values < to the mean, except first one
			    	for (i = meanBound - 1; i > 0; i--) {
			    		var val = a[i+1] - this._stdDev(this.series);
				        a[i] = val;
				    }

			    	// Values > to the mean, except last one
			    	for (i = meanBound + 1; i < this.getNumClasses(); i++) {
			    		var val = a[i-1] + this._stdDev(this.series);
				        a[i] = val;
				    }
			    }


			    // we finally set the first value
		    	a[0] = min;

		    	// we finally set the last value
		    	a[this.getNumClasses()] = max;

			    this.range = a;
			    this.range.sort(function (a, b) { return a-b });

			    return this.range;
			};

			this._classifyJenks = function () {
				var mat1 = [];
				for ( var x = 0, xl = this.series.length + 1; x < xl; x++) {
					var temp = []
					for ( var j = 0, jl = this.numClasses + 1; j < jl; j++) {
						temp.push(0)
					}
					mat1.push(temp)
				}

				var mat2 = []
				for ( var i = 0, il = this.series.length + 1; i < il; i++) {
					var temp2 = []
					for ( var c = 0, cl = this.numClasses + 1; c < cl; c++) {
						temp2.push(0)
					}
					mat2.push(temp2)
				}

				for ( var y = 1, yl = this.numClasses + 1; y < yl; y++) {
					mat1[0][y] = 1
					mat2[0][y] = 0
					for ( var t = 1, tl = this.series.length + 1; t < tl; t++) {
						mat2[t][y] = Infinity
					}
					var v = 0.0
				}

				for ( var l = 2, ll = this.series.length + 1; l < ll; l++) {
					var s1 = 0.0
					var s2 = 0.0
					var w = 0.0
					for ( var m = 1, ml = l + 1; m < ml; m++) {
						var i3 = l - m + 1
						var val = parseFloat(this.series[i3 - 1])
						s2 += val * val
						s1 += val
						w += 1
						v = s2 - (s1 * s1) / w
						var i4 = i3 - 1
						if (i4 != 0) {
							for ( var p = 2, pl = this.numClasses + 1; p < pl; p++) {
								if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
									mat1[l][p] = i3
									mat2[l][p] = v + mat2[i4][p - 1]
								}
							}
						}
					}
					mat1[l][1] = 1
					mat2[l][1] = v
				}

				var k = this.series.length
				var kclass = []

				for (i = 0, il = this.numClasses + 1; i < il; i++) {
					kclass.push(0)
				}

				kclass[this.numClasses] = parseFloat(this.series[this.series.length - 1])

				kclass[0] = parseFloat(this.series[0])
				var countNum = this.numClasses
				while (countNum >= 2) {
					var id = parseInt((mat1[k][countNum]) - 2)
					kclass[countNum - 1] = this.series[id]
					k = parseInt((mat1[k][countNum] - 1))

					countNum -= 1
				}

	 			if (kclass[0] == kclass[1]) {
					kclass[0] = 0
				}

				this.range = kclass;
				this.range.sort(function (a, b) { return a-b })

				return this.range; //array of breaks
			};

			/**** End classification methods ****/

			// return array of natural breaks
			this.classify = function (method, classes) {
				this.statMethod = (method !== undefined) ? method : this.statMethod;
				this.numClasses = (classes !== undefined) ? classes : this.numClasses;
				var breaks = undefined;
				switch(method) {
					case 'equal_interval':
						breaks = this._classifyEqualInterval();
						break;
					case 'quantile':
						breaks = this._classifyQuantile();
						break;
					case 'std_deviation':
						breaks = this._classifyStdDeviation();
						break;
					case 'jenks':
						breaks = this._classifyJenks();
						break;
					default:
						breaks = this._classifyJenks();
				}
				this.breaks = breaks;
				return breaks;
			};

			// return types of available classification methods
			this.getClassificationMethods = function () {
				return ['equal_interval', 'quantile'/*, 'std_deviation'*/, 'jenks'];
			};

			this.getBreaks = function () {
				// always re-classify to account for new data
				return this.breaks ? this.breaks : this.classify();
			};

			// get colors from data and num classes
			this.getColors = function () {
				// return array of colors
				return this.colorSchemes[this.colorCode][this.numClasses];
			};

			// get color for a given value
			this.getColorInRange = function (num) {
				// return color code for supplied number
				// [4, 6, 8, 9]
				// [4-5.99, 6-7.99, 8-9]
				var i = 0;
				for(i; i < this.range.length; i++) {
					//number equal to or greater than current value in range
					//we havent reached the last value in range
					if(num >= this.range[i] && i < this.range.length) {
						if(num <= this.range[i + 1]) {
							return this.colorSchemes[this.colorCode][this.numClasses][i];
						}
					} else if(num == this.range[i]) {
						return this.colorSchemes[this.colorCode][this.numClasses][i - 1];
					} else {
						return false;
					}
				}
			};

			/*** Simple Math Functions ***/
			this._mean = function (arr) {
				return parseFloat(this._sum(arr) / arr.length);
			};

			this._sum = function (arr) {
				var sum = 0;
				var i;
				for(i = 0; i < arr.length; i++) {
					sum += arr[i];
				}
				return sum;
			};

			this._variance = function (arr) {
				var tmp = 0;
				for (var i = 0; i < arr.length; i++) {
					tmp += Math.pow( (arr[i] - this._mean(arr)), 2 );
				}

				return (tmp / arr.length);
			};

			this._stdDev = function (arr) {
				return Math.sqrt(this._variance(arr));
			};

			/*** END Simple math Functions ***/
		}


	})();

	// support node module and browser
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = classyBrew;
	} else {
		window.classyBrew = classyBrew;
	}

})();
