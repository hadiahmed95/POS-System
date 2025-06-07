<?php

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\UserHasRole;

if (!function_exists('checkInternetConnection')) {
    function checkInternetConnection() {
        try {
            $response = Http::get('https://www.google.com');
            return true;
        }
        catch (\Exception $e) {
            return false;
        }
    }
}

if (!function_exists('checkDatabaseConnection')) {
    function checkDatabaseConnection() {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}

if (!function_exists('setApiResponse')) {
    function setApiResponse($status = 0, $message = "No data found!", $code = 200, $data = []) {
        return response()->json([
            "status" => $status == 0 ? "error" : "success",
            "message" => $message,
            "data" => $data
        ], $code);
    }
}

if (!function_exists('getPermissions')) {
    function getPermissions($role_id) {
        $filters = [
            [
                "column" => "role_id",
                "condition" => "=",
                "value" => $role_id
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
}

if (!function_exists('getSingleRecord')) {
    function getSingleRecord(string $model, array $filter_data = [], array $with = []) {
        $record = $model::select('*');
        foreach( $filter_data as $filter ) {
            $record = $record -> where($filter["column"], $filter["condition"], $filter["value"]);
        }
        if( !empty($with) ) {
            $record = $record->with($with);
        }
        $record = $record -> first();
        if( !$record ) {
            return setApiResponse(0, "No record found!", 400);
        }
        $response = setApiResponse(1, "Record fetched successfully!", 200, $record);
        return $response;
    }
}

if (!function_exists('getRecord')) {
    function getRecord(string $model, array $filter_data = [], array $with = [], $paginate = true, $records_per_page = 20) {
        $record = $model::select('*');
        foreach( $filter_data as $filter ) {
            $record = $record -> where($filter["column"], $filter["condition"], $filter["value"]);
        }
        if( !empty($with) ) {
            $record = $record->with($with);
        }
        $record = ($paginate) ? $record -> paginate($records_per_page) : $record -> get();
        $record->page_links = ($paginate) ? $record->links() : [];
        $response = setApiResponse(1, "Record fetched successfully!", 200, $record);
        return $response;
    }
}

/**
 * Add a new record to the database.
 *
 * @param Model $model_class
 * @param array $data
 * @return \Illuminate\Http\JsonResponse
 */
if (!function_exists('addRecord')) {
    function addRecord($model_class, array $data, array $with = []) {
        try {
            $model = new $model_class;
            $processedData = $data;
            
            // Get model name for folder structure
            $modelName = strtolower(class_basename($model_class));
            
            // Process any file uploads
            foreach ($data as $key => $value) {
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    // Store the file in model-specific directory
                    $path = $value->store("uploads/{$modelName}", 'public');
                    // Replace the file object with the file path
                    $processedData[$key] = $path;
                }
            }
            
            // Insert method works for both single and multiple records
            $inserted = $model::insertGetId($processedData);
            
            $record = $model;
            if( !empty($with) ) {
                $record = $record->with($with);
            }
            $record = $record->find($inserted);
            
            if ($inserted) {
                return setApiResponse(1, "Record added successfully!", 200, $record);
            } else {
                return setApiResponse(0, "Failed to add record(s)!", 400);
            }
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to add record(s)!", 400, ["error" => $e->getMessage()]);
        }
    }
}

/**
 * Edit an existing record.
 *
 * @param Model $model
 * @param int $id
 * @param array $data
 * @return \Illuminate\Http\JsonResponse
 */
if (!function_exists('updateRecord')) {
    function updateRecord($model_class, int $id, array $data, array $with = []) {
        $model = new $model_class;
        $record = $model->find($id);
        if ($record) {
            try {
                $processedData = $data;
                
                // Get model name for folder structure
                $modelName = strtolower(class_basename($model_class));
                
                // Process any file uploads
                foreach ($data as $key => $value) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        // If there's an existing file, delete it
                        if (!empty($record->$key)) {
                            // Get the full path to the file in public storage
                            $fullPath = public_path('storage/' . $record->$key);
                            
                            // Delete the file if it exists
                            if (file_exists($fullPath)) {
                                unlink($fullPath);
                            }
                        }
                        
                        // Store the new file in model-specific directory
                        $path = $value->store("uploads/{$modelName}", 'public');
                        
                        // Replace the file object with the file path
                        $processedData[$key] = $path;
                    }
                }
                
                $record->update($processedData);

                if( !empty($with) ) {
                    $record = $model->with($with)->find($id);
                }

                return setApiResponse(1, "Record updated successfully!", 200, $record);
            }
            catch (\Exception $e) {
                return setApiResponse(0, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
            }
        }
        return setApiResponse(0, "No record found!", 400);
    }
}

/**
     * Delete a record from the database.
     *
     * @param Model $model
     * @param int $id
     * @return bool|null
 */
if (!function_exists('deleteRecord')) {
    function deleteRecord($model_class, int $id) {
        $model = new $model_class;
        $record = $model->find($id);
        if ($record) {
            try {
                $record->delete();
                return setApiResponse(1, "Record deleted successfully!", 200);
            }
            catch (\Exception $e) {
                return setApiResponse(0, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
            }
        }
        return setApiResponse(0, "No record found or the record had already deleted!", 400);
    }
}

/**
 * Restore a soft-deleted record.
 *
 * @param string $model_class
 * @param int $id
 * @return \Illuminate\Http\JsonResponse
 */
if (!function_exists('restoreRecord')) {
    function restoreRecord($model_class, int $id) {
        $model = new $model_class;
        $record = $model->withTrashed()->find($id);
        
        if ($record) {
            try {
                $record->restore();
                return setApiResponse(1, "Record restored successfully!", 200);
            }
            catch (\Exception $e) {
                return setApiResponse(0, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
            }
        }
        return setApiResponse(0, "No record found or the record is not deleted!", 400);
    }
}

/**
 * Restore multiple soft-deleted records that match a condition.
 *
 * @param string $model_class
 * @param array $conditions Array of condition arrays [['column' => 'x', 'condition' => '=', 'value' => 'y']]
 * @return \Illuminate\Http\JsonResponse
 */
if (!function_exists('restoreRecordsBulk')) {
    function restoreRecordsBulk($model_class, array $conditions) {
        $model = new $model_class;
        $query = $model->withTrashed();
        
        foreach ($conditions as $condition) {
            $query->where($condition['column'], $condition['condition'], $condition['value']);
        }
        
        try {
            $query->update(['deleted_at' => null]);
            return setApiResponse(1, "Records restored successfully!", 200);
        }
        catch (\Exception $e) {
            return setApiResponse(0, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
        }
    }
}

if (!function_exists('get_user_by_token')) {
    function get_user_by_token($token) {
        $user = User::where("token", $token)->first();
        if (!$user) {
            return setApiResponse(0, "Invalid token!", 400);
        }

        $permissions = UserHasRole::with('module')->where('role_id', $user->role_id)->get();
        return setApiResponse(1, "Record fetched successfully", 200, [
            'user' => $user,
            'permissions' => $permissions
        ]);
    }
}