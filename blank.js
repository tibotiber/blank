var _ = require('lodash');
var async = require('async');
var N3 = require('n3');

var store = N3.Store();

var dump = function(cb) {
    var writer = N3.Writer();
    var triples = store.find(null, null, null);
    async.eachSeries(triples, function(triple, cb) {
	writer.addTriple(triple, cb);
    }, function(err) {
	if(err) return cb(err);
	writer.end(cb);
    });
};

var log = function(str) {
    console.log('> '+str);
};


store.addTriple('http://ex.org/Mickey', 'http://ex.org/type', 'http://ex.org/Mouse');

async.series([
    function(cb) {
	log('-----------------');
	log('PART 1: THE ISSUE');
	log('-----------------');
	var bn = store.createBlankNode();
	log('blank node generated with no problem: '+bn);
	log('add triple with blank node to store, no problem');
	store.addTriple(bn, 'http://ex.org/loves', 'http://ex.org/Mickey');
	var fans = store.find(null, 'http://ex.org/loves', 'http://ex.org/Mickey');
	log('fans: '+_.pluck(fans, 'subject').join(', '));
	log('ISSUE: blank node takes name of last resource added to store!!');
	log('dumping store, with little consequence...');
	dump(function(err, res) {
	    if(err) return cb(err);
	    console.log(res);
	    cb();
	});
    },
    function(cb) {
	log('-----------------');
	log('PART 2: THE ERROR');
	log('-----------------');
	log('now adding a triple with a literal object...');
	store.addTriple('http://ex.org/Mickey', 'http://ex.org/name', '"Mickey"^^xsd:string');
	var bn = store.createBlankNode();
	log('blank node generated with no problem: '+bn);
	log('add triple with blank node to store, no problem');
	store.addTriple(bn, 'http://ex.org/loves', 'http://ex.org/Mickey');
	var fans = store.find(null, 'http://ex.org/loves', 'http://ex.org/Mickey');
	log('fans: '+_.pluck(fans, 'subject').join(', '));
	log('ISSUE: here again blank node takes name of last resource, which is now a literal so the writer throws an error!');
	log('dumping store, with big consequence...');
	dump(function(err, res) {
	    if(err) return cb(err);
	    console.log(res);
	    log('no more problem');
	    cb();
	});
    },
    function(cb) {
	log('-----------------');
	log('PART 3: HAPPY END');
	log('-----------------');
	log('All is well!');
	cb();
    }
], function(err) {
    if(err) {
	console.error(err);
    } else {
	log('Really well!');
    }
});

