import { Tournament, GameType, TournamentDetails, TournamentTeam, PlayerProfile, TournamentTeamPlayer } from '../../models';

// Define filters for Tournament
export const tournamentFields: Partial<Record<keyof Tournament, boolean>> = {
  id: true,
  tournamentType: true,
  platform: true,
  entryFeeAmount: true,
  entryFeeType: true,
  tournamentFormat: true,
  gameId: true,
};

// Define filters for GameType
export const gameFields: Partial<Record<keyof GameType, boolean>> = {
  name: true,
  description: true,
  base_game: true,
  handicap_type: true,
  bull_type: true,
  out_type: true,
};

// Define filters for TournamentDetails
export const tournamentDetailsFields: Partial<Record<keyof TournamentDetails, boolean>> = {
  tournamentName: true,
  tournamentDescription: true,
  scheduledStart: true,
  maxPlayers: true,
  tournamentStatus: true,
  currentRound: true,
  winningTeamId: true,
  createdBy: true,
};

// Define filters for TournamentTeam
export const tournamentTeamFields: Partial<Record<keyof TournamentTeam, boolean>> = {
    id: true,
    tournamentId: true,
    name: true,
  };
  
  // Define filters for Player
  export const playerFields: Partial<Record<keyof TournamentTeamPlayer, boolean>> = {
    tournamentTeamId: true,
    profileId: true,
    isCaptain: true,
    status: true,
    role: true,
  };

// Define filters for PlayerProfile
export const profileFields: Partial<Record<keyof PlayerProfile, boolean>> = {
  username: true,
};
