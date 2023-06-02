<?php

class Logger
{

	public function __construct()
	{
	}

	public static function storeAccess($datos)
	{

		return false;
	}

	public static function logExternalEvent($datos)
	{

		return array("status" => "Failed", "message" => "No evt|msg|status", "code" => 403);
	}
}
