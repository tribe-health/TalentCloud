<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class InitializeJobPosterStatusOnJobPosters extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $reviewId = DB::table('job_poster_status')->where('name', 'review_hr')->first()->id;
        $readyId = DB::table('job_poster_status')->where('name', 'ready')->first()->id;
        $liveId = DB::table('job_poster_status')->where('name', 'live')->first()->id;
        $assessmentId = DB::table('job_poster_status')->where('name', 'assessment')->first()->id;

        $now = Date::now();

        // If open date has not been reach, 'published' poster becomes 'ready'.
        DB::table('job_posters')->whereNotNull('published_at')
            ->where('open_date_time', '>=', $now)
            ->update(['job_poster_status_id' => $readyId]);
        // If the close date has passed, 'published' poster becomes 'assessment'.
        DB::table('job_posters')->whereNotNull('published_at')
            ->where('close_date_time', '<=', $now)
            ->update(['job_poster_status_id' => $assessmentId]);
        // All remaining 'published' posters are live.
        DB::table('job_posters')->whereNotNull('published_at')
            ->update(['job_poster_status_id' => $liveId]);

        DB::table('job_posters')->whereNull('published_at')->whereNotNull('review_requested_at')->update(['job_poster_status_id' => $reviewId]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $draftId = DB::table('job_poster_status')->where('name', 'draft')->first()->id;
        DB::table('job_posters')->update(['job_poster_status_id' => $draftId]);
    }
}
