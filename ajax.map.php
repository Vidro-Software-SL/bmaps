<?php
class ControllerIndex
{
	private $_system;
	function __construct()
	{
		require_once 'libs/config.php';
		$check = new Check();
		$this->_system = System::singleton();
		$parameters	= "";
		$request = false;
		$layer = null;
		foreach ($_GET as $key => $value) {
			if ($value === "GetCapabilities" || $value === "DescribeFeatureType" || $value === "GetLegendGraphics" || $value === "GetProjectSettings") {
				$request 	= $value;
				$layer   	= (empty($_REQUEST['typename'])) 									? null 			: $_REQUEST['typename'];
				if ($layer === null) {
					$layer   	= (empty($_REQUEST['LAYERS'])) 									? null 			: $_REQUEST['LAYERS'];
				}
			}
			$parameters .= "&" . $key . "=" . urlencode($value);
		}

		echo $this->_doRequest($parameters, $request, $layer);
	}

	private function _doRequest($parameters, $request, $layer)
	{
		if ($this->_system->get('serverCores')) {
			if (isset($_SESSION['lastCore'])) {
				if ($_SESSION['lastCore'] < $this->_system->get('serverCores')) {
					$_SESSION['lastCore'] = $_SESSION['lastCore'] + 1;
				} else {
					$_SESSION['lastCore'] = 1;
				}
			} else {
				$_SESSION['lastCore'] = 1;
			}
		}
		if (isset($_SESSION['lastCore'])) {
			$baseUrl = $this->_system->get('qgis_url') . $_SESSION['currentProject_name'] . "/" . $_SESSION['lastCore'] . "/qgis_mapserv.fcgi?" . $parameters;
		} else {
			$baseUrl = $this->_system->get('qgis_url') . $_SESSION['currentProject_name'] . "/qgis_mapserv.fcgi?" . $parameters;
		}
		// create the uri to call
		$uri = $baseUrl . $parameters;
		// use curl to fetch the document
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $baseUrl);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		if ($request === "GetCapabilities" || $request === "DescribeFeatureType" || $request === "GetLegendGraphics" || $request === "GetProjectSettings") {
			$response = curl_exec($ch);
			curl_close($ch);

			if ($layer != null) {
				$request .= "_" . $layer;
			}
		} else {
			session_write_close();
			$response = curl_exec($ch);
			curl_close($ch);
		}
		return ltrim($response);
	}
}
new ControllerIndex();
