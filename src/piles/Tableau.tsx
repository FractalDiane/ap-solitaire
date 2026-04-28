import Depot from "./Depot";
import { Card, DragData } from "../types";

import "./Tableau.css";

interface TableauProps {
	depots: Card[][],
	
	dragData: DragData,

	unlockedCards: string[],
	rainbowTrapActive: boolean,
}

export default function Tableau(props: TableauProps) {
	return <div className="tableau">
		{props.depots.map((depot, index) => <Depot key={index} cards={depot} index={index} dragData={props.dragData} unlockedCards={props.unlockedCards} rainbowTrapActive={props.rainbowTrapActive} />)}
	</div>;
}
