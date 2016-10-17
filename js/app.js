(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController )
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItemsDirective)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com");

function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'js/foundItems.template.html',
    scope: {
      items: '<',
      myTitle: '@title',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'narrow',
    bindToController: true
  };

  return ddo;
}

function FoundItemsDirectiveController() {
  var narrow = this;
}

NarrowItDownController .$inject = ['MenuSearchService', '$timeout'];
function NarrowItDownController(MenuSearchService, $timeout) {
  var narrow = this;
  narrow.searchTerm = "";
  narrow.message = false;
  narrow.found = MenuSearchService.getItems();

  var origTitle = "Found Items";
  //narrow.title = origTitle + " (" + narrow.found.length + " items )";

  // Function triggered on clicking "Narrow It Down" button
  // Pulls searchTerm from input field and fetches matching items containing searchTerm in their description
  narrow.getMatchedMenuItems = function () {
    narrow.found.length = 0;
    if (narrow.searchTerm != "") {
      MenuSearchService.getMatchedMenuItems(narrow.searchTerm);
      narrow.message = false;
      $timeout(function () {
        if (narrow.found.length > 0) {
          narrow.title = origTitle + " (" + narrow.found.length + " items )";

        } else {
          narrow.message = true;
        }
      }, 2000);
    } else {
      narrow.message = true;
    }
  }

  // Function to remove unwanted item from the found array
  narrow.removeItem = function (itemIndex) {
    MenuSearchService.removeItem(itemIndex);
    narrow.title = origTitle + " (" + narrow.found.length + " items )";
  }
}


MenuSearchService.$inject = ['$http', 'ApiBasePath']
function MenuSearchService($http, ApiBasePath) {
  var service = this;
  var matched_items = [];

  service.getItems = function () {
    return matched_items;
  }

  service.getMatchedMenuItems = function (searchTerm) {
    matched_items.length = 0;
    $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json")
    }).then(function (response) {
      var all_items = response.data.menu_items;
      for(var i = 0; i < all_items.length; i++) {
        if (all_items[i].description.indexOf(searchTerm) !== -1) {
          matched_items.push(all_items[i]);
        }
      }
    })
    .catch(function (error) {
      console.log("Something went terribly wrong.");
    });
  }

  service.removeItem = function (itemIndex) {
    matched_items.splice(itemIndex, 1);
  };
}

})();
