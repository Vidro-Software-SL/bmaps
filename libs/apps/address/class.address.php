<?php

class AddressBmaps
{
	private $_system;
	private $_nominatimUrl;
	private $_ambUrl;

	public function __construct()
	{
		$this->_system 					= System::singleton();
		$this->_nominatimUrl 		= "https://nominatimurl";
		$this->_ambUrl 				= "https://amb servlet url";
	}
	//****************************************************************
	//*******************        NOMINATIM      **********************
	//****************************************************************

	/***
		method searchNominatim
			upserts a visit (inserts a new visit or returns a previous visit)

			@param $country <string>
			@param $criteria <string>
			@param $json <string> name of the id field of the table/view to query
			@param $extent

			@return JSON

	 ***/

	public function searchNominatim($country, $criteria, $json, $extent = null)
	{
		$criteria = str_replace(' ', '+', $criteria);
		// create the uri to call
		$uri = $this->_nominatimUrl . "?q=" . $criteria . "&countrycodes=" . $country; //."&viewbox=418219,4576070,420102,457712";//format=json";
		if ($extent) {
			$uri .= "&bounded=1&viewbox=" . $extent;
		}
		if ($json) {
			$uri .= "&format=json&polygon_text=1";
		} else {
			echo $uri;
		}
		//echo $uri;
		// use curl to fetch the document
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_REFERER, 'https:///');
		curl_setopt($ch, CURLOPT_URL, $uri);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$response = curl_exec($ch);
		curl_close($ch);
		if ($json) {
			return $response;
		} else {
			echo ltrim($response);
		}
	}

	//****************************************************************
	//*******************     END NOMINATIM      *********************
	//****************************************************************

	//****************************************************************
	//*******************        AMB      **********************
	//****************************************************************

	/***
		method searchAmb
			upserts a visit (inserts a new visit or returns a previous visit)

			@param $country <string>
			@param $criteria <string>
			@param $json <string> name of the id field of the table/view to query
			@param $extent

			@return JSON

	 ***/

	public function searchAmb($criteria)
	{
		$reply = array();
		$criteria = str_replace(' ', '+', $criteria);
		// create the uri to call
		$uri = $this->_ambUrl . "&t=" . $criteria;

		//echo $uri;
		// use curl to fetch the document
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_REFERER, 'yoururl');
		curl_setopt($ch, CURLOPT_URL, $uri);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$response = curl_exec($ch);
		curl_close($ch);

		//format response
		$res = json_decode($response, true);

		if (array_key_exists('response', $res)) {
			if (array_key_exists('docs', $res['response'])) {
				foreach ($res['response']['docs'] as $doc) {
					//	print_r($doc);
					$item = array();
					$display_name 	= "";
					if (array_key_exists('calle_nombre', $doc)) {
						$display_name .= $doc['calle_nombre'];
					}
					if (array_key_exists('calle_descripcion', $doc)) {
						$display_name .= " , " . $doc['calle_descripcion'];
					}
					if (array_key_exists('municipio_nombre', $doc)) {
						$display_name .= " " . $doc['municipio_nombre'];
					}
					$item['display_name'] = $display_name;
					if (array_key_exists('calle_tipo', $doc)) {
						$item['class'] = $doc['calle_tipo'];
					}
					if (array_key_exists('calle_id', $doc)) {
						$item['place_id'] = $doc['calle_id'];
					}
					if (array_key_exists('coord', $doc)) {
						$coordinates = explode(",", $doc['coord']);
						$item['lat'] = $coordinates[1];
						$item['lon'] = $coordinates[0];
					}
					$item['srid']		= "EPSG:25831";
					array_push($reply, $item);
				}
			} else {
				$reply = array();
			}
		} else {
			$reply = array();
		}
		return json_encode($reply);
	}

	//****************************************************************
	//*******************          END AMB       *********************
	//****************************************************************
}
