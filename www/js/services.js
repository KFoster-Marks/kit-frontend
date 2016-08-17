'use strict';

angular.module('KitApp.services', [])

//-----------------------------------------------------------------------------
// IF YOU NEED TO CHANGE THE DATABASE YOU'RE HITTING, DO IT HERE.

//commment IN to hit LIVE HEROKU HOSTED DATABASE!
//p.s. - you'll need to comment out the constant BELOW this one too!
.constant("routeToAPI", {
        "url": "https://keep-intouch.herokuapp.com",
    })

// //comment IN to hit LOCALLY HOSTED DATABASE!
// //p.s. - you'll need to comment out the constant ABOVE this one too!
// .constant("routeToAPI", {
//         "url": "http://localhost:3000",
//     });
//-----------------------------------------------------------------------------

.service('LoginService', ['$http', '$location', '$window', 'ContactService', 'routeToAPI', function($http, $location, $window, ContactService, routeToAPI) {
  var vm = this;

  if ($window.sessionStorage.token) {
    vm.loginView = {show:false};
  } else {
    vm.loginView = {show:true};
  }

  vm.getContacts = ContactService.getContacts;

  vm.contacts;

  vm.login = function(username, password) {
    $http.post(routeToAPI.url + '/auth/login', {username: username, password: password})
    .then(function(response) {
      console.log(response);
      $window.sessionStorage.token = response.data.token;
      vm.loginView.show = false;
      $window.sessionStorage.id = response.data.id;
      ContactService.getContacts();
      $location.path('/tab/home');
    })
    .catch(function(err) {
      console.log(err);
      delete $window.sessionStorage.token;
      vm.loginView.show = true;
    });
  };

  vm.logout = function() {
    delete $window.sessionStorage.token;
    vm.loginView.show = true;
    delete $window.sessionStorage.id;
  };

}])

.service('SignupService', ['$http', '$location', '$window', 'routeToAPI', function($http, $location, $window, routeToAPI) {
  var vm = this;
  vm.signup = function(user) {
    $http.post(routeToAPI.url + '/auth/signup', {username: user.username, password: user.password})
    .then(function(response){
      console.log(response);
      $window.sessionStorage.token = response.data.token;
      $window.sessionStorage.id = response.data.id;
      $location.path('/tab/home');
    })
    .catch(function(err) {
      console.log(err);
    });
  };
}])

.service('ContactService', ['$http', '$ionicPopup', '$window', '$cordovaContacts', 'routeToAPI', function($http, $ionicPopup, $window, $cordovaContacts, routeToAPI) {
  var sv = this;

  sv.contacts = {};
  sv.addContactForm =   {};

  sv.getContacts = function(id) {
     id = $window.sessionStorage.id;
    $http.get(routeToAPI.url + '/users/' + id + '/contacts')
      .then(function(response) {

        console.log('getContacts response: ', response.data);

        sv.contacts.arr = response.data;

        sv.contacts.length = response.data.length;

        //add showFormFunc method
        for (var i = 0; i < sv.contacts.arr.length; i++) {

          sv.contacts.arr[i].showForm = false;
          sv.contacts.arr[i].showFormFunc = function() {
            if(this.showForm === true) {
              return this.showForm = false;
            } else if(this.showForm === false) {
              return this.showForm = true;
            }
          };

          sv.contacts.arr[i].deleteContact = function() {
            var thisContact = this;
            console.log(thisContact);
            var contactId = this.id;
            $http.delete('http://localhost:3000/users/' + id + '/contacts/' + contactId)
            .then(function(response) {
              console.log(thisContact);
              console.log(response);
            })
            .catch(function(err) {
              console.log(err);
            });
          };

        }

        sv.contacts.getRandomContact = function(input) {
          input = this.arr;
          var randInt = Math.floor(Math.random() * (input.length));
          // var lastContact = new Date(input[randInt].last_contact.substr(0,10)).getTime() / 1000;
          // var freq = input[randInt].frequency_of_contact * 86164;
          // var now = Date.now() / 1000;
          // console.log('Now: ' + now + ' Last: ' + lastContact + ' Freq: ' + freq);
          this.randomContact = input[randInt];
        };

        sv.contacts.getRandomContact();

        sv.contacts.updateLastContact = function() {
          this.randomContact.last_contact =  new Date();
          $http.put(routeToAPI + '/users/' + id + '/contacts/' + this.randomContact.id, this.randomContact)
          .then(function(response) {
            console.log(response);
            this.randomContact.contacted = true;
            sv.contacts.showAlert();
          })
          .catch(function(err) {
            console.log(err);
          });
        };

        sv.contacts.showAlert = function() {
          var alertPopup = $ionicPopup.alert({
            title: 'Nice!',
            template: 'Feel free to stop for the day, or keep going!'
          });
          alertPopup.then(function(res) {
            console.log(res);
          });
        };
      })
      .catch(function(err) {
        console.log('getContacts ERR:', err);
      });
    };

  sv.addContact = function(name, phone, email, relationship, freq, notes){
    var id = $window.sessionStorage.id;
    console.log(name, phone, email, relationship, freq, notes);
    $http.post(routeToAPI.url + '/users/' + id + '/contacts', {name:name, phone:phone, email:email, relationship:relationship, frequency_of_contact:freq, notes:notes})
    .then(function(response){
      console.log('successfully posted a new contact');
      console.log(response.data);
    })
    .catch(function(err){
      console.log('posting new contact didn\'t work');
      console.log(err);
    });
  };

  // sv.deleteContact = function() {
  //   var contactId = this.id;
  //   $http.delete('http://localhost:3000/users/' + id + '/contacts/' + contactId)
  //   .then(function(response) {
  //
  //   });
  // };

}])

.service('authInterceptor', ['$q', '$window', function($q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    response: function(response) {
      if(response.status === 400) {
        // handle the case where the user is not authenticated
        console.log(response);
      }
      return response || $q.when(response);
    }
  };
}]);
