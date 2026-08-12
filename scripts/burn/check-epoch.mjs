import fs from "node:fs";

const epoch = JSON.parse(
  fs.readFileSync("config/burn/epoch.json", "utf8"),
);
const calendar = JSON.parse(
  fs.readFileSync("config/burn/calendar.2027.json", "utf8"),
);

const failures = [];

if (epoch.version !== "1.0.0") failures.push("version");
if (epoch.policyStart.year !== 2027) failures.push("start.year");
if (epoch.policyStart.quarter !== 1) failures.push("start.quarter");
if (epoch.policyStart.quarterId !== "20271") failures.push("start.quarterId");
if (calendar.calendar?.[0]?.quarterId !== "20271") failures.push("calendar.first");
if (calendar.calendar?.[3]?.quarterId !== "20274") failures.push("calendar.q4");

console.log(JSON.stringify({
  ok: failures.length === 0,
  startQuarter: "2027 Q1",
  startQuarterId: "20271",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
