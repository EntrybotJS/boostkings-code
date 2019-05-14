var express = require('express')
var router = express.Router()

var nodemailer = require('nodemailer')
var htmlToText = require('nodemailer-html-to-text').htmlToText
var pug = require('pug')

var Models = require('../../models/schemas')
var Order = Models['Order']
var User = Models['User']
var Chat = Models['Chat']

router.get(
	'/',

	function(req, res, next) {
		Order.find({ isDone: false, booster: null })
			.populate('booster')
			.exec(function(err, orders) {
				res.locals.transparentBar = false
				res.locals.pageTitle = 'Orders awaiting a booster'
				res.locals.pageDescription =
					'These are orders that do not have a booster assigned yet.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

router.get(
	'/in-progress',

	function(req, res, next) {
		Order.find({ isDone: false, booster: { $ne: null } })
			.populate('booster')
			.exec(function(err, orders) {
				res.locals.transparentBar = false
				res.locals.pageTitle = 'Orders in progress'
				res.locals.pageDescription =
					'These are orders assigned to boosters but that are not completed yet.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

router.get(
	'/view/:orderId',

	function(req, res, next) {
		User.getBoosters(function(err, boosters) {
			res.locals.boosters = boosters

			Order.findOne({ _id: req.params.orderId })
				.populate('user')
				.populate('booster')
				.exec(function(err, order) {
					res.locals.transparentBar = false
					res.locals.pageTitle = 'Order'
					res.locals.navId = 'admin-orders'
					res.locals.order = order

					Chat.find({ order: req.params.orderId })
						.sort('created_on')
						.populate('user')
						.exec(function(err, messages) {
							if (err) {
								console.log(err)
							}
							res.locals.previousMessages = messages
							return res.render('pages/admin/orders/view')
						})
				})
		})
	}
)

router.post(
	'/view/:orderId',

	function(req, res, next) {
		if (req.body.action == 'markAsDone') {
			console.log(req.params)
			Order.findOneAndUpdate(
				{ _id: req.params.orderId },
				{
					$set: {
						requiresApproval: false,
						isDone: true,
						lolUsername: '',
						lolPassword: ''
					}
				},
				{ new: true }
			)
				.populate('users')
				.exec(function(err, updatedOrder) {
					if (err) {
						console.log(err)
						req.flash(
							'error',
							'There was an error while updating the order.'
						)
						return res.redirect(req.get('referer'))
					}

					// send order confirmation
					var smtpTransport = nodemailer.createTransport({
						host: process.env.BK_EMAIL_SERVICE,
						port: process.env.BK_EMAIL_PORT,
						auth: {
							user: process.env.BK_EMAIL_USERNAME,
							pass: process.env.BK_EMAIL_PASSWORD
						},
						tls: {
							// do not fail on invalid certs
							rejectUnauthorized: false
						}
					})
					smtpTransport.use('compile', htmlToText())

					var subject =
						'Boost Kings - Boost completed (order #' +
						updatedOrder.confirmationNumber.toUpperCase() +
						')'

					var mailOptions = {
						to: updatedOrder.user.email,
						from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
						subject: subject,
						replyTo: 'boostkings@outlook.com',
						html: pug.renderFile('views/emails/template.pug', {
							subject: subject,
							cta: {
								url: process.env.HOST + '/orders',
								message: 'View my orders'
							},
							paragraphs: [
								'Hi there,',
								"Your boost is now completed. Here's a summary of the completed boost.",

								'<b>Category</b>: ' +
									updatedOrder.getType().name +
									'<br>' +
									'<b>Details</b>: ' +
									updatedOrder.name +
									'<br>' +
									'<b>Queue</b>: ' +
									updatedOrder.getQueue().name +
									'<br>',
								'<b>Server</b>: ' +
									updatedOrder.getServer().name +
									'<br>',

								'Thank you, and enjoy your boost!',

								'If you have any question regarding your boost, ' +
									'visit our website, then start a live chat with our team and mention your confirmation number: <code>' +
									updatedOrder.confirmationNumber.toUpperCase() +
									'</code>.'
							]
						})
					}

					smtpTransport.sendMail(mailOptions, function(err) {
						req.flash(
							'success',
							'Successfully marked as done. A confirmation email was sent to the customer.'
						)
						return res.redirect(req.get('referer'))
					})
				})
		} else if (req.body.action == 'assign') {
			Order.findOneAndUpdate(
				{ _id: req.params.orderId },
				{ $set: { booster: req.body.booster, isInThePool: false } },
				{ new: true }
			)
				.populate('user')
				.exec(function(err, updatedOrder) {
					if (err) {
						console.log(err)
						req.flash(
							'error',
							'There was an error while updating the order.'
						)
						return res.redirect(req.get('referer'))
					} else {
						req.flash('success', 'Boost assigned successfully.')
						return res.redirect(req.get('referer'))
					}
				})
		} else if (req.body.action == 'pool') {
			Order.findOneAndUpdate(
				{ _id: req.params.orderId },
				{ $set: { isInThePool: true, booster: null } },
				{ new: true }
			)
				.populate('user')
				.exec(function(err, updatedOrder) {
					if (err) {
						req.flash(
							'error',
							'There was an error while updating the order.'
						)
						return res.redirect(req.get('referer'))
					} else {
						req.flash('success', 'Boost assigned successfully.')
						return res.redirect(req.get('referer'))
					}
				})
		}
	}
)

router.get(
	'/completed',

	function(req, res, next) {
		Order.find({ isDone: true })
			.populate('user')
			.exec(function(err, orders) {
				res.locals.transparentBar = false
				res.locals.pageTitle = 'Completed orders'
				res.locals.pageDescription = 'These orders were marked as done.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

router.get(
	'/requiring-approval',

	function(req, res, next) {
		Order.find({ requiresApproval: true })
			.populate('user')
			.exec(function(err, orders) {
				res.locals.transparentBar = false
				res.locals.pageTitle = 'Orders requiring approval'
				res.locals.pageDescription =
					'These orders were completed by a booster and need your approval.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

router.get(
	'/pool',

	function(req, res, next) {
		Order.find({ isInThePool: true })
			.populate('user')
			.exec(function(err, orders) {
				if (err) {
					console.log(err)
				}
				res.locals.transparentBar = false
				res.locals.pageTitle = 'Available orders'
				res.locals.pageDescription =
					'These orders are available to all boosters.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

router.get(
	'/all',

	function(req, res, next) {
		// TODO: implement pagination
		// https://evdokimovm.github.io/javascript/nodejs/mongodb/pagination/expressjs/ejs/bootstrap/2017/08/20/create-pagination-with-nodejs-mongodb-express-and-ejs-step-by-step-from-scratch.html

		Order.find()
			.populate('user')
			.exec(function(err, orders) {
				if (err) {
					console.log(err)
				}
				res.locals.transparentBar = false
				res.locals.pageTitle = 'All orders'
				res.locals.pageDescription =
					'These are all orders ever placed on Boost Kings since the beginning.'
				res.locals.navId = 'admin-orders'
				res.locals.orders = orders
				return res.render('pages/admin/orders/list')
			})
	}
)

module.exports = router
