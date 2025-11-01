const reverseWords = function(jewels, stones) {
  let amountOfStoneJewels = 0;

  for (let i = 0; i < stones.length; i++) {
    if (jewels.includes(stones[i])) {
      amountOfStoneJewels++;
    }
  }

  return amountOfStoneJewels;
};

console.log(reverseWords("aA", "aAAbbbb"));
