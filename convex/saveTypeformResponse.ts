import {internalAction, internalMutation, mutation} from "./_generated/server";
import {Id, TableNames} from "./_generated/dataModel";

type Answer = ChoiceAnswer | TextAnswer | BooleanAnswer | NumberAnswer | FileUploadAnswer;

type ChoiceAnswer = {type: 'choice'; choice: {label: string}} & FieldData
type TextAnswer = {type: 'text'; text: string} & FieldData
type BooleanAnswer = {type: 'boolean'; boolean: boolean} & FieldData
type NumberAnswer = {type: 'number'; number: number} & FieldData
type FileUploadAnswer = {type: 'file_url'; file_url: string} & FieldData

type FieldData = {
  field: { id: string; type: string; ref: string; }
}

type TypeformPayload = {
  formId: string;
  answers: Answer[];
  hidden: {[k: string]: string};
}



export default mutation(async ({db, scheduler}, {formId, answers, hidden}: TypeformPayload) => {
  const fieldMappings = await db.query("typeform_metadata").withIndex("by_typeform_form_id",
      q => q.eq("typeformFormId", formId)).collect();
  if (fieldMappings.length === 0) {
    throw new Error(`No field mappings found for typeform form ${formId}`);
  }
  const convexTableName = fieldMappings[0]['convexTableName'] as TableNames;

  const convexFieldNameByTypeformFieldId: {[k: string]: string} = {}
  for (const {typeformFieldId, convexFieldName} of fieldMappings) {
    convexFieldNameByTypeformFieldId[typeformFieldId] = convexFieldName;
  }

  const convexDoc: {[k: string] : any} = {};
  const fileUrlByConvexFieldName: {[k: string]: string} = {}
  for (const answer of answers) {
    const typeformFieldId = answer.field.id;
    const convexFieldName = convexFieldNameByTypeformFieldId[typeformFieldId];

    if (convexFieldName === undefined) {
      // If we excluded this field from the typeform_metadata table, we don't want to keep the value
      continue
    }
    if (answer.type === 'file_url') {
      const fileUrl = answer.file_url;
      fileUrlByConvexFieldName[convexFieldName] = fileUrl;
    } else {
      // @ts-ignore TODO figure out how to model typeform's types here so this doesn't complain
      const convexFieldValue = answer[answer.type]
      convexDoc[convexFieldName] = convexFieldValue;
    }
  }
  for (const hiddenField of Object.keys(hidden)) {
    const convexFieldName = convexFieldNameByTypeformFieldId[hiddenField];
    if (convexFieldName === undefined) {
      // If we excluded this field from mappings.json, we don't want to keep the value
      continue
    }
    convexDoc[convexFieldName] = hidden[hiddenField];
  }
  const docId = await db.insert(convexTableName, convexDoc);
  await scheduler.runAfter(0, "saveTypeformResponse:fetchFiles", {docId, fileUrlByConvexFieldName})
})

type FetchFilesArgs = {
  docId: Id<TableNames>;
  fileUrlByConvexFieldName: {[k: string]: string};
}
export const fetchFiles = internalAction(async ({storage, runMutation}, {docId, fileUrlByConvexFieldName}: FetchFilesArgs) => {
  const storageIdByConvexFieldName: {[k: string]: string} = {};
  for (const convexFieldName of Object.keys(fileUrlByConvexFieldName)) {
    const fileUrl = fileUrlByConvexFieldName[convexFieldName];
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`failed to downlaod: ${fileResponse.statusText}`)
    }
    const file = await fileResponse.blob();
    storageIdByConvexFieldName[convexFieldName] = await(storage.store(file));
  }
  await runMutation("saveTypeformResponse:saveFiles", {docId, storageIdByConvexFieldName})
})

type SaveFilesArgs = {
  docId: Id<TableNames>;
  storageIdByConvexFieldName: {[k: string]: string};
}

export const saveFiles = internalMutation(async ({db}, {docId, storageIdByConvexFieldName}: SaveFilesArgs) => {
  await db.patch(docId, storageIdByConvexFieldName)
})