# ShareFare Mobile (Expo)

This is the cross-platform (Android + iOS) mobile app for ShareFare.

## Requirements

- Node.js **20+** (Expo SDK 54 / React Native 0.81 requires Node >= 20)
- Expo Go app (for quick testing) or Android Studio / Xcode (for emulators)

## Configure API base URL

For emulators, defaults usually work:
- Android emulator: `http://10.0.2.2:8080`
- iOS simulator: `http://localhost:8080`

For a real phone, set your laptop LAN IP:

```bash
export EXPO_PUBLIC_API_BASE_URL="http://YOUR_LAN_IP:8080"
```

## Run

```bash
cd /Users/biyyani/ShareFare/sharefare-mobile
npm start
```

Then press:
- `a` for Android
- `i` for iOS

## Admin login (dev default)

- Email: `admin@sharefare.com`
- Password: `Admin@12345`

You can change defaults via backend env vars:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

