const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load variables from .env

const app = express();
app.use(bodyParser.json());

// Load config from environment variables
const AJAX_INTEGRATION_ID = process.env.AJAX_INTEGRATION_ID;
const AJAX_API_KEY = process.env.AJAX_API_KEY;
const AJAX_BASE_URL = process.env.AJAX_BASE_URL;
const PARAKEY_WEBHOOK_SECRET = process.env.PARAKEY_WEBHOOK_SECRET;

// Endpoint that Parakey will POST to:
app.post('/parakey-webhook', async (req, res) => {
  try {
    // If Parakey provides a secret for verification, verify it here:
    // const providedSecret = req.headers['x-parakey-secret'];
    // if (PARAKEY_WEBHOOK_SECRET && providedSecret !== PARAKEY_WEBHOOK_SECRET) {
    //   return res.status(401).send('Unauthorized');
    // }

    const eventData = req.body;

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
});

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

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
