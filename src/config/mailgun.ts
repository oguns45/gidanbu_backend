import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import { IMailOptions } from "../utils/interface.util";
import ErrorResponse from "../utils/error.utils";

const sendwelcomeEmail = async (options: IMailOptions, accessToken: string, username: string, Role: string) => {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    const errorDetails = {
      message: "Mailgun credentials are missing",
      missingVariables: ["MAILGUN_API_KEY or MAILGUN_DOMAIN"]
    };
    console.error("Error: Missing Mailgun credentials:", errorDetails);
    throw new ErrorResponse("Mailgun credentials not found", 400, errorDetails.missingVariables, { envVariables: process.env });
    return;  // Ensures no further code is executed
  }

  const auth = {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  };

  console.log('Using Mailgun API Key:', process.env.MAILGUN_API_KEY);
  console.log('Using Mailgun Domain:', process.env.MAILGUN_DOMAIN);

  try {
    // Create the transport with logger enabled
    const transport = nodemailer.createTransport(mg({ auth }), { logger: true });

    // Ensure accessToken is a string
    const tokenReg = accessToken;  // Now using the passed in accessToken string
    const message = `welcome to Utter Utility \n as our honorable ${Role} \n Click on the link below to verify your email: \n http://localhost:3000/verify?token=${tokenReg} \n Your Username is ${username} `;

    const emailMessage = {
      from: `cartify@${process.env.MAILGUN_DOMAIN}`,
      to: options.email,
      text: message,
      subject: options.subject,
    };

    const info = await transport.sendMail(emailMessage);
    console.log(`Message sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Enhanced error logging with clearer error context
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while sending email.";
    const errorContext = {
      options,
      errorMessage,
      errorStack: error instanceof Error ? error.stack : null
    };

    console.error("Error while sending email:", errorContext);

    if (error instanceof Error) {
      throw new ErrorResponse(
        "Failed to send email due to Mailgun error.",
        500,
        [errorMessage],
        errorContext
      );
      return; // Ensures no further code is executed
    }

    // Generic fallback error handling
    throw new ErrorResponse(
      "An unknown error occurred while sending the email",
      500,
      ["Unknown error type"],
      errorContext
    );
    return; // Ensures no further code is executed
  }
};

export default sendwelcomeEmail;
