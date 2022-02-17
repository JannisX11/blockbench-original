var File, i;
var tool = 'pointer'
var elements = [];
var groups = [];
var textures = [];
var prev_side = 'north';
var nslide_top, nslide_left, nslide_pre;
var uv_grid = 20;
var uv_clipboard;
var project_saved = true;
var u_history = []
var file_name = false;
var parent_model = '';
var faceIDs = {'north': 0, 'east': 1, 'south': 2, 'west': 3, 'up': 4, 'down': 5}
var keybinds, settings, display_presets;
var canvas_grid = 1;
var outliner, texturelist;
var _vect;
var isApp = true
var tex_version = 1;
keybindSetup()
settingSetup()
displayPresetsSetup()


function keybindSetup() {
    keybinds = {
        canvas_rotate: {ctrl: false, code: 1, name: 'Rotate View (Mouse-Buttons only)', char: 'Left-Click', update: true},
        canvas_drag:{shift: false, ctrl: false, code: 3, name: 'Drag View', char: 'Right-Click', update: true},
        multiselect:{shift: false, ctrl: false, code: 16, name: 'Select Multiple (Shift/Ctrl only)', char: 'SHIFT'},
        open_file:  {shift: false, ctrl: true, code: 79, name: 'Open File', char: 'Ctrl + O'},
        save:       {shift: false, ctrl: true, code: 83, name: 'Save', char: 'Ctrl + S'},
        save_as:    {shift: true, ctrl: true, code: 83, name: 'Save As', char: 'Ctrl + Shift + S'},
        open_texture: {shift: false, ctrl: true, code: 84, name: 'Import Texture', char: 'Ctrl + T'},
        toggle_mode:{shift: false, ctrl: true, code: 9, name: 'Toggle Mode', char: 'Ctrl + TAB'},
        settings:   {shift: false, ctrl: true, code: 69, name: 'Settings', char: 'Ctrl + E'},
        undo:       {shift: false, ctrl: true, code: 90, name: 'Undo', char: 'Ctrl + Z'},
        add_cube:   {shift: false, ctrl: true, code: 78, name: 'Add Cube', char: 'Ctrl + N'},
        new_group:  {shift: false, ctrl: true, code: 71, name: 'Add Group', char: 'Ctrl + G'},
        duplicate:  {shift: false, ctrl: true, code: 68, name: 'Duplicate Cube', char: 'Ctrl + D'},
        select_all: {shift: false, ctrl: true, code: 65, name: 'Select All', char: 'Ctrl + A'},
        delete:     {shift: false, ctrl: false, code: 46, name: 'Delete Selected', char: 'DELETE'},
        uv_copy:    {shift: false, ctrl: true, code: 67, name: 'Copy UV', char: 'Ctrl + C'},
        uv_paste:   {shift: false, ctrl: true, code: 86, name: 'Paste UV', char: 'Ctrl + V'},
        uv_paste_all:   {shift: true, ctrl: true, code: 86, name: 'Paste UV', char: 'Ctrl + Shift + V'},
        copy_disp:  {shift: false, ctrl: true, code: 67, name: 'Copy Display Settings', char: 'Ctrl + C'},
        paste_disp: {shift: false, ctrl: true, code: 86, name: 'Paste Display Settings', char: 'Ctrl + V'},
        reload_tex: {shift: false, ctrl: true, code: 82, name: 'Reload Textures', char: 'Ctrl + R'}
    }
    if (localStorage.getItem('keybinds') != null) {
        var stored_keys = JSON.parse(localStorage.getItem('keybinds'))
        $.extend(keybinds, stored_keys)
    }
}
function settingSetup() {
    settings = {
        origin:      {value: true, name: 'Show Rotation Origin'},
        move_origin: {value: false,name: 'Move Rotated Elements On Own Axis'},
        autouv:      {value: true, name: 'Enable Auto UV by Default'},
        minifiedout: {value: false,name: 'Minified Export'},
        comment:     {value: true, name: 'File Comment'},
        transparency:{value: true, name: 'Show Transparency'}
        
    }
    if (localStorage.getItem('settings') != null) {
        var stored_settings = JSON.parse(localStorage.getItem('settings'))
        $.extend(settings, stored_settings)
    }
}
function displayPresetsSetup() {
    display_presets = [
        {name: 'Vanilla Item', fixed: true, areas: {
            ground: {
                rotation: [ 0, 0, 0 ],
                translation: [ 0, 2, 0],
                scale:[ 0.5, 0.5, 0.5 ]
            },
            head: {
                rotation: [ 0, 180, 0 ],
                translation: [ 0, 13, 7],
                scale:[ 1, 1, 1]
            },
            thirdperson_righthand: {
                rotation: [ 0, 0, 0 ],
                translation: [ 0, 3, 1 ],
                scale: [ 0.55, 0.55, 0.55 ]
            },
            thirdperson_lefthand: {
                rotation: [ 0, 0, 0 ],
                translation: [ 0, 3, 1 ],
                scale: [ 0.55, 0.55, 0.55 ]
            },
            firstperson_righthand: {
                rotation: [ 0, -90, 25 ],
                translation: [ 1.13, 3.2, 1.13],
                scale: [ 0.68, 0.68, 0.68 ]
            },
            firstperson_lefthand: {
                rotation: [ 0, -90, 25 ],
                translation: [ 1.13, 3.2, 1.13],
                scale: [ 0.68, 0.68, 0.68 ]
            },
            fixed: {
                rotation: [ 0, 180, 0 ],
                translation: [ 0, 0, 0 ],
                scale: [ 1, 1, 1 ],
            }
        }
        },
        {name: 'Vanilla Block', fixed: true, areas: {
            gui: {
                rotation: [ 30, 225, 0 ],
                translation: [ 0, 0, 0],
                scale:[ 0.625, 0.625, 0.625 ]
            },
            ground: {
                rotation: [ 0, 0, 0 ],
                translation: [ 0, 3, 0],
                scale:[ 0.25, 0.25, 0.25 ]
            },
            fixed: {
                rotation: [ 0, 0, 0 ],
                translation: [ 0, 0, 0],
                scale:[ 0.5, 0.5, 0.5 ]
            },
            thirdperson_righthand: {
                rotation: [ 75, 45, 0 ],
                translation: [ 0, 2.5, 0],
                scale: [ 0.375, 0.375, 0.375 ]
            },
            thirdperson_lefthand: {
                rotation: [ 75, 45, 0 ],
                translation: [ 0, 2.5, 0],
                scale: [ 0.375, 0.375, 0.375 ]
            },
            firstperson_righthand: {
                rotation: [ 0, 45, 0 ],
                translation: [ 0, 0, 0 ],
                scale: [ 0.40, 0.40, 0.40 ]
            },
            firstperson_lefthand: {
                rotation: [ 0, 225, 0 ],
                translation: [ 0, 0, 0 ],
                scale: [ 0.40, 0.40, 0.40 ]
            }
        }
        },
        {name: 'Vanilla Handheld', fixed: true, areas: {
            thirdperson_righthand: {
                rotation: [ 0, -90, 55 ],
                translation: [ 0, 4.0, 0.5 ],
                scale: [ 0.85, 0.85, 0.85 ]
            },
            thirdperson_lefthand: {
                rotation: [ 0, 90, -55 ],
                translation: [ 0, 4.0, 0.5 ],
                scale: [ 0.85, 0.85, 0.85 ]
            },
            firstperson_righthand: {
                rotation: [ 0, -90, 25 ],
                translation: [ 1.13, 3.2, 1.13 ],
                scale: [ 0.68, 0.68, 0.68 ]
            },
            firstperson_lefthand: {
                rotation: [ 0, 90, -25 ],
                translation: [ 1.13, 3.2, 1.13 ],
                scale: [ 0.68, 0.68, 0.68 ]
            }
        }
        },
        {name: 'Vanilla Handheld Rod', fixed: true, areas: {
            thirdperson_righthand: {
                rotation: [ 0, 90, 55 ],
                translation: [ 0, 4.0, 2.5 ],
                scale: [ 0.85, 0.85, 0.85 ]
            },
            thirdperson_lefthand: {
                rotation: [ 0, -90, -55 ],
                translation: [ 0, 4.0, 2.5 ],
                scale: [ 0.85, 0.85, 0.85 ]
            },
            firstperson_righthand: {
                rotation: [ 0, 90, 25 ],
                translation: [ 0, 1.6, 0.8 ],
                scale: [ 0.68, 0.68, 0.68 ]
            },
            firstperson_lefthand: {
                rotation: [ 0, -90, -25 ],
                translation: [ 0, 1.6, 0.8 ],
                scale: [ 0.68, 0.68, 0.68 ]
            }
        }
        }
    ]
    if (localStorage.getItem('display_presets') != null) {
        var stored_display_presets = JSON.parse(localStorage.getItem('display_presets'))
        $.extend(display_presets, stored_display_presets)
    }
}
$(document).keydown(function(e) {
    if (e.ctrlKey && e.which == 73 && isApp === true) {
        app.getCurrentWindow().toggleDevTools()
    }

    if ($('.dialog').is(":visible")) {
        return;
    }
    if (compareKeys(e, keybinds.open_file) === true) {
        openFile()
    }
    if (compareKeys(e, keybinds.save) === true) {
        saveFile()
    }
    if (compareKeys(e, keybinds.save_as) === true) {
        saveFileAs()
    }
    if (compareKeys(e, keybinds.open_texture) === true) {
        openTexture()
    }
    if (compareKeys(e, keybinds.toggle_mode) === true) {
        if (display_mode === true) {
            exitDisplaySettings()
        } else {
            enterDisplaySettings()
        }
    }
    if (compareKeys(e, keybinds.settings) === true) {
        showDialog('settings');setSettingsTab('setting')
    }
    if (compareKeys(e, keybinds.undo) === true) {
        undo()
    }
    if (display_mode === false) {
        //Edit Mode
        if (compareKeys(e, keybinds.add_cube) === true) {
            addCube(0,0,0,canvas_grid,canvas_grid,canvas_grid)
        }
        if (compareKeys(e, keybinds.duplicate) === true) {
            duplicateCubes()
        }
        if (compareKeys(e, keybinds.select_all) === true) {
            e.preventDefault()
            selectAll()
        }
        if (compareKeys(e, keybinds.delete) === true) {
            if ($(':focus').length == 0) {
                deleteCubes()
            }
        }
        if (compareKeys(e, keybinds.reload_tex) === true && isApp === true) {
            reloadTextures()
        }
        if (selected.length > 0) {
            //Selected
            if (compareKeys(e, keybinds.uv_copy) === true) {
                copyUV()
            }
            if (compareKeys(e, keybinds.uv_paste) === true) {
                pasteUV()
            }
            if (compareKeys(e, keybinds.uv_paste_all) === true) {
                pasteUV(true)
            }
            if (compareKeys(e, keybinds.new_group) === true) {
                addGroup()
            }
        }
    } else if (display_mode === true) {    //Display Mode
        if (compareKeys(e, keybinds.copy_disp) === true) {
            copyDisplaySlot()
        }
        if (compareKeys(e, keybinds.paste_disp) === true) {
            pasteDisplaySlot()
        }
    }
})
if (typeof require != 'undefined') {
    $.getScript("js/io.js")
} else {
    $.getScript("js/web.js");
    isApp = false;
}
$(document).ready(function() {
    if (localStorage.getItem('donated') == 'true') {
        $('#donation_hint').remove()
    }
    if (localStorage.getItem('canvas_grid') != null) {
        canvas_grid = parseFloat(localStorage.getItem('canvas_grid'))
        var id = 16;
        if (canvas_grid == 1) {
            id = 16
        } else if (canvas_grid == 0.5) {
            id = 32
        } else if (canvas_grid == 0.25) {
            id = 64
        }
        setTimeout(function() {
            $('#canvas_grid option#'+id).prop('selected', true)
        }, 42)
    }
    $('#uv_size').resizable({
        handles: "n, e, s, w",
        maxHeight: 320,
        maxWidth: 320,
        containment: 'parent',
        resize: function(event, ui) {
            saveUV()
            setUndo()
        },
        grid: [uv_grid,uv_grid]
    })
    $('#uv_size').draggable({
        containment: 'parent',
        stop: function(event, ui) {
            saveUV()
            setUndo()
        },
        drag: function( event, ui ) {
            var snapTolerance = $(this).draggable('option', 'snapTolerance');
            var topRemainder = ui.position.top % uv_grid;
            var leftRemainder = ui.position.left % uv_grid;
            
            if (topRemainder <= snapTolerance) {
                ui.position.top = ui.position.top - topRemainder;
            }
            
            if (leftRemainder <= snapTolerance) {
                ui.position.left = ui.position.left - leftRemainder;
            }
            saveUV()
        } 
    })

    setupVue()

    $('#cubes_list').sortable({})

    $('#uv_frame').droppable({
        accept: 'li.texture',
        tolerance: 'pointer',
        drop: function(event, ui) {
            if (selected.length == 0) {
                return
            }
            var id = $(ui.helper).find('span.texture_id').text()
            changeFaceTexture(id, true)
            updateCanvas()
        }
    })
    $('#uv').on('mousewheel', function() {
        if (event.deltaY > 0) {
            cycleFaces(1)
        } else {
            cycleFaces(-1)
        }
    })

    $('.nslide').draggable({
        revert: true,
        revertDuration: 0,
        helper: function () {return '<div id="nslide_head"><span id="nslide_offset"></span><br><span id="nslide_accuracy"></span></div>'},
        opacity: 0.8,
        appendTo: 'body',
        cursor: "none",
        drag: function(event, ui) {
            nslide(this, event, ui)
        },
        start: function(event, ui) {
            nslide_pre = 0
            nslide_top = ui.position.top
            nslide_left = ui.position.left
        },
        stop: function() {
            updateCanvas()
            setUndo()
        }
    })
    $('.nslide').keypress(function (e) {
        if (e.keyCode == 10 || e.keyCode == 13) {
            e.preventDefault();
            $(this).attr('contenteditable', 'false')
            var number = $(this).text().replace(/[^-.0-9]/g, "");
            $(this).text(number)
        }
    })
    .keyup(function (e) {
        if (e.keyCode == 10 || e.keyCode == 13) {
        } else {
            nslide($(this), e, 'input')
        }
    })
    .focusout(function() {
        $(this).attr('contenteditable', 'false')
        var number = $(this).text().replace(/[^-.0-9]/g, "");
        $(this).text(number)
    })
    $('.nslide').on('click', function(event) {
        if (selected.length == 0) return;
        /*if (event.target.tagName == 'INPUT') return;
        $(this).find('input').remove()
        $(this).prepend('<input type="text" class="nslide_text">')
        var input = $(this).find('input')
        */
        $(this).attr('contenteditable', 'true')
        $(this).focus()
        document.execCommand('selectAll')
        $(this).val(nslideStorage($(this).attr('n-action')))
        $(this).keyup(function(event) {
            if (event.which == 13) {
            }
        })
    })
})
function setupVue() {
    outliner = new Vue({
        el: '#cubes_list',
        data: {groups, elements},
        methods: {
            toggleV: function(item) {
                item.display.visibility = !item.display.visibility
                updateCanvas()
            },
            toggleS: function(item) {
                item.shade = !item.shade
            },
            deleteC: function(item) {
                var index = elements.indexOf(item)
                elements.splice(index, 1)
                selected = []
                updateCanvas()
                updateSelection()
            },
            selectC: function(item, event) {
                if (display_mode === true) return;
                var index = elements.indexOf(item)
                addToSelection(index, event)
            },
            selectG: function(item, event) {
                var group = groups[groups.indexOf(item)]
                if (!event.shiftKey) {
                    groups.forEach(function(s) {
                        if (s === group) return;
                        s.isselected = false;
                    })
                }
                group.isselected = !group.isselected
                selected.length = 0
                group.content.forEach(function(s) {
                    if (elements.includes(s) === true) {
                        selected.push(elements.indexOf(s))
                    } else {
                        delete s
                    }
                })
                updateSelection()
            },
            deleteG: function(item) {
                var index = groups.indexOf(item)
                groups.splice(index, 1)
            },
            rebuildG: function(item) {
                var index = groups.indexOf(item)

                var selectedCubes = []
                selected.forEach(function(s) {
                    selectedCubes.push(elements[s])
                })
                groups[index].content = selectedCubes
                groups[index].count = selectedCubes.length
            }



        }
    })
    outliner._data.groups = groups
    outliner._data.elements = elements





    texturelist = new Vue({
        el: '#texture_list',
        data: {textures},
        methods: {
            toggleP: function(texture) {
                textures.forEach(function(t) {
                    t.particle = false;
                })
                texture.particle = true
            },
            selectT: function(item, event) {
                var index = textures.indexOf(item)
                textures.forEach(function(s) {
                    s.selected = false;
                })
                textures[index].selected = true
            },
            changePath: function(item, event) {
                var index = textures.indexOf(item)
                changeTexturePath(textures[index])
            }
        }
    })
    texturelist._data.elements = textures



    var keybindlist = new Vue({
        el: 'ul#keybindlist',
        data: {keybinds},
        methods: {
            prepareInput: function(key) {
                $('div:focus').on('keyup mousedown', function(event) {
                    event.preventDefault()
                    key.code = event.which
                    key.ctrl = event.ctrlKey
                    key.shift = event.shiftKey
                    keys = []
                    if (key.ctrl) keys.push('Ctrl')
                    if (key.shift) keys.push('Shift')
                    if (key.code === 1) {
                        keys.push('Left-Click')
                    } else if (key.code === 2) {
                        keys.push('Mousewheel')
                    } else if (key.code === 3) {
                        keys.push('Right-Click')
                    } else {
                        keys.push(event.key.toUpperCase())
                    }
                    key.char = keys.join(' + ')
                    if (key.update === true) {
                        if (key.name == 'Rotate View' && event.which <= 3) {
                            controls.mouseButtons.ORBIT = event.which-1
                        } else if (key.name == 'Drag View' && event.which <= 3) {
                            controls.mouseButtons.PAN = event.which-1
                        }
                    }

                    $(this).blur()
                    $(this).off('keyup mousedown')
                    localStorage.setItem('keybinds', JSON.stringify(keybinds))
                })
                $('div:focus').on('keydown keypress mousedown', function(event) {
                    event.preventDefault()
                })
            }
        }
    })
    keybindlist._data.elements = keybinds


    var settingslist = new Vue({
        el: 'ul#settingslist',
        data: {settings},
        methods: {
            saveSettings: function() {
                localStorage.setItem('settings', JSON.stringify(settings))
            }
        }
    })
    settingslist._data.elements = settings


    var displaypresets_vue = new Vue({
        el: '#display_presets',
        data: {display_presets},
        methods: {
            applyPreset: function(preset, event) {
                var index = display_presets.indexOf(preset)
                applyDisplayPreset(display_presets[index])
            },
            deletePreset: function(preset, event) {
                var index = display_presets.indexOf(preset)
                if (display_presets[index].fixed == true) return;
                display_presets.splice(index, 1)
                localStorage.setItem('display_presets', JSON.stringify(display_presets))
            }
        }
    })
    displaypresets_vue._data.display_presets = display_presets
}
function nslide(obj, event, ui) {
    if (selected.length == 0) {return;}
    var number = 0;
    if (ui === 'input') {
        var number = $(obj).text().replace(/[^-.0-9]/g, "");
        var number = parseFloat(number)
        if (isNaN(number)) {
            return;
        }
        nslideStorage($(obj).attr('n-action'), number)
        updateCanvas()
    } else {
        var y_offset = ui.position.top-nslide_top
        var divider = 1000;
        var color = ''
        if (y_offset < 100) {
            divider = 1
            color = '#0ba3fb'   //Blue
        } else if (y_offset < 200) {
            divider = 2
            color = '#07c438'   //Green
        } else if (y_offset < 300) {
            divider = 4
            color = '#eda803'   //Yellow
        } else {
            divider = 8
            color = '#ff2f06'   //Red
        }
        $('#nslide_head #nslide_accuracy').text('Accuracy: '+divider)
        $('#nslide_head #nslide_accuracy').css('background', color)
        if (event.shiftKey) {
            nslide_top = -y_offset
            $(obj).draggable( "option", "axis", "x" );
        } else {
            $(obj).draggable( "option", "axis", "" );
        }

        var offset = Math.round((ui.position.left-nslide_left)/50)*canvas_grid
        var difference = offset - nslide_pre;
        nslide_pre = offset;
        difference = difference / divider;
        if (difference == 0) {
            return;
        } else {
            var action = $(obj).attr('n-action')
            if (groups.filter(function(s) {return s.isselected}).length > 0) {
                groups.forEach(function(s) {
                    if (s.isselected) {
                        s.content.forEach(function(s) {
                            executeNslide(action, elements.indexOf(s), difference)
                        })
                    }
                })
            } else {
                selected.forEach(function(s) {
                    executeNslide(action, s, difference)
                })
            }
            updateCanvas()
        }
    }
}
function executeNslide(action, index, difference) {
    var number = nslideStorage(action, false, index)
    number += difference;
    nslideStorage(action, number, index)
    $('#nslide_head #nslide_offset').text('Offset: '+number)

}
function nslideStorage(key, val, index) {
    if (selected.length == 0) {return;}
    var isgroup;
    groups.forEach(function(s) {
        if (s.isselected) {
            isgroup = s
        }
    })
    if (val !== undefined && val !== false) {
        if (index != undefined) {
            affected = [index]
        } else {
            affected = selected;
        }
        affected.forEach(function(s) {
            if (key.includes('origin') && elements[s].rotation == undefined) {
                elements[s].rotation = {origin:[8,8,8], axis: 'y', angle: 0}
            }
            switch (key) {
                case 'pos_x':
                moveCube(elements[s], val, 0)
                break;
                case 'pos_y':
                moveCube(elements[s], val, 1)
                break;
                case 'pos_z':
                moveCube(elements[s], val, 2)
                break;

                case 'size_x':
                scaleCube(elements[s], val, 0)
                break;
                case 'size_y':
                scaleCube(elements[s], val, 1)
                break;
                case 'size_z':
                scaleCube(elements[s], val, 2)
                break;

                case 'origin_x':
                if (isgroup) {    
                    isgroup.origin[0] = val
                } else {
                    elements[s].rotation.origin[0] = val
                }
                break;
                case 'origin_y':
                if (isgroup) {    
                    isgroup.origin[1] = val
                } else {
                    elements[s].rotation.origin[1] = val
                }
                break;
                case 'origin_z':
                if (isgroup) {    
                    isgroup.origin[2] = val
                } else {
                    elements[s].rotation.origin[2] = val
                }
                break;
            }
        })
    } else {                                //GET
        if (index == undefined) index = selected[0]
        switch (key) {
            case 'pos_x':
            return elements[index].from[0]
            break;
            case 'pos_y':
            return elements[index].from[1]
            break;
            case 'pos_z':
            return elements[index].from[2]
            break;

            case 'size_x':
            return elements[index].size(0)
            break;
            case 'size_y':
            return elements[index].size(1)
            break;
            case 'size_z':
            return elements[index].size(2)
            break;

            case 'origin_x':
            if (isgroup) {
                return isgroup.origin[0]
            } else {
                try {
                    return elements[index].rotation.origin[0]
                } catch (err) {
                    return 8;
                }
            }
            break;
            case 'origin_y':
            if (isgroup) {
                return isgroup.origin[1]
            } else {
                try {
                    return elements[index].rotation.origin[1]
                } catch (err) {
                    return 8;
                }
            }
            break;
            case 'origin_z':
            if (isgroup) {
                return isgroup.origin[2]
            } else {
                try {
                    return elements[index].rotation.origin[2]
                } catch (err) {
                    return 8;
                }
            }
            break;
        }
    }
}
function isInBox(val) {
    if (val < 32 && val > -16) {
        return true;
    }
}
function limitToBox(val) {
    if (val > 32) {
        return 32;
    } else if (val < -16) {
        return -16;
    } else {
        return val;
    }
}
function moveCube(obj, val, axis) {
    val = limitToBox(val)
    val = limitToBox(val + obj.size(axis))
    var size = obj.size(axis)
    var difference = val - obj.to[axis]
    obj.to[axis] = val
    obj.from[axis] = val - size
    if (obj.rotation && settings.move_origin.value === false) {
        obj.rotation.origin[axis] += difference
    }
}
function scaleCube(obj, val, axis) {
    obj.to[axis] = limitToBox(val + obj.from[axis])
    if (obj.display.autouv === true) {
        obj.faces.north.uv = calcAutoUV(obj, 'north', [obj.size(0), obj.size(1)])
        obj.faces.east.uv = calcAutoUV(obj, 'east', [obj.size(2), obj.size(1)])
        obj.faces.south.uv = calcAutoUV(obj, 'south', [obj.size(0), obj.size(1)])
        obj.faces.west.uv = calcAutoUV(obj, 'west', [obj.size(2), obj.size(1)])
        obj.faces.up.uv = calcAutoUV(obj, 'up', [obj.size(0), obj.size(2)])
        obj.faces.down.uv = calcAutoUV(obj, 'down', [obj.size(0), obj.size(2)])
        updateUV(elements.indexOf(obj))
    }
}
function calcAutoUV(obj, face, size) {
    var sx = obj.faces[face].uv[0]
    var sy = obj.faces[face].uv[1]
    var rot = obj.faces[face].rotation

    //Match To Rotation
    if (rot === 90 || rot === 270) {
        size.reverse()
    }
    //Limit Input to 16
    size.forEach(function(s) {
        if (s > 16) {
            s = 16
        }
    })
    //Calculate End Points
    var x = sx + size[0]
    var y = sy + size[1]
    //Prevent Over 16
    if (x > 16) {
        sx = 16 - (x - sx)
        x = 16
    }
    if (y > 16) {
        sy = 16 - (y - sy)
        y = 16
    }
    //Prevent Negative
    if (sx < 0) sx = 0
    if (sy < 0) sy = 0
    //Prevent Mirroring
    if (x < sx) x = sx
    if (y < sy) y = sy

    //if ()
    //Return
    return [sx, sy, x, y]
}
function triggerAutoUV() {
    Vue.nextTick(function() {
        setTimeout(function() {
            scaleCube(elements[selected[0]], 0, 'x')
        }, 10)
    })
}
function updateNslideValues() {
    var m_pos = ['', '', '']
    var m_size = ['', '', '']
    var m_origin = ['', '', '']
    if (selected.length >= 1) {
        m_pos = elements[selected[0]].from

        m_size = [elements[selected[0]].size(0), elements[selected[0]].size(1), elements[selected[0]].size(2)]
        var isgroup;
        groups.forEach(function(s) {
            if (s.isselected) {
                isgroup = s
            }
        })
        if (isgroup != undefined) {
            m_origin = isgroup.origin
        } else if (elements[selected[0]].rotation != undefined) {
            m_origin = elements[selected[0]].rotation.origin
        }
    }
    $('div.nslide[n-action="pos_x"]:not(":focus")').text(m_pos[0])
    $('div.nslide[n-action="pos_y"]:not(":focus")').text(m_pos[1])
    $('div.nslide[n-action="pos_z"]:not(":focus")').text(m_pos[2])

    $('div.nslide[n-action="size_x"]:not(":focus")').text(m_size[0])
    $('div.nslide[n-action="size_y"]:not(":focus")').text(m_size[1])
    $('div.nslide[n-action="size_z"]:not(":focus")').text(m_size[2])

    $('div.nslide[n-action="origin_x"]:not(":focus")').text(m_origin[0])
    $('div.nslide[n-action="origin_y"]:not(":focus")').text(m_origin[1])
    $('div.nslide[n-action="origin_z"]:not(":focus")').text(m_origin[2])
}
function setCanvasGrid() {
    var select_option = $('#canvas_grid option:selected').attr('id')
    if (select_option === '16') {
        canvas_grid = 1
    } else if (select_option === '32') {
        canvas_grid = 0.5
    } else if (select_option === '64') {
        canvas_grid = 0.25
    }
    localStorage.setItem('canvas_grid', canvas_grid)
}
function loadTextureDraggable() {
    Vue.nextTick(function() {
        setTimeout(function() {
            $('li.texture').draggable({
                revertDuration: 100,
                helper: 'clone',
                revert: 'invalid',
                appendTo: 'body',
                zIndex: 19
            })
        }, 10)
    })
}
function setUVGrid() {
    var select_option = $('#grid_snap option:selected').attr('id')
    if (select_option === 'none') {
        uv_grid = 0
    } else if (select_option === '16') {
        uv_grid = 20
    } else if (select_option === '32') {
        uv_grid = 10
    } else if (select_option === '64') {
        uv_grid = 5
    }
    $('.uv_coord').attr('step', uv_grid/20)
    $('#uv_size').resizable('option', 'grid', [uv_grid,uv_grid])
}
function setUVRotation() {
    var value = $('select#uv_rotate option:selected').attr('id')
    var side = $('#texture_bar input:checked').attr('id');
    selected.forEach(function(s) {
        if (value == 0) {
            delete elements[0].faces[side].rotation
        } else {
            elements[0].faces[side].rotation = parseInt(value)
        }
        updateUV(s)
    })
}
function toggleAmbOcc() {
}

//Cube
function cube(x1, y1, z1, x2, y2, z2, name, shade) {    //Constructor
    //Prototype
    if (x1 === undefined) x1 = 0;
    if (y1 === undefined) y1 = 0;
    if (z1 === undefined) z1 = 0;
    if (x2 === undefined) x2 = 1;
    if (y2 === undefined) y2 = 1;
    if (z2 === undefined) z2 = 1;
    if (!name) name = 'cube';
    if (!shade) shade = true;
    this.name = name;
    this.from = [x1, y1, z1];
    this.to = [x2, y2, z2];
    this.shade = shade;
    this.display = {visibility: true, isselected: true, autouv: settings.autouv.value, export: true}
    this.faces = {north:{uv:[0,0,x2-x1,y2-y1]}, east:{uv:[0,0,z2-z1,y2-y1]}, south:{uv:[0,0,x2-x1,y2-y1]}, west:{uv:[0,0,z2-z1,y2-y1]}, up:{uv:[0,0,x2-x1,y2-y1]}, down:{uv:[0,0,x2-x1,y2-y1]}}

    this.size = function(axis) {
        if (axis != undefined) {
            return this.to[axis] - this.from[axis];
        } else {
            return [(this.x2 - x1), (this.y2 - y1), (this.z2 - z1)]
        }
    }
}
function addCube(x1, y1, z1, x2, y2, z2) {
    setUndo()
    elements.push(new cube(x1, y1, z1, x2, y2, z2, name))
    
    selected = [elements.length-1]
    updateCanvas()
    Vue.nextTick(function() {updateSelection()})
}
//Actions
function duplicateCubes() {
    selected.forEach(function(s, i) {
        var base_cube = new cube(0,0,0,1,1,1,'cube')
        $.extend(true, base_cube, elements[s])
        elements.push(base_cube)
        selected[i] = elements.length-1
    })
    updateCanvas()
    setUndo()
}
function origin2geometry() {
    selected.forEach(function(s) {
        if (elements[s].rotation == undefined) {
            elements[s].rotation = {origin:[8,8,8], axis: 'y', angle: 0}
        }
        elements[s].rotation.origin[0] = (elements[s].size(0) / 2) + elements[s].from[0]
        elements[s].rotation.origin[1] = (elements[s].size(1) / 2) + elements[s].from[1]
        elements[s].rotation.origin[2] = (elements[s].size(2) / 2) + elements[s].from[2]
    })
    updateCanvas()
    setUndo()
}
function rotation(set) {
    if (selected.length == 0) {return;}
    if (set) {
        var angle = $('#cube_rotate').val()
        var axis = $('#cube_axis option:selected').attr('id')
        var rescale = $('#cube_rescale').is(':checked')
        selected.forEach(function(s) {
            if (elements[s].rotation == undefined) {
                elements[s].rotation = {origin:[8,8,8], axis: 'y', angle: 45}
            }
            elements[s].rotation.angle = parseFloat(angle);
            elements[s].rotation.axis = axis;
            if (rescale === true) {
                elements[s].rotation.rescale = true;
            } else {
                delete elements[s].rotation.rescale;
            }
        })
        updateCanvas()
        setUndo()
    } else {
        var s = selected[0]
        try {
            $('#cube_rotate').val(elements[s].rotation.angle)
            $('#cube_axis').val(elements[s].rotation.axis)
            var rescale = elements[s].rotation.rescale
            if (rescale === undefined) {
                rescale = false;
            }
            $('#cube_rescale').prop('checked', rescale);
        } catch (err) {
            $('#cube_rotate').val('0');
            $('#cube_axis').val('y');
            $('#cube_rescale').prop('checked', false);
        }
    }
}
function deleteCubes(array) {
    if (array == undefined) {
        array = selected.slice(0)
    }
    if (array.constructor !== Array) {
        array = [array]
    } else {
        array.sort(function(a,b){return a - b}).reverse()
    }
    array.forEach(function(s) {
        elements.splice(s, 1)
        if (selected.includes(s)) {
            selected.splice(selected.indexOf(s), 1)
        }
        groups.forEach(function(g) {
            g.update()
        })
    })
    groups.forEach(function(s, i) {
        if (s.isselected) {
            groups.splice(i, 1)
        }
    })
    updateCanvas()
}

//Selections
function addToSelection(id, event) {
    var multi = event.ctrlKey === (keybinds.multiselect.code === 17)
    if (multi === true) {
        multi = event.shiftKey === (keybinds.multiselect.code === 16)
    }
    if (multi === true) {
        if (selected.includes(id)) {
            selected = selected.filter(function(e) {return e !== id})
        } else {
            selected.push(id)
        }
    } else {
        selected = [id]
    }
    updateSelection()
}
function updateSelection() {
    scene.remove(rot_origin)
    outlines.children = []
    elements.forEach(function(s) {
        s.display.isselected = false
    })
    selected.forEach(function(s) {
        if (elements[s] !== undefined) {
            elements[s].display.isselected = true
            buildOutline(s)
        } else {
            selected.splice(selected.indexOf(s), 1)
        }
    })
    if (selected.length === 1 && settings.origin.value === true) {
        var obj = elements[selected[0]]
        if (obj.rotation != undefined) {
            setOriginHelper(obj.rotation)
        } else {
            setOriginHelper({origin: [8,8,8], axis: 'x', angle: 0})
        }
    }
    groups.forEach(function(g) {
        var gcontent = []
        g.content.forEach(function(s) {
            gcontent.push(elements.indexOf(s))
        })
        if (gcontent.equals(selected)) {
            g.isselected = true
            setOriginHelper({origin: g.origin, axis: 'x', angle: 0})
        } else {
            g.isselected = false
        }
    })
    if (selected.length > 0) {
        $('.ui#uv').show(0)
        loadUV(true)
        rotation(false)
    } else {
        $('.ui#uv').hide(0)
    }
    $('#outliner_stats').text(selected.length+'/'+elements.length)
    updateNslideValues()
}
function selectAll() {
    if (selected.length < elements.length) {
        selected = []
        var i = 0; 
        while (elements.length > i) {
            selected.push(i)
            i++;
        }
    } else {
        selected = []
    }
    updateSelection()
}

function limitCoord(coord) {
    if (coord > 32) {coord = 32}
    else if (coord < -16) {coord = -16}
    return coord;
}
function parentModel() {
    parent_model = $('#parent_model').val()
}

//Undo
function setUndo() {
    var save = []
    elements.forEach(function(s) {
        var tcube = {}
        $.extend(true, tcube, s)
        save.push(tcube)
    })
    if (u_history[u_history.length-1] !== save) {
        u_history.push(save)
    }
    if (u_history.length > 20) {
        u_history.shift()
    }
    project_saved = false;
}
function undo() {
    selected = []
    if (u_history.length <= 0) return;
    var file = u_history.splice(-1)
    elements.length = 0
    file[0].forEach(function(s) {
        base_cube = new cube(0,0,0,1,1,1,'cube')
        $.extend(true, base_cube, s);
        elements.push(base_cube);
    })
    groups.forEach(function(g) {
        g.update()
    })
    updateCanvas()
    outliner.$forceUpdate();
}

//Textures
function texture(path, id, particle) {
    //Prototype
    if (!path) {}
    if (particle === undefined) particle = false
    this.particle = particle;
    this.path = path;
    if (isApp) {
        this.iconpath = this.path + '?' + tex_version;
    } else {
        this.iconpath = this.path;
    }
    this.selected = false
    this.name = this.path.split('\\').slice(-1)[0]
    this.folder = false;

    var thisTexture = this;
    this.subfolder = function() {
        if (thisTexture.folder === false) {
            var arr = this.path.split('\\')
            return arr[arr.length-2]
        } else {
            return thisTexture.folder
        }
    }
    


    this.reload = function() {
        if (thisTexture.material !== undefined) {
            thisTexture.material.dispose()
            delete thisTexture.material
        }
        var img = new Image()
        try {
            img.src = thisTexture.iconpath
        } catch(err) {
            img.src = 'missing.png'
        }
        var tex = new THREE.Texture(img)
        img.tex = tex;
        img.tex.magFilter = THREE.NearestFilter
        img.tex.minFilter = THREE.LinearMipMapLinearFilter
        img.onload = function() {
            this.tex.needsUpdate = true;
            thisTexture.res = img.naturalWidth;
        }
        thisTexture.material = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex, transparent: settings.transparency.value});
    }
    this.reload()

    textures.forEach(function(s) {
        if (s !== textures[textures.length-1]) {
            s.selected = false;
        }
    })
    if (!id) {
        var i = 0;
        while (true) {
            var matches = $.grep(textures, function(e) {return e.id == i})
            if (matches.length > 0) {
                i++;
            } else {
                this.id = i;
                return;
            }
        }
    } else {
        this.id = id
    }
}
function applyTexture(all) {
    setUndo()
    var id;
    textures.forEach(function(s) {
        if (s.selected) {
            id = s.id
        }
    })
    if (id === undefined) return;
    var side = $('#texture_bar input:checked').attr('id');
    if (all) {
        var sides = ['north', 'east', 'south', 'west', 'up', 'down']
    } else {
        var sides = [side]
    }
    selected.forEach(function(s) {
        sides.forEach(function(side) {
            elements[s].faces[side].texture = '#'+id
        })
    })
    updateCanvas()
    loadUV(true)
}
function reloadTextures() {
    tex_version++;

    textures.forEach(function(t) {
        t.iconpath = t.path + '?' + tex_version;
        t.reload()
    })
    updateCanvas()
    loadUV(true)
}

//UV
function cycleFaces(amount) {
    var id = faceIDs[$('#texture_bar input:checked').attr('id')]
    id += amount
    if (id === 6) id = 0
    if (id === -1) id = 5
    $('input#'+getKeyByValue(faceIDs, id)).prop("checked", true)
    loadUV(false)
}
function saveUV() {
    //Set UV to object
    var side = $('#texture_bar input:checked').attr('id');
    selected.forEach(function(s) {
        var obj = elements[s]
        var left = $('#uv_size').position().left/20
        var top  = $('#uv_size').position().top/20
        var left2 = ($('#uv_size').width()/20)+left
        var top2 = ($('#uv_size').height()/20)+top
        obj.faces[side].uv = [left, top, left2, top2]
        updateUV(s)
    })
    loadUVcoords(elements[selected[0]], side)
}
function loadUV(force, coords) {
    var frame = $('#uv_size').get(0)
    var side = $('#texture_bar input:checked').attr('id');
    if (side == prev_side && force === false) {
        return;
    }
    prev_side = side;
    var obj = elements[selected[0]]
    if (obj === undefined) {
        $('.ui#uv').hide(0)
        return;
    }
    if (obj.faces[side] === undefined) {
        $('input#cullface').prop('checked', false)
        $('#uv_rotate').val('0')
        $('#uv_frame').css('background', 'transparent')
        $(frame).width(0)
        $(frame).height(0)
        $('.uv_coord').val(0)
        return;
    }
    if (obj.faces[side].rotation) {
        $('#uv_rotate').val(obj.faces[side].rotation)
    } else {
        $('#uv_rotate').val('0')
    }
    if (obj.faces[side].texture != undefined) {
        try {
            changeFaceTexture(obj.faces[side].texture)
        } catch (err) {}
    } else {
        $('#uv_frame').css('background', 'transparent')
    }
    $(frame).width((obj.faces[side].uv[2]-obj.faces[side].uv[0])*20)
    $(frame).height((obj.faces[side].uv[3]-obj.faces[side].uv[1])*20)
    var x = obj.faces[side].uv[0]*20;
    var y = obj.faces[side].uv[1]*20
    $('#uv_size').css('left', x+'px')
    $('#uv_size').css('top', y+'px')
    if (coords !== false) {
        loadUVcoords(obj, side)
    }
    if (obj.faces[side].cullface) {
        $('input#cullface').prop('checked', true)
    } else {
        $('input#cullface').prop('checked', false)
    }
}
function setUV(left, top, left2, top2) {
    var side = $('#texture_bar input:checked').attr('id');
    if (left == 'full') {
        left = top = 0;
        left2 = top2 = 16;
    } else if (left == 'auto') {
        var obj = elements[selected[0]]
        left = top = 0;
        if (side == 'north' || side == 'south') {
            left2 = obj.size('0')
            top2 = obj.size('1')
        } else if (side == 'east' || side == 'west') {
            left2 = obj.size('2')
            top2 = obj.size('1')
        } else if (side == 'up' || side == 'down') {
            left2 = obj.size('0')
            top2 = obj.size('2')
        }
    } else if (left == 'clear') {
        selected.forEach(function(s) {
            delete elements[s].faces[side].texture
            updateUV(s)
        })
        updateCanvas()
        top = left = top2 = left2 = 0;
    }
    selected.forEach(function(s) {
        elements[s].faces[side].uv = [left, top, left2, top2]
        updateUV(s)
    })
    loadUV(true)
}
function switchCullface() {
    var val = $('input#cullface').is(':checked')
    var side = $('#texture_bar input:checked').attr('id');
    selected.forEach(function(s) {
        if (val) {
            elements[s].faces[side].cullface = side
        } else {
            delete elements[s].faces[side].cullface
        }
        updateUV(s)
    })
}
function changeFaceTexture(id, change) {
    var tex = getTextureById(id+'')
    if (tex === undefined) {
        tex = textures[0]
    }
    var css = 'url('+tex.iconpath.split('\\').join('\\\\').replace(/ /g, '%20')+')'
    $('#uv_frame').css('background-image', css)
    $('#uv_frame').css('background-size', 'contain')
    var side = $('#texture_bar input:checked').attr('id');
    if (!change) return;
    selected.forEach(function(s) {
        elements[s].faces[side].texture = '#'+tex.id
        updateUV(s)
    })
}
function getTextureById(id) {
    id = id.split('#').join('')
    return $.grep(textures, function(e) {return e.id == id})[0]
}
function copyUV() {
    var obj = elements[selected[0]]
    var side = $('#texture_bar input:checked').attr('id');
    uv_clipboard = {
        uv: obj.faces[side].uv,
        texture: obj.faces[side].texture
    }
    if (obj.faces[side].rotation) {
        uv_clipboard.rotation = obj.faces[side].rotation
    }
    uv_clipboard = JSON.stringify(uv_clipboard)
}
function pasteUV(all) {
    setUndo()
    if (uv_clipboard == undefined) {return;}
    var side = $('#texture_bar input:checked').attr('id');
    selected.forEach(function(s) {
        if (all) {
            var sides = ['north', 'east', 'south', 'west', 'up', 'down']
        } else {
            sides = [side]
        }
        sides.forEach(function(side) {
            var obj = JSON.parse(uv_clipboard)
            $.extend(true, elements[s].faces[side], obj)
            elements[s].faces[side] = obj
        })
    })
    loadUV(true)
    updateCanvas()
}
function loadUVcoords(obj, side) {
    $('#uv_coord_x1').val(obj.faces[side].uv[0])
    $('#uv_coord_y1').val(obj.faces[side].uv[1])
    $('#uv_coord_x2').val(obj.faces[side].uv[2])
    $('#uv_coord_y2').val(obj.faces[side].uv[3])
}
function inputToUV(obj, index) {
    var side = $('#texture_bar input:checked').attr('id');
    var number = parseFloat($(obj).val())
    //var number = parseFloat(number)
    if (isNaN(number)) {
        return;
    }
    if (number < 0) number = 0
    if (number > 16) number = 16
    selected.forEach(function(s) {
        elements[s].faces[side].uv[index] = number
        updateUV(s)
    })
    loadUV(true, false)
}
//Misc
function buildBlockModel() {
    var clear_elements = []
    var textures_used = []
    elements.forEach(function(s, i) {
        if (s.display.export == false) return;
        var element = {}
        $.extend(true, element, s)
        clear_elements.push(omitKeys(element, ['display']))
        for (var face in s.faces) {
            if (s.faces.hasOwnProperty(face)) {
                if (!textures_used.includes(s.faces[face].texture)) {
                    textures_used.push(s.faces[face].texture)
                }
            }
        }
    })
    clear_elements.forEach(function(s) {
        for (var face in s.faces) {
            if (s.faces.hasOwnProperty(face)) {
                if (s.faces[face].texture == undefined) {
                    delete s.faces[face]
                }
            }
        }
    })


    var texturesObj = {}
    textures.forEach(function(s, i){
        if (!textures_used.includes('#'+s.id)) return;
        texturesObj[s.id] = s.subfolder()+'/'+s.name.split('.png').join('')
        if (s.particle) {
            texturesObj.particle = s.subfolder()+'/'+s.name.split('.png').join('')
        }
    })
    var blockmodel = {}
    if (settings.comment.value === true) {
        blockmodel.credit = 'Made with Blockbench, a free, modern block model editor made by JannisX11';
    }
    if (parent_model != '') {
        blockmodel.parent = parent_model
    }
    blockmodel.textures = texturesObj
    if (elements.length >= 1) {
        blockmodel.elements = clear_elements
    }
    if (Object.keys(display).length >= 1) {
        blockmodel.display = display
    }
    if (!$('#ambientocclusion').is(':checked')) {
        blockmodel.ambientocclusion = false
    }
    if (settings.minifiedout.value === true) {
        return JSON.stringify(blockmodel)
    } else {
        return stringify(blockmodel, {indent: '\t', maxLength: 60})
    }
}
function loadFile(data, filepath) {       //Load File Into GUI
    if (newProject() == false) return;
    file_name = filepath
    data = JSON.parse(data)
    if (data.display !== undefined)
        display = data.display
    var obj = data.elements
    for (var item in obj) {
        if (obj.hasOwnProperty(item)) {
            base_cube = new cube(0,0,0,1,1,1,'cube')
            $.extend(true, base_cube, obj[item]);
            elements.push(base_cube);
        }
    }
    var path_arr = filepath.split('\\')
    path_arr.splice(-3)
    path_arr = path_arr.join('\\')
    var texture_arr = data.textures
    var names = []
    for (var tex in texture_arr) {
        if (texture_arr.hasOwnProperty(tex)) {
            if (tex != 'particle') {
                var path = path_arr+'\\textures\\'+texture_arr[tex].split('/').join('\\')+'.png'
                textures.push(new texture(path, tex, false))
                names.push(tex)
            }
        }
    }
    if (texture_arr === undefined) texture_arr = {}
    if (texture_arr.particle) {
        var path = path_arr+'\\textures\\'+texture_arr.particle.split('/').join('\\')+'.png'
        if ($.inArray(texture_arr.particle, names)) {
            textures.forEach(function(s) {
                if (s.path == path) {
                    s.particle = true;
                }
            })
        } else {
            textures.push(new texture(path, 'particle', true))
        }
    }
    if (data.parent !== undefined) {
        parent_model = data.parent;
        $('#parent_model').val(parent_model)
    }
    if (data.ambientocclusion === false) {
        $('input#ambientocclusion').prop('checked', false)
    }
    loadTextureDraggable()
    updateCanvas()
    setUndo()
}
function buildEntityModel() {
    var entitymodel = {}
    entitymodel.texturewidth = 64;
    entitymodel.textureheight = 32;
    var bones = []
    groups.forEach(function(g) {
        var bone = {}
        bone.name = g.name
        bone.pivot = g.origin
        bone.cubes = []
        g.content.forEach(function(s) {
            if (s === undefined) return;
            var cube = {}
            cube.origin = s.from
            cube.size = s.size()
            cube.uv = [s.faces.north.uv[0], s.faces.north.uv[0]]
            bone.cubes.push(cube)
        })
        bones.push(bone)
    })
    entitymodel.bones = bones
    return stringify(entitymodel, {indent: '\t', maxLength: 56})
}
function newProject() {
    if (showSaveDialog()) {
        $('input#ambientocclusion').prop('checked', true)
        if (display_mode === true) exitDisplaySettings()
        elements.length = 0;
        groups.length = 0
        textures.length = 0
        selected = []
        file_name = false;
        $('#parent_model').val('')
        updateCanvas()
        setUndo()
        outliner.$forceUpdate();
        texturelist.$forceUpdate();
        return true;
    } else {
        return false;
    }
}
function setTool(stool) {
    tool = stool
    if (tool == 'brush') {
        $('.aocc_ui').hide()
        $('.paint_ui').show()
    } else {
        $('.aocc_ui').show()
        $('.paint_ui').hide()
    }
    $('.tool.sel').removeClass('sel')
    $('.tool#tool_'+tool).addClass('sel')
}
function paint() {
    setUndo()
    var from = [
        elements[selected[0]].from[0]+0,
        elements[selected[0]].from[1]+0,
        elements[selected[0]].from[2]+0
    ]
    switch (selectedFace) {
        case 'north':
        from[2] -= canvas_grid;
        break;
        case 'east':
        from[0] += canvas_grid;
        break;
        case 'south':
        from[2] += canvas_grid;
        break;
        case 'west':
        from[0] -= canvas_grid;
        break;

        case 'up':
        from[1] += canvas_grid;
        break;
        case 'down':
        from[1] -= canvas_grid;
        break;
    }
    var template_name = $('#brush_template_name').val()
    var template_cube;
    elements.forEach(function(s) {
        if (s.name === template_name) {
            template_cube = s
        }
    })

    var base_cube = new cube(0,0,0,canvas_grid,canvas_grid,canvas_grid,'cube')
    if (template_cube != undefined) {
        $.extend(true, base_cube, template_cube)
    }
    base_cube.to = [from[0]+base_cube.size(0), from[1]+base_cube.size(1), from[2]+base_cube.size(2)]
    base_cube.from = from
    elements.push(base_cube)
    selected.length = 0
    selected.push(elements.length-1)
    updateCanvas()
}
function showDialog(dialog) {
    $('.dialog').hide(0)
    $('#blackout').fadeIn(200)
    $('.dialog#'+dialog).fadeIn(200)
    if (dialog === 'file_loader') {
        $('#file_upload').val('')
        $('#file_folder').val('')
        $('#web_import_btn').unbind()
    }
}
function hideDialog() {
    $('#blackout').fadeOut(200)
    $('.dialog').fadeOut(200)
}
function setSettingsTab(tab) {
    $('#settings .tab.open').removeClass('open')
    $('#settings .tab#'+tab).addClass('open')
    $('#settings .tab_content').addClass('hidden')
    $('#settings .tab_content#'+tab).removeClass('hidden')
}
function saveSettings() {
    textures.forEach(function(t) {
        t.material.transparent = settings.transparency.value
    })
}
//Transform
function rotateSelectedY(iteration) {
    setUndo()
    while (iteration > 0) {
        selected.forEach(function(s) {
            var cube = elements[s]
            var x = cube.from[2]
            var origin = [8, 8, 8]
            if (cube.rotation != undefined) {
                origin = cube.rotation.origin
            }
            groups.forEach(function(s) {
                if (s.isselected) {
                    origin = s.origin
                }
            })
            cube.from[2] = cube.to[2]
            cube.to[2] = x
            cube.from = rotateCoords(cube.from, 1, origin)
            cube.to = rotateCoords(cube.to, 1, origin)

            if (cube.rotation !== undefined) {
                if (cube.rotation.axis === 'x') {
                    cube.rotation.axis = 'z'
                } else if (cube.rotation.axis != 'y') {
                    cube.rotation.axis = 'x'
                    cube.rotation.angle *= (-1)
                }
            }

            if (cube.faces.up.rotation == undefined) {
                cube.faces.up.rotation = 90
            } else {
                cube.faces.up.rotation += 90
                if (cube.faces.up.rotation == 360) {
                    delete cube.faces.up.rotation
                }
            }
            if (cube.faces.down.rotation == undefined) {
                cube.faces.down.rotation = 270
            } else {
                cube.faces.down.rotation -= 90
                if (cube.faces.down.rotation == 0) {
                    delete cube.faces.down.rotation
                }
            }
            var temp = cube.faces.north
            cube.faces.north = cube.faces.west
            cube.faces.west = cube.faces.south
            cube.faces.south = cube.faces.east
            cube.faces.east = temp
        })
        iteration -= 1;
    }
    updateCanvas()
}
function rotateCoords(array, axis, origin) {
    if (origin === undefined) {
        origin = [8, 8, 8]
    }
    var a, b;
    array.forEach(function(s, i) {
        if (i == axis) {
            //
        } else {
            if (a == undefined) {
                a = s - origin[i]
                b = i
            } else {
                array[b] = s - origin[i]
                array[b] = origin[b] - array[b]
                array[i] = origin[i] + a;
            }
        }
    })
    return array
}
function mirror(axis) {
    setUndo()
    selected.forEach(function(s) {
        var obj = elements[s]
        var center = 8
        if (center === undefined && obj.rotation) {
            center = obj.rotation.origin[axis]
        }
        groups.forEach(function(s) {
            if (s.isselected) {
                center = s.origin[axis]
            }
        })
        if (obj.rotation) {
            if (obj.rotation.axis !== axisIndex(axis)) {
                obj.rotation.angle *= -1
            }
        }
        var from = obj.from[axis]
        obj.from[axis] = center - (obj.to[axis] - center)
        obj.to[axis] = center - (from - center)
        var switchFaces;
        switch(axis) {
            case 0: switchFaces = ['west', 'east']; break;
            case 1: switchFaces = ['up', 'down']; break;
            case 2: switchFaces = ['south', 'north']; break;
        }
        var x = obj.faces[switchFaces[0]]
        obj.faces[switchFaces[0]] = obj.faces[switchFaces[1]]
        obj.faces[switchFaces[1]] = x
    })
    updateCanvas()
}
function openScaleAll() {
    selected.forEach(function(s) {
        var obj = elements[s]
        obj.display.before = {from: [], to: [], origin: [8, 8, 8]}
        obj.display.before.from[0] = obj.from[0]
        obj.display.before.from[1] = obj.from[1]
        obj.display.before.from[2] = obj.from[2]

        obj.display.before.to[0] = obj.to[0]
        obj.display.before.to[1] = obj.to[1]
        obj.display.before.to[2] = obj.to[2]

        if (obj.rotation !== undefined ) {
            obj.display.before.origin[0] = obj.rotation.origin[0]
            obj.display.before.origin[1] = obj.rotation.origin[1]
            obj.display.before.origin[2] = obj.rotation.origin[2]
        }
    })
    showDialog('scaling')
}
function scaleAll(save, size) {
    if (save === true) {
        hideDialog()
    }
    if (size === undefined) {
        size = $('#model_scale_range').val()
    }
    origin = [8, 8, 8]
    groups.forEach(function(s) {
        if (s.isselected) {
            origin = s.origin
        }
    })
    selected.forEach(function(s) {
        var obj = elements[s]
        obj.display.autouv = false;
        origin.forEach(function(ogn, i) {

            obj.from[i] = (obj.display.before.from[i] - ogn) * size
            obj.from[i] = limitCoord(obj.from[i] + ogn)

            obj.to[i] = (obj.display.before.to[i] - ogn) * size
            obj.to[i] = limitCoord(obj.to[i] + ogn)

            if (obj.rotation !== undefined) {
                obj.rotation.origin[i] = (obj.display.before.origin[i] - ogn) * size
                obj.rotation.origin[i] = limitCoord(obj.rotation.origin[i] + ogn)
            }
        })
        if (save === true) {
            delete obj.display.before
        }
    })
    updateCanvas()
}
function modelScaleSync() {
    var size = $('#model_scale_range').val()
    $('#model_scale_label').text(size)
    scaleAll(false, size)
}
function cancelScaleAll() {
    selected.forEach(function(s) {
        obj.from[0] = obj.display.before.from[0]
        obj.from[1] = obj.display.before.from[1]
        obj.from[2] = obj.display.before.from[2]

        obj.to[0] = obj.display.before.to[0]
        obj.to[1] = obj.display.before.to[1]
        obj.to[2] = obj.display.before.to[2]

        if (obj.rotation !== undefined ) {
            obj.rotation.origin[0] = obj.display.before.origin[0]
            obj.rotation.origin[1] = obj.display.before.origin[1]
            obj.rotation.origin[2] = obj.display.before.origin[2]
        }
        delete obj.display.before
    })
    updateCanvas()
    hideDialog()
}

//Groups
function group(content) {  //Constructor
    this.name = 'group'
    this.content = []
    if (content) this.content = content
    this.isselected = true;
    this.origin = [8, 8, 8]
    this.count = this.content.length
    this.update = function() {
        this.content.forEach(function(s, i) {
            if (elements.indexOf(s) === -1) {
                delete s;
            }
        })
        this.count = this.content.length
    }
}
function addGroup() {
    var selectedCubes = []
    selected.forEach(function(s) {
        selectedCubes.push(elements[s])
    })
    groups.push(new group(selectedCubes))
    Vue.nextTick(function() {
        $('.group.selected').find('input.cube_name').select()
        updateSelection()
    })
}