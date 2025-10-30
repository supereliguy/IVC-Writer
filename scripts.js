
// Get PDF libraries
const { PDFDocument, rgb, StandardFonts } = PDFLib;

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // --- County List ---
    const ncCounties = [
        "Alamance", "Alexander", "Alleghany", "Anson", "Ashe", "Avery", "Beaufort", "Bertie", "Bladen", "Brunswick",
        "Buncombe", "Burke", "Cabarrus", "Caldwell", "Camden", "Carteret", "Caswell", "Catawba", "Chatham", "Cherokee",
        "Chowan", "Clay", "Cleveland", "Columbus", "Craven", "Cumberland", "Currituck", "Dare", "Davidson", "Davie",
        "Duplin", "Durham", "Edgecombe", "Forsyth", "Franklin", "Gaston", "Gates", "Graham", "Granville", "Greene",
        "Guilford", "Halifax", "Harnett", "Haywood", "Henderson", "Hertford", "Hoke", "Hyde", "Iredell", "Jackson",
        "Johnston", "Jones", "Lee", "Lenoir", "Lincoln", "Macon", "Madison", "Martin", "McDowell", "Mecklenburg",
        "Mitchell", "Montgomery", "Moore", "Nash", "New Hanover", "Northampton", "Onslow", "Orange", "Pamlico",
        "Pasquotank", "Pender", "Perquimans", "Person", "Pitt", "Polk", "Randolph", "Richmond", "Robeson",
        "Rockingham", "Rowan", "Rutherford", "Sampson", "Scotland", "Stanly", "Stokes", "Surry", "Swain",
        "Transylvania", "Tyrrell", "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne", "Wilkes",
        "Wilson", "Yadkin", "Yancey"
    ];

    const aocCountyDropdown = document.getElementById('aoc-county');
    const dmhCountyDropdown = document.getElementById('dmh-county');

    ncCounties.forEach(county => {
        const option1 = document.createElement('option');
        option1.value = county;
        option1.textContent = county;
        aocCountyDropdown.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = county;
        option2.textContent = county;
        dmhCountyDropdown.appendChild(option2);
    });

    // --- PDF GENERATION ---
    const FORM_URL_AOC = './AOC-SP-300.pdf';
    const FORM_URL_DMH = './DMH 5-72-19.pdf';

    const COORDS_AOC_SP_300 = {
        PAGE_1: {
            COUNTY: { x: 220, y: 740 },
            RESPONDENT_NAME: { x: 120, y: 720 },
            RESPONDENT_AGE: { x: 500, y: 720},
            RESPONDENT_RACE: { x: 120, y: 692 },
            RESPONDENT_GENDER: { x: 220, y: 692 },
            RESPONDENT_DOB: { x: 370, y: 692 },
            CHECK_MI: { x: 70, y: 608 },
            CHECK_SA: { x: 70, y: 560 },
            CHECK_DANGER_SELF: { x: 70, y: 512},
            CHECK_DANGER_OTHERS: { x: 70, y: 488},
            FACTS: { x: 70, y: 420 },
            PETITIONER_NAME: { x: 360, y: 260 },
            PETITIONER_RELATIONSHIP: { x: 360, y: 230 },
            PETITIONER_ADDRESS: { x: 360, y: 200 },
            PETITIONER_PHONE: { x: 360, y: 170 }
        }
    };

    const COORDS_DMH_5_72_19 = {
        PAGE_1: {
            RESPONDENT_NAME: { x: 100, y: 728 },
            COUNTY: { x: 300, y: 728 },
            RESPONDENT_DOB: { x: 440, y: 728 },
            RESPONDENT_AGE: { x: 500, y: 728 },
            RESPONDENT_GENDER: { x: 550, y: 728},
            EXAM_LOCATION: { x: 100, y: 650},
            EXAM_DATE: { x: 400, y: 650},
            EXAM_TIME: { x: 500, y: 650},
            CHECK_MI: { x: 72, y: 555 },
            CHECK_MI_DANGER_SELF: { x: 108, y: 528 },
            CHECK_MI_DANGER_OTHERS: { x: 108, y: 508 },
            CHECK_SA: { x: 300, y: 555 },
            CHECK_SA_DANGER_SELF: { x: 336, y: 528 },
            CHECK_SA_DANGER_OTHERS: { x: 336, y: 508 },
            FACTS: { x: 70, y: 200},
            LEO_PRESENT_YES: { x: 470, y: 140 },
            LEO_PRESENT_NO: { x: 510, y: 140 }
        },
        PAGE_4: {
            CLINICIAN_NAME: { x: 230, y: 250 },
            CLINICIAN_FACILITY: { x: 70, y: 220 },
            FACILITY_ADDRESS: { x: 70, y: 190 },
            FACILITY_PHONE: { x: 70, y: 160},
            LEO_NAME: { x: 300, y: 100},
            LEO_AGENCY: { x: 300, y: 70 }
        }
    };

    // --- Helper Functions ---
    function showSpinner() {
        document.getElementById('loading-spinner').classList.remove('hidden');
    }
    function hideSpinner() {
        document.getElementById('loading-spinner').classList.add('hidden');
    }

    function drawCheck(page, coords, font) {
        page.drawText('X', {
            x: coords.x,
            y: coords.y,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });
    }

    function drawText(page, text, coords, font, size = 10) {
        page.drawText(text, {
            x: coords.x,
            y: coords.y,
            size: size,
            font: font,
            color: rgb(0, 0, 0),
        });
    }

    function drawWrappedText(page, text, coords, font, maxWidth, lineHeight, size = 10) {
        const words = text.split(' ');
        let line = '';
        let y = coords.y;

        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const { width } = font.widthOfTextAtSize(testLine, size);
            if (width > maxWidth) {
                drawText(page, line, { x: coords.x, y }, font, size);
                line = word;
                y -= lineHeight;
            } else {
                line = testLine;
            }
        }
        drawText(page, line, { x: coords.x, y }, font, size);
    }


    // --- PDF Generation Logic ---
    async function generateAocPdf() {
        showSpinner();
        try {
            const existingPdfBytes = await fetch(FORM_URL_AOC).then(res => {
                if (!res.ok) throw new Error(`Failed to load PDF. Make sure 'AOC-SP-300.pdf' is in your repository.`);
                return res.arrayBuffer();
            });

            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page1 = pdfDoc.getPages()[0];
            const coords = COORDS_AOC_SP_300.PAGE_1;

            // Get values from the form
            const county = document.getElementById('aoc-county').value;
            const respondentName = document.getElementById('aoc-respondent-name').value;
            const respondentAge = document.getElementById('aoc-respondent-age').value;
            const respondentRace = document.getElementById('aoc-respondent-race').value;
            const respondentGender = document.getElementById('aoc-respondent-gender').value;
            const respondentDob = document.getElementById('aoc-respondent-dob').value;
            const isMi = document.getElementById('aoc-check-mi').checked;
            const isSa = document.getElementById('aoc-check-sa').checked;
            const isDangerSelf = document.getElementById('aoc-check-danger-self').checked;
            const isDangerOthers = document.getElementById('aoc-check-danger-others').checked;
            const facts = document.getElementById('aoc-facts').value;
            const petitionerName = document.getElementById('aoc-petitioner-name').value;
            const petitionerRelationship = document.getElementById('aoc-petitioner-relationship').value;
            const petitionerAddress = document.getElementById('aoc-petitioner-address').value;
            const petitionerPhone = document.getElementById('aoc-petitioner-phone').value;

            // Draw values onto the PDF
            if (county) drawText(page1, county, coords.COUNTY, font);
            if (respondentName) drawText(page1, respondentName, coords.RESPONDENT_NAME, font);
            if (respondentAge) drawText(page1, respondentAge, coords.RESPONDENT_AGE, font);
            if (respondentRace) drawText(page1, respondentRace, coords.RESPONDENT_RACE, font);
            if (respondentGender) drawText(page1, respondentGender, coords.RESPONDENT_GENDER, font);
            if (respondentDob) drawText(page1, respondentDob, coords.RESPONDENT_DOB, font);
            if (isMi) drawCheck(page1, coords.CHECK_MI, font);
            if (isSa) drawCheck(page1, coords.CHECK_SA, font);
            if (isDangerSelf) drawCheck(page1, coords.CHECK_DANGER_SELF, font);
            if (isDangerOthers) drawCheck(page1, coords.CHECK_DANGER_OTHERS, font);
            if (facts) drawWrappedText(page1, facts, coords.FACTS, font, 450, 12, 9);
            if (petitionerName) drawText(page1, petitionerName, coords.PETITIONER_NAME, font);
            if (petitionerRelationship) drawText(page1, petitionerRelationship, coords.PETITIONER_RELATIONSHIP, font);
            if (petitionerAddress) drawText(page1, petitionerAddress, coords.PETITIONER_ADDRESS, font);
            if (petitionerPhone) drawText(page1, petitionerPhone, coords.PETITIONER_PHONE, font);

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'Completed-AOC-SP-300.pdf');

        } catch (error) {
            console.error('Error generating AOC PDF:', error);
            alert('Error generating PDF. Check the console and make sure the PDF files are in your GitHub repository.');
        } finally {
            hideSpinner();
        }
    }

    async function generateDmhPdf() {
        showSpinner();
        try {
            const existingPdfBytes = await fetch(FORM_URL_DMH).then(res => {
                if (!res.ok) throw new Error(`Failed to load PDF. Make sure 'DMH 5-72-19.pdf' is in your repository.`);
                return res.arrayBuffer();
            });

            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page1 = pdfDoc.getPage(0);
            const page4 = pdfDoc.getPage(3);
            const coordsP1 = COORDS_DMH_5_72_19.PAGE_1;
            const coordsP4 = COORDS_DMH_5_72_19.PAGE_4;

            // Get values from the form
            const clinicianName = document.getElementById('dmh-clinician-name').value;
            const clinicianFacility = document.getElementById('dmh-clinician-facility').value;
            const facilityAddress = document.getElementById('dmh-facility-address').value;
            const facilityPhone = document.getElementById('dmh-facility-phone').value;
            const respName = document.getElementById('dmh-respondent-name').value;
            const respCounty = document.getElementById('dmh-county').value;
            const respDob = document.getElementById('dmh-respondent-dob').value;
            const respAge = document.getElementById('dmh-respondent-age').value;
            const respGender = document.getElementById('dmh-respondent-gender').value;
            const examDate = document.getElementById('dmh-exam-date').value;
            const examTime = document.getElementById('dmh-exam-time').value;
            const examLocation = document.getElementById('dmh-exam-location').value;
            const isMi = document.getElementById('dmh-check-mi').checked;
            const isMiDangerSelf = document.getElementById('dmh-check-mi-danger-self').checked;
            const isMiDangerOthers = document.getElementById('dmh-check-mi-danger-others').checked;
            const isSa = document.getElementById('dmh-check-sa').checked;
            const isSaDangerSelf = document.getElementById('dmh-check-sa-danger-self').checked;
            const isSaDangerOthers = document.getElementById('dmh-check-sa-danger-others').checked;
            const facts = document.getElementById('dmh-facts').value;
            const isLeoPresent = document.getElementById('dmh-leo-present').checked;
            const leoName = document.getElementById('dmh-leo-name').value;
            const leoAgency = document.getElementById('dmh-leo-agency').value;

            // Draw on Page 1
            if (respName) drawText(page1, respName, coordsP1.RESPONDENT_NAME, font);
            if (respCounty) drawText(page1, respCounty, coordsP1.COUNTY, font);
            if (respDob) drawText(page1, respDob, coordsP1.RESPONDENT_DOB, font);
            if (respAge) drawText(page1, respAge, coordsP1.RESPONDENT_AGE, font);
            if (respGender) drawText(page1, respGender, coordsP1.RESPONDENT_GENDER, font);
            if (examLocation) drawText(page1, examLocation, coordsP1.EXAM_LOCATION, font);
            if (examDate) drawText(page1, examDate, coordsP1.EXAM_DATE, font);
            if (examTime) drawText(page1, examTime, coordsP1.EXAM_TIME, font);
            if (isMi) drawCheck(page1, coordsP1.CHECK_MI, font);
            if (isMiDangerSelf) drawCheck(page1, coordsP1.CHECK_MI_DANGER_SELF, font);
            if (isMiDangerOthers) drawCheck(page1, coordsP1.CHECK_MI_DANGER_OTHERS, font);
            if (isSa) drawCheck(page1, coordsP1.CHECK_SA, font);
            if (isSaDangerSelf) drawCheck(page1, coordsP1.CHECK_SA_DANGER_SELF, font);
            if (isSaDangerOthers) drawCheck(page1, coordsP1.CHECK_SA_DANGER_OTHERS, font);
            if (facts) drawWrappedText(page1, facts, coordsP1.FACTS, font, 480, 14, 10);
            if (isLeoPresent) {
                drawCheck(page1, coordsP1.LEO_PRESENT_YES, font)
            } else {
                drawCheck(page1, coordsP1.LEO_PRESENT_NO, font)
            };

            // Draw on Page 4
            if (clinicianName) drawText(page4, clinicianName, coordsP4.CLINICIAN_NAME, font);
            if (clinicianFacility) drawText(page4, clinicianFacility, coordsP4.CLINICIAN_FACILITY, font);
            if (facilityAddress) drawText(page4, facilityAddress, coordsP4.FACILITY_ADDRESS, font);
            if (facilityPhone) drawText(page4, facilityPhone, coordsP4.FACILITY_PHONE, font);
            if (isLeoPresent) {
                if (leoName) drawText(page4, leoName, coordsP4.LEO_NAME, font);
                if (leoAgency) drawText(page4, leoAgency, coordsP4.LEO_AGENCY, font);
            }

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'Completed-DMH-5-72-19.pdf');

        } catch (error) {
            console.error('Error generating DMH PDF:', error);
            alert('Error generating PDF. Check the console and make sure the PDF files are in your GitHub repository.');
        } finally {
            hideSpinner();
        }
    }


    // --- EVENT LISTENERS ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const formSections = document.querySelectorAll('.form-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('tab-active'));
            formSections.forEach(sec => sec.classList.add('hidden'));
            button.classList.add('tab-active');
            document.getElementById('form-' + button.dataset.form).classList.remove('hidden');
        });
    });

    document.getElementById('generate-aoc').addEventListener('click', generateAocPdf);
    document.getElementById('generate-dmh').addEventListener('click', generateDmhPdf);

    // LEO Details Toggle
    document.getElementById('dmh-leo-present').addEventListener('change', function() {
        document.getElementById('leo-details').classList.toggle('hidden', !this.checked);
    });

    // --- Local Storage Logic ---
    const localSaveInputs = document.querySelectorAll('.local-save');
    const rememberCheckboxes = document.querySelectorAll('input[id$="-remember-me"]');

    function loadSavedData() {
        const remember = localStorage.getItem('rememberMe') === 'true';
        rememberCheckboxes.forEach(box => box.checked = remember);
        if (remember) {
            localSaveInputs.forEach(input => {
                const savedValue = localStorage.getItem(input.id);
                if (savedValue) {
                    input.value = savedValue;
                }
            });
        }
    }

    function handleRememberCheck() {
        const remember = this.checked;
        localStorage.setItem('rememberMe', remember);

        rememberCheckboxes.forEach(box => {
            // Sync both checkboxes
            if(box !== this) box.checked = remember;
        });

        if (remember) {
            localSaveInputs.forEach(input => {
                localStorage.setItem(input.id, input.value);
            });
        } else {
            localSaveInputs.forEach(input => {
                localStorage.removeItem(input.id);
            });
        }
    }

    rememberCheckboxes.forEach(box => box.addEventListener('change', handleRememberCheck));
    localSaveInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (localStorage.getItem('rememberMe') === 'true') {
                localStorage.setItem(input.id, input.value);
            }
        });
    });

    loadSavedData();
});