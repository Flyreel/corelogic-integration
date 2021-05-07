/* eslint-disable no-console */
import { Request, Response } from "express";
import axios from "axios";
import { slack } from "../../slack";
import promiseRetry from "promise-retry";
import { getToken, logEvent } from "../../utils";
import { transformInspectionData, createFormData } from "./exportHelpers";

const flyreelApiUrl = process.env.FLYREEL_API as string;
const flyreelToken = process.env.FLYREEL_API_TOKEN as string;

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

export const exportInspection = async (
  req: Request,
  res: Response
): Promise<void> => {
  let inspection, inspectionId;
  try {
    inspection = req.body.current;
    inspectionId = inspection._id;
    const externalId = inspection.meta?.external_id;

    if (!externalId) {
      throw new Error(`Missing required field external_id`);
    }

    const inspectionDetails = await axios.get(
      `${flyreelApiUrl}/v1/inspections/${inspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );

    const coreLogicToken = await getToken();
    const {
      formUpload,
      photoMessages,
      videoMessages,
    } = transformInspectionData(inspectionDetails);

    await axios.post(
      `${corelogicApiUrl}/api/digitalhub/v1/Form/Upload`,
      formUpload,
      {
        headers: {
          Authorization: `Bearer ${coreLogicToken}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    console.log(
      `Successfully sent form data to CoreLogic for inspection ${inspectionId} of carrier ${inspection.carrier._id}`
    );

    for (const photoMessage of photoMessages) {
      const photoBody = createFormData(inspectionId, externalId, photoMessage);

      (await promiseRetry(
        (retry, number) => {
          return axios
            .post(
              `${corelogicApiUrl}/api/digitalhub/v1/Photo/Upload`,
              photoBody,
              {
                headers: {
                  Authorization: `Bearer ${coreLogicToken}`,
                  "Content-Type": "application/json",
                  "api-key": apiKey,
                  "api-companyid": apiCompanyId,
                },
              }
            )
            .catch((error) => {
              console.error(
                `Failed to send photo ${photoMessage.answer} for inspection ${inspectionId} at retry #${number}`,
                error
              );
              retry(error);
            });
        },
        { retries: 3, factor: 2, minTimeout: 1000 }
      )) as any;
    }

    console.log(
      `Successfully sent photo data to CoreLogic for inspection ${inspectionId} of carrier ${inspection.carrier._id}`
    );

    for (const videoMessage of videoMessages) {
      const videoBody = createFormData(inspectionId, externalId, videoMessage);
      (await promiseRetry(
        (retry, number) => {
          return axios
            .post(
              `${corelogicApiUrl}/api/digitalhub/v1/Video/Upload`,
              videoBody,
              {
                headers: {
                  Authorization: `Bearer ${coreLogicToken}`,
                  "Content-Type": "application/json",
                  "api-key": apiKey,
                  "api-companyid": apiCompanyId,
                },
              }
            )
            .catch((error) => {
              console.error(
                `Failed to send video ${videoMessage}for inspection ${inspectionId} at retry #${number}`,
                error
              );
              retry(error);
            });
        },
        { retries: 3, factor: 2, minTimeout: 1000 }
      )) as any;
    }

    console.log(
      `Successfully sent video data to CoreLogic for inspection ${inspectionId} of carrier ${inspection.carrier._id}`
    );

    const response = await axios.get(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}&Action=Complete`,
      {
        headers: {
          Authorization: `Bearer ${coreLogicToken}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    console.log(
      `Successfully updated CoreLogic inspection status to Complete for ${inspectionId} of carrier ${inspection.carrier._id}`
    );

    await logEvent({
      inspection: inspectionId,
      event: "inspection_data_sent_to_corelogic",
      meta: { external_id: externalId },
    });

    res.status(200).send(response);
  } catch (error) {
    console.error(
      `Error in sending data to CoreLogic for inspection ${inspectionId} of carrier ${inspection.carrier._id}`,
      error
    );

    await slack.coreLogicMediaExportErrors.send({
      username: `CoreLogic: Error exporting inspection`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error to export inspection ${
              inspection._id
            } to CoreLogic of carrier ${inspection.carrier.name}. \`\`\`${
              error.response?.data?.message ?? error.message
            }\`\`\``,
          },
        },
      ],
    });

    res.status(500).send(error);
  }
};
