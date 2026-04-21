#!/bin/zsh
set -euo pipefail

base_url="${GOLD_MARKET_VERIFY_URL:-http://127.0.0.1:3125}"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/gold-market-shared-XXXXXX")"
timestamp="$(date +%s)"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

admin_cookie="$work_dir/admin.cookie"
student_one_cookie="$work_dir/student-one.cookie"
student_two_cookie="$work_dir/student-two.cookie"

admin_login="$work_dir/admin-login.json"
create_market="$work_dir/create-market.json"
student_one_register="$work_dir/student-one-register.json"
student_two_register="$work_dir/student-two-register.json"
feed_one_before="$work_dir/feed-one-before.json"
feed_two_before="$work_dir/feed-two-before.json"
trade_one="$work_dir/trade-one.json"
feed_one_after="$work_dir/feed-one-after.json"
feed_two_after="$work_dir/feed-two-after.json"
trade_two="$work_dir/trade-two.json"
resolve_market="$work_dir/resolve-market.json"
settled_one="$work_dir/settled-one.json"
settled_two="$work_dir/settled-two.json"

curl -sS -c "$admin_cookie" -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"showroom"}' \
  "$base_url/api/admin/login" > "$admin_login"

curl -sS -b "$admin_cookie" -c "$admin_cookie" -H "Content-Type: application/json" \
  -d '{"title":"Will our class finish the chapter quiz before the bell?","description":"The teacher opened a classroom-timed market to watch confidence change in real time.","category":"Classroom pacing","desk":"Gold desk","probability":55,"evidence":64,"hype":22}' \
  "$base_url/api/admin/prediction-markets/create" > "$create_market"

curl -sS -c "$student_one_cookie" -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Student One\",\"username\":\"student-one-shared-${timestamp}\",\"password\":\"test1234\",\"avatarId\":\"avatar-001\"}" \
  "$base_url/api/register" > "$student_one_register"

curl -sS -c "$student_two_cookie" -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Student Two\",\"username\":\"student-two-shared-${timestamp}\",\"password\":\"test1234\",\"avatarId\":\"avatar-002\"}" \
  "$base_url/api/register" > "$student_two_register"

curl -sS -b "$student_one_cookie" "$base_url/api/prediction-markets" > "$feed_one_before"
curl -sS -b "$student_two_cookie" "$base_url/api/prediction-markets" > "$feed_two_before"

market_id="$(node -e "const fs=require('fs'); const feed=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(feed.markets[0].id);" "$feed_one_before")"

curl -sS -b "$student_one_cookie" -c "$student_one_cookie" -H "Content-Type: application/json" \
  -d "{\"marketId\":\"${market_id}\",\"trade\":\"buy-yes\",\"quantity\":5}" \
  "$base_url/api/prediction-markets/trade" > "$trade_one"

curl -sS -b "$student_one_cookie" "$base_url/api/prediction-markets" > "$feed_one_after"
curl -sS -b "$student_two_cookie" "$base_url/api/prediction-markets" > "$feed_two_after"

curl -sS -b "$student_two_cookie" -c "$student_two_cookie" -H "Content-Type: application/json" \
  -d "{\"marketId\":\"${market_id}\",\"trade\":\"buy-no\",\"quantity\":5}" \
  "$base_url/api/prediction-markets/trade" > "$trade_two"

curl -sS -b "$admin_cookie" -c "$admin_cookie" -H "Content-Type: application/json" \
  -d "{\"marketId\":\"${market_id}\",\"resolution\":\"yes\"}" \
  "$base_url/api/admin/prediction-markets/resolve" > "$resolve_market"

curl -sS -b "$student_one_cookie" "$base_url/api/prediction-markets" > "$settled_one"
curl -sS -b "$student_two_cookie" "$base_url/api/prediction-markets" > "$settled_two"

node - <<'NODE' "$feed_one_before" "$feed_two_before" "$feed_one_after" "$feed_two_after" "$settled_one" "$settled_two"
const fs = require("fs");
const [feedOneBeforePath, feedTwoBeforePath, feedOneAfterPath, feedTwoAfterPath, settledOnePath, settledTwoPath] = process.argv.slice(2);
const feedOneBefore = JSON.parse(fs.readFileSync(feedOneBeforePath, "utf8"));
const feedTwoBefore = JSON.parse(fs.readFileSync(feedTwoBeforePath, "utf8"));
const feedOneAfter = JSON.parse(fs.readFileSync(feedOneAfterPath, "utf8"));
const feedTwoAfter = JSON.parse(fs.readFileSync(feedTwoAfterPath, "utf8"));
const settledOne = JSON.parse(fs.readFileSync(settledOnePath, "utf8"));
const settledTwo = JSON.parse(fs.readFileSync(settledTwoPath, "utf8"));
const marketId = feedOneBefore.markets[0].id;
const oneAfter = feedOneAfter.markets.find((market) => market.id === marketId);
const twoAfter = feedTwoAfter.markets.find((market) => market.id === marketId);
const oneSettled = settledOne.markets.find((market) => market.id === marketId);
const twoSettled = settledTwo.markets.find((market) => market.id === marketId);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(feedOneBefore.viewerRole === "student" && feedOneBefore.canTrade === true, "Student one feed should be tradable.");
assert(feedTwoBefore.markets[0].yesShares === 0, "Student two should not start with visible YES shares.");
assert(Number(oneAfter.yesShares) === 5, "Student one should see their own YES position.");
assert(Number(twoAfter.yesShares) === 0, "Student two should not see student one holdings.");
assert(Number(twoAfter.currentProbability) > Number(feedTwoBefore.markets[0].currentProbability), "Shared odds should rise for student two after student one buys YES.");
assert(!Object.prototype.hasOwnProperty.call(twoAfter, "userId"), "Student feed should not expose bettor identity.");
assert(oneSettled.finalHoldings && Number(oneSettled.finalHoldings.payout) === 5, "Winning student payout should be 5.");
assert(twoSettled.finalHoldings && Number(twoSettled.finalHoldings.payout) === 0, "Losing student payout should be 0.");
assert(Number(settledOne.portfolio.cash) > Number(feedOneBefore.portfolio.cash), "Winning student cash should increase after settlement.");

console.log(JSON.stringify({
  marketId,
  beforeProbability: Number(feedTwoBefore.markets[0].currentProbability),
  afterStudentOneTrade: Number(twoAfter.currentProbability),
  studentOnePrivateShares: Number(oneAfter.yesShares),
  studentTwoVisibleShares: Number(twoAfter.yesShares),
  studentOneCashAfterSettlement: Number(settledOne.portfolio.cash),
  studentTwoCashAfterSettlement: Number(settledTwo.portfolio.cash)
}, null, 2));
NODE
