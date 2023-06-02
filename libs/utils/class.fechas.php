<?php
/****************************************************
 * CLASS Fechas

 * FUNCIONES *
 - soloFecha() -> devuelve DD-MM-AAAA
 - fechaMysql() -> devuelve fecha y hora actual para mysql (se podr�a usar en now() de mysql)
 - formatea($fecha) -> devuelve DD-MM-AAAA<br>H:Mh de una fecha en formato AAAA-MM-DD H M (DATETIME de mysql)
 - formateaSoloFecha($fecha) -> devuelve DD-MM-AAAA de una fecha guardada como AAAA-MM-DD (DATE de mysql)
 - fFechaYhora -> hace lo mismo formatea($fecha), pero como soy tonto y no miro lo que hab�a ahora la funci�n est� duplicada. Co�o.
 
***************************************************/
class Fecha{
	
	private $_meses;
	private $_ahora;
	function __construct(){
		
		$this->_ahora=time();
		$this->_meses=array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
	}
		
	function soloFecha(){
		return strftime ("%d_%m_%Y", $this->_ahora);
	}
	
	function fechaMysql(){
		return (strftime ("%Y-%m-%d %H:%M", $this->_ahora));
	}
	
	function formatea($fecha){
		$fe=explode(" ",$fecha);
		$dia=explode("-",$fe[0]);
		$ho=explode(":",$fe[1]);
		$newFecha=$dia[2]."-".$dia[1]."-".$dia[0]." / ".$ho[0].":".$ho[1]."h";
		return $newFecha;
 	}
 	
 	function formateParaDatePicker($fecha){
 		$fe=explode(" ",$fecha);
		$dia=explode("-",$fe[0]);
		$newFecha=$dia[0]."-".$dia[1]."-".$dia[2];
		return $newFecha;
 	}
	function formateaSoloFecha($fecha){
		$fe=explode(" ",$fecha);
		$dia=explode("-",$fe[0]);
		$newFecha=$dia[2]."-".$dia[1]."-".$dia[0];
		return $newFecha;
 	}
 	
	function formateaSoloHora($fecha){
		$fe=explode(" ",$fecha);
		$dia=explode(":",$fe[1]);
		$newFecha=$dia[0].":".$dia[1];
		return $newFecha;
 	}
	function fFechaYhora(){
		return (strftime ("el %d-%m-%Y a las %H:%Mh", $this->_ahora));
	}
	
	
		
	//devuelve cuantos dias tiene un mes
	public function CuantosDiasTieneUnMes($mes,$ano){
		return cal_days_in_month(CAL_GREGORIAN, $mes, $ano); // 31		
	}
	
	public function Comparafechas($fechaEntrada){
		$fecha_actual = strtotime(date("d-m-Y H:i:00",time()));  
    	$fecha_entrada = strtotime($fechaEntrada);  
		if($fecha_actual > $fecha_entrada){  
			//fecha pasado
   			return "p";
 		}else{  
 			//fecha futura
		     return "f";  
		 }  
	}
}
