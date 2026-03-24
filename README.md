# Saudi Precise Time — High Precision Clock

A high-precision digital clock for **Saudi Arabia** based on the **Asia/Riyadh timezone (AST / UTC+3)**.

This project is a lightweight static website built using **HTML, CSS, and vanilla JavaScript**. It displays the current time in Riyadh with detailed precision including **milliseconds**, and simulated **microseconds and nanoseconds** using the browser's high-resolution timer.

The project focuses on **accuracy, privacy, and simplicity**, with a clean professional interface suitable for portfolios and academic use.

---

## Features

### Live Riyadh Clock

Displays the current time in Saudi Arabia with detailed precision:

* Hour
* Minute
* Second
* Millisecond
* Simulated Microsecond
* Simulated Nanosecond

The clock refreshes every **10 milliseconds** to provide near real-time updates.

Microsecond and nanosecond values are simulated using `performance.now()` to provide **sub-millisecond phase resolution**.

---

### 12-Hour / 24-Hour Toggle

Users can switch between:

* **12-hour format**
* **24-hour format**

The selected format automatically applies to:

* Live clock
* Saved moments
* Shared timestamps

---

### Captured Moments

Users can capture exact time snapshots using the **Save This Moment** button.

Each saved moment includes:

* Full date
* Hour / Minute / Second
* Millisecond
* Microsecond (simulated)
* Nanosecond (simulated)

Each card also provides:

* **Share** – Copies a formatted share message
* **Copy** – Copies the full timestamp block
* **Clear saved moments** – Removes all saved snapshots

---

### Privacy First

Before accessing the website, users are shown a **Privacy Policy gate** available in both:

* English
* Arabic

The policy clearly states that:

* No personal data is collected
* No cookies are used
* No tracking systems are present
* All actions run locally in the browser

User acceptance is stored locally using **localStorage**, so returning visitors will not see the policy again.

---

### Professional UI Design

The interface follows a **clean academic style** designed for professional presentation.

Design highlights:

* Light theme
* Serif + Sans-serif + Monospace font combination
* Minimal borders and soft shadows
* Responsive layout for both **mobile and desktop**

---

### Accessibility

Basic accessibility features are included:

* Accessible modal dialog
* Keyboard support (Escape closes the privacy gate)
* Focus on the primary action button
* Semantic HTML structure

---

## Tech Stack

This project intentionally avoids frameworks to remain lightweight and educational.

Technologies used:

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**

---

## Project Structure

```
Saudi-Precise-Time
│
├── index.html
├── styles.css
├── script.js
└── README.md
```

---

## How It Works

The clock uses:

* `Intl.DateTimeFormat` with the **Asia/Riyadh timezone** for accurate Saudi time.
* `fractionalSecondDigits` to display milliseconds where supported.
* `performance.now()` to simulate **microsecond and nanosecond precision**.

The display refreshes every **10 ms** using `setInterval()`.

Note:
Microseconds and nanoseconds are **simulated values** and do not represent true wall-clock nanosecond accuracy.

---

## Use Cases

This project can be useful for:

* Learning high-resolution timing in JavaScript
* Demonstrating browser timing capabilities
* Educational time-precision experiments
* Portfolio projects for web development students

---

## Author

Created by **Faris Al-Harbi**

Contact:

* Phone
* Email
* LinkedIn

---

## License

This project is open-source and free to use for learning and educational purposes.
