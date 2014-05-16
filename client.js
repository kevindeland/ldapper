/**
 * LDAP Client
 */

var ldap = require('ldapjs');

ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

var ldap_config = {
    url : 'ldaps://bluepages.ibm.com:636'
}

var email = 'kmdeland@us.ibm.com';

var password = process.env.IIP_PW || 'password';
if(!password) 
	throw "set your environment variable IIP_PW";

var client = ldap.createClient(ldap_config, function(err, res) {
    console.log('created client');
    console.log(res);
});


/*client.bind(dn, password, function(err) {
    if(err) {
	console.log('Error: ' + JSON.stringify(err));
	return;
    }

    console.log('bound');
});*/
var search_filter1 = '(|(mail=' + email + '))';
var opts = {
    filter: search_filter1,
    scope: 'sub'
};
var search_basename = 'ou=bluepages, o=ibm.com';

client.search(search_basename, opts, function(err, res) {
    if(err) {
	console.log('Error: ' + JSON.stringify(err));
	return;
    }

    console.log('searching');
    console.log(JSON.stringify(res));

    res.on('searchEntry', function(entry) {
        console.log('found entry: ' +JSON.stringify(entry.object));
        var dn = entry.dn;
        console.log(dn);
        client.bind(dn, password, function(err, res) {
        	if(err) {
        		console.log('error:' + err);
        		return;
        	}
        	console.log("Bound!");
        	console.log(res);
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

/**
 * ldapsearch on linux CLI
 * % is a wildcard, check for that
 * might get two results... check for that
 */
function getPerson (client, email,callback){
    console.log(email);
	var self = this;
	
    var opts = {
        filter:"(|(mail="+email+"))",
        scope:"sub"
    }

    client.search('ou=bluepages, o=ibm.com',opts,function(err,res){
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

/*getPerson(client, 'kmdeland@us.ibm.com', function(err, res) {
	if(err) {
		console.log('error: ' + JSON.stringify(err));
		return;
	}
	console.log(res);
})*/