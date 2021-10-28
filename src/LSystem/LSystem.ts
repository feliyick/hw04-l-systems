import { vec3, vec4 } from 'gl-matrix';
import Turtle from './Turtle';
import TurtleStack from './TurtleStack';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';

class LSystem {
  turtleStack: TurtleStack = new TurtleStack();
  turtle: Turtle = new Turtle(vec4.fromValues(0, 0, 0, 1), vec4.fromValues(0, 1, 0, 0), vec4.fromValues(1, 0, 0, 0), vec4.fromValues(0, 0, 1, 0), 1);
  expansionRules: Map<string, ExpansionRule> = new Map();
  drawingRules: Map<string, DrawingRule> = new Map();
  finalString: string = "";
  axiom: string;

  constructor(axiom: string) {
    this.axiom = axiom;
  }

  addExpansionRule(char: string, rule: ExpansionRule) {
    this.expansionRules.set(char, rule);
  }

  addDrawingRule(char: string, rule: DrawingRule) {
    this.drawingRules.set(char, rule);
  }

  saveTurtle() {
    this.turtleStack.push(this.turtle);
  }
  
  resetTurtle() {
    this.turtle = this.turtleStack.pop();
  }

  setCurrTurtle(t: Turtle) {
    this.turtle = t;
  }


  expandString(currString: string, iteration: number): string {
    for (let i = 0; i < iteration; ++i) {
      let newString = "";
      for (let c of currString) {
        let rule = this.expansionRules.get(c).getExpansion();
        newString += rule;
      }
      currString = newString;
    }
    this.finalString = currString;
    return currString;
  }

  drawString() {
    for (let c of this.finalString) {
      let draw = this.drawingRules.get(c).getDrawingFunc();
      if (draw) {
        draw();
        
      }
    }
  }
};

export default LSystem;
