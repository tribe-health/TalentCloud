<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddExperienceEducationStatusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $statuses = [
            'complete_credited' => json_encode([
                'en' => 'Complete (credential awarded)',
                'fr' => 'Terminé (titre de compétences décerné)'
            ]),
            'complete_uncredited' => json_encode([
                'en' => 'Complete (no credential awarded)',
                'fr' => 'Terminé (aucun titre de compétences décerné)'
            ]),
            'in_progress' => json_encode([
                'en' => 'In progress',
                'fr' => 'En cours'
            ]),
            'audited' => json_encode([
                'en' => 'Audited',
                'fr' => 'Audité'
            ]),
            'incomplete' => json_encode([
                'en' => 'Incomplete',
                'fr' => 'Incomplet'
            ])
        ];

        Schema::create('education_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('key');
            $table->json('name');
            $table->timestamps();
        });

        foreach ($statuses as $key => $name) {
            DB::table('education_statuses')->insert([
                'key' => $key, 'name' => $name
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
        Schema::dropIfExists('education_statuses');
    }
}
