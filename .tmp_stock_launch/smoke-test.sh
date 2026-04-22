#!/bin/bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3127}"
STUDENT_COOKIE="/tmp/gold-market-student.cookie"
TEACHER_COOKIE="/tmp/gold-market-teacher.cookie"

rm -f "$STUDENT_COOKIE" "$TEACHER_COOKIE"

student_register_response="$(curl -s -c "$STUDENT_COOKIE" -X POST "$BASE_URL/api/register" \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"Avery","username":"avery1","password":"classroom","avatarId":"avatar-001"}')"

echo "$student_register_response" | grep -q '"viewerRole":"student"'

student_work_response="$(curl -s -b "$STUDENT_COOKIE" -X POST "$BASE_URL/api/prediction-markets/work" \
  -H 'Content-Type: application/json' \
  -d '{"taskId":"signal-sort","choiceId":"evidence"}')"

echo "$student_work_response" | grep -q '"completedTask"'

teacher_login_response="$(curl -s -c "$TEACHER_COOKIE" -X POST "$BASE_URL/api/admin/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"teacher","password":"market-open"}')"

echo "$teacher_login_response" | grep -q '"viewerRole":"teacher"'

teacher_create_response="$(curl -s -b "$TEACHER_COOKIE" -X POST "$BASE_URL/api/admin/prediction-markets/create" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Will the principal announce a late start tomorrow?","description":"Transportation crews are meeting after a storm watch update.","category":"Weather","desk":"School desk","probability":62,"evidence":71,"hype":34}')"

echo "$teacher_create_response" | grep -q 'Will the principal announce a late start tomorrow?'

market_id="$(curl -s -b "$TEACHER_COOKIE" "$BASE_URL/api/bootstrap" | node -e '
let data = "";
process.stdin.on("data", (chunk) => data += chunk);
process.stdin.on("end", () => {
  const payload = JSON.parse(data);
  const active = (payload.admin?.predictionMarkets || []).find((entry) => entry.status === "active");
  if (!active?.id) {
    process.exit(1);
  }
  process.stdout.write(active.id);
});
')"

student_trade_response="$(curl -s -b "$STUDENT_COOKIE" -X POST "$BASE_URL/api/prediction-markets/trade" \
  -H 'Content-Type: application/json' \
  -d "{\"marketId\":\"$market_id\",\"trade\":\"buy-yes\",\"quantity\":5}")"

echo "$student_trade_response" | grep -q '"yesShares":5'

teacher_resolve_response="$(curl -s -b "$TEACHER_COOKIE" -X POST "$BASE_URL/api/admin/prediction-markets/resolve" \
  -H 'Content-Type: application/json' \
  -d "{\"marketId\":\"$market_id\",\"resolution\":\"yes\"}")"

echo "$teacher_resolve_response" | grep -q '"resolution":"yes"'

student_final_feed="$(curl -s -b "$STUDENT_COOKIE" "$BASE_URL/api/prediction-markets")"

echo "$student_final_feed" | grep -q '"finalHoldings"'
echo "$student_final_feed" | grep -q '"payout":5'

echo "Smoke test passed against $BASE_URL"
