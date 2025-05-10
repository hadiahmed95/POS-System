import { LayoutDashboard, Users, Boxes, ScanLine, UsersRound, Banknote, ClipboardList, Cog, Bandage, ContactRound, Layers2, Layers, Grid2x2Plus, Sheet, Package } from "lucide-react"
import { IrouteList } from "../type"
import { routes } from "@/config/routes"

const routeList: IrouteList[] = [
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
    {
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Branches',
        url: routes.branches,
        slug: 'branches'
    },
    {
        icon: <Bandage size={20} strokeWidth={1.5} />,
        title: 'Brands',
        url: routes.brands,
        slug: 'brands'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Units',
        url: routes.units,
        slug: 'units'
    },
    {
        icon: <ContactRound size={20} strokeWidth={1.5} />,
        title: 'Vendors',
        url: routes.vendors,
        slug: 'vendors'
    },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Customers',
        url: routes.customers,
        slug: 'customer'
    },
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
        icon: <Sheet size={20} strokeWidth={1.5} />,
        title: 'Tables',
        url: routes.tables,
        slug: 'tables'
    },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Orders',
        url: routes.orders,
        slug: 'orders'
    },
    {
        icon: <ScanLine size={20} strokeWidth={1.5} />,
        title: 'Purchases',
        slug: 'purchases'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Kitchen',
        slug: 'kitchen',
        url: routes.kitchen
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Sell',
        slug: 'reports/sales',
        url: routes.salesReport
    },
    {
        icon: <ClipboardList size={20} strokeWidth={1.5} />,
        title: 'Reports',
        slug: 'reports',
        url: routes.reports
    },
    {
        icon: <ClipboardList size={20} strokeWidth={1.5} />,
        title: 'Expenses',
        slug: 'expenses'
    },
    {
        icon: <Cog size={20} strokeWidth={1.5} />,
        title: 'Settings',
        slug: 'settings'
    }
]

export {
    routeList
}