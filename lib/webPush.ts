import webpush from 'web-push';

const VAPID_SUBJECT = 'mailto:admin@seoul-tennis.com';

let initialized = false;

function getWebPush() {
  if (!initialized) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys are not configured');
    }

    webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
    initialized = true;
  }

  return webpush;
}

export { getWebPush };
