///<reference path="gl-matrix.d.ts" />
/// <reference path="dat.gui.d.ts" />
var canvas; //this is handle to our canvas element that we get WebGL context from so we can render suff.
var gl; //this is handle to WebGL context, anything we do related to WebGL is done using this handle.
var shader; // this is shader program containing vertex and fragment shader
var camera; // this is camera object, we use it to set view and projection matrices 
var controls;
var Controls = (function () {
    function Controls() {
        this.renderMode = "wireframe";
        this.shapeType = "Toroid";
        this.shape = 1;
        this.size = 3.5;
    }
    return Controls;
})();
function main() {
    controls = new Controls();
    var gui = new dat.GUI();
    gui.add(controls, 'renderMode', ['wireframe', 'shaded']);
    gui.add(controls, 'shapeType', ['Ellipsoid', 'Toroid']);
    gui.add(controls, 'shape', 0.0, 3.5);
    gui.add(controls, 'size', 0.5, 3.5);
    controls.renderMode = "wireframe";
    controls.shape = 1;
    controls.size = 3.5;
    controls.shapeType = "Toroid";
    initWebGL(); // we initialize WebGL context with this function adn set some WebGL states.
    shader = new ShaderProgram("shader-vs", "shader-fs"); // we create shader program by passing names of vertex and fragment shader. Vertex and Fragment shader are defined in index.html file
    camera = new Camera(); // we create new Camera object 
    var scene = new Scene(); //this is scene object
    requestAnimationFrame(animationLoop); // we requst animation frame, this calls animationLoop function
    function animationLoop() {
        scene.update(); // every animation loop we update positions of objects in scene
        scene.draw(); // every animation loop we draw objects in scene
        requestAnimationFrame(animationLoop); // we again request animationloop. And this goes for inifite time
    }
    ;
}
var Scene = (function () {
    function Scene() {
    }
    Scene.prototype.resize = function () {
        var displayWidth = canvas.clientWidth; // we get current browser width and height
        var displayHeight = canvas.clientHeight;
        if (canvas.width != displayWidth || canvas.height != displayHeight) {
            canvas.width = displayWidth; // we update canvas
            canvas.height = displayHeight;
        }
    };
    Scene.prototype.update = function () {
        this.resize(); // we call resize method 
        camera.update(); // we update camera 
        if (controls.shapeType == "Ellipsoid")
            this.object = new Ellipsoid();
        else
            this.object = new Toroid();
    };
    Scene.prototype.draw = function () {
        this.object.draw();
    };
    return Scene;
})();
var ShaderProgram // this represents shader program that we use to render 
 = (function () {
    function ShaderProgram // this represents shader program that we use to render 
        (vertexSrc, fragmentSrc) {
        var vsSource = document.getElementById(vertexSrc).innerHTML; // we get vertex shader source from index.html
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER); // we create new shader
        gl.shaderSource(this.vertexShader, vsSource); // we set shader source 
        gl.compileShader(this.vertexShader); // we compile shader 
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.log("Error compiling vertex shader: " + gl.getShaderInfoLog(this.vertexShader));
        }
        var fsSource = document.getElementById(fragmentSrc).innerHTML; // we get fragment shader source from index.html
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); // we create new shader
        gl.shaderSource(this.fragmentShader, fsSource); // we set shader source 
        gl.compileShader(this.fragmentShader); // we compile shader 
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.log("Error compiling fragment shader: " + gl.getShaderInfoLog(this.fragmentShader));
        }
        this.shaderProgram = gl.createProgram(); // we create new program
        gl.attachShader(this.shaderProgram, this.vertexShader); // we attach vertex shader to this program
        gl.attachShader(this.shaderProgram, this.fragmentShader); // we attach fragment shader to this program
        gl.linkProgram(this.shaderProgram); // we link program
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.log("Shader program linking failed: " + gl.getProgramInfoLog(this.shaderProgram));
        }
    }
    ShaderProgram // this represents shader program that we use to render 
    .prototype.setMatrixUniform = function (matrixName, matrix) {
        this.use(); // we set this shader as current
        var matrixLocation = gl.getUniformLocation(this.shaderProgram, matrixName); // we get matrix location based on name passed to function, 1st argument
        gl.uniformMatrix4fv(matrixLocation, false, matrix); // we set matrix value with value passed to the function, 2nd argument
    };
    ShaderProgram // this represents shader program that we use to render 
    .prototype.use = function () {
        gl.useProgram(this.shaderProgram);
    };
    ShaderProgram // this represents shader program that we use to render 
    .prototype.getProgram = function () {
        return this.shaderProgram;
    };
    return ShaderProgram // this represents shader program that we use to render 
    ;
})();
var Camera = (function () {
    function Camera() {
        this.posX = 0;
        this.posY = 2;
        gl.clearColor(0.2, 0.2, 0.2, 1.0); // we set clear color to drak gray
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        mat4.identity(this.viewMatrix); // we set projection matrix 
        mat4.perspective(this.projectionMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
        gl.viewport(0, 0, canvas.width, canvas.height);
        shader.setMatrixUniform("uPMatrix", this.projectionMatrix);
    }
    Camera.prototype.update = function () {
        gl.clear(gl.COLOR_BUFFER_BIT); // we clear screen at the beginnig of each frame 
        mat4.identity(this.viewMatrix); // we also update view and projection matrix, window size might change so we need to do this 
        mat4.perspective(this.projectionMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
        gl.viewport(0, 0, canvas.width, canvas.height);
        mat4.lookAt(this.viewMatrix, [this.posX, this.posY, 4], [0, 0, 0], [0, 1, 0]);
        shader.setMatrixUniform("uPMatrix", this.projectionMatrix);
        shader.setMatrixUniform("uVMatrix", this.viewMatrix);
    };
    return Camera;
})();
function initWebGL() {
    canvas = document.getElementById("my-canvas"); // we get canvas element inside page 
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // we then get WebGL context from canvas 
    }
    catch (e) { }
    if (!gl) {
        alert("Error: Your browser does not appear to support WebGL."); // error message if browser does not support WebGL 
    }
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // we flip pixel store inside GPU
}
/* Returns the sign of x */
function sgnf(x) {
    if (x < 0)
        return -1;
    if (x > 0)
        return 1;
    return 0;
}
/* Returns the absolute value of x */
function absf(x) {
    if (x < 0)
        return -x;
    return x;
}
/* sqC (v, n)
 * This function implements the c(v,n) utility function
 *
 * c(v,n) = sgnf(cos(v)) * |cos(v)|^n
 */
function sqC(v, n) {
    return sgnf(Math.cos(v)) * Math.pow(absf(Math.cos(v)), n);
}
/* sqCT (v, n, alpha)
 * This function implements the CT(v,n,alpha) utility function
 *
 * CT(v,n,alpha) = alpha + c(v,n)
 */
function sqCT(v, n, alpha) {
    return alpha + sqC(v, n);
}
/* sqS (v, n)
 * This function implements the s(v,n) utility function
 *
 * s(v,n) = sgnf(sin(v)) * |sin(v)|^n
 */
function sqS(v, n) {
    return sgnf(Math.sin(v)) * Math.pow(absf(Math.sin(v)), n);
}
var Ellipsoid = (function () {
    function Ellipsoid() {
        console.log("Constructing elipsoid");
        this.vertexData = new Array();
        this.n = 1;
        this.e = controls.shape;
        this.u1 = -Math.PI / 2;
        this.u2 = Math.PI / 2;
        this.v1 = -Math.PI;
        this.v2 = Math.PI;
        this.s1 = 0;
        this.s2 = 1;
        this.t1 = 0;
        this.t2 = 1;
        this.v_segs = 50;
        this.u_segs = 50;
        var U, dU, V, dV;
        var S, dS, T, dT;
        var X, Y; /* for looping */
        /* Calculate delta variables */
        dU = (this.u2 - this.u1) / this.u_segs;
        dV = (this.v2 - this.v1) / this.v_segs;
        dS = (this.s2 - this.s1) / this.u_segs;
        dT = (this.t2 - this.t1) / this.v_segs;
        /* Initialize variables for loop */
        U = this.u1;
        S = this.s1;
        var counter = 0;
        for (Y = 0; Y < this.u_segs; Y++) {
            /* Initialize variables for loop */
            V = this.v1;
            T = this.t1;
            for (X = 0; X < this.v_segs; X++) {
                // Triangle 1
                /* VERTEX #1 */
                this.vertexData[counter + 0] = controls.size * sqC(U, this.n) * sqC(V, this.e);
                this.vertexData[counter + 1] = controls.size * sqC(U, this.n) * sqS(V, this.e);
                this.vertexData[counter + 2] = controls.size * sqS(U, this.n);
                this.vertexData[counter + 3] = sqC(U, 2 - this.n) * sqC(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 4] = sqC(U, 2 - this.n) * sqS(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 5] = sqS(U, 2 - this.n) / controls.size;
                this.vertexData[counter + 6] = S;
                this.vertexData[counter + 7] = T;
                /* VERTEX #2 */
                this.vertexData[counter + 8] = controls.size * sqC(U + dU, this.n) * sqC(V, this.e);
                this.vertexData[counter + 9] = controls.size * sqC(U + dU, this.n) * sqS(V, this.e);
                this.vertexData[counter + 10] = controls.size * sqS(U + dU, this.n);
                this.vertexData[counter + 11] = sqC(U + dU, 2 - this.n) * sqC(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 12] = sqC(U + dU, 2 - this.n) * sqS(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 13] = sqS(U + dU, 2 - this.n) / controls.size;
                this.vertexData[counter + 14] = S + dS;
                this.vertexData[counter + 15] = T;
                /* VERTEX #3 */
                this.vertexData[counter + 16] = controls.size * sqC(U + dU, this.n) * sqC(V + dV, this.e);
                this.vertexData[counter + 17] = controls.size * sqC(U + dU, this.n) * sqS(V + dV, this.e);
                this.vertexData[counter + 18] = controls.size * sqS(U + dU, this.n);
                this.vertexData[counter + 19] = sqC(U + dU, 2 - this.n) * sqC(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 20] = sqC(U + dU, 2 - this.n) * sqS(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 21] = sqS(U + dU, 2 - this.n) / controls.size;
                this.vertexData[counter + 22] = S + dS;
                this.vertexData[counter + 23] = T + dT;
                // Triangle 2
                /* VERTEX #1 */
                this.vertexData[counter + 24] = controls.size * sqC(U, this.n) * sqC(V, this.e);
                this.vertexData[counter + 25] = controls.size * sqC(U, this.n) * sqS(V, this.e);
                this.vertexData[counter + 26] = controls.size * sqS(U, this.n);
                this.vertexData[counter + 27] = sqC(U, 2 - this.n) * sqC(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 28] = sqC(U, 2 - this.n) * sqS(V, 2 - this.e) / controls.size;
                this.vertexData[counter + 29] = sqS(U, 2 - this.n) / controls.size;
                this.vertexData[counter + 30] = S;
                this.vertexData[counter + 31] = T;
                /* VERTEX #2 */
                this.vertexData[counter + 32] = controls.size * sqC(U + dU, this.n) * sqC(V + dV, this.e);
                this.vertexData[counter + 33] = controls.size * sqC(U + dU, this.n) * sqS(V + dV, this.e);
                this.vertexData[counter + 34] = controls.size * sqS(U + dU, this.n);
                this.vertexData[counter + 35] = sqC(U + dU, 2 - this.n) * sqC(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 36] = sqC(U + dU, 2 - this.n) * sqS(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 37] = sqS(U + dU, 2 - this.n) / controls.size;
                this.vertexData[counter + 38] = S + dS;
                this.vertexData[counter + 39] = T + dT;
                /* VERTEX #4 */
                this.vertexData[counter + 40] = controls.size * sqC(U, this.n) * sqC(V + dV, this.e);
                this.vertexData[counter + 41] = controls.size * sqC(U, this.n) * sqS(V + dV, this.e);
                this.vertexData[counter + 42] = controls.size * sqS(U, this.n);
                this.vertexData[counter + 43] = sqC(U, 2 - this.n) * sqC(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 44] = sqC(U, 2 - this.n) * sqS(V + dV, 2 - this.e) / controls.size;
                this.vertexData[counter + 45] = sqS(U, 2 - this.n) / controls.size;
                this.vertexData[counter + 46] = S;
                this.vertexData[counter + 47] = T + dT;
                /* Update variables for next loop */
                V += dV;
                T += dT;
                counter += 48;
            }
            /* Update variables for next loop */
            S += dS;
            U += dU;
        }
        this.modelMatrix = mat4.create();
        mat4.identity(this.modelMatrix); // we set model matrix to identity 
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]); // we translate line 
        mat4.scale(this.modelMatrix, this.modelMatrix, [1, 1, 0]); // we scale line
        shader.setMatrixUniform("uMMatrix", this.modelMatrix); // we set matrix inside vertex shader to new value 
        gl.uniform3f(gl.getUniformLocation(shader.getProgram(), "uViewPos"), camera.posX, camera.posY, 2);
        var nMatrix = mat4.create();
        mat4.multiply(nMatrix, this.modelMatrix, camera.viewMatrix);
        mat4.invert(nMatrix, nMatrix);
        mat4.transpose(nMatrix, nMatrix);
        shader.setMatrixUniform("uNMatrix", nMatrix);
        gl.uniform3f(gl.getUniformLocation(shader.getProgram(), "uLightDirection"), -1, 1, 1);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightAmbient"), [0.03, 0.03, 0.03, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightDiffuse"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightSpecular"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialAmbient"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialDiffuse"), [0.5, 0.8, 0.1, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialSpecular"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform1f(gl.getUniformLocation(shader.getProgram(), "uShininess"), 230.0);
        this.vbo = gl.createBuffer(); // we create new buffer on GPU 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo); // we bind that buffer 
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW); // we set new data inside buffer 
        var vertexPositionAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexPosition"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 32, 0); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexPositionAttributeLocation); // we enable vertex shader attribute 
        var vertexNormalAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexNormal"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexNormalAttributeLocation, 3, gl.FLOAT, false, 32, 12); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexNormalAttributeLocation); // we enable vertex shader attribute 
        var vertexTextureAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexTextureCoords"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexTextureAttributeLocation, 2, gl.FLOAT, false, 32, 24); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexTextureAttributeLocation); // we enable vertex shader attribute 
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // we unbind the buffer 
    }
    Ellipsoid.prototype.update = function () {
    };
    Ellipsoid.prototype.draw = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        if (controls.renderMode == "wireframe")
            gl.drawArrays(gl.LINES, 0, this.vertexData.length / 8);
        if (controls.renderMode == "shaded")
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexData.length / 8);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    return Ellipsoid;
})();
var Toroid = (function () {
    function Toroid() {
        console.log("Constructing elipsoid");
        this.vertexData = new Array();
        this.alpha = 3;
        this.n = controls.shape;
        this.e = 1;
        this.u1 = -Math.PI;
        this.u2 = Math.PI;
        this.v1 = -Math.PI;
        this.v2 = Math.PI;
        this.s1 = 0;
        this.s2 = 1;
        this.t1 = 0;
        this.t2 = 1;
        this.v_segs = 50;
        this.u_segs = 50;
        var U, dU, V, dV;
        var S, dS, T, dT;
        var X, Y; /* for looping */
        /* Calculate delta variables */
        dU = (this.u2 - this.u1) / this.u_segs;
        dV = (this.v2 - this.v1) / this.v_segs;
        dS = (this.s2 - this.s1) / this.u_segs;
        dT = (this.t2 - this.t1) / this.v_segs;
        /* Initialize variables for loop */
        V = this.v1;
        S = this.s1;
        var counter = 0;
        for (Y = 0; Y < this.u_segs; Y++) {
            /* Initialize variables for loop */
            U = this.u1;
            T = this.t1;
            for (X = 0; X < this.v_segs; X++) {
                var A1, A2, A3;
                A1 = 1 / (3.5 - controls.size + this.alpha);
                A2 = 1 / (3.5 - controls.size + this.alpha);
                A3 = 1 / (3.5 - controls.size + this.alpha);
                // Triangle 1
                /* VERTEX #1 */
                this.vertexData[counter + 0] = A1 * sqCT(U, this.e, this.alpha) * sqC(V, this.n);
                this.vertexData[counter + 1] = A2 * sqCT(U, this.e, this.alpha) * sqS(V, this.n);
                this.vertexData[counter + 2] = A3 * sqS(U, this.e);
                this.vertexData[counter + 3] = sqC(U, 2 - this.e) * sqC(V, 2 - this.n) / A1;
                this.vertexData[counter + 4] = sqC(U, 2 - this.e) * sqS(V, 2 - this.n) / A2;
                this.vertexData[counter + 5] = sqS(U, 2 - this.e) / A3;
                this.vertexData[counter + 6] = S;
                this.vertexData[counter + 7] = T;
                /* VERTEX #2 */
                this.vertexData[counter + 8] = A1 * sqCT(U + dU, this.e, this.alpha) * sqC(V, this.n);
                this.vertexData[counter + 9] = A2 * sqCT(U + dU, this.e, this.alpha) * sqS(V, this.n);
                this.vertexData[counter + 10] = A3 * sqS(U + dU, this.e);
                this.vertexData[counter + 11] = sqC(U + dU, 2 - this.e) * sqC(V, 2 - this.n) / A1;
                this.vertexData[counter + 12] = sqC(U + dU, 2 - this.e) * sqS(V, 2 - this.n) / A2;
                this.vertexData[counter + 13] = sqS(U + dU, 2 - this.e) / A3;
                this.vertexData[counter + 14] = S + dS;
                this.vertexData[counter + 15] = T;
                /* VERTEX #3 */
                this.vertexData[counter + 16] = A1 * sqCT(U + dU, this.e, this.alpha) * sqC(V + dV, this.n);
                this.vertexData[counter + 17] = A2 * sqCT(U + dU, this.e, this.alpha) * sqS(V + dV, this.n);
                this.vertexData[counter + 18] = A3 * sqS(U + dU, this.e);
                this.vertexData[counter + 19] = sqC(U + dU, 2 - this.e) * sqC(V + dV, 2 - this.n) / A1;
                this.vertexData[counter + 20] = sqC(U + dU, 2 - this.e) * sqS(V + dV, 2 - this.n) / A2;
                this.vertexData[counter + 21] = sqS(U + dU, 2 - this.e) / A3;
                this.vertexData[counter + 22] = S + dS;
                this.vertexData[counter + 23] = T + dT;
                // Triangle 2
                /* VERTEX #1 */
                this.vertexData[counter + 24] = A1 * sqCT(U, this.e, this.alpha) * sqC(V, this.n);
                this.vertexData[counter + 25] = A2 * sqCT(U, this.e, this.alpha) * sqS(V, this.n);
                this.vertexData[counter + 26] = A3 * sqS(U, this.e);
                this.vertexData[counter + 27] = sqC(U, 2 - this.e) * sqC(V, 2 - this.n) / A1;
                this.vertexData[counter + 28] = sqC(U, 2 - this.e) * sqS(V, 2 - this.n) / A2;
                this.vertexData[counter + 29] = sqS(U, 2 - this.e) / A3;
                this.vertexData[counter + 30] = S;
                this.vertexData[counter + 31] = T;
                /* VERTEX #3 */
                this.vertexData[counter + 32] = A1 * sqCT(U + dU, this.e, this.alpha) * sqC(V + dV, this.n);
                this.vertexData[counter + 33] = A2 * sqCT(U + dU, this.e, this.alpha) * sqS(V + dV, this.n);
                this.vertexData[counter + 34] = A3 * sqS(U + dU, this.e);
                this.vertexData[counter + 35] = sqC(U + dU, 2 - this.e) * sqC(V + dV, 2 - this.n) / A1;
                this.vertexData[counter + 36] = sqC(U + dU, 2 - this.e) * sqS(V + dV, 2 - this.n) / A2;
                this.vertexData[counter + 37] = sqS(U + dU, 2 - this.e) / A3;
                this.vertexData[counter + 38] = S + dS;
                this.vertexData[counter + 39] = T + dT;
                /* VERTEX #4 */
                this.vertexData[counter + 40] = A1 * sqCT(U, this.e, this.alpha) * sqC(V + dV, this.n);
                this.vertexData[counter + 41] = A2 * sqCT(U, this.e, this.alpha) * sqS(V + dV, this.n);
                this.vertexData[counter + 42] = A3 * sqS(U, this.e);
                this.vertexData[counter + 43] = sqC(U, 2 - this.e) * sqC(V + dV, 2 - this.n) / A1;
                this.vertexData[counter + 44] = sqC(U, 2 - this.e) * sqS(V + dV, 2 - this.n) / A2;
                this.vertexData[counter + 45] = sqS(U, 2 - this.e) / A3;
                this.vertexData[counter + 46] = S;
                this.vertexData[counter + 47] = T + dT;
                /* Update variables for next loop */
                U += dU;
                T += dT;
                counter += 48;
            }
            /* Update variables for next loop */
            S += dS;
            V += dV;
        }
        this.modelMatrix = mat4.create();
        mat4.identity(this.modelMatrix); // we set model matrix to identity 
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]); // we translate line 
        mat4.scale(this.modelMatrix, this.modelMatrix, [1, 1, 0]); // we scale line
        shader.setMatrixUniform("uMMatrix", this.modelMatrix); // we set matrix inside vertex shader to new value 
        gl.uniform3f(gl.getUniformLocation(shader.getProgram(), "uViewPos"), camera.posX, camera.posY, 2);
        var nMatrix = mat4.create();
        mat4.multiply(nMatrix, this.modelMatrix, camera.viewMatrix);
        mat4.invert(nMatrix, nMatrix);
        mat4.transpose(nMatrix, nMatrix);
        shader.setMatrixUniform("uNMatrix", nMatrix);
        gl.uniform3f(gl.getUniformLocation(shader.getProgram(), "uLightDirection"), -1, 1, 1);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightAmbient"), [0.03, 0.03, 0.03, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightDiffuse"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uLightSpecular"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialAmbient"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialDiffuse"), [0.5, 0.8, 0.1, 1.0]);
        gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "uMaterialSpecular"), [1.0, 1.0, 1.0, 1.0]);
        gl.uniform1f(gl.getUniformLocation(shader.getProgram(), "uShininess"), 230.0);
        this.vbo = gl.createBuffer(); // we create new buffer on GPU 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo); // we bind that buffer 
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW); // we set new data inside buffer 
        var vertexPositionAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexPosition"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 32, 0); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexPositionAttributeLocation); // we enable vertex shader attribute 
        var vertexNormalAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexNormal"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexNormalAttributeLocation, 3, gl.FLOAT, false, 32, 12); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexNormalAttributeLocation); // we enable vertex shader attribute 
        var vertexTextureAttributeLocation = gl.getAttribLocation(shader.getProgram(), "aVertexTextureCoords"); // we get position attribute position from vertex shader 
        gl.vertexAttribPointer(vertexTextureAttributeLocation, 2, gl.FLOAT, false, 32, 24); // we set order in which are position attributes sorted inside geomtry array
        gl.enableVertexAttribArray(vertexTextureAttributeLocation); // we enable vertex shader attribute 
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // we unbind the buffer 
    }
    Toroid.prototype.update = function () {
    };
    Toroid.prototype.draw = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        if (controls.renderMode == "wireframe")
            gl.drawArrays(gl.LINES, 0, this.vertexData.length / 8);
        if (controls.renderMode == "shaded")
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexData.length / 8);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    return Toroid;
})();
