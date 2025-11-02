export function shuffleList(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Partitions the specified array based on the predicate
 *
 * @param array
 * @param predicate
 * @returns [passArray, failArray]
 */
export function partition<T>(
  array: T[],
  predicate: (element: T) => boolean
): [T[], T[]] {
  return array.reduce(
    (arrays, element) => {
      if (predicate(element)) {
        arrays[0].push(element);
        return arrays;
      }
      arrays[1].push(element);
      return arrays;
    },
    [[], []] as [T[], T[]]
  );
}
