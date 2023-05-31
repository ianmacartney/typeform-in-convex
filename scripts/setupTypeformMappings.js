const fs = require('fs');

function sanitizeIdentifierForConvex(typeformIdentifier) {
    // Identifiers can only contain alphanumeric characters or underscores
    return typeformIdentifier.replaceAll(' ', '_').replace(/\W/g, '')
}


async function setupTypeformMappings() {
    const FORM_ID = process.argv[2];
    if (!FORM_ID) {
        console.log("Provide your form ID (an 8 character string found in your form url) as an argument");
        return;
    }
    const rawForm = await fetch(`https://api.typeform.com/forms/${FORM_ID}`, {
        headers: new Headers({
            'Authorization': `Bearer ${process.env['TYPEFORM_API_KEY']}`
        })
    });
    const formData = await rawForm.json()

    const jsonOutput = {
        typeformFormId: FORM_ID,
        convexTableName: sanitizeIdentifierForConvex(formData.title),
        fieldMappings: []
    };

    for (const field of formData.fields) {
        const {id: typeformId, title: typeformQuestionText} = field;
        jsonOutput.fieldMappings.push({
            typeformId,
            typeformQuestionText,
            convexFieldName: sanitizeIdentifierForConvex(typeformQuestionText)
        })
    }
    for (const hiddenFieldName of formData.hidden ?? []) {
        jsonOutput.fieldMappings.push({
            typeformId: hiddenFieldName,
            typeformQuestionText: `Hidden field named '${hiddenFieldName}'`,
            convexFieldName: sanitizeIdentifierForConvex(hiddenFieldName),
        })
    }

    await fs.promises.mkdir('./typeformData', { recursive: true })
    const filename = `./typeformData/mappings_${FORM_ID}.json`;

    await fs.promises.writeFile(filename, JSON.stringify(jsonOutput, null, 2));

    return `Done reading schema typeform schema. Edit your convex table and field names in ${filename}`
}

setupTypeformMappings().then(console.log)