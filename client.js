let WebSocket = require('ws');

function webSock(url) {
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
    const payload = JSON.stringify({event, data});
    ws.send(payload);
    return this;
  }

  ws.on('open', () => {
    if (events['open']) {
      events['open'].callback();
    }
  });

  ws.on('close', () => {
    if (events['close']) {
      events['close'].callback();
    }
  })

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
}

module.exports = webSock;