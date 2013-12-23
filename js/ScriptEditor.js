/**
 *  CCU-IO.ScripEditor
 *  http://github.com/smiling-Jack/CCU-IO.ScriptEditor
 *
 *  Copyright (c) 2013 Steffen Schorling http://github.com/smiling-Jack
 *  MIT License (MIT)
 *
 */


var SEdit = {
    socket: {},

    theme: "",

    str_theme: "SEdit_Theme",
    str_settings: "SEdit_Settings",
    str_prog: "SEdit_Programm",


    file_name: "",
    prg_store: "www/ScriptGUI/prg_Store/",
    script_store: "scripts/",




    Setup: function () {
        console.log("Start_Setup");

        // Lade Theme XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        theme = storage.get(SEdit.str_theme);
        if (theme == undefined) {
            theme = "dark-hive"
        }
        $("head").append('<link id="theme_css" rel="stylesheet" href="css/' + theme + '/jquery-ui-1.10.3.custom.min.css"/>');

        // slider XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//        SEdit.scrollbar_v("init", $(".CodeMirror"), $(".CodeMirror-scroll"), $("#scroll_bar_v"),100);


        var key = "";
        $(document).keydown(function (event) {
            key = String.fromCharCode(event.keyCode);
        });

        $(document).keyup(function () {
            key = "";
        });

        $('#prg_body').on('mousewheel', function (event, delta, deltaX, deltaY) {

            if (key.toString() == "X") {
                var ist = $("#scroll_bar_h").slider("option", "value");
                if (ist > 100) {
                    $("#scroll_bar_h").slider("option", "value", 100)
                } else if (ist < 0) {
                    $("#scroll_bar_h").slider("option", "value", 0)
                } else {
                    $("#scroll_bar_h").slider("option", "value", ist + delta * 3)
                }

            } else {
                var ist = $("#scroll_bar_v").slider("option", "value");
                if (ist > 100) {
                    $("#scroll_bar_v").slider("option", "value", 100)
                } else if (ist < 0) {
                    $("#scroll_bar_v").slider("option", "value", 0)
                } else {
                    $("#scroll_bar_v").slider("option", "value", ist + delta * 3)
                }
            }
        });

        // Toolbox XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


        console.log("Finish_Setup");

        SEdit.menu_iconbar();
//        SEdit.context_menu();
        SEdit.Editor();
        SEdit.scrollbar_v("init", $(".CodeMirror"), $(".CodeMirror-scroll"), $("#scroll_bar_v"), 100);
        SEdit.scrollbar_h("init", $(".CodeMirror"), $(".CodeMirror-scroll"), $("#scroll_bar_h"), 0);
     SEdit.load_ordner()

    },

    scrollbar_h: function (init, scrollPane_h, scroll_content, scroll_bar_h, value) {

        //scrollpane parts
        var scrollPane = scrollPane_h,
            scrollContent = scroll_content;
        //build slider
        if (init != "init") {
            var scrollbar = scroll_bar_h
        } else {
            var scrollbar = scroll_bar_h.slider({
                slide: function (event, ui) {
                    if (scrollContent.width() > scrollPane.width()) {
                        scrollContent.css("margin-left", Math.round(
                            ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
                        ) + "px");
                    } else {
                        scrollContent.css("margin-left", 0);
                    }
                },
                change: function (event, ui) {
                    if (scrollContent.width() > scrollPane.width()) {
                        scrollContent.css("margin-left", Math.round(
                            ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
                        ) + "px");
                    } else {
                        scrollContent.css("margin-left", 0);
                    }
                }
            });

            //append icon to handle
            var handleHelper = scrollbar.find(".ui-slider-handle")
                .mousedown(function () {
                    scrollbar.width(handleHelper.width());
                })
                .mouseup(function () {
//                    scrollbar.width("100%");
                })
                .append("<span class='ui-icon ui-icon-grip-dotted-vertical'></span>")
                .wrap("<div class='ui-handle-helper-parent'></div>").parent();
            //change overflow to hidden now that slider handles the scrolling
            scrollPane.css("overflow", "hidden");

        }

        //size scrollbar and handle proportionally to scroll distance
        function sizeScrollbar_h() {
            var remainder = scrollContent.width() - scrollPane.width();
            if (remainder < 0) {
                var handleSize = scroll_bar_h.parent().width() - 6;
            } else {
                var proportion = remainder / scrollContent.width();
                var handleSize = scrollPane.width() - ( proportion * scrollPane.width() );
            }

            scrollbar.find(".ui-slider-handle").css({
                width: handleSize,
                height: "10px",
                "margin-left": (-handleSize / 2) + 2,
                "margin-top": 0

            });


            $(scroll_bar_h).width(parseInt($(scrollbar.parent()).width() - handleSize - 4));
            $(scroll_bar_h).css({left: parseInt(handleSize / 2) + "px"});
        }

        //reset slider value based on scroll content position
        function resetValue_h() {
            var remainder = scrollPane.width() - scrollContent.width();
            var leftVal = scrollContent.css("margin-left") === "auto" ? 0 :
                parseInt(scrollContent.css("margin-left"));
            var percentage = Math.round(leftVal / remainder * 100);
            scrollbar.slider("value", percentage);
        }

        //if the slider is 100% and window gets larger, reveal content
        function reflowContent_h() {
            var showing = scrollContent.width() + parseInt(scrollContent.css("margin-left"), 10);
            var gap = scrollPane.width() - showing;
            if (gap > 0) {
                scrollContent.css("margin-left", parseInt(scrollContent.css("margin-left"), 10) + gap);
            }
        }

        //change handle position on window resize
        $(window).resize(function () {

            setTimeout(function () {             // TODO Timout wegen der Maximate dauer
                resetValue_h();
                sizeScrollbar_h();
                reflowContent_h();

            }, 300);
        });


        //init scrollbar size
        setTimeout(sizeScrollbar_h, 100);//safari wants a timeout

        if (init == "init") {
            $(scroll_bar_h).slider("value", value);
            console.log("Finish_Scrollbar_H init");
        } else {
            console.log("Finish_Scrollbar_H");
        }

    },

    scrollbar_v: function (init, scrollPane_v, scroll_content, scroll_bar_v, value) {

        //scrollpane parts
        var scrollPane = scrollPane_v,
            scrollContent = scroll_content;
        //build slider
        if (init != "init") {
            var scrollbar = scroll_bar_v
        } else {
            var scrollbar = scroll_bar_v.slider({
                orientation: "vertical",
                slide: function (event, ui) {
                    if (scrollContent.height() > scrollPane.height()) {
                        scrollContent.css("margin-top", Math.round(
                            (100 - ui.value) / 100 * ( scrollPane.height() - scrollContent.height() )
                        ) + "px");

                    } else {
                        scrollContent.css("margin-top", 0);
                        console.log(scroll_content)
                    }
                },
                change: function (event, ui) {
                    if (scrollContent.height() > scrollPane.height()) {
                        scrollContent.css("margin-top", Math.round(
                            (100 - ui.value) / 100 * ( scrollPane.height() - scrollContent.height() )
                        ) + "px");

                    } else {


                        scrollContent.css("margin-top", 0);

                    }
                }
            });

            //append icon to handle
            var handleHelper = scrollbar.find(".ui-slider-handle")
                .mousedown(function () {
                    scrollbar.height(handleHelper.height());
                })
                .mouseup(function () {
                    scrollbar.height(handleHelper.height());
                })
                .append("<span class='ui-icon ui-icon-grip-dotted-vertical'></span>")
                .wrap("<div class='ui-handle-helper-parent'></div>").parent();
            //change overflow to hidden now that slider handles the scrolling
            scrollPane.css("overflow", "hidden");
        }
        //size scrollbar and handle proportionally to scroll distance
        function sizeScrollbar_v() {
            var remainder = scrollContent.height() - scrollPane.height();
            if (remainder < 0) {
                console.log(remainder);
                var handleSize = scroll_bar_v.parent().height() - 6;

            } else {
                scroll_bar_v.css({visibility: "visible"});
                var proportion = remainder / scrollContent.height();
                var handleSize = scrollPane.height() - ( proportion * scrollPane.height() );
            }
            scrollbar.find(".ui-slider-handle").css({

                height: handleSize,
                width: "10px",
                "margin-bottom": (-handleSize / 2) - 4,
                "margin-left": "-6.5px"
            });

            $(scroll_bar_v).height(parseInt($(scrollbar.parent()).height() - handleSize - 4));
            $(scroll_bar_v).css({top: parseInt(handleSize / 2) + "px"});
            $(scroll_bar_v).find(".ui-icon").css({top: parseInt(handleSize / 2) - 8 + "px"});

        }

        //reset slider value based on scroll content position
        function resetValue_v() {

            var remainder = scrollPane.height() - scrollContent.height();
            var topVal = scrollContent.css("margin-top") === "auto" ? 0 :
                parseInt(scrollContent.css("margin-top"));

            var percentage = Math.round(topVal / remainder * 100);
            scrollbar.slider("value", 100 - percentage);
        }

        //if the slider is 100% and window gets larger, reveal content
        function reflowContent_v() {
            var showing = scrollContent.height() + parseInt(scrollContent.css("margin-top"), 10);
            var gap = scrollPane.height() - showing;
            if (gap > 0) {
                scrollContent.css("margin-top", 0);
            }
        }

        //change handle on window resize
        $(window).resize(function () {
            $(scroll_bar_v).find("a").css({"background-image": "url(css/" + theme + "/images/scrollbar_r.png",
                backgroundRepeat: "repeat"});

            setTimeout(function () {             // TODO Timout wegen der Maximate dauer
                resetValue_v();
                sizeScrollbar_v();
                reflowContent_v();

            }, 300);
        });

        //change handle on content resize
        $(scrollContent).resize(function () {
            $(scroll_bar_v).find("a").css({"background-image": "url(css/" + theme + "/images/scrollbar_r.png",
                backgroundRepeat: "repeat"});
            resetValue_v();
            sizeScrollbar_v();
            reflowContent_v();
        });

        //init scrollbar sizz
        setTimeout(sizeScrollbar_v, 100);//safari wants a timeout


        $(scroll_bar_v).find(".ui-icon").css({
            "transform": "rotate(90deg)",
            "-ms-transform": "rotate(90deg)",
            "-webkit-transform": "rotate(90deg)",
            left: "-2px"
        });


        $(scroll_bar_v).find("a").css({"background-image": "url(css/" + theme + "/images/scrollbar_r.png)",
            backgroundRepeat: "repeat"});

        if (init == "init") {
            $(scroll_bar_v).slider("value", value);
            console.log("Finish_Scrollbar_V init");
        } else {
            console.log("Finish_Scrollbar_V");
        }

    },

    Editor: function () {


 editor = CodeMirror.fromTextArea(document.getElementById("codemirror"), {
            mode: {name: "javascript", json: true},
            viewportMargin: Infinity
        });

       editor.setOption("lineNumbers", true);
////        editor.setOption("readOnly", false);
//        editor.setOption("autoCloseTags", true);
//        editor.setOption("autoCloseBrackets", true);
//        editor.setOption("matchBrackets", true);
//        editor.setOption("styleActiveLine", true);
//        editor.setOption("highlightSelectionMatches", true);
        editor.setOption("theme", "monokai");
        //        editor.setOption("mode", "javascript");
    },

    load_ordner: function () {
        SEdit.socket.emit("readdirStat", SEdit.script_store, function (data) {
            console.log(data);
            $.each(data, function () {
                $("#toolbox_files").append('<div id="'+this.file.split(".")[0]+'" class="div_file">'+this.file.split(".")[0]+'</div>')
            });

            $(".div_file").click(function () {
                $(this).effect("highlight");
                SEdit.socket.emit("readRawFile", SEdit.script_store + $(this).attr("id")+".js", function (data) {
                    console.log(data);
                    editor.setOption("value", data.toString());


                });


        }).hover(
            function () {
                $(this).addClass("ui-state-focus");
            }, function () {
                $(this).removeClass("ui-state-focus");
            }
        );


        });


    }
};


(function () {
    $(document).ready(function () {
        try {
            SEdit.socket = io.connect($(location).attr('protocol') + '//' + $(location).attr('host')+"?key="+socketSession);
        } catch (err) {
            alert("Keine Verbindung zu CCU.IO");
        }
        SEdit.Setup();

//todo Ordentliches disable sichen was man auch wieder einzelnt enabeln kann
//       $("body").disableSelection();
    });
})(jQuery);
