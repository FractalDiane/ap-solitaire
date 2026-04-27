import { useMemo, useRef, useState } from "react";
import {v4 as uuidv4} from "uuid";
import { buildCardDeck, doRectsOverlap, rectDistanceSquared } from "./utils";
import { Card, CardLocation, ConnectionInfo, ConnectionStatus, DragData, DropZone, GameState, SuitColors, Vector2 } from "./types";
import Tableau from "./piles/Tableau";
import Foundation from "./piles/Foundation";
import Waste from "./piles/Waste";
import Stock from "./piles/Stock";
import ConnectPanel from "./archipelago/ConnectPanel";

import "./App.css";
import Console from "./archipelago/Console";

function App() {
	const [gameState, setGameState] = useState(generateNewGame);

	const [draggedCard, setDraggedCard] = useState("");
	const [draggedCardOffset, setDraggedCardOffset] = useState<Vector2>({x: 0, y: 0});
	const [draggedCardStartPos, setDraggedCardStartPos] = useState<Vector2>({x: 0, y: 0});

	const websocket = useRef<WebSocket | null>(null);
	const connectInfo = useRef<ConnectionInfo>({address: "", slot: "", password: ""});
	const dataPackage = useRef<object>({});
	const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.Disconnected);
	const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

	const [unlockedCards, setUnlockedCards] = useState(new Set<string>());
	const [mirrorTrapActive, setMirrorTrapActive] = useState(false);
	const [rainbowTrapActive, setRainbowTrapActive] = useState(true);

	////////////////////////////////////////////////////////////////////////////////////////////////

	function printToConsole(msg: string) {
		setConsoleMessages(oldConsole => [...oldConsole, msg]);
	}

	function onClickConnect(isDisconnect: boolean, info: ConnectionInfo) {
		if (!isDisconnect) {
			try {
				const socket = new WebSocket(`wss://${info.address}`);
				socket.onopen = onWebsocketConnect;
				socket.onmessage = onWebsocketMessage;
				socket.onerror = onWebsocketError;
				socket.onclose = onWebsocketDisconnect;

				websocket.current = socket;
				connectInfo.current = info;
				setConnectionStatus(ConnectionStatus.Connecting);
			} catch (e) {
				console.error(e);
			}
		} else {
			setConnectionStatus(ConnectionStatus.Disconnecting);
			websocket.current?.close();
		}
	}

	function sendCommand(command: object) {
		console.log(websocket);
		websocket.current?.send(JSON.stringify([command]));
	}

	function onWebsocketConnect() {
		sendCommand({
			cmd: "Connect",
			tags: ["DeathLink"],
			game: null,
			password: connectInfo.current.password,
			name: connectInfo.current.slot,
			uuid: uuidv4(),
			version: {class: "Version", major: 0, minor: 7, build: 0},
			items_handling: 0b111,
			slot_data: true,
		});
	}

	function onWebsocketMessage(msg: MessageEvent) {
		const data = JSON.parse(msg.data);

		const args = data[0] ?? {};
		const cmd = args.cmd ?? "";

		switch (cmd) {
			case "RoomInfo": {
				const localChecksums = JSON.parse(localStorage.getItem("dataChecksums") ?? "{}");
				const staleGames = [];
				for (const [game, checksum] of Object.entries(args.datapackage_checksums)) {
					if (localChecksums[game] !== checksum) {
						staleGames.push(game);
					}
				}

				if (staleGames.length > 0) {
					sendCommand({
						cmd: "GetDataPackage",
						//games: staleGames,
					});

					localStorage.setItem("dataChecksums", JSON.stringify(args.datapackage_checksums));
				} else {
					dataPackage.current = JSON.parse(localStorage.getItem("data") ?? "{}");
				}
			} break;

			case "DataPackage": {
				localStorage.setItem("data", msg.data);
				dataPackage.current = args.data.games;
			} break;

			case "Connected": {
				setConnectionStatus(ConnectionStatus.Connected);
				console.log(args);
			} break;

			case "ConnectionRefused": {
				setConnectionStatus(ConnectionStatus.Disconnected);
			} break;

			case "PrintJSON": {
				let result = "";
				for (const part of args.data) {
					switch (part.type ?? "text") {
						case "text": {
							result += part.text;
						} break;
					}
				}

				printToConsole(result);
			} break;
			
			default: {
				console.log(data);
			} break;
		}
	}

	function onWebsocketError(event: Event) {
		console.error(event);
	}

	function onWebsocketDisconnect(event: CloseEvent) {
		if (event.code === 1015) {
			printToConsole(`Couldn't connect to Archipelago server at ${connectInfo.current.address}.`);
		}

		setConnectionStatus(ConnectionStatus.Disconnected);
		console.log(event);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	function generateNewGame(): GameState {
		const cards = buildCardDeck();
		const newTableau: Card[][] = [[], [], [], [], [], [], []];
		let depotSize = 1;
		for (let d = 0; d < 7; ++d) {
			for (let c = 0; c < depotSize; ++c) {
				const thisCard = cards.pop()!;
				thisCard.isFaceUp = c == d;
				newTableau[d].push(thisCard);
			}

			++depotSize;
		}

		return {
			tableau: newTableau,
			stock: cards,
			foundations: [[], [], [], []],
			waste: [],
		};
	}

	function saveGame() {
		const saveData = JSON.stringify(gameState);
		localStorage.setItem("save", saveData);
	}

	function loadGame() {
		const saveData = localStorage.getItem("save");
		if (saveData !== null) {
			setGameState(JSON.parse(saveData));
		}
	}

	function drawCard() {
		const newState = {...gameState};
		const card = newState.stock.pop() ?? null;
		if (card !== null) {
			card.isFaceUp = true;
			newState.waste.push(card);
			setGameState(newState);
		} else {
			console.log("stock empty");
		}
	}

	function resetStock() {
		const newState = {...gameState};
		const cards = newState.waste;
		cards.reverse();
		for (const card of cards) {
			card.isFaceUp = false;
		}

		newState.waste = [];
		newState.stock = cards;
		setGameState(newState);
	}

	function tryAddCardsToDepot(cards: Card[], index: number): [Card[][], Card[][]] | [null, null] {
		const targetCard: Card | null = gameState.tableau[index][gameState.tableau[index].length - 1] ?? null;
		const bottomCard = cards[0];
		if (targetCard === null && bottomCard.value == 13 || SuitColors[bottomCard.suit] !== SuitColors[targetCard?.suit] && bottomCard.value === targetCard?.value - 1) {
			const newTableau = [...gameState.tableau];
			newTableau[index] = newTableau[index].concat(cards);
			return [newTableau, gameState.foundations];
		} else {
			return [null, null];
		}
	}

	function takeCardFromDepot(index: number, indexInStack: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newTableau[index] = newTableau[index].slice(0, indexInStack);
		if (newTableau[index].length > 0) {
			newTableau[index][newTableau[index].length - 1].isFaceUp = true;
		}

		return [newTableau, newFoundations, newWaste];
	}

	function tryAddCardsToFoundation(cards: Card[], index: number): [Card[][], Card[][]] | [null, null] {
		const targetCard: Card | null = gameState.foundations[index][gameState.foundations[index].length - 1] ?? null;
		const bottomCard = cards[0];
		if (cards.length === 1 && (targetCard === null && bottomCard.value == 1 || bottomCard.suit === targetCard?.suit && bottomCard.value === targetCard?.value + 1)) {
			const newFoundations = [...gameState.foundations];
			newFoundations[index] = newFoundations[index].concat(cards);
			return [gameState.tableau, newFoundations];
		} else {
			return [null, null];
		}
	}

	function takeCardFromFoundation(index: number, _: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newFoundations[index].pop();
		return [newTableau, newFoundations, newWaste];
	}

	function takeCardFromWaste(_: number, __: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newWaste.pop();
		return [newTableau, newFoundations, newWaste];
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	function onCardMouseDown(mousePos: Vector2, _: DOMRect, cardId: string) {
		setDraggedCardStartPos(mousePos);
		setDraggedCardOffset(mousePos);
		setDraggedCard(cardId);
	}

	function onCardMouseUp(_: Vector2, cardPos: DOMRect, __: string, cards: Card[], location: CardLocation, index: number, indexInStack: number) {
		setDraggedCard("");

		const dropZones = getDropZones();

		let minDistance = Infinity;
		let closestZone: DropZone | null = null;
		for (const zone of dropZones) {
			if (doRectsOverlap(cardPos, zone.box)) {
				const distanceSquared = rectDistanceSquared(cardPos, zone.box);
				if (distanceSquared < minDistance) {
					closestZone = zone;
					minDistance = distanceSquared;
				}
			}
		}

		if (closestZone !== null) {
			const addFunc = closestZone.location === CardLocation.Foundation ? tryAddCardsToFoundation : tryAddCardsToDepot;
			const removeFunc = location === CardLocation.Foundation ? takeCardFromFoundation : location === CardLocation.Depot ? takeCardFromDepot : takeCardFromWaste;

			let [newTableau, newFoundations] = (addFunc)(cards, closestZone.index);
			let newWaste = gameState.waste;
			if (newTableau !== null && newFoundations !== null) {
				[newTableau, newFoundations, newWaste] = (removeFunc)(index, indexInStack, newTableau, newFoundations, newWaste);
				setGameState({
					tableau: newTableau,
					foundations: newFoundations,
					stock: gameState.stock,
					waste: newWaste,
				});
			}
		}
	}

	function getDropZones(): DropZone[] {
		const result = [];
		const zones = document.querySelectorAll<HTMLDivElement>(".drop-zone");
		for (const zone of zones) {
			result.push({
				box: zone.getBoundingClientRect(),
				location: Number(zone.getAttribute("drop-location")),
				index: Number(zone.getAttribute("drop-index")),
			});
		}

		return result;
	}

	const dragData = useMemo<DragData>(() => {
		return {
			draggedCard: draggedCard,
			dragOffset: draggedCardOffset,
			dragStartPos: draggedCardStartPos,
			onMouseDown: onCardMouseDown,
			onMouseUp: onCardMouseUp,
		};
	}, [draggedCard, draggedCardOffset, draggedCardStartPos]);

	return <div id="actual-root" onMouseMove={(e) => {
			if (draggedCard.length > 0) {
				setDraggedCardOffset({x: e.clientX, y: mirrorTrapActive ? window.innerHeight - e.clientY : e.clientY});
			}
		}}>
		<div id="main-screen">
			<div id="game" style={{transform: mirrorTrapActive ? "scaleY(-1)" : "none"}}>
				<div className="foundations-container">
					<Stock cards={gameState.stock} dragData={dragData} onClickCard={drawCard} onClickEmpty={resetStock} rainbowTrapActive={rainbowTrapActive} />
					<Waste cards={gameState.waste} dragData={dragData} rainbowTrapActive={rainbowTrapActive} />
					{gameState.foundations.map((foundation, index) => <Foundation key={index} index={index} cards={foundation} dragData={dragData} rainbowTrapActive={rainbowTrapActive} />)}
				</div>
				<Tableau depots={gameState.tableau} dragData={dragData} rainbowTrapActive={rainbowTrapActive} />
			</div>
			<div id="archipelago-info">
				<ConnectPanel connectionStatus={connectionStatus} onClickConnect={onClickConnect} />
				<Console messages={consoleMessages} />
			</div>
		</div>
	</div>;
}

export default App;
