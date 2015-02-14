angular.module(PKG.name + '.feature.workflows')
  .config(function($stateProvider, $urlRouterProvider, MYAUTH_ROLE) {
    $stateProvider
      .state('workflows', {
        url: '/workflows',
        abstract: true,
        parent: 'programs',
        data: {
          authorizedRoles: MYAUTH_ROLE.all,
          highlightTab: 'development'
        },
        template: '<ui-view/>'
      })
        .state('workflows.list', {
          url: '/list',
          templateUrl: '/assets/features/workflows/templates/list.html',
          controller: 'WorkflowsListController',
          ncyBreadcrumb: {
            skip: true
          }
        })
        .state('workflows.detail', {
          url: '/:programId',
          templateUrl: '/assets/features/workflows/templates/detail.html',
          controller: 'WorkflowsDetailController',
          onEnter: function($state, $timeout) {

            $timeout(function() {
              if ($state.is('workflows.detail')) {
                $state.go('workflows.detail.runs');
              }
            });

          }
        })
          .state('workflows.detail.runs', {
            url: '',
            templateUrl: '/assets/features/workflows/templates/tabs/runs.html',
            controller: 'WorkflowsDetailRunController',
            ncyBreadcrumb: {
              parent: "apps.detail.overview",
              label: "{{$state.params.programId}}"
            }
          })

            .state('workflows.detail.runs.detail', {
              url: '/runs/:runId',
              template: '<ui-view/>',
              abstract: true,
              ncyBreadcrumb: {
                skip: true
              }
            })
              .state('workflows.detail.runs.detail.flow', {
                url: '/flow',
                template: 'Flow Blah',
                ncyBreadcrumb: {
                  parent: "apps.detail.overview",
                  label: "{{$state.params.programId}} / {{$state.params.runId}}"
                }
              })

              .state('workflows.detail.runs.detail.data', {
                url: '/data',
                template: 'Data Blah',
                ncyBreadcrumb: {
                  parent: "apps.detail.overview",
                  label: "{{$state.params.programId}} / {{$state.params.runId}}"
                }
              })
              .state('workflows.detail.runs.detail.configuration', {
                url: '/configuration',
                template: 'Configuration Blah',
                ncyBreadcrumb: {
                  parent: "apps.detail.overview",
                  label: "{{$state.params.programId}} / {{$state.params.runId}}"
                }
              })
              .state('workflows.detail.runs.detail.log', {
                url: '/log',
                template: 'Log Blah',
                ncyBreadcrumb: {
                  parent: "apps.detail.overview",
                  label: "{{$state.params.programId}} / {{$state.params.runId}}"
                }
              })

          .state('workflows.detail.schedules', {
            url: '/schedules',
            templateUrl: '/assets/features/workflows/templates/tabs/schedules.html',
            ncyBreadcrumb: {
              parent: "apps.detail.overview",
              label: "{{$state.params.programId}}"
            }
          })
          .state('workflows.detail.metadata', {
            url: '/metadata',
            templateUrl: '/assets/features/workflows/templates/tabs/metadata.html',
            ncyBreadcrumb: {
              parent: "apps.detail.overview",
              label: "{{$state.params.programId}}"
            }
          })
          .state('workflows.detail.history', {
            url: '/history',
            templateUrl: '/assets/features/workflows/templates/tabs/history.html',
            ncyBreadcrumb: {
              parent: "apps.detail.overview",
              label: "{{$state.params.programId}}"
            }
          })
          .state('workflows.detail.resources', {
            url: '/resources',
            templateUrl: '/assets/features/workflows/templates/tabs/resources.html',
            ncyBreadcrumb: {
              parent: "apps.detail.overview",
              label: "{{$state.params.programId}}"
            }
          });
  });
