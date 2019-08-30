let WebSocket = require('ws');
let uuidv4 = require('uuid/v4');

function webSock(port) {
  //Init server
  const wss = new WebSocket.Server({
    port,
    clientTracking: true
  }, () => {
    if (events['open']) {
      events['open'].callback();
    }
  });

  let events = {};
  
  wss.on('connection', ws => {
    ws.id = uuidv4();
    this.id = ws.id;

    if (events['connection']) {
      events['connection'].callback(ws);
    }

    ws.on('message', json => {
      const message = JSON.parse(json);
  
      //Check if event handler exists & check if event is only to be triggered once
      if (events[message.event] && !events[message.event].once) {
        events[message.event].callback(message.data);
      }
      else if (events[message.event] && events[message.event].once) {
        events[message.event].callback(message.data);
        delete events[message.event];
      }
      else {
        return;
      }
    });

    ws.on('close', () => {
      if (events['close']) {
        console.log('client disconnected');
        events['close'].callback(ws.id);
      }

      wss.clients.delete(ws);
    });
  });

  wss.on('error', err => {
    console.log('Server shut down.');
  });

  //Create an event handler
  this.on = function on(event, callback) {
    events[event] = {callback, once: false};
    return this;
  }

  //Create an event handler for one time use
  this.once = function once(event, callback) {
    events[event] = {callback, once: true};
    return this;
  }

  //Emit message to socket
  this.emit = function emit(event, data) {
    //Check type
    if (typeof event != 'string' || typeof data != 'object') {
      throw new TypeError('event must be a string, data must be an object');
    }

    const payload = JSON.stringify({event, data});
    ws.send(payload);
    return this;
  }

  //Emit message to specific socket
  this.emitTo = function emitTo(id, event, data) {
    let destination;

    //Find socket
    for (let socket of wss.clients) {
      if (socket.id === id) {
        destination = socket;
      }
    }

    //Send message to socket
    if (destination) {
      //Check type
      if (typeof event != 'string' || typeof data != 'object') {
        throw new TypeError('event must be a string, data must be an object');
      }

      const payload = JSON.stringify({event, data});
      destination.send(payload);
      return this;
    }
  }
}

module.exports = webSock;