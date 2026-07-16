import { FC, ReactNode, MouseEvent } from "react";
interface CollapseProps {
    isOpen: boolean;
    toggleCollapse: (event: MouseEvent<SVGSVGElement>) => void;
    title: ReactNode;
    children: Array<ReactNode>;
    disableToggle?: boolean;
    className?: string;
}
declare const Collapse: FC<CollapseProps>;
export default Collapse;
//# sourceMappingURL=Collapse.d.ts.map