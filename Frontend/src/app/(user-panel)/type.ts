
interface IrouteList {
    icon: React.JSX.Element | null;
    title: string;
    active?: boolean;
    children?: IrouteList[] | undefined;
    url?: string
}

export type {
    IrouteList
}