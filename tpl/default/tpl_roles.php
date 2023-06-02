<div class="row" id="app">
  <form id="panel_data">
  <input type="hidden" name="environment" 		id="environment"		value="<?php echo $env; ?>">
  <input type="hidden" name="token"	 					id="token" 					value="<?php echo $token; ?>">
  <input type="hidden" name="user_id"	 				id="user_id" 				value="<?php echo $user_id; ?>">
  <input type="hidden" name="baseHref" 			  id="baseHref" 			value="<?php echo $baseHref; ?>">


</form>
<h3><?php echo CHOOSE_APP; ?> </h3>
<style>
  .roleChooser {
    background-color: #eee;
    padding-top: 25px;    
  }
  .roleChooser img {

    padding-bottom: 25px;    
  }
</style>
<div class="row">

    <?php foreach($roles as $role => $value){ ?>
      <div class="col-sm-6 col-md-4">
        <div class="thumbnail rolesCaption roleChooser" align="center">

          <?php
          if($role==="ctaima"){
          ?>
            <img src="img/ic/accessControl.svg" width="50" class="rolesCaption"/>
          <?php
          }else{
          ?>
            <img src="img/ic/map.svg" width="50" class="rolesCaption"/>
          <?php 
          }
          ?>

          <div class="caption">
            <p><a href="<?php echo $baseHref; ?>chooserole.php?w=<?php echo $value; ?>" class="btn btn-primary" role="button"><?php echo USE_ROLE." ".$role; ?></a>
          </div>
        </div>
      </div>
  <?php } ?>

</div>
</div>
<script src="../../js/libs/jquery/3.1.1/jquery.min.js"></script>
<script type="text/javascript" src="../../js/libs/vue.min.2.6.10.js"></script>
<?php if($env==="dev"){ ?>

<?php }else{ ?>

<?php } ?>
