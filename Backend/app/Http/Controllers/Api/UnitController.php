<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Unit;

class UnitController extends Controller
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
        return ($id != null) ? getSingleRecord(Unit::class, $filters, $relationships) : getRecord(Unit::class, $filters, $relationships);
    }

    public function add(Request $request) {
        $error = [];
        if( !$request->has("unit_name") ) {
            $error[] = "Please provide unit name";
        }
        if( !$request->has("unit_abbr") ) {
            $error[] = "Please provide unit abbrevation";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return addRecord(Unit::class, $request->all());
    }

    public function update(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide unit id";
        }
        if( !$request->has("unit_name") ) {
            $error[] = "Please provide unit name";
        }
        if( !$request->has("unit_abbr") ) {
            $error[] = "Please provide unit abbrevation";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return updateRecord(Unit::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide unit id";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return deleteRecord(Unit::class, $request->id);
    }
}
