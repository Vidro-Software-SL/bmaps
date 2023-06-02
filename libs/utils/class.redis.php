<?php


class RedisBmaps{
	private static $instance;
	private $_system;
	private $_connected;
	private $_client;
	private $_redisHost;
	private $_currentHostNumber;
	private $_redisPwd;
	private $_redisPort;
	private $_database;

	function __construct($system){
		$this->_connected					= false;
		$this->_system 						= $system;
	}


	private function _connectToRedis($options){
		$options = $this->_setDefaultOptions($options);
		if(!$this->_connected || $this->_shouldIConnect($options)){
			try{
				$this->_client 						= new Redis();
				$this->_database					= $options['db'];
				$this->_currentHostNumber	= $options['hostNumber'];
				$this->_client->connect($this->_redisHost,$this->_redisPort);
				$this->_client->auth($this->_redisPwd);
				$this->_client->select($this->_database);
				$this->_connected		= true;
			} catch (Exception $e) {
				//log to bigbrother
				$logData = array(
											"status"						=> "Error",
											"function"					=> __FUNCTION__,
											"message"						=> "Redis error",
											"Exception"					=> $e->getMessage(),
											"ExceptionLine"			=> $e->getLine(),
											"ExceptionFile"			=> $e->getFile()

				);
				$this->_logToBigbrother($logData);
				$this->_system->renderError('Redis connection Exception',  $e->getMessage(), "\n");
				$this->_connected		= false;
			}
		}
		return 	$this->_connected;
	}

	/***********************************************************************************
	************************************************************************************
	***********************	              INSERTS          *****************************
	************************************************************************************
	***********************************************************************************/

	/***
		Method: setKey

			redis set

			@param $key <string>
			@param $value <*>
			@param $options <array> persist, nodisconnect
			@param $ttl <int> optional time to live
			@return boolean

	***/

	public function setKey($key,$value,$options,$ttl=null){
		if($this->_connectToRedis($options)){
			$response = $this->_client->set($key,$value);
			if($this->_persistToDisk($options)){
				if($this->_client->save()){
					$response = true;
				}else{
					//should log to bigbrother????
					$response = false;
				}
			}
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: setHash

			redis hMSet, sets a multiple key from an array

			@param $hash <string>
			@param $value <array>
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function setHash($hash,$value,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hMSet($hash,$value);
			if(array_key_exists("ttl",$options)){
				$this->_client->expire($hash,$options['ttl']);
			}

			if($this->_persistToDisk($options)){
				if($this->_client->save()){
					$response = true;
				}else{
					//should log to bigbrother????
					$response = false;
				}
			}
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: setHashKey

			redis hSet, sets the value for a given hash and key

			@param $hash <string>
			@param $key <string>
			@param $value <*>
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function setHashKey($hash,$key,$value,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hSet($hash,$key,$value);
			if($this->_persistToDisk($options)){
				if($this->_client->save()){
					$response = true;
				}else{
					//should log to bigbrother????
					$response = false;
				}
			}
			$this->_disconnect($options);
			return $response;
		}
	}

	/***********************************************************************************
	************************************************************************************
	***********************	            END  INSERTS       *****************************
	************************************************************************************
	***********************************************************************************/

	/***********************************************************************************
	************************************************************************************
	***********************	               DELETES           ***************************
	************************************************************************************
	***********************************************************************************/

	/***
		Method: deleteKey

			redis delete, deletes a full key

			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function deleteKey($key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->delete($key);
			if($this->_persistToDisk($options)){
				if($this->_client->save()){
					$response = true;
				}else{
					//should log to bigbrother????
					$response = false;
				}
			}
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: deleteHashKey

			redis hDel, deletes a hash-key

			@param $hash <string>
			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function deleteHashKey($hash,$key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hDel($hash,$key);
			if($this->_persistToDisk($options)){
				if($this->_client->save()){
					$response = true;
				}else{
					//should log to bigbrother????
					$response = false;
				}
			}
			$this->_disconnect($options);
			return $response;
		}
	}

	/***********************************************************************************
	************************************************************************************
	***********************	              END DELETES      *****************************
	************************************************************************************
	***********************************************************************************/

	/***********************************************************************************
	************************************************************************************
	***********************	               READS           *****************************
	************************************************************************************
	***********************************************************************************/

	/***
		Method: getKey

			redis get, gets a key

			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return <*>

	***/

	public function getKey($key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->get($key);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: getKeys

			redis keys, retrieves keys matching a pattern

			@param pattern <string>
			@param $options <array> persist, nodisconnect
			@return <array>

	***/

	public function getKeys($pattern,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->keys($pattern);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: getHash

			redis hGetAll, gets a ful hash (keys & values)

			@param $hash <string>
			@param $options <array> persist, nodisconnect
			@return <array>

	***/

	public function getHash($hash,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hGetAll($hash);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: getHashKey

			redis hGet, gets the value for a given hash and key

			@param $hash <string>
			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return <string>

	***/

	public function getHashKey($hash,$key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hGet($hash,$key);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: getHashValues

			redis hVals, gets only the values for a given hash

			@param $hash <string>
			@param $options <array> persist, nodisconnect
			@return <array>

	***/

	public function getHashValues($hash,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->hVals($hash);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: keyExists

			checks if a key exists

			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function keyExists($key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->exists($key);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: getKeyTTL

			gets ttl from a key

			@param $key <string>
			@param $options <array> persist, nodisconnect
			@return int -2 key doesn't exists | -1 key hasn't ttl | ttl in seconds

	***/

	public function getKeyTTL($key,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->ttl($key);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***
		Method: setKeyTTL

			sets ttl from a key

			@param $key <string>
			@param $ttl <int> in seconds
			@param $options <array> persist, nodisconnect
			@return boolean

	***/

	public function setKeyTTL($key,$ttl,$options){
		if($this->_connectToRedis($options)){
			$response = $this->_client->expire($key,$ttl);
			$this->_disconnect($options);
			return $response;
		}
	}

	/***********************************************************************************
	************************************************************************************
	***********************	              END READS        *****************************
	************************************************************************************
	***********************************************************************************/

	/***********************************************************************************
	************************************************************************************
	***********************	          CONNECT/DISCONNECT    ****************************
	***********************         for custom operations   ****************************
	***********************************************************************************/

	/***
		Method: connect

			connects to redis database

			@return redis client

	***/

	public function connect(){
		$this->_connectToRedis($options);
		return $this->_client;
	}

	/***
		Method: disconnect

			disconnects from redis database

			@return void

	***/

	public function disconnect(){
		$this->_client->close();
		$this->_connected 	= false;
	}

	/***********************************************************************************
	************************************************************************************
	***********************	       END CONNECT/DISCONNECT    ***************************
	************************************************************************************
	***********************************************************************************/

	/***********************************************************************************
	************************************************************************************
	***********************	                HELPERS        *****************************
	************************************************************************************
	***********************************************************************************/

	private function _disconnect($options){
		if (array_key_exists('nodisconnect', $options)) {
			if($options['nodisconnect']){
				$this->disconnect();
			}
		}
	}

	private function _persistToDisk($options){
		if (array_key_exists('persist', $options)) {
			if($options['persist']){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	private function _setDefaultOptions($options){
		if(!is_array($options)){
			$options = array();
		}
		if (!array_key_exists('hostNumber', $options)) {
			$options['hostNumber'] = 0;
		}
		if (!array_key_exists('db', $options)) {
			$options['db'] = 0;
		}
		return $options;
	}

	/***
		Method: setCredentials

			sets redis credentials

			@param $options <array>
			@return void

	***/

	public function setCredentials($options){
		if($this->_shouldIConnect($options)){
			$this->_currentHostNumber = $options['hostNumber'];
			$this->_redisHost					= $options['host'];
			$this->_redisPwd					= $options['pwd'];
			$this->_redisPort					= $options['port'];
			$this->_database 					= $options['db'];
		}
	}

	/***
		Method: _shouldIConnect

			checks if there's an opened connection valid (same host and same db)

			@param $options <array>
			@return boolean

	***/

	private function _shouldIConnect($options){
		$connect 	= 0;
		if($options['hostNumber']!=$this->_currentHostNumber){
			$connect++;
		}
		if($options['db']!=$this->_database){
			$connect++;
		}

		if($connect>0){
			$this->_disconnect($options);
			return true;
		}else{
			return false;
		}
	}

	private function _logToBigbrother($logdata){
		$logdata["evt"]		= "PHP";
    $logdata["bucket"]		= "SYSTEM_";
		$logdata["file"]	= __FILE__;
    Logger::logExternalEvent($logdata);
	//	Logbigbrother::writeErrorLog($logdata,"system_errors",true);
	}

	/***********************************************************************************
	************************************************************************************
	***********************	            END HELPERS        *****************************
	************************************************************************************
	***********************************************************************************/

	/************************************************************************************
																			Singleton
	*************************************************************************************/
	public static function singleton($system){
		if (!isset(self::$instance)) {
			$c = __CLASS__;
			self::$instance = new $c($system);
		}
		return self::$instance;
	}

}
