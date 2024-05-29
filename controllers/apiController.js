const db = require("../database/database");

exports.getProfileData = async function (email) {
  try {
    // Open the SQL database and get the user data
    const accDetails = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, email, (err, row) => {
        if (err) {
          console.error("Error checking for existing user", err);
          reject(err); // This will throw an error that can be caught by the catch block
        } else {
          console.log('Found user:', row);
          resolve(row);
        }
      });
    });

    const name = accDetails.username;
    const date = formatDate(accDetails.dateCreated);
    console.log('Date', date);
    //return the userType with a capital first letter
    const userType = accDetails.userType.charAt(0).toUpperCase() + accDetails.userType.slice(1) + " (Free)";

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
