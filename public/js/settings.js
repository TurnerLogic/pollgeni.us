! function() {
    "use strict";
    $(window).load(function() {
        $("#loader").fadeOut(), $("#mask").delay(1e3).fadeOut("slow")
    }), $(function() {
        $("a[href*=#]:not([href=#])").click(function() {
            if ($(".menu-cont li a").parent().removeClass("active"), $(this).parent().addClass("active"), location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") || location.hostname == this.hostname) {
                var a = $(this.hash);
                if (a = a.length ? a : $("[name=" + this.hash.slice(1) + "]"), a.length) return $("html,body").animate({
                    scrollTop: a.offset().top
                }, 1e3), !1
            }
        })
    }), $(document).scroll(function() {
        $(document).scrollTop() >= 1 ? $(".header-area").addClass("navbar-fixed-top") : $(".header-area").removeClass("navbar-fixed-top")
    }), $(".toggle-btn").click(function() {
        $(".nav-main").toggle()
    }), $(".animated").appear(function() {
        var a = $(this),
            e = a.data("animation");
        if (!a.hasClass("visible")) {
            var t = a.data("animation-delay");
            t ? setTimeout(function() {
                a.addClass(e + " visible")
            }, t) : a.addClass(e + " visible")
        }
    }), $('.search-area').scrollToFixed();
}(jQuery);
