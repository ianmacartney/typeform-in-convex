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
        if (answer.type === 'choice' || answer.type === 'choices') {
            convexDoc[convexFieldName] = answer[answer.type].label;
        } else {
            convexDoc[convexFieldName] = answer[answer.type];
        }
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
    const allFieldNames = new Set();
    for (const field of fieldMappings) {
        const {typeformId: typeformFieldId, convexFieldName} = field
        if (allFieldNames.has(convexFieldName)) {
            console.warn(`Multiple fields would be named \"${convexFieldName}\" -- please rename in ${mappingsFilename}`);
            return "Field name collision"
        } else {
            convexFieldNameByTypeformFieldId[typeformFieldId] = convexFieldName;
            typeformMetadataJSONL.push(JSON.stringify({
                typeformFormId,
                convexTableName,
                typeformFieldId,
                convexFieldName,
            }))
            allFieldNames.add(convexFieldName)
        }
    }

    await fs.promises.writeFile(`./typeformData/typeform_metadata.jsonl`, typeformMetadataJSONL.join('\n'))
    console.log(`Add your typeform field mappings to convex with\n
npx convex import typeform_metadata ./typeformData/typeform_metadata.jsonl\n
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

    console.log(`Add all existing responses to the ${convexTableName} table with\n
npx convex import ${convexTableName} ./typeformData/${convexTableName}.jsonl\n
    To add to existing data use --append; to overwrite any existing data use --replace`)


}
/*

- read form metadata to guess at convex schema


Example app:
- provide summaries of dogs you've seen and dogs everyone has seen

Once the basic thing is working
- get all typeform field types supported
- file upload (a premium typeform feature) -> Convex file storage

- what if you iterate on the typeform, how do you successfully migrate your convex data structure?
*/

importTypeform().then(console.log)