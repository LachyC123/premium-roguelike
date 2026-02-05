const SAVE_KEY = "premium-roguelike-save";

export function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return { currency: 0 };
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse save data", error);
    return { currency: 0 };
  }
}

export function saveRun(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    currency: data.currency ?? 0,
  }));
}
