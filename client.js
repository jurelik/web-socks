let WebSocket = require('ws');


// function WebSock(url) {
//   const ws = new WebSocket(url);

//   ws.on('message', msg => {
//     console.log(msg);
//   });

//   this.ping = function ping() {
//     ws.send('ping');
//   }
// }

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

  ws.on('open', () => {
    if (events['open']) {
      events['open'].callback(ws);
    }
  });

  ws.on('close', () => {
    if (events['close']) {
      events['close'].callback();
    }
  })

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