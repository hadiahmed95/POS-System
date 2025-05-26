
interface IrouteList {
    type?: 'group' | 'route'
    icon?: React.JSX.Element | null;
    title: string;
    active?: boolean;
    children?: IrouteList[] | undefined;
    url?: string
    slug?: string
}

interface IUser {
    id?: number;
    branch_id: string;
    role_id: string;
    name: string;
    email: string
    phone: string
}

interface IBranch {
    id?: string
    branch_name: string
    branch_address: string
    branch_description: string
    branch_phone: string
}

interface IRole {
    id?: string
    role_name: string
    permissions: any[]
}

interface IBrand {
    id?: string
    brand_name: string
}

interface IUnit {
    id?: string
    unit_name: string
    unit_abbr: string
}

interface IVendor {
    id?: string
    vendor_name: string
    vendor_address: string
    vendor_phone: string
    vendor_description: string
}

interface ICategory {
    id?: string | number
    cat_name: string
    parent_id: string
    children?: ICategory[]
    created_at?: string
    updated_at?: string
}

interface IItem {
    id?: string | number
    cat_id: number
    added_by?: string
    image: string
    name: string
    barcode?: string
    old_barcode?: string
    sku?: string
    description?: string
    available: string | number
    price: number,
    box_quantity: number
    item_type: 'single' | 'group'
    grouped_items: any[]
}

type TableType = 'indoor' | 'outdoor'
type TableStatus = 'available' | 'reserved' | 'occupied'

interface ITable {
    id?: string | number
    table_no: string
    capacity: string
    type: TableType
    status: TableStatus
    added_by: number
    created_at?: string
    updated_at?: string
}

type CustomerType = 'walkin' | 'online' | 'other'
interface ICustomer {
    id?: string
    name: string
    email: string
    phone: string
    licence_plate: string
    customer_type: CustomerType
    created_at?: Date
    updated_at?: Date
}

interface IModule {
    id?: number
    module_name: string
    module_slug: string
    created_at?: Date
    updated_at?: Date
}

interface IPermissions {
    id?: number
    permission_name: string
    permission_slug: string
    created_at?: Date
    updated_at?: Date
}

interface IOrderItem {
    id?: number | string;
    order_id?: number | string;
    item_id: number | string;
    item_name: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    total?: number;
    notes?: string;
    variation_name?: string;
    variation_id?: number | string;
}

type OrderStatusType = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
interface IOrder {
    id?: number | string;
    branch_id?: number | string;
    table_id?: number | string;
    customer_id?: number | string;
    created_by?: number | string;
    order_taker_id?: number | string;
    order_number: string;
    order_date?: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    total_amount?: number; // For frontend display
    status: OrderStatusType;
    payment_status?: 'unpaid' | 'partially_paid' | 'paid';
    notes?: string;
    items: IOrderItem[];
    table?: ITable;
    items_count?: number;
    customer_name?: string;
    table_no?: string;
    preparation_time?: number; // For kitchen display
    kitchen_status?: OrderStatusType; // For kitchen display
    preparation_started_at?: string; // For kitchen display
    created_at: string;
    updated_at?: string;
}

// Order statistics interface
interface IOrderStats {
    total_orders: number;
    total_sales: number;
    avg_order_value: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

// Order report data interface
interface IOrderReport {
    date: string;
    total_orders: number;
    total_sales: number;
    avg_order_value: number;
} 

export type {
    IrouteList,
    IUser,
    IBranch,
    IRole,
    IBrand,
    IUnit,
    IVendor,
    ICategory,
    IItem,
    ITable,
    ICustomer,
    IPermissions,
    IModule,
    IOrderItem,
    OrderStatusType,
    IOrder,
    IOrderStats,
    IOrderReport
}