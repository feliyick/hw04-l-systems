import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import DrawingRule from './LSystem/DrawingRule';
import LSystem from './LSystem/LSystem';
import Tree from './LSystem/Tree';

const controls = {
 expansionIteration : 9,
 age : 1,
 branchRotation: 30,
 numOranges: 1.0
};

let square: Square;
let branchMesh : Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let leafMesh : Mesh;
let prevExpansionIteration: number = 5;
let floorMesh : Mesh;
let prevAge: number = 1;
let branchRotation: number;
let prevBranchRotation: number;
let orangeMesh: Mesh;
let prevNumOranges : number = 1;

// MY CODE
// From https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file/32173142#32173142
export function readTextFile(file: string): string
{
    var objText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                objText = allText;
            }
        }
    }
    rawFile.send(null);
    return objText;
}

  // MY CODE END
function loadScene(expansionIteration: number, wisteria: number, branchRotation: number, numOranges: number) {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  // MY CODE
  // BRANCH AND TREE
  let branchOBJ = readTextFile('./cylinder.obj');
  branchMesh = new Mesh(branchOBJ, vec3.fromValues(0, 0, 0));
  branchMesh.create();
  let tree = new Tree(expansionIteration, branchRotation, wisteria, numOranges); // depth of 1.
  tree.build();

  let branchColourW = vec3.fromValues(79/255, 54/255, 21/255);
  let branchColourB = vec3.fromValues(0.458, 0.372, 0.282);
  let branchColour = vec3.create();
  vec3.lerp(branchColour, branchColourB, branchColourW, wisteria);
  let colsArr = new Array();
  let trans1Arr = new Array();
  let trans2Arr = new Array();
  let trans3Arr = new Array();
  let trans4Arr = new Array();

  for (let t of tree.transformMats) {
    for (let i = 0; i < 4; ++i) {
      trans1Arr.push(t[i]); // 0, 1, 2, 3
      trans2Arr.push(t[4 + i]); // 4, 5, 6, 7
      trans3Arr.push(t[8 + i]); // 8, 9, 10, 11
    }
    for (let i = 0; i < 3; ++i) {
      trans4Arr.push(t[12 + i]); // 12, 13, 14, 15
    }
    trans4Arr.push(1); // 16

    colsArr.push(branchColour[0]);
    colsArr.push(branchColour[1]);
    colsArr.push(branchColour[2]);
    colsArr.push(1.0);

  }

  let colors: Float32Array = new Float32Array(colsArr);
  let transform1: Float32Array = new Float32Array(trans1Arr);
  let transform2: Float32Array = new Float32Array(trans2Arr);
  let transform3: Float32Array = new Float32Array(trans3Arr);
  let transform4: Float32Array = new Float32Array(trans4Arr);

  branchMesh.setInstanceVBOs(colors, transform1, transform2, transform3, transform4);
  branchMesh.setNumInstances(tree.transformMats.length);


  // ORANGES
  let orangeOBJ = readTextFile('./Orange.obj');
  orangeMesh = new Mesh(orangeOBJ, vec3.fromValues(0, 0, 0));
  orangeMesh.create();


  let orangeColour01 = vec3.fromValues(252. / 255., 159./ 255, 66./ 255);
  let orangeColour02 = vec3.fromValues(245./ 255., 169./ 255, 39./ 255);
  let orangeColour = vec3.create();
  vec3.lerp(orangeColour, orangeColour02, orangeColour01, 0.4);
  let orangeColsArr = new Array();
  let orangeTrans1Arr = new Array();
  let orangeTrans2Arr = new Array();
  let orangeTrans3Arr = new Array();
  let orangeTrans4Arr = new Array();

  for (let t of tree.orangeTransformMats) {
    for (let i = 0; i < 4; ++i) {
      orangeTrans1Arr.push(t[i]); // 0, 1, 2, 3
      orangeTrans2Arr.push(t[4 + i]); // 4, 5, 6, 7
      orangeTrans3Arr.push(t[8 + i]); // 8, 9, 10, 11
    }
    for (let i = 0; i < 3; ++i) {
      orangeTrans4Arr.push(t[12 + i]); // 12, 13, 14, 15
    }
    orangeTrans4Arr.push(1); // 16

    orangeColsArr.push(orangeColour[0]);
    orangeColsArr.push(orangeColour[1]);
    orangeColsArr.push(orangeColour[2]);
    orangeColsArr.push(1.0);

  }

  let orangeColors: Float32Array = new Float32Array(orangeColsArr);
  let orangTransform1: Float32Array = new Float32Array(orangeTrans1Arr);
  let orangTransform2: Float32Array = new Float32Array(orangeTrans2Arr);
  let orangTransform3: Float32Array = new Float32Array(orangeTrans3Arr);
  let orangTransform4: Float32Array = new Float32Array(orangeTrans4Arr);

  orangeMesh.setInstanceVBOs(orangeColors, orangTransform1, orangTransform2, orangTransform3, orangTransform4);
  orangeMesh.setNumInstances(tree.orangeTransformMats.length);





  // LEAVES

  let leafOBJ = readTextFile('./leaf.obj');
  leafMesh = new Mesh(leafOBJ, vec3.fromValues(0, 0, 0));
  leafMesh.create();

  let leafGreen01 = vec3.fromValues(149/255, 227/255, 104/255);
  let leafGreen02 = vec3.fromValues(96/255, 145/255, 68/255);
  let leafWisteria01 = vec3.fromValues(255/255, 160/255, 145/255);
  let leafWisteria02 = vec3.fromValues(222/255, 113/255, 95/255);

  let leavesColsArr = new Array();
  let leavesTrans1Arr = new Array();
  let leavesTrans2Arr = new Array();
  let leavesTrans3Arr = new Array();
  let leavesTrans4Arr = new Array();


  for (let t of tree.leafTransformMats) {
    let colorMix = vec3.create();
    let colorMix1 = vec3.create();
    let colorMix2 = vec3.create();
    let turtlePosY = Math.abs(t[8]);
    
    vec3.multiply(colorMix1, leafGreen01, vec3.fromValues(1 - turtlePosY, 1 - turtlePosY, 1 - turtlePosY));
    vec3.multiply(colorMix2, leafGreen02, vec3.fromValues(turtlePosY, turtlePosY, turtlePosY));
    vec3.add(colorMix, colorMix1, colorMix2);
    let colorMix3 = vec3.create();
    let colorMix4 = vec3.create();
    let colorMix5 = vec3.create();
    
    vec3.multiply(colorMix3, leafWisteria01, vec3.fromValues(1 - turtlePosY, 1 - turtlePosY, 1 - turtlePosY));
    vec3.multiply(colorMix4, leafWisteria02, vec3.fromValues(turtlePosY, turtlePosY, turtlePosY));
    
    vec3.add(colorMix5, colorMix3, colorMix4);
    vec3.lerp(colorMix, colorMix5, colorMix , wisteria);

    // let branchColourW = vec3.fromValues(0.447, 0.513, 0.498);
    // let branchColourB = vec3.fromValues(0.458, 0.372, 0.282);
    // let branchColour = vec3.create();
    // vec3.lerp(branchColour, branchColourB, branchColourW, wisteria);
  
    for (let i = 0; i < 4; ++i) {
      leavesTrans1Arr.push(t[i]); // 0, 1, 2, 3
      leavesTrans2Arr.push(t[4 + i]); // 4, 5, 6, 7
      leavesTrans3Arr.push(t[8 + i]); // 8, 9, 10, 11
    }
    for (let i = 0; i < 3; ++i) {
      leavesTrans4Arr.push(t[12 + i]); // 12, 13, 14, 15
    }
    leavesTrans4Arr.push(1); // 16

    leavesColsArr.push(colorMix[0]);
    leavesColsArr.push(colorMix[1]);
    leavesColsArr.push(colorMix[2]);
    leavesColsArr.push(1);

  }

  let leavesColors: Float32Array = new Float32Array(leavesColsArr);
  let leavesTransform1: Float32Array = new Float32Array(leavesTrans1Arr);
  let leavesTransform2: Float32Array = new Float32Array(leavesTrans2Arr);
  let leavesTransform3: Float32Array = new Float32Array(leavesTrans3Arr);
  let leavesTransform4: Float32Array = new Float32Array(leavesTrans4Arr);


  leafMesh.setInstanceVBOs(leavesColors, leavesTransform1, leavesTransform2, leavesTransform3, leavesTransform4);
  leafMesh.setNumInstances(tree.leafTransformMats.length);


  // FLOOR
  let floorOBJ = readTextFile('./floor.obj');
  floorMesh = new Mesh(floorOBJ, vec3.fromValues(0, 0, 0));
  floorMesh.create();


  let floorColsArr = new Array();
  let floorTrans1Arr = new Array();
  let floorTrans2Arr = new Array();
  let floorTrans3Arr = new Array();
  let floorTrans4Arr = new Array();

  let floorCol = vec3.fromValues(0.439, 0.717, 0.4);

  floorTrans1Arr.push(1);
  floorTrans1Arr.push(0);
  floorTrans1Arr.push(0);
  floorTrans1Arr.push(0);

  floorTrans2Arr.push(0);
  floorTrans2Arr.push(1);
  floorTrans2Arr.push(0);
  floorTrans2Arr.push(0);

  floorTrans3Arr.push(0);
  floorTrans3Arr.push(0);
  floorTrans3Arr.push(1);
  floorTrans3Arr.push(0);

  floorTrans4Arr.push(0);
  floorTrans4Arr.push(0);
  floorTrans4Arr.push(0);
  floorTrans4Arr.push(1);

  floorColsArr.push(floorCol[0]);
  floorColsArr.push(floorCol[1]);
  floorColsArr.push(floorCol[2]);
  floorColsArr.push(1);

  let floorColors: Float32Array = new Float32Array(floorColsArr);
  let floorTransform1: Float32Array = new Float32Array(floorTrans1Arr);
  let floorTransform2: Float32Array = new Float32Array(floorTrans2Arr);
  let floorTransform3: Float32Array = new Float32Array(floorTrans3Arr);
  let floorTransform4: Float32Array = new Float32Array(floorTrans4Arr);

  floorMesh.setInstanceVBOs(floorColors, floorTransform1, floorTransform2, floorTransform3, floorTransform4);
  floorMesh.setNumInstances(1);


}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'expansionIteration', 1, 10).step(1);
  gui.add(controls, 'age', 0, 1).step(0.1);
  gui.add(controls, 'branchRotation', 20, 70).step(2);
  gui.add(controls, 'numOranges', 0., 2.).step(0.1);
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene(controls.expansionIteration, controls.age, controls.branchRotation, controls.numOranges);

  // const camera = new Camera(vec3.fromValues(60, 10, 30), vec3.fromValues(0, 25, 0));
  const camera = new Camera(vec3.fromValues(45, 15, 70), vec3.fromValues(10, 25, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST)
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if (controls.expansionIteration != prevExpansionIteration
      || controls.age != prevAge
      || controls.branchRotation != prevBranchRotation
      || controls.numOranges != prevNumOranges) {
      loadScene(controls.expansionIteration, controls.age, controls.branchRotation, controls.numOranges);
      prevExpansionIteration = controls.expansionIteration;
      prevAge = controls.age;
      prevBranchRotation = controls.branchRotation;
      prevNumOranges = controls.numOranges;
    }
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
      branchMesh,
      leafMesh,
      floorMesh,
      orangeMesh
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
