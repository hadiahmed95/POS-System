<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Branch;

class BranchController extends Controller
{
    public function view() {
        $filters = [];
        $relationships = [];
        return getRecord(Branch::class, $filters, $relationships);
    }

    public function add(Request $request) {
        if( !$request->has("branch_name") ) {
            return response()->json(["error" => "Please provide branch name"], 400);
        }
        return addRecord(Branch::class, $request->all());
    }

    public function update(Request $request) {
        $errors = [];
        if( !$request->has("id") ) {
            $errors[] = "Please provide branch id";
        }
        if( !$request->has("branch_name") ) {
            $errors[] = "Please provide branch name";
        }
        if( count($errors) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $errors);
        }
        return updateRecord(Branch::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        $errors = [];
        if( !$request->has("id") ) {
            $errors[] = "Please provide branch id";
        }
        if( count($errors) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $errors);
        }
        return deleteRecord(Branch::class, $request->id);
    }
}
