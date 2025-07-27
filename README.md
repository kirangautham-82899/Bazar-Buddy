# 🛒 Bazar-Buddy: Empowering Street Vendors with Hyperlocal Raw Material Aggregation

-----

## Problem Statement

Street vendors, a vital part of our economy, frequently encounter significant operational challenges that hinder their growth and stability. These include:

  * **Unreliable Access to Raw Materials:** Inconsistent supply chains and limited options for sourcing quality goods.
  * **Non-Transparent Pricing:** A lack of clear pricing mechanisms, leading to fluctuating costs and potential exploitation.
  * **Lack of Technology for Real-time Vendor Tracking:** Difficulty in tracking material availability and order status, causing inefficiencies.
  * **Absence of a Central System for Group Orders or Trust Validation:** No unified platform for collaborative purchasing or for building trust within the vendor community.

-----

## Solution

**Bazar-Buddy** is a comprehensive, web-based platform designed to revolutionize how street vendors access and manage their raw materials. We aim to empower vendors by providing:

  * **Aggregated Vendors & Raw Materials:** A centralized marketplace connecting vendors with suppliers and materials.
  * **Multilingual, Voice-Based Search:** Intuitive search functionality in local languages, making technology accessible.
  * **UPI-Enabled Ordering & Tracking:** Streamlined digital payments and real-time order monitoring for convenience and transparency.
  * **Verified Delivery Modes and Community-Based Barter/Trade Systems:** Secure delivery options and a robust community feature for resource exchange and mutual support.

-----

## Features

Bazar-Buddy is packed with features designed to enhance the vendor experience:

| Category | Description |
| :---------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Multilingual UI** | Supports **English** and **Hindi** for broader accessibility and ease of use. |
| **Smart Orders** | Facilitates **group ordering**, secure **UPI payments**, and **real-time delivery status** updates. |
| **Voice Search** | Enables convenient **voice-to-text item search** in both Hindi and English. |
| **Vendor Groups** | Features a dedicated **chat system** to foster community and allow vendors to join relevant groups. |
| **AI Price Alerts** | Integrates an intelligent system that **warns users if an item is priced abnormally high**, ensuring fair dealings. |
| **Barter System** | Implements a **community-driven exchange-based ordering system** for mutual benefit. |
| **Verified Delivery** | Ensures transparent and secure deliveries through **voice/SMS confirmations**. |
| **Live Cart** | Provides a **Firebase Auth-based per-user cart** with live quantity updates and seamless synchronization. |
| **Mobile First** | Boasts a **fully responsive UI** with a pleasant pastel theme and soft Lottie animations for an optimal mobile experience. |
| **Help Center** | Offers comprehensive support including **toll-free call assistance** and a detailed **FAQs** section. |

-----

## Tech Stack

Bazar-Buddy is built with modern, scalable technologies to ensure a robust and user-friendly experience:

  * **Frontend**: React.js, Framer Motion, Lottie, Tailwind CSS/CSS3
  * **Auth & Backend**: Firebase Authentication, Firestore DB
  * **Maps & Realtime**: Leaflet.js, Firebase Realtime Database
  * **Deployment**: Vercel

-----

## Getting Started

To get Bazar-Buddy up and running locally, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/yourusername/bazar-buddy.git
    ```

2.  **Navigate to the Project Directory:**

    ```bash
    cd bazar-buddy
    ```

3.  **Install Dependencies:**

    ```bash
    npm install
    ```

4.  **Set up Firebase Environment Variables:**
    Create a `.env` file in the root of your project and add your Firebase configuration keys. **Do not push this file to public repositories.**

    ```
    REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    REACT_APP_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
    ```

    You can find these details in your Firebase project settings.

5.  **Start the Development Server:**

    ```bash
    npm start
    ```

    The application will now be running on `http://localhost:3000`.

-----

## License

This project is licensed under the **MIT License**. Feel free to use, fork, and improve\!
