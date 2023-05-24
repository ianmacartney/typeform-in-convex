
async function importTypeform() {
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
    // For now just seeing what I get
    console.log(formData.fields)

    const rawResponses = await fetch(`https://api.typeform.com/forms/${FORM_ID}/responses`, {
        headers: new Headers({
            'Authorization': `Bearer ${process.env['TYPEFORM_API_KEY']}`
        })
    });
    const responsesData = await rawResponses.json();
    for (const response of responsesData.items) {
        console.log(response.answers)
    }
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
importTypeform()