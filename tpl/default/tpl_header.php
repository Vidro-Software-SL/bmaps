<!DOCTYPE html>
<html>
<head>
	<base href="<?php echo $baseHref; ?>tpl/<?php echo $skin; ?>/">
	<link rel="stylesheet" href="<?php echo $baseHref; ?>js/libs/bootstrap/3.3.7/css/bootstrap.min.css">
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet">
	<link rel="stylesheet" href="css/dist/home.min.css" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="utf-8" />
	<script src="<?php echo $baseHref; ?>js/libs/jquery/3.1.1/jquery.min.js"></script>
	<script src="<?php echo $baseHref; ?>js/libs/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/jquery/1.12.1/jquery-ui.min.js"></script>
	<script type="text/javascript" src="../../js/libs/vue.min.2.6.10.js"></script>
	<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
	<script src="<?php echo $baseHref; ?>/js/libs/jqueryui-datetimepicker/jquery.datetimepicker.full.min.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/jqueryui-datetimepicker/jquery.datetimepicker.min.css">
</head>
<body>

    <header>
        <div class="container">
            <div class="flex">
                <div class="col-1">
                    <a href='<?php echo $baseHref; ?>home.php'><img src="img/logo-header.png" /></a>
                </div>
                <div class="col-2">
                    <p class="text-1"><?php echo $slogan1; ?></p>
                    <p class="text-2"><?php echo $slogan2; ?></p>
                </div>
                <div class="col-3">
                    <a class="menu-toggler">
                        <svg class="pull-left" width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 17H5v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9zM11 6.3c1.5 0 2.7 1.2 2.7 2.7 0 1.5-1.2 2.7-2.7 2.7-1.5 0-2.7-1.2-2.7-2.7 0-1.5 1.2-2.7 2.7-2.7zM18 3H4c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h4l3 3 3-3h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="#0FFFD5" fill-rule="evenodd"/>
                        </svg>
                        <?php echo $_SESSION['user_name']; ?>
                        <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 12l4 4 4-4z" fill="#0FFFD5" fill-rule="evenodd"/>
                        </svg>
                    </a>

                    <ul class="list-unstyled">
                       <!-- <li>
                            <a href="#">
                                <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H5v-1zm9-8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" fill="#FFF" fill-rule="evenodd"/>
                                </svg>
                                <?php echo PROFILE; ?>
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46a.492.492 0 0 0-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 13 2H9c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L3.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" fill="#797979" fill-rule="evenodd"/>
                                </svg>
                                <?php echo SETTINGS; ?>
                            </a>
                        </li>-->
                        <li>
                            <a href="<?php echo $baseHref; ?>offline_configuration.php">
                                <img src="img/ic/offline.svg" class="svg ico" />
                               Offline Info
                            </a>
                        </li>
                        <li>
                            <a href="<?php echo $baseHref; ?>logout.php">
                                <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.56 6.44l-1.45 1.45A5.969 5.969 0 0 1 17 13a6 6 0 1 1-12 0c0-2.17 1.16-4.06 2.88-5.12L6.44 6.44A7.961 7.961 0 0 0 3 13a8 8 0 1 0 16 0c0-2.72-1.36-5.12-3.44-6.56M12 4h-2v10h2" fill="#FFF" fill-rule="evenodd"/>
                                </svg>
                               <?php echo LOG_OUT; ?>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </header>

	<div class="container">
