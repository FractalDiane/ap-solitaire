import { suitImages } from "../types";

import "./SuitProgressionDisplay.css";

interface SuitProgressionDisplayProps {
	progression: number[],
}

export default function SuitProgressionDisplay(props: SuitProgressionDisplayProps) {
	return <div className="suit-progression-display">
		{props.progression.map((value, suit) => <div className="entry">
			<img src={suitImages[suit]} /><div className="value">{value}</div>
		</div>)}
	</div>;
}
