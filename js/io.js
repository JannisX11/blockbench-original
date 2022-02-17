var app = require('electron').remote;
var dialog = app.dialog;
var fs = require('fs')
var preventClosing = true;

const shell = require('electron').shell;
$('.open-in-browser').click((event) => {
       event.preventDefault();
       shell.openExternal(event.target.href);
});

function saveFileAs() {
    dialog.showSaveDialog({filters: [{name: 'JSON Model', extensions: ['json']},{name: 'JSON Entity Model', extensions: ['txt']},{name: 'Alias Wavefront', extensions: ['obj']}]}, function (fileName) {
        if (fileName === undefined) {
            return;
        }
        var arr = fileName.split('.')
        if (arr[arr.length-1].toUpperCase() == 'JSON') {
            file_name = fileName;
            saveFile()
        } else if (arr[arr.length-1].toUpperCase() == 'OBJ') {
            saveObj(fileName)
        } else if (arr[arr.length-1].toUpperCase() == 'TXT') {
            saveEntityFile(fileName)
        }
    })
}

function saveFile() {
    if (file_name) {
        var content = buildBlockModel(true)
        project_saved = true;
        fs.writeFile(file_name, content, function (err) {
            if (err) {
                console.log('Error Saving File: '+err)
            }
        })
    } else {
        saveFileAs()
    }
}

function saveEntityFile(path) {
    var content = buildEntityModel()
    fs.writeFile(path, content, function (err) {
        if (err) {
            console.log('Error Saving Entity Model: '+err)
        }
    })
}

function saveObj(path) {
    scene.remove(three_grid)
    var exporter = new THREE.OBJExporter();
    var content = exporter.parse( scene );
    scene.add(three_grid)
    fs.writeFile(path, content, function (err) {
        if (err) {
            console.log('Error Saving Obj: '+err)
        }
    })
}

function openFile() {
    dialog.showOpenDialog({filters: [{name: 'Model', extensions: ['json']}]}, function (fileNames) {
        if (fileNames !== undefined) {
            readFile(fileNames[0])
        }
    })
}

function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if (err) {
            console.log(err)
            return;
        }
        loadFile(data, filepath)
    })
}

function openTexture() {
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], filters: [{name: 'PNG Texture', extensions: ['png']}]}, function (fileNames) {
        if (fileNames !== undefined) {
            fileNames.forEach(function(path) {
                fs.readFile(path, function (err) {
                    if (err) {
                        console.log(err)
                    }
                    textures.push(new texture(path))
                    if (textures.length == 1) {
                        textures[0].particle = true
                    }
                })
            })
            textures.forEach(function(s) {
                if (s === textures[textures.length-1]) {
                    s.selected = true;
                } else {
                    s.selected = false;
                }
            })
            loadTextureDraggable()
        }
    })
}

function changeTexturePath(texture) {
    dialog.showOpenDialog({filters: [{name: 'PNG Texture', extensions: ['png']}]}, function (fileNames) {
        if (fileNames !== undefined) {
            fs.readFile(fileNames[0], function (err) {
                if (err) {
                    console.log(err)
                }
                texture.path = fileNames[0]
                texture.name = texture.path.split('\\').slice(-1)[0]
                var img = new Image()
                try {
                    img.src = fileNames[0]
                } catch(err) {
                    img.src = 'missing.png'
                }
                var tex = new THREE.Texture(img)
                img.tex = tex;
                img.tex.magFilter = THREE.NearestFilter
                img.tex.minFilter = THREE.LinearMipMapLinearFilter
                var thisTexture = texture;
                img.onload = function() {
                    this.tex.needsUpdate = true;
                    thisTexture.res = img.naturalWidth;
                }
                texture.material = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex, transparent: true});
                updateCanvas()
            })
        }
    })
}

function dropTexture(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

window.onbeforeunload = function() {
    setTimeout(function() {
        showSaveDialog(true)
    }, 2)
    if (preventClosing === true) {
        return true;
    }
}
document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
}
document.body.ondrop = (ev) => {
    if (ev.dataTransfer == undefined) {
        return; 
    }
    if (ev.dataTransfer.files[0] != undefined) {
        ev.preventDefault()
        if (ev.dataTransfer.files[0].path.substr(-4).toUpperCase() == 'JSON') {
            readFile(ev.dataTransfer.files[0].path)
        } else if (ev.dataTransfer.files[0].path.substr(-3).toUpperCase() == 'PNG') {

            var fileArray = ev.dataTransfer.files;
            var len = fileArray.length;

            for (var i = 0; i < len; i++) {
                textures.push(new texture(fileArray[i].path))
                if (textures.length == 1) {
                    textures[0].particle = true
                }
            }


            textures.forEach(function(s) {
                if (s === textures[textures.length-1]) {
                    s.selected = true;
                } else {
                    s.selected = false;
                }
            })
            loadTextureDraggable()
        }
    }
}

function showSaveDialog(close) {
    if (project_saved === false && elements.length > 0) {
        var answer = confirm('Your current work will be lost. Are you sure?')
        if (answer == true) {
            if (close) {
                preventClosing = false
                app.getCurrentWindow().close()
            }
            return true;
        } else {
            return false;
        }
    } else {
        if (close) {
            preventClosing = false
            app.getCurrentWindow().close()
        }
        return true;
    }
}
