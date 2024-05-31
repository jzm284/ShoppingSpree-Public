const db = require("../database/database");
const auth = require("./authController");
const bcrypt = require("bcrypt");

exports.getStores = async function (req, res) {
  try {
    const user = req.session.user;
    if (!user) {
      throw new Error("Unauthorized user.");
    }
    const stores = await new Promise((resolve, reject) => {
      db.all(
        `SELECT name, address FROM stores WHERE public = TRUE`,
        (err, rows) => {
          if (err) {
            console.error("Error getting stores", err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    res.json(stores);
  } catch (error) {
    console.error("Failed to get stores", error);
    res.redirect("/dashboard");
  }
};

exports.getMyLists = async function (req, res) {
  const user = req.session.user;
  if (!user) {
    throw new Error("Unauthorized user.");
  }
  const userData = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, user.email, (err, row) => {
      if (err) {
        console.error("Error checking for existing user", err);
        reject(err);
      } else {
        console.log("Found user:", row);
        resolve(row);
      }
    });
  });
  if (userData.userType !== "customer") {
    throw new Error("Only customers can see their grocery lists.");
  }
  const lists = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM lists WHERE email = ?`, user.email, (err, rows) => {
      if (err) {
        console.error("Error getting lists", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  res.json(lists);
};

exports.makeNewStore = async function (req, res) {
  try {
    const user = req.session.user;
    if (!user) {
      throw new Error("Unauthorized user.");
    }
    const userData = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, user.email, (err, row) => {
        if (err) {
          console.error("Error checking for existing user", err);
          reject(err);
        } else {
          console.log("Found user:", row);
          resolve(row);
        }
      });
    });
    if (userData.userType !== "owner") {
      throw new Error("Only store owners can create stores.");
    }
    const { name, address, public } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO stores (name, address, dateCreated, public) VALUES (?, ?, ?, ?)`,
        [name, address, date, public],
        (err) => {
          if (err) {
            console.error("Error creating store", err);
            reject(err);
          } else {
            res.json({
              message: "Store successfully created: " + name,
              status: "success",
            });
            resolve();
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to create store", error);
    res.redirect("/dashboard");
  }
};
exports.saveList = async function (req, res) {
  const user = req.session.user;
  if (!user) {
    throw new Error("Unauthorized user.");
  }
  const userData = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, user.email, (err, row) => {
      if (err) {
        console.error("Error checking for existing user", err);
        reject(err);
      } else {
        console.log("Found user:", row);
        resolve(row);
      }
    });
  });
  if (userData.userType !== "customer") {
    throw new Error("Only customers can save grocery lists.");
  }
  const { listName, listItems } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO lists (email, dateCreated, list) VALUES (?, ?, ?, ?, ?)`,
      [user.email, date, listName, listItems],
      (err) => {
        if (err) {
          console.error("Error saving list", err);
          reject(err);
        } else {
          res.json({
            message: "List successfully saved: " + listName,
            status: "success",
          });
          resolve();
        }
      }
    );
  });
};

exports.getProfileData = async function (email) {
  try {
    // Open the SQL database and get the user data
    const accDetails = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, email, (err, row) => {
        if (err) {
          console.error("Error checking for existing user", err);
          reject(err);
        } else {
          console.log("Found user:", row);
          resolve(row);
        }
      });
    });

    const name = accDetails.name;
    const date = formatDate(accDetails.dateCreated);
    console.log("Date", date);
    //return the userType with a capital first letter
    const userType =
      accDetails.userType.charAt(0).toUpperCase() +
      accDetails.userType.slice(1) +
      " (Free)";

    return { name, email, userType, date };
  } catch (error) {
    console.error("Failed to get profile data", error);
    throw new Error("Unable to retrieve profile data.");
  }
};

/**
 * A function to format the date from the database into a more readable format
 * @param {the dateCreated from users table, in format YYYY-MM-DD HH:MM:SS} date
 * @returns {the date in format Month DD, YYYY}
 */
function formatDate(date) {
  //original format is 2012-06-22 05:40:06
  //we want to return May 22, 2012
  const dateObj = new Date(date);
  const month = dateObj.toLocaleString("default", { month: "long" });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
}

exports.deleteAccount = async function (req, res) {
  try {
    const user = req.session.user;
    console.log("session", req.session);
    if (!user) {
      throw new Error("Unauthorized user.");
    } else if (user.email === "test@test.com") {
      throw new Error("Cannot delete test account.");
    }
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM users WHERE email = ?`, user.email, (err) => {
        if (err) {
          console.error("Error deleting user", err);
          reject(err);
        } else {
          req.session.destroy((err) => {
            if (err) {
              return res.status(500).json({ error: "Failed to log out" });
            }
            res.json({
              message: "Account successfully deleted: " + user.email,
              status: "success",
            });
          });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Failed to delete account", error);
    res.redirect("/dashboard");
  }
};

exports.makeNewList = async function (req, res) {
  try {
    const user = req.session.user;
    if (!user) {
      throw new Error("Unauthorized user.");
    }
    const { listName, listType } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO lists (list_id, email, dateCreated) VALUES (?, ?, ?, ?)`,
        [list_id, user.email, date],
        (err) => {
          if (err) {
            console.error("Error creating list", err);
            reject(err);
          } else {
            res.json({
              message: "List successfully created: " + listName,
              status: "success",
            });
            resolve();
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to create list", error);
    res.redirect("/dashboard");
  }
};
