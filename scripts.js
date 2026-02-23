// Get PDF libraries
const { PDFDocument } = PDFLib;

const FORM_URL_AOC = "./AOC-SP-300.pdf";
const FORM_URL_DMH = "./DMH-5-72-19.pdf";

const aocPdfPromise = fetch(FORM_URL_AOC).then(res => res.arrayBuffer());
const dmhPdfPromise = fetch(FORM_URL_DMH).then(res => res.arrayBuffer());

document.addEventListener("DOMContentLoaded", () => {
  // --- County List ---
  const ncCounties = ["Alamance", "Alexander", "Alleghany", "Anson", "Ashe", "Avery", "Beaufort", "Bertie", "Bladen", "Brunswick", "Buncombe", "Burke", "Cabarrus", "Caldwell", "Camden", "Carteret", "Caswell", "Catawba", "Chatham", "Cherokee", "Chowan", "Clay", "Cleveland", "Columbus", "Craven", "Cumberland", "Currituck", "Dare", "Davidson", "Davie", "Duplin", "Durham", "Edgecombe", "Forsyth", "Franklin", "Gaston", "Gates", "Graham", "Granville", "Greene", "Guilford", "Halifax", "Harnett", "Haywood", "Henderson", "Hertford", "Hoke", "Hyde", "Iredell", "Jackson", "Johnston", "Jones", "Lee", "Lenoir", "Lincoln", "Macon", "Madison", "Martin", "McDowell", "Mecklenburg", "Mitchell", "Montgomery", "Moore", "Nash", "New Hanover", "Northampton", "Onslow", "Orange", "Pamlico", "Pasquotank", "Pender", "Perquimans", "Person", "Pitt", "Polk", "Randolph", "Richmond", "Robeson", "Rockingham", "Rowan", "Rutherford", "Sampson", "Scotland", "Stanly", "Stokes", "Surry", "Swain", "Transylvania", "Tyrrell", "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne", "Wilkes", "Wilson", "Yadkin", "Yancey"];
  const countyDropdowns = document.querySelectorAll("#unified-county, #aoc-county, #dmh-county");
  const fragment = document.createDocumentFragment();
  ncCounties.forEach(county => {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    fragment.appendChild(option);
  });
  countyDropdowns.forEach(dropdown => dropdown.appendChild(fragment.cloneNode(true)));

  // --- UI Interactivity ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    let borderColorClass = 'border-blue-500';
    let textColorClass = 'text-blue-700';

    if (type === 'success') {
      borderColorClass = 'border-green-500';
      textColorClass = 'text-green-700';
    } else if (type === 'error') {
      borderColorClass = 'border-red-500';
      textColorClass = 'text-red-700';
    }

    toast.className = `pointer-events-auto bg-white border-l-4 ${borderColorClass} ${textColorClass} p-4 rounded shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 flex items-center mb-2`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="font-medium">${message}</span>`;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000);
  }

  function setDefaultDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    document.querySelectorAll('.default-date').forEach(el => el.value = `${yyyy}-${mm}-${dd}`);
    document.querySelectorAll('.default-time').forEach(el => el.value = `${hh}:${min}`);
  }

  document.querySelectorAll('input[name="unified-disposition"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('outpatient-fields').classList.toggle('hidden', radio.value !== 'outpatient'));
  });
   document.querySelectorAll('input[name="aoc-disposition"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('aoc-outpatient-fields').classList.toggle('hidden', radio.value !== 'outpatient'));
  });
   document.querySelectorAll('input[name="dmh-disposition"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('dmh-outpatient-fields').classList.toggle('hidden', radio.value !== 'outpatient'));
  });
  
  document.querySelectorAll('input[name="unified-interpreter"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('interpreter-details').classList.toggle('hidden', radio.value !== 'yes'));
  });
   document.querySelectorAll('input[name="aoc-interpreter"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('aoc-interpreter-details').classList.toggle('hidden', radio.value !== 'yes'));
  });
   document.querySelectorAll('input[name="dmh-interpreter"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('dmh-interpreter-details').classList.toggle('hidden', radio.value !== 'yes'));
  });
  
  const tabButtons = document.querySelectorAll(".tab-button");
  const formSections = document.querySelectorAll(".form-section");
  const tabButtonsArray = Array.from(tabButtons);

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => {
        btn.classList.remove("tab-active");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("tabindex", "-1");
      });
      formSections.forEach(sec => sec.classList.add("hidden"));

      button.classList.add("tab-active");
      button.setAttribute("aria-selected", "true");
      button.setAttribute("tabindex", "0");
      document.getElementById("form-" + button.dataset.form).classList.remove("hidden");
    });

    button.addEventListener("keydown", (e) => {
      const index = tabButtonsArray.indexOf(button);
      let newIndex = -1;

      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % tabButtonsArray.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (index - 1 + tabButtonsArray.length) % tabButtonsArray.length;
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
  const showSpinner = () => document.getElementById("loading-spinner").classList.remove("hidden");
  const hideSpinner = () => document.getElementById("loading-spinner").classList.add("hidden");

  const formatDate = (dateStr) => {
    if (!dateStr) return { full: '', mm: '', dd: '', yyyy: '' };
    const [yyyy, mm, dd] = dateStr.split('-');
    return { full: `${mm}/${dd}/${yyyy}`, mm, dd, yyyy };
  };

  async function generateAocPdf(data) {
    const aocPdfCache = await aocPdfPromise;
    const pdfDoc = await PDFDocument.load(aocPdfCache);
    const form = pdfDoc.getForm();
    
    form.getTextField('FileNo').setText(data.fileNo);
    form.getTextField('County').setText(data.county);
    form.getTextField('RespondentName').setText(data.respondentName);
    form.getTextField('RespAddr1').setText(data.respondentStreet);
    form.getTextField('RespCity').setText(data.respondentCity);
    form.getTextField('RespState').setText(data.respondentState);
    form.getTextField('RespZip').setText(data.respondentZip);
    form.getTextField('RespSSN').setText(data.respondentSsn);
    form.getTextField('RespDOB').setText(data.respondentDob.full);
    form.getTextField('RespDLNo').setText(data.respondentDl);
    form.getTextField('RespDLState').setText(data.respondentDlState);
    form.getTextField('LastKnownLocationOfRespondent').setText(data.respondentLastLocation);

    if (data.interpreter === 'no') form.getCheckBox('NoInterpreterNotNeededCkBox').check();
    if (data.interpreter === 'yes') {
        form.getCheckBox('YesInterpreterNeededCkBox').check();
        form.getTextField('YesInterpreterNeededExplanationField').setText(data.interpreterExplanation);
    }

    if (data.isMi && (data.isMiDangerSelf || data.isMiDangerOthers)) form.getCheckBox('CkBox_001').check();
    if (data.isMi && data.isMiId) form.getCheckBox('CkBox_002').check();
    if (data.isSa && (data.isSaDangerSelf || data.isSaDangerOthers)) form.getCheckBox('CkBox_003').check();
    form.getTextField('Memo_001').setText(data.findings);
    
    form.getTextField('OtherPerName').setText(data.witnessName);
    form.getTextField('OthrPersonAddr1').setText(data.witnessStreet);
    form.getTextField('OthrPersonCity').setText(data.witnessCity);
    form.getTextField('OtherPersonState').setText(data.witnessState);
    form.getTextField('OtherPersonZip').setText(data.witnessZip);
    form.getTextField('OtherPerHomePhoneNo').setText(data.witnessHomePhone);
    form.getTextField('OtherPerBusPhoneNo').setText(data.witnessBusPhone);

    form.getTextField('Date1').setText(data.examDate.full);
    if(data.certification === "DepCSC") form.getCheckBox('CkBox_DepCSC').check();
    if(data.certification === "AsstCSC") form.getCheckBox('CkBox_AsstCSC').check();
    if(data.certification === "CSC") form.getCheckBox('CkBox_CSC').check();
    if(data.certification === "Mag") form.getCheckBox('CkBox_Mag').check();
    if(data.certification === "Notary") form.getCheckBox('Notary_Ckbx').check();
    form.getTextField('CountyCommission').setText(data.notaryCounty);
    form.getTextField('DateCommExpires').setText(data.notaryExpiration.full);

    form.getTextField('PetName').setText(data.petitionerName);
    form.getTextField('PetitAddr1').setText(data.petitionerStreet);
    form.getTextField('PetitCity').setText(data.petitionerCity);
    form.getTextField('PetitState').setText(data.petitionerState);
    form.getTextField('PetitZip').setText(data.petitionerZip);
    form.getTextField('RelationshipResp').setText(data.petitionerRelationship);
    form.getTextField('PetitionerHomePhoneNo').setText(data.petitionerHomePhone);
    form.getTextField('PetitionerBusPhoneNo').setText(data.petitionerBusPhone);
    form.getTextField('DateWaiver').setText(data.waiverDate.full);
    
    return pdfDoc.save();
  }

  async function generateDmhPdf(data) {
    const dmhPdfCache = await dmhPdfPromise;
    const pdfDoc = await PDFDocument.load(dmhPdfCache);
    const form = pdfDoc.getForm();
    
    form.getTextField('County').setText(data.county);
    form.getTextField('Client Record').setText(data.clientRecord);
    form.getTextField('File').setText(data.fileNo);
    form.getTextField('Name of Respondent').setText(data.respondentName);
    form.getTextField('DOB').setText(data.respondentDob.full);
    form.getTextField('Age').setText(data.respondentAge);
    form.getTextField('Sex').setText(data.respondentSex);
    form.getTextField('Race').setText(data.respondentRace);
    form.getTextField('MS').setText(data.respondentMs);
    form.getTextField('Address Street or Box Number').setText(data.respondentStreet);
    form.getTextField('City').setText(data.respondentCity);
    form.getTextField('State').setText(data.respondentState);
    form.getTextField('Zip').setText(data.respondentZip);
    form.getTextField('County_2').setText(data.county);
    form.getTextField('Phone').setText(data.respondentPhone);

    form.getTextField('Legally Responsible Person or Next of Kin Name').setText(data.lrpName);
    form.getTextField('Relationship').setText(data.lrpRelationship);
    form.getTextField('Address Street or Box Number_2').setText(data.lrpStreet);
    form.getTextField('City_2').setText(data.lrpCity);
    form.getTextField('State_2').setText(data.lrpState);
    form.getTextField('Zip_2').setText(data.lrpZip);
    form.getTextField('Phone_2').setText(data.lrpPhone);
    
    form.getTextField('Petitioner Name').setText(data.petitionerName);
    form.getTextField('Relationship_2').setText(data.petitionerRelationship);
    form.getTextField('Address Street or Box Number_3').setText(data.petitionerStreet);
    form.getTextField('City_3').setText(data.petitionerCity);
    form.getTextField('State_3').setText(data.petitionerState);
    form.getTextField('Zip_3').setText(data.petitionerZip);
    form.getTextField('Phone_3').setText(data.petitionerHomePhone);

    form.getTextField('was conducted on').setText(data.examDate.full);
    form.getTextField('at').setText(data.examTime);
    form.getTextField('OR').setText(data.examLocation);
    
    if (data.isMi) form.getCheckBox('An individual with a mental illness').check();
    if (data.isMiDangerSelf) form.getCheckBox('Self or').check();
    if (data.isMiDangerOthers) form.getCheckBox('Others').check();
    if (data.isMiId) form.getCheckBox('In addition to having a').check();
    if (data.isSa) form.getCheckBox('A Substance Abuser').check();
    if (data.isSaDangerSelf) form.getCheckBox('Self or_2').check();
    if (data.isSaDangerOthers) form.getCheckBox('Others_2').check();

    form.getTextField('Clear description of findings findings for each criterion checked in Section I must be described').setText(data.findings);
    form.getTextField('ImpressionDiagnosis').setText(data.impression);
    form.getTextField('HR').setText(data.hr);
    form.getTextField('RR').setText(data.rr);
    form.getTextField('Temp').setText(data.temp);
    form.getTextField('undefined_5').setText(data.bp);

    form.getTextField('Knownreported allergies').setText(data.allergies);
    form.getTextField('Knownreported current medications please list').setText(data.medications);
    
    if (data.flagChestPain) form.getCheckBox('Chest pain or shortness of breath').check();
    if (data.flagOverdose) form.getCheckBox('Suspected overdose on substances or medications within the past 24 hours including acetaminophen').check();
    if (data.flagSeverePain) form.getCheckBox('Presence of severe pain eg abdominal pain head pain').check();
    if (data.flagDisoriented) form.getCheckBox('Disoriented confused or unable to maintain balance').check();
    if (data.flagHeadTrauma) form.getCheckBox('Head trauma or recent loss of consciousness').check();
    if (data.flagPhysicalTrauma) form.getCheckBox('Recent physical trauma or profuse bleeding').check();
    if (data.flagWeakness) form.getCheckBox('New weakness numbness speech difficulties or visual changes').check();
    if (data.triggerAge) form.getCheckBox('Age  12 or  65 years old').check();
    if (data.triggerBp) form.getCheckBox('Systolic BP  160 or  100 andor diastolic  100 or  60').check();
    if (data.triggerHr) form.getCheckBox('Heart Rate 110 or  55 bpm').check();
    if (data.triggerRr) form.getCheckBox('Respiratory Rate  20 or  12 breaths per minute').check();
    if (data.triggerTemp) form.getCheckBox('Temperature  380 C 1004 F or  360 C 968 F').check();
    if (data.triggerDiabetes) form.getCheckBox('Known diagnosis of diabetes and not taking prescribed medications').check();
    if (data.triggerSeizures) form.getCheckBox('Recent seizure or history of seizures and not taking seizure medications').check();
    if (data.triggerAsthma) form.getCheckBox('Known diagnosis of asthma or chronic obstructive pulmonary disease and not taking prescribed medications').check();
    if (data.triggerPregnancy) form.getCheckBox('Known or suspected pregnancy').check();

    if (data.disposition === 'inpatient') form.getCheckBox('Inpatient Commitment for').check();
    if (data.disposition === 'outpatient') {
      form.getCheckBox('Outpatient Commitment respondent must meet ALL of the first four criteria outlined in Section I Outpatient').check();
      form.getTextField('Proposed Outpatient Treatment Center or Physician Name').setText(data.outpatientFacilityName);
      form.getTextField('Address  Phone Number').setText(data.outpatientFacilityContact);
    }
    if (data.disposition === 'substance') form.getCheckBox('Substance Abuse Commitment respondent must meet both criteria outlined in Section I Substance Abuse').check();
    if (data.disposition === 'voluntary') form.getCheckBox('Respondent or Legally Responsible Person Consented to Voluntary Treatment').check();
    if (data.disposition === 'release') form.getCheckBox('Release Respondent and Terminate Proceedings insufficient findings to indicate that respondent meets commitment criteria').check();

    const [facilityName, ...addressParts] = data.facilityInfo.split(',');
    form.getTextField('Print Name of Examiner').setText(data.examinerName);
    form.getTextField('Address of Facility').setText(facilityName || '');
    form.getTextField('City and State').setText(addressParts.length ? addressParts.slice(0, -1).join(',').trim() : '');
    form.getTextField('Telephone Number').setText(addressParts.length ? addressParts[addressParts.length - 1].trim() : '');
    form.getTextField('Date').setText(data.examDate.full);
    
    return pdfDoc.save();
  }

  function collectFormData(prefix) {
      const getValue = id => document.getElementById(`${prefix}-${id}`).value;
      const isChecked = id => document.getElementById(`${prefix}-${id}`).checked;
      const getRadio = name => { const el = document.querySelector(`input[name="${prefix}-${name}"]:checked`); return el ? el.value : null; };

      return {
        county: getValue("county"), clientRecord: getValue("client-record"), fileNo: getValue("file-no"),
        respondentName: getValue("respondent-name"), respondentDob: formatDate(getValue("respondent-dob")), respondentAge: getValue("respondent-age"), respondentSex: getValue("respondent-sex"), respondentRace: getValue("respondent-race"), respondentMs: getValue("respondent-ms"), respondentStreet: getValue("respondent-street"), respondentCity: getValue("respondent-city"), respondentState: getValue("respondent-state"), respondentZip: getValue("respondent-zip"), respondentPhone: getValue("respondent-phone"), respondentSsn: getValue("respondent-ssn"), respondentDl: getValue("respondent-dl"), respondentDlState: getValue("respondent-dl-state"), respondentLastLocation: getValue("respondent-last-location"),
        lrpName: getValue("lrp-name"), lrpRelationship: getValue("lrp-relationship"), lrpStreet: getValue("lrp-street"), lrpCity: getValue("lrp-city"), lrpState: getValue("lrp-state"), lrpZip: getValue("lrp-zip"), lrpPhone: getValue("lrp-phone"),
        petitionerName: getValue("petitioner-name"), petitionerRelationship: getValue("petitioner-relationship"), petitionerStreet: getValue("petitioner-street"), petitionerCity: getValue("petitioner-city"), petitionerState: getValue("petitioner-state"), petitionerZip: getValue("petitioner-zip"), petitionerHomePhone: getValue("petitioner-home-phone"), petitionerBusPhone: getValue("petitioner-bus-phone"),
        witnessName: getValue("witness-name"), witnessStreet: getValue("witness-street"), witnessCity: getValue("witness-city"), witnessState: getValue("witness-state"), witnessZip: getValue("witness-zip"), witnessHomePhone: getValue("witness-home-phone"), witnessBusPhone: getValue("witness-bus-phone"),
        interpreter: getRadio("interpreter"), interpreterExplanation: getValue("interpreter-explanation"),
        examDate: formatDate(getValue("exam-date")), examTime: getValue("exam-time"), examLocation: getValue("exam-location"),
        findings: getValue("findings"), impression: getValue("impression"),
        isMi: isChecked("check-mi"), isMiDangerSelf: isChecked("check-mi-danger-self"), isMiDangerOthers: isChecked("check-mi-danger-others"), isMiId: isChecked("check-mi-id"),
        isSa: isChecked("check-sa"), isSaDangerSelf: isChecked("check-sa-danger-self"), isSaDangerOthers: isChecked("check-sa-danger-others"),
        hr: getValue("hr"), rr: getValue("rr"), temp: getValue("temp"), bp: getValue("bp"), medicalProblems: getValue("medical-problems"), allergies: getValue("allergies"), medications: getValue("medications"),
        flagChestPain: isChecked("flag-chest-pain"), flagOverdose: isChecked("flag-overdose"), flagSeverePain: isChecked("flag-severe-pain"), flagDisoriented: isChecked("flag-disoriented"), flagHeadTrauma: isChecked("flag-head-trauma"), flagPhysicalTrauma: isChecked("flag-physical-trauma"), flagWeakness: isChecked("flag-weakness"),
        triggerAge: isChecked("trigger-age"), triggerBp: isChecked("trigger-bp"), triggerHr: isChecked("trigger-hr"), triggerRr: isChecked("trigger-rr"), triggerTemp: isChecked("trigger-temp"), triggerDiabetes: isChecked("trigger-diabetes"), triggerSeizures: isChecked("trigger-seizures"), triggerAsthma: isChecked("trigger-asthma"), triggerPregnancy: isChecked("trigger-pregnancy"),
        disposition: getRadio("disposition"), outpatientFacilityName: getValue("outpatient-facility-name"), outpatientFacilityContact: getValue("outpatient-facility-contact"),
        examinerName: getValue("examiner-name"), facilityInfo: getValue("facility-info"), notaryCounty: getValue("notary-county"), notaryExpiration: formatDate(getValue("notary-expiration")), certification: getRadio("certification"), waiverDate: formatDate(getValue("waiver-date")),
      };
  }

  document.getElementById("generate-both").addEventListener("click", async () => {
    showSpinner();
    try {
      const data = collectFormData("unified");
      const aocPdfBytes = await generateAocPdf(data);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
      const dmhPdfBytes = await generateDmhPdf(data);
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");
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
      const aocPdfBytes = await generateAocPdf(data);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
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
      const dmhPdfBytes = await generateDmhPdf(data);
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");
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
  const rememberCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-remember-me"]');

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  const loadSavedData = () => {
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    if (isRemembered) {
      rememberCheckboxes.forEach(cb => cb.checked = true);
      localSaveInputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) input.value = savedValue;
      });
    }
  };

  rememberCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;

      // Sync all checkboxes
      rememberCheckboxes.forEach(cb => cb.checked = isChecked);

      localStorage.setItem("rememberMe", isChecked);

      if (isChecked) {
        localSaveInputs.forEach(input => localStorage.setItem(input.id, input.value));
        showToast("Preferences saved. Your petitioner info will be remembered.", "success");
      } else {
        localSaveInputs.forEach(input => localStorage.removeItem(input.id));
        showToast("Preferences cleared. Petitioner info will not be saved.", "info");
      }
    });
  });

  localSaveInputs.forEach(input => {
    input.addEventListener("input", debounce(() => {
      if (localStorage.getItem("rememberMe") === "true") {
        localStorage.setItem(input.id, input.value);
      }
    }, 300));
  });
  
  // --- Phone Number Formatting ---
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const formattedPhoneNumber = formatPhoneNumber(e.target.value);
      e.target.value = formattedPhoneNumber;
    });
  });

  setDefaultDateTime();
  loadSavedData();

  // --- Auto-Expand Textareas ---
  const autoResizeTextarea = (textarea) => {
    if (textarea.offsetParent === null) return; // Skip hidden elements
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.style.overflowY = 'hidden';
    textarea.style.resize = 'none';
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
  });

  // Resize on window resize
  window.addEventListener('resize', () => {
    textareas.forEach(autoResizeTextarea);
  });

  // Trigger resize on tab switch
  document.querySelectorAll(".tab-button").forEach(button => {
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
});
