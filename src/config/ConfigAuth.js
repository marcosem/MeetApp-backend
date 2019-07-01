import 'dotenv/config'; // load all environment variables to process.env

export default {
  secret: process.env.APP_SECRET, // meetup2019 on https://www.md5online.org/
  expiresIn: '7d',
};
