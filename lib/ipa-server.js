(function () {

	/* jshint node: true */

	'use strict';
	
		// DEPENDENCIES
	var fs			= require('fs'),
		sep	= require('path').sep,
		prototyper	= require('proto-typer'),
		url			= require('url'),
		http		= require('http'),
		mu			= require('mu2'),
		mime		= require('mime'),
		
		// INSTANCE
		server,
		publicRoot = __dirname + '/../assets/public'.replace('/', sep);
		;

	console.log(publicRoot);
	
	///////////////////
	//               //
	//    EXPORTS    //
	//               //
	///////////////////
	

	module.exports = (function () {
		define();
		return IPAServer;
	}());
	
	
	
	
	/* == IPAServer ========================================================= */
	
	

	///////////////////////
	//                   //
	//    CONSTRUCTOR    //
	//                   //
	///////////////////////
	
	
	function IPAServer(port, address) {
		
		mu.root = __dirname + '\\..\\assets\\templates';
		
		var that = this;
		
		this.port = port;
		this.address = address;
		
		server = http.createServer(
			function(request, response) {
				requestHandler.call(that, request, response);
			}
		);
		server.listen(port, address);
		console.log('Server start (' + address + ':' + port + ')');
		
	}
	
	function define() {
		prototyper
		.d(IPAServer.prototype)
		.c('files', [])
		.p('port').t(Number).f
		.p('address').t(String).f
		;
	}
	
	
	
	///////////////////
	//               //
	//    METHODS    //
	//               //
	///////////////////
	
	
	function requestHandler(request, response) {
		
		var requestURL = url.parse('http://' + request.headers.host + request.url);
		
		if (requestURL.pathname === '/') {
			listView.call(this, response, requestURL, this.files);
			return;
		}
		
		var splittedUrl = requestURL.pathname.split('/');
		
		if(splittedUrl.length <= 3) {
			
			var index = parseInt(splittedUrl[1]);
			var file = this.files[index];
			var template = splittedUrl[2];
			
			if (file && template) {
				
				switch (template) {
					
					case '57.png':
						icon57View(response, file);
						break;
					
					case '512.png':
						icon512View(response);
						break;
					
					case 'manifest.plist':
						manifestView(requestURL, response, index, file);
						break;
					
					case 'application.ipa':
						applicationView(response, index, file);
						break;
					
					default:
						staticView(request, response);
				}
				
				return;
			}
		}
		
		staticView(request, response);
	}	
	
	
	// LIST
	
	function listView(response, url, files) {
		var stream,
			items = [];
		
		var nbrFiles = files.length;
		var urlBase = url.protocol + '//' + url.hostname;
		
		for (var i = 0; i < nbrFiles; i++) {
			var item = files[i];
			var itemPath = '/' + i + '/';
			
			items.push({
				name: item.name,
				path: item.path,
				team: item.team,
				id: item.id,
				src: urlBase + itemPath + '57.png',
				href: 'itms-services://?action=download-manifest&url=' + urlBase + itemPath + 'manifest.plist'
			});
		}
		
		
		stream = mu.compileAndRender('list.html', { "files": items });
		
		var body = "";
		
		stream.on('data', function(chunk) {
			body += chunk;
		});
		
		stream.on('end', function() {
			stream = mu.compileAndRender('layout.html', { 'body': body });
			
			response.writeHead(200, {'Content-Type': 'text/html' });
			stream.pipe(response);
		});
		
	}
	
	
	// ICON 57
	
	function icon57View(response, file) {
		
		response.writeHead(200, {'Content-Type': 'image/png' });
		
		if (file.icon) {
			response.end(file.icon);
			
		} else {
			var filestream = fs.createReadStream(publicRoot + '/img/57.png');
			filestream.pipe(response);
		}
	}
	
	
	// ICON 512
	
	function icon512View(response) {
		response.writeHead(200, {'Content-Type': 'image/png' });
		var filestream = fs.createReadStream(publicRoot + '/img/512.png');
		filestream.pipe(response);
	}
	
	
	// MANIFEST
	
	function manifestView(requestURL, response, index, file) {
		
		var baseURL = requestURL.protocol + '//' + requestURL.hostname + '/' + index + '/';
		
		var manifest = {
			fileURL: baseURL + 'application' + '.ipa',
			displayImage: baseURL + '57.png',
			fullSizeImage: baseURL + '512.png',
			bundleIdentifier: file.id,
			subtitle: file.team,
			title: file.name
		};
				
		response.writeHead(200, {'Content-Type': 'text/xml' });
		mu.compileAndRender('manifest.xml', manifest).pipe(response);
	}
	
	
	function staticView (request, response) {
	
		fs.stat(publicRoot + request.url, function (error, stats) {
			
			var is,
				filestream;
			
			if (error) {
				is = 'error';
				notFindView(request, response);
				
			} else if (stats.isFile()) {
				is = 'file';
				response.writeHead(200, {'Content-Type': mime.lookup(publicRoot + request.url.replace('/', sep)) });
				filestream = fs.createReadStream(publicRoot + request.url);
				filestream.pipe(response);
				
			} else if (stats.isDirectory()) {
				is = 'dir (' + path.normalize('.' + request.url) + ')'; 
				response.writeHead(403, {'Content-Type': 'text/html' });
				mu.compileAndRender('layout.html', {
					'body': '<h1>Folder</h1><p>This url is a folder.</p>'
				}).pipe(response);
				
			} else {
				is = 'something';
				response.writeHead(200, {'Content-Type': 'text/html' });
				mu.compileAndRender('layout.html', {
					'body': '<h1>Found...</h1><p>But I don\'t know what it is.</p>'
				}).pipe(response);
			}
		});
	}

	
	// APPLICATION
	
	function applicationView(response, index, file) {
		response.writeHead(200, {'Content-Type': 'application/octet-stream' });
		fs.createReadStream(file.path).pipe(response);
	}
	
	
	// 404
	
	function notFindView(request, response) {
		console.log('NOT FIND:', request.url);
		response.writeHead(404, {'Content-Type': 'text/plain' });
		response.end('not find');
	}
	
}());










