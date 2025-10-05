/**
 * SES Email Forwarder Lambda Function
 *
 * Forwards all emails sent to @snapitsoftware.com to snapitsoft@gmail.com
 * Preserves original sender info and subject line
 */

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Received SES event:', JSON.stringify(event, null, 2));

  try {
    const record = event.Records[0];
    const sesMessage = record.ses;

    // Extract email details
    const messageId = sesMessage.mail.messageId;
    const recipients = sesMessage.receipt.recipients; // e.g., support@snapitsoftware.com
    const source = sesMessage.mail.source; // Original sender
    const subject = sesMessage.mail.commonHeaders.subject;
    const originalRecipient = recipients[0]; // Which @snapitsoftware.com address was used

    // Get the full email from S3 (SES stores it there via receipt rule)
    const s3 = new AWS.S3();
    const emailData = await s3.getObject({
      Bucket: process.env.EMAIL_BUCKET || 'snapitsoftware-ses-emails',
      Key: messageId
    }).promise();

    const emailBody = emailData.Body.toString('utf-8');

    // Forward email to snapitsoft@gmail.com with original context
    const forwardParams = {
      Source: 'noreply@snapitsoftware.com', // Must be SES-verified
      Destination: {
        ToAddresses: ['snapitsoft@gmail.com']
      },
      Message: {
        Subject: {
          Data: `[${originalRecipient}] ${subject}`
        },
        Body: {
          Text: {
            Data: `
--- Forwarded from ${originalRecipient} ---
Original Sender: ${source}
Original Recipient: ${originalRecipient}
Message ID: ${messageId}

-----------------------------------

${emailBody}
            `
          }
        }
      },
      ReplyToAddresses: [source] // Allow replying directly to original sender
    };

    const result = await ses.sendEmail(forwardParams).promise();

    console.log('Email forwarded successfully:', result.MessageId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Email forwarded successfully',
        messageId: result.MessageId
      })
    };

  } catch (error) {
    console.error('Error forwarding email:', error);

    // Return success to SES anyway to avoid bounces
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Email processing completed with errors',
        error: error.message
      })
    };
  }
};
