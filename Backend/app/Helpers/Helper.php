<?php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

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

if (!function_exists('getSingleRecord')) {
    function getSingleRecord(string $model, array $filter_data = [], array $with = []) {
        $record = $model::select('*');
        foreach( $filter_data as $filter ) {
            $record = $record -> where($filter["column"], $filter["condition"], $filter["value"]);
        }
        if( !empty($with) ) {
            $record = $record->with($with);
        }
        $record = $record -> first;
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
     * @param Model $model
     * @param array $data
     * @return Model
*/
if (!function_exists('addRecord')) {
    function addRecord($model_class, array $data) {
        $model = new $model_class;
        $response_data = $model->create($data);
        return setApiResponse(1, "Record added successfully!", 200, $response_data);
    }
}

/**
     * Edit an existing record.
     *
     * @param Model $model
     * @param int $id
     * @param array $data
     * @return bool
 */
if (!function_exists('updateRecord')) {
    function updateRecord($model_class, int $id, array $data) {
        $model = new $model_class;
        $record = $model->find($id);
        if ($record) {
            try {
                $record->update($data);
                return setApiResponse(1, "Record updated successfully!", 200, $data);
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