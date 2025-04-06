
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
    id?: string
    cat_name: string
    parent_id: string
    children?: ICategory[]
    created_at?: string
    updated_at?: string
}

interface IItem {
    id?: string
    categories: ICategory[]
    variations: string[]
    added_by?: string
    image: string
    name: string
    barcode?: string
    old_barcode?: string
    sku?: string
    description?: string
    available: string | number
}

type TableType = 'indoor' | 'outdoor'
type TableStatus = 'available' | 'reserved' | 'occupied'

interface ITable {
    id?: string
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
    created_at?: string
    updated_at?: string
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
    ICustomer
}