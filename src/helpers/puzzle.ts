export function getOffset(selector: string | null) {
  if (!selector) return null;
  const element = document.querySelector(selector);
  if (!element) throw new Error('Wrapper element not found');
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

export function getChildrenPaths(
  currentSuze: number,
  x: number,
  y: number,
): string[] {
  const result: string[] = [];
  const step = currentSuze;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const xPosition = x * step + i * (step / 2);
      const yPosition = y * step + j * (step / 2);
      result.push(`${xPosition}~${yPosition}`);
    }
  }
  return result;
}
