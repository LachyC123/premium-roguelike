export function createRng(seed = Date.now()) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return {
    next() {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}
