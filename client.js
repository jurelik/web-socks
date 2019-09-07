let WebSocket = require('ws');

function WebSock(url) {
  const ws = new WebSocket(url);

  let events = {};

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

  //Emit message to server
  this.emit = function emit(event, data) {
    let flags = {
      binary: []
    };

    //Check types
    if (typeof event != 'string') {
      throw new TypeError('Event must be of type string');
    }
    if (data && typeof data != 'object') {
      throw new TypeError('Data must be of type object');
    }

    //Check for binary data
    for (let key in data) {
      if (Buffer.isBuffer(data[key])) {
        const stringified = data[key].toJSON();
        data[key] = stringified;
        flags.binary.push(key);
      }
    }

    const payload = JSON.stringify({event, data, flags});
    ws.send(payload);
    return this;
  }

  //Remove listener manually
  this.removeListener = function removeListener(event) {
    if (events[event]) {
      delete events[event];
    }
  }

  ws.on('open', () => {
    console.log('ayy');
    reconnectAttempts = 0;
    if (events['open']) {
      events['open'].callback(ws);
    }
  });

  ws.on('close', () => {
    console.log('Connection to server lost, terminating process.');
    process.exit();
  });

  ws.on('error', err => {
    console.log(err);
  });

  ws.on('message', json => {
    const message = JSON.parse(json);

    //Check flags
    for (let key in message.flags) {
      if (key === 'binary' && message.flags[key].length > 0) {
        message.flags[key].forEach(buffer => {
          const parsed = Buffer.from(message.data[buffer]);
          message.data[buffer] = parsed;
        });
      }
    }

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
}

module.exports = WebSock;