// Storage keys
const FAVORITES_KEY = 'kinetix_public_favorites';
const RECENTLY_VIEWED_KEY = 'kinetix_public_recently_viewed';

const MAX_RECENT_ITEMS = 10;

// --- Favorites ---

export const getFavorites = () => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading favorites from localStorage', e);
    return [];
  }
};

export const addFavorite = (item) => {
  const favorites = getFavorites();
  // Ensure no duplicates by ID and Type
  if (!favorites.find(f => f.id === item.id && f.type === item.type)) {
    const updated = [item, ...favorites];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  }
  return favorites;
};

export const removeFavorite = (itemId, itemType) => {
  const favorites = getFavorites();
  const updated = favorites.filter(f => !(f.id === itemId && f.type === itemType));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

export const isFavorite = (itemId, itemType) => {
  const favorites = getFavorites();
  return favorites.some(f => f.id === itemId && f.type === itemType);
};

// --- Recently Viewed ---

export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading recently viewed from localStorage', e);
    return [];
  }
};

export const addRecentlyViewed = (item) => {
  let recent = getRecentlyViewed();
  
  // Remove if it already exists so we can move it to the front
  recent = recent.filter(r => !(r.id === item.id && r.type === item.type));
  
  // Add to front
  recent.unshift(item);
  
  // Cap the size
  if (recent.length > MAX_RECENT_ITEMS) {
    recent = recent.slice(0, MAX_RECENT_ITEMS);
  }
  
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
  return recent;
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
  return [];
};
