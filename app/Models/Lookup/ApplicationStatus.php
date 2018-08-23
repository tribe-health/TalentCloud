<?php

/**
 * Created by Reliese Model.
 * Date: Thu, 12 Jul 2018 22:39:27 +0000.
 */

namespace App\Models\Lookup;

use Reliese\Database\Eloquent\Model as Eloquent;

/**
 * Class ApplicationStatus
 *
 * @property int $id
 * @property string $name
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property \Illuminate\Database\Eloquent\Collection $application_status_translations
 * @property \Illuminate\Database\Eloquent\Collection $job_applications
 *
 * Localized Properties:
 * @property string $value
 */
class ApplicationStatus extends Eloquent
{

    use \Dimsav\Translatable\Translatable;

    protected $table = 'application_status';
    public $translatedAttributes = ['value'];
    protected $fillable = [];

    public function application_status_translations()
    {
        return $this->hasMany(\App\Models\Lookup\ApplicationStatusTranslation::class);
    }

    public function job_applications()
    {
        return $this->hasMany(\App\Models\JobApplication::class);
    }
}
