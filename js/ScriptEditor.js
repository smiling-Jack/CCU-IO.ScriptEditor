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




        var key = "";
        $(document).keydown(function (event) {
            key = String.fromCharCode(event.keyCode);
        });

        $(document).keyup(function () {
            key = "";
        });



        // Toolbox XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

        console.log("Finish_Setup");

        SEdit.menu_iconbar();
//        SEdit.context_menu();
        SEdit.Editor();
        SEdit.load_ordner()

    },



    Editor: function () {


        editor = CodeMirror.fromTextArea(document.getElementById("codemirror"), {
            mode: {name: "javascript", json: true},
            lineNumbers: true,
            theme: "monokai"
        });

//        editor.setOption("lineNumbers", true);
////        editor.setOption("readOnly", false);
//        editor.setOption("autoCloseTags", true);
//        editor.setOption("autoCloseBrackets", true);
//        editor.setOption("matchBrackets", true);
//        editor.setOption("styleActiveLine", true);
//        editor.setOption("highlightSelectionMatches", true);
//        editor.setOption("theme", "monokai");
        //        editor.setOption("mode", "javascript");
    },

    load_ordner: function () {
        SEdit.socket.emit("readdirStat", SEdit.script_store, function (data) {

            $.each(data, function () {

                if (this.file.split(".")[1] == "js") {
                    $("#toolbox_files").append('<div id="' + this.file.split(".")[0] + '" class="div_file">' + this.file.split(".")[0] + '</div>')
                }
            });

            $(".div_file").click(function () {
                $(this).effect("highlight");
                var name = $(this).attr("id");
                SEdit.socket.emit("readRawFile", SEdit.script_store + $(this).attr("id") + ".js", function (data) {
                    editor.setOption("value", data);
                    SEdit.file_name = name;
                    $("#m_file").text(SEdit.file_name);

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
            SEdit.socket = io.connect($(location).attr('protocol') + '//' + $(location).attr('host') + "?key=" + socketSession);
        } catch (err) {
            alert("Keine Verbindung zu CCU.IO");
        }
        SEdit.Setup();

//todo Ordentliches disable sichen was man auch wieder einzelnt enabeln kann
//       $("body").disableSelection();
    });
})(jQuery);
