let WebSocket = require('ws');
let uuidv4 = require('uuid/v4');

function WebSockServer(port) {
  //Init server
  const wss = new WebSocket.Server({
    port,
    clientTracking: true
  });

  this.on = function(event, callback) {
    wss.on('connection', ws => {
      if (event === 'connection') {
        callback(ws);
      }
    });
  }

  

  function WebSock() {

  }

  // wss.on('connection', ws => {
  //   console.log('connection made!');

  //   ws.on('message', msg => {
  //     console.log(msg);
  //     ws.send('pong');
  //   });
  // });
}

// function WebSockServer(port) {

//   let events = {};
//   //Init server
//   const wss = new WebSocket.Server({
//     port,
//     clientTracking: true
//   }, () => {
//     if (events['open']) {
//       events['open'].callback();
//     }
//   });

//   wss.on('connection', ws => {
//     ws.id = uuidv4();
//     let sock = new WebSock(ws, wss, events);

//     if (events['connection']) {
//       events['connection'].callback(sock);
//     }

//     ws.on('message', json => {
//       console.log('received message from ' + ws.id);
//       const message = JSON.parse(json);
      
//       //Check flags
//       for (let key in message.flags) {
//         if (key === 'binary' && message.flags[key].length > 0) {
//           message.flags[key].forEach(binary => {
//             const parsed = Buffer.from(message.data[binary], 'utf-16');
//             message.data[binary] = parsed;
//           });
//         }
//       }
  
//       //Check if event handler exists & check if event is only to be triggered once
//       if (events[message.event] && !events[message.event].once) {
//         events[message.event].callback(message.data);
//       }
//       else if (events[message.event] && events[message.event].once) {
//         events[message.event].callback(message.data);
//         delete events[message.event];
//       }
//       else {
//         return;
//       }
//     });

//     ws.on('close', () => {
//       if (events['close']) {
//         console.log('client disconnected');
//         events['close'].callback(ws.id);
//       }

//       wss.clients.delete(ws);
//     });

//     //Create an event handler
//     ws.on = function on(event, callback) {
//       events[event] = {callback, once: false};
//       return this;
//     }

//     //Create an event handler for one time use
//     this.once = function once(event, callback) {
//       events[event] = {callback, once: true};
//       return this;
//     }

//     //Emit message to socket
//     this.emit = function emit(event, data) {
//       let flags = {
//         binary: []
//       };

//       //Check type
//       // if (typeof event != 'string' || typeof data != 'object') {
//       //   throw new TypeError('event must be a string, data must be an object');
//       // }

//       //Check for binary data
//       for (let key in data) {
//         if (Buffer.isBuffer(data[key])) {
//           const stringified = data[key].toJSON();
//           data[key] = stringified;
//           flags.binary.push(key);
//         }
//       }

//       const payload = JSON.stringify({event, data, flags});
//       this.ws.send(payload);
//       return this;
//     }
//   });

//   //Create an event handler
//   this.on = function on(event, callback) {
//     events[event] = {callback, once: false};
//     return this;
//   }

//   wss.on('error', err => {
//     console.log('Server shut down.');
//   });
// }

// function WebSock(ws, wss, events) {
//   this.ws = ws;
//   this.id = ws.id;

//   //Create an event handler
//   this.on = function on(event, callback) {
//     events[event] = {callback, once: false};
//     return this;
//   }

//   //Create an event handler for one time use
//   this.once = function once(event, callback) {
//     events[event] = {callback, once: true};
//     return this;
//   }

//   //Emit message to socket
//   this.emit = function emit(event, data) {
//     let flags = {
//       binary: []
//     };

//     //Check type
//     // if (typeof event != 'string' || typeof data != 'object') {
//     //   throw new TypeError('event must be a string, data must be an object');
//     // }

//     //Check for binary data
//     for (let key in data) {
//       if (Buffer.isBuffer(data[key])) {
//         const stringified = data[key].toJSON();
//         data[key] = stringified;
//         flags.binary.push(key);
//       }
//     }

//     const payload = JSON.stringify({event, data, flags});
//     this.ws.send(payload);
//     return this;
//   }

//   //Emit message to specific socket
//   this.emitTo = function emitTo(id, event, data) {
//     let destination;
//     let flags = {
//       binary: []
//     };

//     //Find socket
//     for (let socket of wss.clients) {
//       if (socket.id === id) {
//         destination = socket;
//         break;
//       }
//     }

//     //Check for binary data
//     for (let key in data) {
//       if (Buffer.isBuffer(data[key])) {
//         const stringified = data[key].toJSON();
//         data[key] = stringified;
//         flags.binary.push(key);
//       }
//     }

//     //Send message to socket
//     if (destination) {
//       //Check type
//       if (typeof event != 'string' || typeof data != 'object') {
//         throw new TypeError('event must be a string, data must be an object');
//       }

//       const payload = JSON.stringify({event, data, flags});
//       destination.send(payload);
//       return this;
//     }
//   }
// }

module.exports = WebSockServer;