<?php
class ControllerIndex
{
  private $_system;
  function __construct()
  {
    require_once 'libs/config.php';
    $this->_system = System::singleton();

    $project_id = (empty($_GET['w'])) ? null : $this->_system->nohacker($_GET['w']);
    $table = (empty($_GET['table'])) ? null : $this->_system->nohacker($_GET['table']);
    $id_name = (empty($_GET['id_name'])) ? null : $this->_system->nohacker($_GET['id_name']);
    $pol_id = (empty($_GET['pol_id'])) ? null : $this->_system->nohacker($_GET['pol_id']);
    if ($table && $id_name && $pol_id && $project_id) {
      setcookie("directLink", "w=" . $project_id . "&table=" . $table . "&id_name=" . $id_name . "&pol_id=" . $pol_id, time() + 3600);
    }
    $check = new Check();
    $this->_hat = new Hat();
    $this->_shoe = new Shoe();
    $data["baseHref"] = $this->_system->GetBaseRef();
    $data['env'] = $this->_system->get('environment');
    $data['touchDevice'] = 0;
    $detect = new Mobile_Detect();
    if ($detect->isMobile() && !$detect->isTablet()) {
      $data['touchDevice']    = 1;
    }

    if (isset($_GET['d'])) {
      $_SESSION['debug'] = (empty($_GET['d'])) ? 0 : $_GET['d'];
    }

    require_once 'libs/apps/users/class.users.php';
    $users = new Users();

    setcookie("directLink", "", time() - 3600);
    if (!isset($_SESSION['user_id'])) {
      header('location:error.php?e=no_project_access');
    }
    $canAccess = $users->checkUserCanAccessProject($_SESSION['user_id'], $project_id);
    if ($canAccess['status'] === "Accepted") {
      $_SESSION['currentProject'] = $project_id;
      $_SESSION['currentProject_name'] = $canAccess['message']['project_name'];
      $_SESSION['project_skin'] = $canAccess['message']['skin'];
      $_SESSION['project_type'] = $canAccess['message']['project_type'];
      $_SESSION['info_type'] = $canAccess['message']['info_type'];
      $_SESSION['project_schema'] = $canAccess['message']['project_schema'];
      $logData   = array(
        "ip" => $_SERVER['REMOTE_ADDR'],
        "agent" => $_SERVER['HTTP_USER_AGENT'],
        "user_id"  => $_SESSION['user_id'],
        "user" => $_SESSION['user_email'],
        "token" => $_SESSION['token'],
        "evt" => "ACCESS_PROJECT_OK",
        "msg" => "Successful access to project " . $project_id,
        "status" => "OK",
        "project_id" => $project_id,
        "project_skin" => $_SESSION['project_skin'],
        "project_schema" => $_SESSION['project_schema'],
        "project_type" => $_SESSION['project_type'],
        "info_type" => $_SESSION['info_type'],
        "source" => __FILE__
      );

      Logger::storeAccess($logData);
      $data['project_id'] = $_SESSION['currentProject'];
      $data['Project_name'] = $_SESSION['currentProject_name'];
      $data['project_skin'] = $_SESSION['project_skin'];
      $data['project_type'] = $_SESSION['project_type'];
      $data['info_type'] = $_SESSION['info_type'];
      $data['project_schema'] = $_SESSION['project_schema'];
      $data['urlWMS'] = $this->_system->get('urlWMS');
      $data['urlWMTS'] = $this->_system->get('urlWMTS');
      $data['urlSocket'] = $this->_system->get('urlSocket');
      $data['projects_number'] = $_SESSION['projects_number'];
      $data['project_type'] = $_SESSION['project_type'];
      $data['info_type'] = $_SESSION['info_type'];
      $data['userName'] = $_SESSION['user_email'];
      $data['wsToken'] = $_SESSION['wsToken'];
      if ($this->_system->get('offlineLogin')) {
        $data['offlineLogin'] = true;
      } else {
        $data['offlineLogin'] = false;
      }
      $data['offlineStoreName']  = $this->_system->get('offlineStoreName');
      $data['offlineCacheVersion'] = $this->_system->get('offlineCacheVersion');
      $data['offlineLocalForageVersion'] = $this->_system->get('offlineLocalForageVersion');
      $data['serverInstance'] = $this->_system->get('serverInstance');
      $data['email'] = $_SESSION['full_email'];
      $data["skin"] = $_SESSION['project_skin'];
      $data['user_id'] = $_SESSION['user_id'];
      $defaultTableLimit = (empty($this->_system->get('defaultTableLimit')))       ? 20     : $this->_system->get('defaultTableLimit');
      $data['limit'] = 10;
      $data['debug'] = $_SESSION['debug'];

      $this->_system->fShow($_SESSION['project_skin'] . "/tpl_project.php", $data);
    } else {
      $logData["msg"] = "Failed access to project " . $project_id;
      $logData["evt"] = "ACCESS_PROJECT_KO";
      $logData["status"] = "KO";
      Logger::storeAccess($logData);
      $_SESSION['currentProject']  = null;
      header('location:error.php?e=no_project_access');
    }
  }
}
new ControllerIndex();
