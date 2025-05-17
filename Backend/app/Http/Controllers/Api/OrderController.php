<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct(Request $request) {
        // Merge user ID for tracking who created the order
        if ($request->attributes->has('user')) {
            $request->merge(['created_by' => $request->attributes->get('user')->id]);
        }
        
        // Ensure branch ID is set
        if ($request->attributes->has('user') && !$request->has('branch_id')) {
            $request->merge(['branch_id' => $request->attributes->get('user')->branch_id]);
        }
    }
    
    /**
     * Get all orders or a specific order by ID
     */
    public function view(Request $request, $id = null)
    {
        $filters = [];
        $relationships = ['items.item', 'table', 'customer', 'createdBy'];
        
        if ($id) {
            $filters[] = [
                "column" => "id",
                "condition" => "=",
                "value" => $id
            ];
        }
        
        // Apply date range filters if provided
        if ($request->has('date_from') && $request->has('date_to')) {
            $filters[] = [
                "column" => "order_date",
                "condition" => ">=",
                "value" => $request->date_from . ' 00:00:00'
            ];
            
            $filters[] = [
                "column" => "order_date",
                "condition" => "<=",
                "value" => $request->date_to . ' 23:59:59'
            ];
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $filters[] = [
                "column" => "status",
                "condition" => "=",
                "value" => $request->status
            ];
        }
        
        // Filter by table if provided
        if ($request->has('table_id')) {
            $filters[] = [
                "column" => "table_id",
                "condition" => "=",
                "value" => $request->table_id
            ];
        }
        
        return ($id != null) ? 
            getSingleRecord(Order::class, $filters, $relationships) : 
            getRecord(Order::class, $filters, $relationships);
    }
    
    /**
     * Create a new order
     */
    public function add(Request $request)
    {
        // Validate basic order data
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'order_taker_id' => 'required|exists:users,id',
            'created_by' => 'required|exists:users,id',
            'table_id' => 'required|exists:tables,id',
            'customer_id' => 'nullable|exists:customers,id',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        
        
        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }
        
        try {
            
            // Calculate order totals
            $items = $request->items;
            $subtotal = 0;
            
            foreach ($items as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $itemTotal;
            }
            
            $discount = $request->discount ?? 0;
            $tax = $request->tax ?? 0;
            $total = $subtotal - $discount + $tax;

            $table = Table::find($request->table_id);
            
            // Create order
            $orderData = [
                'branch_id' => $request->branch_id,
                'table_id' => $request->table_id,
                'customer_id' => $request->customer_id,
                'created_by' => $request->created_by,
                'order_number' => Order::generateOrderNumber(),
                'order_date' => now(),
                'table_no' => $table->table_no,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'notes' => $request->notes,
                'order_taker_id' => (int)$request->order_taker_id
            ];
            
            $order = Order::create($orderData);
            
            // Create order items
            foreach ($items as $item) {
                $_item = Item::find($item['item_id']);
                $orderItem = [
                    'order_id' => $order->id,
                    'item_id' => $item['item_id'],
                    'item_name' => $_item->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'] ?? 0,
                    'total' => $item['quantity'] * $item['unit_price'] - ($item['discount'] ?? 0),
                    'notes' => $item['notes'] ?? null,
                ];
                
                OrderItem::create($orderItem);
            }
            
            // If table is specified, update table status to 'occupied'
            if ($request->has('table_id') && $request->table_id) {
                $table = Table::find($request->table_id);
                if ($table) {
                    $table->update(['status' => 'occupied']);
                }
            }
            
            // Fetch the complete order with relationships
            $order = Order::with(['items.item', 'table', 'customer', 'createdBy'])->find($order->id);
            
            return setApiResponse(1, "Order created successfully!", 200, $order);
        } catch (\Exception $e) {
            // Rollback transaction on error
            return setApiResponse(0, "Failed to create order!", 406, ["error" => $e->getMessage()]);
        }
    }
    
    /**
     * Update an existing order
     */
    public function update(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:orders,id',
            'items' => 'sometimes|required|array|min:1',
            'items.*.id' => 'sometimes|exists:order_items,id',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'table_id' => 'required|exists:tables,id',
            'order_taker_id' => 'required|exists:users,id',
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:pending,processing,completed,cancelled',
            'payment_status' => 'sometimes|in:unpaid,partially_paid,paid',
            'notes' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }
        
        try {
            // Start transaction
            DB::beginTransaction();
            
            $order = Order::find($request->id);
            
            if (!$order) {
                return setApiResponse(0, "Order not found!", 404);
            }
            
            // Handle table change
            if ($request->has('table_id') && $order->table_id != $request->table_id) {
                // If old table exists, update its status to available
                if ($order->table_id) {
                    $oldTable = Table::find($order->table_id);
                    if ($oldTable) {
                        $oldTable->update(['status' => 'available']);
                    }
                }
                
                // If new table exists, update its status to occupied
                if ($request->table_id) {
                    $newTable = Table::find($request->table_id);
                    if ($newTable) {
                        $newTable->update(['status' => 'occupied']);
                    }
                }
            }
            
            // Update order items if provided
            if ($request->has('items')) {
                // Delete existing order items
                OrderItem::where('order_id', $order->id)->delete();
                
                // Add new order items
                $items = $request->items;
                $subtotal = 0;
                
                foreach ($items as $item) {
                    $itemTotal = $item['quantity'] * $item['unit_price'] - ($item['discount'] ?? 0);
                    $subtotal += $itemTotal;
                    
                    $orderItem = [
                        'order_id' => $order->id,
                        'item_id' => $item['item_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'discount' => $item['discount'] ?? 0,
                        'total' => $itemTotal,
                        'notes' => $item['notes'] ?? null,
                    ];
                    
                    OrderItem::create($orderItem);
                }
                
                // Update order totals
                $discount = $request->discount ?? $order->discount;
                $tax = $request->tax ?? $order->tax;
                $total = $subtotal - $discount + $tax;
                
                $orderData = [
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total' => $total,
                ];
                
                $order->update($orderData);
            }
            
            // Update other order fields
            $updateData = $request->only([
                'table_id', 'customer_id', 'status', 'payment_status', 'notes'
            ]);
            
            $order->update($updateData);
            
            // Update table status if order is completed or cancelled
            if ($request->has('status') && in_array($request->status, ['completed', 'cancelled']) && $order->table_id) {
                $table = Table::find($order->table_id);
                if ($table) {
                    $table->update(['status' => 'available']);
                }
            }
            
            // Commit transaction
            DB::commit();
            
            // Fetch the updated order with relationships
            $order = Order::with(['items.item', 'table', 'customer', 'createdBy'])->find($order->id);
            
            return setApiResponse(1, "Order updated successfully!", 200, $order);
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            return setApiResponse(0, "Failed to update order!", 400, ["error" => $e->getMessage()]);
        }
    }
    
    /**
     * Delete an order
     */
    public function delete(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Order ID is required!", 400);
        }
        
        try {
            // Start transaction
            DB::beginTransaction();
            
            $order = Order::find($request->id);
            
            if (!$order) {
                return setApiResponse(0, "Order not found!", 404);
            }
            
            // Update table status if needed
            if ($order->table_id) {
                $table = Table::find($order->table_id);
                if ($table) {
                    $table->update(['status' => 'available']);
                }
            }
            
            // Soft delete order (this will keep history)
            $order->delete();
            
            // Commit transaction
            DB::commit();
            
            return setApiResponse(1, "Order deleted successfully!", 200);
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            return setApiResponse(0, "Failed to delete order!", 400, ["error" => $e->getMessage()]);
        }
    }
    
    /**
     * Get orders for a specific table
     */
    public function getTableOrders(Request $request, $tableId)
    {
        if (!$tableId) {
            return setApiResponse(0, "Table ID is required!", 400);
        }
        
        $filters = [
            [
                "column" => "table_id",
                "condition" => "=",
                "value" => $tableId
            ]
        ];
        
        // Filter by active orders only (pending or processing)
        if ($request->has('active_only') && $request->active_only) {
            $filters[] = [
                "column" => "status",
                "condition" => "in",
                "value" => ['pending', 'processing']
            ];
        }
        
        $relationships = ['items.item', 'customer', 'createdBy'];
        
        return getRecord(Order::class, $filters, $relationships);
    }
    
    /**
     * Get kitchen display system data
     */
    public function getKitchenOrders(Request $request)
    {
        // Get all pending and processing orders for the kitchen
        // $filters[] = [
        //     "column" => "status",
        //     "condition" => "in",
        //     "value" => ['pending', 'processing']
        // ];
        
        if ($request->has('branch_id')) {
            $filters[] = [
                "column" => "branch_id",
                "condition" => "=",
                "value" => $request->branch_id
            ];
        }
        
        $relationships = ['items.item', 'table', 'customer', 'createdBy'];
        
        return getRecord(Order::class, $filters, $relationships);
    }
    
    /**
     * Update order status (for kitchen display system)
     */
    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:orders,id',
            'status' => 'required|in:pending,processing,ready,completed,cancelled',
        ]);
        
        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }
        
        try {
            $order = Order::find($request->id);
            
            if (!$order) {
                return setApiResponse(0, "Order not found!", 404);
            }
            
            $order->status = $request->status;
            $order->save();
            
            // Update table status if order is completed or cancelled
            if (in_array($request->status, ['completed', 'cancelled']) && $order->table_id) {
                $table = Table::find($order->table_id);
                if ($table) {
                    $table->update(['status' => 'available']);
                }
            }
            
            return setApiResponse(1, "Order status updated successfully!", 200, $order);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update order status!", 400, ["error" => $e->getMessage()]);
        }
    }
    
    /**
     * Get orders summary/stats
     */
    public function getStats(Request $request)
    {
        try {
            $query = Order::query();
            
            // Apply date range filters if provided
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('order_date', [
                    $request->date_from . ' 00:00:00',
                    $request->date_to . ' 23:59:59'
                ]);
            } else {
                // Default to today if no date range specified
                $query->whereDate('order_date', today());
            }
            
            // Apply branch filter if provided
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }
            
            // Get counts by status
            $statusCounts = $query->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            
            // Get total sales
            $totalSales = $query->sum('total');
            
            // Get average order value
            $avgOrderValue = $query->avg('total') ?? 0;
            
            // Get count of orders
            $totalOrders = $query->count();
            
            $stats = [
                'total_orders' => $totalOrders,
                'total_sales' => $totalSales,
                'avg_order_value' => $avgOrderValue,
                'pending_orders' => $statusCounts['pending'] ?? 0,
                'processing_orders' => $statusCounts['processing'] ?? 0,
                'completed_orders' => $statusCounts['completed'] ?? 0,
                'cancelled_orders' => $statusCounts['cancelled'] ?? 0
            ];
            
            return setApiResponse(1, "Order statistics retrieved successfully!", 200, $stats);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve order statistics!", 400, ["error" => $e->getMessage()]);
        }
    }
}
