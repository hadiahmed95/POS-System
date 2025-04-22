<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\UserHasRole;

class RolesPermissionController extends Controller
{
    public function viewRole(Request $request, $role_id = null) {
        $filters = [
            [
                "column" => "id",
                "condition" => "!=",
                "value" => 1
            ]
        ];
        $relationships = [];
        if ($role_id) {
            $filters[] = [
                "column" => "id",
                "condition" => "=",
                "value" => $role_id
            ];
        }
        return ($role_id != null) ? getSingleRecord(Role::class, $filters, $relationships) : getRecord(Role::class, $filters, $relationships);
    }

    public function addRole(Request $request) {
        return addRecord(Role::class, $request->all());
    }

    public function updateRole(Request $request) {
        return updateRecord(Role::class, $request->id, $request->all());
    }

    public function deleteRole(Request $request) {
        return deleteRecord(Role::class, $request->id);
    }

    public function viewModules(Request $request, $module_id = null) {
        $filters = [];
        $relationships = [];
        if ($module_id) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $module_id
                ]
            ];
        }
        return ($module_id != null) ? getSingleRecord(Module::class, $filters, $relationships) : getRecord(Module::class, $filters, $relationships);
    }

    public function viewPermissions(Request $request, $permission_id = null) {
        $filters = [];
        $relationships = [];
        if ($permission_id) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $permission_id
                ]
            ];
        }
        return ($permission_id != null) ? getSingleRecord(Permission::class, $filters, $relationships) : getRecord(Permission::class, $filters, $relationships);
    }

    public function viewUserPermissions(Request $request) {
        $filters = [
            [
                "column" => "role_id",
                "condition" => "!=",
                "value" => 1
            ],
            [
                "column" => "role_id",
                "condition" => "=",
                "value" => $request -> role_id
            ]
        ];
        $relationships = ["module", "permission"];
        $permissions = [];
        $get_permissions = getRecord(UserHasRole::class, $filters, $relationships, false);
        $decoded_data = json_decode($get_permissions->getContent(), true)['data'];
        foreach($decoded_data as $data) {
            $permissions[$data["module"]["module_slug"]][$data["permission"]["permission_slug"]] = $data["is_allowed"];
        }
        return setApiResponse(1, "Record fetched successfully", 200, $permissions);
    }

    public function addUserPermissions(Request $request) {
        return addRecord(UserHasRole::class, $request->all());
    }

    public function updateUserPermissions(Request $request) {
        return updateRecord(UserHasRole::class, $request->id, $request->all());
    }

    public function deleteUserPermissions(Request $request) {
        return deleteRecord(UserHasRole::class, $request->id);
    }
}
