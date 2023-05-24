This is an example app using Typeform as a way to get data into a Convex project!

It's currently a work in progress


I'll plan to support:

- One time migrate everything you have for a given form in typeform, into convex, setting up a table to hold the responses
- A Convex HTTP Action to handle a Typeform webhook as new responese come in
- All the different typeform question types
- Hopefully using tf hidden fields to keep track of convex authenticated user

The actual sample app will be a dog-spotting app. Users record sightings of dogs
on an embedded typeform, then the responses go to the convex database
which uses it for summary and social features about all the dogs that have been spotted

