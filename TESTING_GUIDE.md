# QA TESTING GUIDE - STEP BY STEP

**App URL:** http://localhost:8084/  
**Test Date:** February 21, 2026  
**Duration:** ~2-3 hours for full test cycle

---

## QUICK START - 5 MINUTE SMOKE TEST

### Smoke Test (Does it work at all?)
1. Open http://localhost:8084/ in browser
2. Click on "Owner Profile" 
3. Fill basic info:
   - Name: Test Owner
   - Contact: +91-9876543210
4. Upload any image from your device
5. ✅ Verify toast shows: "Photo saved: XXX KB (reduced YY%)"
6. Click Save
7. ✅ Verify no error, data saves
8. Open browser console (F12)
9. Run: `localStorage.getItem('owners')?.length / 1024 / 1024` 
10. ✅ Should show <1 MB

**Expected:** ✅ PASS (App is working)

---

## DETAILED TEST FLOW

### STEP 1: Create Owner #1 - Rajesh Kumar (15 mins)

**Navigate:**
- Home → Click "Owner Profile" button

**Fill Form:**
```
Name:              Rajesh Kumar
Contact:           +91-9876543210
Email:             rajesh.kumar@email.com
Property Address:  123 MG Road, Bangalore
City:              Bangalore
State:             Karnataka
Pincode:           560001
Landmark:          Near Airport
```

**Upload Photo:**
1. Click "Upload Photos" section
2. Select a medium-sized image from your device (2-5 MB)
   - If you don't have one, you can use a screenshot or download one
3. ✅ Verify toast appears: **"Compressing photo 1/1..."**
4. ✅ Wait for success: **"Photo saved: 345 KB (reduced 87%)"**
   - Note the actual compression percentage

**Upload Video:**
1. Click "Upload Videos" section
2. Select a video from your device (10-30 MB)
   - If needed, use a sample from your Downloads/Videos folder
3. ✅ Verify toast: **"Processing video 1/1..."**
4. ✅ Wait for result: **"Video optimized: 65 KB (compressed 99%)"**
   - Videos should show VERY high compression (>95%)

**Check Compression Info:**
- Scroll down to storage info panel
- ✅ Verify shows: "✅ Photos: Automatically compressed to 60% quality, max 800px"
- ✅ Verify shows: "✅ Videos: Extracted as optimized previews (80%+ size reduction)"

**Save:**
1. Click "Save Profile" button
2. ✅ Verify no error toast appears
3. ✅ Verify success message (if any)

**Verify Persistence:**
1. Refresh page (F5)
2. Navigate back to Owner Profile
3. ✅ Verify all data still appears
4. ✅ Verify photo still displays
5. ✅ Verify video thumbnail displays (if applicable)

---

### STEP 2: Create Owners #2-10 (10× 10 mins = 100 mins)

**Owner #2 - Priya Sharma (Multiple Photos)**
```
Name:              Priya Sharma
Contact:           +91-9876543211
Email:             priya.sharma@email.com
Address:           456 Brigade Avenue, Bangalore
Photos:            3 different property photos
Video:             1 property tour
```
- Upload photos ONE BY ONE (don't select all at once to see each compression)
- Watch each progress: "Compressing photo 1/3...", "Compressing photo 2/3...", etc.
- ✅ Each should show individual reduction %: "Photo saved: XXX KB (reduced YY%)"
- Save profile

**Owner #3 - Amit Patel (Heavy Video)**
```
Name:              Amit Patel
Contact:           +91-9876543212
Video Size:        Large video (30-50 MB if possible)
Photos:            1 photo
```
- Upload large video
- ✅ Should show very high compression % (>95%)
- If video is >20 MB, system extracts thumbnail instead
- Save profile

**Owner #4 - Sarah Johnson (Small Files Only)**
```
Name:              Sarah Johnson
Contact:           +1-555-1234
Photos:            2 small photos (<500 KB each)
Video:             None (Test text-only profile)
```
- Upload small photos
- ✅ Should still compress but maybe show smaller percentages
- Save profile

**Owner #5 - Heavy Media Test**
```
Name:              Heavy Media Test
Contact:           +91-9876543213
Photos:            4 photos (mix of sizes)
Videos:            2-3 videos
```
- Upload all media
- ✅ Monitor total size display
- ✅ Verify "Compressed Total: X.XX MB" stays reasonable

**Owner #6-10: Quick Variations**
- Fill remaining 5 owners with varied data
- Mix of phone/contact formats
- Mix of media amounts
- At least one with no media (text only)

**Monitor Storage After Each:**
In browser console (F12), periodically run:
```javascript
const sizes = {};
['owners', 'landForms', 'media'].forEach(key => {
  const data = localStorage.getItem(key);
  sizes[key] = data ? (data.length / 1024 / 1024).toFixed(2) + ' MB' : '0 MB';
});
console.table(sizes);
const total = Object.values(sizes).reduce((sum, val) => {
  return sum + parseFloat(val);
}, 0);
console.log('TOTAL:', total.toFixed(2), 'MB');
```

✅ **Expected Total: 2-4 MB for 10 owner profiles**

---

### STEP 3: Test Forms (6 Forms × 15 mins = 90 mins)

#### Form #1: Site Visit Form

**Navigate:** Home → "Forms" → "Site Visit Form"

**Fill Fields:**
```
Visit Date:         2026-02-21
Location:           Bangalore, Karnataka
Area (Sqft):        5000
Price (₹):          5000000
Nearest Landmark:   2 km from airport
Accessibility:      Yes
Utilities:          Water, Electricity, Good Roads
```

**Upload Media:**
1. Click Photo upload
2. Add 2-3 property photos
3. ✅ Each shows compression message
4. Click Video upload
5. Add 1 walkthrough video (if available)
6. ✅ Verify video compression message

**Save Form:**
1. Click "Save Form Data"
2. ✅ Verify no "Storage quota exceeded" error
3. ✅ Should see success or completion message

**Navigation Test:**
1. Go to Home
2. Come back to Site Visit Form
3. ✅ Verify all data, photos, videos persist

---

#### Form #2: Owner Meeting Form

**Fill Fields:**
```
Meeting Date:       2026-02-21
Meeting Type:       Discussion
Duration:           2 hours
Attendees:          Owner, Agent, Broker
Price Discussed:    4800000
Agreement:          Yes
```

**Upload Media:**
- Upload 2 photos (meeting photo + document)
- ✅ Verify compression messages
- Save form
- ✅ Verify persistence on reload

---

#### Form #3: Mediation Form

**Fill Fields:**
```
Mediation Date:     2026-02-20
Mediator:           Advocate Singh
Issue:              Price dispute
Resolution:         Agreed on 4850000
```

**Upload Media:**
- Upload property photo + agreement photo
- Save form
- ✅ Verify all data persists

---

#### Form #4: Buyer-Seller Meeting Form

**Fill Fields:**
```
Meeting Date:       2026-02-21
Buyer Name:         Arjun Desai
Seller Name:        Rajesh Kumar
Agreement Terms:    10% advance in 7 days
```

**Upload Media:**
- Upload contract photo + meeting photo
- Save form

---

#### Form #5: Meeting Place Form

**Fill Fields:**
```
Location Name:      Coffee House
Address:            Brigade Road, Bangalore
Meeting Time:       2:00 PM - 4:00 PM
Facilities:         WiFi, Meeting Room
```

**Upload Media:**
- Upload venue photos (3 photos)
- Save form

---

#### Form #6: Advance Registration Form

**Fill Fields:**
```
Buyer Name:         Priya Sharma
Amount Paid (₹):    500000
Payment Mode:       Bank Transfer
Payment Date:       2026-02-19
```

**Upload Media:**
- Upload receipt photo + agreement photo
- Save form

---

### STEP 4: PDF Download Test (15 mins)

**Test PDF Export #1:**
1. Go to Owner Profile (with media)
2. ✅ Look for "Download PDF" button
3. Click it
4. ✅ PDF should download
5. Open the PDF file
6. ✅ Verify all data is there
7. ✅ Verify photos are embedded
8. ✅ Layout looks professional

**Test PDF Export #2:**
1. Go to Site Visit Form (completed)
2. Click "Download PDF"
3. ✅ PDF downloads
4. Open and verify content

**Test PDF Export #3:**
1. Go to another form
2. Click "Download PDF"
3. ✅ All PDFs should work

---

### STEP 5: Storage Verification (10 mins)

**Open Browser Console:**
Press F12 → Click "Console" tab

**Check Storage Sizes:**
```javascript
// Test 1: Check ALL localStorage
console.log('Total localStorage items:');
const allKeys = Object.keys(localStorage);
console.log(allKeys);

// Test 2: Calculate sizes
const storage = {};
['owners', 'landForms', 'media'].forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    const bytes = data.length;
    const mb = (bytes / 1024 / 1024).toFixed(3);
    storage[key] = {
      'Size (MB)': mb,
      'Size (Bytes)': bytes
    };
  }
});
console.table(storage);

// Test 3: Calculate total
let total = 0;
allKeys.forEach(key => {
  total += localStorage.getItem(key)?.length || 0;
});
console.log('TOTAL STORAGE USED:', (total / 1024 / 1024).toFixed(2), 'MB');
console.log('Browser Limit: ~5-10 MB');
console.log('Remaining:', ((10 * 1024 * 1024 - total) / 1024 / 1024).toFixed(2), 'MB');
```

✅ **Expected Output:**
- Total storage: **2-5 MB** (well under limit)
- No values should be undefined
- All keys should be present

---

### STEP 6: Error Handling Tests (10 mins)

**Test 6.1: Large Video Upload**
1. Find a large video (50+ MB if available)
2. Try to upload
3. ✅ Should either:
   - Compress successfully, OR
   - Show a helpful error message

**Test 6.2: Invalid File Type**
1. Try to upload a PDF or DOCX file
2. ✅ Should reject with error message
3. ✅ Should not crash app

**Test 6.3: Multiple Rapid Uploads**
1. Select 5 photos at once
2. ✅ Should process sequentially:
   - "Compressing photo 1/5..."
   - "Compressing photo 2/5..."
   - etc.
3. ✅ All should compress successfully

---

## FINAL VERIFICATION CHECKLIST

After completing all steps above, verify:

### ✅ Core Functionality
- [ ] Owner profiles save and load correctly (10/10)
- [ ] All 6 forms save and load correctly
- [ ] All photos display after reload
- [ ] All videos show thumbnails/references
- [ ] No data corruption

### ✅ Compression
- [ ] Photos compress 75-90%
- [ ] Videos compress 95%+
- [ ] Compression messages show accurate percentages
- [ ] Compressed files are visually acceptable

### ✅ Storage
- [ ] Total storage < 5 MB
- [ ] No "Storage quota exceeded" errors
- [ ] Storage info displays correctly
- [ ] All data persists on page reload

### ✅ PDF Export
- [ ] PDFs download successfully
- [ ] PDFs include all form data
- [ ] PDFs include images
- [ ] PDFs are readable

### ✅ User Experience
- [ ] Loading toasts appear during compression
- [ ] Success messages show savings %
- [ ] Error messages are clear
- [ ] App remains responsive throughout

### ✅ Error Handling
- [ ] Large files handled gracefully
- [ ] Invalid files rejected
- [ ] No console errors
- [ ] All error messages are helpful

---

## TROUBLESHOOTING DURING TESTING

### Issue: "Storage quota exceeded" error
**Solution:**
- Open DevTools → Console
- Run: `localStorage.clear()`
- Refresh page
- Try again
- This should not happen with compression enabled

### Issue: Photo not displaying after save
**Solution:**
- Refresh page (F5)
- Photo should appear from localStorage
- Check console for errors (F12)

### Issue: Video thumbnail not showing
**Solution:**
- Large videos extract as thumbnail only
- Small videos may show as-is
- This is expected behavior
- Check compression message confirms video was processed

### Issue: PDF not downloading
**Solution:**
- Check browser's download permissions
- Allow pop-ups for this website
- Try different browser if problem persists

---

## TEST SUMMARY TEMPLATE

After completing all tests, fill in:

**Date:** _______________  
**Tester:** _______________  
**Time Spent:** _______________  

### Results:
- Owner Profiles Created: ___ / 10 ✅
- Forms Completed: ___ / 6 ✅
- PDFs Downloaded: ___ / 10 ✅
- Total Storage Used: ___ MB / 10 MB
- Compression Ratio: ___ % (Target: >90%)

### Issues Found:
1. _______________
2. _______________
3. _______________

### Overall Status:
- [ ] ✅ PASSED - All tests successful
- [ ] ⚠️ PASSED WITH MINOR ISSUES
- [ ] ❌ FAILED - Critical issues found

**Comments:**
_________________________________________________________________

