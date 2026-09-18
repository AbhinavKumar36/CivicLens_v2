import Database from 'better-sqlite3';
import { loadBhubaneswarData } from './server/services/bhubaneswarData.js';
import fs from 'fs';

console.log("Seeding SQLite database deterministically for Bhubaneswar...");

const dbFile = 'civiclens.db';
const db = new Database(dbFile);

// Enable foreign keys & WAL
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  DROP TABLE IF EXISTS audit_logs;
  DROP TABLE IF EXISTS portfolios;
  DROP TABLE IF EXISTS impact_assessments;
  DROP TABLE IF EXISTS priority_assessments;
  DROP TABLE IF EXISTS development_proposals;
  DROP TABLE IF EXISTS datasets;
  DROP TABLE IF EXISTS demand_hotspots;
  DROP TABLE IF EXISTS demand_themes;
  DROP TABLE IF EXISTS normalized_demands;
  DROP TABLE IF EXISTS complaints;
  DROP TABLE IF EXISTS emergencies;
  DROP TABLE IF EXISTS workers;
  DROP TABLE IF EXISTS departments;
  DROP TABLE IF EXISTS users;
`);

// Recreate all tables
const schema = fs.readFileSync('server.js', 'utf8');
const createTablesMatch = schema.match(/db\.exec\(\`([\s\S]*?)\`\);/);
if (createTablesMatch && createTablesMatch[1]) {
    db.exec(createTablesMatch[1]);
} else {
    console.error("Could not extract schema from server.js. Ensure server.js defines tables in a db.exec block.");
    process.exit(1);
}

// Pseudo-random generator for deterministic seeding
function getPseudoRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 1. Users
const insertUser = db.prepare('INSERT INTO users (name, email, role, avatar) VALUES (?, ?, ?, ?)');
insertUser.run("Priya Sharma", "priya@example.com", "CITIZEN", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80");
insertUser.run("Ananya Gupta", "operator@civiclens.gov", "OPERATOR", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80");
insertUser.run("Rahul Verma", "rahul.worker@civiclens.gov", "WORKER", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80");

// 2. Departments
const insertDept = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
const deptIds = [
  insertDept.run("Bhubaneswar Public Works", "Roads, infrastructure, and public spaces").lastInsertRowid,
  insertDept.run("Bhubaneswar Solid Waste Management", "Waste management and city cleanliness").lastInsertRowid,
  insertDept.run("Bhubaneswar Traffic Control", "Emergency services and law enforcement").lastInsertRowid,
  insertDept.run("Bhubaneswar Water Supply", "Utility management and repairs").lastInsertRowid
];

// 3. Workers
const insertWorker = db.prepare('INSERT INTO workers (name, status, department_id, location_lat, location_lng, role) VALUES (?, ?, ?, ?, ?, ?)');
const workerNames = ["Rahul Verma", "Anjali Desai", "Vikram Singh", "Neha Patel", "Rajesh Kumar", "Sanjay Gupta"];
// Bhubaneswar center: 20.296, 85.824
const workerIds = workerNames.map((name, i) => {
    const role = getPseudoRandom(i * 14) > 0.8 ? "HEAD" : "FIELD";
    return insertWorker.run(
        name, 
        ["Active", "Busy", "Inactive"][Math.floor(getPseudoRandom(i * 10) * 3)], 
        deptIds[Math.floor(getPseudoRandom(i * 11) * deptIds.length)],
        20.296 + (getPseudoRandom(i * 12) - 0.5) * 0.05,
        85.824 + (getPseudoRandom(i * 13) - 0.5) * 0.05,
        role
    ).lastInsertRowid;
});

// 4. Civic Inputs / Complaints
const insertComplaint = db.prepare('INSERT INTO complaints (category, priority, severity, summary, status, department, estimated_resolution_time, worker_id, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const categories = ["infrastructure", "water", "sanitation", "power", "environmental", "safety"];
const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Pending", "In Progress", "Resolved", "Closed"];
const depts = ["Bhubaneswar Public Works", "Bhubaneswar Water Supply", "Bhubaneswar Solid Waste Management", "Bhubaneswar Water Supply", "Bhubaneswar Solid Waste Management", "Bhubaneswar Traffic Control"];

const complaintIds = [];
for (let i = 1; i <= 50; i++) {
  const cat = categories[Math.floor(getPseudoRandom(i * 20) * categories.length)];
  const prio = priorities[Math.floor(getPseudoRandom(i * 21) * priorities.length)];
  const stat = statuses[Math.floor(getPseudoRandom(i * 22) * statuses.length)];
  const summary = `${cat.charAt(0).toUpperCase() + cat.slice(1)} issue reported at location ${i}`;
  const dept = depts[categories.indexOf(cat)];
  const estTime = `${Math.floor(getPseudoRandom(i * 23) * 48) + 2} Hours`;
  const worker_id = getPseudoRandom(i * 24) > 0.5 ? workerIds[Math.floor(getPseudoRandom(i * 25) * workerIds.length)] : null;
  const lat = 20.296 + (getPseudoRandom(i * 26) - 0.5) * 0.05;
  const lng = 85.824 + (getPseudoRandom(i * 27) - 0.5) * 0.05;
  const createdAt = new Date(Date.now() - getPseudoRandom(i * 28) * 864000000).toISOString();
  
  complaintIds.push(insertComplaint.run(cat, prio, prio, summary, stat, dept, estTime, worker_id, lat, lng, createdAt).lastInsertRowid);
}



console.log("Database seeded successfully with deterministic Bhubaneswar data.");
db.close();
