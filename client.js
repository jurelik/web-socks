let WebSocket = require('ws');

function WebSock(url) {
  const ws = new WebSocket(url);

  let events = {};

  /**
   * Create an event handler
   * @param {string} event
   * @param {function} callback
   */
  this.on = function on(event, callback) {
    events[event] = {callback, once: false};
    return this;
  }

  /**
   * Create an event handler for one time use
   * @param {string} event
   * @param {function} callback
   */
  this.once = function once(event, callback) {
    events[event] = {callback, once: true};
    return this;
  }

  /**
   * Emit message to server
   * @param {string} event
   * @param {object} data
   */
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

    checkForBinary(data, flags);

    const payload = JSON.stringify({event, data, flags});
    ws.send(payload);
    return this;
  }

  /**
   * Remove listener manually
   * @param {string} event
   */
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
    const payload = JSON.parse(json);

    //Check flags
    for (let key in payload.flags) {
      if (key === 'binary' && payload.flags[key].length > 0) {
        convertToBuffer(payload.data, payload.flags, key);
      }
    }

    //Check if event handler exists & check if event is only to be triggered once
    if (events[payload.event] && !events[payload.event].once) {
      events[payload.event].callback(payload.data);
    }
    else if (events[payload.event] && events[payload.event].once) {
      events[payload.event].callback(payload.data);
      delete events[payload.event];
    }
    else {
      return;
    }
  });
}

function convertToBuffer(data, flags, key) {
  flags[key].forEach(binary => {
    if (data[binary]) {
      const parsed = Buffer.from(data[binary], 'utf-16');
      data[binary] = parsed;
    }
    else {
      //Find binary data
      for (let _key in data) {
        if (typeof data[_key] === 'object') {
          convertToBuffer(data[_key], flags, key);
        }
      }
    }
  });
}

function checkForBinary(data, flags) {
  for (let key in data) {
    if (Buffer.isBuffer(data[key])) {
      const stringified = data[key].toJSON();
      data[key] = stringified;
      flags.binary.push(key);
    }
    else if (typeof data[key] === 'object') {
      checkForBinary(data[key], flags);
    }
  }
}

module.exports = WebSock;