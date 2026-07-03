import {  useMemo, useState } from "react";
import { ConnectionStatus, ConnectionInfo } from "../types";

import "./ConnectPanel.css";

interface ConnectPanelProps {
	onHintModeChange: (value: boolean) => void,
	onClickConnect: (isDisconnected: boolean, info: ConnectionInfo) => void,
	connectionStatus: ConnectionStatus,
}

export default function ConnectPanel(props: ConnectPanelProps) {
	const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo);

	function getButtonName(): string {
		switch (props.connectionStatus) {
			case ConnectionStatus.Connected: return "Disconnect";
			case ConnectionStatus.Connecting: return "Connecting...";
			case ConnectionStatus.Disconnecting: return "Disconnecting...";
			case ConnectionStatus.Disconnected: return "Connect";
		}
	}

	function getConnectionInfo(): ConnectionInfo {
		const savedData = localStorage.getItem("connection_info");
		if (savedData !== null) {
			const json = JSON.parse(savedData);
			return json;
		} else {
			return {
				address: "",
				slot: "",
				password: "",
				hintMode: false,
			}
		}
	}

	const buttonDisabled = useMemo(() => {
		return props.connectionStatus === ConnectionStatus.Connecting
				|| props.connectionStatus === ConnectionStatus.Disconnecting
				|| connectionInfo.address.length === 0
				|| connectionInfo.slot.length === 0;
	}, [props.connectionStatus, connectionInfo]);

	return <div id="connect-panel-parent">
		<form id="connect-panel">
			<label>Game Mode</label>
			<select value={connectionInfo.hintMode ? "hint" : "archipelago"} onChange={(event) => {
					const newInfo = {...connectionInfo};
					newInfo.hintMode = event.target.value === "hint";
					setConnectionInfo(newInfo);
					props.onHintModeChange(event.target.value === "hint");
				}} name="mode" id="mode" disabled={props.connectionStatus != ConnectionStatus.Disconnected}>
				<option value="archipelago">Archipelago Game</option>
				<option value="hint">Hint Game</option>
			</select>
			<label>Address</label>
			<input type="url" value={connectionInfo.address} disabled={props.connectionStatus != ConnectionStatus.Disconnected} onChange={(event) => {
				const newInfo = {...connectionInfo};
				newInfo.address = event.target.value;
				setConnectionInfo(newInfo);
			}}></input>
			<label>Slot Name</label>
			<input type="text" value={connectionInfo.slot} disabled={props.connectionStatus != ConnectionStatus.Disconnected} onChange={(event) => {
				const newInfo = {...connectionInfo};
				newInfo.slot = event.target.value;
				setConnectionInfo(newInfo);
			}}></input>
			<label>Password</label>
			<input style={{marginBottom: "16px"}} type="password" value={connectionInfo.password} disabled={props.connectionStatus != ConnectionStatus.Disconnected} onChange={(event) => {
				const newInfo = {...connectionInfo};
				newInfo.password = event.target.value;
				setConnectionInfo(newInfo);
			}}></input>
			<button className="solitaire-button" type="button" disabled={buttonDisabled}
			onClick={() => {
				props.onClickConnect(props.connectionStatus === ConnectionStatus.Connected, connectionInfo);
				localStorage.setItem("connection_info", JSON.stringify(connectionInfo));
			}}>{getButtonName()}</button>
			<a id="download-button" href="solitaire.apworld" download>Download APWorld</a>
		</form>
	</div>;
}
