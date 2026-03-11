# SIA EduHub – College ERP Mobile Application

SIA EduHub is a **College ERP Mobile Application** built using **React Native, Expo, Convex, and Clerk**.
The application manages academic operations such as attendance, exams, notices, applications, and teacher management.

This project uses **Expo Router for navigation**, **Convex as the backend**, and **Clerk for authentication**.

---

# Features

### Admin

- Manage teachers
- Create exam schedules
- Manage attendance
- Manage notices
- Review student applications
- View dashboard analytics

### Teacher

- Mark attendance
- Manage exam schedules for assigned subjects

### Student

- View attendance
- View exams
- View notices
- Submit applications

---

# Tech Stack

Frontend

- React Native
- Expo
- Expo Router
- TypeScript

Backend

- Convex

Authentication

- Clerk

Navigation

- React Navigation
- Expo Router

---

# Project Structure

```
app/
│
├── (auth)
│   ├── login.tsx
│   └── register.tsx
│
├── (admin)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── attendance.tsx
│   ├── applications.tsx
│   ├── notices.tsx
│   ├── profile.tsx
│   ├── add-teacher.tsx
│   └── exams.tsx
│
├── (tabs)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── attendance.tsx
│   ├── exams.tsx
│   ├── notices.tsx
│   └── profile.tsx
│
lib/
│   academicData.ts
│
components/
│   ui/
│      Card.tsx
│      Screen.tsx
│      PrimaryButton.tsx
│      AppInput.tsx
│      Label.tsx
│
convex/
│   users.ts
│   attendance.ts
│   exams.ts
│   adminTeachers.ts
│   notices.ts
│   applications.ts
```

---

# Academic Data System

Academic configuration is stored in:

```
lib/academicData.ts
```

Structure includes:

- Departments
- Classes per department
- Subjects per department and class

Example:

```
B.Sc IT
 ├ FY
 │  └ Programming in C
 ├ SY
 │  └ Operating Systems
 └ TY
    └ Computer Networks
```

Teachers are assigned **department-wise**, not class-wise.

Teacher profile example:

```
teacherProfile {
  depts: string[]
  subjects: string[]
}
```

---

# Prerequisites

Install the following software before running the project.

### Node.js

Install Node.js (Recommended version)

```
Node.js >= 18
```

Download from:

[https://nodejs.org](https://nodejs.org)

Verify installation:

```
node -v
npm -v
```

---

### Git

Install Git

[https://git-scm.com/](https://git-scm.com/)

Verify:

```
git --version
```

---

### Expo CLI

Install Expo CLI globally

```
npm install -g expo
```

Verify installation

```
expo --version
```

---

# Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/siaeduhub.git
cd siaeduhub
```

---

# Install Dependencies

Install all project dependencies:

```
npm install
```

or

```
npm install --legacy-peer-deps
```

---

# Install Required Native Libraries

Some libraries require explicit installation.

### Date & Time Picker

```
npx expo install @react-native-community/datetimepicker
```

Used for:

- exam date
- start time
- end time

---

### Picker Component

```
npx expo install @react-native-picker/picker
```

Used for dropdown selections.

---

### React Navigation

Already included in dependencies but ensure installation:

```
npx expo install @react-navigation/native
npx expo install react-native-screens
npx expo install react-native-safe-area-context
```

---

### Gesture Handler

```
npx expo install react-native-gesture-handler
```

---

### Reanimated

```
npx expo install react-native-reanimated
```

---

# Setup Convex Backend

Install Convex CLI

```
npm install -g convex
```

Login to Convex

```
npx convex login
```

Initialize Convex project

```
npx convex dev
```

This will create your Convex deployment.

---

# Setup Clerk Authentication

Create a Clerk account:

[https://clerk.com](https://clerk.com)

Create a new application.

Copy your **publishable key**.

---

# Environment Variables

Create a `.env` file in the root directory.

Example:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

---

# Run the Project

Start development server:

```
npm run start
```

---

### Run on Android

```
npm run android
```

Requires Android emulator or Android device.

---

### Run on iOS

```
npm run ios
```

Requires macOS.

---

### Run on Web

```
npm run web
```

---

# Lint the Project

```
npm run lint
```

---

# Reset Project

```
npm run reset-project
```

This clears cached project state.

---

# Installed Dependencies

Key dependencies used in this project:

```
@clerk/clerk-expo
convex
expo-router
@react-native-community/datetimepicker
@react-native-picker/picker
expo-notifications
expo-secure-store
react-native-reanimated
react-native-gesture-handler
@expo/vector-icons
```

---

# Common Issues and Fixes

### Metro Bundler Error

Clear cache:

```
npx expo start -c
```

---

### Node Modules Issues

Remove node modules and reinstall:

```
rm -rf node_modules
npm install
```

---

### Reanimated Error

Ensure babel plugin exists in `babel.config.js`:

```
plugins: ["react-native-reanimated/plugin"]
```

---

# Contribution

1. Fork the repository
2. Create a feature branch

```
git checkout -b feature/new-feature
```

3. Commit changes

```
git commit -m "Add new feature"
```

4. Push changes

```
git push origin feature/new-feature
```

5. Open a Pull Request

---

# License

This project is open-source and available under the MIT License.
