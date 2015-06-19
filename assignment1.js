var gl;
var projection;
var camera;
var cubes = [];
var cubeAnimation = [];

// array of centers of the cubes
var centerArray = [vec4(10.0, 10.0, 10.0, 1.0),
                   vec4(-10.0, 10.0, 10.0, 1.0),
                   vec4(-10.0, -10.0, 10.0, 1.0),
                   vec4(10.0, -10.0, 10.0, 1.0),
                   vec4(10.0, 10.0, -10.0, 1.0),
                   vec4(-10.0, 10.0, -10.0, 1.0),
                   vec4(-10.0, -10.0, -10.0, 1.0),
                   vec4(10.0, -10.0, -10.0, 1.0)
];
var colorArray = [vec4(0.0, 0.0, 0.0, 1.0),  // black
                  vec4(1.0, 0.0, 0.0, 1.0),  // red
                  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
                  vec4(0.0, 1.0, 0.0, 1.0),  // green
                  vec4(0.0, 0.0, 1.0, 1.0),  // blue
                  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
                  vec4(1.0, 1.0, 1.0, 1.0),  // white
                  vec4(0.0, 1.0, 1.0, 1.0),   // cyan
];
var colorArrayStart = 0;

// multMV multiplies a matrix and a vector
var multMV = function (mat, vec) {
    if (!mat.matrix || mat.length == 0) {
        throw "matrix is of the wrong size, can't multiply with the vector";
    } else if (vec.length == 0) {
        throw "vector is of size 0, can't multiply with the matrix";
    } 

    for(var i = 0; i < mat.length; i++) {
        if(mat[i].length != vec.length)
            throw "can't multiply the matrix with the vector"
    }
   
    var retMat = [];
    for (var i = 0; i < mat.length; i++) {
        var temp = 0.0;
        for (var j = 0 ; j < vec.length; j++) {
            temp += mat[i][j] * vec[j];
        }
        retMat.push(temp);
    }
    return retMat.splice(0, mat.length);
};

var Transformation = function Transformation() {
    this.mat = mat4(); 

    this.reset = function () {
        this.mat = mat4();
    };

    this.translation = function (x, y, z) {
        this.mat = mult(translate(x, y, z), this.mat);
        return this;
    };

    this.scale = function (x, y, z) {
        this.mat = mult(scale(x, y, z), this.mat);
        return this;
    };

    this.rotation = function (angle, axis) {
        this.mat = mult(rotate(angle, axis), this.mat);
        return this;
    };

};  

var Cube = function Cube() {
    var vertices = [vec4(-1, -1, -1, 1),
                    vec4(1, -1, -1, 1),
                    vec4(1, 1, -1, 1),
                    vec4(-1, 1, -1, 1),
                    vec4(-1, 1, 1, 1),
                    vec4(-1, -1, 1, 1),
                    vec4(1, -1, 1, 1),
                    vec4(1, 1, 1, 1)];
    this.center = vec4(0.0, 0.0, 0.0, 1.0);
    this.color = vec4(0.0, 0.0, 0.0, 1.0);  // black

    // Transformation matrix.
    this.transformation = new Transformation();

    // Update the cube
    this.update = function () {
        for (var i = 0 ; i < vertices.length; i++) {
            vertices[i] = multMV(this.transformation.mat, vertices[i]);
        }
        this.center = multMV(this.transformation.mat, this.center);
        this.transformation.reset();
    };

    // Render the cube
    this.render = function () {
        var program = gl.getParameter(gl.CURRENT_PROGRAM);

        var vertexArray = [vertices[0],
                            vertices[3],
                            vertices[1],
                            vertices[2],
                            vertices[7],
                            vertices[3],
                            vertices[4],
                            vertices[0],
                            vertices[5],
                            vertices[1],
                            vertices[6],
                            vertices[7],
                            vertices[5],
                            vertices[4]];

        // First draw the cube in black, push the color black into the colorArray
        var colorArray = [];
        for (var i = 0; i < vertexArray.length; i++) {
            colorArray.push(this.color);    
        }

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(vertexArray)), gl.DYNAMIC_DRAW);
        var positionLoc = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(colorArray)), gl.DYNAMIC_DRAW);
        var colorLoc = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexArray.length);

        vertexArray = [vertices[0], vertices[1],
                        vertices[1], vertices[2],
                        vertices[2], vertices[3],
                        vertices[3], vertices[0],
                        vertices[0], vertices[5],
                        vertices[1], vertices[6],
                        vertices[2], vertices[7],
                        vertices[3], vertices[4],
                        vertices[4], vertices[5],
                        vertices[5], vertices[6],
                        vertices[6], vertices[7],
                        vertices[7], vertices[4]];

        // Draw outline in white, push the color white into the colorArray
        colorArray = [];
        for (var i = 0; i < vertexArray.length; i++) {
            colorArray.push(vec4(1.0, 1.0, 1.0, 1.0));  
        }

        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(vertexArray)), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);

        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(colorArray)), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, vertexArray.length);
    };  
};  

var Projection = function Projection(canvas_width, canvas_height) {
    var mode;
    var fovy;
    var pMat;
    var oMat;
    var aspect = canvas_width / canvas_height;

    this.reset = function () {
        mode = null;
        fovy = 80;
        pMat = perspective(fovy, aspect, 5, 55);
        oMat = ortho(-15 * aspect, 15 * aspect, -15, 15, 5, 55);
    };

    this.reset();

    this.modifyFovy = function (range, angle) {
        if (range == "narrower") {
            fovy -= angle;
            if (fovy < 25) {
                fovy = 25;
            }
        } else if (range == "wider") {
            fovy += angle;
            if (fovy > 140) {
                fovy = 140;
            }
        }
    };

    this.update = function () {
        pMat = perspective(fovy, aspect, 5, 55);
    };

    this.changeMode = function (newMode) {
        if (newMode == mode) {
            return;
        }
        var program = gl.getParameter(gl.CURRENT_PROGRAM);
        var projectionLoc = gl.getUniformLocation(program, "projection");
        var mat;
        if (newMode == "perspective") {
            mat = pMat;
        } else if (newMode == "orthographic") {
            mat = oMat;
        } else {
            throw "Invalid Mode!";
        }
        gl.uniformMatrix4fv(projectionLoc, false, new Float32Array(flatten(mat)));
        newMode = mode;
    };
};  

// Implement the camera
var Camera = function Camera() {
    this.enableCrosshair = false;
    this.position;
    this.xzPlane;

    this.reset = function () {
        this.position = vec3(0, 0, 30);
        this.xzPlane = 0;
    };
    this.reset();

    // angle is positive to the left and negative to the right
    this.yaw = function (angle) {
        this.xzPlane += angle;
    };

   this.move = function (direction, units) {
        var delta;
        if (direction == "up" || direction == "down") {
            delta = (direction == "up" ? vec3(0, units, 0) : vec3(0, -units, 0));
        } else {
            var vec;
            switch (direction) {
                case "forward":
                    vec = vec4(0, 0, -units, 1);
                    break;
                case "backward":
                    vec = vec4(0, 0, units, 1);
                    break;
                case "left":
                    vec = vec4(-units, 0, 0, 1);
                    break;
                case "right":
                    vec = vec4(units, 0, 0, 1);
                    break;
            }
            var t = new Transformation().rotation(this.xzPlane, [0, 1, 0]);
            delta = multMV(t.mat, vec);
            delta = scaleVec(delta[3], vec3(delta.slice(0, 3)));
            
        }
        this.position = add(this.position, delta);
    };  

    this.modelViewTransformation = function () {
        var t = new Transformation();
        t.translation(-this.position[0], -this.position[1], -this.position[2]).rotation(-this.xzPlane, [0, 1, 0])
        return t;
    };

    this.update = function () {
        var program = gl.getParameter(gl.CURRENT_PROGRAM);

        var modelViewLoc = gl.getUniformLocation(program, "modelView");
        var mat = this.modelViewTransformation().mat;
        gl.uniformMatrix4fv(modelViewLoc, false, new Float32Array(flatten(mat)));
    };

    this.toggleCrosshair = function () {
        this.enableCrosshair = !this.enableCrosshair;
    };

    this.renderCrosshair = function () {
        if (!this.enableCrosshair) {
            return;
        }

        var program = gl.getParameter(gl.CURRENT_PROGRAM);
        var vertexArray = [vec4(-8, 0, -6, 1), vec4(8, 0, -6, 1),
                            vec4(0, -8, -6, 1), vec4(0, 8, -6, 1)];
        var t = new Transformation().rotation(this.xzPlane, [0, 1, 0]).translation(this.position[0], this.position[1], this.position[2]);
        for (var i = 0; i < vertexArray.length; i++) {
            vertexArray[i] = multMV(t.mat, vertexArray[i]);
        }

        var colorArray = [];
        for (var i = 0; i < vertexArray.length; i++) {
            colorArray.push(vec4(1.0, 1.0, 1.0, 1.0));  // white
        }

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(vertexArray)), gl.DYNAMIC_DRAW);
        var positionLoc = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(colorArray)), gl.DYNAMIC_DRAW);
        var colorLoc = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        gl.drawArrays(gl.LINES, 0, vertexArray.length);
    };
};  

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize projection and camera objects
    projection = new Projection(canvas.width, canvas.height);
    projection.changeMode("perspective");
    camera = new Camera();
    camera.update();

    // Initialize the cubes
    colorArrayStart = 0;
    for (var i = 0; i < centerArray.length; i++) {
        cubes.push(new Cube());
        cubes[i].color = colorArray[(colorArrayStart + i) % centerArray.length];
        cubes[i].transformation.translation(centerArray[i][0], centerArray[i][1], centerArray[i][2]);
        cubes[i].update();
    }
    for (var i = 0; i < centerArray.length; i++) {
        var axis = [0, 0, 0];
        axis[Math.floor(Math.random() * 3)] = 1;
        var s = 1 + (Math.random() > 0.5 ? 0.005 : -0.005);
        cubeAnimation.push({ axis: axis, scale: s });
    }

    // Execute the appropriate action after pressing a key 
    window.onkeydown = keyPressed;

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    projection.update();
    projection.changeMode("perspective");
    camera.update();

    // display cubes
    for (var i = 0; i < cubes.length; i++) {
        var s = cubeAnimation[i].scale;
        cubes[i].transformation.translation(-cubes[i].center[0], -cubes[i].center[1], -cubes[i].center[2]).rotation(1, cubeAnimation[i].axis)
            .translation(cubes[i].center[0], cubes[i].center[1], cubes[i].center[2]);
        cubes[i].update();
        cubes[i].render();
    }

    // apply crosshair
    if (camera.enableCrosshair) {
        projection.changeMode("orthographic");
        camera.renderCrosshair();
    }

    requestAnimFrame(render);
};

function keyPressed(event) {
    var eventObject = window.event ? event : e; // event is for IE, and e is for FireFox
    var keyNum = eventObject.charCode ? eventObject.charCode : eventObject.keyCode;
    var keyPressed = String.fromCharCode(keyNum);
    switch (keyPressed) {
        // Cycle colors of the cubes
        case 'C':
            colorArrayStart = (colorArrayStart + 1) % centerArray.length;
            for (var i = 0; i < centerArray.length; i++) {
                cubes[i].color = colorArray[(colorArrayStart + i) % centerArray.length];
            }
            break;

        // Control the camera's heading
        case '%':    // Left
            camera.yaw(1)
            break;
        case '\'':    // Right
            camera.yaw(-1)
            break;

        // Control the camera's position
        case '&':    // Up
            camera.move("up", 0.25);
            break;
        case '(':    // Down
            camera.move("down", 0.25);
            break;
        case 'I':    
            camera.move("forward", 0.25);
            break;
        case 'M':
            camera.move("backward", 0.25);
            break;
        case 'J':    
            camera.move("left", 0.25);
            break;
        case 'K':    
            camera.move("right", 0.25);
            break;
        
        // Reset the view to the start position
        case 'R':
            projection.reset();
            camera.reset();
            break;

        // Control the field-of-view (FOV)
        case 'N':    
            projection.modifyFovy("narrower", 5);
            break;
        case 'W':    
            projection.modifyFovy("wider", 5);
            break;
        
        // Toggle display of an orthographic projection of a cross hair centered over the scene
        case '+':    
            if (event.shiftKey) {   
                camera.toggleCrosshair();
            }
            break;
    }
};
