let WebSocket = require('ws');
let uuidv4 = require('uuid/v4');

function WebSockServer(port) {
  //Init server
  const wss = new WebSocket.Server({
    port,
    clientTracking: true
  });

  this.on = function on(event, callback) {
    if (event === 'connection') {
      wss.on('connection', ws => {
        let sock = new WebSock(ws);
        callback(sock);
      });
    }
  }

  /**
   * Broadcast to all sockets
   * @param {string} event
   * @param {object} data
   */
  this.broadcast = function broadcast(event, data) {
    let flags = {
      binary: []
    }

    //Check types
    if (typeof event != 'string') {
      throw new TypeError('Event must be of type string');
    }
    if (data && typeof data != 'object') {
      throw new TypeError('Data must be of type object');
    }

    checkForBinary(data, flags);

    const payload = JSON.stringify({event, data, flags});

    wss.clients.forEach(client => {
      client.send(payload);
    });
  }

  function WebSock(ws) {
    let events = {};
    this.id = uuidv4();
    ws.id = this.id;

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
     * Emit message to this socket
     * @param {string} event
     * @param {object} data
     */
    this.emit = function emit(event, data) {
      let flags = {
        binary: []
      }

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
     * Emit message to specific socket
     * @param {string} event
     * @param {object} data
     */
    this.emitTo = function emitTo(id, event, data) {
      let flags = {
        binary: []
      }
      let destination;

      //Check types
      if (typeof id != 'string') {
        throw new TypeError('Id must be of type string');
      }
      if (typeof event != 'string') {
        throw new TypeError('Event must be of type string');
      }
      if (data && typeof data != 'object') {
        throw new TypeError('Data must be of type object');
      }

      //Find socket
      for (let socket of wss.clients) {
        if (socket.id === id) {
          destination = socket;
          break;
        }
      }

      if (destination && destination.id != this.id) {
        checkForBinary(data, flags);

        const payload = JSON.stringify({event, data, flags});
        destination.send(payload);
        return this;
      }
      else if (destination && destination.id === this.id) {
        //Do nothing
      }
      else {
        throw new Error('Socket not found');
      }
    }

    //Wrapper for the close() function
    this.close = function close() {
      ws.close();
    }

    ws.on('message', json => {
      const payload = JSON.parse(json);

      // Check flags
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

    ws.on('close', () => {
      if (events['close']) {
        events['close'].callback(ws.id);
      }
      wss.clients.delete(ws);
    });
  }
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

module.exports = WebSockServer;
