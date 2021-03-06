<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Criteria;
use App\Models\Degree;
use App\Models\JobApplication;
use App\Models\JobApplicationAnswer;
use App\Models\JobPoster;
use App\Models\Lookup\ApplicationStatus;
use App\Models\Lookup\CitizenshipDeclaration;
use App\Models\Lookup\PreferredLanguage;
use App\Models\Lookup\ReviewStatus;
use App\Models\Lookup\SecurityClearance;
use App\Models\Lookup\SkillStatus;
use App\Models\Lookup\VeteranStatus;
use App\Models\Skill;
use App\Models\SkillDeclaration;
use App\Models\WorkExperience;
use App\Services\Validation\ApplicationValidator;
use App\Services\Validation\Rules\GovernmentEmailRule;
use Facades\App\Services\WhichPortal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class ApplicationByJobController extends Controller
{
    /**
     * Display a listing of the applications for given jobPoster.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming JobPoster object.
     * @return \Illuminate\Http\Response
     */
    public function index(JobPoster $jobPoster)
    {
        $jobPoster->loadMissing(['criteria', 'talent_stream_category', 'job_skill_level']);

        $view = 'manager/review_applications';
        $jobTitle = $jobPoster->title;
        $disableCloneJs = false;
        if ($jobPoster->department_id === config('app.strategic_response_department_id')) {
            $view = 'response/screening/index';
            // Hacky workaround for Accordion JS firing on the screening page.
            $disableCloneJs = true;
            if ($jobPoster->talent_stream_category && $jobPoster->job_skill_level) {
                $jobTitle = $jobPoster->talent_stream_category->name . ' - ' . $jobPoster->job_skill_level->name;
            }
        }
        $applications = $jobPoster->submitted_applications()
            ->with([
                'veteran_status',
                'citizenship_declaration',
                'application_review',
                'applicant.user',
            ])
            ->get();

        $viewData = [
            // Localization Strings.
            'jobs_l10n' => Lang::get('manager/job_index'),
            'response' => Lang::get('response/screening'),
            // Data.
            'job' => new JsonResource($jobPoster),
            'response_job_title' => $jobTitle,
            'job_id' => $jobPoster->id,
            'is_hr_portal' => WhichPortal::isHrPortal(),
            'portal' => WhichPortal::isHrPortal() ? 'hr' : 'manager',
            'applications' => $applications,
            'review_statuses' => ReviewStatus::all(),
            'isHrAdvisor' => Auth::user()->isHrAdvisor(),
        ];

        if ($disableCloneJs) {
            $viewData['disable_clone_js'] = true;
        }

        return view($view, $viewData);
    }

    /**
     * Return the current applicant's application for a given Job Poster.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming JobPoster object.
     * @return mixed|\App\Models\JobApplication
     */
    protected function getApplicationFromJob(JobPoster $jobPoster)
    {
        $application = JobApplication::where('applicant_id', Auth::user()->applicant->id)
            ->where('job_poster_id', $jobPoster->id)->first();
        if ($application == null) {
            $application = new JobApplication();
            $application->job_poster_id = $jobPoster->id;
            $application->applicant_id = Auth::user()->applicant->id;
            $application->application_status_id = ApplicationStatus::where('name', 'draft')->firstOrFail()->id;
            $application->save();
            $application->attachSteps();
        }
        return $application;
    }

    /**
     * Show the form for editing Application basics for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function editBasics(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to view and update application.
        $this->authorize('view', $application);
        $this->authorize('update', $application);

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_01'
            : 'applicant/application_post_01';

        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 1,
                'application_template' => Lang::get('applicant/application_template'),
                'language_options' => PreferredLanguage::all(),
                'citizenship_options' => CitizenshipDeclaration::all(),
                'veteran_options' => VeteranStatus::all(),
                'security_clearance_options' => SecurityClearance::all(),
                'preferred_language_template' => Lang::get('common/preferred_language'),
                'citizenship_declaration_template' => Lang::get('common/citizenship_declaration'),
                'veteran_status_template' => Lang::get('common/veteran_status'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 1),
                // Job Data.
                'job' => $jobPoster,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application,
                // Submission.
                'form_submit_action' => route('job.application.update.1', $jobPoster),
                'gov_email_pattern' => GovernmentEmailRule::PATTERN
            ]
        );
    }

    /**
     * Show the form for editing Application Experience for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function editExperience(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to view and update application.
        $this->authorize('view', $application);
        $this->authorize('update', $application);

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_02'
            : 'applicant/application_post_02';

        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 2,
                'application_template' => Lang::get('applicant/application_template'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 2),
                // Job Data.
                'job' => $jobPoster,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application,
                // Submission.
                'form_submit_action' => route('job.application.update.2', $jobPoster)
            ]
        );
    }

    /**
     * Show the form for editing Application Essential Skills for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function editEssentialSkills(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to view and update application.
        $this->authorize('view', $application);
        $this->authorize('update', $application);

        $criteria = $jobPoster->criteria->filter(function ($value, $key) {
            return $value->criteria_type->name == 'essential'
                && $value->skill->skill_type->name == 'hard';
        });

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_03'
            : 'applicant/application_post_03';

        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 3,
                'application_template' => Lang::get('applicant/application_template'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 3),
                // Job Data.
                'job' => $jobPoster,
                // Skills Data.
                'skills' => Skill::all(),
                'skill_template' => Lang::get('common/skills'),
                'criteria' => $criteria,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application,
                // Submission.
                'form_submit_action' => route('job.application.update.3', $jobPoster)
            ]
        );
    }

    /**
     * Show the form for editing Application Asset Skills for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function editAssetSkills(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to view and update application.
        $this->authorize('view', $application);
        $this->authorize('update', $application);

        $criteria = $jobPoster->criteria->filter(function ($value, $key) {
            return $value->criteria_type->name == 'asset'
                && $value->skill->skill_type->name == 'hard';
        });


        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_04'
            : 'applicant/application_post_04';

        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 4,
                'application_template' => Lang::get('applicant/application_template'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 4),
                // Job Data.
                'job' => $jobPoster,
                // Skills Data.
                'skills' => Skill::all(),
                'skill_template' => Lang::get('common/skills'),
                'criteria' => $criteria,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application,
                // Submission.
                'form_submit_action' => route('job.application.update.4', $jobPoster)
            ]
        );
    }

    /**
     * Show the Application Preview for the application for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function preview(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        $this->authorize('view', $application);

        $essential_criteria = $jobPoster->criteria->filter(function ($value, $key) {
            return $value->criteria_type->name == 'essential'
                && $value->skill->skill_type->name == 'hard';
        });
        $asset_criteria = $jobPoster->criteria->filter(function ($value, $key) {
            return $value->criteria_type->name == 'asset'
                && $value->skill->skill_type->name == 'hard';
        });

        $skillDeclarations = $application->isDraft()
            ? $applicant->skill_declarations
            : $application->skill_declarations;
        $degrees = $application->isDraft()
            ? $applicant->degrees
            : $application->degrees;
        $courses = $application->isDraft()
            ? $applicant->courses
            : $application->courses;
        $work_experiences = $application->isDraft()
            ? $applicant->work_experiences
            : $application->work_experiences;
        $work_samples = $application->isDraft()
            ? $applicant->work_samples
            : $application->work_samples;

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_05'
            : 'applicant/application_post_05';
        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 5,
                'application_template' => Lang::get('applicant/application_template'),
                'preferred_language_template' => Lang::get('common/preferred_language'),
                'citizenship_declaration_template' => Lang::get('common/citizenship_declaration'),
                'veteran_status_template' => Lang::get('common/veteran_status'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 5),
                // Job Data.
                'job' => $jobPoster,
                // Skills Data.
                'skills' => Skill::all(),
                'skill_template' => Lang::get('common/skills'),
                'essential_criteria' => $essential_criteria,
                'asset_criteria' => $asset_criteria,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application,
                'skill_declarations' => $skillDeclarations,
                'degrees' => $degrees,
                'courses' => $courses,
                'work_experiences' => $work_experiences,
                'work_samples' => $work_samples,
                'is_manager_view' => WhichPortal::isManagerPortal(),
                'is_draft' => $application->application_status->name == 'draft',
            ]
        );
    }

    /**
     * Show the Confirm Submit page for the application for the specified job.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function confirm(JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        $this->authorize('update', $application);

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_06'
            : 'applicant/application_post_06';
        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_step' => 6,
                'application_template' => Lang::get('applicant/application_template'),
                'header' => [
                    'title' => $headerTitle,
                ],
                'custom_breadcrumbs' => $this->customBreadcrumbs($jobPoster, 6),
                // Used by tracker partial.
                'job' => $jobPoster,
                'job_application' => $application,
                // Submission.
                'form_submit_action' => route('job.application.submit', $jobPoster)
            ]
        );
    }

    /**
     * Show the application submission information.
     *
     * @param  \App\Models\JobPoster $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function complete(JobPoster $jobPoster)
    {
        // Include Applicant Data.
        $applicant = Auth::user()->applicant;
        // Include Application Data.
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to view application.
        $this->authorize('view', $application);

        $viewTemplate = $jobPoster->isInStrategicResponseDepartment()
            ? 'applicant/strategic_response_application/application_post_complete'
            : 'applicant/application_post_complete';

        $jobTitle = $jobPoster->isInStrategicResponseDepartment()
            ? "{$jobPoster->talent_stream_category->name} - {$jobPoster->job_skill_level->name}"
            : $jobPoster->title;
        $headerTitle = Lang::get('applicant/application_template')['title'] . ": {$jobTitle}";

        return view(
            $viewTemplate,
            [
                // Application Template Data.
                'application_template' => Lang::get('applicant/application_template'),
                'header' => [
                    'title' => $headerTitle,
                ],
                // Job Data.
                'job' => $jobPoster,
                // Applicant Data.
                'applicant' => $applicant,
                'job_application' => $application
            ]
        );
    }

    /**
     * Update the Application Basics in storage for the specified job.
     *
     * @param  \Illuminate\Http\Request $request   Incoming Request object.
     * @param  \App\Models\JobPoster    $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function updateBasics(Request $request, JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to update this application.
        $this->authorize('update', $application);

        $application->fill([
            'citizenship_declaration_id' => $request->input('citizenship_declaration_id'),
            'veteran_status_id' => $request->input('veteran_status_id'),
            'preferred_language_id' => $request->input('preferred_language_id'),
            'language_requirement_confirmed' => $request->input('language_requirement_confirmed', false),

            // The following fields are exclusive Strategic Talent Response applications.
            'director_name' => $request->input('director_name'),
            'director_title' => $request->input('director_title'),
            'director_email' => $request->input('director_email'),
            'reference_name' => $request->input('reference_name'),
            'reference_title' => $request->input('reference_title'),
            'reference_email' => $request->input('reference_email'),
            'gov_email' => $request->input('gov_email'),
            'physical_office_willing' => $request->input('physical_office_willing', false),
            'security_clearance_id' => $request->input('security_clearance_id'),
        ]);
        $application->save();

        $questions = $jobPoster->job_poster_questions;
        $questionsInput = $request->input('questions');
        foreach ($questions as $question) {
            $answer = null;
            if (isset($questionsInput[$question->id])) {
                $answer = $questionsInput[$question->id];
            }
            $answerObj = $application->job_application_answers
                ->firstWhere('job_poster_question_id', $question->id);
            if ($answerObj == null) {
                $answerObj = new JobApplicationAnswer();
                $answerObj->job_poster_question_id = $question->id;
                $answerObj->job_application_id = $application->id;
            }
            $answerObj->answer = $answer;
            $answerObj->save();
        }

        // Redirect to correct page.
        switch ($request->input('submit')) {
            case 'save_and_quit':
            case 'save_and_return':
                return redirect()->route('applications.index');
                break;
            case 'save_and_continue':
            case 'next':
                $next_step = $jobPoster->isInStrategicResponseDepartment() ? 3 : 2;
                return redirect()->route("job.application.edit.${next_step}", $jobPoster);
                break;
            default:
                return redirect()->back()->withInput();
        }
    }

    /**
     * Update the Application Basics in storage for the specified job.
     *
     * @param  \Illuminate\Http\Request $request   Incoming Request object.
     * @param  \App\Models\JobPoster    $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function updateExperience(Request $request, JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to update this application.
        $this->authorize('update', $application);

        // Record that the user has saved their experience for this application.
        $application->experience_saved = true;
        $application->save();

        $degrees = $request->input('degrees');

        $request->validate([
            'degrees.new.*.degree_type_id' => 'required',
            'degrees.new.*.area_of_study'  => 'required',
            'degrees.new.*.institution'    => 'required',
            'degrees.new.*.thesis'         => 'nullable',
            'degrees.new.*.start_date'     => 'required|date',
            'degrees.new.*.end_date'       => 'required|date',
            'degrees.new.*.blockcert_url'  => 'nullable|string',
        ]);

        // Save new degrees.
        if (isset($degrees['new'])) {
            foreach ($degrees['new'] as $degreeInput) {
                $degree = new Degree();
                $degree->fill([
                    'degree_type_id' => $degreeInput['degree_type_id'],
                    'area_of_study' => $degreeInput['area_of_study'],
                    'institution' => $degreeInput['institution'],
                    'thesis' => $degreeInput['thesis'],
                    'start_date' => $degreeInput['start_date'],
                    'end_date' => $degreeInput['end_date'],
                    'blockcert_url' => $degreeInput['blockcert_url'],
                ]);
                $applicant->degrees()->save($degree);
            }
        }

        // Update old degrees.
        if (isset($degrees['old'])) {
            foreach ($degrees['old'] as $id => $degreeInput) {
                // Ensure this degree belongs to this applicant.
                $degree = $applicant->degrees->firstWhere('id', $id);
                if ($degree != null) {
                    $degree->fill([
                        'degree_type_id' => $degreeInput['degree_type_id'],
                        'area_of_study' => $degreeInput['area_of_study'],
                        'institution' => $degreeInput['institution'],
                        'thesis' => $degreeInput['thesis'],
                        'start_date' => $degreeInput['start_date'],
                        'end_date' => $degreeInput['end_date'],
                        'blockcert_url' => $degreeInput['blockcert_url'],
                    ]);
                    $degree->save();
                } else {
                    Log::warning("Applicant $applicant->id attempted to update degree with invalid id: $id");
                }
            }
        }

        $courses = $request->input('courses');

        $request->validate([
            'courses.new.*.name'             => 'required',
            'courses.new.*.institution'      => 'required',
            'courses.new.*.course_status_id' => 'required',
            'courses.new.*.start_date'       => 'required|date',
            'courses.new.*.end_date'         => 'required|date',
        ]);

        // Save new courses.
        if (isset($courses['new'])) {
            foreach ($courses['new'] as $courseInput) {
                $course = new Course();
                $course->fill([
                    'name' => $courseInput['name'],
                    'institution' => $courseInput['institution'],
                    'course_status_id' => $courseInput['course_status_id'],
                    'start_date' => $courseInput['start_date'],
                    'end_date' => $courseInput['end_date']
                ]);
                $applicant->courses()->save($course);
            }
        }

        // Update old courses.
        if (isset($courses['old'])) {
            foreach ($courses['old'] as $id => $courseInput) {
                // Ensure this course belongs to this applicant.
                $course = $applicant->courses->firstWhere('id', $id);
                if ($course != null) {
                    $course->fill([
                        'name' => $courseInput['name'],
                        'institution' => $courseInput['institution'],
                        'course_status_id' => $courseInput['course_status_id'],
                        'start_date' => $courseInput['start_date'],
                        'end_date' => $courseInput['end_date']
                    ]);
                    $course->save();
                } else {
                    Log::warning("Applicant $applicant->id attempted to update course with invalid id: $id");
                }
            }
        }

        $work_experiences = $request->input('work_experiences');

        $request->validate([
            'work_experiences.new.*.role'        => 'required',
            'work_experiences.new.*.company'     => 'required',
            'work_experiences.new.*.description' => 'required',
            'work_experiences.new.*.start_date'  => 'required|date',
            'work_experiences.new.*.end_date'    => 'required|date',
        ]);

        // Save new work_experiences.
        if (isset($work_experiences['new'])) {
            foreach ($work_experiences['new'] as $workExperienceInput) {
                $workExperience = new WorkExperience();
                $workExperience->fill([
                    'role' => $workExperienceInput['role'],
                    'company' => $workExperienceInput['company'],
                    'description' => $workExperienceInput['description'],
                    'start_date' => $workExperienceInput['start_date'],
                    'end_date' => $workExperienceInput['end_date']
                ]);
                $applicant->work_experiences()->save($workExperience);
            }
        }

        // Update old work_experiences.
        if (isset($work_experiences['old'])) {
            foreach ($work_experiences['old'] as $id => $workExperienceInput) {
                // Ensure this work_experience belongs to this applicant.
                $workExperience = $applicant->work_experiences->firstWhere('id', $id);
                if ($workExperience != null) {
                    $workExperience->fill([
                        'role' => $workExperienceInput['role'],
                        'company' => $workExperienceInput['company'],
                        'description' => $workExperienceInput['description'],
                        'start_date' => $workExperienceInput['start_date'],
                        'end_date' => $workExperienceInput['end_date']
                    ]);
                    $workExperience->save();
                } else {
                    Log::warning("Applicant $applicant->id attempted to update work_experience with invalid id: $id");
                }
            }
        }

        // Redirect to correct page.
        switch ($request->input('submit')) {
            case 'save_and_quit':
                return redirect()->route('applications.index');
                break;
            case 'save_and_continue':
            case 'next':
                return redirect()->route('job.application.edit.3', $jobPoster);
                break;
            case 'save_and_return':
                return redirect()->route('job.application.edit.1', $jobPoster);
                break;
            default:
                return redirect()->back()->withInput();
        }
    }

    /**
     * Update the Application Essential Skills in storage for the specified job.
     *
     * @param  \Illuminate\Http\Request $request   Incoming Request object.
     * @param  \App\Models\JobPoster    $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function updateEssentialSkills(Request $request, JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to update this application.
        $this->authorize('update', $application);

        $skillDeclarations = $request->input('skill_declarations');
        $claimedStatusId = SkillStatus::where('name', 'claimed')->firstOrFail()->id;

        // Save new skill declarations.
        if (isset($skillDeclarations['new'])) {
            foreach ($skillDeclarations['new'] as $skillType => $typeInput) {
                foreach ($typeInput as $criterion_id => $skillDeclarationInput) {
                    $skillDeclaration = new SkillDeclaration();
                    $skillDeclaration->skill_id = Criteria::find($criterion_id)->skill->id;
                    $skillDeclaration->skill_status_id = $claimedStatusId;
                    $skillDeclaration->fill([
                        'description' => $skillDeclarationInput['description'],
                        'skill_level_id' => isset($skillDeclarationInput['skill_level_id']) ? $skillDeclarationInput['skill_level_id'] : null,
                    ]);
                    $applicant->skill_declarations()->save($skillDeclaration);

                    $referenceIds = $this->getRelativeIds($skillDeclarationInput, 'references');
                    $skillDeclaration->references()->sync($referenceIds);

                    $sampleIds = $this->getRelativeIds($skillDeclarationInput, 'samples');
                    $skillDeclaration->work_samples()->sync($sampleIds);
                }
            }
        }

        // Update old declarations.
        if (isset($skillDeclarations['old'])) {
            foreach ($skillDeclarations['old'] as $skillType => $typeInput) {
                foreach ($typeInput as $id => $skillDeclarationInput) {
                    // Ensure this declaration belongs to this applicant.
                    $skillDeclaration = $applicant->skill_declarations->firstWhere('id', $id);
                    if ($skillDeclaration != null) {
                        // skill_id and skill_status cannot be changed.
                        $skillDeclaration->fill([
                            'description' => $skillDeclarationInput['description'],
                            'skill_level_id' => isset($skillDeclarationInput['skill_level_id']) ? $skillDeclarationInput['skill_level_id'] : null,
                        ]);
                        $skillDeclaration->save();

                        $referenceIds = $this->getRelativeIds($skillDeclarationInput, 'references');
                        $skillDeclaration->references()->sync($referenceIds);

                        $sampleIds = $this->getRelativeIds($skillDeclarationInput, 'samples');
                        $skillDeclaration->work_samples()->sync($sampleIds);
                    } else {
                        Log::warning("Applicant $applicant->id attempted to update skill declaration with invalid id: $id");
                    }
                }
            }
        }

        // Redirect to correct page.
        switch ($request->input('submit')) {
            case 'save_and_quit':
                return redirect()->route('applications.index');
                break;
            case 'save_and_continue':
            case 'next':
                return redirect()->route('job.application.edit.4', $jobPoster);
                break;
            case 'save_and_return':
                return redirect()->route('job.application.edit.2', $jobPoster);
                break;
            default:
                return redirect()->back()->withInput();
        }
    }

    /**
     * Update the Application Asset Skills in storage for the specified job.
     *
     * @param  \Illuminate\Http\Request $request   Incoming Request object.
     * @param  \App\Models\JobPoster    $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function updateAssetSkills(Request $request, JobPoster $jobPoster)
    {
        $applicant = Auth::user()->applicant;
        $application = $this->getApplicationFromJob($jobPoster);

        // Ensure user has permissions to update this application.
        $this->authorize('update', $application);

        $skillDeclarations = $request->input('skill_declarations');
        $claimedStatusId = SkillStatus::where('name', 'claimed')->firstOrFail()->id;

        // Save new skill declarations.
        if (isset($skillDeclarations['new'])) {
            foreach ($skillDeclarations['new'] as $skillType => $typeInput) {
                foreach ($typeInput as $criterion_id => $skillDeclarationInput) {
                    $skillDeclaration = new SkillDeclaration();
                    $skillDeclaration->skill_id = Criteria::find($criterion_id)->skill->id;
                    $skillDeclaration->skill_status_id = $claimedStatusId;
                    $skillDeclaration->fill([
                        'description' => $skillDeclarationInput['description'],
                        'skill_level_id' => isset($skillDeclarationInput['skill_level_id']) ? $skillDeclarationInput['skill_level_id'] : null,
                    ]);
                    $applicant->skill_declarations()->save($skillDeclaration);

                    $referenceIds = $this->getRelativeIds($skillDeclarationInput, 'references');
                    $skillDeclaration->references()->sync($referenceIds);

                    $sampleIds = $this->getRelativeIds($skillDeclarationInput, 'samples');
                    $skillDeclaration->work_samples()->sync($sampleIds);
                }
            }
        }

        // Update old declarations.
        if (isset($skillDeclarations['old'])) {
            foreach ($skillDeclarations['old'] as $skillType => $typeInput) {
                foreach ($typeInput as $id => $skillDeclarationInput) {
                    // Ensure this declaration belongs to this applicant.
                    $skillDeclaration = $applicant->skill_declarations->firstWhere('id', $id);
                    if ($skillDeclaration != null) {
                        // skill_id and skill_status cannot be changed.
                        $skillDeclaration->fill([
                            'description' => $skillDeclarationInput['description'],
                            'skill_level_id' => isset($skillDeclarationInput['skill_level_id']) ? $skillDeclarationInput['skill_level_id'] : null,
                        ]);
                        $skillDeclaration->save();

                        $referenceIds = $this->getRelativeIds($skillDeclarationInput, 'references');
                        $skillDeclaration->references()->sync($referenceIds);

                        $sampleIds = $this->getRelativeIds($skillDeclarationInput, 'samples');
                        $skillDeclaration->work_samples()->sync($sampleIds);
                    } else {
                        Log::warning("Applicant $applicant->id attempted to update skill declaration with invalid id: $id");
                    }
                }
            }
        }

        // Redirect to correct page.
        switch ($request->input('submit')) {
            case 'save_and_quit':
                return redirect()->route('applications.index');
                break;
            case 'save_and_continue':
            case 'next':
                return redirect()->route('job.application.edit.5', $jobPoster);
                break;
            case 'save_and_return':
                return redirect()->route('job.application.edit.3', $jobPoster);
                break;
            default:
                return redirect()->back()->withInput();
        }
    }

    /**
     * Submit the Application for the specified job.
     *
     * @param  \Illuminate\Http\Request $request   Incoming Request object.
     * @param  \App\Models\JobPoster    $jobPoster Incoming Job Poster object.
     * @return \Illuminate\Http\Response
     */
    public function submit(Request $request, JobPoster $jobPoster)
    {
        $application = $this->getApplicationFromJob($jobPoster);

        // Only complete submission if submit button was pressed.
        if ($request->input('submit') == 'submit' && $application->application_status->name == 'draft') {
            // Ensure user has permissions to update this application.
            $this->authorize('update', $application);
            $request->validate([
                'submission_signature' => [
                    'required',
                    'string',
                    'max:191',
                ],
                'submission_date' => [
                    'required',
                    'string',
                    'max:191',
                ]
            ]);

            // Save any final info.
            $application->fill([
                'submission_signature' => $request->input('submission_signature'),
                'submission_date' => $request->input('submission_date'),
            ]);

            // Error out of this process now if application is not complete.
            $validator = new ApplicationValidator();

            $validatorInstance = $validator->validator($application);
            if (!$validatorInstance->passes()) {
                $userId = $application->applicant->user_id;
                $msg = "Application $application->id for user $userId is invalid for submission: " .
                    implode('; ', $validator->detailedValidatorErrors($application));
                Log::info($msg);
            }
            $validator->validate($application);

            // Change status to 'submitted'.
            $application->application_status_id = ApplicationStatus::where('name', 'submitted')->firstOrFail()->id;
            $application->saveProfileSnapshot();
        }

        $application->save();

        // Redirect to correct page.
        switch ($request->input('submit')) {
            case 'save_and_quit':
                return redirect()->route('applications.index');
                break;
            case 'submit':
                return redirect()->route('job.application.complete', $jobPoster);
                break;
            case 'save_and_return':
                return redirect()->route('job.application.edit.4', $jobPoster);
                break;
            default:
                return redirect()->back()->withInput();
        }
    }

    /**
     * Custom breadcrumbs for application process.
     *
     * @param  \App\Models\JobPoster $jobPoster        Incoming Job Poster object.
     * @param  string                $application_step Current step in application.
     * @return array
    */
    public function customBreadcrumbs(JobPoster $jobPoster, string $application_step)
    {
        $step_lang = Lang::get('applicant/application_template.tracker_label');
        return [
            'home' => route('home'),
            'jobs' => route('jobs.index'),
            $jobPoster->title => route('jobs.summary', $jobPoster),
            $step_lang . ' ' . $application_step => ''
        ];
    }
}
