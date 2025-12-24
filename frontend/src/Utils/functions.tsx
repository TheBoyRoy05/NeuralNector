export const scrollTo = (id: string, offset: number = 0) => {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
  }
};

export const getDifficultyName = (boardSize: number): string => {
  if (boardSize === 2) return "Easy";
  if (boardSize === 4) return "Normal";
  if (boardSize === 6) return "Hard";
  if (boardSize === 8) return "Impossible";
  return "Normal";
};

export const getDeviceType = (): string => {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 600) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};