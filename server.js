
const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3000;

const dataDirectory = path.join(__dirname, "private-data");
const databaseFile = path.join(dataDirectory, "students.json");

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function readStudents() {
  try {
    return JSON.parse(await fs.readFile(databaseFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveStudents(students) {
  await fs.mkdir(dataDirectory, { recursive: true });

  const tempFile = databaseFile + ".tmp";
  await fs.writeFile(tempFile, JSON.stringify(students, null, 2), {
    mode: 0o600
  });
  await fs.rename(tempFile, databaseFile);
}

app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "ABRAKADABAR is running." });
});

app.post("/api/students/register", async (req, res) => {
  try {
    const {
      firstName, lastName, username, email,
      dob, gender, className, phone, address, password
    } = req.body;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !dob ||
      !className ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }

    if (
      firstName.length > 80 ||
      lastName.length > 80 ||
      username.length < 3 ||
      username.length > 30 ||
      !/^[a-zA-Z0-9_.-]+$/.test(username) ||
      email.length > 254 ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your details and password."
      });
    }

    const validClasses = [
      "JSS 1", "JSS 2", "JSS 3",
      "SS 1", "SS 2", "SS 3"
    ];

    if (!validClasses.includes(className)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid class."
      });
    }

    if (Number.isNaN(Date.parse(dob)) ||
        dob >= new Date().toISOString().slice(0, 10)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid date of birth."
      });
    }

    const students = await readStudents();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const duplicate = students.some(student =>
      student.username.toLowerCase() === normalizedUsername ||
      student.email.toLowerCase() === normalizedEmail
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username or email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const student = {
      id: require("crypto").randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: normalizedEmail,
      dob,
      gender: gender || "",
      className,
      phone: String(phone || "").slice(0, 30),
      address: String(address || "").slice(0, 300),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    students.push(student);
    await saveStudents(students);

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully!"
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration could not be completed. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`ABRAKADABAR running at http://localhost:${PORT}`);
});
