</div>

<div class="container">
    <footer>


        <div class="col-1">
            <img src="img/logo-footer.png" />
        </div>

        <div class="divider"></div>

        <div class="col-2">
          <h4><?php echo LANGUAGES; ?></h4>
          <p><a href="<?php echo $baseHref; ?>home.php?lang=es">Castellano</a> | <a href="<?php echo $baseHref; ?>home.php?lang=ca">Català</a> | <a href="<?php echo $baseHref; ?>home.php?lang=en">English</a> | <a href="<?php echo $baseHref; ?>home.php?lang=fr">Français</a></p>
        </div>

        <div class="divider"></div>

        <div class="col-3">
            <h4>B'Maps</h4>
            <p><a href="#"><?php echo LEGAL; ?></a> | <a href="#"><?php echo PRIVACY_POLICY; ?></a></p>
        </div>

    </footer>
</div>


<script>
$(function(){

    $('.menu-toggler').click(function(){
        $(this).closest('.col-3').toggleClass('menu-visible');
    });

});
</script>

</body>
</html>
