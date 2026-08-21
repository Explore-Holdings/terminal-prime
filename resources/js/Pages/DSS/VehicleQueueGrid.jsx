import React, { useState } from 'react';
import { CarFront, MapPin, Navigation2, Phone, Fingerprint, Calendar, Building2, HelpCircle, Users } from 'lucide-react';

const LANGUAGE_COLOR_PALETTES = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: '#3b82f6', activeBg: 'bg-blue-600 text-white' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: '#10b981', activeBg: 'bg-emerald-600 text-white' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: '#f59e0b', activeBg: 'bg-amber-600 text-white' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', dot: '#14b8a6', activeBg: 'bg-teal-600 text-white' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: '#a855f7', activeBg: 'bg-purple-600 text-white' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: '#f43f5e', activeBg: 'bg-rose-600 text-white' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: '#6366f1', activeBg: 'bg-indigo-600 text-white' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: '#06b6d4', activeBg: 'bg-cyan-600 text-white' },
    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300', dot: '#8b5cf6', activeBg: 'bg-violet-600 text-white' },
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', dot: '#0284c7', activeBg: 'bg-sky-600 text-white' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300', dot: '#84cc16', activeBg: 'bg-lime-600 text-white' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', dot: '#ec4899', activeBg: 'bg-pink-600 text-white' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: '#f97316', activeBg: 'bg-orange-600 text-white' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300', dot: '#d946ef', activeBg: 'bg-fuchsia-600 text-white' },
];

const getLanguageStyle = (langName) => {
    if (!langName) return LANGUAGE_COLOR_PALETTES[0];
    const str = String(langName).trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % LANGUAGE_COLOR_PALETTES.length;
    return LANGUAGE_COLOR_PALETTES[index];
};

function LanguageBadge({ language, className = '', size = 'md', active = false, count = null }) {
    const style = getLanguageStyle(language);
    const isSmall = size === 'sm';
    
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-medium transition ${
                isSmall ? 'px-1.5 py-0.2 text-[10px]' : 'px-2.5 py-0.5 text-xs'
            } ${
                active ? style.activeBg + ' border-transparent shadow-sm scale-105 font-bold' : `${style.bg} ${style.text} ${style.border}`
            } ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? '#ffffff' : style.dot }} />
            <span>{language}</span>
            {count !== null && (
                <span className={`text-[9px] px-1 rounded-full font-bold ml-0.5 ${active ? 'bg-white/30 text-white' : 'bg-black/10 text-current'}`}>
                    {count}
                </span>
            )}
        </span>
    );
}

function ImageBox({ path, className }) {
    if (!path) {
        return (
            <div className={`${className} rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400`}>
                No Image
            </div>
        );
    }
    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img src={`/storage/${path}`} className={`${className} rounded object-cover border`} alt="" />
        </a>
    );
}

function VehicleSlot({ vehicle, number, onClick, selectedLanguageFilter, selectedVehicleTypeFilter, allVehicleTypes = [], isMovedToNextQueue = false }) {
    if (!vehicle) return null;

    const isOnDuty = vehicle.driver?.duty_status === 'on_duty';
    const hasOngoingTrip = vehicle.driver?.trips && vehicle.driver.trips.length > 0;
    const languages = vehicle.driver?.languages || [];
    const languageNames = languages.map(l => l.language_name).filter(Boolean);

    const matchesLang = selectedLanguageFilter ? (languageNames.includes(selectedLanguageFilter) && isOnDuty) : true;
    const matchesType = selectedVehicleTypeFilter ? (vehicle?.vehicle_type === selectedVehicleTypeFilter && isOnDuty) : true;
    
    const isFilterActive = selectedLanguageFilter || selectedVehicleTypeFilter;
    const matchesFilter = matchesLang && matchesType;
    
    const dimClass = isFilterActive && !matchesFilter ? 'opacity-30 grayscale-[50%]' : '';
    
    let highlightRing = '';
    if (isFilterActive && matchesFilter) {
        if (selectedVehicleTypeFilter) {
            const typeIndex = allVehicleTypes.indexOf(vehicle.vehicle_type);
            const ringColors = ['ring-purple-500 bg-purple-50', 'ring-emerald-500 bg-emerald-50', 'ring-orange-500 bg-orange-50', 'ring-pink-500 bg-pink-50', 'ring-cyan-500 bg-cyan-50', 'ring-rose-500 bg-rose-50', 'ring-indigo-500 bg-indigo-50'];
            const ringColor = typeIndex >= 0 ? ringColors[typeIndex % ringColors.length] : 'ring-blue-500 bg-blue-50';
            highlightRing = `ring-2 ${ringColor} ring-offset-1 scale-105 z-10`;
        } else {
            highlightRing = 'ring-2 ring-blue-500 ring-offset-1 scale-105 z-10 bg-blue-50';
        }
    }

    const languageDots = (
        <div className="flex gap-0.5 items-center justify-center absolute bottom-0.5 inset-x-0">
            {languageNames.slice(0, 4).map((lang, idx) => {
                const style = getLanguageStyle(lang);
                return (
                    <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full border border-white/80 shadow-xs shrink-0"
                        style={{ backgroundColor: style.dot }}
                        title={lang}
                    />
                );
            })}
            {languageNames.length > 4 && (
                <span className="text-[7px] font-bold text-gray-500 leading-none">+</span>
            )}
        </div>
    );

    if (isMovedToNextQueue) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed select-none leading-tight text-center px-0.5 shrink-0 opacity-60 relative ${dimClass} ${highlightRing}`}
                title={`Moved to next queue`}
            >
                <span className="text-[12px] leading-none text-gray-400">{number}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Moved</span>
            </div>
        );
    }

    const sessionId = vehicle.driver?.session_id ?? null;

    if (hasOngoingTrip) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-blue-300 bg-blue-50 text-blue-500 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-blue-100 shrink-0 relative ${dimClass} ${highlightRing}`}
                onClick={() => onClick?.(vehicle)}
                title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})${sessionId ? ` · Session ${sessionId}` : ''}`}
            >
                <span className="text-[12px] leading-none">{number}</span>
                <span className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter mt-0.5">Trip</span>
                {sessionId !== null && sessionId >= 2 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-bold w-3 h-3 rounded-full flex items-center justify-center border border-white shadow-sm z-10">
                        S{sessionId}
                    </span>
                )}
                {languageDots}
            </div>
        );
    }

    if (!isOnDuty) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-red-300 bg-red-50 text-red-400 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-red-100 shrink-0 relative ${dimClass} ${highlightRing}`}
                onClick={() => onClick?.(vehicle)}
                title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})${sessionId ? ` · Session ${sessionId}` : ''}`}
            >
                <span className="text-[12px] leading-none">{number}</span>
                <span className="text-[8px] font-semibold text-red-500 uppercase mt-0.5">Off</span>
                {sessionId !== null && sessionId >= 2 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-bold w-3 h-3 rounded-full flex items-center justify-center border border-white shadow-sm z-10">
                        S{sessionId}
                    </span>
                )}
                {languageDots}
            </div>
        );
    }

    return (
        <div
            className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-1 text-[16px] font-bold border border-green-400 bg-green-50 text-green-700 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-green-100 hover:shadow-md hover:scale-110 shrink-0 relative ${dimClass} ${highlightRing}`}
            onClick={() => onClick?.(vehicle)}
            title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})${sessionId ? ` · Session ${sessionId}` : ''}`}
        >
            <span className="leading-none">{number}</span>
            {sessionId !== null && sessionId >= 2 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-bold w-3 h-3 rounded-full flex items-center justify-center border border-white shadow-sm z-10">
                    S{sessionId}
                </span>
            )}
                {languageDots}
        </div>
    );
}

export default function VehicleQueueGrid({ vehicles, nextInLineVehicle, nextInLineSlotNumber, getVehicleSlotNumber }) {
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const activeSessions = vehicles.map(v => v.driver?.session_id).filter(s => s !== null && s !== undefined && s > 0);
    const baseSessionId = activeSessions.length > 0 ? Math.min(...activeSessions) : 1;
    
    return (
        <section className="bg-white shadow p-5 mb-6 overflow-visible w-full border-2 border-slate-700 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
                <CarFront className="text-green-700" size={22} />
                <h2 className="text-lg font-bold text-gray-800">
                    Vehicles Checked In ({vehicles.filter(v => v.driver?.duty_status === 'on_duty').length} On Duty / {vehicles.length} Registered)
                </h2>
            </div>
            
            <div className="flex gap-4 items-center flex-col w-full">
                {/* Left Side: Next In Line Square Card */}
                <div className="flex flex-col gap-2 shrink-0">
                    <div 
                        className="w-[180px] h-[180px] border border-emerald-200 rounded-xl bg-emerald-50/50 flex flex-col items-center justify-between p-4 shadow-sm relative overflow-hidden cursor-pointer hover:bg-emerald-100/60 transition"
                        onClick={() => nextInLineVehicle && setSelectedVehicle({ ...nextInLineVehicle, _slotNumber: nextInLineSlotNumber })}
                    >
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                            Next
                        </div>
                        
                        <div className="text-center w-full mt-2">
                            <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                                Next In Line
                            </span>
                            <div className="h-[1px] w-8 bg-emerald-200 mx-auto"></div>
                        </div>

                        {nextInLineVehicle ? (
                            <>
                                <div className="text-5xl font-black text-emerald-700 my-1.5">
                                    {nextInLineSlotNumber ?? '-'}
                                </div>
                                <div className="text-center w-full min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate px-1">
                                        {nextInLineVehicle.driver?.first_name ?? 'Driver'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium truncate">
                                        {nextInLineVehicle.registration_number ?? '-'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <span className="text-3xl text-gray-300">--</span>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium text-center leading-tight">
                                    No on-duty vehicle queue
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Side: Vehicle Grid */}
                <div className="flex-1 w-full overflow-x-auto">
                    <div className="max-h-[420px] overflow-y-auto pb-4 pr-2 space-y-4">
                        {(() => {
                            const vehicleMap = {};
                            const sessionQueues = {};

                            vehicles.forEach((v) => {
                                const reg = v.driver?.registration_number ?? '';
                                const match = reg.match(/\d+/);
                                const num = match ? parseInt(match[0], 10) : NaN;
                                if (!isNaN(num) && num >= 1 && num <= 95) {
                                    vehicleMap[num] = v;
                                }

                                const sid = v.driver?.session_id ?? null;
                                if (sid !== null && sid > baseSessionId) {
                                    if (!sessionQueues[sid]) sessionQueues[sid] = [];
                                    sessionQueues[sid].push({ vehicle: v, originalSlot: num });
                                }
                            });

                            const sessionKeys = Object.keys(sessionQueues).map(Number).sort((a, b) => a - b);

                            return (
                                <>
                                    {/* Main 1-95 Grid */}
                                    <div className="flex flex-wrap gap-1.5 w-full">
                                        {Array.from({ length: 95 }, (_, i) => {
                                            const slotNum = i + 1;
                                            const vehicle = vehicleMap[slotNum] ?? null;
                                            if (!vehicle) return null;
                                            const isMoved = vehicle?.driver?.session_id > baseSessionId;
                                            
                                            return (
                                                <VehicleSlot
                                                    key={`main-slot-${slotNum}`}
                                                    vehicle={vehicle}
                                                    number={slotNum}
                                                    isMovedToNextQueue={isMoved}
                                                    onClick={(v) => !isMoved && setSelectedVehicle(v ? { ...v, _slotNumber: slotNum } : null)}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Next Sessions Rows */}
                                    {sessionKeys.length > 0 && (
                                        <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                                            {sessionKeys.map((sid) => (
                                                <div key={`session-row-${sid}`} className="bg-amber-50/50 border border-amber-200 rounded-lg p-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                            Session {sid} Queue
                                                        </span>
                                                        <span className="text-[10px] text-amber-700 font-medium">
                                                            {sessionQueues[sid].length} driver{sessionQueues[sid].length !== 1 ? 's' : ''} re-queued
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {sessionQueues[sid].map((item) => (
                                                            <VehicleSlot
                                                                key={`session-${sid}-slot-${item.originalSlot}`}
                                                                vehicle={item.vehicle}
                                                                number={item.originalSlot}
                                                                onClick={(v) => setSelectedVehicle(v ? { ...v, _slotNumber: item.originalSlot } : null)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Right Side: Vehicle Details Side Panel */}
                <div className="w-full shrink-0 border border-gray-200 rounded-xl bg-gray-50 flex flex-col shadow-sm overflow-hidden mt-2">
                    {selectedVehicle ? (
                        <div className="flex flex-col">
                            <div className="relative h-[180px] w-full bg-gray-200 shrink-0 overflow-hidden">
                                {/* Gradient for text readability */}
                                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
                                
                                <div className="absolute top-2 left-2 bg-blue-700 text-white font-black text-xs px-2 py-1 rounded shadow-md z-20 flex items-center">
                                    <span className="opacity-75 font-normal mr-1 tracking-tighter">SLOT</span>
                                    {selectedVehicle._slotNumber}
                                </div>
                                
                                <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 items-end">
                                    {selectedVehicle.driver?.languages?.slice(0, 3).map((l) => (
                                        <LanguageBadge key={l.id || l.language_name} language={l.language_name} size="sm" className="shadow-sm backdrop-blur-sm bg-white/90" />
                                    ))}
                                </div>
                                
                                <div className="absolute bottom-2 left-2 right-2 flex gap-2 z-20">
                                    <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 backdrop-blur-md shadow-sm border border-white/20">
                                        <CarFront size={12} className="text-blue-300" />
                                        <span className="font-bold tracking-wider">{selectedVehicle.vehicle_type ?? '-'}</span>
                                    </div>
                                    <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 backdrop-blur-md shadow-sm border border-white/20">
                                        <Users size={12} className="text-emerald-300" />
                                        <span className="font-bold tracking-wider">{selectedVehicle.seating_capacity ?? '-'} / {selectedVehicle.luggage_capacity ?? '-'}</span>
                                    </div>
                                </div>

                                <ImageBox path={selectedVehicle.pictures?.front_view ?? selectedVehicle.front_view} className="w-full h-full object-cover" />
                            </div>

                            <div className="p-3 bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 leading-tight">
                                            {(selectedVehicle.driver?.first_name ?? '') + ' ' + (selectedVehicle.driver?.last_name ?? '') || 'Driver'}
                                        </h3>
                                        <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                                            <Phone size={10} className="opacity-60" />
                                            {selectedVehicle.driver?.mobile_number ?? '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded whitespace-nowrap">
                                            {selectedVehicle.registration_number ?? '-'}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold truncate max-w-[90px] ml-auto">
                                            {selectedVehicle.brand ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[160px] p-4 text-center text-gray-400 bg-white">
                            <CarFront size={32} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium text-gray-500">No Vehicle Selected</p>
                            <p className="text-[11px] mt-1">Click a slot to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
