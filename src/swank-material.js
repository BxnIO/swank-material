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
        return converter.makeHtml(String(content).replace(/\s{2}/g, '\n\n'));
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
      api: new Swank(this.api)
    });
    $rootScope.$on('swankloaded', function() {
      $scope.$broadcast('swankready');
      _self.api.groupPaths(_self.groupBy);
    });
  }
  SwankMaterialController.$inject = ['Swank', '$scope', '$rootScope'];
  var SwankMaterialComponent = {
    bindings: {api: '<', groupBy:'@?'},
    controller: SwankMaterialController,
    template: [
      '<swank-material-info></swank-material-info>',
      '<swank-material-path ng-repeat="(route, path) in $ctrl.api.objects.paths" path="path" heading="route"></swank-material-path>',
    ].join('\n')
  };

  function SwankMaterialInfoController($scope) {
    var _self = this;
    $scope.$on('swankready', function() {
      _self.infoBlock = _self.swank.api.doc.info;
      console.log(_self.infoBlock.description);
    });
  }
  SwankMaterialInfoController.$inject = ['$scope'];
  var SwankMaterialInfoComponent = {
    bindings: {},
    controller: SwankMaterialInfoController,
    require: {
      swank: '^swankMaterial'
    },
    template: [
      '<md-card>',
        '<md-card-header>',
          '<md-card-header-text layout="row">',
            '<span class="md-headline">',
              '{{$ctrl.infoBlock.title}} ',
              '<span class="md-caption">Version: {{$ctrl.infoBlock.version}}</span>',
            '</span>',
            '<span flex></span>',
            '<span ng-if="$ctrl.infoBlock.contact">',
              '<span ng="$ctrl.infoBlock.contact.email">',
                '<md-button type="button" class="md-icon-button" aria-label="Email" ng-href="mailto:{{$ctrl.infoBlock.contact.email}}">',
                  '<md-tooltip>Email {{$ctrl.infoBlock.contact.name||\'\'}}</md-tooltip>',
                  '<md-icon md-font-set="material-icons">mail</md-icon>',
                '</md-button>',
              '</span>',
              '<span ng-if="$ctrl.infoBlock.contact.url">',
                '<md-button type="button" class="md-icon-button" aria-label="Website" ng-href="{{$ctrl.infoBlock.contact.url}}" target="_blank">',
                  '<md-tooltip>Visit {{$ctrl.infoBlock.contact.url}}</md-tooltip>',
                  '<md-icon md-font-set="material-icons">open_in_browser</md-icon>',
                '</md-button>',
              '</span>',
            '</span>',
          '</md-card-header-text>',
        '</md-card-header>',
        '<md-card-content layout-padding ng-bind-html="$ctrl.infoBlock.description | parseMD"></md-card-content>',
        '<md-card-actions layout="row" layout-align="end center">',
          '<md-button ng-if="$ctrl.infoBlock.license.url" type="button" class="md-raised md-primary" aria-label="Released under {{$ctrl.infoBlock.license.name}}" ng-href="{{$ctrl.infoBlock.license.url}}" target="_blank">',
            'Released under {{$ctrl.infoBlock.license.name}}',
          '</md-button>',
          '<md-button ng-if="$ctrl.infoBlock.termsOfService" type="button" class="md-raised md-primary" aria-label="Terms of Service" ng-href="{{$ctrl.infoBlock.termsOfService}}" target="_blank">',
            'Terms of Service',
          '</md-button>',
        '</md-card-actions>',
      '</md-card>'
    ].join('\n')
  };


  function SwankMaterialPathController($scope) {
    var _self = this;
  }
  SwankMaterialPathController.$inject = ['$scope'];
  var SwankMaterialPathComponent = {
    bindings: {path:'<', heading:'<'},
    controller: SwankMaterialPathController,
    require: {
      swank: '^swankMaterial'
    },
    template: [
      '<md-card>',
        '<md-card-header>',
          '<md-card-header-text layout="row">',
            '<span class="md-headline">{{$ctrl.heading}}</span>',
          '</md-card-header-text>',
        '</md-card-header>',
        '<md-card-content layout-padding>',
          '<md-tabs md-dynamic-height md-border-bottom>',
            '<md-tab ng-repeat="(method, operation) in $ctrl.path" label="{{method}}">',
              '<pre>{{operation | json}}</pre>',
            '</md-tab>',
          '</md-tabs>',
        '</md-card-content>',
      '</md-card>'
    ].join('\n')
  };

  /*function SwankMaterialOperationController($scope) {}
  SwankMaterialOperationController.$inject = ['$scope'];
  var SwankMaterialOperationComponent = {
    bindings:{},
    controller: SwankMaterialOperationController,
    require:{
      swank: '^swankMaterial'
    },
    template: [

    ].joi('\n')
  };*/

  angular.module('swank.material', ['swank'])
    .factory('_', LoDashFactory)
    .filter('parseMD', SwankParseMDFilter)
    .component('swankMaterial', SwankMaterialComponent)
    .component('swankMaterialInfo', SwankMaterialInfoComponent)
    .component('swankMaterialPath', SwankMaterialPathComponent);
})(angular);