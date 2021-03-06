<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddExperienceEducationTypeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $types = [
            'diploma' => json_encode([
                'en' => 'Diploma',
                'fr' => 'Diplôme'
            ]),
            'bachelors' => json_encode([
                'en' => 'Bachelor\'s Degree',
                'fr' => 'Baccalauréat'
            ]),
            'masters' => json_encode([
                'en' => 'Master\'s Degree',
                'fr' => 'Maîtrise'
            ]),
            'phd' => json_encode([
                'en' => 'PhD',
                'fr' => 'Doctorat'
            ]),
            'post_doctoral' => json_encode([
                'en' => 'Post-doctoral Fellowship',
                'fr' => 'Bourse postdoctorale'
            ]),
            'online_course' => json_encode([
                'en' => 'Online Course',
                'fr' => 'Cours en ligne'
            ]),
            'certification' => json_encode([
                'en' => 'Certification',
                'fr' => 'Certification'
            ]),
            'other' => json_encode([
                'en' => 'Other',
                'fr' => 'Autre'
            ])
        ];

        Schema::create('education_types', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('key');
            $table->json('name');
            $table->timestamps();
        });

        foreach ($types as $key => $name) {
            DB::table('education_types')->insert([
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
        Schema::dropIfExists('education_types');
    }
}
