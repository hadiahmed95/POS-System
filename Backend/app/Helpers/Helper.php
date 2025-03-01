<?php
use Illuminate\Database\Eloquent\Model;
// use App\Models;

if (!function_exists('setApiResponse')) {
    function setApiResponse($status = "error", $message = "No data found!", $code = 200, $data = []) {
        return response()->json([
            "status" => $status == 0 ? "error" : "success",
            "message" => $message,
            "data" => $data
        ], $code);
    }
}

if (!function_exists('getRecord')) {
    function getRecord(string $model, array $filter_data = [], array $with = []) {
        $record = $model::select('*');
        foreach( $filter_data as $filter ) {
            $record = $record -> where($filter["column"], $filter["condition"], $filter["value"]);
        }
        if( !empty($with) ) {
            $record = $record->with($with);
        }
        $record = $record -> paginate(20);
        $record->page_links = $record->links();
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
    function addRecord($model, array $data) {
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
    function updateRecord($model, int $id, array $data) {
        $response_data = $model->create($data);
        return setApiResponse(1, "Record added successfully!", 200, $response_data);

        $record = $model->find($id);
        if ($record) {
            $response_data = $record->update($data);
            return setApiResponse(1, "Record updated successfully!", 200, $response_data);
        }
        return setApiResponse(0, "Something went wrong. Please try again!", 400);
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
    function deleteRecord($model, int $id) {
        $record = $model->find($id);
        if ($record) {
            $record->delete();
            setApiResponse(1, "Record deleted successfully!", 200);
        }
        setApiResponse(0, "Something went wrong. Please try again!", 400);
    }
}