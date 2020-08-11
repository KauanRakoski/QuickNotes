// * Node js backend structure for QuickNotes
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cors = require('cors');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash')
const methodOverride = require('method-override');
const passport = require('passport')
const path = require('path');
const app = express();

require('./passport-setup')

// ! Not core config
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3030;

// ? Configuration
app.use(flash());



/* app.use(cookieSession({
    name: 'quick-notes',
    keys: ['supersecretcode', 'supercodesecret']
})); */


/* 
    ! CORE config
    ! DESKTOP
*/

// ? db connection
const Note = require('./models/note.js');
const User = require('./models/user.js');
const db = config.get('mongoURI');

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
    useCreateIndex: false,
})
.then(() => console.log('Database connection established'))
.catch((e) => console.log('Database connection denied'));

// ? session middleware
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
  );

// ? Handlebars helpers
const { formatDate} = require('./helpers/hbshelper');

// ? Handlebars middleware
app.engine('handlebars', exphbs({helpers: { formatDate}, defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// ? bodyParser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// ? Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ? MethodOverride middleware
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

// ? Auth ensure
const ensureAuth = (req, res, next) => {
    if(req.user){
        next()
    }else{
        res.sendStatus(401)
    }
}

// ! ROUTES

// ? Landing route
app.get('/', (req, res) => {
    res.render('slash', {title:'Quick Notes'});
});

app.get('/flash', ensureAuth, (req, res) => {
    req.flash('sucess', 'You are logged in');
    res.redirect('/dashboard')
})

// ? dashboard route
app.get('/dashboard', ensureAuth, async(req, res) =>{
    try{
        const user = await User.findOne({ googleID: req.user.googleID }).lean();
        const notes = await Note.find({ creator: req.user.id }).lean();

        res.render('home', {notes: notes, user: user, title:'Dashboard', messages: req.flash('sucess')})
    }
    catch(err){
        res.send(err);
    } 
});

// ? new note route
app.get('/new', ensureAuth, (req, res) => {
    res.render('add', {title: 'New Note'})
});

// ? Post new note route 
app.post('/note', ensureAuth, async (req, res) => {
    const title = req.body.title;
    const text = req.body.text;

    await Note.create({
        user: req.user,
        title: title,
        text: text,
    });

    res.redirect('/dashboard')
});

// ? Delete Note Route
app.delete('/dashboard/delete/:id', ensureAuth, async (req, res) => {
    try{
        await Note.deleteOne({ _id: req.params.id});
        res.redirect('/dashboard');
    }
    catch(err){
        res.send(err);
    }
});

app.get('/edit/:id', ensureAuth, async(req, res) => {
    try{
        let note_id = req.params.id;

        let editNote = await Note.findOne({_id: note_id}).lean();
        res.render('edit', {note: editNote, title: 'Edit Note'}) 
    }
    catch(e){
        res.send(e);
    }    
});

app.put('/saveedit/:id', ensureAuth, async (req, res) => {
    try{
        let noteId = req.params.id;
        

        await Note.findOneAndUpdate({_id: noteId}, {title: req.body.editTitle, text: req.body.editText});
        res.redirect('/dashboard');
    }
    catch(e){
        res.send(e)
    }
})

// ? Logout route
app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

// ? Failure Route
app.get('/failure', (req, res) => {
    res.send('Oauth login failed.')
});

// ! Oauth routes

// ? Oauth route
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//? oAuth callback route
app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failure' }),
  function(req, res) {
      try{
        res.redirect('/flash');
        
      }
      catch(err){
          res.send(err)
      }
   
  });


// ? Listening
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));