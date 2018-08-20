<?php

/**
 * Created by Reliese Model.
 * Date: Thu, 12 Jul 2018 22:39:27 +0000.
 */

namespace App\Models\Lookup;

use App\Models\BaseModel;

/**
 * Class LanguageRequirement
 * 
 * @property int $id
 * @property string $name
 * @property \Jenssegers\Date\Date $created_at
 * @property \Jenssegers\Date\Date $updated_at
 * 
 * @property \Illuminate\Database\Eloquent\Collection $job_posters
 * @property \Illuminate\Database\Eloquent\Collection $language_requirement_translations
 * 
 * Localized Properties:
 * @property string $value
 */
class LanguageRequirement extends BaseModel {

    use \Dimsav\Translatable\Translatable;

    public $translatedAttributes = ['value'];
    protected $fillable = [];

    public function job_posters() {
        return $this->hasMany(\App\Models\JobPoster::class);
    }

    public function language_requirement_translations() {
        return $this->hasMany(\App\Models\Lookup\LanguageRequirementTranslation::class);
    }

}
