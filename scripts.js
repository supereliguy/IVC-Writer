// Get PDF libraries
const { PDFDocument } = PDFLib;

document.addEventListener("DOMContentLoaded", () => {
  // --- County List ---
  const ncCounties = ["Alamance", "Alexander", "Alleghany", "Anson", "Ashe", "Avery", "Beaufort", "Bertie", "Bladen", "Brunswick", "Buncombe", "Burke", "Cabarrus", "Caldwell", "Camden", "Carteret", "Caswell", "Catawba", "Chatham", "Cherokee", "Chowan", "Clay", "Cleveland", "Columbus", "Craven", "Cumberland", "Currituck", "Dare", "Davidson", "Davie", "Duplin", "Durham", "Edgecombe", "Forsyth", "Franklin", "Gaston", "Gates", "Graham", "Granville", "Greene", "Guilford", "Halifax", "Harnett", "Haywood", "Henderson", "Hertford", "Hoke", "Hyde", "Iredell", "Jackson", "Johnston", "Jones", "Lee", "Lenoir", "Lincoln", "Macon", "Madison", "Martin", "McDowell", "Mecklenburg", "Mitchell", "Montgomery", "Moore", "Nash", "New Hanover", "Northampton", "Onslow", "Orange", "Pamlico", "Pasquotank", "Pender", "Perquimans", "Person", "Pitt", "Polk", "Randolph", "Richmond", "Robeson", "Rockingham", "Rowan", "Rutherford", "Sampson", "Scotland", "Stanly", "Stokes", "Surry", "Swain", "Transylvania", "Tyrrell", "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne", "Wilkes", "Wilson", "Yadkin", "Yancey"];
  const countyDropdowns = document.querySelectorAll("#unified-county, #aoc-county, #dmh-county");
  ncCounties.forEach(county => {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    countyDropdowns.forEach(dropdown => dropdown.appendChild(option.cloneNode(true)));
  });

  // --- UI Interactivity ---
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

  document.querySelectorAll('input[name="disposition"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('outpatient-fields').classList.toggle('hidden', radio.value !== 'outpatient'));
  });
  
  document.querySelectorAll('input[name="interpreter"]').forEach(radio => {
    radio.addEventListener('change', () => document.getElementById('interpreter-details').classList.toggle('hidden', radio.value !== 'yes'));
  });
  
  const tabButtons = document.querySelectorAll(".tab-button");
  const formSections = document.querySelectorAll(".form-section");
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("tab-active"));
      formSections.forEach(sec => sec.classList.add("hidden"));
      button.classList.add("tab-active");
      document.getElementById("form-" + button.dataset.form).classList.remove("hidden");
    });
  });

  // --- PDF Generation ---
  const FORM_URL_AOC = "./AOC-SP-300.pdf";
  const FORM_URL_DMH = "./DMH 5-72-19.pdf";

  const showSpinner = () => document.getElementById("loading-spinner").classList.remove("hidden");
  const hideSpinner = () => document.getElementById("loading-spinner").classList.add("hidden");

  const formatDate = (dateStr) => {
    if (!dateStr) return { full: '', mm: '', dd: '', yyyy: '' };
    const [yyyy, mm, dd] = dateStr.split('-');
    return { full: `${mm}/${dd}/${yyyy}`, mm, dd, yyyy };
  };

  async function generateAocPdf(data) {
    const pdfBytes = await fetch(FORM_URL_AOC).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
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
    const pdfBytes = await fetch(FORM_URL_DMH).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
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
    const vitals = `HR: ${data.hr}, RR: ${data.rr}, Temp: ${data.temp}, BP: ${data.bp}`;
    form.getTextField('HR / RR / Temp / BP').setText(vitals);
    form.getTextField('Knownreported medical problems').setText(data.medicalProblems);
    form.getTextField('Knownreported allergies').setText(data.allergies);
    form.getTextField('Knownreported current medications').setText(data.medications);
    
    if (data.flagChestPain) form.getCheckBox('Chest pain or shortness of breath').check();
    if (data.flagOverdose) form.getCheckBox('Suspected overdose on substances or medications within the past 24 hours including acetaminophen').check();
    if (data.flagSeverePain) form.getCheckBox('Presence of severe pain eg abdominal pain head pain').check();
    if (data.flagDisoriented) form.getCheckBox('Disoriented confused or unable to maintain balance').check();
    if (data.flagHeadTrauma) form.getCheckBox('Head trauma or recent loss of consciousness').check();
    if (data.flagPhysicalTrauma) form.getCheckBox('Recent physical trauma or profuse bleeding').check();
    if (data.flagWeakness) form.getCheckBox('New weakness numbness speech difficulties or visual changes').check();
    if (data.triggerAge) form.getCheckBox('Age 12 or 65 years old').check();
    if (data.triggerBp) form.getCheckBox('Systolic BP 160 or 100 andor diastolic 100 or 60').check();
    if (data.triggerHr) form.getCheckBox('Heart Rate 110 or 55 bpm').check();
    if (data.triggerRr) form.getCheckBox('Respiratory Rate 20 or 12 breaths per minute').check();
    if (data.triggerTemp) form.getCheckBox('Temperature 380 C 1004 F or 360 C 968 F').check();
    if (data.triggerDiabetes) form.getCheckBox('Known diagnosis of diabetes and not taking prescribed medications').check();
    if (data.triggerSeizures) form.getCheckBox('Recent seizure or history of seizures and not taking seizure medications').check();
    if (data.triggerAsthma) form.getCheckBox('Known diagnosis of asthma or chronic obstructive pulmonary disease and not taking prescribed medications').check();
    if (data.triggerPregnancy) form.getCheckBox('Known or suspected pregnancy').check();

    if (data.disposition === 'inpatient') form.getCheckBox('Inpatient Commitment for').check();
    if (data.disposition === 'outpatient') {
      form.getCheckBox('Outpatient Commitment respondent must meet ALL of the first four criteria outlined in Section I Outpatient').check();
      form.getTextField('Proposed Outpatient Treatment Center or Physician Name').setText(data.outpatientFacilityName);
      form.getTextField('Address Phone Number').setText(data.outpatientFacilityContact);
    }
    if (data.disposition === 'substance') form.getCheckBox('Substance Abuse Commitment respondent must meet both criteria outlined in Section I Substance Abuse').check();
    if (data.disposition === 'voluntary') form.getCheckBox('Respondent or Legally Responsible Person Consented to Voluntary Treatment').check();
    if (data.disposition === 'release') form.getCheckBox('Release Respondent and Terminate Proceedings insufficient findings to indicate that respondent meets commitment criteria').check();

    const [facilityName, ...addressParts] = data.facilityInfo.split(',');
    form.getTextField('Print Name of Examiner').setText(data.examinerName);
    form.getTextField('Address of Facility').setText(facilityName || '');
    form.getTextField('City and State').setText(addressParts.slice(0, 2).join(',').trim());
    form.getTextField('Telephone Number').setText(addressParts.length > 2 ? addressParts.slice(2).join(',').trim() : '');
    form.getTextField('Date').setText(data.examDate.full);
    
    return pdfDoc.save();
  }

  document.getElementById("generate-both").addEventListener("click", async () => {
    showSpinner();
    try {
      const getValue = id => document.getElementById(id).value;
      const isChecked = id => document.getElementById(id).checked;
      const getRadio = name => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; };

      const data = {
        county: getValue("unified-county"), clientRecord: getValue("unified-client-record"), fileNo: getValue("unified-file-no"),
        respondentName: getValue("unified-respondent-name"), respondentDob: formatDate(getValue("unified-respondent-dob")), respondentAge: getValue("unified-respondent-age"), respondentSex: getValue("unified-respondent-sex"), respondentRace: getValue("unified-respondent-race"), respondentMs: getValue("unified-respondent-ms"), respondentStreet: getValue("unified-respondent-street"), respondentCity: getValue("unified-respondent-city"), respondentState: getValue("unified-respondent-state"), respondentZip: getValue("unified-respondent-zip"), respondentPhone: getValue("unified-respondent-phone"), respondentSsn: getValue("unified-respondent-ssn"), respondentDl: getValue("unified-respondent-dl"), respondentDlState: getValue("unified-respondent-dl-state"), respondentLastLocation: getValue("unified-respondent-last-location"),
        lrpName: getValue("unified-lrp-name"), lrpRelationship: getValue("unified-lrp-relationship"), lrpStreet: getValue("unified-lrp-street"), lrpCity: getValue("unified-lrp-city"), lrpState: getValue("unified-lrp-state"), lrpZip: getValue("unified-lrp-zip"), lrpPhone: getValue("unified-lrp-phone"),
        petitionerName: getValue("unified-petitioner-name"), petitionerRelationship: getValue("unified-petitioner-relationship"), petitionerStreet: getValue("unified-petitioner-street"), petitionerCity: getValue("unified-petitioner-city"), petitionerState: getValue("unified-petitioner-state"), petitionerZip: getValue("unified-petitioner-zip"), petitionerHomePhone: getValue("unified-petitioner-home-phone"), petitionerBusPhone: getValue("unified-petitioner-bus-phone"),
        witnessName: getValue("unified-witness-name"), witnessStreet: getValue("unified-witness-street"), witnessCity: getValue("unified-witness-city"), witnessState: getValue("unified-witness-state"), witnessZip: getValue("unified-witness-zip"), witnessHomePhone: getValue("unified-witness-home-phone"), witnessBusPhone: getValue("unified-witness-bus-phone"),
        interpreter: getRadio("interpreter"), interpreterExplanation: getValue("unified-interpreter-explanation"),
        examDate: formatDate(getValue("unified-exam-date")), examTime: getValue("unified-exam-time"), examLocation: getValue("unified-exam-location"),
        findings: getValue("unified-findings"), impression: getValue("unified-impression"),
        isMi: isChecked("unified-check-mi"), isMiDangerSelf: isChecked("unified-check-mi-danger-self"), isMiDangerOthers: isChecked("unified-check-mi-danger-others"), isMiId: isChecked("unified-check-mi-id"),
        isSa: isChecked("unified-check-sa"), isSaDangerSelf: isChecked("unified-check-sa-danger-self"), isSaDangerOthers: isChecked("unified-check-sa-danger-others"),
        hr: getValue("unified-hr"), rr: getValue("unified-rr"), temp: getValue("unified-temp"), bp: getValue("unified-bp"), medicalProblems: getValue("unified-medical-problems"), allergies: getValue("unified-allergies"), medications: getValue("unified-medications"),
        flagChestPain: isChecked("flag-chest-pain"), flagOverdose: isChecked("flag-overdose"), flagSeverePain: isChecked("flag-severe-pain"), flagDisoriented: isChecked("flag-disoriented"), flagHeadTrauma: isChecked("flag-head-trauma"), flagPhysicalTrauma: isChecked("flag-physical-trauma"), flagWeakness: isChecked("flag-weakness"),
        triggerAge: isChecked("trigger-age"), triggerBp: isChecked("trigger-bp"), triggerHr: isChecked("trigger-hr"), triggerRr: isChecked("trigger-rr"), triggerTemp: isChecked("trigger-temp"), triggerDiabetes: isChecked("trigger-diabetes"), triggerSeizures: isChecked("trigger-seizures"), triggerAsthma: isChecked("trigger-asthma"), triggerPregnancy: isChecked("trigger-pregnancy"),
        disposition: getRadio("disposition"), outpatientFacilityName: getValue("unified-outpatient-facility-name"), outpatientFacilityContact: getValue("unified-outpatient-facility-contact"),
        examinerName: getValue("unified-examiner-name"), facilityInfo: getValue("unified-facility-info"), notaryCounty: getValue("unified-notary-county"), notaryExpiration: formatDate(getValue("unified-notary-expiration")), certification: getRadio("certification"), waiverDate: formatDate(getValue("unified-waiver-date")),
      };

      const aocPdfBytes = await generateAocPdf(data);
      saveAs(new Blob([aocPdfBytes], { type: "application/pdf" }), "Completed-AOC-SP-300.pdf");
      const dmhPdfBytes = await generateDmhPdf(data);
      saveAs(new Blob([dmhPdfBytes], { type: "application/pdf" }), "Completed-DMH-5-72-19.pdf");

    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert("Error generating PDFs. Check console for details.");
    } finally {
      hideSpinner();
    }
  });
  
  // --- Local Storage & Initialization ---
  const localSaveInputs = document.querySelectorAll(".local-save");
  const rememberCheckbox = document.getElementById("unified-remember-me");

  const loadSavedData = () => {
    if (localStorage.getItem("rememberMe") === "true") {
      rememberCheckbox.checked = true;
      localSaveInputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) input.value = savedValue;
      });
    }
  };

  rememberCheckbox.addEventListener("change", () => {
    localStorage.setItem("rememberMe", rememberCheckbox.checked);
    if (rememberCheckbox.checked) {
      localSaveInputs.forEach(input => localStorage.setItem(input.id, input.value));
    } else {
      localSaveInputs.forEach(input => localStorage.removeItem(input.id));
    }
  });

  localSaveInputs.forEach(input => {
    input.addEventListener("input", () => {
      if (rememberCheckbox.checked) localStorage.setItem(input.id, input.value);
    });
  });
  
  setDefaultDateTime();
  loadSavedData();
});
