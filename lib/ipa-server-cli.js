(function () {
	
	/* jshint node: true */
	
	'use strict';
	
		// DEPENDENCIES
	var os			= require('os'),
		fs			= require('fs'),
		separator	= require('path').sep,
		argv		= require('optimist').argv,
		util		= require('util'),
		findit		= require('findit'),
		prototyper	= require('proto-typer'),
		IPAFile		= require('./ipa-file'),
		IPAServer	= require('./ipa-server'),
		
		// DEFAULT VALUES
		dPort		= 3000,
		dAddress	= function() {
			var ipv4 = os.networkInterfaces().Ethernet.filter(function(item) {
				return item.family === 'IPv4';
			});
			return ipv4[0] ? ipv4[0].address : 'localhost';
		}(),
		dPath		= process.cwd(),
		dDepth		= 10,
		
		// INSTANCES
		server
		;

	
	
	///////////////////
	//               //
	//    EXPORTS    //
	//               //
	///////////////////
	

	module.exports = (function () {
		define();
		return Cli;
	}());
	
	
	
	
	/* == CLI =============================================================== */
	
	

	///////////////////////
	//                   //
	//    CONSTRUCTOR    //
	//                   //
	///////////////////////
	
	
	function Cli() {}
	
	function define() {
		prototyper
		.d(Cli.prototype)
		.c('start', start)
		.p('server')
		;
	}
	
	
	
	///////////////////
	//               //
	//    METHODS    //
	//               //
	///////////////////
	
	
	function start() {
		
		var port	= argv.p || dPort,
			address	= argv.a || dAddress,
			path	= argv._ && argv._[0] ? argv._[0] : dPath,
			depth	= argv.d || 10;
		
		server	= new IPAServer(port, address);
		
		
		findFiles(path, depth);
	}
	
	function findFiles(path, depth) {
		
		depth--;
			
		var aPaths = fs.readdirSync(path),
			lenght = aPaths.length,
			currentPath,
			currentStats;
		
		for (var i = 0; i < lenght; i++) {
			
			currentPath = path + separator + aPaths[i];
			currentStats = fs.lstatSync(currentPath);
			
			if (currentStats.isFile() && currentPath.match(/\.ipa$/)) {
				server.files.push(new IPAFile(currentPath));
			}
			
			else if (currentStats.isDirectory() && depth >= 0) {
				findFiles(currentPath, depth);
			}
		}
	}
	
	
}());

























