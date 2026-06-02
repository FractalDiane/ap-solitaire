import { suitImages, cardValues } from "../types";

import "./SuitProgressionDisplay.css";

interface SuitProgressionDisplayProps {
	progression: number[],
}

export default function SuitProgressionDisplay(props: SuitProgressionDisplayProps) {
	return <div className="suit-progression-display">
		{props.progression.map((value, suit) => <div className="entry" key={suit}>
			<img src={suitImages[suit]} /><div className="value">{cardValues[value]}</div>
		</div>)}
	</div>;
}
