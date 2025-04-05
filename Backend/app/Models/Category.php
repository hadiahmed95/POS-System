<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "cat_name",
        "parent_id"
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Subcategories Relationship (Recursive)
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->with('children') // Recursive Relationship
            ->whereNull('deleted_at'); // Exclude soft-deleted categories
    }
}
