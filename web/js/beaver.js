/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


DEFAULT_ASSOCIATIONS_API_URL = 'http://www.hyperlocalcontext.com/associations/';


angular.module('reelyactive.beaver', [])

  .factory('beaver', function beaverFactory($http) {

    var devices = {};
    var associations = {};
    var stats = { appearances: 0, displacements: 0, keepalives: 0,
                  disappearances: 0 };
    var associationsApiUrl = DEFAULT_ASSOCIATIONS_API_URL;
    var eventCallbacks = {};


    function updateDevice(event, data) {
      if(!data || !data.tiraid) {
        return;
      }

      var tiraid = data.tiraid;
      if(!tiraid || !tiraid.identifier || !tiraid.identifier.value) {
        return;
      }

      var id = tiraid.identifier.value;
      if(event === 'disappearance') {
        if(devices.hasOwnProperty(id)) {
          // TODO: cache stats?
          delete devices[id];
        }
        stats.disappearances++;
        handleEventCallback(event, id);
        return;
      }

      if(!devices.hasOwnProperty(id)) {
        devices[id] = { tiraid: tiraid };
      }
      else {
        devices[id].tiraid = tiraid;
      }

      var device = devices[id];
      if(!device.hasOwnProperty('associations')) {
        getAssociations(id, function(id, associations) {
          if(devices.hasOwnProperty(id)) {
            devices[id].associations = associations;
          }
        });
      }

      if(event === 'appearance') { stats.appearances++; }
      if(event === 'displacement') { stats.displacements++; }
      if(event === 'keep-alive') { stats.keepalives++; }
      handleEventCallback(event, device);
    }


    function getAssociations(id, callback) {
      if(associations.hasOwnProperty(id)) {
        return callback(id, associations[id]);
      }
      associations[id] = {};
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get(associationsApiUrl + id)
        .success(function(data, status, headers, config) {
          if(data.devices && data.devices[id]) {
            associations[id] = data.devices[id];
          }
          return callback(id, associations[id]);
        })
        .error(function(data, status, headers, config) {
          return callback(id, associations[id]);
        });
    }


    function handleEventCallback(event, device) {
      var callback = eventCallbacks[event];
      if(callback) {
        callback(device);
      }
    }


    var setEventCallback = function(event, callback) {
      if(callback && (typeof callback === 'function')) { 
        eventCallbacks[event] = callback;
      }
    }


    var handleSocketEvents = function(Socket) {

      Socket.on('appearance', function(data) {
        updateDevice('appearance', data);
      });

      Socket.on('displacement', function(data) {
        updateDevice('displacement', data);
      });

      Socket.on('keep-alive', function(data) {
        updateDevice('keep-alive', data);
      });

      Socket.on('disappearance', function(data) {
        updateDevice('disappearance', data);
      });

      Socket.on('error', function(err, data) {
      });
    };

    return {
      listen: handleSocketEvents,
      on: setEventCallback,
      getDevices: function() { return devices; },
      getStats: function() { return stats; }
    }
  });
