
class ExpansionRule {
  ruleProbMap: Map<string, number>;

  // maps an expansion rule to a probability.
  constructor(ruleProbMap: Map<string, number>) {
    this.ruleProbMap = ruleProbMap;
  }

  getExpansion(): string {
    let probSum = 0;
    for (let [rule, probability] of this.ruleProbMap) {
      let rand = Math.random();
      probSum += probability;
      if (rand < probSum) {
        return rule;
      }
    }
    return "";
  }

};

export default ExpansionRule;
