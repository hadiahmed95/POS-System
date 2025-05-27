<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    public function view(Request $request, $id = null) {
        // $loggedin_user = $request->attributes->get("user");
        $filters = [
            [
                "column" => "id",
                "condition" => "!=",
                "value" => 1
            ]
        ];
        $relationships = ["branch", "role"];
        if ($id) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $id
                ]
            ];
        }
        return ($id != null) ? getSingleRecord(User::class, $filters, $relationships) : getRecord(User::class, $filters, $relationships);
    }

    public function add(Request $request) {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|integer',
            'role_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);
    
        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 422, $validator->errors());
        }

        $data = $request->all();
        $data['password'] = Hash::make($data['email'].$data['password']);
        $relationships = ["branch", "role"];
        return addRecord(User::class, $data, $relationships);
    }

    public function update(Request $request) {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|integer',
            'role_id' => 'required|integer',
            'name' => 'required|string|max:255'
        ]);
    
        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 422, $validator->errors());
        }

        $data = $request->all();
        if(isset($data['password'])) {
            $data['password'] = Hash::make($data['email'].$data['password']);
        }
        $relationships = ["branch", "role"];
        return updateRecord(User::class, $request->id, $request->all(), $relationships);
    }

    public function delete(Request $request) {
        return deleteRecord(User::class, $request->id);
    }

    public function getUserByToken(Request $request) {
        return get_user_by_token($request->token);
    }
}
