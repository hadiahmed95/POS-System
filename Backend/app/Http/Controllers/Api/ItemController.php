<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\GroupedItem;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function __construct(Request $request) {
        $request->merge(['added_by' => $request->attributes->get('user')->id]);
    }

    public function view(Request $request, $id = null)
    {
        $filters = [];
        // Include groupedItems in the relationships
        $relationships = ['brand', 'unit', 'vendor', 'groupedItems.item'];
        
        if ($id) {
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $id
                ]
            ];
            
            return getSingleRecord(Item::class, $filters, $relationships);
        }
        
        return getRecord(Item::class, $filters, $relationships);
    }

    public function add(Request $request)
    {
        $errors = [];
        if (!$request->has("name")) {
            $errors[] = "Please provide item name";
        }
        if (!$request->has("brand_id")) {
            $errors[] = "Please provide brand id";
        }
        if (!$request->has("unit_id")) {
            $errors[] = "Please provide unit id";
        }
        if (!$request->has("vendor_id")) {
            $errors[] = "Please provide vendor id";
        }
        if (!$request->has("price")) {
            $errors[] = "Please provide item price";
        }
        if (!$request->has("barcode")) {
            $errors[] = "Please provide item barcode";
        }
        if (!$request->has("box_quantity")) {
            $errors[] = "Please provide box quantity";
        }
        
        // Check if it's a group item
        if ($request->has("item_type") && $request->item_type == "group") {
            if (!$request->has("grouped_items") || !is_array($request->grouped_items) || count($request->grouped_items) == 0) {
                $errors[] = "Please provide grouped items for group type item";
            }
        }
        
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        
        try {
            // Begin a database transaction
            DB::beginTransaction();
            
            // Add the main item
            $add_result = addRecord(Item::class, $request->except('grouped_items'));
            $response_data = json_decode($add_result->getContent(), true);
            
            if ($response_data['status'] !== 'success') {
                throw new \Exception($response_data['message']);
            }
            
            $item_id = $response_data['data']['id'];
            
            // If it's a group item, add the grouped items in bulk
            if ($request->has("item_type") && $request->item_type == "group" && $request->has("grouped_items")) {
                $grouped_items_data = [];
                
                foreach ($request->grouped_items as $grouped_item) {
                    if (!isset($grouped_item['item_id'])) {
                        throw new \Exception("Each grouped item must have an item_id");
                    }
                    
                    $grouped_items_data[] = [
                        'parent_item' => $item_id,
                        'item_id' => $grouped_item['item_id'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
                
                // Bulk insert all grouped items at once
                if (!empty($grouped_items_data)) {
                    $grouped_items_result = addRecord(GroupedItem::class, $grouped_items_data);
                    $grouped_items_response = json_decode($grouped_items_result->getContent(), true);
                    
                    if ($grouped_items_response['status'] !== 'success') {
                        throw new \Exception("Failed to add grouped items: " . $grouped_items_response['message']);
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Fetch the complete item with its relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $item_id
                ]
            ];
            $relationships = ['brand', 'unit', 'vendor', 'groupedItems.item'];
            $complete_result = getSingleRecord(Item::class, $filters, $relationships);
            $complete_data = json_decode($complete_result->getContent(), true);
            
            return setApiResponse(true, "Record added successfully!", 200, $complete_data['data']);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollBack();
            return setApiResponse(false, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
        }
    }

    public function update(Request $request)
    {
        $errors = [];
        if (!$request->has("id")) {
            $errors[] = "Please provide item id";
        }
        if (!$request->has("name")) {
            $errors[] = "Please provide item name";
        }
        if (!$request->has("brand_id")) {
            $errors[] = "Please provide brand id";
        }
        if (!$request->has("unit_id")) {
            $errors[] = "Please provide unit id";
        }
        if (!$request->has("vendor_id")) {
            $errors[] = "Please provide vendor id";
        }
        if (!$request->has("price")) {
            $errors[] = "Please provide item price";
        }
        if (!$request->has("barcode")) {
            $errors[] = "Please provide item barcode";
        }
        if (!$request->has("box_quantity")) {
            $errors[] = "Please provide box quantity";
        }
        
        // Check if it's a group item
        if ($request->has("item_type") && $request->item_type == "group") {
            if (!$request->has("grouped_items") || !is_array($request->grouped_items) || count($request->grouped_items) == 0) {
                $errors[] = "Please provide grouped items for group type item";
            }
        }
        
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        
        try {
            // Begin a database transaction
            DB::beginTransaction();
            
            // Update the main item
            $update_result = updateRecord(Item::class, $request->id, $request->except('grouped_items'));
            $response_data = json_decode($update_result->getContent(), true);
            
            if ($response_data['status'] !== 'success') {
                throw new \Exception($response_data['message']);
            }
            
            // If it's a group item, update the grouped items
            if ($request->has("item_type") && $request->item_type == "group" && $request->has("grouped_items")) {
                // Delete all existing grouped items in one operation
                GroupedItem::where('parent_item', $request->id)->delete();
                
                // Prepare data for bulk insert
                $grouped_items_data = [];
                
                foreach ($request->grouped_items as $grouped_item) {
                    if (!isset($grouped_item['item_id'])) {
                        throw new \Exception("Each grouped item must have an item_id");
                    }
                    
                    $grouped_items_data[] = [
                        'parent_item' => $request->id,
                        'item_id' => $grouped_item['item_id'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
                
                // Bulk insert all grouped items at once
                if (!empty($grouped_items_data)) {
                    $grouped_items_result = addRecord(GroupedItem::class, $grouped_items_data);
                    $grouped_items_response = json_decode($grouped_items_result->getContent(), true);
                    
                    if ($grouped_items_response['status'] !== 'success') {
                        throw new \Exception("Failed to add grouped items: " . $grouped_items_response['message']);
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Fetch the updated item with its relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $request->id
                ]
            ];
            $relationships = ['brand', 'unit', 'vendor', 'groupedItems.item'];
            $complete_result = getSingleRecord(Item::class, $filters, $relationships);
            $complete_data = json_decode($complete_result->getContent(), true);
            
            return setApiResponse(true, "Record updated successfully!", 200, $complete_data['data']);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollBack();
            return setApiResponse(false, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
        }
    }

    public function delete(Request $request)
    {
        $errors = [];
        if (!$request->has("id")) {
            $errors[] = "Please provide item id";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        
        try {
            // Begin a database transaction
            DB::beginTransaction();
            
            // Check if it's a group item
            $item = Item::find($request->id);
            
            if ($item && $item->item_type == 'group') {
                // Delete all grouped items in one operation
                GroupedItem::where('parent_item', $request->id)->delete();
            }
            
            // Delete the item
            $delete_result = deleteRecord(Item::class, $request->id);
            $response_data = json_decode($delete_result->getContent(), true);
            
            if ($response_data['status'] !== 'success') {
                throw new \Exception($response_data['message']);
            }
            
            // Commit the transaction
            DB::commit();
            
            return setApiResponse(true, "Record deleted successfully!", 200);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollBack();
            return setApiResponse(false, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
        }
    }

    public function restore(Request $request)
    {
        $errors = [];
        if (!$request->has("id")) {
            $errors[] = "Please provide item id";
        }
        if(count($errors) > 0) {
            return setApiResponse(false, "Please provide following valid data!", 400, $errors);
        }
        
        try {
            // Begin a database transaction
            DB::beginTransaction();
            
            // Restore the item
            $restore_result = restoreRecord(Item::class, $request->id);
            $response_data = json_decode($restore_result->getContent(), true);
            
            if ($response_data['status'] !== 'success') {
                throw new \Exception($response_data['message']);
            }
            
            // If it's a group item, restore the grouped items using the bulk restore helper
            $item = Item::withTrashed()->find($request->id);
            
            if ($item && $item->item_type == 'group') {
                $conditions = [
                    [
                        "column" => "parent_item",
                        "condition" => "=",
                        "value" => $request->id
                    ]
                ];
                
                $restore_result = restoreRecordsBulk(GroupedItem::class, $conditions);
                $restore_response = json_decode($restore_result->getContent(), true);
                
                if ($restore_response['status'] !== 'success') {
                    throw new \Exception("Failed to restore grouped items: " . $restore_response['message']);
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Fetch the restored item with its relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $request->id
                ]
            ];
            $relationships = ['brand', 'unit', 'vendor', 'groupedItems.item'];
            $complete_result = getSingleRecord(Item::class, $filters, $relationships);
            $complete_data = json_decode($complete_result->getContent(), true);
            
            return setApiResponse(true, "Record restored successfully!", 200, $complete_data['data']);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollBack();
            return setApiResponse(false, "Something went wrong. Please try again!", 400, ["error" => $e->getMessage()]);
        }
    }
}