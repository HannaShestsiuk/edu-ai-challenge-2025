Certainly! Here's a professional bug report structured as requested:

---

### **Title:**

Logout Button Unresponsive in Safari Browser

---

### **Description:**

The logout button on the application does not function when accessed via the Safari browser. Clicking the button yields no response—no logout action is triggered, and the user remains on the current page. This behavior prevents users from securely ending their session on Safari.

---

### **Steps to Reproduce:**

1. Open the application in the Safari browser (any recent version).
2. Log in using valid credentials.
3. Navigate to any page with the logout button (e.g., dashboard).
4. Click the **Logout** button.

---

### **Expected vs Actual Behavior:**

**Expected:**
Clicking the logout button should terminate the session and redirect the user to the login or landing page.

**Actual:**
Nothing happens when the logout button is clicked. The session remains active, and the user stays on the same page.

---

### **Environment:**

* **Browser:** Safari (e.g., Version 16.4+)
* **OS:** macOS Ventura / iOS 16+
* **Frontend Framework:** (e.g., React 18, if known)
* **Authentication Method:** (e.g., JWT, OAuth2 – if relevant)

---

### **Severity or Impact:**

**High** – Users are unable to securely log out when using Safari, which poses a potential security risk and degrades the user experience.

---

Let me know if you'd like to include console/network logs or suspected causes (e.g., event not binding properly or browser-specific JavaScript issue).
