import { JSX } from "react";
import "./Console.css";

interface ConsoleProps {
	messages: JSX.Element[],
}

export default function Console(props: ConsoleProps) {
	return <div id="console">{props.messages.map((msg, index) => <div key={index}>
			{msg}
		</div>)}
	</div>
}
