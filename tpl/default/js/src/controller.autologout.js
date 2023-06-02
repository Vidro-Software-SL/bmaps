/*jshint esversion: 6 */
angular.module("app").expandControlleAutologout = function (
  $scope,
  $rootScope,
  blockUI,
  data
) {
  var fileName = "controller.autologout.js 1.0.0",
    log = data.sharedMethods.log,
    baseHref = data.baseHref,
    notifications_strings = data.strings,
    applyChangesToScope = data.sharedMethods.applyChangesToScope,
    notifyEvent = data.sharedMethods.notifyEvent,
    displayMapError = data.sharedMethods.displayMapError;
  mc = data.mc;
  log(fileName, "expandControlleAutologout", "info", data);
  //The number of seconds that have passed
  //since the user was active.
  var secondsSinceLastActivity = 0;

  //30 minutes. 60 x 30 = 1800 seconds.
  var maxInactivity = 1800;
  if (mc.autologout) {
    activityWatcher();
  }
  function activityWatcher() {
    log(fileName, "activityWatcher()", "info");
    //Setup the setInterval method to run
    //every second. 1000 milliseconds = 1 second.
    setInterval(function () {
      secondsSinceLastActivity++;
      //log(fileName,secondsSinceLastActivity + ' seconds since the user was last active',"info");
      //if the user has been inactive or idle for longer
      //then the seconds specified in maxInactivity
      if (secondsSinceLastActivity > maxInactivity) {
        log(
          fileName,
          "User has been inactive for more than " + maxInactivity + " seconds",
          "info"
        );
        location.href = `${baseHref}logout.php`;
      }
    }, 1000);

    //The function that will be called whenever a user is active
    function activity() {
      //reset the secondsSinceLastActivity variable
      //back to 0
      secondsSinceLastActivity = 0;
    }

    //An array of DOM events that should be interpreted as
    //user activity.
    var activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    //add these events to the document.
    //register the activity function as the listener parameter.
    activityEvents.forEach(function (eventName) {
      document.addEventListener(eventName, activity, true);
    });
  }
};
