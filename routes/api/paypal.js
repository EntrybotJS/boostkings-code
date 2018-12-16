var express = require('express')
var router = express.Router()

var paypal = require('paypal-rest-sdk')
var moment = require('moment-timezone')

var nodemailer = require('nodemailer')
var htmlToText = require('nodemailer-html-to-text').htmlToText
var pug = require('pug')

paypal.configure({
	mode: process.env.PAYPAL_BACKEND_MODE,
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET
})

var Models = require('../../models/schemas')
var Order = Models['Order']

// This prepares the order data before opening the PayPal popup window
router.post(
	'/create',

	function(req, res, next) {
		var boostOrder = req.body

		var profile_name = Math.random()
			.toString(36)
			.substring(7)
		var create_web_profile_json = {
			name: profile_name,
			presentation: {
				brand_name: 'Boost Kings',
				logo_image: 'https://i.imgur.com/xRJ2whz.png',
				locale_code: 'CA'
			},
			input_fields: {
				allow_note: false,
				no_shipping: 1,
				address_override: 0
			}
		}

		var create_payment_json = {
			intent: 'sale',
			payer: {
				payment_method: 'paypal'
			},
			// TODO: update these urls
			redirect_urls: {
				return_url: process.env.HOST,
				cancel_url: process.env.HOST
			},
			transactions: [
				{
					item_list: {
						items: [
							{
								name: boostOrder.name,
								price:
									boostOrder.discountedPrice ||
									boostOrder.price,
								currency: 'USD',
								quantity: 1
							}
						]
					},
					amount: {
						currency: 'USD',
						total: boostOrder.discountedPrice || boostOrder.price
					},
					description: boostOrder.name
				}
			]
		}

		paypal.webProfile.create(create_web_profile_json, function(
			error,
			web_profile
		) {
			if (error) {
				return res.status(500).send('PayPal API Error')
			} else {
				// Set the id of the created payment experience in payment json
				var experience_profile_id = web_profile.id
				create_payment_json.experience_profile_id = experience_profile_id

				paypal.payment.create(create_payment_json, function(
					error,
					payment
				) {
					if (error) {
						console.log(error.response)
						return res.status(500).send('PayPal API Error')
					} else {
						var response = { id: payment.id }
						return res.json(response)
					}
				})
			}
		})
	}
)

// This validates the order, executes the payment, then sends a confirmation email to the client
router.post(
	'/execute',

	function validateOrder(req, res, next) {
		newOrder = new Order()
		newOrder.name = req.body.orderName
		newOrder.price = req.body.orderPrice
		newOrder.type = req.body.orderType
		newOrder.user = req.body.userId
		newOrder.queue = req.body.orderQueue
		newOrder.server = req.body.orderServer
		newOrder.roles = JSON.parse(req.body.orderRoles || {})
		newOrder.champions = JSON.parse(req.body.orderChampions || {})
		newOrder.paypalPaymentID = req.body.paymentID
		newOrder.paypalPayerID = req.body.payerID
		newOrder.lolIgn = req.body.lolIgn
		newOrder.lolUsername = req.body.lolUsername
		newOrder.lolPassword = req.body.lolPassword
		newOrder.specialRequirements = req.body.specialRequirements

		newOrder.validate(function(err) {
			if (err) {
				console.error(err)
				return res.status(500).send('Order is invalid.')
			} else {
				res.locals.newOrder = newOrder
				return next()
			}
		})
	},

	function executePayPalPayment(req, res, next) {
		var execute_payment_json = {
			payer_id: req.body.payerID,
			transactions: [
				{
					amount: {
						currency: 'USD',
						total: req.body.orderPrice
					}
				}
			]
		}

		var paymentId = req.body.paymentID

		paypal.payment.execute(paymentId, execute_payment_json, function(
			error,
			payment
		) {
			if (error) {
				console.log(error)
				return res.status(500).send('PayPal API Error')
			} else {
				res.locals.newOrder.save(function(err, savedOrder) {
					if (err) {
						console.log(err)
						// TODO: refund order
						return res
							.status(500)
							.send('There was an error while saving your order.')
					} else {
						// send order confirmation
						var smtpTransport = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: 'weareboostkings@gmail.com',
								pass: process.env.BK_EMAIL_PASSWORD
							}
						})
						smtpTransport.use('compile', htmlToText())

						var subject =
							'Boost Kings - Order Confirmation #' +
							savedOrder.confirmationNumber.toUpperCase()

						var mailOptions = {
							to: req.body.userEmail,
							from: 'Boost Kings <weareboostkings@gmail.com>',
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
									'Thanks for purchasing a boost with us. Here are your order details.',

									'<b>Confirmation number</b>: <code>' +
										savedOrder.confirmationNumber.toUpperCase() +
										'</code><br>' +
										'<b>Category</b>: ' +
										savedOrder.getType().name +
										'<br>' +
										'<b>Details</b>: ' +
										savedOrder.name +
										'<br>' +
										'<b>Queue</b>: ' +
										savedOrder.getQueue().name +
										'<br>' +
										'<b>Server</b>: ' +
										savedOrder.getServer().name +
										'<br>' +
										'<b>Order date</b>: ' +
										moment(savedOrder.created_on).format(
											'LLLL'
										),

									'If you have any question regarding your purchase, ' +
										'visit our website and start a live chat with our team, and mention your confirmation number (written above).'
								]
							})
						}

						smtpTransport.sendMail(mailOptions, function(err) {
							var response = {
								id: savedOrder._id,
								confirmationNumber: savedOrder.confirmationNumber.toUpperCase(),
								type: savedOrder.getType().name,
								name: savedOrder.name,
								queue: savedOrder.getQueue().name,
								server: savedOrder.getServer().name,
								created_on: moment(
									savedOrder.created_on
								).format('LLLL')
							}
							return res.send(response)
						})
					}
				})
			}
		})
	}
)

module.exports = router
