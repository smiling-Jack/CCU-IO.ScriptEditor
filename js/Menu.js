/**
 *  CCU-IO.ScripEditor
 *  http://github.com/smiling-Jack/CCU-IO.ScriptEditor
 *
 *  Copyright (c) 2013 Steffen Schorling http://github.com/smiling-Jack
 *  MIT License (MIT)
 *
 */


jQuery.extend(true, SEdit, {

    menu_iconbar: function () {
        console.log("Start_Menue-Iconbar");

        $("#img_iconbar").tooltip();

        $("#menu").menu({position: {at: "left bottom"}});
        $("#m_neu").click(function () {
            editor.setValue("");
            SEdit.file_name = "";
            $("#m_file").text(SEdit.file_name);
        });
        $("#m_save").click(function () {
            if ($("body").find(".ui-dialog").length == 0) {
                SEdit.save_ccu_io();
            }
        });
        $("#m_save_as").click(function () {
            if ($("body").find(".ui-dialog").length == 0) {
                SEdit.save_as_ccu_io();
            }
        });
        $("#m_open").click(function () {
            if ($("body").find(".ui-dialog").length == 0) {
                SEdit.open_ccu_io();
            }
        });

        $("#ul_theme li a").click(function () {
            $("#theme_css").remove();
            $("head").append('<link id="theme_css" rel="stylesheet" href="css/' + $(this).data('info') + '/jquery-ui-1.10.3.custom.min.css"/>');

            //resize Event auslössen um Slider zu aktualisieren
            var evt = document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);

            storage.set(SEdit.str_theme, ($(this).data('info')))
            theme = $(this).data('info');
            SEdit.scrollbar_h("", $(".scroll-pane"), $(".scroll-content"), $("#scroll_bar_h"));
            SEdit.scrollbar_v("", $(".scroll-pane"), $(".scroll-content"), $("#scroll_bar_v"));
            SEdit.scrollbar_v("", $("#toolbox_body"), $(".toolbox"), $("#scroll_bar_toolbox"));
        });


        $("#clear_cache").click(function () {
            storage.set(SEdit.str_theme, null);
            storage.set(SEdit.str_settings, null);
            storage.set(SEdit.str_prog, null);
        });


        // Icon Bar XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

        // Local
//        $("#img_save_local").click(function () {
//            var data = SEdit.make_savedata();
//            storage.set(SEdit.str_prog, data);
//            $(this).effect("highlight")
//        }).hover(
//            function () {
//                $(this).addClass("ui-state-focus");
//            }, function () {
//                $(this).removeClass("ui-state-focus");
//            }
//        );

        console.log("Finish_Menue-Iconbar");
    },


    save_as_ccu_io: function () {

        try {
            SEdit.socket.emit("readdirStat", "scripts/", function (data) {
                var files = [];
                var sel_file = "";

                $("body").append('\
                   <div id="dialog_save" style="text-align: center" title="Speichern als">\
                   <br>\
                       <table id="grid_save"></table>\
                        <br>\
                       <input  id="txt_save" type="text" /><br><br>\
                       <button id="btn_save_ok" >Speichern</button>\
                       <button id="btn_save_del" >Löschen</button>\
                       <button id="btn_save_abbrechen" >Abbrechen</button>\
                   </div>');

                $("#dialog_save").dialog({
                    height: 500,
                    width: 520,
                    resizable: false,
                    close: function () {
                        $("#dialog_save").remove();
                    }
                });

                $.each(data, function () {

                    var file = {
                        name: this["file"].split(".")[0],
                        typ: this["file"].split(".")[1],
                        date: this["stats"]["mtime"].split("T")[0],
                        size: this["stats"]["size"]
                    };
                    files.push(file);

                });

                $("#grid_save").jqGrid({
                    datatype: "local",
                    width: 495,
                    height: 280,
                    data: files,
                    forceFit: true,
                    multiselect: false,
                    gridview: false,
                    shrinkToFit: false,
                    scroll: false,
                    colNames: ['Datei', 'Größe', 'Typ', "Datum" ],
                    colModel: [
                        {name: 'name', index: 'name', width: 245, sorttype: "name"},
                        {name: 'size', index: 'size', width: 80, align: "right", sorttype: "name"},
                        {name: 'typ', index: 'typ', width: 60, align: "center", sorttype: "name"},
                        {name: 'date', index: 'date', width: 110, sorttype: "name"}
                    ],
                    onSelectRow: function (file) {
                        sel_file = $("#grid_save").jqGrid('getCell', file, 'name') + "." + $("#grid_save").jqGrid('getCell', file, 'typ');
                        $("#txt_save").val($("#grid_save").jqGrid('getCell', file, 'name'));
                    }
                });

                $("#btn_save_ok").button().click(function () {
//                    var data = SEdit.make_savedata();
                    if ($("#txt_save").val() == "") {
                        alert("Bitte Dateiname eingeben")
                    } else {
                        try {
                            console.log(editor.getValue())
                            SEdit.socket.emit("writeRawFile", "scripts/" + $("#txt_save").val() + ".js", editor.getValue());
                            SEdit.file_name = $("#txt_save").val();
                            $("#m_file").text(SEdit.file_name);

                        } catch (err) {
                            alert("Keine Verbindung zu CCU.io")
                        }

                        var n = $("#toolbox_files").children();
                        $.each(n, function () {
                            $(this).remove();


                        });
                        SEdit.load_ordner();
                        $("#dialog_save").remove();
                    }
                });
                $("#btn_save_del").button().click(function () {
                    row_id = $("#grid_save").jqGrid('getGridParam', 'selrow');
                    console.log(SEdit.prg_store + sel_file)
                    SEdit.socket.emit("delRawFile", SEdit.prg_store + sel_file, function (ok) {
                        if (ok == true) {
                            $("#grid_save").delRowData(row_id);
                            $("#txt_save").val("");
                        } else {
                            alert("Löschen nicht möglich");
                        }
                    })
                });

                $("#btn_save_abbrechen").button().click(function () {
                    $("#dialog_save").remove();
                });
            });

        } catch (err) {
            alert("Keine Verbindung zu CCU.IO");
        }
    },

    save_ccu_io: function () {
        if (SEdit.file_name == "") {
            SEdit.save_as_ccu_io()
        } else {

            try {
                SEdit.socket.emit("writeRawFile", "scripts/" + SEdit.file_name + ".js", editor.getValue());
            } catch (err) {
                alert("Keine Verbindung zu CCU.IO")
            }
        }
    },

//    open_ccu_io: function () {
//        var sel_file = "";
//
//        try {
//            SEdit.socket.emit("readdirStat", SEdit.prg_store, function (data) {
//                var files = [];
//
//
//                $("body").append('\
//                   <div id="dialog_open" style="text-align: center" title="Öffnen">\
//                   <br>\
//                       <table id="grid_open"></table>\
//                        <br>\
//                       <button id="btn_open_ok" >Öffnen</button>\
//                       <button id="btn_open_del" >Löschen</button>\
//                       <button id="btn_open_abbrechen" >Abbrechen</button>\
//                   </div>');
//                $("#dialog_open").dialog({
//                    height: 500,
//                    width: 520,
//                    resizable: false,
//                    close: function () {
//                        $("#dialog_open").remove();
//                    }
//                });
//
//                $.each(data, function () {
//
//                    var file = {
//                        name: this["file"].split(".")[0],
//                        typ: this["file"].split(".")[1],
//                        date: this["stats"]["mtime"].split("T")[0],
//                        size: this["stats"]["size"]
//                    };
//                    files.push(file);
//
//                });
//
//                $("#grid_open").jqGrid({
//                    datatype: "local",
//                    width: 500,
//                    height: 330,
//                    data: files,
//                    forceFit: true,
//                    multiselect: false,
//                    gridview: false,
//                    shrinkToFit: false,
//                    scroll: false,
//                    colNames: ['Datei', 'Größe', 'Typ', "Datum"],
//                    colModel: [
//                        {name: 'name', index: 'name', width: 240, sorttype: "name"},
//                        {name: 'size', index: 'size', width: 80, align: "right", sorttype: "name"},
//                        {name: 'typ', index: 'typ', width: 60, align: "center", sorttype: "name"},
//                        {name: 'date', index: 'date', width: 100, sorttype: "name"}
//                    ],
//                    onSelectRow: function (file) {
//                        sel_file = $("#grid_open").jqGrid('getCell', file, 'name') + "." + $("#grid_open").jqGrid('getCell', file, 'typ');
//                    }
//                });
//
//
//                $("#btn_open_abbrechen").button().click(function () {
//                    $("#dialog_open").remove();
//                });
//
//                $("#btn_open_del").button().click(function () {
//                    row_id = $("#grid_open").jqGrid('getGridParam', 'selrow');
//                    SEdit.socket.emit("delRawFile", SEdit.prg_store + sel_file, function (ok) {
//                        if (ok == true) {
//                            $("#grid_open").delRowData(row_id);
//                        } else {
//                            alert("Löschen nicht möglich");
//                        }
//                    })
//                });
//
//                $("#btn_open_ok").button().click(function () {
//                    SEdit.socket.emit("readJsonFile", SEdit.prg_store + sel_file, function (data) {
//                        SEdit.clear();
//                        SEdit.load_prg(data);
//                        SEdit.file_name = sel_file.split(".")[0];
//                        $("#m_file").text(SEdit.file_name);
//                    });
//                    $("#dialog_open").remove();
//                });
//            });
//        } catch (err) {
//            alert("Keine Verbindung zu CCU.IO");
//        }
//    },

    save_Script: function () {
        var script = Compiler.make_prg();
        if (SEdit.file_name == undefined || SEdit.file_name == "Neu" || SEdit.file_name == "") {
            alert("Bitte erst Programm Speichern")
        } else {
            try {
                SEdit.socket.emit("writeRawFile", "scripts/" + SEdit.file_name + ".js", script);
            } catch (err) {
                alert("Keine Verbindung zu CCU.IO")
            }
        }
    }




});