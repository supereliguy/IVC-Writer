NC IVC Form Writer

Overview

This is a client-side, HIPAA-compliant web application to assist qualified petitioners and clinicians in North Carolina with completing involuntary commitment forms.

This tool is inspired by conwriter.com (for Tennessee) and is built with privacy as the absolute priority.

Supported Forms

AOC-SP-300: Affidavit and Petition for Involuntary Commitment

DMH-5-72-19: First Examination for Involuntary Commitment

Privacy & HIPAA Compliance

This application is 100% client-side.

No patient data (PHI) or any other information is ever sent to or stored on a server.

All form data is processed locally in your web browser using JavaScript.

The completed PDF is generated on your computer and downloaded directly to your device.

The "Remember my information" feature (for petitioners) uses your browser's Local Storage, which is sandboxed to your computer and is not accessible by any server.

How to Use This Project

This project is a static website. It can be run from anywhere, including your local computer or a free host like GitHub Pages.

Setting Up with GitHub Pages

Fork/Upload: Fork this repository or upload the files (index.html, README.md, .gitignore, AOC-SP-300.pdf, DMH 5-72-19.pdf) to a new GitHub repository.

Enable GitHub Pages:

In your repository, go to Settings > Pages.

Under "Build and deployment," set the Source to Deploy from a branch.

Set the Branch to main and the folder to /(root).

Click Save.

Done: Your application will be live in a few minutes at https://<your-username>.github.io/<your-repository-name>/.

How to Add Fields (Finding Coordinates)

The most difficult part of this project is mapping the HTML form fields to the (x, y) coordinates on the PDF. All coordinates are defined in the COORDS_AOC_SP_300 and COORDS_DMH_5_72_19 objects at the top of the <script> tag in index.html.

The (0, 0) origin is at the bottom-left of the PDF page.

The "Trial and Error" Method:

Open index.html in a text editor (or on GitHub).

Find the coordinate object for the form you want to edit (e.g., COORDS_DMH_5_72_19).

To find the coordinate for a new field:

Add a new entry: SOME_FIELD: { x: 100, y: 500 }.

Add the logic to drawText or drawCheck in the generateDmhPdf function.

Refresh the live website, fill in the field, and click "Generate PDF".

Open the downloaded PDF and see where your text appeared.

If it's too low and too far left, increase the y and x values (e.g., SOME_FIELD: { x: 120, y: 550 }).

Repeat until the text is perfectly placed in its box.

Disclaimer

This is a tool to assist with form completion and is not a substitute for legal or medical advice. The user is responsible for ensuring the accuracy and completeness of the information and for following all state laws and facility policies regarding involuntary commitment.
