const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('config');

const Model = require('./models/user')



module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: config.get('clientID'),
        clientSecret: config.get("clientSecret"),
        callbackURL: 'https://quick-notesjs.herokuapp.com/google/callback'
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
            res.send(err);
        }}
));
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        Model.findById(id, (err, user) => done(err, user));
    })
}

