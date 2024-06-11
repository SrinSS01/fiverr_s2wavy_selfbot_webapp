'use client'

import React, { useEffect, useRef, useState } from "react";
import { SelfBotUsers } from "../page";
import Close from "../icons/Close.svg"
import Send from "../icons/Send.svg"
import Image from "next/image";
import { APIEndPoint } from "../config/Config";

type Guild = {
	id: string;
	name: string;
	icon?: string;
	configured: boolean;
};

type Channel = {
	id: string;
	type: number;
	guildId: string;
	name: string;
	parentId: string;
	configured: boolean;
};

type MessageSchedule = {
	guild_id: string;
	channel_id: string;
	selfbot_user_id: string;
	message_content: string;
	initiate_time: string;
	interval: number;
	expired: boolean;
}

export default function ShowConfig({ user, setShowConfig }: {
	user: SelfBotUsers,
	setShowConfig?: (value: ( ( (prevState: boolean) => boolean ) | boolean )) => void
}) {
	const [ guilds, setGuilds ] = useState<Guild[]>([])
	const [ error, setError ] = useState<string | undefined>();
	const [ success, setSuccess ] = useState<string | undefined>();
	const [ selectedGuild, setSelectedGuild ] = useState<Guild>();
	const [ channels, setChannels ] = useState<Channel[]>([]);
	const [ selectedChannel, setSelectedChannel ] = useState<Channel>();
	const [ message, setMessage ] = useState("")
	const [ dateTime, setDateTime ] = useState<string>()
	const [ interval, setInterval ] = useState<number>()
	const [ schedules, setSchedules ] = useState<MessageSchedule[]>([]);
	useEffect(() => {
		fetch(`${ APIEndPoint }/servers/${ user.user_id }`)
			.then(res => res.json())
			.then(_json => setGuilds(_json))
			.catch(console.error);
	}, []);
	return <div className={ "w-full h-full" }>
		<Image className={ "fixed top-5 right-10 cursor-pointer z-10 bg-red-950 rounded-full" } width={ 30 }
			   src={ Close } alt={ "close" } onClick={ () => {
			if ( setShowConfig ) {
				setGuilds([]);
				setShowConfig(false);
			}
		} }/>
		<div className={"grid-container fixed"}>
			<div className={"item1 h-full overflow-y-auto overflow-ellipsis"}>{ guilds && guilds.map((guild, index) =>
				<div
					className={ `flex gap-5 items-center hover:bg-green-800 p-2 m-3 cursor-pointer ${ selectedGuild?.id === guild.id ? `${guild.configured? "outline-dashed": "outline"} outline-2 outline-green-500 bg-green-950` : guild.configured? "outline-dashed outline-2 outline-blue-500": "" }` }
					key={ index }
					onClick={ async () => {
						setChannels([])
						setMessage("")
						setInterval(undefined)
						setDateTime(undefined)
						setSelectedGuild(guild)
						setSelectedChannel(undefined)
						const response = await fetch(`${ APIEndPoint }/channels/${ user.user_id }/${ guild.id }`)
						if ( response.ok ) {
							const data: Channel[] = await response.json();
							setChannels(data)
							setError(undefined)
						} else {
							const errorJson = await response.json();
							setError(errorJson)
							setTimeout(() => setError(undefined), 5000)
						}
					} }>
					<img
						className={ "rounded-full" }
						width={ 50 }
						src={ guild.icon !== null ? `https://cdn.discordapp.com/icons/${ guild.id }/${ guild.icon }.webp?size=256` : `https://cdn.discordapp.com/embed/avatars/0.png` }
						alt={ guild.name }/>
					<div>
						<div className={ "font-bold truncate w-[270px]" }>{ guild.name }</div>
						<div>{ guild.id }</div>
					</div>
				</div>) }</div>
			<div className={"item2 h-full overflow-y-auto overflow-ellipsis"}>{ selectedGuild &&
				channels.filter(channel => channel.type === 0).map((channel, index) =>
					<div
						key={ index }
						className={ `m-3 p-2 pl-4 pr-4 hover:bg-orange-800 cursor-pointer ${ selectedChannel?.id === channel.id ? `${channel.configured? "outline-dashed": "outline"} outline-2 outline-orange-500 bg-orange-950` : channel.configured? "outline-2 outline-blue-500 outline-dashed": "" }` }
						onClick={ async () => {
							setSelectedChannel(channel);
							const response = await fetch(`${ APIEndPoint }/schedules/${user.user_id}/${selectedGuild.id}/${channel.id}`);
							const body = await response.json();
							if (!response.ok) {
								setError(JSON.stringify(body));
								setTimeout(() => setError(undefined), 5000);
								return;
							}
							setSchedules(body);
						} }>{ channel.name }
					</div>) }</div>
			<div className={"item3"}>{ selectedGuild && <div
				className={ "text-2xl font-bold absolute bg-black p-5" }>
				<span className={ "text-green-500" }>{ selectedGuild.name }</span>
				{ selectedChannel ? <>
					<span> { ">" } </span>
					<span className={ "text-orange-500" }>{ selectedChannel.name }</span>
				</> : <></> }
			</div> }</div>
			{ selectedChannel && <div className={ "item4 h-full overflow-y-auto overflow-x-auto flex flex-col m-5" }>
				{ schedules && schedules.map(schedule => <div className={"font-bold font-mono p-3 flex"}>
					<div className={"bg-gray-800 p-2 pl-4 pr-4 h-full break-all"}>{ schedule.message_content }</div>
					<div className={"bg-gray-600 p-2 pl-4 pr-4 h-full"}>{ new Date(Number(schedule.initiate_time)).toLocaleString() }</div>
					<div className={"bg-gray-400 p-2 pl-4 pr-4 text-gray-900 h-full"}>{ `Interval: ${schedule.interval} seconds` }</div>
					<div className={"bg-gray-200 p-2 pl-4 pr-4 text-gray-900 h-full"}>{ schedule.expired? "Expired": "Not Expired" }</div>
				</div>) }
			</div> }
			{ selectedChannel && <div className={ "item5 bg-gray-800 font-bold p-4 pl-4 pr-4 flex flex-row gap-5 items-center m-5" }>
				<textarea className={ "outline-none border-none bg-transparent flex-1 text-2xl resize-none" }
				          placeholder={ "Type a message to schedule and send" }
				          onChange={ event => setMessage(event.target.value) }/>
					<div
						className={ "flex items-center justify-center flex-col bg-gray-950 p-2 border-2 border-gray-600" }>
						<input type={ "number" }
						       onChange={ event => setInterval(Number(event.target.value)) }
						       className={ "outline-none border-none bg-gray-400 p-1 pl-2 pr-2 font-bold cursor-pointer text-2xl font-mono text-gray-800 w-[100px]" }/>
						<div>Interval</div>
					</div>
					<div
						className={ "flex items-center justify-center flex-col bg-gray-950 p-2 border-gray-600" }>
						<input type={ "datetime-local" } min={ new Date().toISOString().substring(0, 16) }
						       onChange={ event => setDateTime(event.target.value) }
						       className={ "outline-none border-none bg-gray-400 p-1 pl-2 pr-2 font-bold cursor-pointer text-2xl font-mono text-gray-800" }/>
						<div>Date and time</div>
					</div>
					{ message.trim().length !== 0 && dateTime && interval && selectedGuild && selectedChannel ?
						<Image className={ "w-7 cursor-pointer" } src={ Send } alt={ "Send" } onClick={ async () => {
							const schedule: MessageSchedule = {
								channel_id: selectedChannel.id,
								guild_id: selectedGuild.id,
								initiate_time: `${ new Date(dateTime).getTime() }`,
								interval: interval,
								message_content: message,
								selfbot_user_id: user.user_id,
								expired: false,
							}
							try {
								const response = await fetch(`${ APIEndPoint }/schedule`, {
									method: "POST",
									body: JSON.stringify(schedule)
								})
								const body = JSON.stringify(await response.json());
								if ( !response.ok ) {
									setError(body);
									setTimeout(() => setError(undefined), 5000);
									return;
								}
								setSuccess(body);
								setTimeout(() => setSuccess(undefined), 5000);
								const response1 = await fetch(`${ APIEndPoint }/schedules/${ user.user_id }/${ selectedGuild.id }/${ selectedChannel.id }`);
								const body1 = await response1.json();
								if ( !response1.ok ) {
									setError(JSON.stringify(body1));
									setTimeout(() => setError(undefined), 5000);
									return;
								}
								setSchedules(body1);
								setGuilds(guilds.map(guild => {
									guild.configured ||= guild.id == selectedGuild.id;
									return guild;
								}));
								setChannels(channels.map(channel => {
									channel.configured ||= channel.id == selectedChannel.id;
									return channel;
								}));
							} catch ( error ) {
								console.log(error);
							}
						} }/> : <></> }
				</div> }
		</div>
		<div className={ error ? "fixed bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2 font-bold" : "" }>{ error ?? "" }</div>
		<div
			className={ success ? "fixed bottom-0 left-0 bg-green-500 pl-4 pr-4 p-2 font-bold" : "" }>{ success ?? "" }</div>
	</div>
}
