import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { getRepositories } from '../src/factory.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { userRepository } = await getRepositories();
        let user = await userRepository.findByGoogleId(profile.id);

        if (!user) {
          user = await userRepository.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            provider: 'google',
            isVerified: true,
            password: 'google-oauth-user',
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
