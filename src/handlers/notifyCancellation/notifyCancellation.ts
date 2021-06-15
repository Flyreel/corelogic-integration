/* eslint-disable no-console */
import { Request, Response } from "express";
import axios from "axios";
import { getToken } from "../../utils";
import { slack } from "../../slack";
import { logEvent } from "../../utils";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

export const notifyCancellation = async (
  req: Request,
  res: Response
): Promise<void> => {
  let inspection,
    inspectionId,
    errorCode = 500;

  try {
    inspection = req.body.current;
    inspectionId = inspection._id;
    const externalId = inspection.meta?.external_id;

    if (!externalId) {
      errorCode = 400;
      throw new Error(`Missing required field external_id`);
    }

    const token = await getToken();
    const response = await axios.get(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}&Action=Cancel`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );
    console.warn("@@@response.data", JSON.stringify(response?.data));
    console.warn("@@@response", JSON.stringify(response));
    console.log(
      `Successfully sent cancellation notification for inspection ${inspectionId}`
    );

    await logEvent({
      inspection: inspectionId,
      event: "sent_corelogic_inspection_cancellation_notification",
      meta: { external_id: externalId },
    });

    res.status(200).send(response);
  } catch (error) {
    console.error(
      `Error in sending cancellation notification for inspection ${inspectionId}`,
      error
    );

    await slack.notificationsIntegrationErrors.send({
      username: `CoreLogic: Error Sending Cancellation Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending cancellation notification for inspection ${inspectionId}. \`\`\`${
              error.response?.data?.message ?? error.message
            }\`\`\``,
          },
        },
      ],
    });

    res.status(errorCode).send(error);
  }
};
