const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

const configurePassport = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    console.warn("Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: callbackUrl
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const providerId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
          const normalizedEmail = email ? email.toLowerCase() : undefined;

          let user = await User.findOne({
            "oauthProviders.provider": "google",
            "oauthProviders.providerId": providerId
          });

          if (!user && normalizedEmail) {
            user = await User.findOne({ email: normalizedEmail });
          }

          if (!user) {
            user = await User.create({
              email: normalizedEmail,
              roles: ["user"],
              oauthProviders: [
                {
                  provider: "google",
                  providerId,
                  email: normalizedEmail,
                  displayName: profile.displayName,
                  avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
                }
              ],
              profile: {
                firstName: profile.name ? profile.name.givenName : undefined,
                lastName: profile.name ? profile.name.familyName : undefined,
                avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
              }
            });
          } else {
            const hasProvider = user.oauthProviders.some(
              (provider) => provider.provider === "google" && provider.providerId === providerId
            );

            if (!hasProvider) {
              user.oauthProviders.push({
                provider: "google",
                providerId,
                email: normalizedEmail,
                displayName: profile.displayName,
                avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
              });
            }

            if (normalizedEmail && user.email !== normalizedEmail) {
              user.email = normalizedEmail;
            }

            user.profile = {
              ...user.profile,
              firstName: profile.name ? profile.name.givenName : user.profile?.firstName,
              lastName: profile.name ? profile.name.familyName : user.profile?.lastName,
              avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : user.profile?.avatarUrl
            };

            user.lastLoginAt = new Date();
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

module.exports = {
  configurePassport
};
