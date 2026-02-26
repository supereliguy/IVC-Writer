// Get PDF libraries
const { PDFDocument } = PDFLib;

const FORM_URL_AOC = "./AOC-SP-300.pdf";
const FORM_URL_DMH = "./DMH-5-72-19.pdf";

const aocPdfPromise = fetch(FORM_URL_AOC).then((res) => res.arrayBuffer());
const dmhPdfPromise = fetch(FORM_URL_DMH).then((res) => res.arrayBuffer());

document.addEventListener("DOMContentLoaded", () => {
  // --- Unsaved Changes State ---
  window.isFormDirty = false;

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
  const countyDropdowns = document.querySelectorAll(
    "#unified-county, #aoc-county, #dmh-county",
  );
  const fragment = document.createDocumentFragment();
  ncCounties.forEach((county) => {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    fragment.appendChild(option);
  });
  countyDropdowns.forEach((dropdown) =>
    dropdown.appendChild(fragment.cloneNode(true)),
  );

  // --- UI Interactivity ---
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");

    let borderColorClass = "border-blue-500";
    let textColorClass = "text-blue-700";

    if (type === "success") {
      borderColorClass = "border-green-500";
      textColorClass = "text-green-700";
    } else if (type === "error") {
      borderColorClass = "border-red-500";
      textColorClass = "text-red-700";
    }

    toast.className = `pointer-events-auto bg-white border-l-4 ${borderColorClass} ${textColorClass} p-4 rounded shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 flex items-center mb-2`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span class="font-medium">${message}</span>`;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      toast.addEventListener("transitionend", () => {
        toast.remove();
      });
    }, 3000);
  }

  function setDefaultDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    document
      .querySelectorAll(".default-date")
      .forEach((el) => (el.value = `${yyyy}-${mm}-${dd}`));
    document
      .querySelectorAll(".default-time")
      .forEach((el) => (el.value = `${hh}:${min}`));
  }

  document
    .querySelectorAll('input[name="unified-disposition"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("outpatient-fields")
          .classList.toggle("hidden", radio.value !== "outpatient"),
      );
    });
  document
    .querySelectorAll('input[name="aoc-disposition"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("aoc-outpatient-fields")
          .classList.toggle("hidden", radio.value !== "outpatient"),
      );
    });
  document
    .querySelectorAll('input[name="dmh-disposition"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("dmh-outpatient-fields")
          .classList.toggle("hidden", radio.value !== "outpatient"),
      );
    });

  document
    .querySelectorAll('input[name="unified-interpreter"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("interpreter-details")
          .classList.toggle("hidden", radio.value !== "yes"),
      );
    });
  document
    .querySelectorAll('input[name="aoc-interpreter"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("aoc-interpreter-details")
          .classList.toggle("hidden", radio.value !== "yes"),
      );
    });
  document
    .querySelectorAll('input[name="dmh-interpreter"]')
    .forEach((radio) => {
      radio.addEventListener("change", () =>
        document
          .getElementById("dmh-interpreter-details")
          .classList.toggle("hidden", radio.value !== "yes"),
      );
    });

  const tabButtons = document.querySelectorAll(".tab-button");
  const formSections = document.querySelectorAll(".form-section");
  const tabButtonsArray = Array.from(tabButtons);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => {
        btn.classList.remove("tab-active");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("tabindex", "-1");
      });
      formSections.forEach((sec) => sec.classList.add("hidden"));

      button.classList.add("tab-active");
      button.setAttribute("aria-selected", "true");
      button.setAttribute("tabindex", "0");
      document
        .getElementById("form-" + button.dataset.form)
        .classList.remove("hidden");
    });

    button.addEventListener("keydown", (e) => {
      const index = tabButtonsArray.indexOf(button);
      let newIndex = -1;

      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % tabButtonsArray.length;
      } else if (e.key === "ArrowLeft") {
        newIndex =
          (index - 1 + tabButtonsArray.length) % tabButtonsArray.length;
      }

      if (newIndex !== -1) {
        e.preventDefault();
        const newButton = tabButtonsArray[newIndex];
        newButton.focus();
        newButton.click(); // Automatic activation
      }
    });
  });

  // --- PDF Generation ---
  const showSpinner = () =>
    document.getElementById("loading-spinner").classList.remove("hidden");
  const hideSpinner = () =>
    document.getElementById("loading-spinner").classList.add("hidden");

  const formatDate = (dateStr) => {
    if (!dateStr) return { full: "", mm: "", dd: "", yyyy: "" };
    const [yyyy, mm, dd] = dateStr.split("-");
    return { full: `${mm}/${dd}/${yyyy}`, mm, dd, yyyy };
  };

  async function generateAocPdf(data) {
    const aocPdfCache = await aocPdfPromise;
    const pdfDoc = await PDFDocument.load(aocPdfCache);
    const form = pdfDoc.getForm();

    form.getTextField("FileNo").setText(data.fileNo);
    form.getTextField("County").setText(data.county);
    form.getTextField("RespondentName").setText(data.respondentName);
    form.getTextField("RespAddr1").setText(data.respondentStreet);
    form.getTextField("RespCity").setText(data.respondentCity);
    form.getTextField("RespState").setText(data.respondentState);
    form.getTextField("RespZip").setText(data.respondentZip);
    form.getTextField("RespSSN").setText(data.respondentSsn);
    form.getTextField("RespDOB").setText(data.respondentDob.full);
    form.getTextField("RespDLNo").setText(data.respondentDl);
    form.getTextField("RespDLState").setText(data.respondentDlState);
    form
      .getTextField("LastKnownLocationOfRespondent")
      .setText(data.respondentLastLocation);

    if (data.interpreter === "no")
      form.getCheckBox("NoInterpreterNotNeededCkBox").check();
    if (data.interpreter === "yes") {
      form.getCheckBox("YesInterpreterNeededCkBox").check();
      form
        .getTextField("YesInterpreterNeededExplanationField")
        .setText(data.interpreterExplanation);
    }

    if (data.isMi && (data.isMiDangerSelf || data.isMiDangerOthers))
      form.getCheckBox("CkBox_001").check();
    if (data.isMi && data.isMiId) form.getCheckBox("CkBox_002").check();
    if (data.isSa && (data.isSaDangerSelf || data.isSaDangerOthers))
      form.getCheckBox("CkBox_003").check();
    form.getTextField("Memo_001").setText(data.findings);

    form.getTextField("OtherPerName").setText(data.witnessName);
    form.getTextField("OthrPersonAddr1").setText(data.witnessStreet);
    form.getTextField("OthrPersonCity").setText(data.witnessCity);
    form.getTextField("OtherPersonState").setText(data.witnessState);
    form.getTextField("OtherPersonZip").setText(data.witnessZip);
    form.getTextField("OtherPerHomePhoneNo").setText(data.witnessHomePhone);
    form.getTextField("OtherPerBusPhoneNo").setText(data.witnessBusPhone);

    form.getTextField("Date1").setText(data.examDate.full);
    if (data.certification === "DepCSC")
      form.getCheckBox("CkBox_DepCSC").check();
    if (data.certification === "AsstCSC")
      form.getCheckBox("CkBox_AsstCSC").check();
    if (data.certification === "CSC") form.getCheckBox("CkBox_CSC").check();
    if (data.certification === "Mag") form.getCheckBox("CkBox_Mag").check();
    if (data.certification === "Notary")
      form.getCheckBox("Notary_Ckbx").check();
    form.getTextField("CountyCommission").setText(data.notaryCounty);
    form.getTextField("DateCommExpires").setText(data.notaryExpiration.full);

    form.getTextField("PetName").setText(data.petitionerName);
    form.getTextField("PetitAddr1").setText(data.petitionerStreet);
    form.getTextField("PetitCity").setText(data.petitionerCity);
    form.getTextField("PetitState").setText(data.petitionerState);
    form.getTextField("PetitZip").setText(data.petitionerZip);
    form.getTextField("RelationshipResp").setText(data.petitionerRelationship);
    form
      .getTextField("PetitionerHomePhoneNo")
      .setText(data.petitionerHomePhone);
    form.getTextField("PetitionerBusPhoneNo").setText(data.petitionerBusPhone);
    form.getTextField("DateWaiver").setText(data.waiverDate.full);

    return pdfDoc.save();
  }

  async function generateDmhPdf(data) {
    const dmhPdfCache = await dmhPdfPromise;
    const pdfDoc = await PDFDocument.load(dmhPdfCache);
    const form = pdfDoc.getForm();

    form.getTextField("County").setText(data.county);
    form.getTextField("Client Record").setText(data.clientRecord);
    form.getTextField("File").setText(data.fileNo);
    form.getTextField("Name of Respondent").setText(data.respondentName);
    form.getTextField("DOB").setText(data.respondentDob.full);
    form.getTextField("Age").setText(data.respondentAge);
    form.getTextField("Sex").setText(data.respondentSex);
    form.getTextField("Race").setText(data.respondentRace);
    form.getTextField("MS").setText(data.respondentMs);
    form
      .getTextField("Address Street or Box Number")
      .setText(data.respondentStreet);
    form.getTextField("City").setText(data.respondentCity);
    form.getTextField("State").setText(data.respondentState);
    form.getTextField("Zip").setText(data.respondentZip);
    form.getTextField("County_2").setText(data.county);
    form.getTextField("Phone").setText(data.respondentPhone);

    form
      .getTextField("Legally Responsible Person or Next of Kin Name")
      .setText(data.lrpName);
    form.getTextField("Relationship").setText(data.lrpRelationship);
    form.getTextField("Address Street or Box Number_2").setText(data.lrpStreet);
    form.getTextField("City_2").setText(data.lrpCity);
    form.getTextField("State_2").setText(data.lrpState);
    form.getTextField("Zip_2").setText(data.lrpZip);
    form.getTextField("Phone_2").setText(data.lrpPhone);

    form.getTextField("Petitioner Name").setText(data.petitionerName);
    form.getTextField("Relationship_2").setText(data.petitionerRelationship);
    form
      .getTextField("Address Street or Box Number_3")
      .setText(data.petitionerStreet);
    form.getTextField("City_3").setText(data.petitionerCity);
    form.getTextField("State_3").setText(data.petitionerState);
    form.getTextField("Zip_3").setText(data.petitionerZip);
    form.getTextField("Phone_3").setText(data.petitionerHomePhone);

    form.getTextField("was conducted on").setText(data.examDate.full);
    form.getTextField("at").setText(data.examTime);
    form.getTextField("OR").setText(data.examLocation);

    if (data.isMi)
      form.getCheckBox("An individual with a mental illness").check();
    if (data.isMiDangerSelf) form.getCheckBox("Self or").check();
    if (data.isMiDangerOthers) form.getCheckBox("Others").check();
    if (data.isMiId) form.getCheckBox("In addition to having a").check();
    if (data.isSa) form.getCheckBox("A Substance Abuser").check();
    if (data.isSaDangerSelf) form.getCheckBox("Self or_2").check();
    if (data.isSaDangerOthers) form.getCheckBox("Others_2").check();

    form
      .getTextField(
        "Clear description of findings findings for each criterion checked in Section I must be described",
      )
      .setText(data.findings);
    form.getTextField("ImpressionDiagnosis").setText(data.impression);
    form.getTextField("HR").setText(data.hr);
    form.getTextField("RR").setText(data.rr);
    form.getTextField("Temp").setText(data.temp);
    form.getTextField("undefined_5").setText(data.bp);

    form.getTextField("Knownreported allergies").setText(data.allergies);
    form
      .getTextField("Knownreported current medications please list")
      .setText(data.medications);

    if (data.flagChestPain)
      form.getCheckBox("Chest pain or shortness of breath").check();
    if (data.flagOverdose)
      form
        .getCheckBox(
          "Suspected overdose on substances or medications within the past 24 hours including acetaminophen",
        )
        .check();
    if (data.flagSeverePain)
      form
        .getCheckBox("Presence of severe pain eg abdominal pain head pain")
        .check();
    if (data.flagDisoriented)
      form
        .getCheckBox("Disoriented confused or unable to maintain balance")
        .check();
    if (data.flagHeadTrauma)
      form.getCheckBox("Head trauma or recent loss of consciousness").check();
    if (data.flagPhysicalTrauma)
      form.getCheckBox("Recent physical trauma or profuse bleeding").check();
    if (data.flagWeakness)
      form
        .getCheckBox(
          "New weakness numbness speech difficulties or visual changes",
        )
        .check();
    if (data.triggerAge) form.getCheckBox("Age  12 or  65 years old").check();
    if (data.triggerBp)
      form
        .getCheckBox("Systolic BP  160 or  100 andor diastolic  100 or  60")
        .check();
    if (data.triggerHr) form.getCheckBox("Heart Rate 110 or  55 bpm").check();
    if (data.triggerRr)
      form
        .getCheckBox("Respiratory Rate  20 or  12 breaths per minute")
        .check();
    if (data.triggerTemp)
      form.getCheckBox("Temperature  380 C 1004 F or  360 C 968 F").check();
    if (data.triggerDiabetes)
      form
        .getCheckBox(
          "Known diagnosis of diabetes and not taking prescribed medications",
        )
        .check();
    if (data.triggerSeizures)
      form
        .getCheckBox(
          "Recent seizure or history of seizures and not taking seizure medications",
        )
        .check();
    if (data.triggerAsthma)
      form
        .getCheckBox(
          "Known diagnosis of asthma or chronic obstructive pulmonary disease and not taking prescribed medications",
        )
        .check();
    if (data.triggerPregnancy)
      form.getCheckBox("Known or suspected pregnancy").check();

    if (data.disposition === "inpatient")
      form.getCheckBox("Inpatient Commitment for").check();
    if (data.disposition === "outpatient") {
      form
        .getCheckBox(
          "Outpatient Commitment respondent must meet ALL of the first four criteria outlined in Section I Outpatient",
        )
        .check();
      form
        .getTextField("Proposed Outpatient Treatment Center or Physician Name")
        .setText(data.outpatientFacilityName);
      form
        .getTextField("Address  Phone Number")
        .setText(data.outpatientFacilityContact);
    }
    if (data.disposition === "substance")
      form
        .getCheckBox(
          "Substance Abuse Commitment respondent must meet both criteria outlined in Section I Substance Abuse",
        )
        .check();
    if (data.disposition === "voluntary")
      form
        .getCheckBox(
          "Respondent or Legally Responsible Person Consented to Voluntary Treatment",
        )
        .check();
    if (data.disposition === "release")
      form
        .getCheckBox(
          "Release Respondent and Terminate Proceedings insufficient findings to indicate that respondent meets commitment criteria",
        )
        .check();

    const [facilityName, ...addressParts] = data.facilityInfo.split(",");
    form.getTextField("Print Name of Examiner").setText(data.examinerName);
    form.getTextField("Address of Facility").setText(facilityName || "");
    form
      .getTextField("City and State")
      .setText(
        addressParts.length ? addressParts.slice(0, -1).join(",").trim() : "",
      );
    form
      .getTextField("Telephone Number")
      .setText(
        addressParts.length ? addressParts[addressParts.length - 1].trim() : "",
      );
    form.getTextField("Date").setText(data.examDate.full);

    return pdfDoc.save();
  }

  const FORM_SCHEMA = {
    county: { id: "county", type: "value" },
    clientRecord: { id: "client-record", type: "value" },
    fileNo: { id: "file-no", type: "value" },
    respondentName: { id: "respondent-name", type: "value" },
    respondentDob: {
      id: "respondent-dob",
      type: "value",
      transform: "formatDate",
    },
    respondentAge: { id: "respondent-age", type: "value" },
    respondentSex: { id: "respondent-sex", type: "value" },
    respondentRace: { id: "respondent-race", type: "value" },
    respondentMs: { id: "respondent-ms", type: "value" },
    respondentStreet: { id: "respondent-street", type: "value" },
    respondentCity: { id: "respondent-city", type: "value" },
    respondentState: { id: "respondent-state", type: "value" },
    respondentZip: { id: "respondent-zip", type: "value" },
    respondentPhone: { id: "respondent-phone", type: "value" },
    respondentSsn: { id: "respondent-ssn", type: "value" },
    respondentDl: { id: "respondent-dl", type: "value" },
    respondentDlState: { id: "respondent-dl-state", type: "value" },
    respondentLastLocation: { id: "respondent-last-location", type: "value" },
    lrpName: { id: "lrp-name", type: "value" },
    lrpRelationship: { id: "lrp-relationship", type: "value" },
    lrpStreet: { id: "lrp-street", type: "value" },
    lrpCity: { id: "lrp-city", type: "value" },
    lrpState: { id: "lrp-state", type: "value" },
    lrpZip: { id: "lrp-zip", type: "value" },
    lrpPhone: { id: "lrp-phone", type: "value" },
    petitionerName: { id: "petitioner-name", type: "value" },
    petitionerRelationship: { id: "petitioner-relationship", type: "value" },
    petitionerStreet: { id: "petitioner-street", type: "value" },
    petitionerCity: { id: "petitioner-city", type: "value" },
    petitionerState: { id: "petitioner-state", type: "value" },
    petitionerZip: { id: "petitioner-zip", type: "value" },
    petitionerHomePhone: { id: "petitioner-home-phone", type: "value" },
    petitionerBusPhone: { id: "petitioner-bus-phone", type: "value" },
    witnessName: { id: "witness-name", type: "value" },
    witnessStreet: { id: "witness-street", type: "value" },
    witnessCity: { id: "witness-city", type: "value" },
    witnessState: { id: "witness-state", type: "value" },
    witnessZip: { id: "witness-zip", type: "value" },
    witnessHomePhone: { id: "witness-home-phone", type: "value" },
    witnessBusPhone: { id: "witness-bus-phone", type: "value" },
    interpreter: { id: "interpreter", type: "radio" },
    interpreterExplanation: { id: "interpreter-explanation", type: "value" },
    examDate: { id: "exam-date", type: "value", transform: "formatDate" },
    examTime: { id: "exam-time", type: "value" },
    examLocation: { id: "exam-location", type: "value" },
    findings: { id: "findings", type: "value" },
    impression: { id: "impression", type: "value" },
    isMi: { id: "check-mi", type: "checked" },
    isMiDangerSelf: { id: "check-mi-danger-self", type: "checked" },
    isMiDangerOthers: { id: "check-mi-danger-others", type: "checked" },
    isMiId: { id: "check-mi-id", type: "checked" },
    isSa: { id: "check-sa", type: "checked" },
    isSaDangerSelf: { id: "check-sa-danger-self", type: "checked" },
    isSaDangerOthers: { id: "check-sa-danger-others", type: "checked" },
    hr: { id: "hr", type: "value" },
    rr: { id: "rr", type: "value" },
    temp: { id: "temp", type: "value" },
    bp: { id: "bp", type: "value" },
    medicalProblems: { id: "medical-problems", type: "value" },
    allergies: { id: "allergies", type: "value" },
    medications: { id: "medications", type: "value" },
    flagChestPain: { id: "flag-chest-pain", type: "checked" },
    flagOverdose: { id: "flag-overdose", type: "checked" },
    flagSeverePain: { id: "flag-severe-pain", type: "checked" },
    flagDisoriented: { id: "flag-disoriented", type: "checked" },
    flagHeadTrauma: { id: "flag-head-trauma", type: "checked" },
    flagPhysicalTrauma: { id: "flag-physical-trauma", type: "checked" },
    flagWeakness: { id: "flag-weakness", type: "checked" },
    triggerAge: { id: "trigger-age", type: "checked" },
    triggerBp: { id: "trigger-bp", type: "checked" },
    triggerHr: { id: "trigger-hr", type: "checked" },
    triggerRr: { id: "trigger-rr", type: "checked" },
    triggerTemp: { id: "trigger-temp", type: "checked" },
    triggerDiabetes: { id: "trigger-diabetes", type: "checked" },
    triggerSeizures: { id: "trigger-seizures", type: "checked" },
    triggerAsthma: { id: "trigger-asthma", type: "checked" },
    triggerPregnancy: { id: "trigger-pregnancy", type: "checked" },
    disposition: { id: "disposition", type: "radio" },
    outpatientFacilityName: { id: "outpatient-facility-name", type: "value" },
    outpatientFacilityContact: {
      id: "outpatient-facility-contact",
      type: "value",
    },
    examinerName: { id: "examiner-name", type: "value" },
    facilityInfo: { id: "facility-info", type: "value" },
    notaryCounty: { id: "notary-county", type: "value" },
    notaryExpiration: {
      id: "notary-expiration",
      type: "value",
      transform: "formatDate",
    },
    certification: { id: "certification", type: "radio" },
    waiverDate: { id: "waiver-date", type: "value", transform: "formatDate" },
  };

  const formCache = { unified: {}, aoc: {}, dmh: {} };

  function initFormCache() {
    ["unified", "aoc", "dmh"].forEach((prefix) => {
      for (const [key, config] of Object.entries(FORM_SCHEMA)) {
        if (config.type === "radio") {
          formCache[prefix][key] = document.querySelectorAll(
            `input[name="${prefix}-${config.id}"]`,
          );
        } else {
          formCache[prefix][key] = document.getElementById(
            `${prefix}-${config.id}`,
          );
        }
      }
    });
  }

  initFormCache();

  function collectFormData(prefix) {
    const data = {};
    const cache = formCache[prefix];

    for (const [key, config] of Object.entries(FORM_SCHEMA)) {
      const el = cache[key];
      if (!el) {
        data[key] = null;
        continue;
      }

      let val = null;
      if (config.type === "checked") {
        val = el.checked;
      } else if (config.type === "radio") {
        for (const radio of el) {
          if (radio.checked) {
            val = radio.value;
            break;
          }
        }
      } else {
        val = el.value;
      }

      if (config.transform === "formatDate") {
        val = formatDate(val);
      }
      data[key] = val;
    }
    return data;
  }

  document
    .getElementById("generate-both")
    .addEventListener("click", async () => {
      showSpinner();
      try {
        const data = collectFormData("unified");
        const [aocPdfBytes, dmhPdfBytes] = await Promise.all([
          generateAocPdf(data),
          generateDmhPdf(data),
        ]);
        saveAs(
          new Blob([aocPdfBytes], { type: "application/pdf" }),
          "Completed-AOC-SP-300.pdf",
        );
        saveAs(
          new Blob([dmhPdfBytes], { type: "application/pdf" }),
          "Completed-DMH-5-72-19.pdf",
        );
        window.isFormDirty = false;
        showToast("Both PDFs Generated Successfully!", "success");
      } catch (error) {
        console.error("Error generating PDFs:", error);
        showToast("Error generating PDFs. Check console for details.", "error");
      } finally {
        hideSpinner();
      }
    });

  document
    .getElementById("generate-aoc")
    .addEventListener("click", async () => {
      showSpinner();
      try {
        const data = collectFormData("aoc");
        const aocPdfBytes = await generateAocPdf(data);
        saveAs(
          new Blob([aocPdfBytes], { type: "application/pdf" }),
          "Completed-AOC-SP-300.pdf",
        );
        window.isFormDirty = false;
        showToast("AOC PDF Generated Successfully!", "success");
      } catch (error) {
        console.error("Error generating PDF:", error);
        showToast("Error generating PDF. Check console for details.", "error");
      } finally {
        hideSpinner();
      }
    });

  document
    .getElementById("generate-dmh")
    .addEventListener("click", async () => {
      showSpinner();
      try {
        const data = collectFormData("dmh");
        const dmhPdfBytes = await generateDmhPdf(data);
        saveAs(
          new Blob([dmhPdfBytes], { type: "application/pdf" }),
          "Completed-DMH-5-72-19.pdf",
        );
        window.isFormDirty = false;
        showToast("DMH PDF Generated Successfully!", "success");
      } catch (error) {
        console.error("Error generating PDF:", error);
        showToast("Error generating PDF. Check console for details.", "error");
      } finally {
        hideSpinner();
      }
    });

  // --- Local Storage & Initialization ---
  const localSaveInputs = document.querySelectorAll(".local-save");
  const rememberCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][id$="-remember-me"]',
  );

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Radio groups to persist (by name attribute)
  const savedRadioGroupNames = [
    "unified-certification",
    "aoc-certification",
    "dmh-certification",
  ];

  const loadSavedData = () => {
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    if (isRemembered) {
      rememberCheckboxes.forEach((cb) => (cb.checked = true));
      localSaveInputs.forEach((input) => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) input.value = savedValue;
      });
      // Restore saved radio selections
      savedRadioGroupNames.forEach((name) => {
        const savedValue = localStorage.getItem(`radio_${name}`);
        if (savedValue) {
          const radio = document.querySelector(
            `input[name="${name}"][value="${savedValue}"]`,
          );
          if (radio) radio.checked = true;
        }
      });
    }
  };

  rememberCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;

      // Sync all checkboxes
      rememberCheckboxes.forEach((cb) => (cb.checked = isChecked));

      localStorage.setItem("rememberMe", isChecked);

      if (isChecked) {
        localSaveInputs.forEach((input) =>
          localStorage.setItem(input.id, input.value),
        );
        savedRadioGroupNames.forEach((name) => {
          const checked = document.querySelector(
            `input[name="${name}"]:checked`,
          );
          if (checked) localStorage.setItem(`radio_${name}`, checked.value);
        });
        showToast(
          "Preferences saved. Your information will be remembered.",
          "success",
        );
      } else {
        localSaveInputs.forEach((input) => localStorage.removeItem(input.id));
        savedRadioGroupNames.forEach((name) =>
          localStorage.removeItem(`radio_${name}`),
        );
        showToast(
          "Preferences cleared. Your information will not be saved.",
          "info",
        );
      }
    });
  });

  localSaveInputs.forEach((input) => {
    input.addEventListener(
      "input",
      debounce(() => {
        if (localStorage.getItem("rememberMe") === "true") {
          localStorage.setItem(input.id, input.value);
        }
      }, 300),
    );
  });

  // Save certification radio on change
  savedRadioGroupNames.forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
      radio.addEventListener("change", () => {
        if (localStorage.getItem("rememberMe") === "true") {
          localStorage.setItem(`radio_${name}`, radio.value);
        }
      });
    });
  });

  // --- Phone Number Formatting ---
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener("input", (e) => {
      const formattedPhoneNumber = formatPhoneNumber(e.target.value);
      e.target.value = formattedPhoneNumber;
    });
  });

  // --- SSN Auto-Formatting ---
  const formatSsn = (value) => {
    if (!value) return value;
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length < 4) return digits;
    if (digits.length < 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  document
    .querySelectorAll(
      "#unified-respondent-ssn, #aoc-respondent-ssn, #dmh-respondent-ssn",
    )
    .forEach((input) => {
      input.addEventListener("input", (e) => {
        e.target.value = formatSsn(e.target.value);
      });
    });

  // --- Auto-Calculate Age from DOB ---
  function calculateAge(dobStr) {
    if (!dobStr) return "";
    const dob = new Date(dobStr + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : "";
  }

  ["unified", "aoc", "dmh"].forEach((prefix) => {
    const dobInput = document.getElementById(`${prefix}-respondent-dob`);
    const ageInput = document.getElementById(`${prefix}-respondent-age`);
    if (dobInput && ageInput) {
      dobInput.addEventListener("change", () => {
        const age = calculateAge(dobInput.value);
        ageInput.value = age;
        ageInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  });

  // --- Auto-Check Vital Sign Triggers ---
  function setupVitalSignTriggers() {
    ["unified", "aoc", "dmh"].forEach((prefix) => {
      const hrInput = document.getElementById(`${prefix}-hr`);
      const rrInput = document.getElementById(`${prefix}-rr`);
      const tempInput = document.getElementById(`${prefix}-temp`);
      const bpInput = document.getElementById(`${prefix}-bp`);
      const ageInput = document.getElementById(`${prefix}-respondent-age`);

      const triggerHr = document.getElementById(`${prefix}-trigger-hr`);
      const triggerRr = document.getElementById(`${prefix}-trigger-rr`);
      const triggerTemp = document.getElementById(`${prefix}-trigger-temp`);
      const triggerBp = document.getElementById(`${prefix}-trigger-bp`);
      const triggerAge = document.getElementById(`${prefix}-trigger-age`);

      if (hrInput && triggerHr) {
        hrInput.addEventListener("input", () => {
          const hr = parseFloat(hrInput.value);
          if (!isNaN(hr)) {
            triggerHr.checked = hr >= 110 || hr <= 55;
          }
        });
      }

      if (rrInput && triggerRr) {
        rrInput.addEventListener("input", () => {
          const rr = parseFloat(rrInput.value);
          if (!isNaN(rr)) {
            triggerRr.checked = rr >= 20 || rr <= 12;
          }
        });
      }

      if (tempInput && triggerTemp) {
        tempInput.addEventListener("input", () => {
          const temp = parseFloat(tempInput.value);
          if (!isNaN(temp)) {
            // Support both Fahrenheit and Celsius
            if (temp > 50) {
              // Fahrenheit
              triggerTemp.checked = temp >= 100.4 || temp <= 96.8;
            } else {
              // Celsius
              triggerTemp.checked = temp >= 38.0 || temp <= 36.0;
            }
          }
        });
      }

      if (bpInput && triggerBp) {
        bpInput.addEventListener("input", () => {
          const match = bpInput.value.match(/(\d+)\s*\/\s*(\d+)/);
          if (match) {
            const systolic = parseInt(match[1], 10);
            const diastolic = parseInt(match[2], 10);
            triggerBp.checked =
              systolic >= 160 ||
              systolic <= 100 ||
              diastolic >= 100 ||
              diastolic <= 60;
          }
        });
      }

      if (ageInput && triggerAge) {
        ageInput.addEventListener("input", () => {
          const age = parseInt(ageInput.value, 10);
          if (!isNaN(age)) {
            triggerAge.checked = age < 12 || age > 65;
          }
        });
      }
    });
  }

  setupVitalSignTriggers();

  // --- Address Copying ---
  function setupAddressCopying() {
    const copyButtons = document.querySelectorAll(
      'button[data-action="copy-address"]',
    );
    copyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const sourcePrefix = button.dataset.source;
        const targetPrefix = button.dataset.target;
        const fields = ["street", "city", "state", "zip"];

        let copiedCount = 0;
        fields.forEach((field) => {
          const sourceId = `${sourcePrefix}-${field}`;
          const targetId = `${targetPrefix}-${field}`;
          const sourceEl = document.getElementById(sourceId);
          const targetEl = document.getElementById(targetId);

          if (sourceEl && targetEl) {
            targetEl.value = sourceEl.value;
            // Trigger input event to ensure state is updated (if any listeners rely on it)
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
            copiedCount++;
          }
        });

        if (copiedCount > 0) {
          showToast("Address copied from Respondent", "success");
        } else {
          showToast("Could not copy address fields", "error");
        }
      });
    });
  }

  setupAddressCopying();
  setDefaultDateTime();
  loadSavedData();

  // --- Default State Fields to NC (after loadSavedData so localStorage takes priority) ---
  document
    .querySelectorAll(
      '[id$="-respondent-state"], [id$="-respondent-dl-state"], [id$="-lrp-state"], [id$="-petitioner-state"], [id$="-witness-state"]',
    )
    .forEach((input) => {
      if (!input.value) input.value = "NC";
    });

  // --- Auto-Expand Textareas ---
  const autoResizeTextarea = (textarea) => {
    if (textarea.offsetParent === null) return; // Skip hidden elements
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    textarea.style.overflowY = "hidden";
    textarea.style.resize = "none";
    textarea.addEventListener("input", () => autoResizeTextarea(textarea));
  });

  // Resize on window resize
  window.addEventListener("resize", () => {
    textareas.forEach(autoResizeTextarea);
  });

  // Trigger resize on tab switch
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const formId = "form-" + button.dataset.form;
      setTimeout(() => {
        const container = document.getElementById(formId);
        if (container) {
          container.querySelectorAll("textarea").forEach(autoResizeTextarea);
        }
      }, 0);
    });
  });

  // Initial resize for visible textareas
  textareas.forEach(autoResizeTextarea);

  // --- Unsaved Changes Listeners ---
  document.addEventListener("input", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
      window.isFormDirty = true;
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (window.isFormDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
});
