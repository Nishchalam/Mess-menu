import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import vm from 'vm'

const saveMenuPlugin = () => {
  return {
    name: 'save-menu-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/save-menu') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { week, day, cuisine, messType, mealName, updatedItems } = JSON.parse(body);
              const filePath = path.resolve(process.cwd(), 'menu-data.js');
              const fileContent = fs.readFileSync(filePath, 'utf-8');
              
              // Use VM to parse the current structure from ES Module contents
              const code = fileContent
                .replace(/export const commonItems =/g, 'var commonItems =')
                .replace(/export const menuData =/g, 'var menuData =');
              const sandbox = {};
              vm.createContext(sandbox);
              vm.runInContext(code, sandbox);
              const { commonItems, menuData } = sandbox;
              
              if (!commonItems || !menuData) {
                throw new Error('Failed to parse menu-data.js exports');
              }
              
              // Map frontend cuisine and mess type to menuData keys
              const mapping = {
                "North Indian": { "Veg": "northVeg", "Non-Veg": "northNonVeg" },
                "South Indian": { "Veg": "southVeg", "Non-Veg": "southNonVeg" },
                "Unified": { "Veg": "unifiedVeg", "Non-Veg": "unifiedNonVeg" }
              };
              
              const cuisineKey = mapping[cuisine]?.[messType];
              if (!cuisineKey) {
                throw new Error(`Invalid cuisine/messType combination: ${cuisine} - ${messType}`);
              }
              
              if (!menuData[cuisineKey]) {
                menuData[cuisineKey] = { name: `${cuisine} - ${messType}`, weeks: {} };
              }
              if (!menuData[cuisineKey].weeks) {
                menuData[cuisineKey].weeks = {};
              }
              if (!menuData[cuisineKey].weeks[week]) {
                menuData[cuisineKey].weeks[week] = {};
              }
              if (!menuData[cuisineKey].weeks[week][day]) {
                menuData[cuisineKey].weeks[week][day] = {};
              }
              
              // Update the items
              menuData[cuisineKey].weeks[week][day][mealName] = updatedItems;
              
              // Serialize back to file
              const newContent = `export const commonItems = ${JSON.stringify(commonItems, null, 2)};\n\nexport const menuData = ${JSON.stringify(menuData, null, 2)};\n`;
              fs.writeFileSync(filePath, newContent, 'utf-8');
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveMenuPlugin()],
  base: './',
})
