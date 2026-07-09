import fs from 'fs';

const csv = fs.readFileSync('C:\\Users\\VICTUS\\Downloads\\converted.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

const students = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = line.split(',');
  const adno = values[0];
  const name = values[1];
  let category = values[2];
  const photo_url = values[3];

  // Capitalize category
  category = category.charAt(0).toUpperCase() + category.slice(1);

  students.push({
    id: i, // Use row number as ID
    name: name,
    chestNo: adno,
    class: '', // No class provided in CSV
    category: category,
    team: null,
    status: 'available',
    photo: photo_url
  });
}

// Extract unique categories
const categories = [...new Set(students.map(s => s.category))];

const output = {
  students,
  categories
};

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/students.json', JSON.stringify(output, null, 2));
console.log('Successfully generated src/data/students.json');
