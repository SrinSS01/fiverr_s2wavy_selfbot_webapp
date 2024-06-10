'use client'

import React, { useEffect, useRef, useState } from "react";
import { APIEndPoint, SelfBotUsers } from "../page";
import Close from "../icons/Close.svg"
import Send from "../icons/Send.svg"
import Image from "next/image";

type Guild = {
	id: string;
	name: string;
	icon?: string;
};

type Channel = {
	id: string;
	type: number;
	guildId: string;
	name: string;
	parentId: string;
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
	const [ servers, setServers ] = useState<Guild[]>([])
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
			.then(_json => setServers(_json))
			.catch(console.error);
	}, []);
	return <div className={ "flex flex-col gap-5 flex-1" }>
		<Image className={ "fixed top-5 right-10 cursor-pointer z-10 bg-red-950 rounded-full" } width={ 30 }
			   src={ Close } alt={ "close" } onClick={ () => {
			if ( setShowConfig ) {
				setServers([]);
				setShowConfig(false);
			}
		} }/>
		<div className={ "flex flex-row gap-5 fixed top-0 left-3 w-full" }>
			<div className={ "overflow-y-auto h-screen p-5 w-fit" }>
				{ servers && servers.map((guild, index) =>
					<div
						className={ `flex w-fit gap-5 items-center relative hover:bg-green-800 p-5 m-3 cursor-pointer ${ selectedGuild?.id === guild.id ? "outline outline-2 outline-green-500 bg-green-950" : "" }` }
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
						<div className={ "w-[200px]" }>
							<div className={ "font-bold truncate" }>{ guild.name }</div>
							<div>{ guild.id }</div>
						</div>
					</div>) }
			</div>
			<div className={ "p-5 h-screen overflow-y-auto" }>
				{ selectedGuild ? <>
					<div
						className={ "text-2xl font-bold absolute bg-black p-5 top-0 w-full" }>
						<span className={ "text-green-500" }>{ selectedGuild.name }</span>
						{ selectedChannel ? <>
							<span> { ">" } </span>
							<span className={ "text-orange-500" }>{ selectedChannel.name }</span>
						</> : <></> }
					</div>
					<div className={ "w-[200px] mt-14" }>{
						channels.filter(channel => channel.type === 0).map((channel, index) =>
							<div
								key={ index }
								className={ `m-3 p-2 pl-4 pr-4 hover:bg-orange-800 cursor-pointer ${ selectedChannel?.id === channel.id ? "outline outline-2 outline-orange-500 bg-orange-950" : "" }` }
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
							</div>) }
					</div>
				</> : <></> }
			</div>
			{ selectedChannel ?
				<div className={ "mt-20 mr-14 mb-5 p-5 flex flex-1 flex-col-reverse -z-10" }>
					<div className={ "bg-gray-800 font-bold p-4 pl-4 pr-4 flex flex-row gap-5 items-center z-20" }>
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
									const response = await fetch(`${APIEndPoint}/schedule`, { method: "POST", body: JSON.stringify(schedule) })
									const body = JSON.stringify(await response.json());
									if (!response.ok) {
										setError(body);
										setTimeout(() => setError(undefined), 5000);
										return;
									}
									setSuccess(body);
									setTimeout(() => setSuccess(undefined), 5000);
									const response1 = await fetch(`${ APIEndPoint }/schedules/${user.user_id}/${selectedGuild.id}/${selectedChannel.id}`);
									const body1 = await response1.json();
									if (!response1.ok) {
										setError(JSON.stringify(body1));
										setTimeout(() => setError(undefined), 5000);
										return;
									}
									setSchedules(body1);
								} catch (error) {
									console.log(error);
								}
							} }/> : <></> }
					</div>
					<div className={"flex flex-col justify-end absolute h-screen overflow-y-scroll pt-32 pb-32"}>
					{ schedules && schedules.map(schedule => <div className={"font-bold font-mono p-3 flex items-center"}>
							<div className={"bg-gray-800 p-2 pl-4 pr-4 w-[300px] text-wrap"}>{ schedule.message_content }</div>
							<div className={"bg-gray-600 p-2 pl-4 pr-4"}>{ new Date(Number(schedule.initiate_time)).toLocaleString() }</div>
							<div className={"bg-gray-400 p-2 pl-4 pr-4 text-gray-900"}>{ `Interval: ${schedule.interval} seconds` }</div>
							<div className={"bg-gray-200 p-2 pl-4 pr-4 text-gray-900"}>{ schedule.expired? "Expired": "Not Expired" }</div>
						</div>) }
					</div>
				</div> : <></> }
		</div>
		<div className={ error ? "fixed bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2 font-bold" : "" }>{ error ?? "" }</div>
		<div className={ success ? "fixed bottom-0 left-0 bg-green-500 pl-4 pr-4 p-2 font-bold" : "" }>{ success ?? "" }</div>
	</div>
}
