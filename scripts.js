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
    "#unified-county, #aoc-county, #dmh-county, #ed-county",
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

    let borderColor = "#6366f1";
    let iconSvg =
      '<svg class="w-5 h-5 mr-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

    if (type === "success") {
      borderColor = "#10b981";
      iconSvg =
        '<svg class="w-5 h-5 mr-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    } else if (type === "error") {
      borderColor = "#ef4444";
      iconSvg =
        '<svg class="w-5 h-5 mr-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }

    toast.className = `pointer-events-auto p-4 transform transition-all duration-300 translate-y-0 opacity-100 flex items-center mb-2`;
    toast.style.borderLeftColor = borderColor;
    toast.style.color = borderColor;
    toast.setAttribute("role", "status");
    toast.innerHTML = `${iconSvg}<span class="font-medium" style="color: var(--text-primary)">${message}</span>`;

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

  // --- Narrative Snippet Builder ---
  function setupNarrativeSnippets() {
    document.querySelectorAll(".narrative-snippet").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.closest(".narrative-snippet-group").dataset.target;
        const textarea = document.getElementById(targetId);
        if (!textarea) return;

        const snippet = btn.dataset.snippet;

        // Toggle: if snippet already in text, remove it; otherwise append
        if (textarea.value.includes(snippet)) {
          textarea.value = textarea.value.replace(snippet, "");
          btn.classList.remove("ring-2", "ring-offset-1");
          btn.style.opacity = "1";
        } else {
          textarea.value += snippet;
          btn.classList.add("ring-2", "ring-offset-1");
          btn.style.opacity = "0.7";
        }

        // Auto-resize textarea
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));

        // Auto-check commitment criteria based on selected snippets (ED mode)
        autoCheckCriteriaFromNarrative(targetId);
      });
    });

    // Clear narrative button
    document.querySelectorAll('[id$="-clear-narrative"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const prefix = btn.id.replace("-clear-narrative", "");
        const textarea = document.getElementById(`${prefix}-findings`);
        if (textarea) {
          textarea.value = "";
          textarea.style.height = "auto";
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
        // Reset all snippet button states in this tab's section
        const section = btn.closest(".form-section");
        if (section) {
          section.querySelectorAll(".narrative-snippet").forEach((s) => {
            s.classList.remove("ring-2", "ring-offset-1");
            s.style.opacity = "1";
          });
        }
      });
    });
  }

  function autoCheckCriteriaFromNarrative(targetId) {
    const prefix = targetId.replace("-findings", "");
    const textarea = document.getElementById(targetId);
    if (!textarea) return;
    const text = textarea.value.toLowerCase();

    const miCheckbox = document.getElementById(`${prefix}-check-mi`);
    const miSelf = document.getElementById(`${prefix}-check-mi-danger-self`);
    const miOthers = document.getElementById(
      `${prefix}-check-mi-danger-others`,
    );
    const saCheckbox = document.getElementById(`${prefix}-check-sa`);
    const saSelf = document.getElementById(`${prefix}-check-sa-danger-self`);
    const saOthers = document.getElementById(
      `${prefix}-check-sa-danger-others`,
    );

    if (miCheckbox) {
      miCheckbox.checked =
        /mental illness|depression|bipolar|schizophreni|schizoaffective|ptsd|anxiety|psycho|psychiatric/.test(
          text,
        );
    }
    if (miSelf) {
      miSelf.checked =
        /suicid|self-harm|harm to the patient|unable to care for self|cannot contract for safety|overdose/.test(
          text,
        );
    }
    if (miOthers) {
      miOthers.checked =
        /homicid|harm to others|aggressive|threatening|destruction of property|risk of serious harm to others/.test(
          text,
        );
    }
    if (saCheckbox) {
      saCheckbox.checked =
        /substance abuse|active use of|polysubstance|dual diagnosis/.test(text);
    }
    if (saSelf) {
      saSelf.checked =
        saCheckbox &&
        saCheckbox.checked &&
        /suicid|harm to the patient|overdose|unable to care for self/.test(
          text,
        );
    }
    if (saOthers) {
      saOthers.checked =
        saCheckbox &&
        saCheckbox.checked &&
        /homicid|harm to others|aggressive|destruction of property/.test(text);
    }
  }

  setupNarrativeSnippets();

  // --- Narrative Panel Toggle ---
  document.querySelectorAll(".narrative-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      if (panel) {
        const isHidden = panel.classList.toggle("hidden");
        btn.textContent = isHidden
          ? "Show Narrative Builder (click-to-build)"
          : "Hide Narrative Builder";
      }
    });
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

  const formCache = { unified: {}, aoc: {}, dmh: {}, ed: {} };

  function initFormCache() {
    ["unified", "aoc", "dmh", "ed"].forEach((prefix) => {
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

  // Generate button handlers are set up later with validation

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
    "ed-certification",
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
    const eventType = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(
      eventType,
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

  ["unified", "aoc", "dmh", "ed"].forEach((prefix) => {
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

  // --- ED Quick Patient Banner ---
  (function setupEdPatientBanner() {
    const banner = document.getElementById("ed-patient-banner");
    const bannerName = document.getElementById("ed-patient-banner-name");
    const bannerDob = document.getElementById("ed-patient-banner-dob");
    const bannerAge = document.getElementById("ed-patient-banner-age");
    const bannerSex = document.getElementById("ed-patient-banner-sex");
    if (!banner) return;

    const nameInput = document.getElementById("ed-respondent-name");
    const dobInput = document.getElementById("ed-respondent-dob");
    const ageInput = document.getElementById("ed-respondent-age");
    const sexInput = document.getElementById("ed-respondent-sex");

    function updateBanner() {
      const name = nameInput ? nameInput.value.trim() : "";
      const dob = dobInput ? dobInput.value : "";
      const age = ageInput ? ageInput.value.trim() : "";
      const sex = sexInput ? sexInput.value : "";

      const hasAny = name || dob || age || sex;
      banner.classList.toggle("hidden", !hasAny);

      bannerName.textContent = name || "—";
      bannerDob.textContent = dob ? new Date(dob + "T00:00:00").toLocaleDateString() : "—";
      bannerAge.textContent = age || "—";
      bannerSex.textContent = sex || "—";
    }

    [nameInput, dobInput, ageInput, sexInput].forEach((el) => {
      if (el) {
        el.addEventListener("input", updateBanner);
        el.addEventListener("change", updateBanner);
      }
    });

    // Update on New Patient clear
    const observer = new MutationObserver(updateBanner);
    if (nameInput) observer.observe(nameInput, { attributes: true, attributeFilter: ["value"] });

    // Also listen for form resets
    const edForm = document.getElementById("form-ed");
    if (edForm) edForm.addEventListener("reset", () => setTimeout(updateBanner, 0));
  })();

  // --- Auto-Check Vital Sign Triggers ---
  function setupVitalSignTriggers() {
    ["unified", "aoc", "dmh", "ed"].forEach((prefix) => {
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
          // Support formats: 120/80, 120 80, 120-80
          const match = bpInput.value.match(/(\d+)\s*[\/\-\s]\s*(\d+)/);
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
        // Normalize BP format on blur
        bpInput.addEventListener("blur", () => {
          const match = bpInput.value.match(/(\d+)\s*[\/\-\s]\s*(\d+)/);
          if (match) {
            bpInput.value = `${match[1]}/${match[2]}`;
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

  // --- Fill Unknown for Respondent Fields ---
  function setupFillUnknown() {
    const fillButtons = document.querySelectorAll(
      'button[data-action="fill-unknown"]',
    );
    fillButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const prefix = button.dataset.prefix;
        // Text/tel fields to fill with "Unknown" (skip name and dob)
        const textFields = [
          "respondent-age",
          "respondent-street",
          "respondent-city",
          "respondent-state",
          "respondent-zip",
          "respondent-phone",
          "respondent-ssn",
          "respondent-dl",
          "respondent-dl-state",
          "respondent-last-location",
        ];
        // Select fields to set to "Unknown"
        const selectFields = [
          "respondent-sex",
          "respondent-race",
          "respondent-ms",
        ];

        let filledCount = 0;
        textFields.forEach((field) => {
          const el = document.getElementById(`${prefix}-${field}`);
          if (el && !el.value) {
            el.value = "Unknown";
            el.dispatchEvent(new Event("input", { bubbles: true }));
            filledCount++;
          }
        });
        selectFields.forEach((field) => {
          const el = document.getElementById(`${prefix}-${field}`);
          if (el && !el.value) {
            el.value = "Unknown";
            el.dispatchEvent(new Event("change", { bubbles: true }));
            filledCount++;
          }
        });

        if (filledCount > 0) {
          showToast(
            `Filled ${filledCount} empty field${filledCount > 1 ? "s" : ""} with "Unknown"`,
            "success",
          );
          window.isFormDirty = true;
        } else {
          showToast("All fields already have values", "info");
        }
      });
    });
  }

  setupFillUnknown();
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

  // --- Populate DL State Dropdowns ---
  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
  ];
  const dlStateDropdowns = document.querySelectorAll(
    '[id$="-respondent-dl-state"]',
  );
  const stateFragment = document.createDocumentFragment();
  usStates.forEach((st) => {
    const option = document.createElement("option");
    option.value = st;
    option.textContent = st;
    stateFragment.appendChild(option);
  });
  dlStateDropdowns.forEach((dropdown) =>
    dropdown.appendChild(stateFragment.cloneNode(true)),
  );

  // --- New Patient (Clear Form) ---
  document.querySelectorAll(".new-patient-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const formId = `form-${btn.dataset.form}`;
      const section = document.getElementById(formId);
      if (!section) return;

      // Collect IDs of remembered fields to preserve
      const rememberedIds = new Set();
      if (localStorage.getItem("rememberMe") === "true") {
        section.querySelectorAll(".local-save").forEach((el) => {
          rememberedIds.add(el.id);
        });
      }

      // Clear text/tel/date/time inputs
      section
        .querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], input[type="time"]')
        .forEach((input) => {
          if (!rememberedIds.has(input.id)) input.value = "";
        });

      // Clear textareas
      section.querySelectorAll("textarea").forEach((textarea) => {
        if (!rememberedIds.has(textarea.id)) {
          textarea.value = "";
          textarea.style.height = "auto";
        }
      });

      // Reset selects (except remembered ones)
      section.querySelectorAll("select").forEach((select) => {
        if (!rememberedIds.has(select.id)) select.selectedIndex = 0;
      });

      // Uncheck checkboxes (except remember-me)
      section
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => {
          if (!cb.id.endsWith("-remember-me")) cb.checked = false;
        });

      // Reset radio buttons (except remembered certification)
      const rememberedRadios = new Set(savedRadioGroupNames);
      section.querySelectorAll('input[type="radio"]').forEach((radio) => {
        if (localStorage.getItem("rememberMe") === "true" && rememberedRadios.has(radio.name)) return;
        radio.checked = false;
      });

      // Reset snippet button states
      section.querySelectorAll(".narrative-snippet").forEach((s) => {
        s.classList.remove("ring-2", "ring-offset-1");
        s.style.opacity = "1";
      });

      // Re-apply defaults
      setDefaultDateTime();
      section
        .querySelectorAll(
          '[id$="-respondent-state"], [id$="-respondent-dl-state"], [id$="-lrp-state"], [id$="-petitioner-state"], [id$="-witness-state"]',
        )
        .forEach((input) => {
          if (!rememberedIds.has(input.id) && !input.value) input.value = "NC";
        });

      window.isFormDirty = false;
      showToast("Form cleared for new patient", "success");

      // Update ED patient banner after clearing
      if (btn.dataset.form === "ed") {
        const nameEl = document.getElementById("ed-respondent-name");
        if (nameEl) nameEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  });

  // --- Keyboard Shortcuts ---
  document.addEventListener("keydown", (e) => {
    // Ctrl+Enter or Cmd+Enter: Generate PDFs for the active tab
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      const activeTab = document.querySelector(".tab-button.tab-active");
      if (!activeTab) return;
      const form = activeTab.dataset.form;
      const buttonMap = {
        unified: "generate-both",
        aoc: "generate-aoc",
        dmh: "generate-dmh",
        ed: "generate-ed",
      };
      const btn = document.getElementById(buttonMap[form]);
      if (btn) btn.click();
    }
  });

  // --- Form Validation Before Generation ---
  function validateFormData(data, formType) {
    const warnings = [];

    if (!data.respondentName) warnings.push("Respondent name is empty");
    if (!data.respondentDob || !data.respondentDob.full)
      warnings.push("Respondent DOB is empty");
    if (!data.findings) warnings.push("Findings/narrative is empty");
    if (!data.disposition) warnings.push("Disposition is not selected");
    if (!data.county) warnings.push("County is not selected");

    if (formType !== "ed") {
      if (!data.petitionerName)
        warnings.push("Petitioner name is empty");
    }

    return warnings;
  }

  // --- Generate Button Handlers (with validation) ---
  document.getElementById("generate-both").addEventListener("click", async () => {
    showSpinner();
    try {
      const data = collectFormData("unified");
      const warnings = validateFormData(data, "unified");
      if (warnings.length > 0) {
        hideSpinner();
        const proceed = confirm(
          `Warning: The following fields are empty:\n\n• ${warnings.join("\n• ")}\n\nGenerate PDFs anyway?`,
        );
        if (!proceed) return;
        showSpinner();
      }
      const [aocPdfBytes, dmhPdfBytes] = await Promise.all([
        generateAocPdf(data),
        generateDmhPdf(data),
      ]);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");
      window.isFormDirty = false;
      showToast("Both PDFs Generated Successfully!", "success");
    } catch (error) {
      console.error("Error generating PDFs:", error);
      showToast("Error generating PDFs. Check console for details.", "error");
    } finally {
      hideSpinner();
    }
  });

  document.getElementById("generate-aoc").addEventListener("click", async () => {
    showSpinner();
    try {
      const data = collectFormData("aoc");
      const warnings = validateFormData(data, "aoc");
      if (warnings.length > 0) {
        hideSpinner();
        const proceed = confirm(
          `Warning: The following fields are empty:\n\n• ${warnings.join("\n• ")}\n\nGenerate PDF anyway?`,
        );
        if (!proceed) return;
        showSpinner();
      }
      const aocPdfBytes = await generateAocPdf(data);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
      window.isFormDirty = false;
      showToast("AOC PDF Generated Successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF. Check console for details.", "error");
    } finally {
      hideSpinner();
    }
  });

  document.getElementById("generate-dmh").addEventListener("click", async () => {
    showSpinner();
    try {
      const data = collectFormData("dmh");
      const warnings = validateFormData(data, "dmh");
      if (warnings.length > 0) {
        hideSpinner();
        const proceed = confirm(
          `Warning: The following fields are empty:\n\n• ${warnings.join("\n• ")}\n\nGenerate PDF anyway?`,
        );
        if (!proceed) return;
        showSpinner();
      }
      const dmhPdfBytes = await generateDmhPdf(data);
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");
      window.isFormDirty = false;
      showToast("DMH PDF Generated Successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF. Check console for details.", "error");
    } finally {
      hideSpinner();
    }
  });

  document.getElementById("generate-ed").addEventListener("click", async () => {
    showSpinner();
    try {
      const rawData = collectFormData("ed");
      // Compose facilityInfo from separate ED facility fields
      const fName = (document.getElementById("ed-facility-name") || {}).value || "";
      const fAddr = (document.getElementById("ed-facility-address") || {}).value || "";
      const fCity = (document.getElementById("ed-facility-city") || {}).value || "";
      const fState = (document.getElementById("ed-facility-state") || {}).value || "";
      const fZip = (document.getElementById("ed-facility-zip") || {}).value || "";
      const fPhone = (document.getElementById("ed-facility-phone") || {}).value || "";
      const cityStateZip = [fCity, fState].filter(Boolean).join(" ") + (fZip ? " " + fZip : "");
      const facilityParts = [fName, fAddr, cityStateZip, fPhone].filter(Boolean);
      rawData.facilityInfo = facilityParts.join(", ");
      const data = Object.assign(
        {
          clientRecord: "", fileNo: "", respondentMs: "", respondentStreet: "",
          respondentCity: "", respondentState: "NC", respondentZip: "",
          respondentPhone: "", respondentSsn: "", respondentDl: "",
          respondentDlState: "", respondentLastLocation: "",
          lrpName: "", lrpRelationship: "", lrpStreet: "", lrpCity: "",
          lrpState: "", lrpZip: "", lrpPhone: "",
          petitionerRelationship: "", petitionerStreet: "", petitionerCity: "",
          petitionerState: "NC", petitionerZip: "", petitionerHomePhone: "",
          petitionerBusPhone: "", witnessName: "", witnessStreet: "",
          witnessCity: "", witnessState: "", witnessZip: "",
          witnessHomePhone: "", witnessBusPhone: "",
          interpreter: "no", interpreterExplanation: "", medicalProblems: "",
          outpatientFacilityName: "", outpatientFacilityContact: "",
          waiverDate: formatDate(""),
        },
        rawData,
      );
      if (!data.petitionerName && data.examinerName) {
        data.petitionerName = data.examinerName;
      }

      const warnings = validateFormData(data, "ed");
      if (warnings.length > 0) {
        hideSpinner();
        const proceed = confirm(
          `Warning: The following fields are empty:\n\n• ${warnings.join("\n• ")}\n\nGenerate PDFs anyway?`,
        );
        if (!proceed) return;
        showSpinner();
      }

      const [aocPdfBytes, dmhPdfBytes] = await Promise.all([
        generateAocPdf(data),
        generateDmhPdf(data),
      ]);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");
      window.isFormDirty = false;
      showToast("Both PDFs Generated (ED Quick)!", "success");
    } catch (error) {
      console.error("Error generating PDFs:", error);
      showToast("Error generating PDFs. Check console for details.", "error");
    } finally {
      hideSpinner();
    }
  });

  // --- Saved Facility Profiles ---
  (function setupFacilityProfiles() {
    const STORAGE_KEY = "facilityProfiles";

    function getProfiles() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch { return []; }
    }

    function saveProfiles(profiles) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }

    function refreshAllDropdowns() {
      const profiles = getProfiles();
      document.querySelectorAll(".facility-profile-select").forEach((select) => {
        const current = select.value;
        select.innerHTML = '<option value="">Saved Profiles...</option>';
        profiles.forEach((p, i) => {
          const opt = document.createElement("option");
          opt.value = String(i);
          opt.textContent = p.name;
          select.appendChild(opt);
        });
        // Restore selection if still valid
        if (current && parseInt(current) < profiles.length) {
          select.value = current;
        }
      });
      // Update delete button visibility
      document.querySelectorAll(".facility-delete-btn").forEach((btn) => {
        const select = btn.closest("div").querySelector(".facility-profile-select");
        btn.classList.toggle("hidden", !select || !select.value);
      });
    }

    // Helper: parse facility info string into separate ED fields
    function fillEdFacilityFields(info) {
      // Format: "Name, Address, City State Zip, Phone" or "Name, City State, Phone"
      const parts = info.split(",").map((s) => s.trim());
      const nameEl = document.getElementById("ed-facility-name");
      const addrEl = document.getElementById("ed-facility-address");
      const cityEl = document.getElementById("ed-facility-city");
      const stateEl = document.getElementById("ed-facility-state");
      const zipEl = document.getElementById("ed-facility-zip");
      const phoneEl = document.getElementById("ed-facility-phone");
      if (!nameEl) return;
      nameEl.value = parts[0] || "";
      // Last part is likely phone if it contains digits
      const lastPart = parts.length > 1 ? parts[parts.length - 1] : "";
      const hasPhone = /\d/.test(lastPart);
      if (hasPhone && phoneEl) phoneEl.value = lastPart;
      // Middle parts: try to parse city/state/zip from second-to-last
      const midParts = parts.slice(1, hasPhone ? -1 : undefined);
      if (midParts.length >= 2) {
        // First mid part is address, rest is city/state/zip
        if (addrEl) addrEl.value = midParts[0];
        const csz = midParts.slice(1).join(", ");
        parseCityStateZip(csz, cityEl, stateEl, zipEl);
      } else if (midParts.length === 1) {
        // Could be "City State" or an address
        if (addrEl) addrEl.value = "";
        parseCityStateZip(midParts[0], cityEl, stateEl, zipEl);
      } else {
        if (addrEl) addrEl.value = "";
        if (cityEl) cityEl.value = "";
        if (stateEl) stateEl.value = "";
        if (zipEl) zipEl.value = "";
        if (phoneEl && !hasPhone) phoneEl.value = "";
      }
      [nameEl, addrEl, cityEl, stateEl, zipEl, phoneEl].forEach((el) => {
        if (el) el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    function parseCityStateZip(str, cityEl, stateEl, zipEl) {
      // Try to match patterns like "City NC 28401" or "City NC" or "City"
      const match = str.match(/^(.+?)\s+([A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/i);
      if (match) {
        if (cityEl) cityEl.value = match[1].trim();
        if (stateEl) stateEl.value = match[2].toUpperCase();
        if (zipEl) zipEl.value = match[3] || "";
      } else {
        if (cityEl) cityEl.value = str;
        if (stateEl) stateEl.value = "";
        if (zipEl) zipEl.value = "";
      }
    }

    // Helper: collect ED facility fields into a single info string
    function collectEdFacilityInfo() {
      const fName = (document.getElementById("ed-facility-name") || {}).value || "";
      const fAddr = (document.getElementById("ed-facility-address") || {}).value || "";
      const fCity = (document.getElementById("ed-facility-city") || {}).value || "";
      const fState = (document.getElementById("ed-facility-state") || {}).value || "";
      const fZip = (document.getElementById("ed-facility-zip") || {}).value || "";
      const fPhone = (document.getElementById("ed-facility-phone") || {}).value || "";
      const cityStateZip = [fCity, fState].filter(Boolean).join(" ") + (fZip ? " " + fZip : "");
      return [fName, fAddr, cityStateZip, fPhone].filter(Boolean).join(", ");
    }

    // When a profile is selected, fill the input
    document.querySelectorAll(".facility-profile-select").forEach((select) => {
      select.addEventListener("change", () => {
        const profiles = getProfiles();
        const idx = parseInt(select.value);
        if (isNaN(idx) || !profiles[idx]) return;
        if (select.dataset.target === "ed-facility-fields") {
          fillEdFacilityFields(profiles[idx].info);
        } else {
          const target = document.getElementById(select.dataset.target);
          if (target) {
            target.value = profiles[idx].info;
            target.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
        // Show/hide delete button
        const delBtn = select.closest("div").querySelector(".facility-delete-btn");
        if (delBtn) delBtn.classList.toggle("hidden", !select.value);
      });
    });

    // Save button: prompt for name, save profile
    document.querySelectorAll(".facility-save-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let infoValue;
        if (btn.dataset.target === "ed-facility-fields") {
          infoValue = collectEdFacilityInfo();
        } else {
          const target = document.getElementById(btn.dataset.target);
          infoValue = target ? target.value.trim() : "";
        }
        if (!infoValue) {
          showToast("Enter facility info first", "error");
          return;
        }
        const name = prompt("Profile name (e.g. hospital name):");
        if (!name || !name.trim()) return;
        const profiles = getProfiles();
        // Check for duplicate name
        const existing = profiles.findIndex((p) => p.name.toLowerCase() === name.trim().toLowerCase());
        if (existing >= 0) {
          if (!confirm(`Profile "${profiles[existing].name}" already exists. Overwrite?`)) return;
          profiles[existing].info = infoValue;
        } else {
          profiles.push({ name: name.trim(), info: infoValue });
        }
        saveProfiles(profiles);
        refreshAllDropdowns();
        showToast(`Facility profile "${name.trim()}" saved`, "success");
      });
    });

    // Delete button: remove selected profile
    document.querySelectorAll(".facility-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const select = btn.closest("div").querySelector(".facility-profile-select");
        if (!select || !select.value) return;
        const profiles = getProfiles();
        const idx = parseInt(select.value);
        if (isNaN(idx) || !profiles[idx]) return;
        if (!confirm(`Delete profile "${profiles[idx].name}"?`)) return;
        profiles.splice(idx, 1);
        saveProfiles(profiles);
        refreshAllDropdowns();
        showToast("Profile deleted", "success");
      });
    });

    // Initial load
    refreshAllDropdowns();
  })();

  // --- Zip Code Validation ---
  document.querySelectorAll('[id$="-respondent-zip"], [id$="-lrp-zip"], [id$="-petitioner-zip"], [id$="-witness-zip"]').forEach((input) => {
    input.addEventListener("blur", () => {
      const val = input.value.trim();
      if (!val || val === "Unknown") return;
      const digits = val.replace(/[^\d]/g, "");
      if (digits.length === 5) {
        input.value = digits;
      } else if (digits.length === 9) {
        input.value = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else if (digits.length > 0) {
        input.style.borderColor = "var(--danger)";
        setTimeout(() => { input.style.borderColor = ""; }, 2000);
      }
    });
  });

  // --- Exam Location Recent Locations Datalist ---
  (function setupExamLocationDatalist() {
    const STORAGE_KEY = "recentExamLocations";
    const MAX_LOCATIONS = 10;
    const datalist = document.getElementById("exam-location-list");
    if (!datalist) return;

    function getLocations() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    }

    function saveLocation(location) {
      const trimmed = location.trim();
      if (!trimmed) return;
      let locations = getLocations();
      // Remove duplicates (case-insensitive)
      locations = locations.filter(
        (l) => l.toLowerCase() !== trimmed.toLowerCase(),
      );
      // Add to front (most recent first)
      locations.unshift(trimmed);
      // Cap at max
      if (locations.length > MAX_LOCATIONS) locations.length = MAX_LOCATIONS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
      refreshDatalist();
    }

    function refreshDatalist() {
      datalist.innerHTML = "";
      getLocations().forEach((loc) => {
        const option = document.createElement("option");
        option.value = loc;
        datalist.appendChild(option);
      });
    }

    // Save location on blur for all exam-location inputs
    document
      .querySelectorAll(
        "#unified-exam-location, #aoc-exam-location, #dmh-exam-location, #ed-exam-location",
      )
      .forEach((input) => {
        input.addEventListener("blur", () => {
          if (input.value.trim()) saveLocation(input.value);
        });
      });

    // Initial load
    refreshDatalist();
  })();

  // --- Paste from Facesheet ---
  (function setupPasteFromFacesheet() {
    function parseFacesheet(text) {
      const result = {};
      const lines = text
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const full = lines.join(" ");

      // Name: try "Last, First" or "First Last" pattern from first non-empty line
      // or labeled "Name: ..." / "Patient: ..."
      const nameLabel = text.match(
        /(?:patient|name|resident)\s*[:]\s*(.+)/i,
      );
      if (nameLabel) {
        result.name = nameLabel[1].split(/\t|\s{2,}/)[0].trim();
      } else if (lines.length > 0) {
        // First line is likely the name if it looks like "LAST, FIRST" or "First Last"
        const firstLine = lines[0];
        if (/^[A-Za-z'-]+,\s*[A-Za-z'-]+/.test(firstLine)) {
          result.name = firstLine.split(/\t|\s{2,}/)[0].trim();
        }
      }

      // DOB: MM/DD/YYYY or MM-DD-YYYY or YYYY-MM-DD
      const dobMatch = full.match(
        /(?:DOB|Date of Birth|Birth\s*Date)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      );
      if (dobMatch) {
        result.dob = parseDateToISO(dobMatch[1]);
      } else {
        const isoMatch = full.match(
          /(?:DOB|Date of Birth)\s*[:.]?\s*(\d{4}-\d{2}-\d{2})/i,
        );
        if (isoMatch) result.dob = isoMatch[1];
      }

      // SSN
      const ssnMatch = full.match(
        /(?:SSN|SS#|Social)\s*[:.]?\s*(\d{3}[\s-]?\d{2}[\s-]?\d{4})/i,
      );
      if (ssnMatch) {
        const digits = ssnMatch[1].replace(/\D/g, "");
        result.ssn = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
      }

      // Sex/Gender
      const sexMatch = full.match(
        /(?:Sex|Gender)\s*[:.]?\s*(Male|Female|M|F)\b/i,
      );
      if (sexMatch) {
        const s = sexMatch[1].toUpperCase();
        result.sex = s === "M" ? "Male" : s === "F" ? "Female" : sexMatch[1];
      }

      // Race
      const raceMatch = full.match(
        /(?:Race|Ethnicity)\s*[:.]?\s*(White|Black|Hispanic|Asian|Native American|Pacific Islander|Other)/i,
      );
      if (raceMatch) result.race = raceMatch[1];

      // Marital Status
      const msMatch = full.match(
        /(?:Marital Status|MS)\s*[:.]?\s*(Single|Married|Divorced|Widowed|Separated)/i,
      );
      if (msMatch) result.ms = msMatch[1];

      // Address: look for street pattern
      const addrMatch = full.match(
        /(?:Address|Addr)\s*[:.]?\s*(\d+\s+[A-Za-z0-9 .#]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Cir|Circle|Pl|Place)[.,]?)/i,
      );
      if (addrMatch) result.street = addrMatch[1].trim();

      // City, State, Zip
      const cszMatch = full.match(
        /([A-Za-z .]+),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/,
      );
      if (cszMatch) {
        result.city = cszMatch[1].trim();
        result.state = cszMatch[2];
        result.zip = cszMatch[3];
      }

      // Phone
      const phoneMatch = full.match(
        /(?:Phone|Ph|Tel|Telephone)\s*[:.]?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/i,
      );
      if (phoneMatch) {
        const digits = phoneMatch[0].replace(/\D/g, "").slice(-10);
        result.phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }

      // DL
      const dlMatch = full.match(
        /(?:DL|Driver'?s?\s*License|License)\s*#?\s*[:.]?\s*([A-Za-z0-9]+)/i,
      );
      if (dlMatch) result.dl = dlMatch[1];

      return result;
    }

    function parseDateToISO(dateStr) {
      // Convert MM/DD/YYYY or MM-DD-YYYY to YYYY-MM-DD
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length !== 3) return "";
      let [a, b, c] = parts;
      if (a.length === 4) return `${a}-${b.padStart(2, "0")}-${c.padStart(2, "0")}`;
      if (c.length === 2) c = (parseInt(c) > 50 ? "19" : "20") + c;
      return `${c}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`;
    }

    function applyParsedData(prefix, data) {
      let count = 0;
      const setVal = (suffix, val) => {
        if (!val) return;
        const el = document.getElementById(`${prefix}-${suffix}`);
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        count++;
      };

      if (data.name) setVal("respondent-name", data.name);
      if (data.dob) setVal("respondent-dob", data.dob);
      if (data.ssn) setVal("respondent-ssn", data.ssn);
      if (data.street) setVal("respondent-street", data.street);
      if (data.city) setVal("respondent-city", data.city);
      if (data.state) setVal("respondent-state", data.state);
      if (data.zip) setVal("respondent-zip", data.zip);
      if (data.phone) setVal("respondent-phone", data.phone);
      if (data.dl) setVal("respondent-dl", data.dl);

      // Select fields
      if (data.sex) {
        const el = document.getElementById(`${prefix}-respondent-sex`);
        if (el) {
          for (const opt of el.options) {
            if (opt.value.toLowerCase() === data.sex.toLowerCase()) {
              el.value = opt.value;
              el.dispatchEvent(new Event("change", { bubbles: true }));
              count++;
              break;
            }
          }
        }
      }
      if (data.race) {
        const el = document.getElementById(`${prefix}-respondent-race`);
        if (el) {
          for (const opt of el.options) {
            if (opt.value.toLowerCase() === data.race.toLowerCase()) {
              el.value = opt.value;
              el.dispatchEvent(new Event("change", { bubbles: true }));
              count++;
              break;
            }
          }
        }
      }
      if (data.ms) {
        const el = document.getElementById(`${prefix}-respondent-ms`);
        if (el) {
          for (const opt of el.options) {
            if (opt.value.toLowerCase() === data.ms.toLowerCase()) {
              el.value = opt.value;
              el.dispatchEvent(new Event("change", { bubbles: true }));
              count++;
              break;
            }
          }
        }
      }

      return count;
    }

    document.querySelectorAll(".paste-facesheet-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        let text = "";
        try {
          text = await navigator.clipboard.readText();
        } catch {
          text = prompt("Paste facesheet text here:");
        }
        if (!text || !text.trim()) {
          showToast("No text found in clipboard", "error");
          return;
        }

        const prefix = btn.dataset.prefix;
        const parsed = parseFacesheet(text);
        const fieldCount = Object.keys(parsed).length;

        if (fieldCount === 0) {
          showToast(
            "Could not parse any fields from the pasted text",
            "error",
          );
          return;
        }

        const filled = applyParsedData(prefix, parsed);
        window.isFormDirty = true;
        showToast(
          `Parsed ${filled} field${filled !== 1 ? "s" : ""} from facesheet`,
          "success",
        );
      });
    });
  })();

  // --- Dark Theme Toggle ---
  const themeToggle = document.getElementById("theme-toggle");
  const sunIcon = themeToggle.querySelector(".sun-icon");
  const moonIcon = themeToggle.querySelector(".moon-icon");

  function updateToggleIcons() {
    const isDark = document.documentElement.classList.contains("dark");
    sunIcon.style.display = isDark ? "none" : "inline";
    moonIcon.style.display = isDark ? "inline" : "none";
  }

  updateToggleIcons();

  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateToggleIcons();

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 550);
  });
});
