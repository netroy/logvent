var cluster = require('cluster');

var port = parseInt(process.env.PORT, 10) || 9876;
var libPath = process.env.TEST_COV ? './lib-cov/' : './lib/';
var toLoad = cluster.isMaster ? 'master' : 'worker';
require(libPath + toLoad).init(port);