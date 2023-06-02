$(function(){

    // $(window).keypress(function (e) {
    //     if (e.ctrlKey && e.keyCode == 13) {
    //         $('header a.menu-toggle').click();
    //         $('.sidebar ul li').first().find('a').click();
    //         $('#layout_Network').switchLayoutChildren('open');
    //         $('#layout_Node').switchLayoutChildren('open');
    //         $('#layout_Chamber .title-text').click();
    //     }
    // });
    //
    // $('header .brand').click(function(){
    //     $('header a.menu-toggle').click();
    //     $('.sidebar ul li').first().find('a').click();
    //     $('#layout_Network').switchLayoutChildren('open');
    //     $('#layout_Node').switchLayoutChildren('open');
    //     $('#layout_Chamber .title-text').click();
    // });
    $('.forms-area').on('click', 'div.header div.tabs ul li button', function(){

        var tabs = $(this).closest('div.tabs');
        var li = $(this).closest('li');
        var relatedContent = $(this).closest('.drop-down-form').find('.content');

        tabs.find('li').removeClass('active');
        li.addClass('active');

        relatedContent.find('.tab-content').hide();
        relatedContent.find('.tab-content').eq(li.index()).show();

    });

    if(localStorage.getItem('toc-width') != null){
        $('div.sidebar').width(localStorage.getItem('toc-width'));
    }
    if(localStorage.getItem('drop-down-form-width') != null){
        $('div.drop-down-form').width(localStorage.getItem('drop-down-form-width'));
    }

    $('div.sidebar').resizable({
        handles: "e",
        stop: function(event, ui){
            // Por algún motivo, si no cambio el tamaño
            // de la ventana o del elemento de forma
            // manual después del primer redimensionado,
            // no vuelve a funcionar.
            // Cuando se termina de redimensionar (stop) le resto
            // y sumo 1px para que visualmente no se aprecie
            // ningún cambio y que siga funcionando.
            $(this).width(ui.size.width - 1).width(ui.size.width);
            localStorage.setItem('drop-down-form-width', ui.size.width);
        }
    });

    $('div.drop-down-form').resizable({
        handles: "w",
        stop: function(event, ui){
            // Por algún motivo, si no cambio el tamaño
            // de la ventana o del elemento de forma
            // manual después del primer redimensionado,
            // no vuelve a funcionar.
            // Cuando se termina de redimensionar (stop) le resto
            // y sumo 1px para que visualmente no se aprecie
            // ningún cambio y que siga funcionando.
            $('div.drop-down-form')
                .width(ui.size.width - 1)
                .width(ui.size.width)
                .css('left', 'auto');
            localStorage.setItem('drop-down-form-width', ui.size.width);
        }
    });

    var lightbox = $('.lightbox').simpleLightbox({
        fileExt: false
    });

    $('header').on('click', '.menu-toggle', function(){
        $(this).toggleClass('open closed');
        $('.menu-toc .sidebar').toggleClass('open closed');
        return false;
    });

    $('.menu-toc').on('click', '.sidebar > ul > li > a', function(){
        if($(this).next('.content').length){
            $(this).next('.content').stop().slideToggle(function(){ $(this).css('height', 'auto'); });
            $(this).toggleClass('active');
            return false;
        }
    });

    $('.menu-tools').on('click', '.menu-toggle', function(){
        $(this).toggleClass('open closed');
        $('.menu-tools .tools').toggleClass('open closed');
        $('.bottom-sheet').toggleClass('with-side-tools-open');
        return false;
    });

    // DEV:
    // $('.menu-toc .menu-toggle').click();
    // $('.sidebar > ul > li > a').click();

    $('.toc-layouts').on('click', 'img.chevron, svg.chevron, li.container .title .title-text', function(){
        $(this).closest('li').toggleClass('active');
        return false;
    });

    $("img.svg").embedSVG();

});

$.fn.switchLayoutChildren = function(action) {
    if (this.parents('.toc-layouts').length && this.hasClass('title')) {
        switch(action){
            case 'open': this.closest('li').addClass('active'); break;
            case 'close': this.closest('li').removeClass('active'); break;
            case 'toggle': this.closest('li').toggleClass('active'); break;
        }
    }else{
        throw new ReferenceError('Selector no válido');
    }
};

/*
 * Replace all SVG images with inline SVG
 */

(function($){
    $.fn.embedSVG = function() {

        this.each(function() {
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');

                // Add replaced image's ID to the new SVG
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
                if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                    $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
                }

                // Replace image with new SVG
                $img.replaceWith($svg);

            }, 'xml');

        });
    };
})(jQuery);
