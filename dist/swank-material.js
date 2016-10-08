/* globals showdown */
(function(angular) {
  'use strict';
  /**
   * Tests to ensure that Lodash available.
   */
  function LoDashFactory($window, $log) {
    try {
      if (!$window._) {
        throw new Error('LoDash library not found');
      }
      return $window._;
    } catch (err) {
      $log.error(err);
    }
  }
  LoDashFactory.$inject = ['$window', '$log'];
  /**
   * Markdown content filter / parser
   */
  function SwankParseMDFilter($log) {
    return function(content) {
      try {
        if (!_.isObject(showdown)) {
          throw new Error('Showdown library not found.');
        }
        showdown.setOption('tables', true);
        var converter = new showdown.Converter();
        return converter.makeHtml(content);
      } catch (err) {
        $log.error(err);
        return;
      }
    };
  }
  SwankParseMDFilter.$inject = ['$log'];
  /**
   * This is the controller for the prime component. 
   * 
   * @param {Object} Swank      Core Swank parser / validator
   * @param {Object} $scope     Angular's $scope object
   * @param {Object} $rootScope Angular's $rootScope object
   */
  function SwankMaterialController(Swank, $scope, $rootScope) {
    var _self = angular.extend(this, {
      api: new Swank(this.api),
      swankListener: $rootScope.$on('swankloaded', function() {
        $scope.$broadcast('swankready');
        _self.api.groupPaths(_self.groupBy);
      })
    });
  }
  SwankMaterialController.$inject = ['Swank', '$scope', '$rootScope'];
  var SwankMaterialComponent = {
    bindings: {api: '<', groupBy:'@?'},
    controller: SwankMaterialController,
    template: [
      '<swank-material-info></swank-material-info>',
        /*'<md-card-header>',
          '<md-card-header-text layout="row">',
            '<span class="md-headline">Swank - Material Design</span>',
          '</md-card-header-text>',
        '</md-card-header>',
        '<md-card-content>',
          '<pre>{{$ctrl.api | json}}</pre>',
        '</md-card-content>',
      '</md-card>'*/
    ].join('\n')
  };

  function SwankMaterialInfoController() {}
  var SwankMaterialInfoComponent = {
    bindings: {},
    require: {
      swank: '^swankMaterial'
    },
    template: [
      '<md-card>',
        '<md-card-header>',
          '<md-card-header-text layout="row">',
            '<span class="md-headline">',
              '{{$ctrl.swank.api.doc.info.title}} ',
              '<span class="md-caption">Version: {{$ctrl.swank.api.doc.info.version}}</span>',
            '</span>',
          '</md-card-header-text>',
        '</md-card-header>',
        '<md-card-content>',
          '<div ng-bind-html="$ctrl.swank.api.doc.info.description | parseMD"></div>',
          /*'<pre>{{$ctrl.swank.api.doc.info | json}}</pre>',*/
        '</md-card-content>',
      '</md-card>'
    ].join('\n')
  };
    /*"info": {
      "description": "This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.",
      "version": "1.0.0",
      "title": "Swagger Petstore",
      "termsOfService": "http://swagger.io/terms/",
      "contact": {
        "email": "apiteam@swagger.io"
      },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      }
    },*/


  angular.module('swank.material', ['swank'])
    .factory('_', LoDashFactory)
    .filter('parseMD', SwankParseMDFilter)
    .component('swankMaterial', SwankMaterialComponent)
    .component('swankMaterialInfo', SwankMaterialInfoComponent);
})(angular);