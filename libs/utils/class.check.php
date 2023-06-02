<?php
/****************************************************
 * CLASS check
 *

 * Checks Session
***************************************************/
class Check{

	public function __construct($needed=true){
		if ($needed === true){

			if(isset($_SESSION)) {
        if(isset($_SESSION['logged'])){

  				if(!$_SESSION['logged']){
  					header('Location:index.php');
  					exit();
  				}
  			}else{
          header('Location:index.php');
          exit();
        }
      }else{

        header('Location:index.php');
        exit();
      }
		}
	}

  public function isLogged(){
    if(isset($_SESSION)) {
      if(!isset($_SESSION['logged'])){
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }

	public function isExplorer(){
    $u_agent = $_SERVER['HTTP_USER_AGENT'];
    if (preg_match('/MSIE/i',$u_agent)){
        return true;
    }else{
      return false;
    }
  }

  public function checkAccessProject(){
    $found	= false;
    if(is_array($_SESSION['user_projects'])){
      if(count($_SESSION['user_projects'])>0){
  	    foreach($_SESSION['user_projects'] as $project){
  		    if($project['project_id']==$_SESSION['currentProject']){
  			    $found = true;
  			    break;
  		    }
  	    }
      }
    }
    if($found){
    	return true;
    }else{
	    return false;
    }
  }

}
?>
