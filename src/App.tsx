import { useMemo, useRef, useState } from "react";
import {v4 as uuidv4} from "uuid";
import { buildCardDeck, doRectsOverlap, getCardUid, getCardUidFromItemName, rectDistanceSquared } from "./utils";
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
	const itemIdToName = useRef<Map<string, string>>(new Map());
	const cardsToUnlock = useRef<string[]>([]);
	const archipelagoSeed = useRef("");
	const archipelagoSlot = useRef("");
	const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.Disconnected);
	const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

	const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
	const [mirrorTrapActive, setMirrorTrapActive] = useState(false);
	const [rainbowTrapActive, setRainbowTrapActive] = useState(false);

	////////////////////////////////////////////////////////////////////////////////////////////////

	function printToConsole(msg: string) {
		setConsoleMessages(oldConsole => [...oldConsole, msg]);
	}

	function onClickConnect(isDisconnect: boolean, info: ConnectionInfo) {
		if (!isDisconnect) {
			const socket = new WebSocket(`wss://${info.address}`);
			socket.onopen = onWebsocketConnect;
			socket.onmessage = onWebsocketMessage;
			socket.onerror = onWebsocketError;
			socket.onclose = onWebsocketDisconnect;

			websocket.current = socket;
			connectInfo.current = info;
			setConnectionStatus(ConnectionStatus.Connecting);
			archipelagoSlot.current = info.slot;
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
			game: "Solitaire",
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

		for (const packet of data) {
			const cmd = packet.cmd ?? "";

			console.log(packet);

			switch (cmd) {
				case "RoomInfo": {
					archipelagoSeed.current = packet.seed_name;
					const localChecksums = JSON.parse(localStorage.getItem(`dataChecksums_${packet.seed_name}`) ?? "{}");
					console.log(localChecksums);
					const staleGames = [];
					for (const [game, checksum] of Object.entries(packet.datapackage_checksums)) {
						if (localChecksums[game] !== checksum) {
							staleGames.push(game);
						}
					}

					if (staleGames.length > 0) {
						sendCommand({
							cmd: "GetDataPackage",
							//games: staleGames,
						});

						localStorage.setItem(`dataChecksums_${packet.seed_name}`, JSON.stringify(packet.datapackage_checksums));
					} else {
						dataPackage.current = JSON.parse(localStorage.getItem(`data_${packet.seed_name}_${archipelagoSlot.current}`) ?? "{}");
						
						const itemIdToNameMap = new Map<string, string>();
						for (const [name, id] of Object.entries<number>(dataPackage.current["Solitaire"]["item_name_to_id"])) {
							itemIdToNameMap.set(String(id), name);
						}

						itemIdToName.current = itemIdToNameMap;
					}
				} break;

				case "DataPackage": {
					console.log(packet.data.games);
					localStorage.setItem(`data_${archipelagoSeed.current}_${archipelagoSlot.current}`, JSON.stringify(packet.data.games));
					dataPackage.current = packet.data.games;

					const itemIdToNameMap = new Map<string, string>();
					for (const [name, id] of Object.entries<number>(packet.data.games.Solitaire.item_name_to_id)) {
						itemIdToNameMap.set(String(id), name);
					}

					itemIdToName.current = itemIdToNameMap;

					if (cardsToUnlock.current.length > 0) {
						for (const card of cardsToUnlock.current) {
							unlockCard(card);
						}

						cardsToUnlock.current = [];
					}
				} break;

				case "Connected": {
					setConnectionStatus(ConnectionStatus.Connected);
					console.log(packet);
				} break;

				case "ConnectionRefused": {
					setConnectionStatus(ConnectionStatus.Disconnected);
				} break;

				case "PrintJSON": {
					let result = "";
					for (const part of packet.data) {
						switch (part.type ?? "text") {
							case "text": {
								result += part.text;
							} break;
						}
					}

					printToConsole(result);
				} break;

				case "ReceivedItems": {
					if (Object.keys(dataPackage.current).length > 0) {
						for (const item of packet.items) {
							const card = itemIdToName.current.get(String(item.item));
							if (card !== undefined) {
								unlockCard(card);
							}
						}
					} else {
						cardsToUnlock.current = cardsToUnlock.current.concat(packet.items);
					}
				} break;
				
				default: {
					
				} break;
			}
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

	function unlockCard(name: string) {
		const id = getCardUidFromItemName(name);
		const newUnlocked = [...unlockedCards];
		newUnlocked.push(id);
		setUnlockedCards(newUnlocked);
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
		if (unlockedCards.includes(getCardUid(cards[0]))) {
			const targetCard: Card | null = gameState.foundations[index][gameState.foundations[index].length - 1] ?? null;
			const bottomCard = cards[0];
			if (cards.length === 1 && (targetCard === null && bottomCard.value == 1 || bottomCard.suit === targetCard?.suit && bottomCard.value === targetCard?.value + 1)) {
				const newFoundations = [...gameState.foundations];
				newFoundations[index] = newFoundations[index].concat(cards);



				return [gameState.tableau, newFoundations];
			}
		}
		
		return [null, null];
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
					<Stock cards={gameState.stock} dragData={dragData} onClickCard={drawCard} onClickEmpty={resetStock} unlockedCards={unlockedCards} rainbowTrapActive={rainbowTrapActive} />
					<Waste cards={gameState.waste} dragData={dragData} unlockedCards={unlockedCards} rainbowTrapActive={rainbowTrapActive} />
					{gameState.foundations.map((foundation, index) => <Foundation key={index} index={index} cards={foundation} dragData={dragData} unlockedCards={unlockedCards} rainbowTrapActive={rainbowTrapActive} />)}
				</div>
				<Tableau depots={gameState.tableau} dragData={dragData} unlockedCards={unlockedCards} rainbowTrapActive={rainbowTrapActive} />
			</div>
			<div id="archipelago-info">
				<ConnectPanel connectionStatus={connectionStatus} onClickConnect={onClickConnect} />
				<Console messages={consoleMessages} />
			</div>
		</div>
	</div>;
}

export default App;
