const axios = require('axios');

// Load config from environment variables//
const AJAX_INTEGRATION_ID = process.env.AJAX_INTEGRATION_ID;
const AJAX_API_KEY = process.env.AJAX_API_KEY;
const AJAX_BASE_URL = process.env.AJAX_BASE_URL;
const PARAKEY_WEBHOOK_SECRET = process.env.PARAKEY_WEBHOOK_SECRET;

// Export the serverless function
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Parse the request body
    const eventData = req.body;

    // If necessary, parse JSON body (Vercel uses body parsing automatically)
    // If it's not working, you might need to parse it manually:
    // const { json } = require('micro');
    // const eventData = await json(req);

    // Verify the secret, if applicable
    // const providedSecret = req.headers['x-parakey-secret'];
    // if (PARAKEY_WEBHOOK_SECRET && providedSecret !== PARAKEY_WEBHOOK_SECRET) {
    //   res.status(401).send('Unauthorized');
    //   return;
    // }

    // Check if the event indicates a door unlock
    if (eventData.event === 'door_unlocked') {
      console.log('Door unlocked event received from Parakey:', eventData);
      await unarmAjaxSystem();
      console.log('Ajax system unarmed successfully.');
    }

    // Respond to Parakey
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing Parakey webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Function to unarm the Ajax system
async function unarmAjaxSystem() {
  const url = `${AJAX_BASE_URL}/v1/integrations/${AJAX_INTEGRATION_ID}/control/unarm`;

  const response = await axios.post(
    url,
    {},
    {
      headers: {
        'X-Api-Key': AJAX_API_KEY,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(`Failed to unarm Ajax system: ${response.statusText}`);
  }

  return response.data;
}
