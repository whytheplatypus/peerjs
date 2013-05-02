require('./adapter');
require('../deps/reliable/dist/reliable.js');

var Peer = require('./peer');
var DataConnection = require('./dataconnection');
module.exports = {
	Peer: Peer,
	DataConnection: DataConnection
};