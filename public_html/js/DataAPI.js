/*
 *
 * The DataAPI manages the AJAX calls and callbacks to external data sources.
 *
 * Author:		Gregg Bowden - Deloitte (gbowden@deloitte.ca)
 * Owner:			Deloitte
 */

/**
 *
 * @returns {undefined}
 */
var DataAPI = {};
var xhr;

DataAPI.version = "v1";
//Live URL
//DataAPI.baseURL = "http://localhost:8080/contacts/api/"+DataAPI.version+"";
//Dev URL
DataAPI.baseURL = "/tc/api/"+DataAPI.version+"";
//Live REST API URL
DataAPI.mockURL = "https://localhost:8083/talentcloud/api/"+DataAPI.version+"";

DataAPI.getTalentCloudUI = function(locale,isManager){
    Utilities.debug?console.log("loading talent cloud UI"):null;
    Utilities.debug?console.log("loading contacts"):null;
    var talentcloudData_URL = DataAPI.baseURL+"/"+locale+"/getContent";
    //console.log('Talent cloud url data:   ' + talentcloudData_URL);
    //var talentcloudData_URL = "/wiremock/mappings/GET_ContentByLocale.json";//TEMPORARY for bh.browse_job_seekers branch
    var authToken = "";
    if(UserAPI.hasAuthToken()){
        authToken = UserAPI.getAuthTokenAsJSON();
    }
    var talentcloudData_xhr = new XMLHttpRequest();
    if ("withCredentials" in talentcloudData_xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      talentcloudData_xhr.open("GET", talentcloudData_URL);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      talentcloudData_xhr = new XDomainRequest();
      talentcloudData_xhr.open("GET", talentcloudData_URL);

    } else {

      // Otherwise, CORS is not supported by the browser.
      talentcloudData_xhr = null;

    }
    talentcloudData_xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    talentcloudData_xhr.setRequestHeader('Authorization', 'Bearer ' + authToken.access_token);
    talentcloudData_xhr.addEventListener("progress",
    function(evt){
        DataAPI.talentcloudDataUpdateProgress(evt);
    },false);
    talentcloudData_xhr.addEventListener("load",
    function(evt){
        DataAPI.talentcloudDataloaded(talentcloudData_xhr.responseText,isManager);
    },false);
    talentcloudData_xhr.addEventListener("error",DataAPI.transferFailed,false);
    talentcloudData_xhr.addEventListener("abort",DataAPI.transferAborted,false);

    talentcloudData_xhr.open('GET',talentcloudData_URL);
    talentcloudData_xhr.send(authToken);
};

/**
 *
 * @param {type} evt
 * @returns {undefined}
 */
DataAPI.talentcloudDataUpdateProgress = function(evt){
    Utilities.debug?console.log(evt):null;
    if(evt.lengthComputable){
        var total = evt.total;
        var value = evt.loaded;

        Utilities.debug?console.log(total + "=" + value):null;

        var percentComplete = Math.ceil((evt.loaded / evt.total) * 100);
        //var loadingProgress = document.getElementById("loadingProgress");
        //loadingProgress.innerHTML = " " + percentComplete + "%";
    }
};

/**
 *
 * @param {type} responseText
 * @returns {undefined}
 */
DataAPI.talentcloudDataloaded = function(responseText,isManager){
    Utilities.debug?console.log("data="+responseText):null;
    var data = JSON.parse(responseText);
    var content = data.content;

    var thisContent = new TalentCloudAPI.Content();
    // Navigation Links
    thisContent.navigationLoginLink = content.navigationLoginLink;
    thisContent.navigationLogoutLink = content.navigationLogoutLink;
    thisContent.navigationRegisterLink = content.navigationRegisterLink;
    thisContent.navigationHomeLink = content.navigationHomeLink;
    thisContent.navigationProfileLink = content.navigationProfileLink;
    thisContent.navigationBrowseLink = content.navigationBrowseLink;
    thisContent.navigationDashboardLink = content.navigationDashboardLink;
    thisContent.navigationPosterLink = content.navigationPosterLink;
    // Subpage Titles
    thisContent.browseHeroTitle = content.browseHeroTitle;
    thisContent.dashboardHeroTitle = content.dashboardHeroTitle;
    thisContent.profileHeroTitle = content.profileHeroTitle;
    thisContent.applicationHeroTitle = content.applicationHeroTitle;
    thisContent.managerProfileHeroTitle = content.managerProfileHeroTitle;
    thisContent.posterHeroTitle = content.posterHeroTitle;
    thisContent.faqHeroTitle = content.faqHeroTitle;
    // Job Poster Content
    thisContent.jobPosterSubnavLabel = content.jobPosterSubnavLabel;
    thisContent.jobPosterSubnavItemBasics = content.jobPosterSubnavItemBasics;
    thisContent.jobPosterSubnavItemImpact = content.jobPosterSubnavItemImpact;
    thisContent.jobPosterSubnavItemWork = content.jobPosterSubnavItemWork;
    thisContent.jobPosterSubnavItemCriteria = content.jobPosterSubnavItemCriteria;
    thisContent.jobPosterSubnavItemCulture = content.jobPosterSubnavItemCulture;
    thisContent.jobPosterSubnavItemKnow = content.jobPosterSubnavItemKnow;
    thisContent.jobPosterSubnavItemApply = content.jobPosterSubnavItemApply;
    thisContent.jobPosterContentTitleBasics = content.jobPosterContentTitleBasics;
    thisContent.jobPosterContentTitleImpact = content.jobPosterContentTitleImpact;
    thisContent.jobPosterContentTitleWork = content.jobPosterContentTitleWork;
    thisContent.jobPosterContentTitleCriteria = content.jobPosterContentTitleCriteria;
    thisContent.jobPosterContentTitleCulture = content.jobPosterContentTitleCulture;
    thisContent.jobPosterContentTitleKnow = content.jobPosterContentTitleKnow;
    thisContent.jobPosterContentTitleApply = content.jobPosterContentTitleApply;
    // Job Application
    thisContent.essentialCriteria = content.essentialCriteria;
    thisContent.assetCriteria = content.assetCriteria;
    thisContent.microReference = content.microReference;
    thisContent.skillSample = content.skillSample;
    thisContent.applicationPositionLabel = content.applicationPositionLabel;
    // Application Preview
    thisContent.editApplication = content.editApplication;
    thisContent.applicationPreviewProfilePhotoTitle = content.applicationPreviewProfilePhotoTitle;
    thisContent.applicationPreviewProfileAlert = content.applicationPreviewProfileAlert;
    thisContent.applicationPreviewDeclarationStoryTitle = content.applicationPreviewDeclarationStoryTitle;
    thisContent.applicationPreviewMicroReferenceTitle = content.applicationPreviewMicroReferenceTitle;
    thisContent.applicationPreviewReferenceMissing = content.applicationPreviewReferenceMissing;
    thisContent.applicationPreviewSkillSampleStoryLabel = content.applicationPreviewSkillSampleStoryLabel;
    thisContent.applicationPreviewSkillSampleLink = content.applicationPreviewSkillSampleLink;
    thisContent.applicationPreviewSkillSampleMissing = content.applicationPreviewSkillSampleMissing;
    // Others
    thisContent.title = content.title;
    thisContent.helpLearn = content.helpLearn;
    thisContent.languageSelect = content.languageSelect;
    thisContent.applyNow = content.applyNow;
    thisContent.jobPostersLink = content.jobPostersLink;
    thisContent.teamsLink = content.teamsLink;
    thisContent.jobNumber = content.jobNumber;
    thisContent.jobTitle = content.jobTitle;
    thisContent.jobLocation = content.jobLocation;
    thisContent.jobCity = content.jobCity;
    thisContent.jobProvince = content.jobProvince;
    thisContent.jobApplicantsSoFar = content.jobApplicantsSoFar;
    thisContent.jobUnitsToCloseHours = content.jobUnitsToCloseHours;
    thisContent.jobUnitsToCloseDays = content.jobUnitsToCloseDays;
    thisContent.jobUnitsToCloseMonths = content.jobUnitsToCloseMonths;
    thisContent.jobUntilClose = content.jobUntilClose;
    thisContent.jobTerm = content.jobTerm;
    thisContent.viewButton = content.viewButton;
    thisContent.jobSalaryRange = content.jobSalaryRange;
    thisContent.submitApplication = content.submitApplication;
    thisContent.step1 = content.step1;
    thisContent.step2 = content.step2;
    thisContent.step3 = content.step3;
    thisContent.review = content.review;
    thisContent.goToStep2 = content.goToStep2;
    thisContent.goToStep1 = content.goToStep1;
    thisContent.goToStep3 = content.goToStep3;
    thisContent.goToReview = content.goToReview;
    thisContent.createJobPosterWindowTitle = content.createJobPosterWindowTitle;
    thisContent.createProfileWindowTitle = content.createProfileWindowTitle;
    thisContent.required = content.required;
    thisContent.submit = content.submit;
    thisContent.generalInformation = content.generalInformation;
    thisContent.aboutMe = content.aboutMe;
    thisContent.aLittleBitAboutMe = content.aLittleBitAboutMe;
    thisContent.whatImMostProudOfInCareer = content.whatImMostProudOfInCareer;
    thisContent.position = content.position;
    thisContent.department = content.department;
    thisContent.branch = content.branch;
    thisContent.division = content.division;
    thisContent.leadershipStyle = content.leadershipStyle;
    thisContent.myLeadershipStyle = content.myLeadershipStyle;
    thisContent.myApproachToEmployee = content.myApproachToEmployee;
    thisContent.myExpectationsOfEmployees = content.myExpectationsOfEmployees;
    thisContent.myApproachToDecisionMaking = content.myApproachToDecisionMaking;
    thisContent.workExperience = content.workExperience;
    thisContent.education = content.education;
    thisContent.howOftenDoYouReview = content.howOftenDoYouReview;
    thisContent.howOftenDoYouStayLate = content.howOftenDoYouStayLate;
    thisContent.howOftenDoYouEngage = content.howOftenDoYouEngage;
    thisContent.howOftenDoYouApproveDevelopment = content.howOftenDoYouApproveDevelopment;
    thisContent.almostNever = content.almostNever;
    thisContent.rarely = content.rarely;
    thisContent.sometimes = content.sometimes;
    thisContent.usually = content.usually;
    thisContent.almostAlways = content.almostAlways;
    thisContent.name = content.name;
    thisContent.gctc = content.gctc;
    thisContent.at = content.at;
    thisContent.readMore = content.readMore;
    thisContent.canadaLink = content.canadaLink;
    thisContent.canadaLinkHref = content.canadaLinkHref;
    thisContent.taglineMain = content.taglineMain;
    thisContent.taglineSecondary = content.taglineSecondary;
    thisContent.taglineTertiary = content.taglineTertiary;
    thisContent.howItWorksHeading = content.howItWorksHeading;
    thisContent.howItWorksLead = content.howItWorksLead;
    thisContent.logoSrc = content.logoSrc;
    thisContent.ownYourStory = content.ownYourStory;
    thisContent.ownYourStoryText = content.ownYourStoryText;
    thisContent.getFound = content.getFound;
    thisContent.getFoundText = content.getFoundText;
    thisContent.contribute = content.contribute;
    thisContent.contributeText = content.contributeText;
    thisContent.howItWorksLeadOut = content.howItWorksLeadOut;
    thisContent.howItWorksLast = content.howItWorksLast;
    thisContent.contactUs = content.contactUs;
    thisContent.transcript = content.transcript;
    thisContent.ourTeam = content.ourTeam;
    thisContent.ourTeamText = content.ourTeamText;
    thisContent.browseTitle = content.browseTitle;
    thisContent.createJobApplicationWindowTitle = content.createJobApplicationWindowTitle;
    thisContent.createJobApplicationJobTitleLabel = content.createJobApplicationJobTitleLabel;
    thisContent.createJobApplicationConfirmationPositionLabel = content.createJobApplicationConfirmationPositionLabel;
    thisContent.jobApplicationConfirmationTrackingReminder = content.jobApplicationConfirmationTrackingReminder;
    thisContent.continueToDashboard = content.continueToDashboard;
    thisContent.announcement = content.announcement;
    thisContent.adminPortal = content.adminPortal;
    thisContent.applicantPortal = content.applicantPortal;
    thisContent.yourApplicationsTitle = content.yourApplicationsTitle;
    thisContent.workEnvironment = content.workEnvironment;
    thisContent.remoteLocationAllowed = content.remoteLocationAllowed;
    thisContent.teleworkAllowed = content.teleworkAllowed;
    thisContent.flexHoursAllowed = content.flexHoursAllowed;
    thisContent.yes = content.yes;
    thisContent.no = content.no;
    thisContent.physicalEnvironment = content.physicalEnvironment;
    thisContent.teamCulture = content.teamCulture;
    thisContent.teamSize = content.teamSize;
    thisContent.gcDirectoryLink = content.gcDirectoryLink;
    thisContent.teamSizePrompt = content.teamSizePrompt;
    thisContent.gcDirectoryLinkPrompt = content.gcDirectoryLinkPrompt;
    thisContent.teamNarrativePrompt = content.teamNarrativePrompt;
    thisContent.adminTagline = content.adminTagline;
    thisContent.adminAboutMe = content.adminAboutMe;
    thisContent.adminProfilePositionLabel = content.adminProfilePositionLabel;
    thisContent.adminProfileDepartmentLabel = content.adminProfileDepartmentLabel;
    thisContent.adminProfileBranchLabel = content.adminProfileBranchLabel;
    thisContent.jobReferenceId = content.jobReferenceId;
    thisContent.openEndedQuestions = content.openEndedQuestions;
    thisContent.skipNavText = content.skipNavtext;
    thisContent.managerProfile_review_option0 = content.managerProfile_review_option0;
    thisContent.managerProfile_review_option1 = content.managerProfile_review_option1;
    thisContent.managerProfile_review_option2 = content.managerProfile_review_option2;
    thisContent.managerProfile_review_option3 = content.managerProfile_review_option3;
    thisContent.managerProfile_review_option4 = content.managerProfile_review_option4;
    thisContent.managerProfile_stayLate_option0 = content.managerProfile_stayLate_option0;
    thisContent.managerProfile_stayLate_option1 = content.managerProfile_stayLate_option1;
    thisContent.managerProfile_stayLate_option2 = content.managerProfile_stayLate_option2;
    thisContent.managerProfile_stayLate_option3 = content.managerProfile_stayLate_option3;
    thisContent.managerProfile_stayLate_option4 = content.managerProfile_stayLate_option4;
    thisContent.managerProfile_engagement_option0 = content.managerProfile_engagement_option0;
    thisContent.managerProfile_engagement_option1 = content.managerProfile_engagement_option1;
    thisContent.managerProfile_engagement_option2 = content.managerProfile_engagement_option2;
    thisContent.managerProfile_engagement_option3 = content.managerProfile_engagement_option3;
    thisContent.managerProfile_engagement_option4 = content.managerProfile_engagement_option4;
    thisContent.managerProfile_developmentOpportunities_option0 = content.managerProfile_developmentOpportunities_option0;
    thisContent.managerProfile_developmentOpportunities_option1 = content.managerProfile_developmentOpportunities_option1;
    thisContent.managerProfile_developmentOpportunities_option2 = content.managerProfile_developmentOpportunities_option2;
    thisContent.managerProfile_developmentOpportunities_option3 = content.managerProfile_developmentOpportunities_option3;
    thisContent.managerProfile_developmentOpportunities_option4 = content.managerProfile_developmentOpportunities_option4;
    thisContent.managerProfile_acceptLowValueWorkRequests_option0 = content.managerProfile_acceptLowValueWorkRequests_option0;
    thisContent.managerProfile_acceptLowValueWorkRequests_option1 = content.managerProfile_acceptLowValueWorkRequests_option1;
    thisContent.managerProfile_acceptLowValueWorkRequests_option2 = content.managerProfile_acceptLowValueWorkRequests_option2;
    thisContent.managerProfile_acceptLowValueWorkRequests_option3 = content.managerProfile_acceptLowValueWorkRequests_option3;
    thisContent.managerProfile_acceptLowValueWorkRequests_option4 = content.managerProfile_acceptLowValueWorkRequests_option4;
    thisContent.managerDecisions_tipWhatis = content.managerDecisions_tipWhatis;
    thisContent.managerDecisions_tipSummary = content.managerDecisions_tipSummary;
    thisContent.profileBasicInfoEditTitle = content.profileBasicInfoEditTitle;
    thisContent.changeDisplayPic = content.changeDisplayPic;
    thisContent.updateProfilePhotoTitle = content.updateProfilePhotoTitle;
    thisContent.updateProfilePhotoDraggableAreaLabel = content.updateProfilePhotoDraggableAreaLabel;
    thisContent.updateProfilePhotoDraggableAreaErrorSize = content.updateProfilePhotoDraggableAreaErrorSize;
    thisContent.updateProfilePhotoDraggableAreaErrorType = content.updateProfilePhotoDraggableAreaErrorType;
    thisContent.updateProfileOrCopy = content.updateProfileOrCopy;
    thisContent.updateProfileChoosePhotoButtonLabelSpan = content.updateProfileChoosePhotoButtonLabelSpan;
    thisContent.updateProfileChoosePhotoButton = content.updateProfileChoosePhotoButton;
    thisContent.updateProfileChooseAltPhotoButtonLabelSpan = content.updateProfileChooseAltPhotoButtonLabelSpan;
    thisContent.updateProfileChooseAltPhotoButton = content.updateProfileChooseAltPhotoButton;
    thisContent.updateProfilePhotoCancelButton = content.updateProfilePhotoCancelButton;
    thisContent.profileBasicInfoEditCancel = content.profileBasicInfoEditCancel;
    thisContent.updateProfileApplicantProfileFormNameLabelSpan = content.updateProfileApplicantProfileFormNameLabelSpan;
    thisContent.profileEditName = content.profileEditName;
    thisContent.updateProfileApplicantProfileFormTaglineLabelSpan = content.updateProfileApplicantProfileFormTaglineLabelSpan;
    thisContent.profileEditTagline = content.profileEditTagline;
    thisContent.updateProfileApplicantProfileFormTwitterLabelSpan = content.updateProfileApplicantProfileFormTwitterLabelSpan;
    thisContent.profileEditTwitter = content.profileEditTwitter;
    thisContent.updateProfileApplicantProfileFormLinkedinLabelSpan = content.updateProfileApplicantProfileFormLinkedinLabelSpan;
    thisContent.profileEditLinkedin = content.profileEditLinkedin;
    thisContent.profileBasicInfoEditCancel = content.profileBasicInfoEditCancel;
    thisContent.profileBasicInfoEditSave = content.profileBasicInfoEditSave;
    thisContent.profilePicUploadBtn = content.profilePicUploadBtn;
    thisContent.loginFormTitle = content.loginFormTitle;
    thisContent.loginModalCopySpan = content.loginModalCopySpan;
    thisContent.switchToRegister = content.switchToRegister;
    thisContent.loginModalEmailLabelSpan = content.loginModalEmailLabelSpan;
    thisContent.login_email = content.login_email;
    thisContent.loginModalPasswordLabelSpan = content.loginModalPasswordLabelSpan;
    thisContent.login_password = content.login_password;
    thisContent.loginFormCancelBtn = content.loginFormCancelBtn;
    thisContent.loginFormLoginBtn = content.loginFormLoginBtn;
    thisContent.registerFormTitle = content.registerFormTitle;
    thisContent.profileAboutMeEditTitle = content.profileAboutMeEditTitle;
    thisContent.updateAboutTextareaLabelSpan = content.updateAboutTextareaLabelSpan;
    thisContent.profileEditAboutMe = content.profileEditAboutMe;
    thisContent.profileAboutMeEditCancel = content.profileAboutMeEditCancel;
    thisContent.profileAboutMeEditSave = content.profileAboutMeEditSave;
    thisContent.managerDecisions_tipWhatis = content.managerDecisions_tipWhatis;
    thisContent.managerDecisions_tipSummary = content.managerDecisions_tipSummary;
    thisContent.accommodationTextStart = content.accommodationTextStart;
    thisContent.accommodationTextEnd = content.accommodationTextEnd;
    thisContent.jobPosterKeyTasksLabel = content.jobPosterKeyTasksLabel;
    thisContent.jobPosterCoreCompetenciesLabel = content.jobPosterCoreCompetenciesLabel;
    thisContent.jobPosterDevelopingCompetenciesLabel = content.jobPosterDevelopingCompetenciesLabel;
    thisContent.jobPosterHiringManagerLabel = content.jobPosterHiringManagerLabel;
    thisContent.jobPosterClearanceLevelLabel = content.jobPosterClearanceLevelLabel;
    thisContent.jobPosterStartDateLabel = content.jobPosterStartDateLabel;
    thisContent.jobPosterJobLevelLabel = content.jobPosterJobLevelLabel;
    thisContent.jobPosterLanguageLabel = content.jobPosterLanguageLabel;
    thisContent.jobPosterTermLabel = content.jobPosterTermLabel;
    thisContent.save = content.save;
    thisContent.cancel = content.cancel;
    thisContent.editYour = content.editYour;
    thisContent.jobPosterTeamNarrativeText_label = content.jobPosterTeamNarrativeText_label;
    thisContent.jobPosterOperatingContext_label = content.jobPosterOperatingContext_label;
    thisContent.jobPosterWhatWeValue_label = content.jobPosterWhatWeValue_label;
    thisContent.jobPosterHowWeWork_label = content.jobPosterHowWeWork_label;
    thisContent.years = content.years;
    thisContent.status = content.status;
    thisContent.jobPosterBackButtonText = content.jobPosterBackButtonText;
    thisContent.termsAndConditions = content.termsAndConditions;
    thisContent.privacy = content.privacy;

    //if(siteContent){
        TalentCloudAPI.setContent(thisContent,isManager);
    //}

};

/**
 *
 * @param {type} locale
 * @returns {undefined}
 */
DataAPI.getJobs = function(locale, responseCallback){
    console.log("getting jobs");
    Utilities.debug?console.log("loading jobs"):null;
    locale = TalentCloudAPI.getLanguageFromCookie();
    var jobs_url = DataAPI.baseURL+"/"+locale+"/getAllJobs";
    console.log('Job URL:   ' + jobs_url);
    var getJobs_xhr = new XMLHttpRequest();
    if ("withCredentials" in getJobs_xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      getJobs_xhr.open("GET", jobs_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      getJobs_xhr = new XDomainRequest();
      getJobs_xhr.open("GET", jobs_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      getJobs_xhr = null;

    }

    getJobs_xhr.addEventListener("progress",
    function(evt){
        DataAPI.updateProgress(evt);
    },false);
    getJobs_xhr.addEventListener("load", function() {
        responseCallback(getJobs_xhr);
    },false);
    getJobs_xhr.addEventListener("error",DataAPI.transferFailed,false);
    getJobs_xhr.addEventListener("abort",DataAPI.transferAborted,false);

    getJobs_xhr.open('GET',jobs_url);
    getJobs_xhr.send(null);
};

DataAPI.getJobSeekers = function(locale){
    Utilities.debug?console.log("loading job seekers"):null;
    var jobSeekers_url = DataAPI.baseURL+"/getJobSeekers";
    getJobSeekers_xhr = new XMLHttpRequest();
    if ("withCredentials" in getJobSeekers_xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      getJobSeekers_xhr.open("GET", jobSeekers_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      getJobSeekers_xhr = new XDomainRequest();
      getJobSeekers_xhr.open("GET", jobSeekers_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      getJobSeekers_xhr = null;

    }

    getJobSeekers_xhr.addEventListener("progress",
    function(evt){
        DataAPI.updateProgress(evt);
    },false);
    getJobSeekers_xhr.addEventListener("load",function(evt){
        DataAPI.loadedManager(getJobSeekers_xhr.response);
    },false);
    getJobSeekers_xhr.addEventListener("error",DataAPI.transferFailed,false);
    getJobSeekers_xhr.addEventListener("abort",DataAPI.transferAborted,false);

    getJobSeekers_xhr.open('GET',jobSeekers_url);
    getJobSeekers_xhr.send(null);
};

DataAPI.getDepartments = function(locale){
    Utilities.debug?console.log("loading departments"):null;
    var departments_url = DataAPI.baseURL+"/"+locale+"/Lookup/department";
    getDepartments_xhr = new XMLHttpRequest();
    if ("withCredentials" in getDepartments_xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      getDepartments_xhr.open("GET", departments_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      getDepartments_xhr = new XDomainRequest();
      getDepartments_xhr.open("GET", departments_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      getDepartments_xhr = null;

    }

    getDepartments_xhr.addEventListener("progress",
    function(evt){
        DataAPI.updateProgress(evt);
    },false);
    getDepartments_xhr.addEventListener("load",
        function(evt){
            DataAPI.loadedManagerDepartments(getDepartments_xhr.response);
        },false);
    getDepartments_xhr.addEventListener("error",DataAPI.transferFailed,false);
    getDepartments_xhr.addEventListener("abort",DataAPI.transferAborted,false);

    getDepartments_xhr.open('GET',departments_url);
    getDepartments_xhr.send(null);
};

/**
 *
 * @param {int} user_id
 * @param {function} successfulResponseCallback - this will be called if the
 *  request comes back with readyState==4 and status==200
 * @return {undefined}
 */
DataAPI.getJobSeekerProfileByUserId = function(user_id, successfulResponseCallback){
    console.log("getJobSeekerProfileByUserId");
    Utilities.debug?console.log("loading job seekers"):null;
    var jobSeekers_url = DataAPI.baseURL+"/getJobSeekerProfileByUser/"+user_id;
    DataAPI.sendRequest(jobSeekers_url, "GET", {}, null, function(request) {
        if(request.readyState === 4 && request.status === 200){
            successfulResponseCallback(request.response);
        }
    });
};

/**
 *
 * @param {type} evt
 * @returns {undefined}
 */
DataAPI.updateProgress = function(evt){
    Utilities.debug?console.log(evt):null;
    if(evt.lengthComputable){
        var total = evt.total;
        var value = evt.loaded;

        Utilities.debug?console.log(total + "=" + value):null;

        var percentComplete = Math.ceil((evt.loaded / evt.total) * 100);
        //var loadingProgress = document.getElementById("loadingProgress");
        //loadingProgress.innerHTML = " " + percentComplete + "%";
    }
};

DataAPI.loadedManager = function(response){

    setTimeout(function(){
        JobSeekerAPI.populateJobSeekerObjects(JSON.parse(response));
        JobSeekerAPI.getJobSeekerCount();
    }
    ,1000);

};

DataAPI.loadedManagerDepartments = function(response){
    setTimeout(function(){
        DepartmentAPI.loadFromJSON(JSON.parse(response));
    }
    ,1000);
};

/**
 *
 * @returns {undefined}
 */
DataAPI.transferFailed = function(){
    NetworkErrorMessage();
};

/**
 *
 * @returns {undefined}
 */
DataAPI.transferAborted = function(){
};

/**
 *
 * @param {type} contactId
 * @returns {undefined}
 */
DataAPI.toggleFavourite = function(jobPostId){
    Utilities.debug?console.log("toggle Favourite contact"):null;
    var watchlist_url = DataAPI.baseURL+"/watchlist/toggle/"+jobPostId;
    var jsonData="";

    xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open("PUT", watchlist_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open("PUT", watchlist_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      xhr = null;

    }

    xhr.open('PUT',watchlist_url);
    xhr.setRequestHeader("Content-Type","application/json");

    xhr.addEventListener("progress",DataAPI.updateToggleProgress,false);
    xhr.addEventListener("load",function(){
        DataAPI.toggleFavouriteCallback(jobPostId);
    }
    ,false);
    xhr.addEventListener("error",DataAPI.transferFailed,false);
    xhr.addEventListener("abort",DataAPI.transferAborted,false);

    xhr.send(jsonData);
};

DataAPI.updateToggleProgress = function(evt){

};

/**
 *
 * @param {type} contact
 * @returns {undefined}
 */
DataAPI.toggleFavouriteCallback = function(contact){
        var updatedContact = JSON.parse(contact);
        //console.log(updatedContact);
        for(var i = 0; i < ContactAPI.contacts.length; i++) {
            var contactToUpdate = ContactAPI.contacts[i];
            if(contactToUpdate.id === updatedContact.id) {
                if(updatedContact.isFavourite){
                    //console.log("true");
                    contactToUpdate.isFavourite = true;
                }else{
                    //console.log("false");
                    contactToUpdate.isFavourite = false;
                }
                break;
            }
        };

    if(updatedContact.isFavourite){
        ContactAPI.updateFavourite(true, contactToUpdate.id);
    }else{
        ContactAPI.updateFavourite(false, contactToUpdate.id);
    }
};

/**
 *
 * @param {type} evt
 * @returns {undefined}
 */
DataAPI.updateToggleProgress = function(evt){

};

/**
 *
 * @param {type} contact
 * @returns {undefined}
 */
DataAPI.toggleFavouriteCallback = function(response,jobPostId){
    var jobPostToUpdate = document.getElementById("fav_"+jobPostId);
    if(jobPostToUpdate){
        JobPostAPI.updateFavourite(true, jobPostId);
    }else{
        JobPostAPI.updateFavourite(false, jobPostId);
    }
};

DataAPI.getCSRFTokenValue = function(){
    var csrfToken;

    Utilities.debug?console.log("delete contact"):null;
    var csrfToken_url = DataAPI.baseURL+"/delete/"+contactId;

    xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open("GET", csrfToken_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open("GET", csrfToken_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      xhr = null;

    }

    xhr.open('GET',csrfToken_url);
    //xhr.setRequestHeader("Content-Type","application/json");
    xhr.addEventListener("progress",DataAPI.updateProgress,false);
    xhr.addEventListener("load",function(){
        DataAPI.deleteContactCallback(contactId);
    }
    ,false);
    xhr.addEventListener("error",DataAPI.transferFailed,false);
    xhr.addEventListener("abort",DataAPI.transferAborted,false);

    xhr.send(null);

    return csrfToken;
};


/**
 *
 * @returns {undefined}
 */
DataAPI.getContactCount = function(){
    Utilities.debug?console.log("loading contacts"):null;
    var contacts_url = DataAPI.baseURL+"/count";

    xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open("GET", contacts_url);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open("GET", contacts_url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      xhr = null;

    }

    xhr.addEventListener("progress",
    function(evt){
        //DataAPI.updateProgress(evt);
    },false);
    xhr.addEventListener("load",function(){
        ContactAPI.updateContacts(xhr.responseText);
    }
    ,false);
    xhr.addEventListener("error",DataAPI.transferFailed,false);
    xhr.addEventListener("abort",DataAPI.transferAborted,false);

    xhr.open('GET',contacts_url);
    xhr.send(null);
};


DataAPI.getJobPoster = function(locale, jobId, responseCallback){
    Utilities.debug?console.log("loading job seekers"):null;
    var jobPoster_url = DataAPI.baseURL+"/"+locale+"/getJobPoster/"+jobId;
    DataAPI.sendRequest(jobPoster_url, 'GET', {}, null, function(request) {
        responseCallback(request.response);
    });
};

/**
 *
 * @param {String} url - the url endpoint of the request
 * @param {String} restMethod - 'GET', 'PUT', 'POST', or 'DELETE'
 * @param {String:String map} headersMap - Map of extra reuqest headers for the
 *      request. By default, Content-type and Accept are set to 'application/json',
 *      though this can be overridden with headersMap.
 * @param {Object} payload - the payload of the request
 * @param {function} requestCallback - this function will be called upon the'load'
 *      event, with the XMLHttpRequest as the single argument
 * @return {undefined}
 */
DataAPI.sendRequest = function(url, restMethod, headersMap, payload, requestCallback) {
    var request = new XMLHttpRequest();
    if ("withCredentials" in request) {
        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        request.open(restMethod, url);

    } else if (typeof XDomainRequest != "undefined") {
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        request = new XDomainRequest();
        request.open(restMethod, url);
    } else {
        // Otherwise, CORS is not supported by the browser.
        request = null;
        // TODO: indicate to user that browser is not supported
    }
    //Default to application/json if content-type not included in headersMap
    if (!headersMap['Content-type'] && !headersMap['Content-Type'])
        request.setRequestHeader("Content-type", "application/json");
    if (!headersMap['Accept'])
        request.setRequestHeader("Accept", "application/json");
    if (UserAPI.hasSessionUser()) {
        var authToken = UserAPI.getAuthToken();
        request.setRequestHeader("Authorization", "Bearer " + authToken);
    }
    //Set custom headers
    var keys = Object.keys(headersMap)
    for (var i=0; i<keys.length; i++) {
        request.setRequestHeader(keys[i], headersMap[keys[i]]);
    }

    request.addEventListener("progress", DataAPI.updateProgress, false);
    request.addEventListener("error", DataAPI.transferFailed, false);
    request.addEventListener("abort", DataAPI.transferAborted, false);
    request.addEventListener("load", function() {
        requestCallback(request);
    },false);

    request.send(payload);
};

DataAPI.getManagerProfile = function(userId, responseCallback) {
    var manager_profile_url = DataAPI.baseURL + "/getManagerProfile/"+userId;
    DataAPI.sendRequest(manager_profile_url, "GET", {}, null, function(request) {
        responseCallback(request.response);
    });
};

DataAPI.getUser = function(userId, responseCallback) {
    var user_url = DataAPI.baseURL + "/getManagerProfile/" + userId;
    DataAPI.sendRequest(user_url, "GET", {}, null, function(request) {
        responseCallback(request.response);
    });
};

/**
 *
 * @param {JobApplicationAPI.JobApplication} jobApplication
 * @param {function} responseCallback
 * @return {undefined}
 */
DataAPI.createJobApplication = function(jobApplication, requestCallback) {
    var url = DataAPI.baseURL + '/postJobApplication';
    DataAPI.sendRequest(url, "POST", {}, JSON.stringify(jobApplication), requestCallback);
};


DataAPI.saveJobApplicationByJobAndUser = function(jobApplication, jobPosterId, userId, requestCallback) {
    var url = [DataAPI.baseURL, "putApplicationForJob", jobPosterId, "forUser", userId].join("/");
    DataAPI.sendRequest(url, "PUT", {}, JSON.stringify(jobApplication), requestCallback);
};

DataAPI.getJobApplicationByJobAndUser = function(jobPosterId, userId, requestCallback) {
    var url = [DataAPI.baseURL, "getApplicationForJob", jobPosterId, "forUser", userId].join("/");
    DataAPI.sendRequest(url, "GET", {}, null, requestCallback);
};

DataAPI.submitJobApplication = function(applicationId, requestCallback) {
    var url = [DataAPI.baseURL, "submitJobApplication", applicationId].join("/");
    DataAPI.sendRequest(url, "POST", {}, null, requestCallback);
};

DataAPI.getFullJobApplicationByJobAndUser = function(jobPosterId, userId, requestCallback) {
    var locale = TalentCloudAPI.getLanguageFromCookie();
    var url = [DataAPI.baseURL, locale, "getFullApplicationForJob", jobPosterId, "forUser", userId].join("/");
    DataAPI.sendRequest(url, "GET", {}, null, requestCallback);
};
/**
 *
 * @param {int} managerProfileId
 * @param {CreateWorkEnvironment.WorkEnvironment} workplaceEnvironment
 * @param {function} responseCallback
 * @return {undefined}
 */
DataAPI.submitWorkplaceEnvironment = function(managerProfileId, workplaceEnvironment, responseCallback) {
    var url = DataAPI.baseURL + '/putWorkEnvironmentByManagerProfile/' + managerProfileId;
    DataAPI.sendRequest(url, "PUT", {}, JSON.stringify(workplaceEnvironment), function(request) {
        responseCallback(request.response);
    });
};

/**
 *
 * @param {int} managerProfileId
 * @param {function} responseCallback
 * @return {undefined}
 */
DataAPI.getWorkplaceEnvironment = function(managerProfileId, responseCallback) {
    var url = DataAPI.baseURL + '/getWorkEnvironmentByManagerProfile/' + managerProfileId;
    DataAPI.sendRequest(url, 'GET', {}, null, function(request) {
        responseCallback(request.response);
    });
};

DataAPI.getSkillDeclarationsForApplication = function(applicationId, requestCallback) {
    var url = [DataAPI.baseURL, "getDeclarationsForApplication", applicationId].join("/");
    DataAPI.sendRequest(url, "GET", {}, null, requestCallback);
};

DataAPI.saveSkillDeclaration = function(skillDeclaration, criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/putDeclarationForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'PUT', {}, JSON.stringify(skillDeclaration), requestCallback);
};

DataAPI.deleteSkillDeclaration = function(criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/deleteDeclarationForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'DELETE', {}, null, requestCallback);
};

DataAPI.getMicroReferencesForApplication = function(applicationId, requestCallback) {
    var locale = TalentCloudAPI.getLanguageFromCookie();
    var url = [DataAPI.baseURL, locale, "getAllMicroReferencesForApplication", applicationId].join("/");
    DataAPI.sendRequest(url, "GET", {}, null, requestCallback);
};

DataAPI.saveMicroReference = function(microReference, criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/putMicroReferenceForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'PUT', {}, JSON.stringify(microReference), requestCallback);
};

DataAPI.deleteMicroReference = function(criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/deleteMicroReferenceForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'DELETE', {}, null, requestCallback);
};

DataAPI.getSkillSamplesForApplication = function(applicationId, requestCallback) {
    var locale = TalentCloudAPI.getLanguageFromCookie();
    var url = [DataAPI.baseURL, locale, "getAllWorkSamplesForApplication", applicationId].join("/");
    DataAPI.sendRequest(url, "GET", {}, null, requestCallback);
};

DataAPI.saveSkillSample = function(skillSample, criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/putWorkSampleForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'PUT', {}, JSON.stringify(skillSample), requestCallback);
};

DataAPI.deleteSkillSample = function(criteriaId, applicationId, requestCallback) {
    var url = DataAPI.baseURL + "/deleteWorkSampleForApplication/" + applicationId + "/forCriteria/" + criteriaId;
    DataAPI.sendRequest(url, 'DELETE', {}, null, requestCallback);
};
