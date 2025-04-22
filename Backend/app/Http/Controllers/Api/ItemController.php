<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{
    public function __construct(Request $request) {
        $request->merge(['added_by' => $request->attributes->get('user')->id]);
    }

    public function view(Request $request, $id = null)
    {
        $filters = [];
        $relationships = [];
        if ($id) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $id
                ]
            ];
        }

        return ($id != null) ? getSingleRecord(Item::class, $filters, $relationships) : getRecord(Item::class, $filters, $relationships);
    }

    public function add(Request $request)
    {
        $errors = [];
        if (!$request->has("cat_id")) {
            $errors[] = "Please provide item category id";
        }
        if (!$request->has("price")) {
            $errors[] = "Please provide item price";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        return addRecord(Item::class, $request->all());
        if (!$request->has("name")) {
            $errors[] = "Please provide item name";
        }
        if (!$request->has("price")) {
            $errors[] = "Please provide item price";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        return addRecord(Item::class, $request->all());
    }

    public function update(Request $request)
    {
        // Add your logic for updating an item here
    }

    public function delete(Request $request, $id)
    {
        // Add your logic for deleting an item here
    }

    public function restore(Request $request, $id)
    {
        // Add your logic for restoring an item here
    }
}
