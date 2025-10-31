// Get PDF libraries
const { PDFDocument, rgb, StandardFonts } = PDFLib;

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  // --- County List ---
  const ncCounties = [
    "Alamance", "Alexander", "Alleghany", "Anson", "Ashe", "Avery", "Beaufort",
    "Bertie", "Bladen", "Brunswick", "Buncombe", "Burke", "Cabarrus", "Caldwell",
    "Camden", "Carteret", "Caswell", "Catawba", "Chatham", "Cherokee", "Chowan",
    "Clay", "Cleveland", "Columbus", "Craven", "Cumberland", "Currituck", "Dare",
    "Davidson", "Davie", "Duplin", "Durham", "Edgecombe", "Forsyth", "Franklin",
    "Gaston", "Gates", "Graham", "Granville", "Greene", "Guilford", "Halifax",
    "Harnett", "Haywood", "Henderson", "Hertford", "Hoke", "Hyde", "Iredell",
    "Jackson", "Johnston", "Jones", "Lee", "Lenoir", "Lincoln", "Macon",
    "Madison", "Martin", "McDowell", "Mecklenburg", "Mitchell", "Montgomery",
    "Moore", "Nash", "New Hanover", "Northampton", "Onslow", "Orange", "Pamlico",
    "Pasquotank", "Pender", "Perquimans", "Person", "Pitt", "Polk", "Randolph",
    "Richmond", "Robeson", "Rockingham", "Rowan", "Rutherford", "Sampson",
    "Scotland", "Stanly", "Stokes", "Surry", "Swain", "Transylvania", "Tyrrell",
    "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne",
    "Wilkes", "Wilson", "Yadkin", "Yancey"
  ];

  const unifiedCountyDropdown = document.getElementById("unified-county");
  // The individual form tabs are less important now, but we'll keep them functional.
  const aocCountyDropdown = document.getElementById("aoc-county");
  const dmhCountyDropdown = document.getElementById("dmh-county");

  ncCounties.forEach((county) => {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    unifiedCountyDropdown.appendChild(option.cloneNode(true));
    if(aocCountyDropdown) aocCountyDropdown.appendChild(option.cloneNode(true));
    if(dmhCountyDropdown) dmhCountyDropdown.appendChild(option.cloneNode(true));
  });


  // --- PDF GENERATION ---
  const FORM_URL_AOC = "./AOC-SP-300.pdf";
  const FORM_URL_DMH = "./DMH 5-72-19.pdf";

  // --- Helper Functions ---
  function showSpinner() {
    document.getElementById("loading-spinner").classList.remove("hidden");
  }
  function hideSpinner() {
    document.getElementById("loading-spinner").classList.add("hidden");
  }

  // --- PDF Generation Logic ---
  async function generateAocPdf(data) {
    const existingPdfBytes = await fetch(FORM_URL_AOC).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Helper to split addresses
    const splitAddress = (fullAddress) => {
        const parts = fullAddress.split(',');
        const street = parts[0] || '';
        const city = (parts[1] || '').trim();
        const stateZip = (parts[2] || '').trim().split(' ');
        const state = stateZip[0] || '';
        const zip = stateZip[1] || '';
        return { street, city, state, zip };
    };

    const respAddr = splitAddress(data.respondentAddress);
    const petAddr = splitAddress(data.petitionerAddress);

    // Header
    form.getTextField("FileNo").setText(data.fileNo);
    form.getTextField("County").setText(data.county);

    // Respondent Info
    form.getTextField("RespondentName").setText(data.respondentName);
    form.getTextField("RespAddr1").setText(respAddr.street);
    form.getTextField("RespCity").setText(respAddr.city);
    form.getTextField("RespState").setText(respAddr.state);
    form.getTextField("RespZip").setText(respAddr.zip);
    form.getTextField("RespDOB").setText(data.respondentDob);

    // Commitment Type
    // CkBox_001: Mental illness & dangerousness
    if (data.isMi && (data.isMiDangerSelf || data.isMiDangerOthers)) {
      form.getCheckBox("CkBox_001").check();
    }
    // CkBox_003: Substance abuse and dangerousness
    if (data.isSa && (data.isSaDangerSelf || data.isSaDangerOthers)) {
      form.getCheckBox("CkBox_003").check();
    }

    form.getTextField("Memo_001").setText(data.findings);

    // Petitioner Info
    form.getTextField("PetName").setText(data.petitionerName);
    form.getTextField("PetitAddr1").setText(petAddr.street);
    form.getTextField("PetitCity").setText(petAddr.city);
    form.getTextField("PetitState").setText(petAddr.state);
    form.getTextField("PetitZip").setText(petAddr.zip);
    form.getTextField("RelationshipResp").setText(data.petitionerRelationship);
    form.getTextField("PetitionerHomePhoneNo").setText(data.petitionerPhone);

    return await pdfDoc.save();
  }

  async function generateDmhPdf(data) {
    const existingPdfBytes = await fetch(FORM_URL_DMH).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Header
    form.getTextField("County").setText(data.county);
    form.getTextField("Client Record").setText(data.clientRecord);
    form.getTextField("File").setText(data.fileNo);

    // Respondent & Contacts
    form.getTextField("Name of Respondent").setText(data.respondentName);
    form.getTextField("DOB").setText(data.respondentDob);
    form.getTextField("Age").setText(data.respondentAge);
    form.getTextField("Sex").setText(data.respondentSex);
    form.getTextField("Race").setText(data.respondentRace);
    form.getTextField("MS").setText(data.respondentMs);

    const respAddrParts = data.respondentAddress.split(',');
    form.getTextField("Address Street or Box Number").setText(respAddrParts[0] || '');
    form.getTextField("City").setText((respAddrParts[1] || '').trim());
    const stateZip = (respAddrParts[2] || '').trim().split(' ');
    form.getTextField("State").setText(stateZip[0] || '');
    form.getTextField("Zip").setText(stateZip[1] || '');
    form.getTextField("County_2").setText(data.county);
    form.getTextField("Phone").setText(data.respondentPhone);

    // Legally Responsible Person
    form.getTextField("Legally Responsible Person or Next of Kin Name").setText(data.lrpName);
    form.getTextField("Relationship").setText(data.lrpRelationship);
    const lrpAddrParts = data.lrpAddress.split(',');
    form.getTextField("Address Street or Box Number_2").setText(lrpAddrParts[0] || '');
    form.getTextField("City_2").setText((lrpAddrParts[1] || '').trim());
    const lrpStateZip = (lrpAddrParts[2] || '').trim().split(' ');
    form.getTextField("State_2").setText(lrpStateZip[0] || '');
    form.getTextField("Zip_2").setText(lrpStateZip[1] || '');
    form.getTextField("Phone_2").setText(data.lrpPhone);

    // Petitioner
    form.getTextField("Petitioner Name").setText(data.petitionerName);
    form.getTextField("Relationship_2").setText(data.petitionerRelationship);
    const petAddrParts = data.petitionerAddress.split(',');
    form.getTextField("Address Street or Box Number_3").setText(petAddrParts[0] || '');
    form.getTextField("City_3").setText((petAddrParts[1] || '').trim());
    const petStateZip = (petAddrParts[2] || '').trim().split(' ');
    form.getTextField("State_3").setText(petStateZip[0] || '');
    form.getTextField("Zip_3").setText(petStateZip[1] || '');
    form.getTextField("Phone_3").setText(data.petitionerPhone);

    // Exam Details
    if (data.examDate) {
      const parts = data.examDate.split("-"); // YYYY-MM-DD
      const formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
      form.getTextField("undefined").setText(formattedDate);
    }
    form.getTextField("undefined_2").setText(data.examTime);
    form.getTextField("undefined_3").setText(data.examLocation);

    // Commitment Criteria
    if (data.isMi) form.getCheckBox("An individual with a mental illness").check();
    if (data.isMiDangerSelf) form.getCheckBox("Self or").check();
    if (data.isMiDangerOthers) form.getCheckBox("Others").check();
    if (data.isSa) form.getCheckBox("A Substance Abuser").check();
    if (data.isSaDangerSelf) form.getCheckBox("Self or_2").check();
    if (data.isSaDangerOthers) form.getCheckBox("Others_2").check();

    // Findings & Health Screening
    form.getTextField("Clear description of findings findings for each criterion checked in Section I must be described").setText(data.findings);
    form.getTextField("ImpressionDiagnosis").setText(data.impression);
    form.getTextField("HR").setText(data.hr);
    form.getTextField("RR").setText(data.rr);
    form.getTextField("Temp").setText(data.temp);
    form.getTextField("Knownreported medical problems diabetes hypertension heart attacks sickle cell anemia asthma etc").setText(data.medicalProblems);
    form.getTextField("Knownreported allergies").setText(data.allergies);
    form.getTextField("Knownreported current medications please list").setText(data.medications);

    // Medical Red Flags
    if (data.flagChestPain) form.getCheckBox("Chest pain or shortness of breath").check();
    if (data.flagOverdose) form.getCheckBox("Suspected overdose on substances or medications within the past 24 hours including acetaminophen").check();
    if (data.flagSeverePain) form.getCheckBox("Presence of severe pain eg abdominal pain head pain").check();
    if (data.flagDisoriented) form.getCheckBox("Disoriented confused or unable to maintain balance").check();
    if (data.flagHeadTrauma) form.getCheckBox("Head trauma or recent loss of consciousness").check();
    if (data.flagPhysicalTrauma) form.getCheckBox("Recent physical trauma or profuse bleeding").check();
    if (data.flagWeakness) form.getCheckBox("New weakness numbness speech difficulties or visual changes").check();

    // Consult Triggers
    if (data.triggerAge) form.getCheckBox("Age 12 or 65 years old").check();
    if (data.triggerBp) form.getCheckBox("Systolic BP 160 or 100 andor diastolic 100 or 60").check();
    if (data.triggerHr) form.getCheckBox("Heart Rate 110 or 55 bpm").check();
    if (data.triggerRr) form.getCheckBox("Respiratory Rate 20 or 12 breaths per minute").check();
    if (data.triggerTemp) form.getCheckBox("Temperature 380 C 1004 F or 360 C 968 F").check();
    if (data.triggerDiabetes) form.getCheckBox("Known diagnosis of diabetes and not taking prescribed medications").check();
    if (data.triggerSeizures) form.getCheckBox("Recent seizure or history of seizures and not taking seizure medications").check();
    if (data.triggerAsthma) form.getCheckBox("Known diagnosis of asthma or chronic obstructive pulmonary disease and not taking prescribed medications").check();
    if (data.triggerPregnancy) form.getCheckBox("Known or suspected pregnancy").check();

    // Disposition
    if (data.dispInpatient) form.getCheckBox("Inpatient Commitment for").check();
    if (data.dispOutpatient) form.getCheckBox("Outpatient Commitment respondent must meet ALL of the first four criteria outlined in Section I Outpatient").check();
    if (data.dispSubstanceAbuse) form.getCheckBox("Substance Abuse Commitment respondent must meet both criteria outlined in Section I Substance Abuse").check();
    if (data.dispVoluntary) form.getCheckBox("Respondent or Legally Responsible Person Consented to Voluntary Treatment").check();
    if (data.dispRelease) form.getCheckBox("Release Respondent and Terminate Proceedings insufficient findings to indicate that respondent meets commitment criteria").check();

    // Examiner Info
    form.getTextField("Print Name of Examiner").setText(data.examinerName);
    const facilityParts = data.facilityInfo.split(',');
    form.getTextField("Address of Facility").setText(facilityParts[0] || '');
    form.getTextField("City and State").setText(`${(facilityParts[1] || '').trim()}, ${(facilityParts[2] || '').trim()}`);
    form.getTextField("Telephone Number").setText((facilityParts[3] || '').trim());


    return await pdfDoc.save();
  }

  async function generateBothPdfs() {
    showSpinner();
    try {
      // Helper function to get value from an element
      const getValue = (id) => document.getElementById(id).value;
      const isChecked = (id) => document.getElementById(id).checked;
      const getRadio = (name) => {
          const radios = document.getElementsByName(name);
          for (let i = 0; i < radios.length; i++) {
              if (radios[i].checked) return radios[i].id;
          }
          return null;
      }

      const data = {
        // General / Header
        county: getValue("unified-county"),
        clientRecord: getValue("unified-client-record"),
        fileNo: getValue("unified-file-no"),

        // Respondent Info
        respondentName: getValue("unified-respondent-name"),
        respondentDob: getValue("unified-respondent-dob"),
        respondentAge: getValue("unified-respondent-age"),
        respondentSex: getValue("unified-respondent-sex"),
        respondentRace: getValue("unified-respondent-race"),
        respondentMs: getValue("unified-respondent-ms"),
        respondentAddress: getValue("unified-respondent-address"),
        respondentPhone: getValue("unified-respondent-phone"),

        // Legally Responsible Person
        lrpName: getValue("unified-lrp-name"),
        lrpRelationship: getValue("unified-lrp-relationship"),
        lrpAddress: getValue("unified-lrp-address"),
        lrpPhone: getValue("unified-lrp-phone"),

        // Petitioner Info
        petitionerName: getValue("unified-petitioner-name"),
        petitionerRelationship: getValue("unified-petitioner-relationship"),
        petitionerAddress: getValue("unified-petitioner-address"),
        petitionerPhone: getValue("unified-petitioner-phone"),

        // Exam Details
        examDate: getValue("unified-exam-date"),
        examTime: getValue("unified-exam-time"),
        examLocation: getValue("unified-exam-location"),

        // Commitment Criteria
        isMi: isChecked("unified-check-mi"),
        isMiDangerSelf: isChecked("unified-check-mi-danger-self"),
        isMiDangerOthers: isChecked("unified-check-mi-danger-others"),
        isSa: isChecked("unified-check-sa"),
        isSaDangerSelf: isChecked("unified-check-sa-danger-self"),
        isSaDangerOthers: isChecked("unified-check-sa-danger-others"),

        // Findings & Health Screening
        findings: getValue("unified-findings"),
        impression: getValue("unified-impression"),
        hr: getValue("unified-hr"),
        rr: getValue("unified-rr"),
        temp: getValue("unified-temp"),
        medicalProblems: getValue("unified-medical-problems"),
        allergies: getValue("unified-allergies"),
        medications: getValue("unified-medications"),

        // Medical Red Flags
        flagChestPain: isChecked("flag-chest-pain"),
        flagOverdose: isChecked("flag-overdose"),
        flagSeverePain: isChecked("flag-severe-pain"),
        flagDisoriented: isChecked("flag-disoriented"),
        flagHeadTrauma: isChecked("flag-head-trauma"),
        flagPhysicalTrauma: isChecked("flag-physical-trauma"),
        flagWeakness: isChecked("flag-weakness"),

        // Consult Triggers
        triggerAge: isChecked("trigger-age"),
        triggerBp: isChecked("trigger-bp"),
        triggerHr: isChecked("trigger-hr"),
        triggerRr: isChecked("trigger-rr"),
        triggerTemp: isChecked("trigger-temp"),
        triggerDiabetes: isChecked("trigger-diabetes"),
        triggerSeizures: isChecked("trigger-seizures"),
        triggerAsthma: isChecked("trigger-asthma"),
        triggerPregnancy: isChecked("trigger-pregnancy"),

        // Disposition
        dispInpatient: isChecked("disp-inpatient"),
        dispOutpatient: isChecked("disp-outpatient"),
        dispSubstanceAbuse: isChecked("disp-substance-abuse"),
        dispVoluntary: isChecked("disp-voluntary"),
        dispRelease: isChecked("disp-release"),

        // Examiner Info
        examinerName: getValue("unified-examiner-name"),
        facilityInfo: getValue("unified-facility-info"),
      };

      const aocPdfBytes = await generateAocPdf(data);
      saveAs(
        new Blob([aocPdfBytes], { type: "application/pdf" }),
        "Completed-AOC-SP-300.pdf",
      );

      const dmhPdfBytes = await generateDmhPdf(data);
      saveAs(
        new Blob([dmhPdfBytes], { type: "application/pdf" }),
        "Completed-DMH-5-72-19.pdf",
      );
    } catch (error) {
      console.error("Error generating both PDFs:", error);
      alert(
        "Error generating PDFs. Check the console and make sure the PDF files are in your GitHub repository.",
      );
    } finally {
      hideSpinner();
    }
  }

  // --- EVENT LISTENERS ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const formSections = document.querySelectorAll(".form-section");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("tab-active"));
      formSections.forEach((sec) => sec.classList.add("hidden"));
      button.classList.add("tab-active");
      document
        .getElementById("form-" + button.dataset.form)
        .classList.remove("hidden");
    });
  });

  document.getElementById("generate-both").addEventListener("click", generateBothPdfs);

  // The individual generate buttons are now less critical, but we'll leave the listeners
  const generateAocBtn = document.getElementById("generate-aoc");
  if(generateAocBtn) {
      generateAocBtn.addEventListener("click", () => alert("Please use the Unified Form tab to generate both PDFs at once."));
  }

  const generateDmhBtn = document.getElementById("generate-dmh");
  if(generateDmhBtn) {
    generateDmhBtn.addEventListener("click", () => alert("Please use the Unified Form tab to generate both PDFs at once."));
  }

  // --- Local Storage Logic ---
  const localSaveInputs = document.querySelectorAll(".local-save");
  const rememberCheckboxes = document.querySelectorAll(
    'input[id$="-remember-me"]',
  );

  function loadSavedData() {
    const remember = localStorage.getItem("rememberMe") === "true";
    rememberCheckboxes.forEach((box) => (box.checked = remember));
    if (remember) {
      localSaveInputs.forEach((input) => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
          input.value = savedValue;
        }
      });
    }
  }

  function handleRememberCheck() {
    const remember = this.checked;
    localStorage.setItem("rememberMe", remember);

    rememberCheckboxes.forEach((box) => {
      if (box !== this) box.checked = remember;
    });

    if (remember) {
      localSaveInputs.forEach((input) => {
        localStorage.setItem(input.id, input.value);
      });
    } else {
      localSaveInputs.forEach((input) => {
        localStorage.removeItem(input.id);
      });
    }
  }

  rememberCheckboxes.forEach((box) =>
    box.addEventListener("change", handleRememberCheck),
  );
  localSaveInputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (localStorage.getItem("rememberMe") === "true") {
        localStorage.setItem(input.id, input.value);
      }
    });
  });

  loadSavedData();
});
