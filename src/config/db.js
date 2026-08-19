import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Busiswa25#Bala",
  database: "moderntech_db",
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("MySQL connected successfully!");
});
