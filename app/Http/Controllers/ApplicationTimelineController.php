<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Lang;

class ApplicationTimelineController extends Controller
{
    /**
     * Display job application.
     *
     * @param  \App\Models\JobApplication $application Incoming Application object.
     * @return \Illuminate\Http\Response
    */
    public function show(JobApplication $jobApplication, string $requestedStep = null)
    {
        $jobApplicationSteps = $jobApplication->jobApplicationSteps();
        $stepOrder = [
            'basic',
            'experience',
            'skills',
            'fit',
            'review',
            'submission'
        ];

        $lastTouchedStep = function () use ($stepOrder, $jobApplicationSteps) {
            $reversedStepOrder = array_reverse($stepOrder);
            foreach ($reversedStepOrder as $step) {
                if ($jobApplicationSteps[$step] === 'complete' ||
                    $jobApplicationSteps[$step] === 'error'
                ) {
                    return $step;
                }
            }

            return 'welcome';
        };

        if ($requestedStep === 'welcome') {
            return view('applicant/application-timeline-root')
                ->with([
                    'title' => $jobApplication->job_poster->title, // TODO: Check with design what the title should be.
                    'disable_clone_js' => true,
                ]);
        }

        if ($requestedStep !== null) {
            // Show the requested step if it has been touched before.
            // Else, redirect the user to the last touched step.
            // If no step has been touched, then take them to welcome step.
            if (array_key_exists($requestedStep, $jobApplicationSteps) &&
                ($jobApplicationSteps[$requestedStep] === 'complete' || $jobApplicationSteps[$requestedStep] === 'error')
            ) {
                return view('applicant/application-timeline-root')
                ->with([
                    'title' => $jobApplication->job_poster->title, // TODO: Check with design what the title should be.
                    'disable_clone_js' => true,
                ]);
            } else {
                return redirect(
                    route('applications.timeline.step', ['jobApplication' => $jobApplication, 'step' => $lastTouchedStep()])
                );
            }
        } else {
            // If no step has been entered (/application/id) then redirect user to the last touched step.
            // If no step has been touched, then take them to welcome step.
            return redirect(
                route('applications.timeline.step', ['jobApplication' => $jobApplication, 'step' => $lastTouchedStep()])
            );
        }
    }

    /**
     * Show the congrats page after application it's validated and submit.
     *
     * @param  \App\Models\JobApplication $jobApplication Incoming Job Application object.
     * @return \Illuminate\Http\Response
     */
    public function complete(JobApplication $jobApplication)
    {
        // Dummy Data.
        $applicant = $jobApplication->applicant;
        $jobPoster = $jobApplication->job_poster;

        return view(
            'applicant/application/congrats',
            [
                'applicant' => $applicant,
                'application' => $jobApplication,
                'application_template' => Lang::get(
                    'applicant/application_template',
                    ['security_clearance' => $jobPoster->security_clearance->value ]
                ),
                'jobPoster' => $jobPoster,
            ]
        );
    }
}
