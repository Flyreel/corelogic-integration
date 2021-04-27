/* eslint-disable no-console */
import {
  transformFormData,
  transformPhotos,
  transformVideos,
} from "../../Handlers/exportInspection/exportHelpers";
import { Request, Response } from "express";
import axios from "axios";
import { getToken, logEvent } from "../../utils";
import FormData from "form-data";

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

    const coreLogicToken = await getToken();
    const inspectionDetails = await axios.get(
      //probably some headers too
      `${flyreelApiUrl}/v1/inspections/${inspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );

    const formData = transformFormData(inspectionDetails);
    const photos = transformPhotos(inspectionDetails);
    const videos = transformVideos(inspectionDetails);

    await axios.post(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${coreLogicToken}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      },
      {
        data: {
          InspectionId: inspectionId,
          UniqueId: externalId,
          formData,
        },
      }
    );

    for (const [key, values] of Object.entries(photos)) {
      (values as any).forEach((value) => {
        const form = new FormData();
        const formData = {
          InspectionId: inspectionId,
          UniqueId: externalId,
          [key]: value,
        };
        Object.keys(formData).forEach((key) => {
          form.append(key, form[key]);
        });
        axios.post(
          `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}`,
          {
            headers: {
              Authorization: `Bearer ${coreLogicToken}`,
              "Content-Type": "application/json",
              "api-key": apiKey,
              "api-companyid": apiCompanyId,
            },
          },
          {
            data: {
              form,
            },
          }
        );
      });
    }

    for (const [key, value] of Object.entries(videos)) {
      const form = new FormData();
      const formData = {
        InspectionId: inspectionId,
        UniqueId: externalId,
        [key]: value,
      };
      Object.keys(formData).forEach((key) => {
        form.append(key, form[key]);
      });
      await axios.post(
        `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${coreLogicToken}`,
            "Content-Type": "application/json",
            "api-key": apiKey,
            "api-companyid": apiCompanyId,
          },
        },
        {
          data: {
            form,
          },
        }
      );
    }

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

    await logEvent({
      inspection: inspectionId,
      event: "inspection_data_sent_to_corelogic_notification",
      meta: { external_id: externalId },
    });

    res.status(200).send(response);
  } catch (error) {
    console.error(
      `Error in sending data to CoreLogic for inspection ${inspectionId} of carrier ${inspection.carrier._id}`,
      error
    );
  }
};
