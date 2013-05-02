var browserify = require('browserify');
var fs = require('fs');

/*var reliable = browserify([__dirname + '/../deps/reliable/lib/reliable.js']);
reliable.add(__dirname + '/../deps/reliable/lib/util.js');
reliable.bundle({}, function cb(error, src){
  if(!error){
    fs.writeSync(
        fs.openSync(__dirname + '/../lib/reliable.js', 'w')
      , src
      , 0
      , 'utf8'
    );*/
  

    var full = browserify([__dirname + '/../lib/peer_full.js']);

    full.bundle({standalone: 'peerjs'}, function cb(error, src){
      if(!error){
        fs.write(
            fs.openSync(__dirname + '/../dist/peer_full.js', 'w')
          , src
          , 0
          , 'utf8'
        );
      }
    });

    var lone = browserify([__dirname + '/../lib/peer_only.js']);

    lone.bundle({standalone: 'peerjs'}, function cb(error, src){
      if(!error){
        fs.write(
            fs.openSync(__dirname + '/../dist/peer.js', 'w')
          , src
          , 0
          , 'utf8'
        );
      }
    });
  //}
//});