<?php
/****************************************************
 * CLASS ErrorLogger

 
***************************************************/
class ErrorLogger{
	private static $instancia = null; n
	private $_fecha;
	private $_system;
	function __construct(){
		$this->_system = System::singleton();
		$ObFecha=new Fecha();
		$this->_fecha=$ObFecha->soloFecha();
	}
	public static function singleton() 
	{
		if( self::$instancia == null ) 
		{
			self::$instancia = new self();
		}
			return self::$instancia;
	}
	public function imprError($err){

		echo "ERROR: ".$err." - ".$this->_fecha."<br>";
		

	}
	

}
