# CF Gym Tracker

A web application that helps Codeforces users track **gym contests** solved by multiple handles.  
It shows gyms solved **as a team**, **unsolved gyms**, and allows filtering by difficulty and mode.

## ✨ Features
- 🔍 Enter multiple Codeforces handles to find gyms solved together.
- 🏆 Supports modes:
  - **All Gyms** – see everything.
  - **Solved By Team** – gyms solved together by all handles.
  - **Unsolved** – gyms not solved by any of the handles.
- 🎯 Difficulty filter (2–5).
- 🎲 Random Gym button for quick practice.
- 📊 Tracks team vs solo solves (`teamName` or `"practice"`).
- ⚡ Fast response with cached gyms.
- 📈 Integrated **Google Analytics** and **Vercel Analytics** to track usage.

## screenshot
<img width="2559" height="1419" alt="image" src="https://github.com/user-attachments/assets/72d48f25-9dd8-4da1-acca-a791fd4fff7a" />

## 🛠️ Tech Stack
- **Frontend:** HTML, Tailwind CSS, Vanilla JS
- **Backend:** Node.js, Express, CORS
- **Deployment:** Vercel (Serverless Functions + Static Hosting)
- **Analytics:** Google Analytics + Vercel Analytics

## 🚀 Setup

Follow these simple steps to get the project running locally:

## 1. Install Dependencies
```bash
npm install
```

## 2. Start Development Server
```bash
npm run dev
```

🎉 The application will be running at **http://localhost:8080**


## 🤝 Contributing

We welcome contributions to make this project better! Please follow these steps to get started:

## Getting Started

### 1. Fork the Repository
Click the "Fork" button on the repository page to create your own copy.

### 2. Clone Your Fork
```bash
git clone https://github.com/yourusername/cf-gym-tracker.git
cd cf-gym-tracker
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
Implement your feature or bug fix, ensuring your code follows the project's style guidelines.

### 5. Commit Your Changes
```bash
git add .
git commit -m "Add: your feature description"
```

### 6. Push to Your Branch
```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request
Go to the original repository and click "New Pull Request" to submit your changes for review.

Thank you for contributing to our project! 🚀

