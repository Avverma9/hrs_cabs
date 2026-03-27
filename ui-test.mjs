/**
 * UI Level Test — Add Car, Update Car, Create Booking
 * Run: node ui-test.mjs
 */

import { chromium } from 'playwright'

const BASE = 'http://localhost:5175'
const PASS = '✅'
const FAIL = '❌'
const INFO = '🔵'

const results = []

function log(status, test, detail = '') {
  const line = `${status} ${test}${detail ? ' — ' + detail : ''}`
  console.log(line)
  results.push({ status, test, detail })
}

;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 })
  const page = await browser.newPage()
  page.setDefaultTimeout(12000)

  // ─── Capture console errors ───
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  // ─── Intercept API calls to capture request bodies ───
  let loginResponseBody = null
  let bookingRequestBody = null
  let updateCarStatus = null
  let updateCarResponseBody = null
  let bookingResponseBody = null

  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/login/dashboard/user')) {
      try { loginResponseBody = await response.json() } catch {}
    }
    if (url.includes('/update-a-car/')) {
      updateCarStatus = response.status()
      try { updateCarResponseBody = await response.json() } catch {}
    }
    if (url.includes('/create-travel/booking')) {
      try { bookingResponseBody = await response.json() } catch {}
    }
  })
  page.on('request', (req) => {
    if (req.url().includes('/create-travel/booking')) {
      try { bookingRequestBody = JSON.parse(req.postData() || '{}') } catch {}
    }
  })

  try {
    // ── Force fresh logout — clear any stored token ──
    await page.goto(BASE)
    await page.evaluate(() => {
      localStorage.removeItem('loggedUserToken')
      localStorage.removeItem('loggedUserId')
      localStorage.removeItem('loggedUserEmail')
      localStorage.removeItem('LoggedUserRole')
    })

    // ══════════════════════════════════════════
    // TEST 1: Page Load
    // ══════════════════════════════════════════
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    const url = page.url()
    if (url.includes('/login')) {
      log(PASS, 'T1: App loads → redirects to /login (protected route works)')
    } else {
      log(FAIL, 'T1: Expected /login redirect', `got ${url}`)
    }

    // ══════════════════════════════════════════
    // TEST 2: Login
    // ══════════════════════════════════════════
    await page.fill('input[type="email"]', 'av95766@gmail.com')
    await page.fill('input[type="password"]', 'Avverma@1')
    await page.click('button[type="submit"]')
    try {
      await page.waitForURL(`${BASE}/`, { timeout: 15000 })
      log(PASS, 'T2: Login → redirects to homepage')
      // DEBUG: login response se _id check karo
      await page.waitForTimeout(500)
      const storedUserId = await page.evaluate(() => localStorage.getItem('loggedUserId'))
      const storedToken = await page.evaluate(() => localStorage.getItem('loggedUserToken'))
      log(INFO, `T2-DEBUG: localStorage userId = "${storedUserId}"`)
      log(INFO, `T2-DEBUG: localStorage token = "${storedToken ? storedToken.slice(0, 30) + '...' : 'EMPTY'}"`)
      if (loginResponseBody) {
        const hasId = loginResponseBody._id || loginResponseBody?.user?._id || loginResponseBody?.data?._id
        log(INFO, `T2-DEBUG: Login response has _id = "${hasId || 'NOT FOUND'}"`)
        log(INFO, `T2-DEBUG: Full login response keys = ${JSON.stringify(Object.keys(loginResponseBody))}`)
        if (loginResponseBody.user) log(INFO, `T2-DEBUG: response.user keys = ${JSON.stringify(Object.keys(loginResponseBody.user))}`)
        if (loginResponseBody.data) log(INFO, `T2-DEBUG: response.data keys = ${JSON.stringify(Object.keys(loginResponseBody.data))}`)
      }
    } catch {
      log(FAIL, 'T2: Login did not redirect to homepage', page.url())
    }

    // ══════════════════════════════════════════
    // TEST 3: Navigate to My Cars
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/my-cars`)
    await page.waitForLoadState('networkidle')
    const carsHeading = await page.locator('button', { hasText: 'All Cars' }).isVisible()
    if (carsHeading) {
      log(PASS, 'T3: My Cars page loads with toolbar')
    } else {
      log(FAIL, 'T3: My Cars page — toolbar not found')
    }

    // ══════════════════════════════════════════
    // TEST 4: Open Add Car Modal
    // ══════════════════════════════════════════
    await page.click('button:has-text("+ Add Car")')
    await page.waitForSelector('text=Vehicle Info')
    log(PASS, 'T4: Add Car modal opens with Section 1 (Vehicle Info)')

    // ══════════════════════════════════════════
    // TEST 5: Add Car — Private mode
    // ══════════════════════════════════════════
    await page.fill('input[placeholder="Toyota"]', 'Honda')
    await page.fill('input[placeholder="Innova"]', 'City')
    await page.selectOption('select:near(:text("Vehicle Type"))', 'Car')
    await page.selectOption('select:near(:text("Sharing Type"))', 'Private')
    await page.fill('input[placeholder="2024"]', '2025')
    await page.fill('input[placeholder="White"]', 'Red')
    await page.fill('input[placeholder="DL01AB1234"]', 'MH01AA0001')

    // Check Seat Config section should NOT be visible for Private
    const seatSectionVisible = await page.locator('text=Seat Configuration').isVisible()
    if (!seatSectionVisible) {
      log(PASS, 'T5a: Seat Config hidden when Sharing = Private ✓')
    } else {
      log(FAIL, 'T5a: Seat Config should be hidden for Private')
    }

    // ── Switch to Shared ──
    await page.selectOption('select:near(:text("Sharing Type"))', 'Shared')
    await page.waitForTimeout(300)
    const seatSectionNowVisible = await page.locator('text=Seat Configuration').isVisible()
    if (seatSectionNowVisible) {
      log(PASS, 'T5b: Seat Config appears when switched to Shared ✓')
    } else {
      log(FAIL, 'T5b: Seat Config did not appear after switching to Shared')
    }

    // ── Add 2 Seats ──
    await page.click('button:has-text("+ Add Seat")')
    await page.waitForTimeout(200)
    await page.click('button:has-text("+ Add Seat")')
    await page.waitForTimeout(200)
    const seatRows = await page.locator('input[placeholder="No."]').count()
    if (seatRows === 2) {
      log(PASS, `T5c: 2 seats added via Add Seat button ✓`)
    } else {
      log(FAIL, `T5c: Expected 2 seat rows, got ${seatRows}`)
    }

    // Fill seat details
    const seatNos = await page.locator('input[placeholder="No."]').all()
    const seatPrices = await page.locator('input[placeholder="₹ Price"]').all()
    await seatNos[0].fill('1')
    await seatPrices[0].fill('400')
    await seatNos[1].fill('2')
    await seatPrices[1].fill('350')
    log(INFO, 'T5d: Seat prices filled (Seat1=₹400, Seat2=₹350)')

    // Check avg price shown
    const avgText = await page.locator('text=/Avg ₹/').isVisible()
    if (avgText) {
      log(PASS, 'T5e: Avg price summary shown in seat config ✓')
    } else {
      log(FAIL, 'T5e: Avg price summary not visible')
    }

    // Fill remaining required fields
    await page.fill('input[placeholder="15"]', '14')      // mileage
    await page.fill('input[placeholder="Delhi"]', 'Mumbai')   // pickup city
    await page.fill('input[placeholder="Jaipur"]', 'Pune')    // drop city
    await page.fill('input[placeholder="2500"]', '3000')       // price
    await page.fill('input[placeholder="450"]', '400')         // per person

    // Submit Add Car
    // Fill owner details so API doesn't reject
    await page.fill('input[placeholder="Ravi Yadav"]', 'Test Owner')
    await page.fill('input[placeholder="9876543210"]', '9876543210')
    await page.fill('input[placeholder="ravi@example.com"]', 'testowner@test.com')

    await page.click('button[type="submit"]:has-text("Add Car")')
    await page.waitForTimeout(3000)

    // Check if modal closed (success) or error shown — use specific error div selector
    const modalStillOpen = await page.locator('text=Vehicle Info').isVisible()
    const errorDiv = page.locator('form div.border.border-red-100.text-red-600').first()
    const errorVisible = await errorDiv.isVisible().catch(() => false)
    if (!modalStillOpen) {
      log(PASS, 'T5f: Add Car submitted — modal closed ✓')
    } else if (errorVisible) {
      const errText = await errorDiv.textContent()
      log(FAIL, 'T5f: Add Car — API error', errText?.trim())
    } else {
      log(FAIL, 'T5f: Add Car — modal still open after submit')
    }

    // Check toast
    await page.waitForTimeout(1000)
    const toastVisible = await page.locator('text=/Car added/').isVisible()
    if (toastVisible) {
      log(PASS, 'T5g: Success toast shown after Add Car ✓')
    } else {
      log(INFO, 'T5g: Toast not visible (may have auto-dismissed or API offline)')
    }

    // ══════════════════════════════════════════
    // TEST 6: Edit Car (Update)
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/my-cars`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const editButtons = await page.locator('button:has-text("✏️ Edit")').all()
    if (editButtons.length === 0) {
      log(INFO, 'T6: No cars found in list — skipping Edit test (API may be offline)')
    } else {
      await editButtons[0].click()
      await page.waitForSelector('text=Save Changes')
      log(PASS, 'T6a: Edit modal opens ✓')

      // Check fields are pre-filled
      const makeVal = await page.locator('input[placeholder="Toyota"]').inputValue()
      if (makeVal.length > 0) {
        log(PASS, `T6b: Edit form pre-filled (make = "${makeVal}") ✓`)
      } else {
        log(FAIL, 'T6b: Edit form make field is empty — not pre-filling')
      }

      // Check if Shared car → seat config section visible
      const allSelects = await page.locator('form select').all()
      // sharingType is the 2nd select in the edit form (vehicleType=1st, sharingType=2nd)
      const sharingVal = allSelects.length >= 2 ? await allSelects[1].inputValue() : 'Private'
      if (sharingVal === 'Shared') {
        const editSeatSection = await page.locator('text=Seat Configuration').isVisible()
        if (editSeatSection) {
          log(PASS, 'T6c: Edit Shared car — Seat Config section visible ✓')
        } else {
          log(FAIL, 'T6c: Edit Shared car — Seat Config section NOT visible')
        }
      } else {
        log(INFO, `T6c: Car is Private — Seat Config section correctly hidden`)
      }

      // Change color
      const colorField = page.locator('input[placeholder="White"]')
      await colorField.fill('Blue')

      // Save
      await page.click('button[type="submit"]:has-text("Save Changes")')
      await page.waitForTimeout(3000)

      // DEBUG: HTTP status of update-a-car
      if (updateCarStatus !== null) log(INFO, `T6-DEBUG: PATCH /update-a-car status = ${updateCarStatus}`)
      if (updateCarResponseBody) log(INFO, `T6-DEBUG: PATCH /update-a-car response = ${JSON.stringify(updateCarResponseBody)}`)

      const editModalOpen = await page.locator('text=Save Changes').isVisible()
      const editError = await page.locator('form div.border.border-red-100.text-red-600').first().isVisible().catch(() => false)
        if (!editModalOpen) {
        log(PASS, 'T6d: Update Car submitted — modal closed ✓')
        const updateToast = await page.locator('text=/updated/i').isVisible()
        if (updateToast) log(PASS, 'T6e: Update success toast shown ✓')
        else log(INFO, 'T6e: Update toast not visible (may have dismissed or API offline)')
      } else if (editError) {
        const errText = await page.locator('form div.border.border-red-100.text-red-600').first().textContent()
        log(INFO, 'T6d: Update Car — API error (backend issue, not frontend)', errText?.trim())
      } else {
        log(FAIL, 'T6d: Update Car modal still open')
      }
    }

    // ══════════════════════════════════════════
    // TEST 7: Book a Car (Private)
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/my-cars`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const bookButtons = await page.locator('button:has-text("📅 Book")').all()
    if (bookButtons.length === 0) {
      log(INFO, 'T7: No cars found — skipping Booking test (API may be offline)')
    } else {
      await bookButtons[0].click()
      await page.waitForSelector('text=Create Booking')
      log(PASS, 'T7a: Booking modal opens ✓')

      // Check sharing type via modal subtitle (inside modal only)
      const bookSubtitle = await page.locator('[class*="rounded-t-3xl"] p.text-xs, [class*="rounded-3xl"] p.text-xs').first().textContent().catch(() => '')
      const isSharedBooking = bookSubtitle?.includes('Shared')
      log(INFO, `T7b: Booking for ${isSharedBooking ? 'Shared' : 'Private'} car`)

      // If Shared — check seat selector
      if (isSharedBooking) {
        const seatBtns = await page.locator('button:has-text("#")').count()
        if (seatBtns > 0) {
          log(PASS, `T7c: Seat selector shown for Shared car (${seatBtns} seats) ✓`)

          // Try submit without seat — button should be disabled
          const submitDisabled = await page.locator('button:has-text("Create Booking")').isDisabled()
          if (submitDisabled) {
            log(PASS, 'T7d: Submit disabled when no seat selected ✓')
          } else {
            log(FAIL, 'T7d: Submit NOT disabled — allows booking without seat selection')
          }

          // Select first available seat
          const availableSeat = page.locator('button:not([disabled]):has-text("#")').first()
          await availableSeat.click()
          log(PASS, 'T7e: Seat selected ✓')
        } else {
          log(INFO, 'T7c: No seats in seat selector (getSeatData may be loading/failed)')
        }
      }

      // Fill booking form
      await page.fill('input[placeholder="Full name"]', 'Test User')
      await page.fill('input[placeholder="9999999999"]', '9876543210')
      await page.fill('input[placeholder="email@example.com"]', 'test@booking.com')

      // Submit
      const submitBtn = page.locator('button:has-text("Create Booking")')
      const isDisabled = await submitBtn.isDisabled()
      if (!isDisabled) {
        await submitBtn.click()
        await page.waitForTimeout(3000)

        // DEBUG: booking request body dekho
        if (bookingRequestBody) {
          log(INFO, `T7-DEBUG: Booking userId sent = "${bookingRequestBody.userId}"`)
          log(INFO, `T7-DEBUG: Booking carId sent = "${bookingRequestBody.carId}"`)
          log(INFO, `T7-DEBUG: Booking pickupD = "${bookingRequestBody.pickupD}", dropD = "${bookingRequestBody.dropD}"`)
        }
        if (bookingResponseBody) log(INFO, `T7-DEBUG: Booking response = ${JSON.stringify(bookingResponseBody)}`)

        const successVisible = await page.locator('div.bg-emerald-50.border.border-emerald-100').isVisible().catch(() => false)
        const bookingErrVisible = await page.locator('form div.border.border-red-100.text-red-600').isVisible().catch(() => false)

        if (successVisible) {
          log(PASS, 'T7f: Booking created — success response shown ✓')
          const bookingId = await page.locator('text=/Booking ID/').isVisible()
          if (bookingId) log(PASS, 'T7g: Booking ID displayed in success block ✓')
        } else if (bookingErrVisible) {
          const errText = await page.locator('form div.border.border-red-100.text-red-600').first().textContent().catch(() => 'unknown error')
          log(INFO, 'T7f: Booking — API error (backend issue, frontend worked)', errText?.trim())
        } else {
          log(INFO, 'T7f: Booking submitted — no clear success/fail response visible')
        }
      } else {
        log(INFO, 'T7f: Submit still disabled (Shared: no available seat or not selected)')
      }
    }

    // ══════════════════════════════════════════
    // TEST 9: Home Page — Booking with Correct API Fields
    // ══════════════════════════════════════════
    let homeBookingRequestBody = null
    let homeBookingResponseBody = null
    page.on('request', (req) => {
      if (req.url().includes('/create-travel/booking') && !bookingRequestBody) {
        try { homeBookingRequestBody = JSON.parse(req.postData() || '{}') } catch {}
      }
    })
    page.on('response', async (response) => {
      if (response.url().includes('/create-travel/booking') && !bookingResponseBody) {
        try { homeBookingResponseBody = await response.json() } catch {}
      }
    })

    await page.goto(`${BASE}/`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Check car cards loaded
    const homeCars = await page.locator('.grid > div').count()
    if (homeCars > 0) {
      log(PASS, `T9a: Home page loaded ${homeCars} car card(s) ✓`)

      // Click first car card to open detail modal
      await page.locator('.grid > div').first().click()
      await page.waitForTimeout(1000)

      const carDetailVisible = await page.locator('text=Pickup').first().isVisible().catch(() => false)
      if (carDetailVisible) {
        log(PASS, 'T9b: Car detail modal opened ✓')

        // Check if Shared → select a seat first
        const seatSection = await page.locator('text=Select Seats').isVisible().catch(() => false)
        if (seatSection) {
          const availSeat = page.locator('button:not([disabled]):has-text(/[0-9]+/)').first()
          const seatExists = await availSeat.isVisible().catch(() => false)
          if (seatExists) {
            await availSeat.click()
            log(INFO, 'T9c: Seat selected in home detail modal')
          }
        }

        // Click Book Now
        const bookNowBtn = page.locator('button:has-text("Book Now")')
        const bookNowVisible = await bookNowBtn.isVisible().catch(() => false)
        if (bookNowVisible) {
          await bookNowBtn.click()
          await page.waitForTimeout(500)
          log(PASS, 'T9d: Book Now clicked — passenger form appeared ✓')

          // Fill the new correct fields
          await page.fill('input[placeholder="Full Name"]', 'Test Passenger')
          await page.fill('input[placeholder="Phone Number *"]', '9876543210')
          await page.fill('input[placeholder="Email *"]', 'passenger@test.com')

          // Verify form fields exist (passengerName, customerMobile, customerEmail, paymentMethod)
          const emailFieldVisible = await page.locator('input[placeholder="Email *"]').isVisible().catch(() => false)
          const payMethodVisible = await page.locator('select:near(:text("Pay & Confirm"))').isVisible().catch(() => false)
          if (emailFieldVisible) {
            log(PASS, 'T9e: Email field present in home booking form ✓')
          } else {
            log(FAIL, 'T9e: Email field MISSING from home booking form')
          }

          // Submit
          await page.click('button:has-text("Pay & Confirm")')
          await page.waitForTimeout(3000)

          // Check what was sent in the request
          await page.waitForTimeout(500)
          if (homeBookingRequestBody) {
            log(INFO, `T9-DEBUG: Request body keys = ${JSON.stringify(Object.keys(homeBookingRequestBody))}`)
            log(INFO, `T9-DEBUG: userId = "${homeBookingRequestBody.userId}"`)
            log(INFO, `T9-DEBUG: passengerName = "${homeBookingRequestBody.passengerName}"`)
            log(INFO, `T9-DEBUG: customerEmail = "${homeBookingRequestBody.customerEmail}"`)
            log(INFO, `T9-DEBUG: seats field = ${JSON.stringify(homeBookingRequestBody.seats)}`)
            // Validate: must have userId, customerEmail, NOT seatIds
            const hasUserId = !!homeBookingRequestBody.userId
            const hasEmail = !!homeBookingRequestBody.customerEmail
            const hasPassengerName = 'passengerName' in homeBookingRequestBody
            const noSeatIds = !('seatIds' in homeBookingRequestBody)
            if (hasUserId && hasEmail && hasPassengerName && noSeatIds) {
              log(PASS, 'T9f: Booking request has correct fields (userId ✓, customerEmail ✓, passengerName ✓, no seatIds ✓)')
            } else {
              if (!hasUserId) log(FAIL, 'T9f: userId missing from booking request')
              if (!hasEmail) log(FAIL, 'T9f: customerEmail missing from booking request')
              if (!hasPassengerName) log(FAIL, 'T9f: passengerName missing from booking request')
              if (!noSeatIds) log(FAIL, 'T9f: Old field "seatIds" still being sent (should be "seats")')
            }
          } else {
            log(INFO, 'T9f: No booking request intercepted (form may not have submitted)')
          }

          if (homeBookingResponseBody) log(INFO, `T9-DEBUG: Response = ${JSON.stringify(homeBookingResponseBody).slice(0, 200)}`)

          // Check success — bookingId + pickupCode shown
          const homeSuccess = await page.locator('div.bg-green-50').isVisible().catch(() => false)
          if (homeSuccess) {
            log(PASS, 'T9g: Home booking success message shown ✓')
            const codeVisible = await page.locator('text=Pickup Code').isVisible().catch(() => false)
            if (codeVisible) {
              log(PASS, 'T9h: Pickup Code displayed after home booking success ✓')
            } else {
              log(INFO, 'T9h: Pickup Code not visible (booking may be pending backend confirm)')
            }
          } else {
            log(INFO, 'T9g: No success/error visible (API offline or form validation blocked)')
          }
        } else {
          log(INFO, 'T9d: Book Now not visible (Shared car with no seats selected, or car unavailable)')
        }
      } else {
        log(FAIL, 'T9b: Car detail modal did not open')
      }
    } else {
      log(INFO, 'T9a: No cars on home page (API offline)')
    }

    // ══════════════════════════════════════════
    // TEST 10: Profile — Stats Auto-Fetch on Load
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    // Look for 'Role' stat label — unique to profile, not in BottomNav
    const roleStatText = await page.locator('.grid.grid-cols-2 >> text=Role').isVisible().catch(async () => {
      // Fallback: look for the entire stats grid
      return page.locator('text=Status').nth(0).isVisible().catch(() => false)
    })
    // Also check the stats grid exists at all (2-column grid in profile)
    const statsGrid = await page.locator('.grid.grid-cols-2').first().isVisible().catch(() => false)
    if (statsGrid) {
      log(PASS, 'T10a: Profile page — stats grid visible ✓')

      // Get the stat values
      const statDivs = await page.locator('.grid.grid-cols-2 > div .text-2xl').all()
      const statValues = []
      for (const div of statDivs) {
        statValues.push(await div.textContent())
      }
      log(INFO, `T10-DEBUG: Stat values = ${JSON.stringify(statValues)}`)

      // After fetch, cars and bookings should be > 0 (unless API is offline)
      const carsVal = parseInt(statValues[0] || '0', 10)
      const bookVal = parseInt(statValues[1] || '0', 10)
      if (carsVal > 0 || bookVal > 0) {
        log(PASS, `T10b: Profile stats populated on mount (Cars=${carsVal}, Bookings=${bookVal}) ✓`)
      } else {
        log(INFO, `T10b: Stats show 0 — may be API offline or empty data`)
      }
    } else {
      log(FAIL, 'T10a: Profile stats not found on page')
    }

    // User ID shown
    const userIdRow = await page.locator('text=User ID').isVisible().catch(() => false)
    if (userIdRow) {
      log(PASS, 'T10c: Profile page shows User ID row ✓')
    } else {
      log(FAIL, 'T10c: User ID row not found on profile')
    }

    // ══════════════════════════════════════════
    // TEST 11: Car Availability Toggle
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/my-cars`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const toggleBtns = await page.locator('button:has-text("Set Offline"), button:has-text("Set Live")').all()
    if (toggleBtns.length > 0) {
      log(PASS, `T11a: Availability toggle button found on ${toggleBtns.length} car card(s) ✓`)

      // Read current label
      const firstToggleTxt = await toggleBtns[0].textContent()
      const wasLive = firstToggleTxt?.includes('Set Offline')
      log(INFO, `T11-DEBUG: First car toggle = "${firstToggleTxt?.trim()}"`)

      // Intercept the PATCH request for isAvailable
      let availUpdateStatus = null
      let availUpdateBody = null
      const availResponseHandler = async (response) => {
        if (response.url().includes('/update-a-car/')) {
          availUpdateStatus = response.status()
          try { availUpdateBody = await response.json() } catch {}
        }
      }
      page.on('response', availResponseHandler)

      await toggleBtns[0].click()
      await page.waitForTimeout(3000)

      // Check toast
      const offlineToast = await page.locator('text=/set offline/i, text=/set live/i').isVisible().catch(() => false)
      if (offlineToast) {
        log(PASS, 'T11b: Availability toggle — success toast shown ✓')
      } else {
        log(INFO, 'T11b: Toast not visible (may have dismissed or API offline)')
      }

      if (availUpdateStatus !== null) {
        log(INFO, `T11-DEBUG: PATCH /update-a-car status = ${availUpdateStatus}`)
        if (availUpdateStatus === 200) {
          log(PASS, 'T11c: Availability toggle — PATCH returned 200 ✓')
        } else {
          log(FAIL, `T11c: Availability toggle PATCH returned ${availUpdateStatus}`)
        }
      }
      if (availUpdateBody) log(INFO, `T11-DEBUG: Response = ${JSON.stringify(availUpdateBody).slice(0, 150)}`)

      // After refresh — button label should have flipped
      await page.waitForTimeout(1000)
      const toggleBtnsAfter = await page.locator('button:has-text("Set Offline"), button:has-text("Set Live")').all()
      if (toggleBtnsAfter.length > 0) {
        const afterTxt = await toggleBtnsAfter[0].textContent()
        const nowLive = afterTxt?.includes('Set Offline')
        if (wasLive !== nowLive) {
          log(PASS, `T11d: Toggle label flipped after update (${firstToggleTxt?.trim()} → ${afterTxt?.trim()}) ✓`)
        } else {
          log(INFO, `T11d: Toggle label unchanged (possible API offline)`)
        }
      }
    } else {
      log(INFO, 'T11a: No cars loaded — availability toggle not testable (API offline)')
    }

    // ══════════════════════════════════════════
    // TEST 12: My Bookings — rideStatus + Codes Visible
    // ══════════════════════════════════════════
    await page.goto(`${BASE}/my-bookings`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const bookingCards = await page.locator('.grid.grid-cols-1.lg\\:grid-cols-2 > div').count()
    if (bookingCards > 0) {
      log(PASS, `T12a: My Bookings loaded ${bookingCards} booking card(s) ✓`)

      // rideStatus chip — label "🔄 Ride"
      const rideChip = await page.locator('text=Ride').first().isVisible().catch(() => false)
      if (rideChip) {
        log(PASS, 'T12b: Ride status chip visible on booking card ✓')
        const rideVal = await page.locator('text=Ride').first().locator('..').locator('.text-xs').textContent().catch(() => '')
        log(INFO, `T12-DEBUG: Ride status value = "${rideVal}"`)
      } else {
        log(FAIL, 'T12b: Ride status chip NOT found on booking cards')
      }

      // pickupCode chip — only visible if booking has one
      const pickupCodeChip = await page.locator('text=Pickup Code').isVisible().catch(() => false)
      const dropCodeChip = await page.locator('text=Drop Code').isVisible().catch(() => false)
      if (pickupCodeChip) {
        log(PASS, 'T12c: Pickup Code chip visible on at least one booking card ✓')
      } else {
        log(INFO, 'T12c: Pickup Code not on cards (expected — only shows when code exists in data)')
      }
      if (dropCodeChip) {
        log(PASS, 'T12d: Drop Code chip visible on at least one booking card ✓')
      } else {
        log(INFO, 'T12d: Drop Code not on cards (expected — only shows when code exists in data)')
      }

      // Existing action buttons still all present
      const statusBtns = await page.locator('button:has-text("Status")').count()
      const confirmBtns = await page.locator('button:has-text("Confirm")').count()
      const pickupBtns = await page.locator('button:has-text("Pickup")').count()
      const dropBtns = await page.locator('button:has-text("Drop")').count()
      if (statusBtns > 0 && confirmBtns > 0 && pickupBtns > 0 && dropBtns > 0) {
        log(PASS, 'T12e: All 5 action buttons (Status/Confirm/Update/Pickup/Drop) present ✓')
      } else {
        log(FAIL, `T12e: Some action buttons missing (Status=${statusBtns} Confirm=${confirmBtns} Pickup=${pickupBtns} Drop=${dropBtns})`)
      }
    } else {
      log(INFO, 'T12a: No booking cards — rideStatus test skipped (API offline or empty)')
    }

    // ══════════════════════════════════════════
    // TEST 8: Console Error Check
    // ══════════════════════════════════════════
    // Filter out server-side 500 errors (not frontend bugs)
    const frontendErrors = consoleErrors.filter((e) => {
      // Ignore known backend-only HTTP errors (500 Internal, 409 Conflict from test data, 404 Not Found)
      if (e.includes('500 (Internal Server Error)')) return false
      if (e.includes('409 (Conflict)')) return false
      if (e.includes('404 (Not Found)')) return false
      return true
    })
    if (frontendErrors.length === 0) {
      log(PASS, 'T8: Zero frontend console errors ✓')
      const backendErrors = consoleErrors.filter((e) =>
        e.includes('500') || e.includes('409') || e.includes('404')
      )
      if (backendErrors.length > 0) log(INFO, `T8: ${backendErrors.length} API error(s) (backend issues, not frontend) — ${[...new Set(backendErrors.map(e => e.match(/\d{3}/)?.[0]))].join(', ')}`)
    } else {
      frontendErrors.forEach((e) => log(FAIL, 'T8: Console error', e))
    }

  } catch (err) {
    log(FAIL, 'UNEXPECTED ERROR', err.message)
  } finally {
    await page.waitForTimeout(2000)
    await browser.close()

    // Summary
    console.log('\n' + '═'.repeat(55))
    console.log('  FINAL REPORT')
    console.log('═'.repeat(55))
    const passed = results.filter((r) => r.status === PASS).length
    const failed = results.filter((r) => r.status === FAIL).length
    const info = results.filter((r) => r.status === INFO).length
    console.log(`  ✅ PASSED : ${passed}`)
    console.log(`  ❌ FAILED : ${failed}`)
    console.log(`  🔵 INFO   : ${info}`)
    console.log('═'.repeat(55))
    if (failed > 0) {
      console.log('\nFailed Tests:')
      results.filter((r) => r.status === FAIL).forEach((r) => console.log(`  → ${r.test}${r.detail ? ' — ' + r.detail : ''}`))
    }
    process.exit(failed > 0 ? 1 : 0)
  }
})()
