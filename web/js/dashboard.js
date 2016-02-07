/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


/* Begin user defined parameters */
/* ----------------------------- */
POLLING_MILLISECONDS = 1000;
DEFAULT_SOCKET_URL = 'http://www.hyperlocalcontext.com/hexoskin';
DEFAULT_ASSOCIATIONS_URL = 'http://www.hyperlocalcontext.com/associations/';
/* ----------------------------- */
/*  End user defined parameters  */


angular.module('dashboard', [ 'btford.socket-io', 'reelyactive.beaver' ])

  // Socket.io factory
  .factory('Socket', function(socketFactory) {
    return socketFactory( { ioSocket: io.connect(DEFAULT_SOCKET_URL) } );
  })


  // Dashboard controller
  .controller('DashCtrl', function($scope, $interval, $http, Socket, beaver) {

    $scope.hexoskins = {};
    $scope.places = {};

    beaver.listen(Socket);

    beaver.on('appearance', function(device) {
      update(device);
    });

    beaver.on('keep-alive', function(device) {
      update(device);
    });

    beaver.on('displacement', function(device) {
      update(device);
    });

    beaver.on('disappearance', function(event) {
    });


    function getHexoskinUser(device) {
      if(!device || !device.associations || !device.associations.tags) {
        return null;
      }
      if(device.associations.tags.substr(0,2) === 'HX') {
        return device.associations.tags.substr(2);
      }
      return null;
    }


    function update(device) {
      var user = updateHexoskins(device);
      if(user) {
        updatePlaces(device, user);
      }
    }


    function updateHexoskins(device) {
      var user = getHexoskinUser(device);
      if(!user) {
        return null;
      }
      if(!$scope.hexoskins.hasOwnProperty(user)) {
        $scope.hexoskins[user] = {};
        pollHexoskin(user);
      }
      $scope.hexoskins[user].device = device;
      return user;
    }


    function updatePlaces(device, user) {
      if(!device.tiraid || !device.tiraid.radioDecodings) {
        return;
      }
      var decodings = device.tiraid.radioDecodings;
      var rID;
      for(var cDecoding = 0; cDecoding < decodings.length; cDecoding++) {
        rID = decodings[cDecoding].identifier.value;
        if(rID && !$scope.places.hasOwnProperty(rID)) {
          $scope.places[rID] = { hexoskins: {} };
          // TODO: fetch association & metadata
        }
      }
      for(place in $scope.places) {
        if($scope.places[place].hexoskins.hasOwnProperty(user)) {
          delete $scope.places[place].hexoskins[user];
        }
      }
      rID = device.tiraid.radioDecodings[0].identifier.value;
      $scope.places[rID].hexoskins[user] = $scope.hexoskins[user];
    }


    function fetchHexoskin(user) {
      var url = '/users/' + user;
      $http.get(url)
        .success(function(data, status, headers, config) {
          $scope.hexoskins[user].sensors = data;
        })
        .error(function(data, status, headers, config) {
          console.log('Error querying ' + url);
        });
    }

    function pollHexoskin(user) {
      fetchHexoskin(user);
      setInterval(function() { fetchHexoskin(user); }, POLLING_MILLISECONDS);
    }

  });
