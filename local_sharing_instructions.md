# How to Access the Mess Menu App on Your Mobile and Friends' Devices

This tutorial guides you through hosting the **VibeMess** web application on your local network so that you, your friends, and anyone connected to the same Wi-Fi network can access it directly on their mobile phones, tablets, or other computers.

---

## 📋 Prerequisites
* Your computer and target devices (e.g. mobile phones, friends' laptops) must be connected to the **same Wi-Fi network / Local Area Network (LAN)**.

---

## 🛠️ Step-by-Step Instructions

### Step 1: Run Vite with Network Exposure (`--host`)
By default, the Vite development server only listens to `localhost` (connections from your own machine). To expose it to your local network, you need to append the `--host` flag:

1. Open your terminal in the `mess-menu-app` project directory.
2. Run the following command:
   ```bash
   npm run dev -- --host
   ```
   *Alternative:* You can run `npx vite --host` directly.

When Vite starts, you should see output similar to this:
```text
  VITE v8.0.16  ready in 600 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.15:5173/  <-- THIS IS YOUR LOCAL NETWORK URL!
```

---

### Step 2: Find Your Computer's Local IP Address
If you ever need to find your local IP address manually:

* **On Linux / Ubuntu:**
  Open your terminal and run:
  ```bash
  hostname -I
  ```
  *(This will print one or more IP addresses. Look for the one starting with `192.168.x.x` or `10.x.x.x`.)*

* **On macOS:**
  Go to **System Settings > Wi-Fi > Details** or run `ipconfig getifaddr en0` in the terminal.

* **On Windows:**
  Open Command Prompt (`cmd`) and run `ipconfig`. Look for the **IPv4 Address** of your active Wi-Fi adapter.

---

### Step 3: Configure Your Firewall (If Applicable)
If your mobile phone cannot connect to the link, your computer's firewall might be blocking incoming connections. 

* **On Linux (ufw):**
  To allow traffic on Vite's default port (5173):
  ```bash
  sudo ufw allow 5173/tcp
  ```
  *(To disable the firewall temporarily: `sudo ufw disable`)*

* **On Windows:**
  When you run the host command, Windows Defender Firewall might pop up. Check both **Private networks** and **Public networks**, then click **Allow Access**.

---

### Step 4: Open the Web App on Your Mobile / Friends' Devices
1. On your phone or your friend's device, open any web browser (Safari, Chrome, Firefox).
2. Enter the **Network URL** shown by Vite in Step 1 (e.g., `http://192.168.1.15:5173/`).
3. Press enter, and the **VibeMess** app will load!

---

## 📱 Pro-Tip: Add to Home Screen (Web App PWA)
For a native-app feel on your mobile phone:

* **On iOS (Safari):**
  1. Open the URL in Safari.
  2. Tap the **Share** button (square with an up arrow).
  3. Scroll down and tap **Add to Home Screen**.

* **On Android (Chrome):**
  1. Open the URL in Chrome.
  2. Tap the **three vertical dots** (menu) in the top-right corner.
  3. Tap **Add to Home Screen** or **Install app**.
