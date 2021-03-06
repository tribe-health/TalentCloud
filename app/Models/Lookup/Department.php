<?php

/**
 * Created by Reliese Model.
 * Date: Thu, 12 Jul 2018 22:39:27 +0000.
 */

namespace App\Models\Lookup;

use App\Models\BaseModel;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

/**
 * Class Department
 * @property int $id
 * @property int $parent_id
 * @property int $lft
 * @property int $rgt
 * @property int $depth
 * @property string $name
 * @property string $impact
 * @property string $preference
 * @property string $allow_indeterminate
 * @property string $is_partner
 * @property string $is_host
 *
 * @property \Jenssegers\Date\Date $created_at
 * @property \Jenssegers\Date\Date $updated_at
 *
 * @property \Illuminate\Database\Eloquent\Collection $job_posters
 * @property \Illuminate\Database\Eloquent\Collection $users
 *
 * Localized Properties:
 * @property string $name
 * @property string $impact
 * @property string $preference
 */
class Department extends BaseModel
{
    use CrudTrait;
    use HasTranslations;

    /**
     * @var $translatable string[]
     * */
    public $translatable = [
        'name',
        'impact',
        'preference',
    ];

    /**
     * @var $fillable string[]
     * */
    protected $fillable = [
        'name',
        'impact',
        'preference',
        'allow_indeterminate',
        'is_partner',
        'is_host',
    ];

    public function users() // phpcs:ignore
    {
        return $this->hasMany(\App\Models\User::class);
    }

    public function job_posters() // phpcs:ignore
    {
        return $this->hasMany(\App\Models\JobPoster::class);
    }
}
