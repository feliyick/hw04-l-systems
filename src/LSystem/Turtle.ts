import { vec3, vec4, mat4, glMatrix } from 'gl-matrix';


class Turtle {
  position: vec4;
  depth: number;
  forward: vec4;
  right: vec4;
  up: vec4;
  growingLeaves: boolean = false;

  trunkDepth: number;

  constructor(pos: vec4, forward: vec4, right: vec4, up: vec4, depth: number) {
    this.position = pos;
    this.depth = depth;
    this.forward = forward;
    this.right = right;
    this.up = up;
    this.trunkDepth = 0;
  }

  copy(): Turtle {
    let posCopy = vec4.create();
    let forwardCopy = vec4.create();
    let upCopy = vec4.create();
    let rightCopy = vec4.create();

    vec4.copy(posCopy, this.position);
    vec4.copy(forwardCopy, this.forward);
    vec4.copy(upCopy, this.up);
    vec4.copy(rightCopy, this.right);

    return new Turtle(posCopy, forwardCopy, rightCopy, upCopy, this.depth)
  }

  resetTrunkDepth() {
    this.trunkDepth = 0;
  }

  getPosition(): vec4 {
    return vec4.fromValues(this.position[0], this.position[1], this.position[2], this.position[3]);
  }


  getDepth(): number {
    return this.depth;
  }

  getForward(): vec4 {
    return vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], this.forward[3]);
  }

  getUp(): vec4 {
    return vec4.fromValues(this.up[0], this.up[1], this.up[2], this.up[3]);
  }

  getRight(): vec4 {
    return vec4.fromValues(this.right[0], this.right[1], this.right[2], this.right[3]);
  }


  increaseDepth(incr: number) {
    this.depth += 1;
  }

  increaseTrunkDepth(incr: number) {
    this.trunkDepth += 1;
  }

  moveForward(amt: number) {
    this.position[0] = this.position[0] + amt * this.forward[0];
    this.position[1] = this.position[1] + amt * this.forward[1];
    this.position[2] = this.position[2] + amt * this.forward[2];

  }


  rotateUp(angle: number) {
    let rotMat = mat4.create();
    let rad = glMatrix.toRadian(angle);
    let axis = vec3.fromValues(this.up[0], this.up[1], this.up[2]);
    mat4.fromRotation(rotMat, rad, axis);
    vec4.normalize(this.right, vec4.transformMat4(this.right, this.right, rotMat));
    vec4.normalize(this.forward, vec4.transformMat4(this.forward, this.forward, rotMat));
  }

  rotateRight(angle: number) {
    let rotMat = mat4.create();
    let rad = glMatrix.toRadian(angle);
    let axis = vec3.fromValues(this.right[0], this.right[1], this.right[2]);
    mat4.fromRotation(rotMat, rad, axis);
    vec4.normalize(this.forward, vec4.transformMat4(this.forward, this.forward, rotMat));
    vec4.normalize(this.up, vec4.transformMat4(this.up, this.up, rotMat));
  }

  rotateForward(angle: number) {
    let rotMat = mat4.create();
    let rad = glMatrix.toRadian(angle);
    let axis = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
    mat4.fromRotation(rotMat, rad, axis);
    vec4.normalize(this.right, vec4.transformMat4(this.right, this.right, rotMat));
    vec4.normalize(this.up, vec4.transformMat4(this.up, this.up, rotMat));
  }

  // https://math.stackexchange.com/questions/1870661/find-angle-between-two-coordinate-systems
  getRotationMatrix() : mat4 {
    let baseDirection: vec3 = vec3.fromValues(0, 1, 0);
    let forwardDir: vec3 = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
    let rotAxis = vec3.create();
    vec3.cross(rotAxis, baseDirection, forwardDir);
    let theta = Math.acos(vec3.dot(baseDirection, forwardDir) / (vec3.length(baseDirection) * vec3.length(forwardDir)));
    let rotMatrix = mat4.create();
    mat4.fromRotation(rotMatrix, theta, rotAxis);

    return rotMatrix;   
}

  getTranslationMatrix(): mat4 {
    let translation: vec4 = vec4.fromValues(this.position[0], this.position[1], this.position[2], this.position[3]);
    let identity = mat4.create();
    let transMat = mat4.create();
    mat4.identity(identity);
    mat4.translate(transMat, identity, vec3.fromValues(translation[0], translation[1], translation[2]));
    return transMat;
  }

  getScaleMatrix(): mat4 {
    let x =  1 / (this.depth);
    let z = 1 / (this.depth);
    let matrix = mat4.create();
    mat4.fromScaling(matrix, vec3.fromValues(x, 1.0, z))
    return matrix;
  }

  getTransformMat(): mat4 {
    let transform = mat4.create();
    mat4.multiply(transform, this.getTranslationMatrix(), this.getRotationMatrix());
    mat4.multiply(transform, transform, this.getScaleMatrix());
    return transform;
  }

};

export default Turtle;
