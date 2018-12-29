var express = require('express')
var session = require('express-session')
var csrf = require('csurf')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var helmet = require('helmet')
var compression = require('compression')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var dotenv = require('dotenv')
// TODO: minify JS

dotenv.load()

var Models = require('./models/schemas')
var User = Models['User']
var Chat = Models['Chat']
var Order = Models['Order']

passport.use(
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne(
				{ $or: [{ username: username }, { email: username }] },
				function(err, user) {
					if (err) {
						return done(err)
					}
					if (!user) {
						return done(null, false, {
							message: 'Incorrect email/username.'
						})
					}
					if (!user.validPassword(password)) {
						return done(null, false, {
							message: 'Incorrect password.'
						})
					}
					return done(null, user)
				}
			)
		}
	)
)

passport.serializeUser(function(user, done) {
	done(null, user._id)
})

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user)
	})
})

var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

// order live chat
io.sockets.on('connection', function(socket) {
	socket.on('subscribe', function(orderRoom) {
		socket.join(orderRoom)
	})

	socket.on('send message', function(data) {
		var newChat = new Chat()

		if (!data.message || data.message === '') {
			return
		}

		newChat.order = data.order
		newChat.user = data.user
		newChat.message = data.message
		newChat.save(function(err, savedChat) {
			if (err || !savedChat || !savedChat._id) {
				console.log(err)
			} else {
				Chat.findOne({ _id: savedChat._id })
					.sort('created_on')
					.populate('user')
					.exec(function(err, message) {
						if (err) {
							console.log(err)
						}
						var outboundData = {}
						outboundData.message = message
						outboundData.userIsStaff = message.user.isStaff()
						io.to(savedChat.order).emit('new message', outboundData)
					})
			}
		})
	})
})

server.listen(process.env.PORT || 3000)

app.use(require('connect-flash')())

mongoose.connect(
	process.env.MONGO_URL,
	function(err) {
		if (err) console.log('Mongoose connection error: ' + err)
		else {
			console.log('Connected to database.')
		}
	}
)

app.set('trust proxy', 1) // trust first proxy

var sixtyDaysInSeconds = 5184000
app.use(
	helmet.hsts({
		maxAge: sixtyDaysInSeconds
	})
)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var MongoStore = require('connect-mongo')(session)

var mongoSessionStore = new MongoStore({
	mongooseConnection: mongoose.connection,
	ttl: 90 * 24 * 60 * 60 * 1000
})

app.use(
	session({
		name: 'bk-session-lol',
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			secure: false
		},
		store: mongoSessionStore
	})
)

app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')))
app.use(logger('dev'))

app.use(csrf({ cookie: true }))
app.use(helmet())
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')))

app.use(function(req, res, next) {
	res.locals._csrf = req.csrfToken()
	res.locals.moment = require('moment-timezone')
	next()
})

app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
	res.locals.messages = req.flash()
	res.locals.user = req.user
	next()
})

app.use(function(req, res, next) {
	if (
		req.user &&
		(req.user.group == 'booster' || req.user.group == 'admin')
	) {
		Order.find({ isDone: false, requiresApproval: { $ne: true } })
			.populate('booster')
			.exec(function(err, orders) {
				boosterStats = {
					todo: 0,
					pool: 0
				}

				if (orders && orders.length > 0) {
					orders.forEach(function(o) {
						if (o.isInThePool) boosterStats.pool += 1
						else if (
							o &&
							o.booster &&
							req.user &&
							o.booster._id.toString() == req.user._id.toString()
						)
							boosterStats.todo += 1
					})

					res.locals.boosterStats = boosterStats
				}

				return next()
			})
	} else {
		return next()
	}
})

require('./routes/routes.js')(app, io)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	console.log(err)
	res.render('pages/error')
})

module.exports = app
