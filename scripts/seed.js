import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CSV_PATH = 'C:\\Users\\VICTUS\\Downloads\\students_with_photos.csv';

const INITIAL_TEAMS = [
  { id: 'team-a', name: 'TEAM A', color: 'bg-team-a', text: 'text-team-a', loginCode: 'ax7b9q' },
  { id: 'team-b', name: 'TEAM B', color: 'bg-team-b', text: 'text-team-b', loginCode: 'm4r2p1' },
  { id: 'team-c', name: 'TEAM C', color: 'bg-team-c', text: 'text-team-c', loginCode: 'z8v5k3' },
];

const INITIAL_CATEGORIES = [
  { name: 'Senior', color: 'text-event-gold', bg: 'bg-event-gold/10', border: 'border-event-gold/20' },
  { name: 'Junior', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { name: 'Sub Junior', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' }
];

async function seed() {
  console.log("Seeding Teams...");
  const { error: teamsError } = await supabase.from('teams').upsert(INITIAL_TEAMS);
  if (teamsError) console.error("Teams Error:", teamsError);

  console.log("Seeding Categories...");
  const { error: categoriesError } = await supabase.from('categories').upsert(INITIAL_CATEGORIES);
  if (categoriesError) console.error("Categories Error:", categoriesError);

  console.log("Seeding Event State...");
  const { error: stateError } = await supabase.from('event_state').upsert({ id: 1, currentCategory: 'Senior' });
  if (stateError) console.error("Event State Error:", stateError);

  console.log("Reading CSV:", CSV_PATH);
  const students = [];
  const uniqueCategories = new Set();
  
  if (fs.existsSync(CSV_PATH)) {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const catName = row.category || row.Category;
        if (catName) {
          uniqueCategories.add(catName);
        }
        
        students.push({
          id: row.id || Math.random().toString(36).substr(2, 9),
          name: row.name || row.Name,
          chestNo: row.adno || row.chestNo || row.ChestNo || row.chestno,
          category: catName,
          class: row.class || row.Class,
          photo: row.photo_url || row.photo || row.Photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          status: 'available',
          selectedBy: null
        });
      })
      .on('end', async () => {
        console.log(`Found categories in CSV:`, Array.from(uniqueCategories));
        
        // Upsert all found categories with some default styling
        const catPayload = Array.from(uniqueCategories).map((name, i) => {
          const colors = ['text-event-gold', 'text-blue-400', 'text-green-400', 'text-purple-400', 'text-red-400', 'text-white'];
          const color = colors[i % colors.length];
          return {
            name,
            color,
            bg: color.replace('text-', 'bg-').split('-')[0] + '/10',
            border: color.replace('text-', 'border-').split('-')[0] + '/20'
          };
        });
        
        const { error: catError } = await supabase.from('categories').upsert(catPayload);
        if (catError) console.error("Dynamic Categories Error:", catError);

        console.log(`Parsed ${students.length} students. Uploading to Supabase...`);
        // Batch upload
        for (let i = 0; i < students.length; i += 100) {
          const batch = students.slice(i, i + 100);
          const { error: studentError } = await supabase.from('students').upsert(batch);
          if (studentError) {
            console.error("Student Batch Error:", studentError);
          } else {
            console.log(`Uploaded batch ${i / 100 + 1}`);
          }
        }
        console.log("Seeding complete!");
      });
  } else {
    console.error("CSV file not found at path:", CSV_PATH);
  }
}

seed();
