# Bug Report — Travel Module

> ✅ All bugs resolved. Tested via Playwright (real login: `av95766@gmail.com`)
> Final result: **16 PASSED | 0 FAILED**

---

## Bug 1 — Update Car ✅ FIXED (backend deploy)

`PATCH /travel/update-a-car/:id` — was returning 500, now returns 200.

---

## Bug 2 — Create Booking ✅ FIXED (backend: pickupD/dropD required removed)

`POST /travel/create-travel/booking` — was failing with:
```
CarBooking validation failed: pickupD: Path `pickupD` is required., dropD: Path `dropD` is required.
```
Now returns 201 with `bookingId`, `pickupCode`, `dropCode`.

