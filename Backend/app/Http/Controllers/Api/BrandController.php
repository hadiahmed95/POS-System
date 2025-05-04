<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    public function view(Request $request, $id = null) {
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
        return ($id != null) ? getSingleRecord(Brand::class, $filters, $relationships) : getRecord(Brand::class, $filters, $relationships);
    }

    public function add(Request $request) {
        if( !$request->has("brand_name") ) {
            return setApiResponse(0, "Please provide brand name", 400);
        }
        return addRecord(Brand::class, $request->all());
    }

    public function update(Request $request) {
        $errors = [];
        if( !$request->has("id") ) {
            $errors[] = "Please provide brand id";
        }
        if( !$request->has("brand_name") ) {
            $errors[] = "Please provide brand name";
        }
        if( count($errors) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $errors);
        }
        return updateRecord(Brand::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        $errors = [];
        if( !$request->has("id") ) {
            $errors[] = "Please provide brand id";
        }
        if( count($errors) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $errors);
        }
        return deleteRecord(Brand::class, $request->id);
    }
}
