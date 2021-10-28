
class DrawingRule {
  ruleProbMap: Map<any, number>;

  // maps drawing rule function to a probability. 
  constructor(ruleProbMap: Map<any, number>) {
    this.ruleProbMap = ruleProbMap;
  }

  getDrawingFunc(): any {
    let probSum = 0;
    for (let [rule, probability] of this.ruleProbMap) {
      let rand = Math.random();
      probSum += probability;
      if (rand < probSum) {
        return rule;
      }
    }
    return null;
  }

};

export default DrawingRule;
