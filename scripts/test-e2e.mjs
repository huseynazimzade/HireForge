// Automated verification test script for HireForge
const BASE = "http://127.0.0.1:3000";

async function runTests() {
  console.log("=== HIREFORGE SYSTEM TEST START ===");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Unauthenticated /api/analyze should return 401
  try {
    const res1 = await fetch(`${BASE}/api/analyze`, { method: "POST" });
    assert(res1.status === 401, `Unauthenticated /api/analyze returns 401 (got ${res1.status})`);
  } catch (e) {
    assert(false, `Test 1 failed to fetch: ${e.message}`);
  }

  // TEST 2: Unauthenticated /hr redirect
  try {
    const res2 = await fetch(`${BASE}/hr`, { redirect: "manual" });
    const location = res2.headers.get("location") || "";
    assert(
      res2.status === 307 || res2.status === 302 || location.includes("/login"),
      `Unauthenticated /hr redirects to /login (status: ${res2.status}, location: ${location})`
    );
  } catch (e) {
    assert(false, `Test 2 failed: ${e.message}`);
  }

  // TEST 3: Login demo HR account
  let hrCookie = "";
  try {
    const res3 = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hr@demo.com", password: "Demo1234" }),
    });
    const data3 = await res3.json();
    hrCookie = res3.headers.get("set-cookie") || "";
    assert(
      res3.status === 200 && data3.user?.role === "HR",
      `HR login success (Role: ${data3.user?.role})`
    );
  } catch (e) {
    assert(false, `Test 3 failed: ${e.message}`);
  }

  // Extract session token from cookie
  const cookieHeader = hrCookie.split(";")[0];

  // TEST 4: /api/auth/me returns HR user
  try {
    const res4 = await fetch(`${BASE}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const data4 = await res4.json();
    assert(
      res4.status === 200 && data4.user?.email === "hr@demo.com",
      `GET /api/auth/me verified user (email: ${data4.user?.email})`
    );
  } catch (e) {
    assert(false, `Test 4 failed: ${e.message}`);
  }

  // TEST 5: HR user accessing /candidate should be redirected to /hr
  try {
    const res5 = await fetch(`${BASE}/candidate`, {
      headers: { Cookie: cookieHeader },
      redirect: "manual",
    });
    const location5 = res5.headers.get("location") || "";
    assert(
      location5.includes("/hr"),
      `HR opening /candidate redirects to /hr (location: ${location5})`
    );
  } catch (e) {
    assert(false, `Test 5 failed: ${e.message}`);
  }

  // TEST 6: Candidate login & redirect check
  let candCookie = "";
  try {
    const res6 = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "candidate@demo.com", password: "Demo1234" }),
    });
    const data6 = await res6.json();
    candCookie = (res6.headers.get("set-cookie") || "").split(";")[0];
    assert(
      res6.status === 200 && data6.user?.role === "Candidate",
      `Candidate login success (Role: ${data6.user?.role})`
    );

    // Candidate accessing /hr should be redirected to /candidate
    const res6b = await fetch(`${BASE}/hr`, {
      headers: { Cookie: candCookie },
      redirect: "manual",
    });
    const loc6b = res6b.headers.get("location") || "";
    assert(
      loc6b.includes("/candidate"),
      `Candidate opening /hr redirects to /candidate (location: ${loc6b})`
    );
  } catch (e) {
    assert(false, `Test 6 failed: ${e.message}`);
  }

  // TEST 7: Register new account
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const res7 = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test User",
        email: testEmail,
        password: "Password123",
        role: "HR",
      }),
    });
    const data7 = await res7.json();
    assert(
      res7.status === 200 && data7.user?.email === testEmail,
      `User registration works (Created: ${data7.user?.email})`
    );
  } catch (e) {
    assert(false, `Test 7 failed: ${e.message}`);
  }

  // TEST 8: Logout
  try {
    const res8 = await fetch(`${BASE}/api/auth/logout`, { method: "POST" });
    const setCookie = res8.headers.get("set-cookie") || "";
    assert(
      res8.status === 200 && (setCookie.includes("Max-Age=0") || setCookie.includes("Expires=")),
      `Logout clears session cookie`
    );
  } catch (e) {
    assert(false, `Test 8 failed: ${e.message}`);
  }

  console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
  if (passed === total) {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! ✨");
  }
}

runTests();
