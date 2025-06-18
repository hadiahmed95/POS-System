import { LayoutDashboard, Users, DollarSignIcon, UsersRound, Banknote, Cog, Bandage, Grid2x2Plus, Sheet, Package, Receipt, ReceiptText } from "lucide-react"
import { IrouteList } from "../type"
import { routes } from "@/config/routes"

const routeList: IrouteList[] = [
    {  type: 'group', title: 'Main', screens: ['dashboard', 'users', 'roles-permissions'] },
    {
        active: true,
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Dashboard',
        url: routes.dahsboard,
        slug: 'dashboard'
    },
    {
        icon: <Users size={20} strokeWidth={1.5} />,
        title: 'Users Management',
        match: ['users', 'roles-permissions'],
        children: [
            {
                icon: null,
                title: 'Users',
                url: routes.users,
                slug: 'users'
            },
            {
                icon: null,
                title: 'Role Management',
                url: routes.user_roles,
                slug: 'roles-permissions'
            }
        ]
    },
    { type: 'group', title: 'Sales and Orders', screens: ['orders', 'sales'] },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Orders',
        url: routes.orders,
        slug: 'orders'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Sales',
        url: routes.salesReport,
        slug: 'sales'
    },
    // {
    //     icon: <ScanLine size={20} strokeWidth={1.5} />,
    //     title: 'Purchases',
    //     slug: 'purchases'
    // },
    // {
    //     icon: <UsersRound size={20} strokeWidth={1.5} />,
    //     title: 'Customers',
    //     url: routes.customers,
    //     slug: 'customer'
    // },
    { type: 'group', title: 'Expenses', screens: ['expenses', 'expense-types'] },
    {
        icon: <ReceiptText size={20} strokeWidth={1.5} />,
        title: 'Expense Types',
        url: routes.expenseTypes,
        slug: 'expense-types'
    },
    {
        icon: <Receipt size={20} strokeWidth={1.5} />,
        title: 'Expenses',
        url: routes.expenses,
        slug: 'expenses'
    },
    { type: 'group', title: 'Business Management', screens: ['branches', 'kitchen', 'tables'] },
    {
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Branches',
        url: routes.branches,
        slug: 'branches'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Kitchen',
        url: routes.kitchen,
        slug: 'kitchen'
    },
    {
        icon: <Sheet size={20} strokeWidth={1.5} />,
        title: 'Tables',
        url: routes.tables,
        slug: 'tables'
    },

    { type: 'group', title: 'Inventory', screens: ['categories', 'items', 'brands'] },
    {
        icon: <Grid2x2Plus size={20} strokeWidth={1.5} />,
        title: 'Categories',
        url: routes.categories,
        slug: 'categories'
    },
    {
        icon: <Package size={20} strokeWidth={1.5} />,
        title: 'Items',
        url: routes.items,
        slug: 'items'
    },
    {
        icon: <Bandage size={20} strokeWidth={1.5} />,
        title: 'Brands',
        url: routes.brands,
        slug: 'brands'
    },
    // {
    //     icon: <Boxes size={20} strokeWidth={1.5} />,
    //     title: 'Units',
    //     url: routes.units,
    //     slug: 'units'
    // },
    // {
    //     icon: <ContactRound size={20} strokeWidth={1.5} />,
    //     title: 'Vendors',
    //     url: routes.vendors,
    //     slug: 'vendors'
    // },
    
    // {
    //     icon: <ClipboardList size={20} strokeWidth={1.5} />,
    //     title: 'Reports',
    //     slug: 'reports',
    //     url: routes.reports
    // },
    // {
    //     icon: <ClipboardList size={20} strokeWidth={1.5} />,
    //     title: 'Expenses',
    //     slug: 'expenses'
    // },
    { type: 'group', title: 'System' },
    {
        icon: <Cog size={20} strokeWidth={1.5} />,
        title: 'Settings',
        url: routes.settings
    }
]

export {
    routeList
}