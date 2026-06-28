import TitleCard from "./TitleCard";

import "./TitleLogo.css";

export default function TitleLogo() {
	return <div id="title-container">
		<div id="title-cards">
			<TitleCard index={0} startFaceUp={true} />
			<TitleCard index={1} startFaceUp={false} />
			<TitleCard index={2} startFaceUp={true} />
			<TitleCard index={3} startFaceUp={false} />
			<TitleCard index={4} startFaceUp={true} />
		</div>
		<div id="title-text">AP SOLITAIRE</div>
		<div id="title-credits">
			<span style={{marginRight: "128px"}}>By Diane Sparks</span>
			<span>Card art by Tangent</span>
		</div>
	</div>;
}
