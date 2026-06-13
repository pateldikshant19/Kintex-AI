import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [selectedLeagueId, setSelectedLeagueId] = useState(null);
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    useEffect(() => {
        const storedLeague = localStorage.getItem('selectedLeagueId');
        const storedTeam = localStorage.getItem('selectedTeamId');
        if (storedLeague) setSelectedLeagueId(storedLeague);
        if (storedTeam) setSelectedTeamId(storedTeam);
    }, []);

    const setSession = (leagueId, teamId) => {
        setSelectedLeagueId(leagueId);
        setSelectedTeamId(teamId);
        if (leagueId) localStorage.setItem('selectedLeagueId', leagueId);
        else localStorage.removeItem('selectedLeagueId');
        
        if (teamId) localStorage.setItem('selectedTeamId', teamId);
        else localStorage.removeItem('selectedTeamId');
    };

    const clearSession = () => {
        setSelectedLeagueId(null);
        setSelectedTeamId(null);
        localStorage.removeItem('selectedLeagueId');
        localStorage.removeItem('selectedTeamId');
    };

    return (
        <SessionContext.Provider value={{ selectedLeagueId, selectedTeamId, setSession, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
