const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('config');
const Model = require('./models/user')

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(user, done){
    done(null, user);
})

passport.use(new GoogleStrategy({
        clientID: config.get('clientID'),
        clientSecret: config.get("clientSecret"),
        callbackURL: 'http://localhost:3030/google/callback'
    },
    async (acessToken, refreshToken, profile, done) => {
        const newUser = {
            googleID: profile.id,
            displayName: profile.displayName,
            profilePicture: profile.photos[0].value,
        }
        try{
            let user = await Model.findOne({googleID: profile.id});

            if(user) done(null, user);
            
            else{
                user = await Model.create(newUser)
                done(null, user);
            }
        }
        catch(err){
            console.error(err)
        }
            /* return done(null, profile); */
        }
));