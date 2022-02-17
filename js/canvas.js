var camera, controls, scene, renderer, canvas1, loader, mouse, raycaster, c_height, c_width, selectedFace, transform, emptyMaterial, outlines;
var display_scene, display_area, display_base;
var display_mode = false
var cubes = new THREE.Group();
var objects, selected = []
var doRender = false;
var three_grid = new THREE.Object3D();
var rot_origin = new THREE.Object3D();


function init() {
    camera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 1000)
    camera.position.set(-20, 20, -20)
    
    controls = new THREE.OrbitControls(camera, canvas1);
    controls.minDistance = 10;
    controls.maxDistance = 150;
    controls.target.set(0,-3,0)
    if (keybinds.canvas_rotate.code <= 3) {
        controls.mouseButtons.ORBIT = keybinds.canvas_rotate.code-1
    }
    if (keybinds.canvas_drag.code <= 3) {
        controls.mouseButtons.PAN = (keybinds.canvas_drag.code-1)
    }
    controls.mouseButtons.ZOOM = undefined;

    
    scene = new THREE.Scene();
    display_scene = new THREE.Scene();
    display_area = new THREE.Object3D();
    display_base = new THREE.Object3D();
    display_scene.add(display_area)
    display_area.add(display_base)
    display_base.add(scene)
    scene.position['x'] = -8
    scene.position['y'] = -8
    scene.position['z'] = -8

    loader = new THREE.TextureLoader()
    
    renderer = new THREE.WebGLRenderer( { canvas: canvas1 } );
    renderer.setClearColor( 0x17191d )
    renderer.setSize(500, 400);

    outlines = new THREE.Object3D();
    scene.add(outlines)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2();
    canvas1.addEventListener('mousedown', onDocumentMouseDown, false)
    canvas1.addEventListener('touchstart', onDocumentTouchStart, false)
    
    //emptyMaterial

    var img = new Image()
    img.src = 'missing.png'
    var tex = new THREE.Texture(img)
    img.tex = tex;
    img.tex.magFilter = THREE.NearestFilter
    img.tex.minFilter = THREE.LinearMipMapLinearFilter
    img.onload = function() {
        this.tex.needsUpdate = true;
    }
    emptyMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex});
    
    setScreenRatio()
    buildGrid()
}

$(window).resize(function () {
    setScreenRatio()
})

function setScreenRatio() {
    c_height = $('#preview').height()-5;
    c_width = $('#preview').width();
    camera.aspect = c_width / c_height
    camera.updateProjectionMatrix();
    renderer.setSize(c_width, c_height);
}

function buildGrid() {
    var size = 8, step = 1;
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({color: '#404551'});
    
     for ( var i = - size; i <= size; i += step) {
         geometry.vertices.push(new THREE.Vector3( -size, 0, i))
         geometry.vertices.push(new THREE.Vector3( size, 0, i))
         geometry.vertices.push(new THREE.Vector3(i, 0, -size))
         geometry.vertices.push(new THREE.Vector3(i, 0, size))
     }
    var line = new THREE.Line( geometry, material, THREE.LinePieces);
    line.position.set(8,0,8)
    three_grid.add(line)

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({color: '#EE4040'});
    geometry.vertices.push(new THREE.Vector3( 0, 0, -0.005))
    geometry.vertices.push(new THREE.Vector3( 16, 0, -0.005))
    x_axis = new THREE.Line( geometry, material, THREE.LinePieces);
    three_grid.add(x_axis)

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({color: '#40EE40'});
    geometry.vertices.push(new THREE.Vector3( -0.005, 0, 0))
    geometry.vertices.push(new THREE.Vector3( -0.005, 0, 16))
    z_axis = new THREE.Line( geometry, material, THREE.LinePieces);
    three_grid.add(z_axis)
    scene.add(three_grid)

    //Origin

    var helper1 = new THREE.AxisHelper(2)
    var helper2 = new THREE.AxisHelper(2)
    helper1.rotation.x = Math.PI / 2

    helper2.rotation.x = Math.PI / -2
    helper2.rotation.y = Math.PI / 1
    helper2.scale.z = -1

    rot_origin.add(helper1)
    rot_origin.add(helper2)
}

function buildOutline(id) {
    if (elements[id].display.visibility == false) return;
    var cube = scene.getObjectByName(id)
    if (cube === undefined) return;
    var geo = new THREE.EdgesGeometry(cube.geometry);
    var mat = new THREE.LineBasicMaterial({color: 0x74c2ff, linewidth: 50})
    var wireframe = new THREE.LineSegments(geo, mat)
    wireframe.name = id+'_outline'
    wireframe.position.set(cube.position.x, cube.position.y, cube.position.z)

    var s = elements[id]
    if (s.rotation) {
        wireframe.position.set(s.rotation.origin[0], s.rotation.origin[1], s.rotation.origin[2])
        wireframe.geometry.translate(s.from[0]+(s.size(0)/2), s.from[1]+(s.size(1)/2), s.from[2]+(s.size(2)/2))
        if (s.rotation.angle !== 0) {
            wireframe.rotation[s.rotation.axis] = Math.PI / (180 /s.rotation.angle) 
        } else {
        }
    }
    outlines.add(wireframe)
}

function setOriginHelper(obj) {
    rot_origin.position.x = obj.origin[0]
    rot_origin.position.y = obj.origin[1]
    rot_origin.position.z = obj.origin[2]

    rot_origin.rotation.x = 0
    rot_origin.rotation.y = 0
    rot_origin.rotation.z = 0
    rot_origin.rotation[obj.axis] = Math.PI / (180 /obj.angle)
    scene.add(rot_origin)
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    if (display_mode === true) {
        renderer.render(display_scene, camera)
        if (ground_animation === true) {
            groundAnimation()
        }
    } else {
        renderer.render(scene, camera)
    }
}

function onDocumentTouchStart( event ) {
    event.preventDefault();
    
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown( event )
}

function onDocumentMouseDown( event ) {
    if (event.button == 0) {
        event.preventDefault()
        $(':focus').blur()

        mouse.x = ((event.clientX - 328) / c_width) * 2 - 1;
        mouse.y = - ((event.clientY - 34) / c_height) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        if (display_mode == true) return;

        objects = []
        scene.children.forEach(function(s) {
            if (!s.isLineSegments) {
                objects.push(s)
            }
        })

        var intersects = raycaster.intersectObjects( objects );
        if (intersects.length > 0) {
            addToSelection(intersects[0].object.name, event)
            switch(Math.floor( intersects[0].faceIndex / 2 )) {
                case 5:
                selectedFace = 'north'
                break;
                case 0:
                selectedFace = 'east'
                break;
                case 4:
                selectedFace = 'south'
                break;
                case 1:
                selectedFace = 'west'
                break;
                case 2:
                selectedFace = 'up'
                break;
                case 3:
                selectedFace = 'down'
                break;
            }
            $('input#'+selectedFace).prop("checked", true)
            loadUV(false)
            if (tool == 'brush' && event.shiftKey == false) {
                paint()
            }
        }
    }    
}

function clearCanvas() {
    var obj = true;
    while (obj) {
        obj = scene.getObjectByProperty('type', 'Mesh')
        if (obj) {
            scene.remove(obj)
        }
    }
}

function updateCanvas() {
    updateNslideValues()
    clearCanvas()
    elements.forEach(function(s, i) {
        if (s.display.visibility == true) {
            var x = s.to[0] - s.from[0]
            var y = s.to[1] - s.from[1]
            var z = s.to[2] - s.from[2]
            if (x == 0) x = 0.001
            if (y == 0) y = 0.001
            if (z == 0) z = 0.001

            if (s.rotation !== undefined) {
                if (s.rotation.rescale === true && s.rotation.angle !== 0) {
                    var rescale = 0;
                    if (s.rotation.angle == 45 || s.rotation.angle == -45) {
                        rescale = 1.4142
                    } else if (s.rotation.angle == 22.5 || s.rotation.angle == -22.5) {
                        rescale = 1.127
                    }
                    x *= rescale
                    y *= rescale
                    z *= rescale
                    switch (s.rotation.axis) {
                        case 'x': x /= rescale; break;
                        case 'y': y /= rescale; break;
                        case 'z': z /= rescale; break;
                    }
                }
            }

            var materials = []
        
            var obj = s.faces
            for (var face in obj) {
                if (obj.hasOwnProperty(face)) {
                    try {
                        materials.push(getTextureById(obj[face].texture).material)
                    } catch(err) {
                        materials.push(emptyMaterial)
                    }
                }
            }

            var mesh = new THREE.Mesh(new THREE.CubeGeometry(x, y, z), new THREE.MultiMaterial( materials ));

            try {
                mesh.geometry.faces[10].materialIndex = 0    //NORTH
                mesh.geometry.faces[11].materialIndex = 0

                mesh.geometry.faces[0].materialIndex = 1    //EAST
                mesh.geometry.faces[1].materialIndex = 1

                mesh.geometry.faces[8].materialIndex = 2    //SOUTH
                mesh.geometry.faces[9].materialIndex = 2

                mesh.geometry.faces[2].materialIndex = 3    //WEST
                mesh.geometry.faces[3].materialIndex = 3

                mesh.geometry.faces[4].materialIndex = 4    //UP
                mesh.geometry.faces[5].materialIndex = 4

                mesh.geometry.faces[6].materialIndex = 5    //DOWN
                mesh.geometry.faces[7].materialIndex = 5
            } catch (err) {
            }

            if (s.rotation) {
                mesh.position.set(s.rotation.origin[0], s.rotation.origin[1], s.rotation.origin[2])
                mesh.geometry.translate(-s.rotation.origin[0], -s.rotation.origin[1], -s.rotation.origin[2])
                if (s.rotation.angle !== 0) {
                    mesh.rotation[s.rotation.axis] = Math.PI / (180 /s.rotation.angle)
                } else {
                }
            }
            mesh.translateX(((s.to[0] - s.from[0])*0.5)+s.from[0])
            mesh.translateY(((s.to[1] - s.from[1])*0.5)+s.from[1])
            mesh.translateZ(((s.to[2] - s.from[2])*0.5)+s.from[2])
            mesh.name = i;
            scene.add(mesh)
            updateUV(i)
        }
    })
    updateSelection()
}

function getUVArray(side) {

    var arr = [
        new THREE.Vector2(side.uv[0]/16, (16-side.uv[1])/16),  //0,1
        new THREE.Vector2(side.uv[0]/16, (16-side.uv[3])/16),  //0,0
        new THREE.Vector2(side.uv[2]/16, (16-side.uv[3])/16),   //1,0
        new THREE.Vector2(side.uv[2]/16, (16-side.uv[1])/16)  //1,1
    ]
    var rot = (side.rotation+0)
    while (rot > 0) {
        arr.push(arr.shift())
        rot = rot-90;
    }
    return arr;
}

function updateUV(id) {
    var obj = elements[id]
    var mesh = scene.getObjectByName(id)
    if (mesh == undefined) return;
    mesh.geometry.faceVertexUvs[0] = [];
    
    var obj = obj.faces
    for (var face in obj) {
        if (obj.hasOwnProperty(face)) {
            var fIndex = 0;
            switch(face) {
                case 'north':   fIndex = 10;   break;
                case 'east':    fIndex = 0;    break;
                case 'south':   fIndex = 8;    break;
                case 'west':    fIndex = 2;    break;
                case 'up':      fIndex = 4;    break;
                case 'down':    fIndex = 6;    break;
            }
            mesh.geometry.faceVertexUvs[0][fIndex] = [ getUVArray(obj[face])[0], getUVArray(obj[face])[1], getUVArray(obj[face])[3] ];
            mesh.geometry.faceVertexUvs[0][fIndex+1] = [ getUVArray(obj[face])[1], getUVArray(obj[face])[2], getUVArray(obj[face])[3] ];
        }
    }
    mesh.geometry.elementsNeedUpdate = true;
    return mesh.geometry
}