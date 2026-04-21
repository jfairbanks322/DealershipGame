#!/bin/zsh
set -euo pipefail

base_url="${GOLD_MARKET_VERIFY_URL:-http://127.0.0.1:3125}"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/gold-market-work-XXXXXX")"
timestamp="$(date +%s)"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

student_cookie="$work_dir/student.cookie"
register_json="$work_dir/register.json"
before_json="$work_dir/before.json"
after_json="$work_dir/after.json"
repeat_json="$work_dir/repeat.json"
repeat_status="$work_dir/repeat.status"

curl -sS -c "$student_cookie" -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Work Tester\",\"username\":\"work-tester-${timestamp}\",\"password\":\"test1234\",\"avatarId\":\"avatar-001\"}" \
  "$base_url/api/register" > "$register_json"

curl -sS -b "$student_cookie" "$base_url/api/prediction-markets" > "$before_json"

task_id="$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(data.workBoard.tasks[0].id);" "$before_json")"
choice_id="$(node - <<'NODE' "$before_json" "$task_id"
const fs = require("fs");
const [beforePath, taskId] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(beforePath, "utf8"));
const task = data.workBoard.tasks.find((entry) => entry.id === taskId);
const correctChoices = {
  "evidence-quiz": "memo",
  "risk-reflection": "pause",
  "signal-sort": "evidence",
  "discipline-drill": "size",
  "private-bets-quiz": "identity",
  "shared-pool-lab": "rise"
};
console.log(correctChoices[task.id]);
NODE
)"

curl -sS -b "$student_cookie" -c "$student_cookie" -H "Content-Type: application/json" \
  -d "{\"taskId\":\"${task_id}\",\"choiceId\":\"${choice_id}\"}" \
  "$base_url/api/prediction-markets/work" > "$after_json"

curl -sS -o "$repeat_json" -w "%{http_code}" -b "$student_cookie" -c "$student_cookie" -H "Content-Type: application/json" \
  -d "{\"taskId\":\"${task_id}\",\"choiceId\":\"${choice_id}\"}" \
  "$base_url/api/prediction-markets/work" > "$repeat_status"

node - <<'NODE' "$before_json" "$after_json" "$repeat_json" "$repeat_status"
const fs = require("fs");
const [beforePath, afterPath, repeatPath, repeatStatusPath] = process.argv.slice(2);
const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));
const repeat = JSON.parse(fs.readFileSync(repeatPath, "utf8"));
const repeatStatus = Number(fs.readFileSync(repeatStatusPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(before.viewerRole === "student" && before.canTrade === true, "Student should receive a tradable GOLD MARKET payload.");
assert(before.workBoard && before.workBoard.available === true, "Work board should be available to students.");
assert(before.workBoard.canWork === true, "Student should be able to complete one work task before submission.");
assert(Array.isArray(before.workBoard.tasks) && before.workBoard.tasks.length === 3, "Three work tasks should be offered each day.");
assert(after.workBoard && after.workBoard.canWork === false, "Work board should lock after a task is completed.");
assert(after.workBoard.completedTask, "Completed work task summary should be returned after submission.");
assert(Number(after.portfolio.cash) > Number(before.portfolio.cash), "Completing work should increase wallet cash.");
assert(repeatStatus === 400, "Second work submission on the same day should be rejected.");
assert(/already completed/i.test(repeat.error || ""), "Repeat submission should explain the daily limit.");

console.log(JSON.stringify({
  workDate: after.workBoard.workDate,
  offeredTasks: before.workBoard.tasks.map((task) => task.title),
  payout: after.workBoard.completedTask.payout,
  accuracyBonus: after.workBoard.completedTask.accuracyBonus,
  cashBefore: before.portfolio.cash,
  cashAfter: after.portfolio.cash
}, null, 2));
NODE
