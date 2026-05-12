import express from 'express';
import twilio from 'twilio';

/**
 * @swagger
 * tags:
 *   name: Twilio
 *   description: Twilio Voice integration endpoints
 */

const router = express.Router();

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

/**
 * @swagger
 * /twilio/token:
 *   get:
 *     summary: Generate a Twilio Access Token for Voice SDK
 *     tags: [Twilio]
 *     parameters:
 *       - in: query
 *         name: identity
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional client identity (defaults to a random sellora_customer_* name)
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 identity:
 *                   type: string
 *       500:
 *         description: Twilio credentials not configured
 */
router.get('/token', (req, res) => {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;
    const twilioTwiMLAppSid = process.env.TWILIO_TWIML_APP_SID;
    const identity = req.query.identity || 'sellora_customer_' + Math.floor(Math.random() * 1000);

    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwiMLAppSid) {
        return res.status(500).json({ error: 'Twilio credentials not configured in environment variables.' });
    }

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twilioTwiMLAppSid,
        incomingAllow: true,
    });

    const token = new AccessToken(
        twilioAccountSid,
        twilioApiKey,
        twilioApiSecret,
        { identity }
    );
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt(), identity });
});

/**
 * @swagger
 * /twilio/voice:
 *   post:
 *     summary: TwiML webhook for handling incoming voice calls
 *     tags: [Twilio]
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: TwiML XML response
 *         content:
 *           text/xml:
 *             schema:
 *               type: string
 */
router.post('/voice', express.urlencoded({ extended: false }), (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    
    twiml.say({ voice: 'Polly.Joanna-Neural' }, "Hello! You have reached Sellora's Twilio Voice Agent. How can I help you today?");
    twiml.pause({ length: 3 });
    twiml.say({ voice: 'Polly.Joanna-Neural' }, "I'm a simulated agent testing the Twilio integration. Your connection is successful. Goodbye!");

    res.type('text/xml');
    res.send(twiml.toString());
});

export default router;
