import Turtle from './Turtle';


class TurtleStack {
    stack: Array<Turtle> = new Array();

    constructor() { }

    push(t: Turtle) {
        let newTurt = t.copy();
        this.stack.push(newTurt)
    }

    pop(): Turtle {
        let poppedTurt = this.stack.pop();
        return poppedTurt;
    }


    peek(): Turtle {
        return this.stack[this.stack.length - 1];
    }

};

export default TurtleStack;
