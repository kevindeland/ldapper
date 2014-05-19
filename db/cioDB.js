/**
 * MongoDB for holding user sessions
 */
var mongodb = require('mongodb');
var assert = require('assert');

var DB_NAME = 'cio';
var COLLECTION_NAME_0 = 'sessions';
var COLLECTION_NAME_1 = 'users';

var COLLECTIONS = [COLLECTION_NAME_0, COLLECTION_NAME_1];
	
	var mongo;
if(process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	mongo = env['mongodb-2.2'][0].credentials;
} else {
			mongo = {
			"url" : "mongodb://localhost:27017/cio"
	}
}

//initialize collections as null
/*COLLECTIONS.forEach(function(name) {
	exports[name] = null;
});*/

exports.sessions = null;
exports.users = null;

/**
 * Initialize the database
 */
exports.init = function() {
	mongodb.connect(mongo.url, function(err, conn) {
		assert.ifError(err);
		// initialize each collection in database
		/*COLLECTIONS.forEach(function(name) {
			exports[name] = conn.collection(name);
			console.log('created db ' + name);
		});*/
		exports.sessions = conn.collection('sessions');
		exports.users = conn.collection('users');
		
//		callback(null);
	});
}

/**
 * Initialize INSERT functions for each member of COLLECTIONS
 */
exports.insert_into_sessions = function(insertSession, callback) {
	
	console.log('inserting data into collection sessions...');
	this.sessions.insert(insertSession, {safe:true}, function(err, result) {
		assert.ifError(err);
		callback(null, result);
	});
};

/**
 * get a session by it's identifier, dn a.k.a. 'distinct name' 
 */
exports.get_session_by_dn = function(dn, callback) {

	// Search criteria: 
	var search_criteria = {
			dn: dn, 
			time_ended: ''
	};
	
	this['sessions'].findOne(search_criteria, {sort: [['time_began', 'desc']]}, function(err, result) {
		assert.ifError(err);
		callback(null, result);
	});
};

exports.insert_into_users = function(insertUser, callback) {
	
	console.log('inserting data into collection users...');
	exports['users'].insert(insertUser, {safe:true}, function(err, result) {
		assert.ifError(err);
		callback(null, result);
	});
};

exports.get_user_by_id = function(id, callback) {
	
	// 
	var search_criteria = {
		id: id	
	};
	exports['users'].findOne(search_criteria, {}, function(err, result) {
		assert.ifError(err);
		callback(null, result);
	});
};

/**
 * Initialize GET ALL function for each member of COLLECTIONS
 */
COLLECTIONS.forEach(function(name) {
	
	var functionName = 'get_all_' + name;
	exports[functionName] = function(callback) {
		console.log('retrieving data from collection ' + name + '...');
		this[name].find({}, {limit:100, sort:[['_id', 'desc']]}, function(err, cursor) {
			cursor.toArray(function(err, items) {
				if(err) {
					callback(err);
					return;
				}
				callback(null, items);
			});
		});
	};
});