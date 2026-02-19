// Simple client-side human/AI heuristic
export const isHumanName = (name?: string) => {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  if (n.length < 2) return false;
  if (/bot|ai|automaton|robot/.test(n)) return false;
  if (/\d{6,}/.test(n)) return false; // long digit sequences
  return true;
};

export default { isHumanName };
