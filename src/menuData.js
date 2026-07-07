import { menuData } from '../menu-data';

export const CUISINES = ['North Indian', 'South Indian', 'Unified'];
export const MESS_TYPES = ['Veg', 'Non-Veg'];
export const WEEKS = ['A', 'B', 'C', 'D'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const database = {};

// Initialize structure
for (const week of WEEKS) {
  database[week] = {};
  for (const day of DAYS) {
    database[week][day] = {
      "North Indian": { "Veg": {}, "Non-Veg": {} },
      "South Indian": { "Veg": {}, "Non-Veg": {} },
      "Unified": { "Veg": {}, "Non-Veg": {} }
    };
  }
}

// Map root menuData keys to (cuisine, messType)
const mapping = {
  northVeg: { cuisine: "North Indian", messType: "Veg" },
  northNonVeg: { cuisine: "North Indian", messType: "Non-Veg" },
  southVeg: { cuisine: "South Indian", messType: "Veg" },
  southNonVeg: { cuisine: "South Indian", messType: "Non-Veg" },
  unifiedVeg: { cuisine: "Unified", messType: "Veg" },
  unifiedNonVeg: { cuisine: "Unified", messType: "Non-Veg" }
};

for (const [key, mapInfo] of Object.entries(mapping)) {
  const menuSource = menuData[key];
  if (!menuSource || !menuSource.weeks) continue;
  
  for (const [week, days] of Object.entries(menuSource.weeks)) {
    if (!database[week]) continue;
    for (const [day, meals] of Object.entries(days)) {
      if (!database[week][day]) continue;
      
      // Make sure the structure under the specific cuisine and mess type matches:
      // { Breakfast: [...], Lunch: [...], Snacks: [...], Dinner: [...] }
      database[week][day][mapInfo.cuisine][mapInfo.messType] = {
        Breakfast: meals.Breakfast || [],
        Lunch: meals.Lunch || [],
        Snacks: meals.Snacks || meals.Snack || [],
        Dinner: meals.Dinner || []
      };
    }
  }
}

export const getMenu = (week, day, cuisine, messType) => {
  if (!database[week] || !database[week][day] || !database[week][day][cuisine]) {
    return null;
  }
  
  const menu = database[week][day][cuisine][messType] || database[week][day][cuisine]["Veg"];
  return menu;
};

export const searchMeals = (query) => {
  if (!query || query.trim() === '') return [];
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  for (const week of WEEKS) {
    for (const day of DAYS) {
      for (const cuisine of CUISINES) {
        for (const messType of MESS_TYPES) {
          const menu = getMenu(week, day, cuisine, messType);
          if (!menu) continue;

          for (const [mealName, items] of Object.entries(menu)) {
            if (!items || !Array.isArray(items)) continue;
            
            const matchingItem = items.find(item => item.toLowerCase().includes(normalizedQuery));
            if (matchingItem) {
              results.push({
                week,
                day,
                cuisine,
                messType,
                mealName,
                matchingItem,
                items
              });
            }
          }
        }
      }
    }
  }

  // Deduplicate identical matches
  const seen = new Set();
  const deduped = [];
  for (const item of results) {
    const key = `${item.week}-${item.day}-${item.cuisine}-${item.mealName}-${item.matchingItem}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  return deduped;
};
