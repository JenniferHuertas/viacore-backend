import { google } from 'googleapis';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.development',
});

const oauth2Client =
  new google.auth.OAuth2(
    process.env.GOOGLE_MEET_CLIENT_ID,
    process.env.GOOGLE_MEET_CLIENT_SECRET,
    process.env.GOOGLE_MEET_REDIRECT_URI,
  );

const scopes = [
  'https://www.googleapis.com/auth/calendar',
];

const authUrl =
  oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

console.log('\nOPEN THIS URL:\n');

console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  '\nPASTE CODE HERE:\n',
  async (code) => {
    const { tokens } =
      await oauth2Client.getToken(code);

    console.log('\nTOKENS:\n');

    console.log(tokens);

    rl.close();
  },
);