/*
 * ipaserver
 * https://github.com/operandom/ipaserver
 *
 * Copyright (c) 2013 Valéry Herlaud
 * Licensed under the MIT license.
 */

'use strict';

var util		 = require('util'),
	typer		 = require('proto-typer'),
	EventEmitter = require('events').EventEmitter,
	AdmZip		 = require('adm-zip');


module.exports = function() {
	define();
	return IPAFile;
}();


function IPAFile(path) {
	if (path)
		this.path = path;
}


function define() {
	
	util.inherits(IPAFile, EventEmitter);
		
	typer
	.define(IPAFile.prototype)
	.p('_path').nk.f
	.u('path', getPathAccessors)
	.p('_file').nk.f
	.u('file', getFileAccessors)
	.p('name').t(String).e().f
	.p('version').t(String).e().f
	.p('id').t(String).e().f
	.p('team').t(String).e().f
	.p('icon').e().f;
}



/////////////////////////////
//                         //
//    SETTERS & GETTERS    //
//                         //
/////////////////////////////


function getPathAccessors() {
	return {
		'enumerable': true,
		'get': function() { return this._path},
		'set': function(value) {
			if (this._path !== value) {
				var oldValue = this._path;
				this._path = value;
				this.file = new AdmZip(value);
				this.emit('propertyChange', {
					'type': 'propertyChange',
					'target': this,
					'property': 'path',
					'oldValue': oldValue,
					'newValue': value
				})
			}
		}
	}			
}

function getFileAccessors() {
	return {
		'enumerable': true,
		'get': function() { return this._file; },
		'set': function(value) {
			if (this._file !== value) {
				this._file = value;
				startParsing(this);
			}
		}
	}	
}



///////////////////
//               //
//    PARSING    //
//               //
///////////////////


function startParsing(target) {
	
	var file		= target.file,
		entries		= file.getEntries(),
		nbrEntries	= entries.length,
		keys 		= {
			'name': 'CFBundleDisplayName',
			'version': 'CFBundleVersion',
			'id': 'CFBundleIdentifier',
			'team': 'TeamName'
		},
		foundInfo,
		foundProvision,
		foundIcon
	;

	for (var i = 0; i < nbrEntries; i++) {
		
		var entry = entries[i];
		
		if (!foundInfo && entry.entryName.match(/Info\.plist$/)) {
			foundInfo = true;
			file.readAsTextAsync(entry, function(data, error) {
				if (error)
					console.log('info error');
				else {
					target.name = getKey(data, keys.name);
					target.version = getKey(data, keys.version);
					target.id = getKey(data, keys.id);
				}
			});
		}
		
		if (!foundProvision && entry.entryName.match(/embedded\.mobileprovision$/)) {
			foundProvision = true;
			file.readAsTextAsync(entry, function(data, error) {
				if (error)
					console.log('provision error');
				else
					target.team = getKey(data, keys.team);
			});
		}
		
		if (!foundIcon && entry.entryName.match(/Icon\.png$/)) {
			foundIcon = true;
			file.readFileAsync(entry, function(data, error) {
				if (error)
					console.error('icon error');
				else
					target.icon = data;
			});
		}
		
		if (foundInfo && foundProvision && foundIcon)
			break;
	}

}

function getKey(target, key) {
	var pattern = key + '(.|[\r\n])+?string>(.*)?(?=</string>)';
	var string;
	
	var matches = target.match(new RegExp(pattern));
		
	if (matches && matches.length > 0)
		string = matches[2];
	else
		string = 'Not find';
	
	return string;
}

