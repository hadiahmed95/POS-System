<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function view($id = null) {
        if($id != null) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $id
                ]
            ];
        }
        else {
            $filters = [
                [
                    "column" => "parent_id",
                    "condition" => "=",
                    "value" => null
                ]    
            ];
        }
        
        $relationships = ['children'];
        return ($id != null) ? getSingleRecord(Category::class, $filters, $relationships) : getRecord(Category::class, $filters, $relationships);
    }

    public function add(Request $request) {
        $error = [];
        if( !$request->has("cat_name") ) {
            $error[] = "Please provide category name";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return addRecord(Category::class, $request->all());
    }

    public function update(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide category id";
        }
        if( !$request->has("cat_name") ) {
            $error[] = "Please provide category name";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return updateRecord(Category::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        $error = [];
        if( !$request->has("id") ) {
            $error[] = "Please provide category id";
        }
        if( count($error) > 0 ) {
            return setApiResponse(0, "Please provide following valid data!", 400, $error);
        }
        return deleteRecord(Category::class, $request->id);
    }
}
