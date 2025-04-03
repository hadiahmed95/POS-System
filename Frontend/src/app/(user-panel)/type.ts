
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

export type {
    IrouteList,
    IBranch,
    IBrand,
    IUnit
}