//BACKEND CODE
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "12345678",
  port: 5432,
});

const app = express();
const port = 3000;

db.connect();

let quiz = [];

db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
    //this will give us all the rows from capital table
  }
  db.end();
  //close this connection
});


let totalCorrect = 0;

// Middleware to get data from form
app.use(bodyParser.urlencoded({ extended: true }));
//defines the static public folder so that we can link to the other files in public folder
//Without this middleware, your frontend wouldn't be able to access these files - the browser wouldn't know where to find your background image or stylesheet when they're referenced in your HTML/templates.
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  //using async await for this asynchronous function, waiting to 
  //get the data from database before it moves on. nextQuestion is async
  console.log(currentQuestion);

  res.render("index.ejs", { question: currentQuestion });
  //Passes currentQuestion as a local variable named question to the EJS template.
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
