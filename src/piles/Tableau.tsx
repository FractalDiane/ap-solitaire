import Depot from "./Depot";
import { Card, DragData } from "../types";

import "./Tableau.css";

interface TableauProps {
	depots: Card[][],
	
	dragData: DragData,

	suitProgressions: number[],
	rainbowTrapActive: boolean,
	mirrorTrapActive: boolean,
}

export default function Tableau(props: TableauProps) {
	return <div className="tableau">
		{props.depots.map((depot, index) => <Depot key={index} cards={depot} index={index} dragData={props.dragData} suitProgressions={props.suitProgressions} rainbowTrapActive={props.rainbowTrapActive} mirrorTrapActive={props.mirrorTrapActive} />)}
	</div>;
}
