var display = {}
var ground_animation = false;
var ground_timer = 0
var player_model = getPlayerModel()
var gui_model = getGuiModel()
var ground_model = getGroundModel()
var frame_model = getFrameModel()
var screen_model = getScreenModel()
var slot;
var display_clipboard;

function enterDisplaySettings() {		//Enterung Display Setting Mode, changes the scene etc
	selected = []
	display_mode = true;
	updateSelection()
	$('.m_edit').hide()
	$('.m_disp').show()
	$('#display_bar input#thirdperson_righthand').prop("checked", true)
	loadDispThirdRight()
	camera.position.set(-80, 40, -30)
}
function exitDisplaySettings() {		//Enterung Display Setting Mode, changes the scene etc
    resetDisplayBase()
    setDisplayArea(0,0,0, 0,0,0, 1,1,1)

    setTimeout(function() {
		display_mode = false;
		$('.m_disp').hide()
		$('.m_edit').show()
	    controls.target.set(0,-3,0)
	    camera.position.set(-20, 20, -20)
		controls.enabled = true
		camera.setFocalLength(45)
		display_scene.remove(player_model)
		display_scene.remove(gui_model)
		$('.ui#uv').hide(0)
	}, 20)
}
function axisIndex(index) {
	if (typeof index === 'number') {
		if (index === 0) return 'x';
		if (index === 1) return 'y';
		if (index === 2) return 'z';
	} else {
		if (index === 'x') return 0;
		if (index === 'y') return 1;
		if (index === 'z') return 2;
	}
}
function resetDisplayBase() {
	display_base.rotation['x'] = Math.PI / (180 / 0.1);
	display_base.rotation['y'] = Math.PI / (180 / 0.1);
	display_base.rotation['z'] = Math.PI / (180 / 0.1);

	display_base.position['x'] = 0;
	display_base.position['y'] = 0;
	display_base.position['z'] = 0;

	display_base.scale['x'] = 1;
	display_base.scale['y'] = 1;
	display_base.scale['z'] = 1;
}


function syncDispInput(obj, sender, axis) {//Syncs Range and Input, calls the change functions
	var val = $(obj).val()
	var raw_val;
	if (typeof val === 'string' || val instanceof String) {
		val = parseFloat(val.replace(/[^-.0-9]/g, ""))
	}
	if (isNaN(val)) val = 0

	if (sender === 'rotation') {
		if (val > 180) val = 180
		if (val < -180) val = -180
		$(obj).siblings('input').val(val)
		dispRotate(val, axis)
		return;
	} else if (sender === 'translation') {
		if (val > 80) val = 80
		if (val < -80) val = -80
		$(obj).siblings('input').val(val);
		dispTranslate(val, axis)
		return;
	} else if (sender === 'scaleRange') {
		//From Range to Real
		raw_val = val
		if (val >= 0) {
			val = (val*(3/4))+1
			if (val >=4) val = 4
		} else {
			val = (val+4)/4
		}
	} else if (sender === 'scale') {
		//From Input(Real) to Range
		if (display[slot].scale == undefined) {
			$(obj).parent().find('input.scaleRange').val(0)
			return;
		}
		if (val >= 1) {
			raw_val = (val-1)*(4/3)
		} else {
			raw_val =(val*4)-4
		}
	}
	$(obj).parent().find('input.scale').val(val)
	$(obj).parent().find('input.scaleRange').val(raw_val)
	dispScale(val, axis)		
}
function dispRotate(val, axis) {		//Change the actual thing
	if (display[slot].rotation == undefined) {
		display[slot].rotation = [0,0,0]
	}
	display[slot].rotation[axisIndex(axis)] = val
	if (slot === 'thirdperson_lefthand' && axis === 'y') val *= (-1)
	if (slot === 'firstperson_lefthand' && axis === 'y') val *= (-1)
	if (slot === 'thirdperson_lefthand' && axis === 'z') val *= (-1)
	if (slot === 'firstperson_lefthand' && axis === 'z') val *= (-1)
	display_base.rotation[axis] = Math.PI / (180 / val);
}
function dispTranslate(val, axis) {		//Change the actual thing
	if (display[slot].translation == undefined) {
		display[slot].translation = [0,0,0]
	}
	display[slot].translation[axisIndex(axis)] = val
	if (slot === 'thirdperson_lefthand' && axis === 'x') val *= (-1)
	if (slot === 'firstperson_lefthand' && axis === 'x') val *= (-1)
	display_base.position[axis] = val
}
function dispScale(val, axis) {			//Change the actual thing
	if (display[slot].scale == undefined) {
		display[slot].scale = [0,0,0]
	}
	display[slot].scale[axisIndex(axis)] = val
	if (val == 0) val = 0.01
	display_base.scale[axis] = val
}

function resetDisplaySettings(key) {
	delete display[slot][key]
	$('input#'+key+'_x').val(0)
	$('input#'+key+'_y').val(0)
	$('input#'+key+'_z').val(0)
	if (key == 'rotation') {
		display_base.rotation.x = Math.PI / (180 / 0);
		display_base.rotation.y = Math.PI / (180 / 0);
		display_base.rotation.z = Math.PI / (180 / 0);
	} else if (key == 'translation') {
		display_base.position.x = 0
		display_base.position.y = 0
		display_base.position.z = 0
	} else if (key == 'scale') {
		$('input#scale_x.scale').val(1)
		$('input#scale_y.scale').val(1)
		$('input#scale_z.scale').val(1)
		display_base.scale.x = 1
		display_base.scale.y = 1
		display_base.scale.z = 1
	}
}

function applyDisplayPreset(preset) {
	if (preset == undefined) return;
	if (preset.areas[slot] == undefined) return;
	$.extend(true, display[slot] = preset.areas[slot])
	loadSlot(slot)
}
function openAddPreset() {
	showDialog('create_preset')
}
function createPreset() {
	var name = $('input#preset_name').val()
	if (name == '') {
		$('input#preset_name').val('Please Enter A Name')
		return;
	} else {
		$('input#preset_name').val('new preset')
	}
	display_presets.push({name: name, areas: {}})
	var preset = display_presets[display_presets.length-1]

	if ($('#thirdperson_righthand_save').is(':checked')) {
		preset.areas.thirdperson_righthand = display.thirdperson_righthand
	}
	if ($('#thirdperson_lefthand_save').is(':checked')) {
		preset.areas.thirdperson_lefthand = display.thirdperson_lefthand
	}

	if ($('#firstperson_righthand_save').is(':checked')) {
		preset.areas.firstperson_righthand = display.firstperson_righthand
	}
	if ($('#firstperson_lefthand_save').is(':checked')) {
		preset.areas.firstperson_lefthand = display.firstperson_lefthand
	}

	if ($('#ground_save').is(':checked')) {
		preset.areas.ground = display.ground
	}
	if ($('#gui_save').is(':checked')) {
		preset.areas.gui = display.gui
	}
	if ($('#head_save').is(':checked')) {
		preset.areas.head = display.head
	}
	if ($('#fixed_save').is(':checked')) {
		preset.areas.fixed = display.fixed
	}
	hideDialog()
	localStorage.setItem('display_presets', JSON.stringify(display_presets))
}



function setDisplayArea(x, y, z, rx, ry, rz, sx, sy, sz) {//Sets the Work Area to the given Space
	display_area.rotation['x'] = Math.PI / (180 / rx);
	display_area.rotation['y'] = Math.PI / (180 / ry);
	display_area.rotation['z'] = Math.PI / (180 / rz);

	display_area.position['x'] = x;
	display_area.position['y'] = y;
	display_area.position['z'] = z;

	display_area.scale['x'] = sx;
	display_area.scale['y'] = sy;
	display_area.scale['z'] = sz;
}


function buildDisplayReference(things, texture, name) {
	var model = new THREE.Object3D();
	var img = new Image();
    img.src = texture;
    var tex = new THREE.Texture(img);
    img.tex = tex;
    img.tex.magFilter = THREE.NearestFilter;
    img.tex.minFilter = THREE.LinearMipMapLinearFilter;
    var thisTexture = this;
    img.onload = function() {
        this.tex.needsUpdate = true;
        //thisTexture.res = img.naturalWidth;
    }
    img.crossOrigin = '';
    var mat = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex, transparent: true});


	things.forEach(function(s) {
		var mesh = new THREE.Mesh(new THREE.CubeGeometry(s.size[0], s.size[1], s.size[2]), mat )
		mesh.position.set(s.origin[0], s.origin[1], s.origin[2])
		mesh.geometry.translate(-s.origin[0], -s.origin[1], -s.origin[2])
		mesh.geometry.translate(s.pos[0], s.pos[1], s.pos[2])
		if (s.angle) {
			mesh.rotation['z'] = Math.PI / (180 /s.angle)
		}

	    for (var face in s) {
	        if (s.hasOwnProperty(face) && s[face].uv !== undefined) {
		        var fIndex = 0;
		        switch(face) {
		            case 'north':   fIndex = 10;   break;
		            case 'east':    fIndex = 0;    break;
		            case 'south':   fIndex = 8;    break;
		            case 'west':    fIndex = 2;    break;
		            case 'up':      fIndex = 4;    break;
		            case 'down':    fIndex = 6;    break;
		        }
		        mesh.geometry.faceVertexUvs[0][fIndex] = [ getUVArray(s[face])[0], getUVArray(s[face])[1], getUVArray(s[face])[3] ];
		        mesh.geometry.faceVertexUvs[0][fIndex+1] = [ getUVArray(s[face])[1], getUVArray(s[face])[2], getUVArray(s[face])[3] ];
		    }
	    }
	    mesh.geometry.elementsNeedUpdate = true;

		model.add(mesh);
		model.name = name;
	})
	return model;
}
function getPlayerModel() {	//Generates the Player Model
	var things = [
	{"size": [4, 12, 4], "pos": [0, 12, -6], "origin": [0, 16, 0], "angle": -20, "north":{"uv":[10,5,11,8]},"east":{"uv":[13,5,14,8]},"south":{"uv":[12,5,13,8]},"west":{"uv":[11,5,12,8]},"up":{"uv":[11,4,12,5]},"down":{"uv":[12,4,13,5]}},	//Right Arm
	{"size": [4, 12, 4], "pos": [0, 12, 6], "origin": [0, 16, 0], "angle": -20, "north":{"uv":[8,13,9,16]},"east":{"uv":[8,13,9,16]},"south":{"uv":[10,13,11,16]},"west":{"uv":[9,13,10,16]},"up":{"uv":[9,12,10,13]},"down":{"uv":[10,12,11,13]}},	

	{"size": [4, 12, 4], "pos": [0, 0, -2], "origin": [0, 0, 0], "north":{"uv":[0,5,1,8]},"east":{"uv":[3,5,4,8]},"south":{"uv":[2,5,3,8]},"west":{"uv":[1,5,2,8]},"up":{"uv":[1,3,2,4]},"down":{"uv":[6,12,7,13]}},//R Leg
	{"size": [4, 12, 4], "pos": [0, 0, 2], "origin": [0, 0, 0], "north":{"uv":[5,5,6,8]},"east":{"uv":[1,5,2,8]},"south":{"uv":[1,5,2,8]},"west":{"uv":[1,5,2,8]},"up":{"uv":[5,12,6,13]},"down":{"uv":[6,12,7,13]}},// L Leg

	{"size": [8, 8, 8], "pos": [0, 22, 0], "origin": [0, 0, 0], "north":{"uv":[0,2,2,4]},"east":{"uv":[6,2,8,4]},"south":{"uv":[4,2,6,4]},"west":{"uv":[2,2,4,4]},"up":{"uv":[2,0,4,2]},"down":{"uv":[4,0,6,2]}},//Head
	{"size": [4, 12, 8], "pos": [0, 12, 0], "origin": [0, 0, 0], "north":{"uv":[4,5,5,8]},"east":{"uv":[5,5,7,8]},"south":{"uv":[9,5,10,8]},"west":{"uv":[5,5,7,8]},"up":{"uv":[5,4,7,5]},"down":{"uv":[7,4,9,5]}}//Body
	]
	var skin;
	if (true) {
		try {
			skin = getSkinUrl();
		} catch (err) {
			skin = 'player_skin.png';
		}
	} else {
		skin = 'player_skin.png';
	}
	return buildDisplayReference(things, skin, 'player_skin');
}
function getGuiModel() {	//Generates the GUI Model
	var things = [
		{"size": [0.1, 26, 26], "pos": [0, 0, 0], "origin": [0, 0, 0], "north":{"uv":[0,0,0,0]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}}
	]
	return buildDisplayReference(things, 'inventory.png', 'gui_model')
}
function getGroundModel() {	//Generates the Ground Block Model
	var things = [
		{"size": [16,16,16], "pos": [0, 0, 0], "origin": [0, 0, 0], "north":{"uv":[0,0,16,16]},"east":{"uv":[0,0,16,16]},"south":{"uv":[0,0,16,16]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,16,16]},"down":{"uv":[0,0,16,16]}},	//Right Arm
	]
	return buildDisplayReference(things, 'missing.png', 'gui_model')
}
function getFrameModel() {	//Generates the Ground Block Model
	var things = [
		{"size": [10,10,0.5], "pos": [0, 0, -8.25], "origin": [0, 0, 0], "north":{"uv":[3,3,13,13]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,0,0]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}},

		{"size": [1,12,1], "pos": [5.5, 0, -8.5], "origin": [0, 0, 0], "north":{"uv":[2,2,3,14]},"east":{"uv":[2,2,3,14]},"south":{"uv":[2,2,3,14]},"west":{"uv":[2,2,3,14]},"up":{"uv":[2,2,3,3]},"down":{"uv":[2,2,3,3]}},
		{"size": [1,12,1], "pos": [-5.5, 0, -8.5], "origin": [0, 0, 0], "north":{"uv":[2,2,3,14]},"east":{"uv":[2,2,3,14]},"south":{"uv":[2,2,3,14]},"west":{"uv":[2,2,3,14]},"up":{"uv":[2,2,3,3]},"down":{"uv":[2,2,3,3]}},

		{"size": [10,1,1], "pos": [0, 5.5, -8.5], "origin": [0, 0, 0], "north":{"uv":[3,2,13,3]},"east":{"uv":[3,2,13,3]},"south":{"uv":[3,2,13,3]},"west":{"uv":[3,2,13,3]},"up":{"uv":[3,2,13,3]},"down":{"uv":[3,2,13,3]}},
		{"size": [10,1,1], "pos": [0, -5.5, -8.5], "origin": [0, 0, 0], "north":{"uv":[3,13,13,14]},"east":{"uv":[3,13,13,14]},"south":{"uv":[3,13,13,14]},"west":{"uv":[3,13,13,14]},"up":{"uv":[3,13,13,14]},"down":{"uv":[3,13,13,14]}},
	]
	return buildDisplayReference(things, 'item_frame.png', 'ground_model')
}
function getScreenModel() {	//Generates the Ground Block Model
	var things = [
		{"size": [0.1, 8, 8], "pos": [-30, 6, 0], "origin": [0, 0, 0], "north":{"uv":[0,0,0,0]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}},
		{"size": [0.1, 8, 8], "pos": [-30, -6.05, 0], "origin": [0, 0, 0], "north":{"uv":[0,0,0,0]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}},
		{"size": [0.1, 8, 8], "pos": [-30, 0, 7.6], "origin": [0, 0, 0], "north":{"uv":[0,0,0,0]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}},
		{"size": [0.1, 8, 8], "pos": [-30, 0, -7.6], "origin": [0, 0, 0], "north":{"uv":[0,0,0,0]},"east":{"uv":[0,0,0,0]},"south":{"uv":[0,0,0,0]},"west":{"uv":[0,0,16,16]},"up":{"uv":[0,0,0,0]},"down":{"uv":[0,0,0,0]}}
	]
	return buildDisplayReference(things, 'monitor.png', 'screen_model')
}

function groundAnimation() {
	display_area.rotation.y += 0.0075
	ground_timer += 1
	if (ground_timer < 200) display_area.position.y += 0.0165
	if (ground_timer > 200) display_area.position.y -= 0.0165
	if (ground_timer === 400) ground_timer = 0;
}

function getDisplayNumber(key, mode, axis) {
	var def = 0
	if (mode == 'scale') {
		def = 1
	}
	if (display[key] == undefined) {
		return def;
	}
	if (display[key][mode] == undefined) {
		return def;
	}
	if (display[key][mode][axis] != undefined) {
		return display[key][mode][axis];
	} else {
		return def;
	}
}
function loadDisp(key, skin) {	//Loads The Menu and slider values, common for all Radio Buttons
	slot = key
	resetDisplayBase()

	controls.enabled = true;
	ground_animation = false;
	$('input#translation_z').prop('disabled', false)
	$('#donation_hint').hide()
	camera.setFocalLength(45)
	display_scene.remove(player_model)
	display_scene.remove(gui_model)
	display_scene.remove(ground_model)
	display_scene.remove(frame_model)
	display_scene.remove(screen_model)

	if (display[key] == undefined) {
		display[key] = {}
	}
	$('input#rotation_x').val(getDisplayNumber(key, 'rotation', 0))
	$('input#rotation_y').val(getDisplayNumber(key, 'rotation', 1))
	$('input#rotation_z').val(getDisplayNumber(key, 'rotation', 2))

	$('input#translation_x').val(getDisplayNumber(key, 'translation', 0))
	$('input#translation_y').val(getDisplayNumber(key, 'translation', 1))
	$('input#translation_z').val(getDisplayNumber(key, 'translation', 2))

	$('input#scale_x').val(getDisplayNumber(key, 'scale', 0))
	$('input#scale_y').val(getDisplayNumber(key, 'scale', 1))
	$('input#scale_z').val(getDisplayNumber(key, 'scale', 2))
	syncDispInput($('input#scale_x'), 'scale')
	syncDispInput($('input#scale_y'), 'scale')
	syncDispInput($('input#scale_z'), 'scale')

	display_base.rotation['x'] = Math.PI / (180 / getDisplayNumber(key, 'rotation', 0));
	display_base.rotation['y'] = Math.PI / (180 / getDisplayNumber(key, 'rotation', 1));
	display_base.rotation['z'] = Math.PI / (180 / getDisplayNumber(key, 'rotation', 2));

	display_base.position['x'] = getDisplayNumber(key, 'translation', 0);
	display_base.position['y'] = getDisplayNumber(key, 'translation', 1);
	display_base.position['z'] = getDisplayNumber(key, 'translation', 2);

	display_base.scale['x'] = getDisplayNumber(key, 'scale', 0);
	display_base.scale['y'] = getDisplayNumber(key, 'scale', 1);
	display_base.scale['z'] = getDisplayNumber(key, 'scale', 2);

	if (skin === true) {
		display_scene.add(player_model)
		$('#donation_hint').show()
	}
}
function loadDispThirdRight() {	//Loader
	loadDisp('thirdperson_righthand', true)
	setDisplayArea(-5, 8, -6, -90, 22.5, 90, 1, 1, 1)
}
function loadDispThirdLeft() {	//Loader
	loadDisp('thirdperson_lefthand', true)
	display_base.position['x'] = -getDisplayNumber('thirdperson_lefthand', 'translation', 0)
	display_base.rotation['y'] = Math.PI / (180 / -getDisplayNumber('thirdperson_lefthand', 'rotation', 1))
	display_base.rotation['z'] = Math.PI / (180 / -getDisplayNumber('thirdperson_lefthand', 'rotation', 2))
	setDisplayArea(-5, 8, 6, -90, 22.5, 90, 1, 1, 1)
}
function loadDispFirstRight() {	//Loader
	loadDisp('firstperson_righthand')
	display_scene.add(screen_model)
	setDisplayArea(-20.5, -6.4, 7, 0, 270, 0, 0.75,0.75,0.75)
	camera.setFocalLength(22)
	camera.position.set(-35, 0, 0)
	controls.target.set(0,0,0)
	$('input#translation_z').prop('disabled', true)
	controls.enabled = false
}
function loadDispFirstLeft() {	//Loader
	loadDisp('firstperson_lefthand')
	display_base.position['x'] = -getDisplayNumber('firstperson_lefthand', 'translation', 0)
	display_base.rotation['y'] = Math.PI / (180 / -getDisplayNumber('firstperson_lefthand', 'rotation', 1))
	display_base.rotation['z'] = Math.PI / (180 / -getDisplayNumber('firstperson_lefthand', 'rotation', 2))
	display_scene.add(screen_model)
	setDisplayArea(-20.5, -6.4, -7, 0, 270, 0, 0.75,0.75,0.75)
	camera.setFocalLength(22)
	camera.position.set(-35, 0, 0)
	controls.target.set(0,0,0)
	$('input#translation_z').prop('disabled', true)
	controls.enabled = false
}
function loadDispHead() {		//Loader
	loadDisp('head', true)
	setDisplayArea(0, 22, 0, 0, 90, 0, 0.6, 0.6, 0.6)
}
function loadDispGUI() {		//Loader
	loadDisp('gui')
	display_scene.add(gui_model)
	setDisplayArea(-0.2, 0, 0, 0, 270, 0, 0.4, 0.4, 0.005)
	camera.position.set(-240, 0, 0)
	controls.target.set(0,0,0)
	camera.setFocalLength(120)
	$('input#translation_z').prop('disabled', true)
	controls.enabled = false
}
function loadDispGround() {		//Loader
	loadDisp('ground')
	display_scene.add(ground_model)
	setDisplayArea(0, 12, 0, 0, 0, 0, 1, 1, 1)
	ground_animation = true;
	ground_timer = 0
}
function loadDispFixed() {		//Loader
	loadDisp('fixed')
	display_scene.add(ground_model)
	display_scene.add(frame_model)
	setDisplayArea(0, 0, -8.5, 0, 0, 0, 0.5, 0.5, 0.5)
}
function loadSlot(slot) {
		switch (slot) {
		case 'thirdperson_righthand':
		loadDispThirdRight()
		break;
		case 'thirdperson_lefthand':
		loadDispThirdLeft()
		break;
		case 'firstperson_righthand':
		loadDispFirstRight()
		break;
		case 'firstperson_lefthand':
		loadDispFirstLeft()
		break;
		case 'head':
		loadDispHead()
		break;
		case 'gui':
		loadDispGUI()
		break;
		case 'ground':
		loadDispGround()
		break;
		case 'fixed':
		loadDispFixed()
		break;
	}
}

function copyDisplaySlot() {
	var base_setting = {rotation: [0, 0, 0], translation: [0, 0, 0], scale: [1, 1, 1]}
	$.extend(true, base_setting, display[slot])
	display_clipboard = base_setting
}
function pasteDisplaySlot() {
	if (display_clipboard == undefined) return;
	$.extend(true, display[slot] = display_clipboard)
	loadSlot(slot)
}




