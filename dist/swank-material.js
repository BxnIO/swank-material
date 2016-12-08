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
      if (typeof content === 'string') {
        try {
          if (!_.isObject(showdown)) {
            throw new Error('Showdown library not found.');
          }
          var converter = new showdown.Converter({
            ghCodeBlocks: true,
            tasklists: true,
            tables: true,
            omitExtraWLInCodeBlocks: true
          });
          return converter.makeHtml(content);
        } catch (err) {
          $log.error(err);
          return;
        }
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
    var _self = angular.extend(this, { api: null, loading: true });
    $rootScope.$on('swankloading', function() {
      _self.loading = true;
    });
    $rootScope.$on('swankloaded', function() {
      $scope.$broadcast('swankready');
      _self.loading = false;
    });
    _self.$onChanges = function(changed) {
      if (changed.api.currentValue !== changed.api.previousValue) {
        _self.api = new Swank(changed.api.currentValue);
      }
    };
  }
  SwankMaterialController.$inject = ['Swank', '$scope', '$rootScope'];
  var SwankMaterialComponent = {
    bindings: {api: '<', groupBy:'@?'},
    controller: SwankMaterialController,
    template: [
      '<md-content ng-if="$ctrl.loading" layout="row" layout-sm="column" layout-align="space-around">',
        '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
      '</md-content>',
      '<md-content layout="row" layout-sm="column" ng-if="!$ctrl.loading">',
        '<swank-material-info info="$ctrl.api.doc.info"></swank-material-info>',
        '<swank-material-path ng-repeat="(route, path) in $ctrl.api.objects.paths" path="path" heading="route"></swank-material-path>',
      '</md-content>'
    ].join('\n')
  };

  var SwankMaterialInfoComponent = {
    bindings: {info:'<'},
    require: { swank: '^swankMaterial' },
    template: [
      '<md-card>',
        '<md-card-header>',
          '<md-card-header-text layout="row">',
            '<span class="md-headline">',
              '{{$ctrl.info.title}} ',
              '<span class="md-caption" ng-if="$ctrl.info.version">Version: {{$ctrl.info.version}}</span>',
            '</span>',
            '<span flex></span>',
            '<span ng-if="$ctrl.info.contact">',
              '<span ng="$ctrl.info.contact.email">',
                '<md-button type="button" class="md-icon-button" aria-label="Email" ng-href="mailto:{{$ctrl.info.contact.email}}">',
                  '<md-tooltip>Email {{$ctrl.info.contact.name||\'\'}}</md-tooltip>',
                  '<md-icon md-font-set="material-icons">mail</md-icon>',
                '</md-button>',
              '</span>',
              '<span ng-if="$ctrl.info.contact.url">',
                '<md-button type="button" class="md-icon-button" aria-label="Website" ng-href="{{$ctrl.info.contact.url}}" target="_blank">',
                  '<md-tooltip>Visit {{$ctrl.info.contact.url}}</md-tooltip>',
                  '<md-icon md-font-set="material-icons">open_in_browser</md-icon>',
                '</md-button>',
              '</span>',
            '</span>',
          '</md-card-header-text>',
        '</md-card-header>',
        '<md-card-content layout-padding ng-bind-html="$ctrl.info.description | parseMD"></md-card-content>',
        '<md-card-actions layout="row" layout-align="end center">',
          '<md-button ng-if="$ctrl.info.license.url" type="button" class="md-raised md-primary" aria-label="Released under {{$ctrl.info.license.name}}" ng-href="{{$ctrl.info.license.url}}" target="_blank">',
            'Released under {{$ctrl.info.license.name}}',
          '</md-button>',
          '<md-button ng-if="$ctrl.info.termsOfService" type="button" class="md-raised md-primary" aria-label="Terms of Service" ng-href="{{$ctrl.info.termsOfService}}" target="_blank">',
            'Terms of Service',
          '</md-button>',
        '</md-card-actions>',
      '</md-card>'
    ].join('\n')
  };

  var SwankMaterialPathComponent = {
    bindings: {path:'<', heading:'<'},
    require: { swank: '^swankMaterial' },
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

  angular.module('swank.material', ['swank'])
    .factory('_', LoDashFactory)
    .filter('parseMD', SwankParseMDFilter)
    .component('swankMaterial', SwankMaterialComponent)
    .component('swankMaterialInfo', SwankMaterialInfoComponent)
    .component('swankMaterialPath', SwankMaterialPathComponent);
})(angular);