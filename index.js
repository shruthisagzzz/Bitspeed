require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM Contact
       WHERE email = $1 OR phoneNumber = $2
       ORDER BY createdAt ASC`,
      [email, phoneNumber]
    );

    let contacts = result.rows;

    // If no contacts exist → create primary
    if (contacts.length === 0) {
      const insert = await client.query(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence)
         VALUES ($1, $2, 'primary')
         RETURNING *`,
        [email, phoneNumber]
      );

      const newContact = insert.rows[0];

      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: [email].filter(Boolean),
          phoneNumbers: [phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    }

    // Find all primary contacts
    let primaryContacts = contacts.filter(
      c => c.linkprecedence === "primary"
    );

    // Sort by createdAt
    primaryContacts.sort(
      (a, b) => new Date(a.createdat) - new Date(b.createdat)
    );

    const oldestPrimary = primaryContacts[0];

    // Convert other primaries into secondary
    for (let i = 1; i < primaryContacts.length; i++) {
      await client.query(
        `UPDATE Contact
         SET linkPrecedence = 'secondary',
             linkedId = $1
         WHERE id = $2`,
        [oldestPrimary.id, primaryContacts[i].id]
      );
    }

    // Insert secondary if new combination
    const exists = contacts.some(
      c => c.email === email && c.phonenumber === phoneNumber
    );

    if (!exists) {
      await client.query(
        `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
         VALUES ($1, $2, $3, 'secondary')`,
        [email, phoneNumber, oldestPrimary.id]
      );
    }

    // Fetch all linked contacts again
    const final = await client.query(
      `SELECT * FROM Contact
       WHERE id = $1 OR linkedId = $1`,
      [oldestPrimary.id]
    );

    const all = final.rows;

    return res.json({
      contact: {
        primaryContactId: oldestPrimary.id,
        emails: [...new Set(all.map(c => c.email).filter(Boolean))],
        phoneNumbers: [...new Set(all.map(c => c.phonenumber).filter(Boolean))],
        secondaryContactIds: all
          .filter(c => c.linkprecedence === "secondary")
          .map(c => c.id)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});