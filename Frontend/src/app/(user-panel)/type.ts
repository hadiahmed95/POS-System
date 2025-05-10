
interface IrouteList {
    icon: React.JSX.Element | null;
    title: string;
    active?: boolean;
    children?: IrouteList[] | undefined;
    url?: string
    slug?: string
}

interface IBranch {
    id?: string
    branch_name: string
    branch_address: string
    branch_description: string
    branch_phone: string
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
    id?: number | string
    item_id: number | string
    name: string
    quantity: number
    price: number
    variation_name?: string
    variation_id?: number | string
}
  
interface IOrder {
    id?: number | string
    order_number: string
    customer_name?: string
    table_no?: string
    items: IOrderItem[]
    items_count: number
    subtotal: number
    discount: number
    tax: number
    total_amount: number
    status: 'pending' | 'completed' | 'cancelled'
    notes?: string
    created_at: string
    updated_at?: string
    created_by?: number | string
}
  

export type {
    IrouteList,
    IBranch,
    IBrand,
    IUnit,
    IVendor,
    ICategory,
    IItem,
    ITable,
    ICustomer,
    IPermissions,
    IModule,
    IOrder,
    IOrderItem
}