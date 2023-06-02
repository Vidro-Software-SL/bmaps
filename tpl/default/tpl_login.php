<!DOCTYPE html>
<html>

<head>
	<base href="<?php echo $baseHref; ?>tpl/<?php echo $skin; ?>/">
	<link rel="stylesheet" href="css/dist/style-login.min.css" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet">
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width">
	<meta name="mobile-web-app-capable" content="yes">
	<link rel="icon" sizes="192x192" href="<?php echo $baseHref; ?>icons/192x192.png">
	<title>BMAPS</title>
</head>

<body>
	<div class="header">
		<div class="container">
			<img src="img/logo-header-login.png" class="logo" />
			<div class="text">
				<span><?php echo $slogan1; ?><br /><?php echo $slogan2; ?></span>
			</div>
		</div>
	</div>

	<div class="form-title">
		<img src="img/ic/account-location.svg" />
		<span><?php echo LOG_IN; ?> </span>
		<span id="networkIndicatorOnline"><img src="img/ic/online.svg" /></span>
		<span id="networkIndicatorOffline"><img src="img/ic/offline.svg" /></span>
	</div>

	<form method="post" class="form">
		<div class="form-group" id="loginError">
			<p class="login-error">Login error</p>

		</div>
		<div class="form-group">
			<label for="email"><?php echo USER_NAME; ?></label>
			<input type="text" name="email" id="email" placeholder="<?php echo EMAIL_ADDRESS; ?>" class="block" required>
		</div>

		<div class="form-group">
			<label for="pwd"><?php echo PASSWORD; ?></label>
			<input type="password" name="pwd" id="pwd" placeholder="<?php echo PASSWORD; ?>" class="block" required>
		</div>

		<input type="hidden" name="token" value="<?php echo $token; ?>">

		<div class="form-group form-group-double" align="right">
			<button type="button" class="btn" id="doLogin"><?php echo  LOG_IN; ?> <img src="img/ic/arrow-right-drop-circle-outline.svg" /></button>
		</div>
		<div id='offline' class="form-group" style="display: none;">App offline</div>
	</form>

	<div class="footer">

		<div class="col col-1">
			<img src="img/logo-footer-login.png" />
		</div>

		<div class="col col-2">
			<div class="title"><?php echo LANGUAGES; ?></div>
			<a href="<?php echo $baseHref; ?>index.php?lang=es">Castellano</a> |
			<a href="<?php echo $baseHref; ?>index.php?lang=ca">Català</a> |
			<a href="<?php echo $baseHref; ?>index.php?lang=en">English</a> |
			<a href="<?php echo $baseHref; ?>index.php?lang=fr">Français</a>
		</div>

		<div class="separator"></div>

		<div class="col col-3">
			<a href="#"><?php echo LEGAL; ?></a> |
			<a href="#"><?php echo PRIVACY_POLICY; ?></a>
		</div>

	</div>
	<?php
	if ($env === "dev") {
	?>
		<script src="<?php echo $baseHref; ?>/js/src/loginBundle.js"></script>
	<?php } else { ?>
		<script src="<?php echo $baseHref; ?>/js/dist/loginBundle.1.0.1.min.js"></script>
	<?php } ?>
	<script>
		window.onload = function() {
			var _login = new Login({
				baseHref: '<?php echo $baseHref; ?>',
				env: 'dev',
				token: '<?php echo $token; ?>',
				offlineLogin: '<?php echo $offlineLogin; ?>',
				autologin: '<?php echo $autologin; ?>',
				autologinUser: '<?php echo $autologinUser; ?>',
				autologinPassword: '<?php echo $autologinPassword; ?>'
			});

			document.getElementById("doLogin").addEventListener("click", function(event) {
				_login.doLogin(document.getElementById("email").value, document.getElementById("pwd").value);
			});

			document.getElementById("pwd").addEventListener("keyup", function(event) {
				if (event.keyCode === 13) {
					event.preventDefault();
					_login.doLogin(document.getElementById("email").value, document.getElementById("pwd").value);
				}
			});
			document.getElementById("email").addEventListener("keyup", function(event) {
				if (event.keyCode === 13) {
					event.preventDefault();
					_login.doLogin(document.getElementById("email").value, document.getElementById("pwd").value);
				}
			});



		};
	</script>
</body>

</html>