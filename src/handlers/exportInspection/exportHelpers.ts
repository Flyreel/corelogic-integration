import emojiRegex from "emoji-regex";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { URL } from "url";
import { slack } from "../../slack";

const emojis = emojiRegex();
const punctuation = /[^a-zA-Z0-9]+/g;
const spaces = /\s+/g;
const allowedFileTypes = new Set([".jpg", ".jpeg", ".mov", ".mp4"]);

export const transformInspectionData = (inspection: any): any => {
  const inspectionId = inspection._id;
  const externalId = inspection.meta?.external_id;
  const conversation = inspection.conversation;
  const fieldData: any[] = [];
  const photos = {};
  const videos = {};

  if (!conversation) throw new Error(`Missing required conversation`);

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      if (!message.show_in_dashboard || !message.completed) {
        return;
      }

      const messageName = `${module.name
        .replace(punctuation, "")
        .replace(spaces, "")}${
        message.answer.iteration_id ?? "0"
      }_${message.name.replace(punctuation, "").replace(spaces, "")}`;
      const messageAnswer = message.answer ?? "";
      const messageType = message.type;

      switch (messageType) {
        case "photo": {
          if (
            !photos[fileName(messageAnswer)] &&
            allowedFileTypes.has(fileExtension(messageAnswer))
          ) {
            photos[fileName(messageAnswer)] = formatFormData(
              inspectionId,
              externalId,
              fileName(messageAnswer),
              messageAnswer
            );
          }
          break;
        }
        case "video": {
          if (allowedFileTypes.has(fileExtension(messageAnswer))) {
            if (!photos[fileName(messageAnswer)] && message.detections) {
              message.detections.forEach((detection: any) => {
                photos[fileName(detection.thumb_url)] = formatFormData(
                  inspectionId,
                  externalId,
                  fileName(detection.thumb_url),
                  detection.thumb_url
                );
              });
            }
            if (
              !videos[fileName(messageAnswer)] &&
              allowedFileTypes.has(fileExtension(messageAnswer))
            ) {
              videos[fileName(messageAnswer)] = formatFormData(
                inspectionId,
                externalId,
                fileName(messageAnswer),
                messageAnswer
              );
            }
          }
          break;
        }
        case "location": {
          fieldData.push({
            Name: messageName,
            Value: messageAnswer.address.replace(emojis, ""),
          });
          break;
        }
        default: {
          fieldData.push({
            Name: messageName,
            Value: JSON.stringify(messageAnswer.replace(emojis, "")),
          });
        }
      }
    });
  });

  const formUpload = {
    InspectionId: inspection._id,
    UniqueId: inspection.meta?.external_id,
    Field: fieldData,
  };

  return { formUpload, photos, videos };
};

const formatFormData = (
  inspectionId: string,
  externalId: string,
  name: string,
  value: string
): any => {
  const form = new FormData();
  form.append("InspectionId", inspectionId);
  form.append("UniqueId", externalId);
  form.append(name, fs.createReadStream(value));

  return form;
};

const fileExtension = (filePath: string): string => {
  return path.extname(new URL(filePath).pathname); //.jpg, .png, .mp4
};

const fileName = (filePath: string): string => {
  return path.basename(new URL(filePath).pathname);
};

export const slackExportError = async (
  inspection: any,
  error: any
): Promise<void> => {
  await slack.coreLogicMediaExportErrors.send({
    username: `CoreLogic: Error exporting media to CoreLogic`,
    icon_emoji: ":facepalm:",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:epic_fail: Error in sending media for inspection ${
            inspection._id
          } of carrier ${inspection.carrier.name}. \`\`\`${
            error.response?.data?.message ?? error.message
          }\`\`\``,
        },
      },
    ],
  });
};
