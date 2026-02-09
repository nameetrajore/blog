import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { signToken } from "./jwt";

const ses = new SESClient({ region: process.env.AWS_REGION! });

export async function sendMagicLink(email: string, baseUrl: string) {
  const token = signToken(email);
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

  const command = new SendEmailCommand({
    Source: process.env.SES_SENDER_EMAIL!,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Your admin login link" },
      Body: {
        Html: {
          Data: `
            <p>Click the link below to log in to the admin panel:</p>
            <p><a href="${magicLink}">Log in to Admin</a></p>
            <p>This link expires in 15 minutes.</p>
          `,
        },
      },
    },
  });

  await ses.send(command);
}
