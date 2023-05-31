const fs = require('fs');

function mapResponseForConvex(response, convexFieldNameByTypeformFieldId) {
    // TOOD maybe also keep a reference to this response's typeform id for posterity?
    const convexDoc = {};

    for (const answer of response.answers) {
        const typeformFieldId = answer.field.id;
        const convexFieldName = convexFieldNameByTypeformFieldId[typeformFieldId];
        if (convexFieldName === undefined) {
            // If we excluded this field from mappings.json, we don't want to keep the value
            continue
        }
        // TODO custom mapping of these based on the field type
        convexDoc[convexFieldName] = answer[answer.type];
    }
    for (const hiddenField of Object.keys(response.hidden)) {
        const convexFieldName = convexFieldNameByTypeformFieldId[hiddenField];
        if (convexFieldName === undefined) {
            // If we excluded this field from mappings.json, we don't want to keep the value
            continue
        }
        convexDoc[convexFieldName] = response.hidden[hiddenField];
    }
    return convexDoc
}

async function importTypeform() {
    const FORM_ID = process.argv[2];
    if (!FORM_ID) {
        console.log("Provide your form ID (an 8 character string found in your form url) as an argument");
        return;
    }
    const mappingsFilename = `./typeformData/mappings_${FORM_ID}.json`;
    const mappingsFile = await fs.promises.readFile(mappingsFilename, 'utf8');
    const {typeformFormId, convexTableName, fieldMappings} = JSON.parse(mappingsFile.toString())
    // convex will have a typeform_metadata table with schema
    const typeformMetadataJSONL = [];
    const convexFieldNameByTypeformFieldId = {}
    for (const field of fieldMappings) {
        const {typeformId: typeformFieldId, convexFieldName} = field
        convexFieldNameByTypeformFieldId[typeformFieldId] = convexFieldName;
        typeformMetadataJSONL.push(JSON.stringify({
            typeformFormId,
            convexTableName,
            typeformFieldId,
            convexFieldName,
        }))
    }

    await fs.promises.writeFile(`./typeformData/typeform_metadata.jsonl`, typeformMetadataJSONL.join('\n'))
    console.log(`Add your typeform field mappings to convex with 
        npx convex import typeform_metadata ./typeformData/typeform_metadata.jsonl
    If you already have some forms working, use --append to keep their mappings and add these`)


    const rawResponses = await fetch(`https://api.typeform.com/forms/${FORM_ID}/responses`, {
        headers: new Headers({
            'Authorization': `Bearer ${process.env['TYPEFORM_API_KEY']}`
        })
    });
    const responsesData = await rawResponses.json();


    const responsesJSONL = []
    for (const response of responsesData.items) {
        responsesJSONL.push(JSON.stringify(mapResponseForConvex(response, convexFieldNameByTypeformFieldId)))
    }
    await fs.promises.writeFile(`./typeformData/${convexTableName}.jsonl`, responsesJSONL.join('\n'))

    console.log(`Add all existing responses to the ${convexTableName} table with 
        npx convex import ${convexTableName} ./typeformData/${convexTableName}.jsonl
    To add to existing data use --append; to overwrite any existing data use --replace`)


}
/*
Support the one-time import of all existing responses of a given form:
- field name mapping but this time it needs to be stored in a convex metadata table
- download values as jsonl and provide convex import statements
- read form metadata to guess at convex schema

Stream responses into my app in an ongoing way
- set up a webhook in typeform that hits a convex http action https://docs.convex.dev/functions/http-actions
- the action should save the response following the mappings in the metadata table

Example app:
- provide summaries of dogs you've seen and dogs everyone has seen

Once the basic thing is working
- get all typeform field types supported
- file upload (a premium typeform feature) -> Convex file storage
- use hidden fields to authenticate which user submitted which typeform responses

- what if you iterate on the typeform, how do you successfully migrate your convex data structure?
*/

importTypeform().then(console.log)