/*jshint esversion: 6 */
angular.module('app').expandControllerNotifications = function($scope,$rootScope,blockUI,data){
  const fileName = 'controller.notifications.js 1.0.0';
  var log = data.sharedMethods.log,
  baseHref = data.baseHref,
  notifications_strings = data.strings,
  formsSewernet = data.sharedModules.formsSewernet,
  mapFactory = data.sharedModules.mapFactory,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  _selectActiveTab= data.sharedMethods._selectActiveTab,
  hidePreviousForms = data.sharedMethods.hidePreviousForms;
  mc = data.mc;
  log(fileName,"expandControllerNotifications","info",data);

  const _notifications = new Notifications({
      'baseHref': baseHref,
      'token': data.token,
      'env': data.env,
      'strings': notifications_strings,
      'project_id': data.project_id,
  });

  $scope.openNotificationForm = function(){
    _notifications.getNotificationForm().then((msg)=>{
      log(fileName,"getNotificationForm","info",msg);
      mc.clickedButton ='notification';
      _renderNotificationForm(msg);
    }).catch((e)=>{

    });
  };

  function _renderNotificationForm(msg){
    log(fileName,"_renderNotificationForm())","info",msg);
    mc.clickedAction = null;
    $rootScope.feature = [];
    mc.activeTab = msg.activeTab;
    mc.filterTabs = msg.formTabs;
    mc.formFilters = true;
    mc.formName = msg.formName;
    mc.formId = msg.formId;
  //  mc.formFeatureData = msg.feature;
  //  mc.formParameters = msg.formTabs[msg.activeTab.activeTabIndex].tabFunction.parameters;
    //mc.formPagination = msg.formTabs[msg.activeTab.activeTabIndex].pageInfo;

    applyChangesToScope();
    _selectActiveTab(0,'dynamicForm');
  }

  $rootScope.notificationSelectedRole = function(value){
    log(fileName,"notificationSelectedRole("+value+")","info",$rootScope.feature);
    _notifications.getUsers(value).then((msg)=>{
      log(fileName,"getUsers","info",msg);
      _renderNotificationForm(msg);
      applyChangesToScope();
    }).catch((e)=>{
      log(fileName,"getUsers","error",e);
    });
  };

  $rootScope.notificationSelectedUser = function(value){
    log(fileName,"notificationSelectedUser("+value+")","info",$rootScope.feature);
    _notifications.setUser(value);
  };

  $rootScope.buildNotification = function(){
    log(fileName,"buildNotification()","info");
    _notifications.buildNotification(notifications_strings.NOTIFY_SUBJECT,$rootScope.visitFormContent,mc.point_coordinates,mc.epsg,mc.infoTableName,mc.pol_id,mc.pol_id_name).then(()=>{
      log(fileName,"notifyAction","success");
    }).catch((e)=>{
      log(fileName,"notifyAction","error",e);
      notifyEvent(notifications_strings.NOTIFY_ERROR_NO_USER,"warning",true);
    });
  };
};
