// Get PDF libraries
const { PDFDocument, rgb, StandardFonts } = PDFLib;

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  // --- County List ---
  const ncCounties = [
    "Alamance",
    "Alexander",
    "Alleghany",
    "Anson",
    "Ashe",
    "Avery",
    "Beaufort",
    "Bertie",
    "Bladen",
    "Brunswick",
    "Buncombe",
    "Burke",
    "Cabarrus",
    "Caldwell",
    "Camden",
    "Carteret",
    "Caswell",
    "Catawba",
    "Chatham",
    "Cherokee",
    "Chowan",
    "Clay",
    "Cleveland",
    "Columbus",
    "Craven",
    "Cumberland",
    "Currituck",
    "Dare",
    "Davidson",
    "Davie",
    "Duplin",
    "Durham",
    "Edgecombe",
    "Forsyth",
    "Franklin",
    "Gaston",
    "Gates",
    "Graham",
    "Granville",
    "Greene",
    "Guilford",
    "Halifax",
    "Harnett",
    "Haywood",
    "Henderson",
    "Hertford",
    "Hoke",
    "Hyde",
    "Iredell",
    "Jackson",
    "Johnston",
    "Jones",
    "Lee",
    "Lenoir",
    "Lincoln",
    "Macon",
    "Madison",
    "Martin",
    "McDowell",
    "Mecklenburg",
    "Mitchell",
    "Montgomery",
    "Moore",
    "Nash",
    "New Hanover",
    "Northampton",
    "Onslow",
    "Orange",
    "Pamlico",
    "Pasquotank",
    "Pender",
    "Perquimans",
    "Person",
    "Pitt",
    "Polk",
    "Randolph",
    "Richmond",
    "Robeson",
    "Rockingham",
    "Rowan",
    "Rutherford",
    "Sampson",
    "Scotland",
    "Stanly",
    "Stokes",
    "Surry",
    "Swain",
    "Transylvania",
    "Tyrrell",
    "Union",
    "Vance",
    "Wake",
    "Warren",
    "Washington",
    "Watauga",
    "Wayne",
    "Wilkes",
    "Wilson",
    "Yadkin",
    "Yancey",
  ];

  const unifiedCountyDropdown = document.getElementById("unified-county");
  const aocCountyDropdown = document.getElementById("aoc-county");
  const dmhCountyDropdown = document.getElementById("dmh-county");

  ncCounties.forEach((county) => {
    const option1 = document.createElement("option");
    option1.value = county;
    option1.textContent = county;
    aocCountyDropdown.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = county;
    option2.textContent = county;
    dmhCountyDropdown.appendChild(option2.cloneNode(true));
    unifiedCountyDropdown.appendChild(option2);
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
    const existingPdfBytes = await fetch(FORM_URL_AOC).then((res) =>
      res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    form.getTextField("County").setText(data.county);
    form.getTextField("RespondentName").setText(data.respondentName);
    form.getTextField("RespDOB").setText(data.respondentDob);

    if (data.isMi) form.getCheckBox("CkBox_001").check();
    if (data.isSa) form.getCheckBox("CkBox_002").check();
    if (data.isDangerSelf || data.isDangerOthers)
      form.getCheckBox("CkBox_003").check();

    form.getTextField("Memo_001").setText(data.facts);

    form.getTextField("PetName").setText(data.petitionerName);
    form.getTextField("RelationshipResp").setText(data.petitionerRelationship);
    form.getTextField("PetitAddr1").setText(data.petitionerAddress);
    form.getTextField("PetitionerHomePhoneNo").setText(data.petitionerPhone);

    return await pdfDoc.save();
  }

  async function generateDmhPdf(data) {
    const existingPdfBytes = await fetch(FORM_URL_DMH).then((res) =>
      res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    form.getTextField("Name of Respondent").setText(data.respondentName);
    form.getTextField("County").setText(data.county);
    form.getTextField("DOB").setText(data.respondentDob);
    form.getTextField("Age").setText(data.respondentAge);
    form.getTextField("Sex").setText(data.respondentGender);

    if (data.examDate) {
      const parts = data.examDate.split("-"); // YYYY-MM-DD
      const formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
      form.getTextField("undefined").setText(formattedDate);
    }
    form.getTextField("undefined_2").setText(data.examTime);
    form.getTextField("undefined_3").setText(data.examLocation);

    if (data.isMi)
      form.getCheckBox("An individual with a mental illness").check();
    if (data.isMiDangerSelf) form.getCheckBox("Self or").check();
    if (data.isMiDangerOthers) form.getCheckBox("Others").check();

    if (data.isSa) form.getCheckBox("A Substance Abuser").check();
    if (data.isSaDangerSelf) form.getCheckBox("Self or_2").check();
    if (data.isSaDangerOthers) form.getCheckBox("Others_2").check();

    form
      .getTextField(
        "Clear description of findings findings for each criterion checked in Section I must be described",
      )
      .setText(data.facts);

    form.getTextField("Print Name of Examiner").setText(data.clinicianName);
    form.getTextField("Address of Facility").setText(data.clinicianFacility);
    form.getTextField("Address of Facility_2").setText(data.facilityAddress);
    form.getTextField("Telephone Number").setText(data.facilityPhone);

    return await pdfDoc.save();
  }

  async function generateBothPdfs() {
    showSpinner();
    try {
      const data = {
        petitionerName: document.getElementById("unified-petitioner-name")
          .value,
        petitionerPhone: document.getElementById("unified-petitioner-phone")
          .value,
        petitionerAddress: document.getElementById("unified-petitioner-address")
          .value,
        petitionerRelationship: document.getElementById(
          "unified-petitioner-relationship",
        ).value,
        clinicianName: document.getElementById("unified-petitioner-name").value,
        clinicianFacility: document.getElementById("unified-facility-name")
          .value,
        facilityAddress: document.getElementById("unified-facility-address")
          .value,
        facilityPhone: document.getElementById("unified-facility-phone").value,
        respondentName: document.getElementById("unified-respondent-name")
          .value,
        county: document.getElementById("unified-county").value,
        respondentDob: document.getElementById("unified-respondent-dob").value,
        respondentAge: document.getElementById("unified-respondent-age").value,
        respondentGender: document.getElementById("unified-respondent-gender")
          .value,
        respondentRace: document.getElementById("unified-respondent-race")
          .value,
        examDate: document.getElementById("unified-exam-date").value,
        examTime: document.getElementById("unified-exam-time").value,
        examLocation: document.getElementById("unified-exam-location").value,
        isMi: document.getElementById("unified-check-mi").checked,
        isMiDangerSelf: document.getElementById("unified-check-mi-danger-self")
          .checked,
        isMiDangerOthers: document.getElementById(
          "unified-check-mi-danger-others",
        ).checked,
        isSa: document.getElementById("unified-check-sa").checked,
        isSaDangerSelf: document.getElementById("unified-check-sa-danger-self")
          .checked,
        isSaDangerOthers: document.getElementById(
          "unified-check-sa-danger-others",
        ).checked,
        facts: document.getElementById("unified-facts").value,
        isLeoPresent: document.getElementById("unified-leo-present").checked,
        leoName: document.getElementById("unified-leo-name").value,
        leoAgency: document.getElementById("unified-leo-agency").value,
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

  document
    .getElementById("generate-aoc")
    .addEventListener("click", async () => {
      showSpinner();
      try {
        const data = {
          county: document.getElementById("aoc-county").value,
          respondentName: document.getElementById("aoc-respondent-name").value,
          respondentAge: document.getElementById("aoc-respondent-age").value,
          respondentRace: document.getElementById("aoc-respondent-race").value,
          respondentGender: document.getElementById("aoc-respondent-gender")
            .value,
          respondentDob: document.getElementById("aoc-respondent-dob").value,
          isMi: document.getElementById("aoc-check-mi").checked,
          isSa: document.getElementById("aoc-check-sa").checked,
          isDangerSelf: document.getElementById("aoc-check-danger-self")
            .checked,
          isDangerOthers: document.getElementById("aoc-check-danger-others")
            .checked,
          facts: document.getElementById("aoc-facts").value,
          petitionerName: document.getElementById("aoc-petitioner-name").value,
          petitionerRelationship: document.getElementById(
            "aoc-petitioner-relationship",
          ).value,
          petitionerAddress: document.getElementById("aoc-petitioner-address")
            .value,
          petitionerPhone: document.getElementById("aoc-petitioner-phone")
            .value,
        };
        const pdfBytes = await generateAocPdf(data);
        saveAs(
          new Blob([pdfBytes], { type: "application/pdf" }),
          "Completed-AOC-SP-300.pdf",
        );
      } catch (error) {
        console.error("Error generating AOC PDF:", error);
        alert(
          "Error generating PDF. Check the console and make sure the PDF files are in your GitHub repository.",
        );
      } finally {
        hideSpinner();
      }
    });

  document
    .getElementById("generate-dmh")
    .addEventListener("click", async () => {
      showSpinner();
      try {
        const data = {
          clinicianName: document.getElementById("dmh-clinician-name").value,
          clinicianFacility: document.getElementById("dmh-clinician-facility")
            .value,
          facilityAddress: document.getElementById("dmh-facility-address")
            .value,
          facilityPhone: document.getElementById("dmh-facility-phone").value,
          respondentName: document.getElementById("dmh-respondent-name").value,
          county: document.getElementById("dmh-county").value,
          respondentDob: document.getElementById("dmh-respondent-dob").value,
          respondentAge: document.getElementById("dmh-respondent-age").value,
          respondentGender: document.getElementById("dmh-respondent-gender")
            .value,
          examDate: document.getElementById("dmh-exam-date").value,
          examTime: document.getElementById("dmh-exam-time").value,
          examLocation: document.getElementById("dmh-exam-location").value,
          isMi: document.getElementById("dmh-check-mi").checked,
          isMiDangerSelf: document.getElementById("dmh-check-mi-danger-self")
            .checked,
          isMiDangerOthers: document.getElementById(
            "dmh-check-mi-danger-others",
          ).checked,
          isSa: document.getElementById("dmh-check-sa").checked,
          isSaDangerSelf: document.getElementById("dmh-check-sa-danger-self")
            .checked,
          isSaDangerOthers: document.getElementById(
            "dmh-check-sa-danger-others",
          ).checked,
          facts: document.getElementById("dmh-facts").value,
          isLeoPresent: document.getElementById("dmh-leo-present").checked,
          leoName: document.getElementById("dmh-leo-name").value,
          leoAgency: document.getElementById("dmh-leo-agency").value,
        };
        const pdfBytes = await generateDmhPdf(data);
        saveAs(
          new Blob([pdfBytes], { type: "application/pdf" }),
          "Completed-DMH-5-72-19.pdf",
        );
      } catch (error) {
        console.error("Error generating DMH PDF:", error);
        alert(
          "Error generating PDF. Check the console and make sure the PDF files are in your GitHub repository.",
        );
      } finally {
        hideSpinner();
      }
    });

  document
    .getElementById("generate-both")
    .addEventListener("click", generateBothPdfs);

  // LEO Details Toggle
  document
    .getElementById("unified-leo-present")
    .addEventListener("change", function () {
      document
        .getElementById("unified-leo-details")
        .classList.toggle("hidden", !this.checked);
    });
  document
    .getElementById("dmh-leo-present")
    .addEventListener("change", function () {
      document
        .getElementById("leo-details")
        .classList.toggle("hidden", !this.checked);
    });

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
