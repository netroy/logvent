var cluster = require('cluster');

var workers = {};
var workerCount = require('os').cpus().length;
var workerLife = 30*60*1000;

var log = console.log.bind(console, '[MASTER]\t');

// Spawn a worker & send it the ENV config
function spawn (env) {
  var worker = cluster.fork();
  workers[worker.process.pid] = worker;
  worker.send({
    'env': env
  });
  return worker;
}

function onDeath (worker) {
  log('worker ' + worker.process.pid + ' died.');
  process.nextTick(spawn, 100);
  delete workers[worker.process.pid];
}

function onSigHup () {
  log('recieved sighup, restarting workers');
  var pids = Object.keys(workers);
  pids.forEach(function(pid) {
    process.kill(pid, 'SIGHUP');
  });
}

function recycleWorker () {
  var pids = Object.keys(workers);
  process.kill(pids[0], 'SIGHUP');
}

function init (port) {

  log('Starting', workerCount, 'node HTTP cluster on port', port);

  // Spawn the initial workers
  for (var i = 0; i < workerCount; i++) {
    spawn();
  }

  // Spawn new workers when old ones die
  cluster.on('exit', onDeath);

  // Restart all workers gracefully on SIGHUP
  process.on('SIGHUP', onSigHup);

  // Clean up workers regularly
  // to avoid memory leaks bringing the system down to it's knees
  // (Not that memory leaks should be acceptable,
  //  but you might get them from modules)
  setInterval(recycleWorker, workerLife);
}

module.exports = {
  'init': init
};