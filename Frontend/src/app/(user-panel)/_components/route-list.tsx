import { LayoutDashboard, Users, Boxes, ScanLine, UsersRound, Banknote, ClipboardList, Cog, Bandage, ContactRound, Layers2, Layers, Grid2x2Plus, Sheet, Package } from "lucide-react"
import { IrouteList } from "../type"
import { routes } from "@/config/routes"

const routeList: IrouteList[] = [
    {  type: 'group', title: 'Main' },
    {
        active: true,
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Dashboard',
        slug: 'dashboard',
        url: routes.dahsboard
    },
    {
        icon: <Users size={20} strokeWidth={1.5} />,
        title: 'Users Management',
        match: ['users', 'user-roles'],
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
                url: '/user-roles',
                slug: 'roles-permissions'
            }
        ]
    },
    { type: 'group', title: 'Sales and Orders' },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Orders',
        url: routes.orders,
        slug: 'orders'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Sales',
        slug: 'reports/sales',
        url: routes.salesReport
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
    { type: 'group', title: 'Business Management' },
    {
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Branches',
        url: routes.branches,
        slug: 'branches'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Kitchen',
        slug: 'kitchen',
        url: routes.kitchen
    },
    {
        icon: <Sheet size={20} strokeWidth={1.5} />,
        title: 'Tables',
        url: routes.tables,
        slug: 'tables'
    },
    { type: 'group', title: 'Inventory' },
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
        slug: 'settings'
    }
]

export {
    routeList
}