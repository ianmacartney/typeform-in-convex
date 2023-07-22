import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import { Id, TableNames } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type Answer =
  | ChoiceAnswer
  | ChoicesAnswer
  | BooleanAnswer
  | NumberAnswer
  | FileUploadAnswer
  | StringAnswer<StringAnswerTypes>;

type StringAnswerTypes = "text" | "email" | "url" | "date" | "payment";

type ChoiceAnswer = { type: "choice"; choice: { label: string } } & FieldData;
type ChoicesAnswer = {
  type: "choices";
  choices: { label: string };
} & FieldData;
type BooleanAnswer = { type: "boolean"; boolean: boolean } & FieldData;
type NumberAnswer = { type: "number"; number: number } & FieldData;
type FileUploadAnswer = { type: "file_url"; file_url: string } & FieldData;
type StringAnswer<AnswerType extends StringAnswerTypes> = {
  [key in AnswerType]: string;
} & {
  type: AnswerType;
} & FieldData;

type FieldData = {
  field: { id: string; type: string; ref: string };
};

type TypeformPayload = {
  formId: string;
  answers: Answer[];
  hidden: { [k: string]: string };
};

export const saveResponse = mutation({
  handler: async (ctx, { formId, answers, hidden }: TypeformPayload) => {
    const fieldMappings = await ctx.db
      .query("typeform_metadata")
      .withIndex("by_typeform_form_id", (q) => q.eq("typeformFormId", formId))
      .collect();
    if (fieldMappings.length === 0) {
      throw new Error(`No field mappings found for typeform form ${formId}`);
    }
    const convexTableName = fieldMappings[0]["convexTableName"] as TableNames;

    const convexFieldNameByTypeformFieldId: { [k: string]: string } = {};
    for (const { typeformFieldId, convexFieldName } of fieldMappings) {
      convexFieldNameByTypeformFieldId[typeformFieldId] = convexFieldName;
    }

    const convexDoc: { [k: string]: any } = {};
    const fileUrlByConvexFieldName: { [k: string]: string } = {};
    for (const answer of answers) {
      const typeformFieldId = answer.field.id;
      const convexFieldName = convexFieldNameByTypeformFieldId[typeformFieldId];

      if (convexFieldName === undefined) {
        // If we excluded this field from the typeform_metadata table, we don't want to keep the value
        continue;
      }
      switch (answer.type) {
        case "file_url":
          fileUrlByConvexFieldName[convexFieldName] = answer.file_url;
          break;
        case "text":
          convexDoc[convexFieldName] = answer.text;
          break;
        case "choice":
          convexDoc[convexFieldName] = answer.choice.label;
          break;
        case "choices":
          convexDoc[convexFieldName] = answer.choices.label;
          break;
        case "email":
          convexDoc[convexFieldName] = answer.email;
          break;
        case "url":
          convexDoc[convexFieldName] = answer.url;
          break;
        case "date":
          convexDoc[convexFieldName] = answer.date;
          break;
        case "payment":
          convexDoc[convexFieldName] = answer.payment;
          break;
        case "boolean":
          convexDoc[convexFieldName] = answer.boolean;
          break;
        case "number":
          convexDoc[convexFieldName] = answer.number;
          break;
        default:
          // if we don't know how to read this question type, log it but succeed anyways
          // @ts-ignore This is to catch a case that's not modeled in our types
          console.log(`unsupported question type ${answer.type}`);
      }
    }
    for (const hiddenField of Object.keys(hidden)) {
      const convexFieldName = convexFieldNameByTypeformFieldId[hiddenField];
      if (convexFieldName === undefined) {
        // If we excluded this field from mappings.json, we don't want to keep the value
        continue;
      }
      convexDoc[convexFieldName] = hidden[hiddenField];
    }
    const docId = await ctx.db.insert(convexTableName, convexDoc);
    await ctx.scheduler.runAfter(0, internal.typeform.fetchFiles, {
      docId,
      fileUrlByConvexFieldName,
    });
  },
});

type FetchFilesArgs = {
  docId: Id<TableNames>;
  fileUrlByConvexFieldName: { [k: string]: string };
};
export const fetchFiles = internalAction({
  handler: async (ctx, { docId, fileUrlByConvexFieldName }: FetchFilesArgs) => {
    const storageIdByConvexFieldName: { [k: string]: string } = {};
    for (const convexFieldName of Object.keys(fileUrlByConvexFieldName)) {
      const fileUrl = fileUrlByConvexFieldName[convexFieldName];
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`failed to downlaod: ${fileResponse.statusText}`);
      }
      const file = await fileResponse.blob();
      storageIdByConvexFieldName[convexFieldName] = await ctx.storage.store(
        file
      );
    }
    await ctx.runMutation(internal.typeform.saveFiles, {
      docId,
      storageIdByConvexFieldName,
    });
  },
});

type SaveFilesArgs = {
  docId: Id<TableNames>;
  storageIdByConvexFieldName: { [k: string]: string };
};

export const saveFiles = internalMutation({
  handler: async (
    ctx,
    { docId, storageIdByConvexFieldName }: SaveFilesArgs
  ) => {
    await ctx.db.patch(docId, storageIdByConvexFieldName);
  },
});
