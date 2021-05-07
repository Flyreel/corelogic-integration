import emojiRegex from "emoji-regex";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { URL } from "url";
import pascalcase from "pascalcase";

const emojis = emojiRegex();

export const transformInspectionData = (inspection: any): any => {
  const conversation = inspection.conversation;
  const fieldData: any[] = [];
  const photoMessages = [] as any[];
  const videoMessages = [] as any[];

  if (!conversation) throw new Error(`Missing required conversation`);

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      if (!message.show_in_dashboard || !message.completed) {
        return;
      }

      const messageName = `${pascalcase(module.name)}${
        message.answer?.iteration_id ?? "0"
      }_${pascalcase(message.name)}`;

      switch (message.type) {
        case "photo": {
          photoMessages.push(message);
          break;
        }
        case "video": {
          videoMessages.push(message);
          break;
        }
        case "location": {
          fieldData.push({
            Name: messageName,
            Value: JSON.stringify(message.answer?.address ?? "").replace(
              emojis,
              ""
            ),
          });
          break;
        }
        default: {
          fieldData.push({
            Name: messageName,
            Value: JSON.stringify(message.answer ?? "").replace(emojis, ""),
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

  return { formUpload, photoMessages, videoMessages };
};

export const createFormData = (
  inspectionId: string,
  externalId: string,
  message: any
): any => {
  if (!isValidMediaAnswer(message)) {
    throw new Error(
      `${message.answer} is an invalid ${message.type} type for message ${message._id}`
    );
  }

  const form = new FormData();
  form.append("InspectionId", inspectionId);
  form.append("UniqueId", externalId);
  form.append(getFileName(message.answer), fs.createReadStream(message.answer));

  return form;
};

const getFileExtension = (filePath: string): string => {
  return path.extname(new URL(filePath).pathname);
};

const getFileName = (filePath: string): string => {
  return path.basename(new URL(filePath).pathname);
};

const isPhoto = (filePath: string): boolean => {
  const allowedPhotoExtensions = new Set([".jpg", ".jpeg"]);

  return allowedPhotoExtensions.has(getFileExtension(filePath).toLowerCase());
};

const isVideo = (filePath: string): boolean => {
  const allowedVideoExtensions = new Set([".mov", ".mp4"]);

  return allowedVideoExtensions.has(getFileExtension(filePath).toLowerCase());
};

export const isValidMediaAnswer = (message: any): boolean =>
  !!message.answer &&
  ((message.type === "photo" && isPhoto(message.answer)) ||
    (message.type === "video" && isVideo(message.answer)));
