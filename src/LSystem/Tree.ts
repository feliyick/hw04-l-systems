import {vec3, vec4, mat4, quat, glMatrix} from 'gl-matrix';
import Turtle from './Turtle';
import TurtleStack from './TurtleStack'
import ExpansionRule from './ExpansionRule'
import DrawingRule from './DrawingRule'
import LSystem from './LSystem';
import * as ran from 'ranjs';
/**
 * ORIENTATION AXES
 * Forward: (0, 1, 0, 0)
 * Right: (1, 0, 0, 0)
 * Up: (0, 0, 1, 0)
 * 
 * RULE SET
 * F : Move forward
 * X : Sub rule; Small bush of leaves
 * A : Main rule; trunk etc.
 * r : + rotate about local right x
 * u : + rotate about local up y
 * f : + rotate about local forward z
 * a : - rotate about local right x
 * b : - rotate about local up y
 * c : - rotate about local forward z
 * [ : save turtle position
 * ] : reset to previous saved position
 * v : spawn leaf
 * g : rotate randomly
 * O : spawm orange
 */

class Tree {

    lsystem : LSystem = new LSystem("FFFAFA") 
    depth : number;
    FExpand : ExpansionRule;
    AExpand : ExpansionRule;
    saveExpand : ExpansionRule;
    resetExpand : ExpansionRule;
    rExpand : ExpansionRule;
    uExpand : ExpansionRule;
    fExpand : ExpansionRule;
    aExpand : ExpansionRule;
    bExpand : ExpansionRule;
    cExpand : ExpansionRule;
    vExpand : ExpansionRule;
    gExpand : ExpansionRule;
    XExpand : ExpansionRule;
    OExpand : ExpansionRule;

    FDraw : DrawingRule;
    ADraw : DrawingRule;
    resetDraw : DrawingRule;
    saveDraw : DrawingRule;
    rRotate : DrawingRule;
    uRotate : DrawingRule;
    fRotate : DrawingRule;
    aRotate : DrawingRule;
    bRotate : DrawingRule;
    cRotate : DrawingRule;
    vLeaf : DrawingRule;
    gRotate : DrawingRule;
    XDraw : DrawingRule;
    ODraw : DrawingRule;

    transformMats : Array<mat4> = new Array();
    leafTransformMats : Array<mat4> = new Array();
    orangeTransformMats : Array<mat4> = new Array();
    positions : Array<vec4> = new Array();
    rotations : Array<vec4> = new Array();
    scales : Array<vec3> = new Array();
    branchRotation: number;
    wisteria: number;
    numOranges: number;

    constructor(depth : number, branchRotation: number, wisteria: number, numOranges: number) {
        this.depth = depth; 
        this.branchRotation = branchRotation;
        this.wisteria = wisteria;
        this.numOranges = numOranges;
        
        let FMap = new Map([["F", 0.7], ["FF", 0.25], ["Fg", 0.05]]);
        this.FExpand = new ExpansionRule(FMap);
//["FFFF[+FFLXL]FF[#FFXLA]FLFL[$FFLXL]FF[-FFLXL]FFXLA"
        let AMap = new Map([["F[ugFfAv]cfXg[bfgFAO]Xv", 1.]]);

        // let AMap = new Map([["F[ugFfAv]cfXg[bfgFAv]Xv", 1.]]);
        // let AMap = new Map([["FFF[rFFvAv]FF[rFFAv]FvFv[aFFv]FF[bFFv]FFAv", 1.]]);

        // let AMap = new Map([["[uFAv]F[ffgaFAv]F[aarrFFAv][gbbFAv]Fv", 1.]]);

        //FFFF[+FFXL]F[#FFXL]F[$FFXL]F[-FFXL]FXL
        // let AMap = new Map([["FF[bFA]ugF[cFgFA][FagFbg][gcF[uugv][aAgv]]", 0.5], ["FF[cA]uF[raaFcgA][Frbb][cbF[ggv][fbAv]]", 0.5]]);
        this.AExpand = new ExpansionRule(AMap);

        let XMap = new Map([["[uugv][bfgv][fcgv]", 1.]])
        this.XExpand = new ExpansionRule(XMap);

        let saveMap = new Map([["[", 1.0]]);
        this.saveExpand = new ExpansionRule(saveMap);

        let resetMap = new Map([["]", 1.0]]);
        this.resetExpand = new ExpansionRule(resetMap);

        let rMap = new Map([["r", 1.0]]);
        this.rExpand = new ExpansionRule(rMap);

        let uMap = new Map([["u", 1.0]]);
        this.uExpand = new ExpansionRule(uMap);

        let fMap = new Map([["f", 1.0]]);
        this.fExpand = new ExpansionRule(fMap);

        let aMap = new Map([["a", 1.0]]);
        this.aExpand = new ExpansionRule(aMap);

        let bMap = new Map([["b", 1.0]]);
        this.bExpand = new ExpansionRule(bMap);

        let cMap = new Map([["c", 1.0]]);
        this.cExpand = new ExpansionRule(cMap);

        let vMap = new Map([["v", 1.0]]);
        this.vExpand = new ExpansionRule(vMap);

        let gMap = new Map([["g", 1.0]]);
        this.gExpand = new ExpansionRule(gMap);

        let OMap = new Map([["O", 1.0]]);
        this.OExpand = new ExpansionRule(OMap);

        this.lsystem.addExpansionRule("F", this.FExpand);
        this.lsystem.addExpansionRule("A", this.AExpand);
        this.lsystem.addExpansionRule("[", this.saveExpand);
        this.lsystem.addExpansionRule("]", this.resetExpand);
        this.lsystem.addExpansionRule("r", this.rExpand);
        this.lsystem.addExpansionRule("u", this.uExpand);
        this.lsystem.addExpansionRule("f", this.fExpand);
        this.lsystem.addExpansionRule("a", this.aExpand);
        this.lsystem.addExpansionRule("b", this.bExpand);
        this.lsystem.addExpansionRule("c", this.cExpand);
        this.lsystem.addExpansionRule("v", this.vExpand);
        this.lsystem.addExpansionRule("g", this.gExpand);
        this.lsystem.addExpansionRule("X", this.XExpand);
        this.lsystem.addExpansionRule("O", this.OExpand);
    }

    drawLine() {
            if (this.lsystem.turtle.growingLeaves) {
                this.leafTransformMats.push(this.lsystem.turtle.getTransformMat());
                this.transformMats.push(this.lsystem.turtle.getTransformMat());
            } else {
                this.transformMats.push(this.lsystem.turtle.getTransformMat());
            }
            
            this.lsystem.turtle.moveForward(0.7);
            this.lsystem.turtle.increaseTrunkDepth(0.7);
    }

    moveDownwards() {
        this.lsystem.turtle.forward = vec4.fromValues(0, -1, 0, 0);
        for(let i = 0; i < 2; i++) {
            this.lsystem.turtle.moveForward(0.6);
        }
    }

    drawO() {
        let p = this.numOranges * this.wisteria/ 10. * Math.max(1.0 - this.depth, 1.0);
        if (this.lsystem.turtle.getDepth() < 6) {
            p = 0.0;
            return;
        }
        let probability = Math.random();
        if (probability < p) {
            // draw 6 leaves with random rotation 
            let transformation = mat4.create();
            let trans =  this.lsystem.turtle.getTranslationMatrix();
            let rot = this.lsystem.turtle.getRotationMatrix();
            let identity = mat4.create();
            mat4.identity(identity);
            let altRot = mat4.create();
            mat4.rotateX(altRot, identity, Math.random() * 10);
            mat4.rotateY(altRot, altRot, Math.random() * 10);
            mat4.rotateZ(altRot, altRot, Math.random() * 10);
            
            mat4.multiply(transformation, trans, rot);
            mat4.multiply(transformation, transformation, altRot);
            this.orangeTransformMats.push(transformation);
            // this.moveDownwards();
        }
    }

    drawV() {
        let p = 0.8 * Math.max(1.0 - this.depth, 1.0);
        if (this.lsystem.turtle.getDepth() < 6) {
            p = 0.0;
            return;
        }
        let probability = Math.random();
        if (probability < p) {
            // draw 6 leaves with random rotation 
            let numLeaves = 1 + Math.floor(6 * Math.random());
            for (var i = 0; i < numLeaves; i++) {
                let transformation = mat4.create();
                let trans =  this.lsystem.turtle.getTranslationMatrix();
                let rot = this.lsystem.turtle.getRotationMatrix();
                let identity = mat4.create();
                mat4.identity(identity);
                let altRot = mat4.create();
                mat4.rotateX(altRot, identity, Math.random() * 10 * (i + 1));
                mat4.rotateY(altRot, altRot, Math.random() * 10 * (i + 1));
                mat4.rotateZ(altRot, altRot, Math.random() * 10 * (i + 1));
                
                mat4.multiply(transformation, trans, rot);
                mat4.multiply(transformation, transformation, altRot);

                this.leafTransformMats.push(transformation);
                this.moveDownwards();
            }
        }
    }

    rotateR() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta += 4 * Math.random();
            this.lsystem.turtle.rotateRight(theta);
    }

    rotateU() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta += 4 * Math.random();
            this.lsystem.turtle.rotateUp(theta);
    }

    rotateF() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta += 4 * Math.random();
            this.lsystem.turtle.rotateForward(theta);
    }

    rotateA() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta -= 4 * Math.random();
            this.lsystem.turtle.rotateRight(-theta);
    }

    rotateB() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta -= 4 * Math.random();
            this.lsystem.turtle.rotateUp(-theta);
    }

    rotateC() {
            let theta: number = this.branchRotation / (0.5 * this.lsystem.turtle.depth);
            theta -= 4 * Math.random();
            this.lsystem.turtle.rotateForward(-theta);
    }


    resetTurtle() {
        this.lsystem.resetTurtle();
    }

    rotateRandom() {
        let randR: number = Math.pow(-1, Math.floor(Math.random() + 0.5)) * 4.3 * Math.random();
        let randU: number = Math.pow(-1, Math.floor(Math.random() + 0.5)) * 4.3 * Math.random();
        let randF: number = Math.pow(-1, Math.floor(Math.random() + 0.5)) * 4.3 * Math.random();

        randR *= Math.min(this.lsystem.turtle.getDepth(), this.branchRotation);
        randU *= Math.min(this.lsystem.turtle.getDepth(), this.branchRotation);
        randF *= Math.min(this.lsystem.turtle.getDepth(), this.branchRotation);

        this.lsystem.turtle.rotateRight(randR);
        this.lsystem.turtle.rotateUp(randU);
        this.lsystem.turtle.rotateForward(randF);
    }

    saveTurtle() {
        this.lsystem.saveTurtle();
        
        let pLeaf = 0.5;
        let rand = Math.random();
        if (rand < pLeaf && this.lsystem.turtle.depth > 6) {
            this.lsystem.turtle.growingLeaves = true;
        }

        this.lsystem.turtle.increaseDepth(1); 
        this.lsystem.turtle.trunkDepth = 1.;
    }

    setDrawRules() {
        let FMap = new Map([[this.drawLine.bind(this), 1.0]]);
        this.FDraw = new DrawingRule(FMap);

        let AMap = new Map([[this.drawLine.bind(this), 1.0]]);
        this.ADraw = new DrawingRule(AMap);

        let resetMap = new Map([[this.resetTurtle.bind(this), 1.0]]);
        this.resetDraw = new DrawingRule(resetMap);

        let saveMap = new Map([[this.saveTurtle.bind(this), 1.0]]);
        this.saveDraw = new DrawingRule(saveMap);

        let rMap = new Map([[this.rotateR.bind(this), 1.0]]);
        this.rRotate = new DrawingRule(rMap);
        
        let uMap = new Map([[this.rotateU.bind(this), 1.0]]);
        this.uRotate = new DrawingRule(uMap);

        let fMap = new Map([[this.rotateF.bind(this), 1.0]]);
        this.fRotate = new DrawingRule(fMap);

        let aMap = new Map([[this.rotateA.bind(this), 1.0]]);
        this.aRotate = new DrawingRule(aMap);
        
        let bMap = new Map([[this.rotateB.bind(this), 1.0]]);
        this.bRotate = new DrawingRule(bMap);

        let cMap = new Map([[this.rotateC.bind(this), 1.0]]);
        this.cRotate = new DrawingRule(cMap);

        let vMap = new Map([[this.drawV.bind(this), 1.0]]);
        this.vLeaf = new DrawingRule(vMap);

        let gMap = new Map([[this.rotateRandom.bind(this), 1.0]]);
        this.gRotate = new DrawingRule(gMap);

        let XMap = new Map([[this.drawLine.bind(this), 1.0]]);
        this.XDraw = new DrawingRule(XMap);

        let OMap = new Map([[this.drawO.bind(this), 1.0]]);
        this.ODraw = new DrawingRule(OMap);

    
        this.lsystem.addDrawingRule("F", this.FDraw);
        this.lsystem.addDrawingRule("A", this.ADraw);
        this.lsystem.addDrawingRule("]", this.resetDraw);
        this.lsystem.addDrawingRule("[", this.saveDraw);
        this.lsystem.addDrawingRule("r", this.rRotate);
        this.lsystem.addDrawingRule("u", this.uRotate);
        this.lsystem.addDrawingRule("f", this.fRotate);
        this.lsystem.addDrawingRule("a", this.aRotate);
        this.lsystem.addDrawingRule("b", this.bRotate);
        this.lsystem.addDrawingRule("c", this.cRotate);
        this.lsystem.addDrawingRule("v", this.vLeaf);
        this.lsystem.addDrawingRule("g", this.gRotate);
        this.lsystem.addDrawingRule("X", this.XDraw);
        this.lsystem.addDrawingRule("O", this.ODraw);
    }

    build() {
        this.setDrawRules();
        this.lsystem.expandString(this.lsystem.axiom, this.depth);
        this.lsystem.drawString();
    }
};

export default Tree;