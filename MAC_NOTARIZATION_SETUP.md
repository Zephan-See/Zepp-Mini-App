# Mac Notarization Setup

Goal: make `SlideFlipper` install like a normal Mac app for non-technical users.

Without this setup, macOS may show warnings like:
- `SlideFlipper is damaged and can't be opened`
- `Apple could not verify ...`

With this setup, GitHub Actions can build a signed + notarized Mac app.

## Cost

- Apple Developer Program: `99 USD / year`
- GitHub Secrets: no extra cost
- GitHub Actions for this public repo: usually no extra cost for this workflow

## What You Need

1. An Apple Developer Program account
2. A `Developer ID Application` certificate
3. An App Store Connect API key for notarization
4. GitHub repository secrets

## Step 1: Join Apple Developer Program

Sign up here:
- <https://developer.apple.com/programs/enroll/>

Use an individual account unless you need company ownership.

## Step 2: Create a Developer ID Application Certificate

In your Apple Developer account:

1. Go to Certificates, IDs & Profiles
2. Create a new certificate
3. Choose `Developer ID Application`
4. Generate the certificate from your Mac Keychain
5. Install it into Keychain Access
6. Export it as a `.p12` file with a password

You will need:
- the `.p12` file
- the password you set during export

## Step 3: Create an App Store Connect API Key

In App Store Connect:

1. Users and Access
2. Integrations
3. App Store Connect API
4. Create a new API key

You will get:
- a `.p8` key file
- `Key ID`
- `Issuer ID`

Keep the `.p8` file safe. Apple lets you download it only once.

## Step 4: Add GitHub Secrets

In GitHub:

1. Open the repo
2. `Settings`
3. `Secrets and variables`
4. `Actions`
5. Add these repository secrets

Required secrets:

- `CSC_LINK`
  Base64 content of your exported `.p12` certificate
- `CSC_KEY_PASSWORD`
  Password for that `.p12` file
- `APPLE_API_KEY`
  Raw content of the `.p8` file
- `APPLE_API_KEY_ID`
  App Store Connect Key ID
- `APPLE_API_ISSUER`
  App Store Connect Issuer ID

## How To Base64 Encode the Certificate

On your Mac:

```bash
base64 -i developer-id-application.p12 | pbcopy
```

Then paste that copied value into the `CSC_LINK` GitHub secret.

## App Notes

Current Mac app details:

- app id: `com.zephan.slideflipper`
- Electron project: `slide-flipper/pc-controller-electron`

## What Happens Next

Once these secrets exist, the repo can be updated to:

1. import the signing certificate in GitHub Actions
2. sign the app
3. notarize the app with Apple
4. staple the notarization ticket
5. publish a beginner-friendly Mac installer that opens normally

## Status

Prepared:
- watch icon now matches the desktop app icon
- release artifact names are stable
- GitHub release automation already exists

Still needed:
- Apple Developer account
- certificate export
- App Store Connect API key
- final signed/notarized workflow wiring
