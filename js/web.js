(function() {
	$.getScript("js/file_saver.js");
	$('.local_only').remove()
})()

$('.open-in-browser').click((event) => {
       event.preventDefault();
       window.open(event.target.href, '_blank');
});

//Loader Open
function openTexture() {
	showDialog('file_loader')
    $('#file_upload').attr('accept', '.png')
	$('#web_import_btn').click(readTexture)
}
function openFile() {
	showDialog('file_loader')
    $('#file_upload').attr('accept', '.json')
	$('#web_import_btn').click(readFile)
}
function changeTexturePath(texture) {
	showDialog('file_loader')
    $('#file_upload').attr('accept', '.png')
	$('#web_import_btn').click(function() {reopenTexture(texture)})
}


//Loader Read
function readTexture() {
	hideDialog()
	var file = $('#file_upload').get(0).files[0]
	var reader = new FileReader()
	reader.onloadend = function() {
		var path = reader.result

        textures.push(new texture(path))
        if (textures.length == 1) {
            textures[0].particle = true
        }
        textures.forEach(function(s) {
            if (s === textures[textures.length-1]) {
                s.selected = true;
            } else {
                s.selected = false;
            }
        })
        var name = $('#file_name').val()
        if (name !== undefined) {
        	textures[textures.length-1].name = name
        } else {
        	textures[textures.length-1].name = 'Texture'
        }
        var folder = $('#file_name').val()
        if (folder !== undefined) {
        	textures[textures.length-1].folder = folder
        } else {
        	textures[textures.length-1].folder = 'blocks'
        }
        loadTextureDraggable()
	}
	if (file) {
		reader.readAsDataURL(file)
	} else {

	}
}
function readFile() {
	hideDialog()
	var file = $('#file_upload').get(0).files[0]
	var reader = new FileReader()
	reader.onloadend = function() {
		
		loadFile(reader.result, 'foo')
	}
	if (file) {
		reader.readAsText(file)
	} else {

	}
}
function reopenTexture(texture) {
	hideDialog()
	var file = $('#file_upload').get(0).files[0]
	var reader = new FileReader()
	reader.onloadend = function() {

        texture.path = reader.result
        texture.iconpath = reader.result
        var img = new Image()
        try {
            img.src = reader.result
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
	}
	if (file) {
		reader.readAsDataURL(file)
	} else {

	}
}

//Saver
function saveFileAs() {
	saveFile()
	//
}
function saveFile() {
	var data = buildBlockModel()
	var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
	saveAs(blob, 'model.json')
}

//Misc
window.onbeforeunload = function() {
	if (project_saved === false) {
    	return true;
	}
}
function showSaveDialog(close) {
    if (project_saved === false && elements.length > 0) {
        var answer = confirm('Your current work will be lost. Are you sure?')
        if (answer == true) {
            if (close) {
                //preventClosing = false
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