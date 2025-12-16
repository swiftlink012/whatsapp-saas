// backend/src/seed.js
const db = require("./db");

async function seed() {
  console.log("Seeding data...");

  // 1. Create (or find) a customer
  const phone = "917331176808"; // Ramesh's number
  await db.query(
    `
    INSERT INTO customers (phone, name) 
    VALUES ($1, 'Ramesh') 
    ON CONFLICT (phone) DO NOTHING
  `,
    [phone]
  );

  // Get his ID
  const res = await db.query("SELECT id FROM customers WHERE phone=$1", [
    phone,
  ]);
  const customerId = res.rows[0].id;

  // 2. Add a fake Order
  console.log("Adding an order...");
  await db.query(
    `
    INSERT INTO orders (customer_id, amount, status) 
    VALUES ($1, 499.00, 'abandoned')
  `,
    [customerId]
  );

  // 3. Add a fake Message history
  console.log("Adding messages...");
  await db.query(
    `
    INSERT INTO messages (customer_id, direction, text) 
    VALUES ($1, 'in', 'Hi, I am interested in the pro plan')
  `,
    [customerId]
  );

  await db.query(
    `
    INSERT INTO messages (customer_id, direction, text) 
    VALUES ($1, 'out', 'Great! It costs 499. Shall I send the link?')
  `,
    [customerId]
  );

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
