<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Table;

class TableController extends Controller
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

        return ($id != null) ? getSingleRecord(Table::class, $filters, $relationships) : getRecord(Table::class, $filters, $relationships);
    }

    public function add(Request $request)
    {
        $errors = [];
        if (!$request->has("table_no")) {
            $errors[] = "Please provide table number";
        }
        if (!$request->has("capacity")) {
            $errors[] = "Please provide table capacity";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        return addRecord(Table::class, $request->all());
        
    }

    public function update(Request $request)
    {
        $errors = [];
        if (!$request->has("id")) {
            $errors[] = "Please provide table id";
        }
        if (!$request->has("table_no")) {
            $errors[] = "Please provide table number";
        }
        if (!$request->has("capacity")) {
            $errors[] = "Please provide table capacity";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        return updateRecord(Table::class, $request->id, $request->all());
    }

    public function delete(Request $request)
    {
        $errors = [];
        if (!$request->has("id")) {
            $errors[] = "Please provide table id";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        return deleteRecord(Table::class, $request->id);
    }
}
