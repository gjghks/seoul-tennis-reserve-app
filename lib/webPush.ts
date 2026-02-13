import webpush from 'web-push';

const VAPID_SUBJECT = 'mailto:admin@seoul-tennis.com';

let initialized = false;

function stripBase64Padding(key: string): string {
  return key.replace(/=+$/, '').replace(/^["']+|["']+$/g, '').trim();
}

function getWebPush() {
  if (!initialized) {
    const rawPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const rawPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!rawPublicKey || !rawPrivateKey) {
      throw new Error('VAPID keys are not configured');
    }

    const publicKey = stripBase64Padding(rawPublicKey);
    const privateKey = stripBase64Padding(rawPrivateKey);

    webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
    initialized = true;
  }

  return webpush;
}

export { getWebPush };
