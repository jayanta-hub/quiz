#!/usr/bin/env node

const fs = require("fs");
const csvtojson = require("csvtojson");
const pkg = require("./package.json");
const process = require("process");
// Check if a CSV file path is provided as a command-line argument
// console.log("🚀 ~ process:", process);
if (process.argv.length < 3) {
  cliHelp();
  process.exit(1);
}

const csvFilePath = process.argv[2];
let totalQuestions = 0;

// Read the CSV file
fs.readFile(csvFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading CSV file: ${err.message}`);
    process.exit(1);
  }

  // Convert CSV to JSON
  csvtojson()
    .fromString(data)
    .then((jsonArray) => {
      // * Testing
      // fs.writeFileSync('sample.json', JSON.stringify(jsonArray), 'utf-8');

      // Log all questions with answer.
      logQuestionAnswer(jsonArray);

      // Construct object
      jsonArray = constructObj(jsonArray);
      console.table(jsonArray);

      // Add your additional processing logic here
      logQuizReport(jsonArray);
    })
    .catch((conversionErr) => {
      console.error(`Error converting CSV to JSON: ${conversionErr.message}`);
      process.exit(1);
    });
});

function constructObj(result) {
  const report = [];

  result.forEach((res, i) => {
    const { User: name } = res;
    const start = new Date(res["Started On"]);
    const end = new Date(res["Completed On"]);
    const time = Math.round((((end - start) % 86400000) % 3600000) / 60000);

    if (name) {
      // Log participated users
      console.log(i, name);

      report.push({
        name,
        time: !Number.isNaN(time) ? time + "m" : "-",
        score: +res["Total Points"],
      });
    }
  });

  return report;
}

function logQuizReport(quizReport) {
  const scores = {};

  quizReport.forEach((participant) => {
    if (!scores[participant.score]) scores[participant.score] = [];
    scores[participant.score].push(participant.name);
  });

  Object.keys(scores)
    .sort((a, b) => b - a)
    .forEach((score) => {
      console.log(
        `Following participants scored ${score} out of ${totalQuestions}:`
      );
      scores[score].forEach((participant) => {
        console.log(participant);
      });
      console.log("\n");
    });
}

function logQuestionAnswer(report) {
  report = report[0];
  const ignoreKeys = [
    "Points",
    "User",
    "Started On",
    "Completed",
    "Total Points",
    "Polly ID",
    "Title",
    "Send Date",
    "Date Authored",
    "Completed On",
  ];

  console.log("\nQuiz questions and answer:\n");

  for (const key in report) {
    if (!ignoreKeys.some((ik) => key.startsWith(ik))) {
      console.info(key);
      console.info(report[key], "\n");
      totalQuestions += 1;
    }
  }
}

function cliHelp() {
  console.info("Usage: aks-report <csvFilePath>\n");
  // console.info(pkg.description);
}
