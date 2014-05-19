/**
 * LDAP Client
 */

var ldap = require('ldapjs');
var assert = require('assert');
var async = require('async');

var secrets = require(__dirname + '/private/secrets');
var sessionDB = require(__dirname + '/db/sessionDB');


ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

var ldap_config = {
    url : 'ldaps://bluepages.ibm.com:636'
}

var my_email = 'kmdeland@us.ibm.com';

var my_password = process.env.IIP_PW || secrets.pw;
if(!my_password) 
	throw "set your environment variable IIP_PW";

var client = ldap.createClient(ldap_config, function(err, res) {
    console.log('created client');
    console.log(res);
});

sessionDB.init(function(err) {
	assert.ifError(err);
});

/*client.bind(dn, password, function(err) {
    if(err) {
	console.log('Error: ' + JSON.stringify(err));
	return;
    }

    console.log('bound');
});*/


var do_everything = function(email, password) {
	
	// Function: prepare data
	var search_filter = '(|(mail=' + email + '))';
	var opts = {
			filter: search_filter,
			scope: 'sub'
	};
	var search_basename = 'ou=bluepages, o=ibm.com';
	
	// Function: search
	client.search(search_basename, opts, function(err, res) {
		assert.ifError(err);
		
		console.log('Searching...');
		console.log(JSON.stringify(res));
		
		res.on('searchEntry', function(entry) {
			
			console.log('found entry: ' +JSON.stringify(entry.object));
			var dn = entry.dn;
			console.log(dn);
			
			// Function: bind 
			client.bind(dn, password, function(err, res) {
				assert.ifError(err);
				
				var session_data = {
						dn: dn,
						time_began: new Date(),
						time_ended: ''
				};
				
				// Function: insert session data
				sessionDB.insert_into_sessions(session_data, function(err, result) {
					assert.ifError(err);
					
					console.log("Bound!");
					console.log(result);
					
					// Function: get session data
					sessionDB.get_session_by_dn(dn, function(err, session) {
						assert.ifError(err);
						
						console.log("Found session");
						console.log(session);
					}); 
				});
			});
		});
		
		res.on('error', function(err) {
    	console.log('found error');
    	console.log(JSON.stringify(err));
		});
		
		res.on('end', function(result) {
			console.log('status: ' + result);
		});
	});
};

/**
 * ldapsearch on linux CLI
 * % is a wildcard, check for that
 * might get two results... check for that
 */
exports.search_person = function (client, email, callback){
    console.log(email);
	var self = this;
	
    var opts = {
        filter:"(|(mail="+email+"))",
        scope:"sub"
    }
    var search_basename = 'ou=bluepages, o=ibm.com';

    client.search(search_basename ,opts,function(err,res){
        if(err)
            callback(err);
        var found = false;
        res.on('searchEntry', function(entry){
            found = true;
            callback(err,entry.object);
        });
        res.on('error', function(err) {
            callback(err);
        });
        res.on('end', function(result) {
            if(!found){
                callback(err,null);
            }
        });
    })
}
var do_all_async = function(client, em, pw, callback) {
	var dn;
	async.waterfall(
			[
			 function(cb) {
				 exports.search_person(client, em, cb);
			 },
			 function(res, cb) {
				 console.log(res);
				 dn = res.dn
				 client.bind(dn, pw, cb);
			 }, 
			 function(cb) {
				 var session_data = {
						 dn: dn,
						 time_began: new Date(),
						 time_ended: ''
				 };
				 
				 sessionDB.insert_into_sessions(session_data, cb);
			 },
			 function(res, cb) {
				 console.log("inserted session data!");
				 console.log(res);
			 }
			 ], callback)
};

/*exports.search_person(client, my_email, function(err, res) {
	assert.ifError(err);
	console.log(res);
});*/

do_all_async(client, my_email, my_password, function(err, res) {
	assert.ifError(err);
	console.log(res);
});

/*getPerson(client, 'kmdeland@us.ibm.com', function(err, res) {
	if(err) {
		console.log('error: ' + JSON.stringify(err));
		return;
	}
	console.log(res);
})*/