<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CopyDegreesAndCoursesToExperiencesEducation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $degrees = DB::table('degrees')->get();

        foreach ($degrees as $degree) {
            $status_id = DB::table('education_statuses')->where('key', 'complete_credited')->first()->id;

            if ($degree->blockcert_url) {
                $blockcert = true;
            } else {
                $blockcert = false;
            }

            DB::table('experiences_education')->insert([
                'education_type_id' => $degree->degree_type_id,
                'area_of_study' => $degree->area_of_study,
                'institution' => $degree->institution,
                'education_status_id' => $status_id,
                'thesis_title' => $degree->thesis,
                'start_date' => $degree->start_date,
                'end_date' => $degree->end_date,
                'experienceable_id' => $degree->degreeable_id,
                'experienceable_type' => $degree->degreeable_type,
                'has_blockcert' => $blockcert,
                'created_at' => $degree->created_at,
                'updated_at' => $degree->updated_at
            ]);
        }

        $courses = DB::table('courses')->get();

        foreach ($courses as $course) {
            $type_id = DB::table('education_types')->where('key', 'certification')->first()->id;
            $status_id = DB::table('education_statuses')->where('key', 'complete_credited')->first()->id;

            DB::table('experiences_education')->insert([
                'education_type_id' => $type_id,
                'area_of_study' => $course->name,
                'institution' => $course->institution,
                'education_status_id' => $status_id,
                'start_date' => $course->start_date,
                'end_date' => $course->end_date,
                'experienceable_id' => $course->courseable_id,
                'experienceable_type' => $course->courseable_type,
                'has_blockcert' => false,
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Cannot be reversed.
    }
}
