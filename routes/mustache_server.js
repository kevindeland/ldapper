/**
 * For serving up mustache files
 */
var mustache = require('mustache');
var fs = require('fs');

var contents;

exports.mustachio = function (view, substance, callback) {
	
	var filename = 'views/mustache/' + view + '.html';
	
	var rs = fs.createReadStream(filename);
	
	rs.on('readable', function() {
		var str;
		contents = '';
		var d = rs.read();
		// build our file contents dynamically, line-by-line
		if(d) {
			// type check
			if(typeof d === 'string') {
				str = d;
			} else if(typeof d === 'object' && d instanceof Buffer) {
				str = d.toString('utf8');
			}
			if(str) {
				if(!contents) {
					contents = d;
				}
				else {
					contents += str;
				}
			}
		}
	});
	
	rs.on('end', function() {
		contents = contents.toString('utf8');
		
		var output = mustache.render(contents, substance);
		callback(null, output);
	});
};
