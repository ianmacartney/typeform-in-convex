import {mutation} from "./_generated/server";
import {TableNames} from "./_generated/dataModel";

type Answer = ChoiceAnswer | TextAnswer | BooleanAnswer | NumberAnswer;

type ChoiceAnswer = {type: 'choice'; choice: {label: string}} & FieldData
type TextAnswer = {type: 'text'; text: string} & FieldData
type BooleanAnswer = {type: 'boolean'; boolean: boolean} & FieldData
type NumberAnswer = {type: 'number'; number: number} & FieldData

type FieldData = {
  field: { id: string; type: string; ref: string; }
}

type TypeformPayload = {
  formId: string;
  answers: Answer[];
}



export default mutation(async ({db}, {formId, answers}: TypeformPayload) => {
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
  for (const answer of answers) {
    const typeformFieldId = answer.field.id;
    const convexFieldName = convexFieldNameByTypeformFieldId[typeformFieldId];

    if (convexFieldName === undefined) {
      // If we excluded this field from the typeform_metadata table, we don't want to keep the value
      continue
    }
    // @ts-ignore TODO figure out how to model typeform's types here so this doesn't complain
    const convexFieldValue = answer[answer.type]
    convexDoc[convexFieldName] = convexFieldValue;

  }

  await db.insert(convexTableName, convexDoc);
})
