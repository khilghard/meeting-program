# 📘 meeting-program

Provides meeting notes highlighting the program for the day. Hosted on a GitHub Page and pulling data dynamically from Google Sheets. Designed for use on phones and tablets during sacrament meetings via QR code.

---

## 🖼️ Site Assets

Local units should **not** use official Church wordmarks or copyrighted branding.  
This program avoids those assets and focuses on simple, readable, unit‑generated content.

The program is intended for:

- Members attending in person  
- Quick access via QR code  
- Mobile‑friendly display  
- Weekly updates without redeployment  

---

## 🌐 Hosting on GitHub

The page is hosted as a GitHub Pages project site:

```
https://khilghard.github.io/meeting-program/
```

GitHub Pages automatically builds and deploys the site after merges into `master`.

Learn more:  
> GitHub Pages allows you to publish static websites directly from a repository.

---

## 🧪 Debugging Locally

To run the site locally with the same `/meeting-program/` path structure as GitHub Pages:

```bash
npm run dev
```

Then open:

```
http://localhost:8000/meeting-program/
```

---

## 🌱 Feature Work

1. Branch from `develop`  
2. Implement your feature  
3. Push your branch  
4. Open a pull request back into `develop`  

This keeps `master` clean and deploy‑ready.

---

## 🚀 Deploying

To deploy:

1. Open a pull request from `develop` → `master`  
2. Merge the PR  
3. GitHub Actions runs the `pages-build-deployment` workflow  
4. The site updates automatically

Learn more:  
> GitHub Actions automates CI/CD workflows, including GitHub Pages deployments.

---

## 📊 Google Sheets Setup (For Normal Users)

This section explains how to create your own Google Sheet, format it correctly, share it safely, and generate the link needed for the QR code. Anyone in your unit can follow these steps — no technical background required.

---

### 📝 1. Create Your Google Sheet

1. Go to **https://sheets.google.com**
2. Click **Blank**
3. Rename the sheet (e.g., “Sacrament Program”)
4. Create two columns:

```
A: key
B: value
```

Your sheet should look like:

| key         | value                    |
|-------------|--------------------------|
| unitName    | Your Ward Name           |
| unitAddress | 123 Main St, City, State |
| date        | January 1, 2026          |
| openingHymn | #62 All Creatures…       |
| …           | …                        |

You can copy/paste the example table below directly into your sheet.

---

### 🧩 2. Follow the Required Format

The app expects:

- **Column A** → the key (e.g., `unitName`, `speaker1`, `closingHymn`)
- **Column B** → the value (what appears in the program)

Guidelines:

- No extra columns  
- No blank rows in the middle  
- Delete rows you don’t need  
- Keep keys exactly as shown (case‑sensitive)  

---

### 🔒 3. Set Sharing Permissions Correctly

Your sheet must be viewable by anyone who scans your QR code — but **not editable**.

Steps:

1. Click **Share** (top‑right)
2. Select **Anyone with the link**
3. Set permission to **Viewer**
4. Copy the link (you’ll need it next)

This ensures:

- Members can load the program  
- Only authorized editors can make changes  

---

### 🔗 4. Convert the Sheet to a CSV Export Link

The app does **not** use the normal Google Sheets link.  
It needs a special CSV export link.

#### How to get it:

1. Look at your sheet’s URL:

```
https://docs.google.com/spreadsheets/d/ABC123XYZ/edit#gid=0
```

2. Copy the ID between `/d/` and `/edit`:

```
ABC123XYZ
```

3. Build the CSV link:

```
https://docs.google.com/spreadsheets/d/ABC123XYZ/gviz/tq?tqx=out:csv
```

This is the link your PWA loads.

---

## 🧩 Keys & Values Reference

The meeting program is generated entirely from the **key/value pairs** in your Google Sheet.  
Each row represents one piece of information the app will display.

This section explains:

- What each key means  
- What type of value it expects  
- How it appears in the program  
- Whether it is optional or required  

This helps both technical and non‑technical users build sheets confidently.

---

### 📘 How Keys Work

- **Keys** are fixed identifiers the app recognizes (e.g., `unitName`, `speaker1`, `openingHymn`).
- **Values** are the text you want displayed in the program.
- Keys must be **spelled exactly** as shown — they are case‑sensitive.
- You can include as many or as few rows as you want.
- Rows appear in the program **in the same order** they appear in your sheet.

---

### 🗂️ Key Categories

To make things easier, keys fall into several groups:

1. **Unit Information**
2. **Program Structure**
3. **Speakers & Hymns**
4. **Leaders**
5. **Links & Resources**
6. **General Statements**
7. **Section Breaks**

Each group is explained below.

---

### 1️⃣ Unit Information

These keys define the header of the program.

| Key          | Description | Example Value | Required |
|--------------|-------------|---------------|----------|
| `unitName`   | Name of your ward/branch | “Maplewood Ward” | Yes |
| `unitAddress`| Meetinghouse address | “123 Main St, City, ST” | Yes |
| `date`       | Date of the meeting | “January 1, 2026” | Yes |
| `link`       | A link to your unit homepage | `Homepage \| https://...` | Optional |
| `speaker4`   | A speaker in the meeting | John Smith | Optional |

**Notes:**
- Use `|` to separate link text from the URL.
- The app formats these automatically.

---

### 2️⃣ Program Structure

These keys define who is conducting, presiding, and directing music.

| Key             | Description | Example Value |
|-----------------|-------------|---------------|
| `presiding`     | Who is presiding | “Bishop Smith” |
| `conducting`    | Who is conducting | “Brother Jones” |
| `musicDirector` | Music director | “Sister Brown” |
| `musicOrganist` | Organist | “Brother Lee” |

All optional — include only what your unit uses.

---

### 3️⃣ Speakers & Hymns

These keys define the main flow of the meeting.

| Key               | Description | Example Value |
|-------------------|-------------|---------------|
| `openingHymn`     | Opening hymn | “#62 All Creatures of Our God and King” |
| `openingPrayer`   | Opening prayer | “By Invitation” |
| `sacramentHymn`   | Sacrament hymn | “#188 Thy Will, O Lord, Be Done” |
| `speaker1`        | First speaker | “Sister Johnson” |
| `speaker2`        | Second speaker | “Elder Brown” |
| `speaker3`        | Third speaker | “Youth Speaker” |
| `intermediateHymn`| Intermediate hymn | “#228 My Heavenly Father Loves Me” |
| `closingHymn`     | Closing hymn | “#2 Praise to the Lord, the Almighty” |
| `closingPrayer`   | Closing prayer | “By Invitation” |

**Notes:**
- You can add as many speakers as you want (`speaker1`, `speaker2`, `speaker3`, etc.).
- Hymns can include numbers, titles, or both.

---

### 4️⃣ Leaders

These rows list leadership information at the bottom of the program.

| Key     | Description | Example Value |
|---------|-------------|---------------|
| `leader`| A leader’s name, calling, and phone number | `John Doe \| Bishop \| (000) 000-0000` |

* Note: The phone number field requires a value of some kind. It can be None or N/A for those who don't want to share it.

**Notes:**
- You can include as many `leader` rows as you want.
- Use `|` to separate name, calling, and phone.
- Phone numbers are required, but are text fields and any value can be placed there.

---

### 5️⃣ Links & Resources

These keys create rows with icons, text, and links.

| Key            | Description | Example Value |
|----------------|-------------|---------------|
| `linkWithSpace`| A link with optional image | `<IMG> Gospel Library \| https://... \| https://image-url` |

**Notes:**
- `<IMG>` tells the app to show an icon.
- If no image is available, use `NONE`.

---

### 6️⃣ General Statements

These are flexible text rows used for announcements, events, or notes.

| Key                     | Description | Example Value |
|-------------------------|-------------|---------------|
| `generalStatement`      | Plain text | “Wednesdays 7pm: Activity Night” |
| `generalStatementWithLink` | Text with a link | `Lesson: January 1 <LINK> \| https://...` |

**Notes:**
- Use `<LINK>` to indicate where the link should appear.

---

### 7️⃣ Section Breaks

These create labeled dividers in the program.

| Key             | Description | Example Value |
|-----------------|-------------|---------------|
| `horizontalLine`| A section header | “Announcements” |

**Notes:**

- The value becomes the section title.
- You can use as many as you want.

---

### 🎯 Tips for Setting Values

- Use `~` in place of commas. This is a comma separated document, so adding commas will cause the program to split your text into a new column.
- Use `|` to separate multiple fields in a single value.
- Keep keys simple and lowercase.
- Delete rows you don’t need — the app ignores missing keys.
- The order of rows in your sheet is the order shown in the program.

---

## 📱 5. Create a QR Code for the CSV Link

You can use any QR generator.

### Command‑line example:

```bash
qrencode -s 6 -l H -o "sheet-url.png" "https://docs.google.com/spreadsheets/d/ABC123XYZ/gviz/tq?tqx=out:csv"
```

### Online generators:

- https://www.qr-code-generator.com/
- https://www.qrstuff.com/

Paste the CSV link into the generator.

---

## 📥 6. Load the Sheet in the App

1. Open the meeting program app  
2. Tap **Scan QR Code**  
3. Scan your Google Sheets QR code  
4. The app loads your program automatically  

The app remembers your sheet URL until you reset it.

---

## 🔄 7. Updating the Program

Any time you update the Google Sheet:

- The app loads the new data on refresh  
- No new QR code needed  
- No redeployment needed  

This makes weekly updates simple for clerks, presidencies, or music directors.

---

## 🛡️ 8. Privacy & Safety Notes

- Avoid listing minors by name  
- Use public callings only  
- The phone number field needs text of some kind, use N/A when the member would like to keep it private.
    - Alternately, use an e-mail address for the phone number field
- Keep the sheet **view‑only** for the public  
- Share edit access only with trusted leaders  

---
Here’s a polished, clearer version of your section that fits seamlessly with the tone and structure of the rest of your documentation. It keeps the workflow simple and understandable for non‑technical users while still being precise enough for leaders who will maintain the program week to week.

---

## 🗓️ Setting Up the Next Meeting

Many units prefer **not** to share future meeting details with members until the day of the meeting. The easiest way to manage this is to maintain **two Google Sheets**:

1. **A private “working” sheet** — where you prepare next week’s program  
2. **Your public sheet** — the one members access through the QR code  

Here’s the recommended workflow:

### 1. Prepare next week’s program privately  
Create a separate Google Sheet (not shared publicly) and follow the same setup steps described in the Google Sheets section.  
Use this sheet to draft:

- Speakers  
- Hymns  
- Announcements  
- Leadership updates  
- Any other program details  

You can load this private sheet into your app by:

1. Opening the app  
2. Tapping **Use New QR Code**  
3. Scanning the QR code for your private sheet  

The app will load your draft program so you can preview and refine it.

### 2. Finalize the program before Sunday  
On Saturday night or Sunday morning:

1. Select all rows from your private sheet  
2. Copy them into your **public** Google Sheet (the one shared with members)  
3. Save the sheet  

This updates the program that members will see.

### 3. Verify the public program  
To ensure everything is correct:

1. Open the app  
2. Tap **Use New QR Code**  
3. Scan the QR code for your **public** sheet  
4. Confirm the program loads correctly  

This guarantees that the program members see on Sunday matches what you intended.

---

## 📋 Example Google Sheets Structure

| key                     | value                                                                                                                                                     |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| unitName                | Unit Name                                                                                                                                                 |
| unitAddress             | 123 Actual Ave~ City US 123245                                                                                                                            |
| link                    | Homepage \| <OfficialHomePageLink>                                                                                                                        |
| date                    | January 1~ 2026                                                                                                                                            |
| presiding               | Leader1                                                                                                                                                   |
| conducting              | Leader2                                                                                                                                                   |
| musicDirector           | Person1                                                                                                                                                   |
| musicOrganist           | Person2                                                                                                                                                   |
| horizontalLine          | Announcements                                                                                                                                             |
| openingHymn             | #62 All Creatures of Our God and King                                                                                                                     |
| openingPrayer           | By Invitation                                                                                                                                             |
| horizontalLine          | Branch or Stake Business                                                                                                                                  |
| sacramentHymn           | #188 Thy Will~ O Lord~ Be Done                                                                                                                            |
| horizontalLine          | Ordinance of the Sacrament                                                                                                                                |
| speaker1                | Speaker One                                                                                                                                               |
| speaker2                | Speaker Two                                                                                                                                               |
| intermediateHymn        | #228 (CS) My Heavenly Father Loves Me                                                                                                                     |
| speaker3                | Speaker Three                                                                                                                                             |
| speaker4                | Speaker Four                                                                                                                                              |
| closingHymn             | #2 Praise to the Lord~ the Almighty                                                                                                                       |
| closingPrayer           | By Invitation                                                                                                                                             |
| horizontalLine          | Dismiss to Class                                                                                                                                          |
| horizontalLine          | Local Leaders                                                                                                                                             |
| leader                  | John Doe \| Bishop \| (000) 000-0000                                                                                                                      |
| leader                  | John Smith \| 1st Councilor \| (000) 000-0000                                                                                                             |
| leader                  | John Michaels \| 2nd Councilor \| (000) 000-0000                                                                                                          |
| leader                  | John Miles \| Executive Secretary \| (000) 000-0000                                                                                                       |
| leader                  | John Red \| Ward Clerk \| (000) 000-0000                                                                                                                  |
| horizontalLine          | Auxiliary Leaders                                                                                                                                         |
| leader                  | Peter Smith \| Elders Quorum President \| (000) 000-0000                                                                                                  |
| leader                  | Jane Doe \| Relief Society Presient \| (000) 000-0000                                                                                                     |
| leader                  | Michael Smith \| Sunday School President \| (000) 000-0000                                                                                                |
| leader                  | Mary Smith \| Young Women's President \| (000) 000-0000                                                                                                   |
| leader                  | Ruth Smith \| Primary President \| (000) 000-0000                                                                                                         |
| horizontalLine          | Other Leaders                                                                                                                                             |
| leader                  | Thomas Smith \| Branch Mission Leader \| (000) 000-0000                                                                                                   |
| leader                  | Hyrum Smith \| FamilySearch Center Director \| (000) 000-0000                                                                                             |
| horizontalLine          | LDS Apps                                                                                                                                                  |
| linkWithSpace           | <IMG> Gospel Library \| https://www.churchofjesuschrist.org/learn/mobile-applications/gospel-library?lang=eng \| https://www.churchofjesuschrist.org/imgs/2fc43d5ac50d11ed9c00eeeeac1e68389ccf488f/full/!200%2C200/0/default |
| linkWithSpace           | <IMG> Gospel Stream App \| https://www.churchofjesuschrist.org/learn/gospel-stream-mobile-and-ott-app?lang=eng \| https://www.churchofjesuschrist.org/imgs/1defb046330311eebde7eeeeac1e2458428d21d7/full/!200%2C200/0/default |
| linkWithSpace           | <IMG> Gospel Living \| https://www.churchofjesuschrist.org/youth/childrenandyouth/gospel-living-app?lang=eng \| https://www.churchofjesuschrist.org/imgs/8c92e16db3ab7e9219ca543fc04c58d77a968c3
