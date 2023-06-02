<?php

class System
{
	private $vars;
	private static $instance;
	public $_rutaEnlace;
	public $sesion;
	private $_queBD;
	private $_logger;	//objeto ErrorLogger
	private $_con;		//objeto BD
	private $_hat; 		//objeto hat
	private $_root;

	public $ajax;


	private function __construct()
	{

		require_once 'class.pdo.php'; 				// acceso a la BD
		require_once 'class.visor.php'; 			// Motor de plantillas
		require_once 'class.errorLogger.php'; 		// clase que controla los errores
		require_once 'class.fechas.php'; 			// clase fechas
		require_once 'class.hat.php'; 				// clase hat
		require_once 'class.shoe.php'; 				// clase shoe
		require_once 'class.check.php';
		require_once 'Mobile_Detect.php';
		require_once 'class.logger.php';
		require_once 'class.redis.php';




		$this->vars 	= array();
		session_start();
		$this->sesion	= $_SESSION;
		$this->_queBD	= "bd1";
	}

	//pongo el baseRef para la carga de css/img desde cualquier servidor
	//se define e config.php
	public function SetbaseRef($href)
	{
		$this->_rutaEnlace = $href;
		$_SESSION['baseRef'] = $href;
	}
	public function GetBaseRef()
	{
		return $this->_rutaEnlace;
	}

	public function fDameUrl()
	{
		return $this->_rutaEnlace;
	}

	public function getEnviroment()
	{
		return $this->get('environment');
	}

	//FUNCIÓN QUE MUESTRA LAS PLANTILLAS
	public function fShow($plantilla, $data)
	{
		try {
			if (!class_exists('Visor')) {
				throw new Exception("clase Visor no existe");
			} else {
				$this->sesion = $_SESSION;
				$this->visor = new Visor();
				$this->visor->fShow($plantilla, $data);
			}
		} catch (Exception $e) {
			$this->imprError($e->getMessage());
		}
	}

	public function getAuthorizationHeader()
	{
		$headers = null;
		if (isset($_SERVER['Authorization'])) {
			$headers = trim($_SERVER["Authorization"]);
		}

		if ($headers === $this->get('remoteLoggerBearer')) {
			return true;
		} else {
			return false;
		}
	}

	//FUNCIONES DE MANEJO DE ERRORES
	public function imprError($err)
	{
		try {
			if (!class_exists('ErrorLogger')) {
				throw new Exception("clase ErrorLogger no existe");
			} else {
				$this->_logger = ErrorLogger::singleton();
				if ($err == "") {
					throw new Exception("Error está vacio");
				} else {
					$this->_logger->imprError($err);
				}
			}
		} catch (Exception $e) {
			switch ($e->getMessage()) {
				case "clase ErrorLogger no existe":
					//no hagas nada, no hay handler de errores
					//	echo "no hay clase";
					break;
				case "Error está vacio":
					//no hagas nada, no hay handler error
					$this->_logger->imprError("Error está vacio");
					break;
			}
		}
	}

	//	Cargar el fichero de constantes de idioma
	public function loadConstantsCommon($lang)
	{
		if (empty($lang)) {
			$lang = LANG;
		}
		$url = $this->get('carpetaIncludes') . $lang . '/constants.php';
		require_once($url);
	}
	//VARIABLES QUE VIENEN DE config.php
	//Con set vamos guardando nuestras variables.
	public function set($name, $value)
	{
		if (!isset($this->vars[$name])) {
			$this->vars[$name] = $value;
		}
	}

	//Con get('nombre_de_la_variable') recuperamos un valor.
	public function get($name)
	{
		if (isset($this->vars[$name])) {
			return $this->vars[$name];
		}
	}

	//limpieza de html en contenidos para evitar inyección de código
	public function f_parse_html($str_input)
	{
		if (!is_string($str_input)) {
			return false;
		} else {
			$str_output = trim($str_input);
			$str_output = str_replace(chr(34), "&#34;", $str_output); 		// Comilla doble
			$str_output = str_replace(chr(13), "<br>", $str_output);		// Salto de línea
			$str_output = str_replace("&lt;i&gt;", "<i>", $str_output);		// <i>
			$str_output = str_replace("&lt;/i&gt;", "</i>", $str_output);	// </i>
			$str_output = str_replace("&lt;b&gt;", "<b>", $str_output);		// <b>
			$str_output = str_replace("&lt;/b&gt;", "</b>", $str_output);	//</b>
			return $str_output;
		}
	}

	//limpieza de variables que viene por GET para evitar ' \ '
	public function sanitize_get($var)
	{
		$retorno 	= 	strip_tags(stripslashes($var));
		$retorno	= 	str_replace("'", "", $retorno);
		return $retorno;
	}

	// Default behaviour: not delete internal spaces. Optional param $noSpaces = true, delete ALL spaces
	public function nohacker($inputString, $noSpaces = false)
	{
		// No spaces
		if ($noSpaces) {
			$results = preg_replace('/\s+/', '', $inputString);
		} else {
			$results = trim($inputString);
		}
		// No quotes
		$results = str_replace('"', 'QS', $results);
		// No simple quote
		$results = str_replace("'", 'QT', $results);
		// Escape special chars
		$request = addslashes($results);

		return $results;
	}

	public function obj2ArrRecursivo($obj)
	{
		if (is_object($obj)) {
			$obj = get_object_vars($obj);
		}
		if (is_array($obj)) {
			foreach ($obj as $key => $value) {
				$obj[$key] = $this->obj2ArrRecursivo($obj[$key]);
			}
		}
		return $obj;
	}

	/************************************************************************************
									DB con PDO
	 *************************************************************************************/

	//Inicio  registro bd del proyecto

	/*
	Definir cuantas bases de datos se usan:

	bd1-> base de datos 1
	bd2-> base de datos 2
	*/



	private function _initPDO($bd)
	{
		if ($bd == "bd1") {
			$host 	= $this->get('_servidor_bd1');
			$name 	= $this->get('_database_bd1');
			$user 	= $this->get('_user_bd1');
			$pwd 	= $this->get('_password_bd1');
		} else if ($bd == "bd2") {
			$host 	= $this->get('_servidor_bd2');
			$name 	= $this->get('_database_bd2');
			$user 	= $this->get('_user_bd2');
			$pwd 	= $this->get('_password_bd2');
		} else {
			$host 	= $this->get('_servidor_bd1');
			$name 	= $this->get('_database_bd1');
			$user 	= $this->get('_user_bd1');
			$pwd 	= $this->get('_password_bd1');
		}

		$pdo = new PDOdbp(PDO_PGSQL, $host, $name, $user, $pwd, $this->_set_dbids());
		return $pdo;
	}

	//Fin registro bd del proyecto

	function pdo_select($queDB, $sql, $npage = null, $nrow = null)
	{
		$pdo	= $this->_initPDO($queDB);
		$pdo->prepare_select($sql);
		$rs = $pdo->select();
		return ($rs);
	}

	function pdo_insert($queDB, $table, $fields, $values)
	{


		$pdo	= $this->_initPDO($queDB);
		$pdo->prepare_insert($table, $fields);
		$last_id = $pdo->insert($values);

		return ($last_id);
	}

	function pdo_update($queDB, $table, $fields, $values, $id = null, $where = null)
	{
		$pdo	= $this->_initPDO($queDB);
		$pdo->prepare_update($table, $fields, $id, $where);
		$pdo->update($values);
	}

	function pdo_delete($queDB, $table, $ids = null, $where = null)
	{
		$pdo	= $this->_initPDO($queDB);
		$pdo->prepare_delete($table, $ids, $where);
		$pdo->delete();
	}

	private static function _set_dbids()
	{
		$dbids = new DBids();
		return ($dbids);
	}

	/************************************************************************************
							END	DB con PDO
	 *************************************************************************************/

	/***
		Method renderError
			renders error only in dev environment

		@access public
		@param msg

	 ***/

	public function	renderError($msg)
	{
		if ($this->get('environment') === "dev") {
			echo '<pre style="color:red"><b>';
			echo $msg;
			echo '</b></pre>';
		}
	}

	/************************************************************************************
									System Singleton
	 *************************************************************************************/
	public static function singleton()
	{
		if (!isset(self::$instance)) {
			$c = __CLASS__;
			self::$instance = new $c;
		}

		return self::$instance;
	}
}
