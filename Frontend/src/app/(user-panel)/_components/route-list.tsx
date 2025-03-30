import { LayoutDashboard, Users, Boxes, ScanLine, UsersRound, Banknote, ClipboardList, Cog } from "lucide-react"
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
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        title: 'Branches',
        url: routes.branches,
        slug: 'branches'
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
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Brands',
        url: routes.brands,
        slug: 'brands'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Units',
        slug: 'units'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Vendors',
        slug: 'vendors'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Categories',
        slug: 'categories'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Tables',
        slug: 'tables'
    },
    {
        icon: <Boxes size={20} strokeWidth={1.5} />,
        title: 'Items',
        slug: 'items'
    },
    {
        icon: <ScanLine size={20} strokeWidth={1.5} />,
        title: 'Purchases',
        slug: 'purchases'
    },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Customers',
        slug: 'customer'
    },
    {
        icon: <UsersRound size={20} strokeWidth={1.5} />,
        title: 'Orders',
        slug: 'orders'
    },
    {
        icon: <Banknote size={20} strokeWidth={1.5} />,
        title: 'Sell',
        slug: 'sales'
    },
    {
        icon: <ClipboardList size={20} strokeWidth={1.5} />,
        title: 'Reports',
        slug: 'reports'
    },
    {
        icon: <ClipboardList size={20} strokeWidth={1.5} />,
        title: 'Expenses',
        slug: 'expenses'
    },
    {
        icon: <Cog size={20} strokeWidth={1.5} />,
        title: 'Settings'
    }
]

export {
    routeList
}