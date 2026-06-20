# parse_to_json.py
import os
import glob
import re
import json

days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

# User provided North Indian Mess Menu data
# Stored as raw string lists. Columns: Day -> Menu A&C / Menu B&D for Breakfast, Lunch, Dinner
north_indian_raw = {
    "A": {
        "Monday": {
            "Breakfast": "Mango Jam, Boiled Egg, Omelette/Oats, Peanut Chutney, Tamarind Chutney, Jalebi",
            "Lunch": "Rice, Chapati, Dal Makhani, Gobi Aloo Masala, Chole Curry Dry",
            "Dinner": "Rice, Phulka, Chana Dal, Malai Kofta, Banana Kofta, Boondi"
        },
        "Tuesday": {
            "Breakfast": "Mixed Fruit Jam, Boiled Egg/Chocos, Ragi Dosa, Kachori, Imli Chutney, Aloo Sabji",
            "Lunch": "Rice, Phulka, Dal Masoor, Bhindi Aloo Bhujia, Mixed Dal, Chana Masala",
            "Dinner": "Veg Fried Rice, Chapati, Tomato Dal, Veg Manchurian, Mixed Fruit, Buttermilk"
        },
        "Wednesday": {
            "Breakfast": "Mango Jam, Boiled Egg Chana, Omelette/Oats, Pav Bhaji Masala, Aloo Bonda",
            "Lunch": "Rice, Phulka, Dal (Rajma), Chole (Peshawari), Aloo Baigan Tamatar Masala",
            "Dinner": "Rice, Phulka, Mixed Dal, Kadai Paneer, Cabbage (Peas), Papaya, Orange, Lemon Juice"
        },
        "Thursday": {
            "Breakfast": "Mango Jam, Boiled Egg Sprouts, Omelette/Oats, Boiled Egg, Coconut Chilla, Moong Dal Chilla, Tomato + Onion Chutney",
            "Lunch": "Rice, Phulka, Dal (Arhar), Cabbage Peas Sabji, Mixed Chilli Dal, Fried Chilli",
            "Dinner": "Methi Puri, Aloo Methi, Black Chana, Rasam, Sabudana Kheer"
        },
        "Friday": {
            "Breakfast": "Mix Fruit Jam, Milk, Fried Egg/Oats, Stuffed Kulcha, Coconut Chutney",
            "Lunch": "Rice, Phulka, Dal, Karela Fry, Mixed Veg Aloo Sabji (Gravy)",
            "Dinner": "Chapati, Dal Fry, Soya Chunk Curry, Watermelon, Buttermilk"
        },
        "Saturday": {
            "Breakfast": "Pineapple Jam, Boiled Egg/Chocos, Mango Dalia, Plain Curd, Green Chutney",
            "Lunch": "Rice, Green Methi Paratha, Mixed Dal, Aloo 65, Ridge Gourd Chana Masala",
            "Dinner": "Phulka, Mixed Dal, Tawa Mix Veg Sabzi, Banana, Milk + Boost"
        },
        "Sunday": {
            "Breakfast": "Mango Jam, Boiled Egg, Boiled Egg/Oats, Onion Uttapam/Plain Dosa, Mix Veg Sambar, Onion Tomato Chutney",
            "Lunch": "Rice, Veg Hyderabadi Biryani, Phulka, Dal, Raita, Onion + Lemon Salad, Paneer Butter Masala, Ice Cream, Shahi Tukda",
            "Dinner": "Moong Dal, Cucumber, Mixed Fruit Salad, Lemon Juice"
        }
    },
    "B": {
        "Monday": {
            "Breakfast": "Pineapple Jam, Boiled Egg, Fried Cornflakes, Poha, Jalebi, Tamarind Chutney",
            "Lunch": "Rice, Phulka, Dal (Moong), Jeera Aloo, Kadi Pakoda",
            "Dinner": "Rice, Phulka, Chana Dal, Baingan Dry, Rice Kheer"
        },
        "Tuesday": {
            "Breakfast": "Pineapple Jam, Boiled Egg Sprouts, Omelette/Oats, Idli, Aloo Dum",
            "Lunch": "Rice, Phulka, Dal Masoor, Bhindi Do Pyaza, Gheugni",
            "Dinner": "Peas Pulao, Phulka, Tomato Dal, Vegetable Kofta, Mixed Fruit, Buttermilk"
        },
        "Wednesday": {
            "Breakfast": "Pineapple Jam, Boiled Egg Cornflakes, Fried Egg/Oats, Idli Sambar, Mixed Veg Sambar, Coconut Chutney",
            "Lunch": "Rice, Phulka, Sweet Lassi, Aloo Jeera Sabzi, Gatte Ki Sabzi",
            "Dinner": "Rice, Phulka, Mixed Dal, Shahi Paneer, Watermelon, Lemon Juice"
        },
        "Thursday": {
            "Breakfast": "Mixed Fruit Jam, Boiled Egg Chana, Omelette/Oats, Masala Dosa, Tomato Sauce, Coconut Chutney",
            "Lunch": "Rice, Phulka, Mushroom Peas Aloo Masala, Aloo Tindly Fry",
            "Dinner": "Phulka, Mixed Dal Fry, Chole Curry, Fruit Custard"
        },
        "Friday": {
            "Breakfast": "Mixed Fruit Jam, Boiled Egg/Chocos, Boiled Dalia, Groundnut Chutney, Drumstick Sambar",
            "Lunch": "Rice, Phulka, Chilli Paneer Dry, Kadai Mix Veg Curry",
            "Dinner": "Phulka, Tomato Dal, Soya Chunks Masala, Watermelon, Buttermilk"
        },
        "Saturday": {
            "Breakfast": "Mango/Orange Jam, Fried Egg/Oats, Beetroot Poori, Aloo Sabji, Imli Chutney",
            "Lunch": "Rice, Mixed Vegetable Khichdi, Aloo Chokha, Green Chutney, Fried Green Chilli",
            "Dinner": "Pulao, Dal Makhani, Mixed Veg Curry, Banana, Milk + Boost"
        },
        "Sunday": {
            "Breakfast": "Mango Jam, Boiled Egg Channa, Boiled Egg/Chocos, Plain Dosa, Aloo Masala, Mix Veg Sambar, Coconut Chutney",
            "Lunch": "Rice, Mixed Veg Biryani, Phulka, Dal, Onion + Lemon Salad, Paneer Butter Masala, Double Ka Meetha",
            "Dinner": "Dal Fry, Rice, Paneer Masala, Mixed Fruit Salad"
        }
    }
}

# Duplicate values for Week C and Week D as they share the menus
north_indian_raw["C"] = north_indian_raw["A"]
north_indian_raw["D"] = north_indian_raw["B"]

def find_header_and_slices(filepath):
    with open(filepath, "r") as f:
        lines = f.readlines()
        
    header_idx = -1
    header_line = None
    for i, line in enumerate(lines):
        if "monday" in line.lower() and "tuesday" in line.lower() and "sunday" in line.lower():
            header_line = line
            header_idx = i
            break
            
    if not header_line:
        return None, [0, 26, 52, 78, 106, 136, 166, 300]

    day_indices = []
    for day in days:
        day_indices.append(header_line.upper().find(day))
        
    data_lines = []
    for line in lines[header_idx+1:]:
        line_clean = line.rstrip('\n')
        if len(line_clean.strip()) < 30:
            continue
        if any(w in line_clean.upper() for w in ["LUNCH", "DINNER", "BREAKFAST", "SNACKS", "PLAIN RICE", "BREAD, BUTTER", "BUTTERMILK"]):
            continue
        data_lines.append(line_clean)
        
    max_len = max(len(l) for l in data_lines) if data_lines else 250
    
    split_points = [0]
    for j in range(len(day_indices) - 1):
        start_search = day_indices[j] + 8
        end_search = day_indices[j+1] + 4
        best_idx = (start_search + end_search) // 2
        max_spaces = -1
        for idx in range(start_search, min(end_search, max_len)):
            spaces = sum(1 for l in data_lines if idx >= len(l) or l[idx] == ' ')
            if spaces > max_spaces:
                max_spaces = spaces
                best_idx = idx
        split_points.append(best_idx)
    
    split_points.append(max_len + 50)
    return header_idx, split_points

def parse_file(filepath):
    header_info = find_header_and_slices(filepath)
    if not header_info:
        print(f"Skipping {filepath} (no header)")
        return None
        
    header_idx, split_points = header_info
    
    with open(filepath, "r") as f:
        lines = f.readlines()
        
    menu = {day: {"Breakfast": [], "Lunch": [], "Snacks": [], "Dinner": []} for day in days}
    current_meal = "Breakfast"
    common_items = {"Breakfast": [], "Lunch": [], "Snacks": [], "Dinner": []}
    
    for i, line in enumerate(lines):
        if i <= header_idx:
            continue
            
        line_clean = line.rstrip('\n')
        if not line_clean.strip():
            continue
            
        upper_line = line_clean.upper().strip()
        lower_line = line_clean.lower()
        
        # Explicit labels
        if "BREAKFAST" in upper_line and len(upper_line) < 15:
            current_meal = "Breakfast"
            continue
        elif "LUNCH" in upper_line and len(upper_line) < 15:
            current_meal = "Lunch"
            continue
        elif "SNACKS" in upper_line and len(upper_line) < 15:
            current_meal = "Snacks"
            continue
        elif "DINNER" in upper_line and len(upper_line) < 15:
            current_meal = "Dinner"
            continue
            
        # Robust transitions based on common staple items
        if "plain rice" in lower_line and "curd" in lower_line:
            current_meal = "Lunch"
        elif "buttermilk" in lower_line and "papad" in lower_line:
            current_meal = "Dinner"
        elif "tea, coffee & milk" in lower_line and not "bread" in lower_line:
            current_meal = "Snacks"
        elif "brown bread" in lower_line:
            current_meal = "Breakfast"
            
        is_common = False
        if "plain rice" in lower_line or "brown bread" in lower_line or "buttermilk/lemon juice" in lower_line:
            is_common = True
        elif line_clean.strip() and line_clean.startswith(" " * 40) and not any(line_clean[split_points[j]:split_points[j+1]].strip() for j in [0, 1, 5, 6]):
            is_common = True
            
        if is_common:
            item = line_clean.strip()
            item = re.sub(r'\s+', ' ', item)
            if item:
                common_items[current_meal].append(item)
            continue
            
        for j, day in enumerate(days):
            start = split_points[j]
            end = split_points[j+1]
            cell_text = line_clean[start:end].strip()
            cell_text = re.sub(r'\s+', ' ', cell_text)
            
            if cell_text:
                menu[day][current_meal].append(cell_text)
                
    for meal_name in ["Breakfast", "Lunch", "Snacks", "Dinner"]:
        for common_item in common_items[meal_name]:
            for day in days:
                menu[day][meal_name].append(common_item)
                
    return menu

def clean_south_item(text, week):
    if "/" in text and ("[" in text or "]" in text):
        parts = [p.strip() for p in text.split("/")]
        resolved = []
        for part in parts:
            match = re.search(r'\[([A-D])\]', part)
            if match:
                part_week = match.group(1)
                if part_week == week:
                    cleaned = re.sub(r'\[[A-D]\]', '', part).strip()
                    resolved.append(cleaned)
            else:
                resolved.append(part)
        if resolved:
            return " / ".join(resolved)
        return ""
        
    match = re.search(r'\[([A-D])\]', text)
    if match:
        part_week = match.group(1)
        if part_week == week:
            return re.sub(r'\[[A-D]\]', '', text).strip()
        else:
            return ""
            
    return text

def process_south_menu(raw_menu, week):
    cleaned_menu = {}
    for day, meals in raw_menu.items():
        cleaned_menu[day] = {}
        for meal_name, items in meals.items():
            cleaned_items = []
            for item in items:
                cleaned = clean_south_item(item, week)
                if cleaned:
                    cleaned = cleaned.strip("., ")
                    cleaned_items.append(cleaned)
            cleaned_menu[day][meal_name] = cleaned_items
    return cleaned_menu

def clean_north_breakfast(items_list, diet_type):
    # Veg diet type removes egg-related options, cleans up slashes like Omelette/Oats -> Oats
    cleaned = []
    for item in items_list:
        it = item.strip()
        if not it:
            continue
            
        if diet_type == "Veg":
            it_lower = it.lower()
            # If it's pure egg, skip
            if it_lower == "boiled egg" or it_lower == "omelette" or it_lower == "fried egg":
                continue
                
            # Replace slashes/mixtures
            it = re.sub(r'Omelette/Oats', 'Oats', it, flags=re.IGNORECASE)
            it = re.sub(r'Fried Egg/Oats', 'Oats', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg/Oats', 'Oats', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg Sprouts', 'Sprouts', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg Cornflakes', 'Cornflakes', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg/Chocos', 'Chocos', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg Chana', 'Boiled Chana', it, flags=re.IGNORECASE)
            it = re.sub(r'Boiled Egg Channa', 'Boiled Chana', it, flags=re.IGNORECASE)
            
            # Skip if clean text is empty or matches egg terms
            if not it.strip() or any(term in it.lower() for term in ["boiled egg", "omelette", "fried egg"]):
                continue
        else:
            # Non-veg keeps eggs but cleans slashes for better readability
            it = re.sub(r'Omelette/Oats', 'Omelette / Oats', it)
            it = re.sub(r'Fried Egg/Oats', 'Fried Egg / Oats', it)
            it = re.sub(r'Boiled Egg/Oats', 'Boiled Egg / Oats', it)
            it = re.sub(r'Boiled Egg/Chocos', 'Boiled Egg / Chocos', it)
            it = re.sub(r'Onion Uttapam/Plain Dosa', 'Onion Uttapam / Plain Dosa', it)
            
        cleaned.append(it.strip())
    return cleaned

def format_menu_data():
    txt_files = glob.glob("Menus/txt/*_layout.txt")
    
    # Unified Menu (represented as "Unified") and South Indian menu parsed here
    parsed_unified = {w: {d: {} for d in days} for w in ["A", "B", "C", "D"]}
    parsed_south = {w: {d: {} for d in days} for w in ["A", "B", "C", "D"]}
    
    # Parse Unified Menus (which represent "Unified")
    for filepath in txt_files:
        filename = os.path.basename(filepath)
        if "Unified Menu" not in filename:
            continue
            
        week_match = re.search(r'Week ([A-D])', filename)
        mess_match = re.search(r'(Veg|Non Veg|Non-Veg)', filename)
        
        if not week_match or not mess_match:
            continue
            
        week = week_match.group(1)
        mess_raw = mess_match.group(1)
        messType = "Veg" if "Non" not in mess_raw else "Non-Veg"
        
        raw_menu = parse_file(filepath)
        if not raw_menu:
            continue
            
        for day in days:
            parsed_unified[week][day][messType] = raw_menu[day]

    # Parse South Menus
    for filepath in txt_files:
        filename = os.path.basename(filepath)
        if "South Menu" not in filename and "South Veg" not in filename and "South Non-Veg" not in filename:
            continue
            
        weeks_match = re.search(r'\(([A-D])&([A-D])\)', filename)
        messType = "Veg" if "Non-Veg" not in filename and "Non Veg" not in filename else "Non-Veg"
        
        if not weeks_match:
            continue
            
        week1 = weeks_match.group(1)
        week2 = weeks_match.group(2)
        
        raw_menu = parse_file(filepath)
        if not raw_menu:
            continue
            
        processed_week1 = process_south_menu(raw_menu, week1)
        for day in days:
            if messType not in parsed_south[week1][day]:
                parsed_south[week1][day][messType] = {}
            parsed_south[week1][day][messType] = processed_week1[day]
            
        processed_week2 = process_south_menu(raw_menu, week2)
        for day in days:
            if messType not in parsed_south[week2][day]:
                parsed_south[week2][day][messType] = {}
            parsed_south[week2][day][messType] = processed_week2[day]

    # Build final combined database
    # Structure: week -> day -> cuisine -> messType -> meal -> array of strings
    structured_db = {}
    
    for week in ["A", "B", "C", "D"]:
        structured_db[week] = {}
        for day in days:
            day_title = day.title()
            structured_db[week][day_title] = {
                "North Indian": {"Veg": {}, "Non-Veg": {}},
                "South Indian": {"Veg": {}, "Non-Veg": {}},
                "Unified": {"Veg": {}, "Non-Veg": {}}
            }
            
            # --- 1. Populate South Indian ---
            for messType in ["Veg", "Non-Veg"]:
                source = parsed_south[week][day].get(messType)
                if not source and messType == "Non-Veg":
                    source = parsed_south[week][day].get("Veg")
                
                if source:
                    for meal_name in ["Breakfast", "Lunch", "Snacks", "Dinner"]:
                        items = source.get(meal_name, [])
                        cleaned_items = [it.strip() for it in items if len(it.strip()) > 2]
                        structured_db[week][day_title]["South Indian"][messType][meal_name] = cleaned_items
                else:
                    for meal_name in ["Breakfast", "Lunch", "Snacks", "Dinner"]:
                        structured_db[week][day_title]["South Indian"][messType][meal_name] = []

            # --- 2. Populate Unified ---
            for messType in ["Veg", "Non-Veg"]:
                source = parsed_unified[week][day].get(messType)
                if not source and messType == "Non-Veg":
                    source = parsed_unified[week][day].get("Veg")
                
                if source:
                    for meal_name in ["Breakfast", "Lunch", "Snacks", "Dinner"]:
                        items = source.get(meal_name, [])
                        cleaned_items = [it.strip() for it in items if len(it.strip()) > 2]
                        structured_db[week][day_title]["Unified"][messType][meal_name] = cleaned_items
                else:
                    for meal_name in ["Breakfast", "Lunch", "Snacks", "Dinner"]:
                        structured_db[week][day_title]["Unified"][messType][meal_name] = []

            # --- 3. Populate North Indian (from user Markdown table) ---
            # North Indian menu has same snacks as Unified menu
            for messType in ["Veg", "Non-Veg"]:
                # Get raw text entries from north_indian_raw dict
                raw_day_data = north_indian_raw[week][day_title]
                
                # Breakfast
                bfast_raw = raw_day_data["Breakfast"]
                bfast_items = [it.strip() for it in bfast_raw.split(",")]
                cleaned_bfast = clean_north_breakfast(bfast_items, messType)
                
                # Lunch
                lunch_raw = raw_day_data["Lunch"]
                lunch_items = [it.strip() for it in lunch_raw.split(",")]
                
                # Snacks (copied from Unified menu Snacks for consistency)
                snacks_items = structured_db[week][day_title]["Unified"][messType]["Snacks"]
                
                # Dinner
                dinner_raw = raw_day_data["Dinner"]
                dinner_items = [it.strip() for it in dinner_raw.split(",")]
                
                structured_db[week][day_title]["North Indian"][messType] = {
                    "Breakfast": cleaned_bfast,
                    "Lunch": lunch_items,
                    "Snacks": snacks_items,
                    "Dinner": dinner_items
                }
                
    # Write database file
    js_content = f"""// menuData.js
// AUTO-GENERATED from PDF and Markdown source menus. Do not edit directly.

export const CUISINES = ['North Indian', 'South Indian', 'Unified'];
export const MESS_TYPES = ['Veg', 'Non-Veg'];
export const WEEKS = ['A', 'B', 'C', 'D'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const database = {json.dumps(structured_db, indent=2)};

export const getMenu = (week, day, cuisine, messType) => {{
  if (!database[week] || !database[week][day] || !database[week][day][cuisine]) {{
    return null;
  }}
  
  const menu = database[week][day][cuisine][messType] || database[week][day][cuisine]["Veg"];
  return menu;
}};

export const searchMeals = (query) => {{
  if (!query || query.trim() === '') return [];
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  for (const week of WEEKS) {{
    for (const day of DAYS) {{
      for (const cuisine of CUISINES) {{
        for (const messType of MESS_TYPES) {{
          const menu = getMenu(week, day, cuisine, messType);
          if (!menu) continue;

          for (const [mealName, items] of Object.entries(menu)) {{
            if (!items || !Array.isArray(items)) continue;
            
            const matchingItem = items.find(item => item.toLowerCase().includes(normalizedQuery));
            if (matchingItem) {{
              results.push({{
                week,
                day,
                cuisine,
                messType,
                mealName,
                matchingItem,
                items
              }});
            }}
          }}
        }}
      }}
    }}
  }}

  // Deduplicate identical matches
  const seen = new Set();
  const deduped = [];
  for (const item of results) {{
    const key = `${{item.week}}-${{item.day}}-${{item.cuisine}}-${{item.mealName}}-${{item.matchingItem}}`;
    if (!seen.has(key)) {{
      seen.add(key);
      deduped.push(item);
    }}
  }}
  return deduped;
}};
"""
    
    with open("src/menuData.js", "w") as f:
        f.write(js_content)
        
    print("Successfully generated src/menuData.js with parsed data!")

if __name__ == "__main__":
    format_menu_data()
