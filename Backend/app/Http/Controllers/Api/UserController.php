<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function view(Request $request) {
        // $loggedin_user = $request->attributes->get("user");
        $filters = [
            [
                "column" => "id",
                "condition" => "=",
                "value" => 1
            ]
        ];
        return getRecord(User::class, $filters, ["branch", "role", "permissions"]);
    }

    public function add(Request $request) {
        return addRecord(User::class, $request->all());
    }

    public function update(Request $request) {
        return updateRecord(User::class, $request->id, $request->all());
    }

    public function delete(Request $request) {
        return deleteRecord(User::class, $request->id);
    }
}
