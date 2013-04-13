require('./adapter');
require('../deps/reliable/dist/reliable.js');

var util = require('./util');

var EventEmitter = require('events').EventEmitter;
var DataConnection = require('./dataconnection');
var ConnectionManager = require('./connectionmanager');
var Peer = require('./peer');




module.exports = {
	DataConnection: DataConnection,
	ConnectionManager: ConnectionManager,
	util: util,
	EventEmitter: EventEmitter,
	Peer: Peer
};