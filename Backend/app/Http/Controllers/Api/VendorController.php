<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vendor;

class VendorController extends Controller
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
        return ($id != null) ? getSingleRecord(Vendor::class, $filters, $relationships) : getRecord(Vendor::class, $filters, $relationships);
    }

    public function add(Request $request) {
        $error = [];
        if( !$request->has("vendor_name") ) {
            $error[] = "Please provide vendor name";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return addRecord(Vendor::class, $request->all());
    }

    public function update(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide vendor id";
        }
        if( !$request->has("vendor_name") ) {
            $error[] = "Please provide vendor name";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return updateRecord(Vendor::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide vendor id";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return deleteRecord(Vendor::class, $request->id);
    }
}
