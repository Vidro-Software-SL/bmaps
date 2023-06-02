<!DOCTYPE html>
<html>

<head>
	<style>
		.ok {
			background-color: #1f7c10;
			color: white;
			padding: 10px;
		}

		.ko {
			background-color: #fe0606;
			color: white;
			padding: 10px;
		}
	</style>

</head>

<body>


	<?php

	$user = $_POST['user'];
	$pass = $_POST['pass'];
	$ok 	= false;
	if ($user == "YOURUSER" && $pass == "YOURPASSWORD") {
	?>
		<h1>File libs/config.php is exists</h1>
		<?php
		if (!file_exists('libs/config.php')) {
			echo "<h2 class='ko'>libs/config.php</h2>";
		} else {
			echo "<h2 class='ok'>libs/config.php</h2>";
			$ok = true;
		}
		if ($ok) {
			require_once('libs/config.php');
			require_once('libs/utils/class.System.php');
			$config = System::singleton();

		?>
			<h1>SERVER</h1>
			<?php
			echo "<p>PHP version: <b>" . phpversion() . "</b></p>";
			echo "<p>Timezone: <b>" . date_default_timezone_get() . "</b></p>";
			echo "<p>Current date: <b>" . date('H:i:s d-m-Y', time()) . "</b></p>";
			if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off") {
				echo "<p class='ko'>No HTTPS</p>";
			} else {
				echo "<p class='ok'>HTTPS OK</p>";
			}
			?>
			<h1>SKINS</h1>
			<h4>Available skins</h4>
			<?php
			$skins = array();
			foreach (scandir('tpl') as $skin) {

				if ($skin != "." && $skin != "..") {
					array_push($skins, $skin);
				}
			}

			echo "<p>Skins: <b>" . implode(', ', $skins) . "</b></p>";
			echo "<p>Default skin: <b>" . $config->get('skin') . "</b></p>";
			?>
			<h1>Base url</h1>
			<?php
			$lastChar = substr($config->getbaseRef(), -1);
			$uri		= explode("/", $_SERVER['REQUEST_URI']);
			$uristr	= "";
			if (is_array($uri)) {
				for ($i = 0; $i < count($uri) - 1; $i++) {
					if ($i == 0 && $lastChar == "/") {
						$uristr .= $uri[$i];
					} else {
						$uristr .= "/" . $uri[$i];
					}
				}
			}
			$uristr .= "/";
			$baseUrl = "https://" . $_SERVER['SERVER_NAME'] . $uristr;
			if ($baseUrl != $config->getbaseRef()) {
				echo "<h2 class='ko'>Current URL " . $baseUrl . " doesn't match with config's base url: " . $config->getbaseRef() . "</h2>";
			} else {
				echo "<h2 class='ok'>" . $config->getbaseRef() . "</h2>";
			}
			?>
			<h1>WMS url</h1>
			<?php
			echo "<p><b>" . $config->get('urlWMS') . "</b></p>";

			?>
			<h1>Websocket url</h1>
			<?php
			echo "<p><b>" . $config->get('urlSocket') . "</b></p>";
			?>
			<h1>QGIS url</h1>
			<?php
			echo "<p><b>" . $config->get('qgis_url') . "</b></p>";
			?>
			<h1>Translations</h1>
			<p><b>Available languages</b></p>

			<?php
			foreach ($config->get('langs') as $lang) {
				if (!file_exists('includes/' . $lang . '/constants.php')) {
					echo "<h2 class='ko'>" . $lang . "</h2>";
				} else {
					echo "<h2 class='ok'>" . $lang . "</h2>";
				}
			}
			?>
			<h1>PG user protocol</h1>
			<?php
			if ($config->get('pg_user_protocol') != "") {
				echo "<p class='ok'><b>" . $config->get('pg_user_protocol') . "</b></p>";
			} else {
				echo "<p class='ko'><b>Flag pg_user_protocol is not defined, will use `backoffice`</b></p>";
			}
			?>
			<h1>PostgreSQL</h1>
			<?php
			$host = $config->get('_servidor_bd1');
			$name	= $config->get('_database_bd1');
			$user	= $config->get('_user_bd1');
			$pwd	= $config->get('_password_bd1');
			try {
				$pdo = new PDOdbp(PDO_PGSQL, $host, $name, $user, $pwd, new DBids());
				echo "<p class='ok'><b>Backoffice's PostgreSQL OK</b></p>";
			} catch (PDOException $e) {
				echo "<p class='ko'><b>Backoffice's PostgreSQL error: " . $e->getMessage() . "</b></p>";
			}
			?>

			<h1>MongoDB</h1>
			<?php
			if (version_compare(PHP_VERSION, '7.0.0') >= 0) {
				echo "<p class='ko'><b>PHP 7.x MUST Use PECL-MongoDB</b></p>";
			}

			$insert 			= $config->insertMongo(1, "TEST", array('test' => "test ok"));
			if (strlen($insert) === 24) {
				echo "<h2 class='ok'>Insert</h2>";
			} else {
				echo "<h2 class='ko'>Insert</h2>";
			}

			$cursor = $config->queryMongo(1, "TEST", array('_id' => $config->getMongoId($insert)));
			$queryMongo		= false;
			foreach ($cursor as $doc) {
				$queryMongo		= true;
			}
			if ($queryMongo) {
				echo "<h2 class='ok'>Query</h2>";
			} else {
				echo "<h2 class='ko'>Query</h2>";
			}

			$deleteMongo	= false;
			$deleteMongo = $config->deleteMongo(1, "TEST", array('_id' => $config->getMongoId($insert)));
			if ($deleteMongo['n'] === 1) {
				echo "<h2 class='ok'>Delete</h2>";
			} else {
				echo "<h2 class='ko'>Delete</h2>";
			}
			?>
			<h1>Add to home screen - file manifest.json exists</h1>
			<?php
			if (!file_exists('manifest.json')) {
				echo "<h2 class='ko'>manifest.json</h2>";
			} else {
				echo "<h2 class='ok'>manifest.json</h2>";
			}
			?>
			<br /><br /><br /><br /><br /><br />
			<h1><b>UI Customization</b></h1>
			<h1>Logos & slogans</h1>
			<h3>Logo header login page</h3>
			<?php
			if ($config->get('logo_bmaps') == "") {
				echo "<h2 class='ko'>logo_bmaps is not present on libs/config.php</h2>";
			} else {
				if (!file_exists($config->get('logo_bmaps'))) {
					echo "<h2 class='ko'>" . $config->get('logo_bmaps') . "</h2>";
				} else {
					echo "<h2 class='ok'>" . $config->get('logo_bmaps') . "</h2>";
					echo "<img src=" . $config->get('logo_bmaps') . " />";
				}
			}
			?>
			<h3>Logo footer login page</h3>
			<?php
			if ($config->get('logo_footer') == "") {
				echo "<h2 class='ko'>logo_footer is not present on libs/config.php</h2>";
			} else {
				if (!file_exists($config->get('logo_footer'))) {
					echo "<h2 class='ko'>" . $config->get('logo_footer') . "</h2>";
				} else {
					echo "<h2 class='ok'>" . $config->get('logo_footer') . "</h2>";
					echo "<img src=" . $config->get('logo_footer') . " />";
				}
			}
			?>
			<h3>Logo home</h3>
			<?php
			if ($config->get('logo_home') == "") {
				echo "<h2 class='ko'>logo_home is not present on libs/config.php</h2>";
			} else {
				foreach ($skins as $skin) {
					if (!file_exists("tpl/" . $skin . $config->get('logo_home'))) {
						echo "<h2 class='ko'>tpl/" . $skin . $config->get('logo_home') . "</h2>";
					} else {
						echo "<h2 class='ok'>tpl/" . $skin . $config->get('logo_home') . "</h2>";
						echo "<img src='tpl/" . $skin . $config->get('logo_home') . "' />";
					}
				}
			}
			?>

			<h3>Slogans</h3>
		<?php
			if ($config->get('slogan1') == "") {
				echo "<h2 class='ko'>slogan1 is not present on libs/config.php</h2>";
			} else {
				echo "<h2 class='ok'>" . $config->get('slogan1') . "</h2>";
			}
			if ($config->get('slogan2') == "") {
				echo "<h2 class='ko'>slogan2 is not present on libs/config.php</h2>";
			} else {
				echo "<h2 class='ok'>" . $config->get('slogan2') . "</h2>";
			}
		}
	} else {
		?>
		<form method="POST" action="check.php">
			User <input type="text" name="user" id="user"></input><br />
			Pass <input type="password" name="pass" id="pass"></input><br />
			<input type="submit" name="submit" value="Go"></input>
		</form>
	<?php
	}
	?>
</body>

</html>